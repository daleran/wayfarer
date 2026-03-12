// =============================================================================
// WAYFARER — Unified Ship AI
//
// Single entry point for all non-player ship AI. Dispatches based on
// ship.relation and ship.ai.passiveBehavior / ship.ai.combatBehavior.
//
// All tuning params are read from ship.ai — a flat object spread from an
// AI_TEMPLATES entry at construction time. Characters can override individual
// values (e.g. aggroRange, fleeHullRatio) without touching the template.
//
// Relation transitions are handled externally (e.g. in game._runCollisions):
//   ship.relation = 'hostile';
//   ship.ai._aggro = true;
// After that, this function takes over combat behavior automatically.
// =============================================================================

import { angleDiff } from '../utils/math.js';
import { BASE_PROJECTILE_SPEED, PROJECTILE_SPEED_FACTOR } from '../data/tuning/weaponTuning.js';

export function updateShipAI(ship, player, entities, dt) {
  const ai = ship.ai;
  if (!ai) return;

  if (ship.relation === 'hostile') {
    _doHostile(ship, player, entities, dt, ai);
  } else {
    _doPassive(ship, dt, ai);
  }
}

// ── Hostile path ──────────────────────────────────────────────────────────────

function _doHostile(ship, player, entities, dt, ai) {
  if (ai.combatBehavior === 'lurker') {
    _doLurker(ship, player, entities, dt, ai);
    return;
  }

  if (ai.combatBehavior === 'flee') {
    ship.aiStatus = 'flee';
    _doFlee(ship, player);
    return;
  }

  const dx = player.x - ship.x;
  const dy = player.y - ship.y;
  const dist = Math.sqrt(dx * dx + dy * dy);

  if (ship.ai._aggro === undefined) ship.ai._aggro = false;

  if (!ship.ai._aggro && dist < ai.aggroRange) {
    ship.ai._aggro = true;
  } else if (ship.ai._aggro && dist > ai.deaggroRange) {
    ship.ai._aggro = false;
  }

  if (!ship.ai._aggro) {
    ship.aiStatus = 'patrol';
    _patrol(ship, dt, ai);
    return;
  }

  if (ship.hullCurrent / ship.hullMax < ai.fleeHullRatio) {
    ship.aiStatus = 'flee';
    _doFlee(ship, player);
    return;
  }

  ship.aiStatus = 'aggro';
  switch (ai.combatBehavior) {
    case 'kiter':    _doKiter(ship, player, entities, dist, ai);    break;
    case 'stalker':  _doStalker(ship, player, entities, dist, ai);  break;
    case 'standoff': _doStandoff(ship, player, entities, dist, ai); break;
    default:         _doShielding(ship, player, entities, dist, ai); break;
  }
}

// ── Passive path ──────────────────────────────────────────────────────────────

function _doPassive(ship, dt, ai) {
  switch (ai.passiveBehavior) {
    case 'trader':  _doTrader(ship, dt, ai);  break;
    case 'militia': _doMilitia(ship, dt, ai); break;
    default: ship.throttleLevel = 0; break;
  }
}

// ── Combat behaviors ──────────────────────────────────────────────────────────

function _doFlee(ship, player) {
  const dx = player.x - ship.x;
  const dy = player.y - ship.y;
  const fleeAngle = Math.atan2(-dx, dy);
  const diff = angleDiff(ship.rotation, fleeAngle);
  ship.rotationInput = Math.sign(diff);
  ship.throttleLevel = 5;
}

function _getBestArc(ship) {
  let bestArc = 'front';
  let bestVal = -1;
  for (const [key, val] of Object.entries(ship.armorArcs)) {
    if (val > bestVal) { bestVal = val; bestArc = key; }
  }
  return bestArc;
}

