import { angleDiff } from '../utils/math.js';
import { RAIDER_AI, BASE_PROJECTILE_SPEED, PROJECTILE_SPEED_FACTOR } from '../data/stats.js';

const { AGGRO_RANGE, DEAGGRO_RANGE, FIRE_RANGE, ORBIT_RADIUS,
        KITE_RANGE, PATROL_RADIUS, FLEE_HULL_RATIO,
        STANDOFF_RANGE, STANDOFF_FIRE_RANGE,
        LURKER_SCAN_RANGE, LURKER_HIDE_RADIUS,
        STALKER_AFT_DISTANCE, INTERCEPTOR_AFT_DISTANCE,
        ORBIT_HOLD_THRESHOLD, AIM_TOLERANCE } = RAIDER_AI;

// Arc offset from ship forward to present that arc toward a target
const ARC_OFFSETS = {
  front:     0,
  aft:       Math.PI,
  port:     -Math.PI / 2,
  starboard: Math.PI / 2,
};

export function updateRaiderAI(raider, player, entities, dt) {
  // Lurker AI has its own entry point — skip standard aggro/patrol logic
  if (raider.behaviorType === 'lurker') {
    _doLurker(raider, player, entities, dt);
    return;
  }

  const dx = player.x - raider.x;
  const dy = player.y - raider.y;
  const dist = Math.sqrt(dx * dx + dy * dy);

  if (raider._aggro === undefined) raider._aggro = false;

  if (!raider._aggro && dist < AGGRO_RANGE) {
    raider._aggro = true;
  } else if (raider._aggro && dist > DEAGGRO_RANGE) {
    raider._aggro = false;
  }

  if (!raider._aggro) {
    raider.aiState = 'patrol';
    _patrol(raider, dt);
    return;
  }

  // Flee at low hull regardless of behavior type
  if (raider.hullCurrent / raider.hullMax < FLEE_HULL_RATIO) {
    raider.aiState = 'flee';
    const fleeAngle = Math.atan2(-dx, dy);
    const diff = angleDiff(raider.rotation, fleeAngle);
    raider.rotationInput = Math.sign(diff);
    raider.throttleLevel = 5;
    return;
  }

  raider.aiState = 'aggro';
  switch (raider.behaviorType) {
    case 'interceptor': _doInterceptor(raider, player, entities, dist); break;
    case 'kiter':       _doKiter(raider, player, entities, dist);       break;
    case 'stalker':     _doStalker(raider, player, entities, dist);     break;
    case 'standoff':    _doStandoff(raider, player, entities, dist);    break;
    default:            _doShielding(raider, player, entities, dist);   break;
  }
}

function _getBestArc(raider) {
  let bestArc = 'front';
  let bestVal = -1;
  for (const [key, val] of Object.entries(raider.armorArcs)) {
    if (val > bestVal) { bestVal = val; bestArc = key; }
  }
  return bestArc;
}

function _doShielding(raider, player, entities, dist) {
  const dx = player.x - raider.x;
  const dy = player.y - raider.y;
  const angleToPlayer = Math.atan2(dx, -dy);

  // Choose orbit side to present healthiest arc toward player
  const bestArc = _getBestArc(raider);
  // Port arc faces player → orbit clockwise (offset +π/2)
  // Starboard arc faces player → orbit counter-clockwise (offset -π/2)
  const orbitOffset = (bestArc === 'starboard') ? -Math.PI / 2 : Math.PI / 2;

  const orbitAngle = angleToPlayer + orbitOffset;
  const orbitX = player.x + Math.sin(orbitAngle) * ORBIT_RADIUS;
  const orbitY = player.y - Math.cos(orbitAngle) * ORBIT_RADIUS;

  const odx = orbitX - raider.x;
  const ody = orbitY - raider.y;
  const orbitDist = Math.sqrt(odx * odx + ody * ody);

  const targetAngle = Math.atan2(odx, -ody);
  const diff = angleDiff(raider.rotation, targetAngle);
  raider.rotationInput = Math.sign(diff);
  raider.throttleLevel = orbitDist > ORBIT_HOLD_THRESHOLD ? 4 : 2;

  if (dist < FIRE_RANGE) _doLeadFire(raider, player, entities, dist);
}

function _doInterceptor(raider, player, entities, dist) {
  // Flank to a point behind the player (player's aft direction)
  const aftX = player.x - Math.sin(player.rotation) * INTERCEPTOR_AFT_DISTANCE;
  const aftY = player.y + Math.cos(player.rotation) * INTERCEPTOR_AFT_DISTANCE;

  const odx = aftX - raider.x;
  const ody = aftY - raider.y;
  const targetAngle = Math.atan2(odx, -ody);
  const diff = angleDiff(raider.rotation, targetAngle);

  raider.rotationInput = Math.sign(diff);
  raider.throttleLevel = Math.sqrt(odx * odx + ody * ody) > ORBIT_HOLD_THRESHOLD ? 5 : 3;

  if (dist < FIRE_RANGE) _doLeadFire(raider, player, entities, dist);
}

