import { ENTITY } from '@data/enums.js';
import { AMMO } from '@data/index.js';

export class WeaponSystem {
  constructor() {}

  updateReloads(dt, player, ammo) {
    if (!player) return;
    for (const w of player.weapons) {
      if (!(w._reloadTimer > 0)) continue;
      w._reloadTimer -= dt;
      if (w._reloadTimer <= 0) {
        w._reloadTimer = 0;
        if (w.currentAmmoId && w.magSize !== undefined) {
          const available = ammo[w.currentAmmoId] ?? 0;
          if (available > 0) {
            const needed = w.magSize - w.ammo;
            const take = Math.min(needed, available);
            w.ammo += take;
            ammo[w.currentAmmoId] -= take;
          }
        }
      }
    }
  }

  manualReload(player, ammo) {
    if (!player) return;
    for (const w of player.weapons) {
      if (!w.currentAmmoId || w.magSize === undefined) continue;
      if (w._reloadTimer > 0) continue;
      if (w.ammo >= w.magSize) continue;
      if ((ammo[w.currentAmmoId] ?? 0) <= 0) continue;
      w._reloadTimer = w.reloadTime;
    }
  }

  /** Cycle to the next accepted ammo type. Dumps magazine back, starts reload. */
  cycleAmmo(weapon, ammo, hud, player) {
    const types = weapon.acceptedAmmoTypes;
    if (!types || types.length < 2) return;
    const idx = types.indexOf(weapon.currentAmmoId);
    const next = types[(idx + 1) % types.length];
    // Dump current magazine back to cargo
    ammo[weapon.currentAmmoId] = (ammo[weapon.currentAmmoId] ?? 0) + weapon.ammo;
    weapon.ammo = 0;
    weapon.currentAmmoId = next;
    weapon._reloadTimer = weapon.reloadTime;
    const tag = AMMO[next]?.tag || next.toUpperCase();
    hud.addPickupText('\u2192 ' + tag, player.x, player.y, null);
  }

  updateGuidance(entities, ships, mouseWorld) {
    const enemies = ships.filter(s => s.active && s.relation === 'hostile');
    for (const entity of entities) {
      if (entity.entityType !== ENTITY.PROJECTILE || !entity.active || !entity.isGuided) continue;
      if (entity.guidedType === 'wire') {
        if (mouseWorld) {
          entity.guidanceTargetX = mouseWorld.x;
          entity.guidanceTargetY = mouseWorld.y;
        }
      } else if (entity.guidedType === 'heat') {
        let nearest = null;
        let nearestDist = Infinity;
        for (const e of enemies) {
          const dx = e.x - entity.x;
          const dy = e.y - entity.y;
          const d = dx * dx + dy * dy;
          if (d < nearestDist) { nearestDist = d; nearest = e; }
        }
        if (nearest) {
          entity.guidanceTargetX = nearest.x;
          entity.guidanceTargetY = nearest.y;
        }
      }
    }
  }
}