function _doShielding(ship, player, entities, dist, ai) {
  const dx = player.x - ship.x;
  const dy = player.y - ship.y;
  const angleToPlayer = Math.atan2(dx, -dy);

  const bestArc = _getBestArc(ship);
  const orbitOffset = (bestArc === 'starboard') ? -Math.PI / 2 : Math.PI / 2;

  const orbitAngle = angleToPlayer + orbitOffset;
  const orbitX = player.x + Math.sin(orbitAngle) * ai.orbitRadius;
  const orbitY = player.y - Math.cos(orbitAngle) * ai.orbitRadius;

  const odx = orbitX - ship.x;
  const ody = orbitY - ship.y;
  const orbitDist = Math.sqrt(odx * odx + ody * ody);

  const targetAngle = Math.atan2(odx, -ody);
  const diff = angleDiff(ship.rotation, targetAngle);
  ship.rotationInput = Math.sign(diff);
  ship.throttleLevel = orbitDist > ai.orbitHoldThreshold ? 4 : 2;

  if (dist < ai.fireRange) _doLeadFire(ship, player, entities, dist);
}

function _doKiter(ship, player, entities, dist, ai) {
  const dx = player.x - ship.x;
  const dy = player.y - ship.y;

  if (dist < ai.kiteRange) {
    ship.aiStatus = 'kite-back';
    const fleeAngle = Math.atan2(-dx, dy);
    const diff = angleDiff(ship.rotation, fleeAngle);
    ship.rotationInput = Math.sign(diff);
    ship.throttleLevel = 4;
  } else {
    ship.aiStatus = 'kite-orbit';
    const angleToPlayer = Math.atan2(dx, -dy);
    const orbitAngle = angleToPlayer + Math.PI / 2;
    const orbitX = player.x + Math.sin(orbitAngle) * ai.kiteRange;
    const orbitY = player.y - Math.cos(orbitAngle) * ai.kiteRange;
    const odx = orbitX - ship.x;
    const ody = orbitY - ship.y;
    const targetAngle = Math.atan2(odx, -ody);
    const diff = angleDiff(ship.rotation, targetAngle);
    ship.rotationInput = Math.sign(diff);
    ship.throttleLevel = 2;
  }

  if (dist < ai.fireRange) _doLeadFire(ship, player, entities, dist);
}

function _doStalker(ship, player, entities, dist, ai) {
  const aftDist = ai.aftDistance ?? 300;
  const aftX = player.x - Math.sin(player.rotation) * aftDist;
  const aftY = player.y + Math.cos(player.rotation) * aftDist;

  const odx = aftX - ship.x;
  const ody = aftY - ship.y;
  const toAftDist = Math.sqrt(odx * odx + ody * ody);
  const targetAngle = Math.atan2(odx, -ody);
  const diff = angleDiff(ship.rotation, targetAngle);

  ship.rotationInput = Math.sign(diff);
  ship.throttleLevel = toAftDist > ai.orbitHoldThreshold ? 5 : 3;

  const angleToPlayer = Math.atan2(player.x - ship.x, -(player.y - ship.y));
  const aimDiff = Math.abs(angleDiff(ship.rotation, angleToPlayer));
  if (aimDiff < ai.aimTolerance && dist < ai.fireRange) {
    ship.fireWeapons(player.x, player.y, entities);
  }
}

function _doStandoff(ship, player, entities, dist, ai) {
  const dx = player.x - ship.x;
  const dy = player.y - ship.y;

  if (dist < ai.standoffRange - 100) {
    ship.aiStatus = 'standoff-back';
    const fleeAngle = Math.atan2(-dx, dy);
    const diff = angleDiff(ship.rotation, fleeAngle);
    ship.rotationInput = Math.sign(diff);
    ship.throttleLevel = 4;
  } else {
    ship.aiStatus = 'standoff-hold';
    const angleToPlayer = Math.atan2(dx, -dy);
    const diff = angleDiff(ship.rotation, angleToPlayer);
    ship.rotationInput = Math.sign(diff);
    ship.throttleLevel = dist > ai.standoffRange + 100 ? 3 : 1;
  }

  if (dist < ai.standoffFireRange) {
    const result = _doLeadFire(ship, player, entities, dist);
    ship.fireSecondary(result.leadX, result.leadY, entities);
  }
}

function _doLeadFire(ship, target, entities, dist) {
  const weapon = ship.weapons[0];
  const projSpeed = weapon?.projectileSpeed ?? (BASE_PROJECTILE_SPEED * PROJECTILE_SPEED_FACTOR);
  const travelTime = dist / projSpeed;
  const pvx = Math.sin(target.rotation) * target.speed;
  const pvy = -Math.cos(target.rotation) * target.speed;
  const leadX = target.x + pvx * travelTime;
  const leadY = target.y + pvy * travelTime;
  const maxRange = weapon?.maxRange ?? Infinity;
  if (dist <= maxRange) ship.fireWeapons(leadX, leadY, entities);
  return { leadX, leadY };
}

