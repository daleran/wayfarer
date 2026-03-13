// Module mount-point visuals — empty mount indicators and inventory highlights.
// Module-specific rendering lives in each ShipModule subclass (drawAtMount).

import { CYAN, WHITE } from './colors.js';

// Empty mount sizes
const EMPTY_SMALL = 4;  // half-size of small dotted square
const EMPTY_LARGE = 6;  // half-size of large dotted square

/**
 * Draw empty mount point indicator (thin dotted square outline).
 * Engine slots show [E] label.
 * @param {CanvasRenderingContext2D} ctx
 * @param {{ x: number, y: number, size?: string, slot?: string }} mount
 * @param {boolean} [inventoryMode=false] - CYAN + higher alpha when true
 */
export function drawEmptyMount(ctx, mount, inventoryMode = false) {
  const hs = mount.size === 'large' ? EMPTY_LARGE : EMPTY_SMALL;
  const color = inventoryMode ? CYAN : WHITE;
  ctx.save();
  ctx.globalAlpha = inventoryMode ? 0.6 : 0.3;
  ctx.strokeStyle = color;
  ctx.lineWidth = inventoryMode ? 0.8 : 0.5;
  ctx.setLineDash([2, 2]);
  ctx.strokeRect(mount.x - hs, mount.y - hs, hs * 2, hs * 2);
  ctx.setLineDash([]);
  if (mount.slot === 'engine') {
    ctx.globalAlpha = inventoryMode ? 0.6 : 0.35;
    ctx.fillStyle = color;
    ctx.font = "bold 4px monospace";
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('E', mount.x, mount.y);
  }
  ctx.restore();
}

/**
 * Draw a subtle highlight ring around a mount point (inventory mode).
 * @param {CanvasRenderingContext2D} ctx
 * @param {{ x: number, y: number }} mount
 * @param {boolean} [hovered=false] - brighter when hovered
 */
export function drawMountHighlight(ctx, mount, hovered = false) {
  const r = 8;
  ctx.save();
  ctx.globalAlpha = hovered ? 0.7 : 0.25;
  ctx.strokeStyle = CYAN;
  ctx.lineWidth = hovered ? 1.2 : 0.6;
  ctx.beginPath();
  ctx.arc(mount.x, mount.y, r, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}