function _doKiter(raider, player, entities, dist) {
  const dx = player.x - raider.x;
  const dy = player.y - raider.y;

  if (dist < KITE_RANGE) {
    raider.aiState = 'kite-back';
    const fleeAngle = Math.atan2(-dx, dy);
    const diff = angleDiff(raider.rotation, fleeAngle);
    raider.rotationInput = Math.sign(diff);
    raider.throttleLevel = 4;
  } else {
    raider.aiState = 'kite-orbit';
    // Slow orbit at kite distance
    const angleToPlayer = Math.atan2(dx, -dy);
    const orbitAngle = angleToPlayer + Math.PI / 2;
    const orbitX = player.x + Math.sin(orbitAngle) * KITE_RANGE;
    const orbitY = player.y - Math.cos(orbitAngle) * KITE_RANGE;
    const odx = orbitX - raider.x;
    const ody = orbitY - raider.y;
    const targetAngle = Math.atan2(odx, -ody);
    const diff = angleDiff(raider.rotation, targetAngle);
    raider.rotationInput = Math.sign(diff);
    raider.throttleLevel = 2;
  }

  if (dist < FIRE_RANGE) _doLeadFire(raider, player, entities, dist);
}

function _doLeadFire(raider, target, entities, dist) {
  const weapon = raider.weapons[0];
  const projSpeed = weapon?.projectileSpeed
    ?? (BASE_PROJECTILE_SPEED * PROJECTILE_SPEED_FACTOR);
  const travelTime = dist / projSpeed;
  const pvx = Math.sin(target.rotation) * target.speed;
  const pvy = -Math.cos(target.rotation) * target.speed;
  const leadX = target.x + pvx * travelTime;
  const leadY = target.y + pvy * travelTime;
  const maxRange = weapon?.maxRange ?? Infinity;
  if (dist <= maxRange) {
    raider.fireWeapons(leadX, leadY, entities);
  }
  return { leadX, leadY };
}

function _doStalker(raider, player, entities, dist) {
  // Position at player's aft and fire only when nose is aligned
  const aftX = player.x - Math.sin(player.rotation) * STALKER_AFT_DISTANCE;
  const aftY = player.y + Math.cos(player.rotation) * STALKER_AFT_DISTANCE;

  const odx = aftX - raider.x;
  const ody = aftY - raider.y;
  const aftDist = Math.sqrt(odx * odx + ody * ody);
  const targetAngle = Math.atan2(odx, -ody);
  const diff = angleDiff(raider.rotation, targetAngle);

  raider.rotationInput = Math.sign(diff);
  raider.throttleLevel = aftDist > ORBIT_HOLD_THRESHOLD ? 5 : 3;

  // Fire only when nose is within AIM_TOLERANCE radians of player bearing
  const angleToPlayer = Math.atan2(player.x - raider.x, -(player.y - raider.y));
  const aimDiff = Math.abs(angleDiff(raider.rotation, angleToPlayer));
  if (aimDiff < AIM_TOLERANCE && dist < FIRE_RANGE) {
    raider.fireWeapons(player.x, player.y, entities);
  }
}

function _doStandoff(raider, player, entities, dist) {
  const dx = player.x - raider.x;
  const dy = player.y - raider.y;

  if (dist < STANDOFF_RANGE - 100) {
    raider.aiState = 'standoff-back';
    const fleeAngle = Math.atan2(-dx, dy);
    const diff = angleDiff(raider.rotation, fleeAngle);
    raider.rotationInput = Math.sign(diff);
    raider.throttleLevel = 4;
  } else {
    raider.aiState = 'standoff-hold';
    // At range or approaching — face player
    const angleToPlayer = Math.atan2(dx, -dy);
    const diff = angleDiff(raider.rotation, angleToPlayer);
    raider.rotationInput = Math.sign(diff);
    raider.throttleLevel = dist > STANDOFF_RANGE + 100 ? 3 : 1;
  }

  // Fire both primary and secondary when in range
  if (dist < STANDOFF_FIRE_RANGE) {
    const result = _doLeadFire(raider, player, entities, dist);
    raider.fireSecondary(result.leadX, result.leadY, entities);
  }
}

