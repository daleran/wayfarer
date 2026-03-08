import { angleDiff } from '../utils/math.js';
import { NEUTRAL_AI } from '../data/stats.js';

const { TRADER_ARRIVE_RADIUS, TRADER_SLOW_RADIUS,
        TRADER_WAIT_MIN, TRADER_WAIT_MAX,
        TRADER_TRAVEL_THROTTLE, TRADER_APPROACH_THROTTLE } = NEUTRAL_AI;

export function updateNeutralAI(ship, dt) {
  switch (ship.neutralBehavior) {
    case 'trader':  _doTrader(ship, dt);  break;
    case 'militia': _doMilitia(ship, dt); break;
  }
}

function _doTrader(ship, dt) {
  // First-call init
  if (ship._neutralState === undefined) {
    ship._neutralState  = 'traveling';
    ship._neutralTarget = { ...ship._tradeRouteB };
    ship._neutralWaitTimer = 0;
  }

  if (ship._neutralState === 'waiting') {
    ship.throttleLevel = 0;
    ship.rotationInput = 0;
    ship._neutralWaitTimer -= dt;
    if (ship._neutralWaitTimer <= 0) {
      // Swap route endpoints and resume
      const tmp = ship._tradeRouteA;
      ship._tradeRouteA = ship._tradeRouteB;
      ship._tradeRouteB = tmp;
      ship._neutralTarget = { ...ship._tradeRouteB };
      ship._neutralState = 'traveling';
    }
    return;
  }

  // Traveling — steer toward target
  const dx = ship._neutralTarget.x - ship.x;
  const dy = ship._neutralTarget.y - ship.y;
  const dist = Math.sqrt(dx * dx + dy * dy);

  const targetAngle = Math.atan2(dx, -dy);
  const diff = angleDiff(ship.rotation, targetAngle);
  ship.rotationInput = Math.sign(diff);

  if (dist < TRADER_ARRIVE_RADIUS) {
    ship.throttleLevel = 0;
    ship._neutralState = 'waiting';
    ship._neutralWaitTimer = TRADER_WAIT_MIN + Math.random() * (TRADER_WAIT_MAX - TRADER_WAIT_MIN);
  } else if (dist < TRADER_SLOW_RADIUS) {
    ship.throttleLevel = TRADER_APPROACH_THROTTLE;
  } else {
    ship.throttleLevel = TRADER_TRAVEL_THROTTLE;
  }
}

function _doMilitia(ship, dt) {
  // First-call init
  if (ship._orbitAngle === undefined) ship._orbitAngle = 0;

  ship._orbitAngle += ship._orbitSpeed * dt;

  const cx = ship._orbitCenter.x;
  const cy = ship._orbitCenter.y;
  const targetX = cx + Math.sin(ship._orbitAngle) * ship._orbitRadius;
  const targetY = cy - Math.cos(ship._orbitAngle) * ship._orbitRadius;

  const dx = targetX - ship.x;
  const dy = targetY - ship.y;
  const dist = Math.sqrt(dx * dx + dy * dy);

  const targetAngle = Math.atan2(dx, -dy);
  const diff = angleDiff(ship.rotation, targetAngle);
  ship.rotationInput = Math.sign(diff);

  ship.throttleLevel = dist > 100 ? 3 : 2;
}
