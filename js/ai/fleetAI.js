import { angleDiff, distanceBetween } from '../utils/math.js';

const COMBAT_RANGE = 600;
const BRAWLER_CLOSE_DIST = 150;
const KITER_STANDOFF_MIN = 250;
const KITER_STANDOFF_MAX = 300;
const FIRE_RANGE = 350;

export function updateFleetShipAI(ship, player, mouseWorld, enemies, entities, dt) {
  const nearestEnemy = findNearestEnemy(ship, enemies);
  const inCombat = nearestEnemy && distanceBetween(ship, nearestEnemy) < COMBAT_RANGE;

  if (inCombat) {
    // Pick target: enemy nearest to mouse cursor, or nearest to ship
    const target = findTargetNearCursor(mouseWorld, enemies) || nearestEnemy;

    switch (ship.behaviorType) {
      case 'brawler':
        brawlerCombat(ship, target, entities, dt);
        break;
      case 'kiter':
        kiterCombat(ship, target, entities, dt);
        break;
      case 'flee':
      default:
        fleeBehavior(ship, enemies, dt);
        break;
    }
  } else {
    formationCruise(ship, player, dt);
  }
}

function findNearestEnemy(ship, enemies) {
  let nearest = null;
  let nearestDist = Infinity;
  for (const e of enemies) {
    if (!e.active) continue;
    const d = distanceBetween(ship, e);
    if (d < nearestDist) {
      nearestDist = d;
      nearest = e;
    }
  }
  return nearest;
}

function findTargetNearCursor(mouseWorld, enemies) {
  if (!mouseWorld) return null;
  let nearest = null;
  let nearestDist = Infinity;
  for (const e of enemies) {
    if (!e.active) continue;
    const d = distanceBetween(mouseWorld, e);
    if (d < nearestDist) {
      nearestDist = d;
      nearest = e;
    }
  }
  return nearest;
}

function brawlerCombat(ship, target, entities, dt) {
  const dist = distanceBetween(ship, target);
  const dx = target.x - ship.x;
  const dy = target.y - ship.y;

  if (dist > BRAWLER_CLOSE_DIST) {
    // Close in on target
    const targetAngle = Math.atan2(dx, -dy);
    const diff = angleDiff(ship.rotation, targetAngle);
    ship.rotationInput = Math.sign(diff);
    ship.throttleLevel = 4;
  } else {
    // Circle-strafe: orbit at close range
    const angleToTarget = Math.atan2(dx, -dy);
    const orbitAngle = angleToTarget + Math.PI / 2;
    const diff = angleDiff(ship.rotation, orbitAngle);
    ship.rotationInput = Math.sign(diff);
    ship.throttleLevel = 3;
  }

  // Fire at target
  if (dist < FIRE_RANGE) {
    ship.fireWeapons(target.x, target.y, entities);
  }
}

function kiterCombat(ship, target, entities, dt) {
  const dist = distanceBetween(ship, target);
  const dx = target.x - ship.x;
  const dy = target.y - ship.y;

  if (dist < KITER_STANDOFF_MIN) {
    // Too close — back away
    const awayAngle = Math.atan2(-dx, dy);
    const diff = angleDiff(ship.rotation, awayAngle);
    ship.rotationInput = Math.sign(diff);
    ship.throttleLevel = 5;
  } else if (dist > KITER_STANDOFF_MAX) {
    // Too far — close in
    const toAngle = Math.atan2(dx, -dy);
    const diff = angleDiff(ship.rotation, toAngle);
    ship.rotationInput = Math.sign(diff);
    ship.throttleLevel = 4;
  } else {
    // In range — orbit
    const angleToTarget = Math.atan2(dx, -dy);
    const orbitAngle = angleToTarget + Math.PI / 2;
    const diff = angleDiff(ship.rotation, orbitAngle);
    ship.rotationInput = Math.sign(diff);
    ship.throttleLevel = 3;
  }

  // Fire at target
  if (dist < FIRE_RANGE) {
    ship.fireWeapons(target.x, target.y, entities);
  }
}

function fleeBehavior(ship, enemies, dt) {
  // Compute centroid of nearby enemies
  let cx = 0, cy = 0, count = 0;
  for (const e of enemies) {
    if (!e.active) continue;
    if (distanceBetween(ship, e) < COMBAT_RANGE) {
      cx += e.x;
      cy += e.y;
      count++;
    }
  }
  if (count > 0) {
    cx /= count;
    cy /= count;
    const dx = cx - ship.x;
    const dy = cy - ship.y;
    const awayAngle = Math.atan2(-dx, dy);
    const diff = angleDiff(ship.rotation, awayAngle);
    ship.rotationInput = Math.sign(diff);
  }
  ship.throttleLevel = 5;
}

function formationCruise(ship, player, dt) {
  if (!ship.formationOffset) return;

  // Compute formation position relative to player's facing direction
  const sinR = Math.sin(player.rotation);
  const cosR = Math.cos(player.rotation);
  const off = ship.formationOffset;

  // Rotate offset by player's rotation
  const worldX = player.x + off.x * cosR + off.y * sinR;
  const worldY = player.y + off.x * sinR - off.y * cosR;

  const dx = worldX - ship.x;
  const dy = worldY - ship.y;
  const dist = Math.sqrt(dx * dx + dy * dy);

  const targetAngle = Math.atan2(dx, -dy);
  const diff = angleDiff(ship.rotation, targetAngle);
  ship.rotationInput = Math.sign(diff);

  // Match player throttle when close, speed up when far
  if (dist > 120) {
    ship.throttleLevel = 5;
  } else if (dist > 40) {
    ship.throttleLevel = Math.max(player.throttleLevel, 3);
  } else {
    ship.throttleLevel = player.throttleLevel;
  }
}