function _doLurker(raider, player, entities, dt) {
  // Initialise lurker state on first call
  if (raider._lurkerState === undefined) raider._lurkerState = 'hiding';
  raider.aiState = `lurk-${raider._lurkerState}`;

  const dxP = player.x - raider.x;
  const dyP = player.y - raider.y;
  const distToPlayer = Math.sqrt(dxP * dxP + dyP * dyP);

  // ── HIDING ────────────────────────────────────────────────────────────────
  if (raider._lurkerState === 'hiding') {
    const cover = raider._coverPoint;
    if (!cover) { raider.throttleLevel = 0; return; }

    const cdx = cover.x - raider.x;
    const cdy = cover.y - raider.y;
    const coverDist = Math.sqrt(cdx * cdx + cdy * cdy);

    // Steer toward cover
    const targetAngle = Math.atan2(cdx, -cdy);
    const diff = angleDiff(raider.rotation, targetAngle);
    raider.rotationInput = Math.sign(diff);
    raider.throttleLevel = coverDist > LURKER_HIDE_RADIUS ? 3 : 1;

    // Scan for nearby trader-convoys only when at cover
    if (coverDist < LURKER_HIDE_RADIUS) {
      for (const e of entities) {
        if (!e.active) continue;
        if (e.relation !== 'neutral') continue;
        if (e.neutralBehavior !== 'trader') continue;
        const edx = e.x - raider.x;
        const edy = e.y - raider.y;
        const eDist = Math.sqrt(edx * edx + edy * edy);
        if (eDist < LURKER_SCAN_RANGE) {
          raider._lurkerTarget = e;
          raider._lurkerState  = 'pouncing';
          break;
        }
      }
    }
    return;
  }

  // ── POUNCING ──────────────────────────────────────────────────────────────
  if (raider._lurkerState === 'pouncing') {
    // Hull low → flee
    if (raider.hullCurrent / raider.hullMax < FLEE_HULL_RATIO) {
      raider._lurkerState = 'fleeing';
      return;
    }

    // Switch to player if they are closer and within aggro range
    if (distToPlayer < AGGRO_RANGE) {
      const tgt = raider._lurkerTarget;
      if (!tgt || !tgt.active) {
        raider._lurkerTarget = player;
      } else {
        const tdx = tgt.x - raider.x;
        const tdy = tgt.y - raider.y;
        const distToTarget = Math.sqrt(tdx * tdx + tdy * tdy);
        if (distToPlayer < distToTarget) {
          raider._lurkerTarget = player;
        }
      }
    }

    const tgt = raider._lurkerTarget;

    // Validate target
    if (!tgt || !tgt.active) {
      raider._lurkerTarget = null;
      raider._lurkerState  = 'hiding';
      return;
    }

    const tdx = tgt.x - raider.x;
    const tdy = tgt.y - raider.y;
    const distToTarget = Math.sqrt(tdx * tdx + tdy * tdy);

    // Deaggro if too far
    if (distToTarget > DEAGGRO_RANGE) {
      raider._lurkerTarget = null;
      raider._lurkerState  = 'hiding';
      return;
    }

    // Steer toward target
    const angleToTarget = Math.atan2(tdx, -tdy);
    const diff = angleDiff(raider.rotation, angleToTarget);
    raider.rotationInput = Math.sign(diff);
    raider.throttleLevel = 5;

    // Fire when in range — compute lead coords once, use for both primary and secondary
    if (distToTarget < STANDOFF_FIRE_RANGE) {
      const result = _doLeadFire(raider, tgt, entities, distToTarget);
      raider.fireSecondary(result.leadX, result.leadY, entities);
    }
    return;
  }

  // ── FLEEING ───────────────────────────────────────────────────────────────
  if (raider._lurkerState === 'fleeing') {
    const tgt = raider._lurkerTarget;
    let fleeAngle;
    if (tgt && tgt.active) {
      const fdx = tgt.x - raider.x;
      const fdy = tgt.y - raider.y;
      fleeAngle = Math.atan2(-fdx, fdy);
    } else {
      fleeAngle = Math.atan2(-dxP, dyP);
    }
    const diff = angleDiff(raider.rotation, fleeAngle);
    raider.rotationInput = Math.sign(diff);
    raider.throttleLevel = 5;
  }
}

function _patrol(raider, dt) {
  const home = raider.homePosition;
  if (!home) { raider.throttleLevel = 0; return; }

  if (raider._patrolAngle === undefined) {
    raider._patrolAngle = Math.random() * Math.PI * 2;
  }
  raider._patrolAngle += dt * 0.3;

  const targetX = home.x + Math.sin(raider._patrolAngle) * PATROL_RADIUS;
  const targetY = home.y - Math.cos(raider._patrolAngle) * PATROL_RADIUS;

  const pdx = targetX - raider.x;
  const pdy = targetY - raider.y;
  const patrolDist = Math.sqrt(pdx * pdx + pdy * pdy);

  const targetAngle = Math.atan2(pdx, -pdy);
  const diff = angleDiff(raider.rotation, targetAngle);
  raider.rotationInput = Math.sign(diff);
  raider.throttleLevel = patrolDist > 60 ? 3 : 2;
}
