/**
 * Returns the shortest angular difference from angle a to angle b (radians).
 */
export function angleDiff(a, b) {
  let d = b - a;
  while (d > Math.PI) d -= Math.PI * 2;
  while (d < -Math.PI) d += Math.PI * 2;
  return d;
}

/**
 * Normalize a direction from (fromX, fromY) toward (toX, toY).
 * Returns { nx, ny, dist } or null if the points are coincident.
 */
export function normalizeToTarget(fromX, fromY, toX, toY) {
  const dx = toX - fromX;
  const dy = toY - fromY;
  const dist = Math.sqrt(dx * dx + dy * dy);
  if (dist === 0) return null;
  return { nx: dx / dist, ny: dy / dist, dist };
}

/**
 * Euclidean distance between two points.
 */
export function distanceBetween(a, b) {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  return Math.sqrt(dx * dx + dy * dy);
}
