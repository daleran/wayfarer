// ── Shared module slot box renderer ──────────────────────────────────────────
// Used by both ShipScreen (in-game) and Designer (dev tool) to render
// canvas-drawn module slot boxes with connection lines to hull mount points.

import { CYAN, GREEN, AMBER, RED, DIM_TEXT, VERY_DIM, conditionColor } from '@/rendering/colors.js';
import { text as drawText, disc } from '@/rendering/draw.js';

const BOX_W = 264;
const BOX_H = 44;
const BOX_GAP = 6;
const EXPANDED_H = 160;
const TEXT_SIZE = 12;
const DETAIL_SIZE = 11;
const DETAIL_LINE_H = 15;

export { BOX_W, BOX_H, BOX_GAP };

/**
 * Render the "MODULES" header with power budget.
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} x
 * @param {number} y - baseline Y for the header text
 * @param {(object|null)[]} slots - moduleSlots array
 */
export function renderModuleHeader(ctx, x, y, slots) {
  let totalOut = 0, totalDraw = 0;
  for (const mod of slots) {
    if (!mod) continue;
    totalOut += (mod.effectivePowerOutput ?? mod.powerOutput) || 0;
    totalDraw += mod.powerDraw || 0;
  }
  const net = totalOut - totalDraw;

  drawText(ctx, 'MODULES', x, y, DIM_TEXT,
    { size: TEXT_SIZE, weight: 'bold', align: 'left', baseline: 'bottom', alpha: 0.8 });
  const netLabel = `${net >= 0 ? '+' : ''}${net}W`;
  drawText(ctx, netLabel, x + BOX_W, y, net >= 0 ? GREEN : RED,
    { size: TEXT_SIZE, align: 'right', baseline: 'bottom', alpha: 0.8 });
}

/**
 * Render a single module slot box with its connection line.
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {object} opts
 * @param {number} opts.boxX
 * @param {number} opts.curY - top of this box
 * @param {object|null} opts.mod - installed module or null
 * @param {object} opts.mount - mount point definition
 * @param {{ x: number, y: number }} opts.mountPos - mount screen position
 * @param {number} opts.slotIdx - index into moduleSlots
 * @param {boolean} opts.isHovered
 * @param {object} [opts.install] - install state (ship screen only)
 * @param {boolean} [opts.install.isInstalling]
 * @param {number}  [opts.install.progress]
 * @param {boolean} [opts.install.canInstall] - empty slot is compatible with selected cargo
 * @param {((ctx: CanvasRenderingContext2D, mod: object, x: number, y: number, w: number) => void)|null} [opts.onExpanded]
 *   callback to draw expanded stats when hovered (ship screen only)
 * @returns {number} the height used by this box (for advancing curY)
 */
