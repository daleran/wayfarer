import { Projectile } from '@/entities/projectile.js';
import { Ship } from '@/entities/ship.js';
import { RocketExplosion } from '@/entities/rocketExplosion.js';
import { REPUTATION } from '@data/compiledData.js';

export class CollisionSystem {
  constructor() {}

  update(entities, player, { particlePool, hud, repair, reputation, onEnemyKilled, onEnemyCrippled }) {
    const newEntities = [];

    // --- Interception pass: canIntercept projectiles vs isInterceptable projectiles ---
    const interceptors = [];
    const interceptables = [];
    for (const e of entities) {
      if (!(e instanceof Projectile) || !e.active) continue;
      if (e.canIntercept) interceptors.push(e);
      if (e.isInterceptable) interceptables.push(e);
    }
    for (const inter of interceptors) {
      const ib = inter.getBounds();
      for (const tgt of interceptables) {
        if (!tgt.active) continue;
        if (inter.owner?.faction === tgt.owner?.faction) continue;
        const tb = tgt.getBounds();
        const dx = ib.x - tb.x;
        const dy = ib.y - tb.y;
        if (dx * dx + dy * dy < 144) { // (6+6)^2
          inter.active = false;
          tgt.active = false;
          tgt.shouldDetonate = false;
          particlePool.explosion(tgt.x, tgt.y, 3);
          break;
        }
      }
    }

    // --- Beam interception pass: canInterceptBeam lances vs isInterceptable projectiles ---
    for (const ship of entities) {
      if (!(ship instanceof Ship) || !ship.active) continue;
      for (const w of ship.weapons) {
        if (!w.canInterceptBeam || !w._isFiring) continue;
        const ox = w._beamOriginX, oy = w._beamOriginY;
        const ex = w._beamEndX, ey = w._beamEndY;
        const blen2 = (ex - ox) ** 2 + (ey - oy) ** 2;
        if (blen2 === 0) continue;
        for (const e of entities) {
          if (!(e instanceof Projectile) || !e.active || !e.isInterceptable) continue;
          if (e.owner?.faction === ship.faction) continue;
          const t = Math.max(0, Math.min(1, ((e.x - ox) * (ex - ox) + (e.y - oy) * (ey - oy)) / blen2));
          const dx = e.x - (ox + t * (ex - ox));
          const dy = e.y - (oy + t * (ey - oy));
          if (dx * dx + dy * dy < 225) { // 15px radius
            e.active = false;
            particlePool.explosion(e.x, e.y, 3);
          }
        }
      }
    }

    // --- Main collision pass ---
    const onKill = (target) => onEnemyKilled(target);
    const checkCripple = (target) => {
      if (target._justCrippled) {
        target._justCrippled = false;
        if (onEnemyCrippled) onEnemyCrippled(target);
      }
    };

    for (const entity of entities) {
      if (!(entity instanceof Projectile)) continue;

      // AoE expiry detonation
      if ((entity.isRocket || entity.detonatesOnExpiry) && entity.shouldDetonate && !entity.active) {
        const tx = entity.rocketTargetX ?? entity.x;
        const ty = entity.rocketTargetY ?? entity.y;
        const radius = entity.blastRadius || 280;
        this._aoeExplode(tx, ty, entity.damage, entity.hullDamage ?? 0, radius, entities, player, { particlePool, hud, repair, reputation, onEnemyKilled, onEnemyCrippled });
        particlePool.explosion(tx, ty, entity.isRocket ? 20 : 12);
        if (entity.isRocket) newEntities.push(new RocketExplosion(tx, ty, radius));
        entity.shouldDetonate = false;
        continue;
      }

      if (!entity.active) continue;
      const proj = entity;
      const pb = proj.getBounds();

      for (const target of entities) {
        if (!target.active || !(target instanceof Ship)) continue;
        if (target.isDerelict) continue;
        if (proj.owner === target) continue;
        if (proj.owner?.faction && target.faction && proj.owner.faction === target.faction) continue;

        const sb = target.getBounds();
        const dx = pb.x - sb.x;
        const dy = pb.y - sb.y;
        if (Math.sqrt(dx * dx + dy * dy) < pb.radius + sb.radius) {
          // Attacking a neutral ship
          if (proj.owner === player && target.relation === 'neutral' && !proj._neutralPenaltyApplied) {
            proj._neutralPenaltyApplied = true;
            reputation.change('settlements', REPUTATION.ATTACK_NEUTRAL_PENALTY);
            target.relation = 'hostile';
            target.ai._aggro = true;
          }
          if (proj.isRocket || proj.detonatesOnContact) {
            proj.active = false;
            const radius = proj.blastRadius || 280;
            this._aoeExplode(proj.x, proj.y, proj.damage, proj.hullDamage ?? 0, radius, entities, player, { particlePool, hud, repair, reputation, onEnemyKilled, onEnemyCrippled });
            particlePool.explosion(proj.x, proj.y, 20);
            if (proj.isRocket) newEntities.push(new RocketExplosion(proj.x, proj.y, radius));
          } else if (proj.isPlasma) {
            const falloff = Math.max(0, 1 - proj.distanceTravelled / proj.maxRange);
            const armorDmg = proj.damage * falloff;
            const hullDmg = (proj.hullDamage ?? proj.damage) * (0.3 + falloff * 0.7);
            const hullBefore = target.hullCurrent;
            target.takeDamage(armorDmg, hullDmg, proj.x, proj.y);
            if (target === player && target.hullCurrent < hullBefore) {
              const breach = repair.maybeBreachModule(target, target._lastHitArc);
              if (breach) hud.addPickupText(breach.text, target.x, target.y, breach.colorHint);
            }
            proj.active = false;
            particlePool.explosion(proj.x, proj.y, 5);
            checkCripple(target);
            if (target.isDestroyed && target !== player && target.relation === 'hostile') {
              onKill(target);
            }
          } else {
            const hullBefore = target.hullCurrent;
            target.takeDamage(proj.damage, proj.hullDamage, proj.x, proj.y);
            if (target === player && target.hullCurrent < hullBefore) {
              const breach = repair.maybeBreachModule(target, target._lastHitArc);
              if (breach) hud.addPickupText(breach.text, target.x, target.y, breach.colorHint);
            }
            proj.active = false;
            particlePool.explosion(proj.x, proj.y, 5);
            checkCripple(target);
            if (target.isDestroyed && target !== player && target.relation === 'hostile') {
              onKill(target);
            }
          }
          break;
        }
      }
    }

    return { newEntities };
  }

  _aoeExplode(x, y, damage, hullDamage, blastRadius, entities, player, { particlePool: _particlePool, hud, repair, reputation: _reputation, onEnemyKilled, onEnemyCrippled }) {
    for (const entity of entities) {
      if (!entity.active || !(entity instanceof Ship)) continue;
      if (entity.isDerelict) continue;
      const sb = entity.getBounds();
      const dx = sb.x - x;
      const dy = sb.y - y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < blastRadius + sb.radius) {
        const falloff = 1 - (dist / (blastRadius + sb.radius)) * 0.7;
        const hullBefore = entity.hullCurrent;
        entity.takeDamage(damage * falloff, (hullDamage || 0) * falloff, x, y);
        if (entity === player && entity.hullCurrent < hullBefore) {
          const breach = repair.maybeBreachModule(entity, entity._lastHitArc);
          if (breach) hud.addPickupText(breach.text, entity.x, entity.y, breach.colorHint);
        }
        if (entity._justCrippled) {
          entity._justCrippled = false;
          if (onEnemyCrippled) onEnemyCrippled(entity);
        }
        if (entity.isDestroyed && entity !== player && entity.relation !== 'neutral') {
          onEnemyKilled(entity);
        }
      }
    }
  }

}
