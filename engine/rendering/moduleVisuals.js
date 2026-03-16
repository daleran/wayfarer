// Module mount-point visuals — empty mount indicators and inventory highlights.
// Module-specific rendering lives in each ShipModule subclass (drawAtMount).

import { AMBER, CYAN } from './colors.js';

// Empty mount sizes
const EMPTY_SMALL = 4;  // half-size of small slot rect
const EMPTY_LARGE = 8;  // half-size of large slot rect

// Bracket geometry — fraction of half-size
const LEG_FRAC = 0.4;    // bracket leg length as fraction of hs

/**
 * Draw empty mount point indicator (chamfered corner brackets + faint fill).
 * Engine slots show [E] label.
 * @param {CanvasRenderingContext2D} ctx
 * @param {{ x: number, y: number, size?: string, slot?: string }} mount
 * @param {boolean} [inventoryMode=false] - CYAN + higher alpha when true
 */
export function drawEmptyMount(ctx, mount, inventoryMode = false) {
  const hs = mount.size === 'large' ? EMPTY_LARGE : EMPTY_SMALL;
  const color = inventoryMode ? CYAN : AMBER;
  const alpha = inventoryMode ? 0.6 : 0.35;
  const leg = hs * LEG_FRAC;

  ctx.save();

  // Faint inner fill
  ctx.globalAlpha = inventoryMode ? 0.1 : 0.06;
  ctx.fillStyle = color;
  ctx.fillRect(mount.x - hs, mount.y - hs, hs * 2, hs * 2);

  // Corner brackets — 4 simple L-shapes
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = color;
  ctx.lineWidth = inventoryMode ? 0.8 : 0.5;
  ctx.beginPath();

  // Top-left
  ctx.moveTo(mount.x - hs + leg, mount.y - hs);
  ctx.lineTo(mount.x - hs, mount.y - hs);
  ctx.lineTo(mount.x - hs, mount.y - hs + leg);

  // Top-right
  ctx.moveTo(mount.x + hs - leg, mount.y - hs);
  ctx.lineTo(mount.x + hs, mount.y - hs);
  ctx.lineTo(mount.x + hs, mount.y - hs + leg);

  // Bottom-right
  ctx.moveTo(mount.x + hs, mount.y + hs - leg);
  ctx.lineTo(mount.x + hs, mount.y + hs);
  ctx.lineTo(mount.x + hs - leg, mount.y + hs);

  // Bottom-left
  ctx.moveTo(mount.x - hs, mount.y + hs - leg);
  ctx.lineTo(mount.x - hs, mount.y + hs);
  ctx.lineTo(mount.x - hs + leg, mount.y + hs);

  ctx.stroke();

  // Engine slot label
  if (mount.slot === 'engine') {
    ctx.fillStyle = color;
    ctx.font = "bold 4px monospace";
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('E', mount.x, mount.y);
  }

  ctx.restore();
}