export function renderModuleSlotBox(ctx, {
  boxX, curY, mod, mount, mountPos, slotIdx,
  isHovered,
  install = null,
  onExpanded = null,
}) {
  const isInstalling = install?.isInstalling ?? false;
  const installProgress = install?.progress ?? 0;
  const canInstall = install?.canInstall ?? false;

  const boxH = isHovered && mod && onExpanded ? EXPANDED_H : BOX_H;

  // ── Connection line ──────────────────────────────────────────────────
  const lineAlpha = isHovered ? 0.9 : mod ? 0.3 : 0.15;
  const lineWidth = isHovered ? 1.5 : 0.8;
  ctx.save();
  ctx.globalAlpha = lineAlpha;
  ctx.strokeStyle = CYAN;
  ctx.lineWidth = lineWidth;
  if (!isHovered && !mod) ctx.setLineDash([4, 4]);
  ctx.beginPath();
  ctx.moveTo(boxX + BOX_W, curY + BOX_H / 2);
  ctx.lineTo(mountPos.x, mountPos.y);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.restore();

  // ── Box background ───────────────────────────────────────────────────
  const borderColor = isInstalling ? GREEN
    : canInstall ? GREEN
    : isHovered ? CYAN : VERY_DIM;

  ctx.save();
  ctx.globalAlpha = 0.85;
  ctx.fillStyle = 'rgba(0,4,12,0.88)';
  ctx.fillRect(boxX, curY, BOX_W, boxH);
  ctx.globalAlpha = 1;

  if (isInstalling) {
    const pct = Math.min(installProgress / 1.5, 1);
    ctx.fillStyle = 'rgba(0,255,102,0.12)';
    ctx.fillRect(boxX, curY, BOX_W * pct, boxH);
  } else if (canInstall) {
    ctx.fillStyle = 'rgba(0,255,102,0.03)';
    ctx.fillRect(boxX, curY, BOX_W, boxH);
  }

  // Border
  ctx.strokeStyle = borderColor;
  ctx.lineWidth = 1;
  if (!mod && !isInstalling && !canInstall) ctx.setLineDash([3, 3]);
  ctx.strokeRect(boxX + 0.5, curY + 0.5, BOX_W - 1, boxH - 1);
  ctx.setLineDash([]);
  ctx.restore();

  // ── Content ──────────────────────────────────────────────────────────
  const sizeTag = mount?.size === 'large' ? 'L' : 'S';
  const slotLabel = mount?.slot === 'engine' ? `E·${sizeTag}` : `${slotIdx + 1}·${sizeTag}`;

  // Two-line layout: top line = slot label + power, bottom line = module name
  const topY = curY + 13;
  const botY = curY + 29;

  if (isInstalling) {
    drawText(ctx, `[${slotLabel}] INSTALLING...`, boxX + 8, curY + BOX_H / 2, GREEN,
      { size: TEXT_SIZE, align: 'left' });
  } else if (mod) {
    // Top line: slot label (left) + power + condition (right)
    drawText(ctx, `[${slotLabel}]`, boxX + 8, topY, DIM_TEXT,
      { size: TEXT_SIZE, align: 'left' });

    const effOut = mod.effectivePowerOutput ?? mod.powerOutput;
    const pwrStr = effOut > 0 ? `+${effOut}W` : mod.powerDraw > 0 ? `-${mod.powerDraw}W` : '';
    if (pwrStr) {
      drawText(ctx, pwrStr, boxX + BOX_W - 22, topY, effOut > 0 ? GREEN : AMBER,
        { size: TEXT_SIZE, align: 'right' });
    }

    // Condition dot (top-right)
    if (mod.condition) {
      disc(ctx, boxX + BOX_W - 9, topY, 4, conditionColor(mod.condition), 0.9);
    }

    // Bottom line: full module name (no truncation needed with wider box + own line)
    drawText(ctx, mod.displayName || '', boxX + 8, botY, CYAN,
      { size: TEXT_SIZE, align: 'left' });

    // Expanded detail rows on hover
    if (isHovered && onExpanded) {
      onExpanded(ctx, mod, boxX + 8, curY + BOX_H + 4, BOX_W - 16);
    }
  } else {
    const emptyText = canInstall
      ? `[${slotLabel}] CLICK TO INSTALL`
      : `[${slotLabel}] ── EMPTY ──`;
    const emptyColor = canInstall ? GREEN : VERY_DIM;
    drawText(ctx, emptyText, boxX + 8, curY + BOX_H / 2, emptyColor,
      { size: TEXT_SIZE, align: 'left' });
  }

  // Highlight mount point when hovered
  if (isHovered) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(mountPos.x, mountPos.y, 10, 0, Math.PI * 2);
    ctx.strokeStyle = CYAN;
    ctx.lineWidth = 1.5;
    ctx.globalAlpha = 0.7;
    ctx.stroke();
    ctx.restore();
  }

  return boxH + BOX_GAP;
}

/**
 * Draw expanded module stat rows (used by ShipScreen on hover).
 * @param {CanvasRenderingContext2D} ctx
 * @param {{ label: string, value: string, cls: string }[]} rows
 * @param {number} x
 * @param {number} y
 * @param {number} maxW
 */
export function renderExpandedStats(ctx, rows, x, y, maxW) {
  let ry = y;
  for (const { label, value, cls } of rows) {
    const color = cls === 'green' ? GREEN : cls === 'red' ? RED : cls === 'amber' ? AMBER : cls === 'cyan' ? CYAN : cls === 'dim' ? DIM_TEXT : '#ffffff';
    if (label) {
      drawText(ctx, label, x, ry, DIM_TEXT, { size: DETAIL_SIZE, align: 'left', baseline: 'top' });
      drawText(ctx, value, x + maxW, ry, color, { size: DETAIL_SIZE, align: 'right', baseline: 'top' });
    } else {
      drawText(ctx, value, x, ry, color, { size: DETAIL_SIZE, align: 'left', baseline: 'top' });
    }
    ry += DETAIL_LINE_H;
  }
}
