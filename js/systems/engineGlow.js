/**
 * Reusable engine glow renderer — call from any ship's _drawShape(ctx).
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {Array<{x,y}>} positions   — engine glow centers (local ship coords)
 * @param {string}       color        — engine stroke color
 * @param {number}       baseRadius   — inner glow radius (e.g. 3 + throttleLevel * 0.6)
 * @param {number}       outerOffset  — extra radius for outer ring (e.g. 2)
 * @param {number}       outerScale   — pulse multiplier for outer ring extent (e.g. 2)
 * @param {number}       outerAlpha   — alpha multiplier for outer ring (e.g. 0.3)
 */
export function drawEngineGlow(ctx, positions, color, baseRadius, outerOffset, outerScale, outerAlpha) {
  const pulse = 0.6 + Math.sin(Date.now() * 0.008) * 0.4;
  for (const pos of positions) {
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, baseRadius, 0, Math.PI * 2);
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5;
    ctx.globalAlpha = pulse;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(pos.x, pos.y, baseRadius + outerOffset + pulse * outerScale, 0, Math.PI * 2);
    ctx.strokeStyle = color;
    ctx.lineWidth = 1;
    ctx.globalAlpha = pulse * outerAlpha;
    ctx.stroke();

    ctx.globalAlpha = 1;
  }
}