function _patrol(ship, dt, ai) {
  const home = ship.homePosition;
  if (!home) { ship.throttleLevel = 0; return; }

  if (ship.ai._patrolAngle === undefined) ship.ai._patrolAngle = Math.random() * Math.PI * 2;
  ship.ai._patrolAngle += dt * 0.3;

  const r = ai.patrolRadius ?? 300;
  const targetX = home.x + Math.sin(ship.ai._patrolAngle) * r;
  const targetY = home.y - Math.cos(ship.ai._patrolAngle) * r;

  const pdx = targetX - ship.x;
  const pdy = targetY - ship.y;
  const patrolDist = Math.sqrt(pdx * pdx + pdy * pdy);

  const targetAngle = Math.atan2(pdx, -pdy);
  const diff = angleDiff(ship.rotation, targetAngle);
  ship.rotationInput = Math.sign(diff);
  ship.throttleLevel = patrolDist > 60 ? 3 : 2;
}

// ── Passive behaviors ─────────────────────────────────────────────────────────

function _doTrader(ship, dt, ai) {
  if (!ship.ai._tradeRouteA || !ship.ai._tradeRouteB) { ship.throttleLevel = 0; return; }

  if (ship.ai._neutralState === undefined) {
    ship.ai._neutralState  = 'traveling';
    ship.ai._neutralTarget = { ...ship.ai._tradeRouteB };
    ship.ai._neutralWaitTimer = 0;
  }

  if (ship.ai._neutralState === 'waiting') {
    ship.throttleLevel = 0;
    ship.rotationInput = 0;
    ship.ai._neutralWaitTimer -= dt;
    if (ship.ai._neutralWaitTimer <= 0) {
      const tmp = ship.ai._tradeRouteA;
      ship.ai._tradeRouteA = ship.ai._tradeRouteB;
      ship.ai._tradeRouteB = tmp;
      ship.ai._neutralTarget = { ...ship.ai._tradeRouteB };
      ship.ai._neutralState  = 'traveling';
    }
    return;
  }

  const dx = ship.ai._neutralTarget.x - ship.x;
  const dy = ship.ai._neutralTarget.y - ship.y;
  const dist = Math.sqrt(dx * dx + dy * dy);

  const targetAngle = Math.atan2(dx, -dy);
  const diff = angleDiff(ship.rotation, targetAngle);
  ship.rotationInput = Math.sign(diff);

  if (dist < (ai.arriveRadius ?? 120)) {
    ship.throttleLevel = 0;
    ship.ai._neutralState = 'waiting';
    const waitMin = ai.waitMin ?? 5;
    const waitMax = ai.waitMax ?? 8;
    ship.ai._neutralWaitTimer = waitMin + Math.random() * (waitMax - waitMin);
  } else if (dist < (ai.slowRadius ?? 400)) {
    ship.throttleLevel = ai.approachThrottle ?? 1;
  } else {
    ship.throttleLevel = ai.travelThrottle ?? 3;
  }
}

function _doMilitia(ship, dt, ai) {
  if (!ship.ai._orbitCenter) { ship.throttleLevel = 0; return; }
  if (ship.ai._orbitAngle === undefined) ship.ai._orbitAngle = 0;
  ship.ai._orbitAngle += ship.ai._orbitSpeed * dt;

  const cx = ship.ai._orbitCenter.x;
  const cy = ship.ai._orbitCenter.y;
  const targetX = cx + Math.sin(ship.ai._orbitAngle) * ship.ai._orbitRadius;
  const targetY = cy - Math.cos(ship.ai._orbitAngle) * ship.ai._orbitRadius;

  const dx = targetX - ship.x;
  const dy = targetY - ship.y;
  const dist = Math.sqrt(dx * dx + dy * dy);

  const targetAngle = Math.atan2(dx, -dy);
  const diff = angleDiff(ship.rotation, targetAngle);
  ship.rotationInput = Math.sign(diff);
  ship.throttleLevel = dist > 100 ? 3 : 2;
}

