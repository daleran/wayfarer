import {
  CYAN, AMBER, GREEN, RED, BLUE, MAGENTA, WHITE,
  BAR_TRACK, DIM_OUTLINE, VERY_DIM, DIM_TEXT,
  armorArcColor,
} from '../ui/colors.js';

const THROTTLE_LABELS = ['STOP', '1/4', '1/2', '3/4', 'FULL', 'FLANK'];
const PIP_W = 32;
const PIP_H = 14;
const PIP_GAP = 6;

const BMARGIN       = 32;
const STRIP_BAR_H   = 14;
const STRIP_ROW_GAP = 7;

export { BMARGIN };

export function renderBottomStrip(ctx, game) {
  const { player, camera } = game;
  const now = Date.now();
  const SEG = 10;
  ctx.save();

  const row2Y = camera.height - BMARGIN - STRIP_BAR_H;
  const row1Y = row2Y - STRIP_BAR_H - STRIP_ROW_GAP;

  const ARMOR_LBL_W  = 52;
  const LEFT_BAR_W   = 130;
  const LEFT_NUM_W   = 44;
  const LEFT_W       = ARMOR_LBL_W + LEFT_BAR_W + LEFT_NUM_W;

  const levels      = player.throttleLevels;
  const THROT_W     = levels * PIP_W + (levels - 1) * PIP_GAP;
  const FUEL_LBL_W  = 44;
  const FUEL_BAR_W  = 130;
  const FUEL_NUM_W  = 52;
  const CTR_W       = Math.max(THROT_W, FUEL_LBL_W + FUEL_BAR_W + FUEL_NUM_W);

  const CARGO_LBL_W = 52;
  const CARGO_BAR_W = 130;
  const CARGO_NUM_W = 52;
  const SCRAP_W     = 72;
  const RIGHT_W     = CARGO_LBL_W + CARGO_BAR_W + CARGO_NUM_W + SCRAP_W;

  const H_GAP   = 22;
  const GROUP_W = LEFT_W + H_GAP + CTR_W + H_GAP + RIGHT_W;
  const groupX  = (camera.width - GROUP_W) / 2;

  const leftX  = groupX;
  const ctrX   = groupX + LEFT_W + H_GAP;
  const rightX = ctrX + CTR_W + H_GAP;

  // LEFT: Armor pips (row1) + Hull bar (row2)
  const arcsMax = player.armorArcsMax;
  const arcs    = player.armorArcs;

  // ARMOR pips
  {
    const arcKeys  = ['front', 'port', 'starboard', 'aft'];
    const arcLbls  = ['F', 'P', 'S', 'A'];
    const totalCur = arcKeys.reduce((s, k) => s + (arcs[k] || 0), 0);
    const totalMax = arcKeys.reduce((s, k) => s + (arcsMax[k] || 0), 0);
    const avgRatio = totalMax > 0 ? totalCur / totalMax : 0;
    const lblColor = armorArcColor(avgRatio);
    const barX     = leftX + ARMOR_LBL_W;

    ctx.font = '12px monospace';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = lblColor;
    ctx.fillText('ARMOR', leftX, row1Y + STRIP_BAR_H / 2);

    ctx.strokeStyle = lblColor;
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.6;
    ctx.strokeRect(barX - 1, row1Y - 1, LEFT_BAR_W + 2, STRIP_BAR_H + 2);
    ctx.globalAlpha = 1;

    const pipW = (LEFT_BAR_W - 3) / 4;
    for (let i = 0; i < 4; i++) {
      const key    = arcKeys[i];
      const ratio  = (arcsMax[key] || 0) > 0 ? (arcs[key] || 0) / arcsMax[key] : 0;
      const hitAge = now - (player._arcHitTimestamps[key] || 0);
      const flash  = hitAge < 150;
      const color  = flash ? WHITE : armorArcColor(ratio);
      const px     = barX + i * (pipW + 1);

      ctx.fillStyle = BAR_TRACK;
      ctx.fillRect(px, row1Y, pipW, STRIP_BAR_H);

      if (ratio > 0) {
        ctx.fillStyle = color;
        ctx.globalAlpha = flash ? 1.0 : 0.85;
        ctx.fillRect(px, row1Y, pipW * ratio, STRIP_BAR_H);
        ctx.globalAlpha = 1;
      }

      ctx.font = '8px monospace';
      ctx.textAlign = 'center';
      ctx.fillStyle = flash ? WHITE : (ratio > 0 ? color : VERY_DIM);
      ctx.globalAlpha = flash ? 1.0 : 0.7;
      ctx.fillText(arcLbls[i], px + pipW / 2, row1Y + STRIP_BAR_H / 2);
      ctx.globalAlpha = 1;
    }

    ctx.font = '10px monospace';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = lblColor;
    ctx.fillText(
      `${Math.floor(totalCur)}/${Math.floor(totalMax)}`,
      barX + LEFT_BAR_W + 6, row1Y + STRIP_BAR_H / 2
    );
  }

  // HULL bar
  {
    const hullRatio = player.hullMax > 0 ? player.hullCurrent / player.hullMax : 0;
    const hullColor = hullRatio > 0.5 ? GREEN : hullRatio > 0.25 ? AMBER : RED;
    const hullFlash = hullRatio < 0.25 && Math.floor(now / 300) % 2 === 0;
    const color     = hullFlash ? RED : hullColor;
    _renderLabeledBar(ctx, leftX, row2Y, 'HULL', player.hullCurrent, player.hullMax, color, LEFT_BAR_W, STRIP_BAR_H, SEG, ARMOR_LBL_W);
  }

  // CENTER: Throttle pips (row1) + Fuel bar (row2)
  {
    const current       = player.throttleLevel;
    const throttleStart = ctrX + (CTR_W - THROT_W) / 2;

    ctx.font = '11px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    for (let i = 0; i < levels; i++) {
      const x      = throttleStart + i * (PIP_W + PIP_GAP);
      const active = i === current;

      ctx.strokeStyle = active ? CYAN : DIM_OUTLINE;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.rect(x, row1Y, PIP_W, STRIP_BAR_H);
      ctx.stroke();

      if (active) {
        ctx.fillStyle = CYAN;
        ctx.fillRect(x + 1, row1Y + 1, PIP_W - 2, STRIP_BAR_H - 2);
      }

      ctx.fillStyle = active ? '#000000' : DIM_OUTLINE;
      ctx.fillText(THROTTLE_LABELS[i], x + PIP_W / 2, row1Y + STRIP_BAR_H / 2);
    }
  }

  // Fuel bar
  {
    const fuelRatio = game.fuelMax > 0 ? game.fuel / game.fuelMax : 0;
    const fuelColor = fuelRatio < 0.25 ? RED : AMBER;
    _renderLabeledBar(ctx, ctrX, row2Y, 'FUEL', game.fuel, game.fuelMax, fuelColor, FUEL_BAR_W, STRIP_BAR_H, SEG, FUEL_LBL_W);

    if (game.fuelBurnRate > 0) {
      const fuelBarX = ctrX + FUEL_LBL_W;
      ctx.font = '9px monospace';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillStyle = fuelColor;
      ctx.globalAlpha = 0.55;
      ctx.fillText(`-${game.fuelBurnRate.toFixed(3)}/s`, fuelBarX + FUEL_BAR_W + 6, row2Y + STRIP_BAR_H + 2);
      ctx.globalAlpha = 1;
    }
  }

  // RIGHT: Power (row1) + Cargo + Scrap (row2)
  {
    const rightEdge = rightX + RIGHT_W;
    const cargoNumEnd = rightEdge - SCRAP_W;
    const cargoBarEnd = cargoNumEnd - CARGO_NUM_W;
    const cargoBarX   = cargoBarEnd - CARGO_BAR_W;
    const cargoLblX   = cargoBarX - CARGO_LBL_W;

    // POWER readout
    {
      const reactorNet  = game.reactorOutput - game.reactorDraw;
      const pwrNetColor = reactorNet >= 0 ? GREEN : RED;
      const outStr      = `+${game.reactorOutput}W`;
      const netStr      = ` [${reactorNet >= 0 ? '+' : ''}${reactorNet}W]`;

      ctx.font = '11px monospace';
      ctx.textBaseline = 'middle';
      ctx.textAlign = 'left';

      ctx.fillStyle = DIM_TEXT;
      ctx.fillText('PWR ', cargoLblX, row1Y + STRIP_BAR_H / 2);
      const pwrLblW = ctx.measureText('PWR ').width;

      ctx.fillStyle = GREEN;
      ctx.fillText(outStr, cargoLblX + pwrLblW, row1Y + STRIP_BAR_H / 2);
      const outW = ctx.measureText(outStr).width;

      ctx.fillStyle = pwrNetColor;
      ctx.fillText(netStr, cargoLblX + pwrLblW + outW, row1Y + STRIP_BAR_H / 2);

      const overdueReactors = (player.moduleSlots || []).filter(m => m?.isOverdue);
      if (overdueReactors.length > 0) {
        ctx.font = 'bold 9px monospace';
        ctx.fillStyle = Math.floor(now / 500) % 2 === 0 ? MAGENTA : RED;
        ctx.fillText('! OVERHAUL', cargoLblX, row1Y - 4);
      }
    }

    // CARGO bar
    const cargoUsed  = game.totalCargoUsed;
    const cargoCap   = game.totalCargoCapacity;
    const cargoColor = cargoUsed >= cargoCap ? RED : BLUE;
    _renderLabeledBar(ctx, cargoLblX, row2Y, 'CARGO', cargoUsed, cargoCap, cargoColor, CARGO_BAR_W, STRIP_BAR_H, SEG, CARGO_LBL_W);

    // SCRAP count
    ctx.font = 'bold 13px monospace';
    ctx.textAlign = 'left';
    ctx.fillStyle = AMBER;
    ctx.fillText(`\u2699 ${game.scrap}`, cargoNumEnd + 6, row2Y + STRIP_BAR_H / 2);
  }

  ctx.restore();
}

function _renderLabeledBar(ctx, x, y, label, current, max, color, barW, barH, segments, labelW) {
  const ratio = max > 0 ? current / max : 0;
  const filled = Math.ceil(ratio * segments);
  const barX = x + labelW;

  ctx.font = '12px monospace';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = color;
  ctx.fillText(label, x, y + barH / 2);

  ctx.strokeStyle = color;
  ctx.lineWidth = 1;
  ctx.strokeRect(barX - 1, y - 1, barW + 2, barH + 2);
  ctx.fillStyle = BAR_TRACK;
  ctx.fillRect(barX, y, barW, barH);
  _drawSegBar(ctx, barX, y, barW, barH, filled, segments, color);

  ctx.font = '10px monospace';
  ctx.textAlign = 'left';
  ctx.fillStyle = color;
  ctx.fillText(
    `${Math.floor(current)}/${Math.floor(max)}`,
    barX + barW + 6, y + barH / 2
  );
}

function _drawSegBar(ctx, x, y, w, h, filled, total, color) {
  const segW = w / total;
  for (let i = 0; i < total; i++) {
    if (i < filled) {
      ctx.fillStyle = color;
      ctx.fillRect(x + i * segW + 1, y + 1, segW - 2, h - 2);
    }
  }
}
