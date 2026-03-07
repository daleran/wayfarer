import { angleDiff } from '../utils/math.js';

const ORBIT_RADIUS = 220;
const FIRE_RANGE = 300;
const FLEE_HULL_RATIO = 0.3;
const AGGRO_RANGE = 800;
const PATROL_RADIUS = 300;
const DEAGGRO_RANGE = 1200;

export function updateRaiderAI(raider, player, entities, dt) {
  const dx = player.x - raider.x;
  const dy = player.y - raider.y;
  const dist = Math.sqrt(dx * dx + dy * dy);

  // Track aggro state on the raider
  if (raider._aggro === undefined) raider._aggro = false;

  // Aggro when player enters range, deaggro when they leave (with hysteresis)
  if (!raider._aggro && dist < AGGRO_RANGE) {
    raider._aggro = true;
  } else if (raider._aggro && dist > DEAGGRO_RANGE) {
    raider._aggro = false;
  }

  // If not aggro, patrol near home position
  if (!raider._aggro) {
    _patrol(raider, dt);
    return;
  }

  // Flee at low hull
  if (raider.hullCurrent / raider.hullMax < FLEE_HULL_RATIO) {
    const fleeAngle = Math.atan2(-dx, dy);
    const diff = angleDiff(raider.rotation, fleeAngle);
    raider.rotationInput = Math.sign(diff);
    raider.throttleLevel = 5;
    return;
  }

  // Flanking orbit: pick a point 90° off the raider→player line, at ORBIT_RADIUS.
  const angleToPlayer = Math.atan2(dx, -dy);
  const orbitAngle = angleToPlayer + Math.PI / 2;

  const orbitX = player.x + Math.sin(orbitAngle) * ORBIT_RADIUS;
  const orbitY = player.y - Math.cos(orbitAngle) * ORBIT_RADIUS;

  const odx = orbitX - raider.x;
  const ody = orbitY - raider.y;
  const orbitDist = Math.sqrt(odx * odx + ody * ody);

  const targetAngle = Math.atan2(odx, -ody);
  const diff = angleDiff(raider.rotation, targetAngle);
  raider.rotationInput = Math.sign(diff);

  raider.throttleLevel = orbitDist > 80 ? 4 : 2;

  if (dist < FIRE_RANGE) {
    // Lead targeting: predict where player will be when projectile arrives
    const projSpeed = 600;
    const travelTime = dist / projSpeed;
    const pvx = Math.sin(player.rotation) * player.speed;
    const pvy = -Math.cos(player.rotation) * player.speed;
    const leadX = player.x + pvx * travelTime;
    const leadY = player.y + pvy * travelTime;
    raider.fireWeapons(leadX, leadY, entities);
  }
}

function _patrol(raider, dt) {
  const home = raider.homePosition;
  if (!home) { raider.throttleLevel = 0; return; }

  // Initialize patrol angle
  if (raider._patrolAngle === undefined) {
    raider._patrolAngle = Math.random() * Math.PI * 2;
  }
  raider._patrolAngle += dt * 0.3;

  // Orbit around home position
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