// ── Lurker ────────────────────────────────────────────────────────────────────

function _doLurker(ship, player, entities, dt, ai) {
  if (ship.ai._lurkerState === undefined) ship.ai._lurkerState = 'hiding';
  ship.aiStatus = `lurk-${ship.ai._lurkerState}`;

  const dxP = player.x - ship.x;
  const dyP = player.y - ship.y;
  const distToPlayer = Math.sqrt(dxP * dxP + dyP * dyP);

  if (ship.ai._lurkerState === 'hiding') {
    const cover = ship.ai._coverPoint;
    if (!cover) { ship.throttleLevel = 0; return; }

    const cdx = cover.x - ship.x;
    const cdy = cover.y - ship.y;
    const coverDist = Math.sqrt(cdx * cdx + cdy * cdy);

    const targetAngle = Math.atan2(cdx, -cdy);
    const diff = angleDiff(ship.rotation, targetAngle);
    ship.rotationInput = Math.sign(diff);
    ship.throttleLevel = coverDist > (ai.lurkerHideRadius ?? 150) ? 3 : 1;

    if (coverDist < (ai.lurkerHideRadius ?? 150)) {
      for (const e of entities) {
        if (!e.active) continue;
        if (e.relation !== 'neutral') continue;
        if (e.ai?.passiveBehavior !== 'trader') continue;
        const edx = e.x - ship.x;
        const edy = e.y - ship.y;
        const eDist = Math.sqrt(edx * edx + edy * edy);
        if (eDist < (ai.lurkerScanRange ?? 700)) {
          ship.ai._lurkerTarget = e;
          ship.ai._lurkerState  = 'pouncing';
          break;
        }
      }
    }
    return;
  }

  if (ship.ai._lurkerState === 'pouncing') {
    if (ship.hullCurrent / ship.hullMax < (ai.fleeHullRatio ?? 0.3)) {
      ship.ai._lurkerState = 'fleeing';
      return;
    }

    if (distToPlayer < (ai.aggroRange ?? 1400)) {
      const tgt = ship.ai._lurkerTarget;
      if (!tgt || !tgt.active) {
        ship.ai._lurkerTarget = player;
      } else {
        const tdx = tgt.x - ship.x;
        const tdy = tgt.y - ship.y;
        const distToTarget = Math.sqrt(tdx * tdx + tdy * tdy);
        if (distToPlayer < distToTarget) ship.ai._lurkerTarget = player;
      }
    }

    const tgt = ship.ai._lurkerTarget;
    if (!tgt || !tgt.active) {
      ship.ai._lurkerTarget = null;
      ship.ai._lurkerState  = 'hiding';
      return;
    }

    const tdx = tgt.x - ship.x;
    const tdy = tgt.y - ship.y;
    const distToTarget = Math.sqrt(tdx * tdx + tdy * tdy);

    if (distToTarget > (ai.deaggroRange ?? 2000)) {
      ship.ai._lurkerTarget = null;
      ship.ai._lurkerState  = 'hiding';
      return;
    }

    const angleToTarget = Math.atan2(tdx, -tdy);
    const diff = angleDiff(ship.rotation, angleToTarget);
    ship.rotationInput = Math.sign(diff);
    ship.throttleLevel = 5;

    if (distToTarget < (ai.standoffFireRange ?? 1400)) {
      const result = _doLeadFire(ship, tgt, entities, distToTarget);
      ship.fireSecondary(result.leadX, result.leadY, entities);
    }
    return;
  }

  if (ship.ai._lurkerState === 'fleeing') {
    const tgt = ship.ai._lurkerTarget;
    let fleeAngle;
    if (tgt && tgt.active) {
      const fdx = tgt.x - ship.x;
      const fdy = tgt.y - ship.y;
      fleeAngle = Math.atan2(-fdx, fdy);
    } else {
      fleeAngle = Math.atan2(-dxP, dyP);
    }
    const diff = angleDiff(ship.rotation, fleeAngle);
    ship.rotationInput = Math.sign(diff);
    ship.throttleLevel = 5;
  }
}
