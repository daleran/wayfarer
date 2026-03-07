const ORBIT_RADIUS = 220;
const FIRE_RANGE = 300;
const FLEE_HULL_RATIO = 0.3;

// Returns the shortest angular difference from angle a to angle b (both in radians).
function angleDiff(a, b) {
  let d = b - a;
  while (d > Math.PI) d -= Math.PI * 2;
  while (d < -Math.PI) d += Math.PI * 2;
  return d;
}

export function updateRaiderAI(raider, player, entities, dt) {
  const dx = player.x - raider.x;
  const dy = player.y - raider.y;
  const dist = Math.sqrt(dx * dx + dy * dy);

  // Flee at low hull
  if (raider.hullCurrent / raider.hullMax < FLEE_HULL_RATIO) {
    // Point away from player. Ship convention: rotation 0 = up; facing = (sin(r), -cos(r)).
    // To point in direction (-dx, -dy): atan2(-dx, dy)
    const fleeAngle = Math.atan2(-dx, dy);
    const diff = angleDiff(raider.rotation, fleeAngle);
    raider.rotationInput = Math.sign(diff);
    raider.throttleLevel = 4;
    return;
  }

  // Flanking orbit: pick a point 90° off the raider→player line, at ORBIT_RADIUS.
  // angleToPlayer in ship convention: atan2(dx, -dy) gives the rotation that faces the player.
  const angleToPlayer = Math.atan2(dx, -dy);
  const orbitAngle = angleToPlayer + Math.PI / 2;

  // Orbit point in world space (using ship forward convention for offset)
  const orbitX = player.x + Math.sin(orbitAngle) * ORBIT_RADIUS;
  const orbitY = player.y - Math.cos(orbitAngle) * ORBIT_RADIUS;

  const odx = orbitX - raider.x;
  const ody = orbitY - raider.y;
  const orbitDist = Math.sqrt(odx * odx + ody * ody);

  // Steer toward orbit point
  const targetAngle = Math.atan2(odx, -ody);
  const diff = angleDiff(raider.rotation, targetAngle);
  raider.rotationInput = Math.sign(diff);

  // Throttle based on distance to orbit point
  raider.throttleLevel = orbitDist > 80 ? 3 : 1;

  // Fire if close enough to player
  if (dist < FIRE_RANGE) {
    raider.fireWeapons(player.x, player.y, entities);
  }
}
