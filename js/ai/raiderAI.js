import { angleDiff } from '../utils/math.js';
import { RAIDER_AI, BASE_PROJECTILE_SPEED, PROJECTILE_SPEED_FACTOR } from '../data/stats.js';

const { AGGRO_RANGE, DEAGGRO_RANGE, FIRE_RANGE, ORBIT_RADIUS,
        KITE_RANGE, PATROL_RADIUS, FLEE_HULL_RATIO,
        STANDOFF_RANGE, STANDOFF_FIRE_RANGE } = RAIDER_AI;

// Arc offset from ship forward to present that arc toward a target
const ARC_OFFSETS = {
  front:     0,
  aft:       Math.PI,
  port:     -Math.PI / 2,
  starboard: Math.PI / 2,
};

export function updateRaiderAI(raider, player, entities, dt) {
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
    _patrol(raider, dt);
    return;
  }

  // Flee at low hull regardless of behavior type
  if (raider.hullCurrent / raider.hullMax < FLEE_HULL_RATIO) {
    const fleeAngle = Math.atan2(-dx, dy);
    const diff = angleDiff(raider.rotation, fleeAngle);
    raider.rotationInput = Math.sign(diff);
    raider.throttleLevel = 5;
    return;
  }

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
  raider.throttleLevel = orbitDist > 80 ? 4 : 2;

  if (dist < FIRE_RANGE) _doLeadFire(raider, player, entities, dist);
}

function _doInterceptor(raider, player, entities, dist) {
  // Flank to a point behind the player (player's aft direction)
  const aftX = player.x - Math.sin(player.rotation) * 350;
  const aftY = player.y + Math.cos(player.rotation) * 350;

  const odx = aftX - raider.x;
  const ody = aftY - raider.y;
  const targetAngle = Math.atan2(odx, -ody);
  const diff = angleDiff(raider.rotation, targetAngle);

  raider.rotationInput = Math.sign(diff);
  raider.throttleLevel = Math.sqrt(odx * odx + ody * ody) > 60 ? 5 : 3;

  if (dist < FIRE_RANGE) _doLeadFire(raider, player, entities, dist);
}

function _doKiter(raider, player, entities, dist) {
  const dx = player.x - raider.x;
  const dy = player.y - raider.y;

  if (dist < KITE_RANGE) {
    // Back away
    const fleeAngle = Math.atan2(-dx, dy);
    const diff = angleDiff(raider.rotation, fleeAngle);
    raider.rotationInput = Math.sign(diff);
    raider.throttleLevel = 4;
  } else {
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

function _doLeadFire(raider, player, entities, dist) {
  const projSpeed = raider.weapons[0]?.projectileSpeed
    ?? (BASE_PROJECTILE_SPEED * PROJECTILE_SPEED_FACTOR);
  const travelTime = dist / projSpeed;
  const pvx = Math.sin(player.rotation) * player.speed;
  const pvy = -Math.cos(player.rotation) * player.speed;
  const leadX = player.x + pvx * travelTime;
  const leadY = player.y + pvy * travelTime;
  raider.fireWeapons(leadX, leadY, entities);
  return { leadX, leadY };
}

function _doStalker(raider, player, entities, dist) {
  // Position at player's aft and fire only when nose is aligned
  const aftX = player.x - Math.sin(player.rotation) * 300;
  const aftY = player.y + Math.cos(player.rotation) * 300;

  const odx = aftX - raider.x;
  const ody = aftY - raider.y;
  const aftDist = Math.sqrt(odx * odx + ody * ody);
  const targetAngle = Math.atan2(odx, -ody);
  const diff = angleDiff(raider.rotation, targetAngle);

  raider.rotationInput = Math.sign(diff);
  raider.throttleLevel = aftDist > 80 ? 5 : 3;

  // Fire only when nose is within ~0.4 rad of player bearing
  const angleToPlayer = Math.atan2(player.x - raider.x, -(player.y - raider.y));
  const aimDiff = Math.abs(angleDiff(raider.rotation, angleToPlayer));
  if (aimDiff < 0.4 && dist < FIRE_RANGE) {
    raider.fireWeapons(player.x, player.y, entities);
  }
}

function _doStandoff(raider, player, entities, dist) {
  const dx = player.x - raider.x;
  const dy = player.y - raider.y;

  if (dist < STANDOFF_RANGE - 100) {
    // Too close — back away (face away from player and thrust)
    const fleeAngle = Math.atan2(-dx, dy);
    const diff = angleDiff(raider.rotation, fleeAngle);
    raider.rotationInput = Math.sign(diff);
    raider.throttleLevel = 4;
  } else {
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
