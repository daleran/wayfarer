import {
  AMBER, GREEN, RED, CYAN,
  BAR_TRACK,
  CONDITION_FAULTY,
} from '@/rendering/colors.js';
import { PROMPT } from '@/rendering/draw.js';
import { ENTITY } from '@data/enums.js';

export function renderPauseIcon(ctx, camera) {
  const flash = Math.sin(Date.now() * 0.006) > 0;
  if (!flash) return;
  ctx.save();
  ctx.font = PROMPT.font;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'bottom';
  ctx.fillStyle = AMBER;
  ctx.fillText('II  PAUSED', camera.width / 2, camera.height * 0.55);
  ctx.restore();
}

export function renderDockPrompt(ctx, game) {
  if (!game.nearbyStation || game.salvage.isSalvaging || game.isDocked) return;
  const { player, camera } = game;
  if (!player) return;
  const alpha   = 0.6 + Math.sin(Date.now() * 0.004) * 0.4;
  const promptY = camera.height * 0.62;
  const stopped = player.throttleLevel === 0 && player.speed < 1;
  ctx.save();
  ctx.font = PROMPT.font;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'bottom';
  ctx.globalAlpha = alpha;
  const isPlanet = game.nearbyStation.entityType === ENTITY.PLANET;
  if (stopped) {
    ctx.fillStyle = GREEN;
    const verb = isPlanet ? 'land on' : 'dock at';
    ctx.fillText(`Press E to ${verb} ${game.nearbyStation.name}`, camera.width / 2, promptY);
  } else {
    ctx.fillStyle = RED;
    ctx.fillText(isPlanet ? 'STOP TO LAND' : 'STOP TO DOCK', camera.width / 2, promptY);
  }
  ctx.globalAlpha = 1;
  ctx.restore();
}

export function renderRepairPrompt(ctx, game) {
  const { player, camera } = game;
  if (game.salvage.isSalvaging || game.repair.isRepairing || game.isDocked) return;
  if (!player || player.throttleLevel !== 0 || player.speed >= 1) return;

  const armorNeeded   = player.armorCurrent < player.armorMax;
  const modulesNeeded = game.repair.hasModulesToRepair(player);
  const hasEngBay     = player.capabilities.has_engineering_bay;
  const hullNeeded    = hasEngBay && player.hullCurrent < player.hullMax;
  if ((!armorNeeded && !modulesNeeded && !hullNeeded) || game.scrap <= 0) return;

  const alpha   = 0.6 + Math.sin(Date.now() * 0.005) * 0.4;
  const promptY = camera.height * 0.62;
  ctx.save();
  ctx.font = PROMPT.font;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'bottom';
  ctx.globalAlpha = alpha;
  ctx.fillStyle = GREEN;
  const costs = [];
  if (armorNeeded)   costs.push('1 scrap/pt');
  if (modulesNeeded) costs.push('15 scrap/step');
  if (hullNeeded)    costs.push('3 scrap/hull pt');
  ctx.fillText(`Press R to Repair  [${costs.join(' · ')}]`, camera.width / 2, promptY);
  ctx.globalAlpha = 1;
  ctx.restore();
}

export function renderSalvageBar(ctx, game) {
  if (!game.salvage.isSalvaging) return;
  const { camera } = game;
  const ratio    = game.salvage.salvageProgress / game.salvage.salvageTotal;
  const barW     = 220;
  const barH     = 16;
  const segCount = 10;
  const x        = (camera.width - barW) / 2;
  const y        = camera.height * 0.70;

  ctx.save();
  ctx.font = PROMPT.font;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'bottom';
  ctx.fillStyle = AMBER;
  ctx.fillText('SALVAGING...', camera.width / 2, y - 4);

  ctx.strokeStyle = AMBER;
  ctx.lineWidth = 1;
  ctx.strokeRect(x - 1, y - 1, barW + 2, barH + 2);
  ctx.fillStyle = BAR_TRACK;
  ctx.fillRect(x, y, barW, barH);
  _drawSegBar(ctx, x, y, barW, barH, Math.ceil(ratio * segCount), segCount, AMBER);
  ctx.restore();
}

export function renderRepairBar(ctx, game) {
  if (!game.repair.isRepairing) return;
  const { player, camera } = game;
  if (!player) return;
  const barW     = 220;
  const barH     = 16;
  const segCount = 10;
  const x        = (camera.width - barW) / 2;
  let   yOffset  = camera.height * 0.70;

  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'bottom';

  // Hull repair bar (Engineering Bay) — bottom-most
  const hasEngBay = player.capabilities.has_engineering_bay;
  if (hasEngBay && player.hullCurrent < player.hullMax) {
    const hullAccum = game.repair._hullRepairAccum ?? 0;
    ctx.font = PROMPT.font;
    ctx.fillStyle = CYAN;
    ctx.fillText('HULL REPAIR...', camera.width / 2, yOffset - 4);

    ctx.strokeStyle = CYAN;
    ctx.lineWidth = 1;
    ctx.strokeRect(x - 1, yOffset - 1, barW + 2, barH + 2);
    ctx.fillStyle = BAR_TRACK;
    ctx.fillRect(x, yOffset, barW, barH);
    ctx.fillStyle = CYAN;
    ctx.fillRect(x, yOffset, barW * hullAccum, barH);

    yOffset -= barH + 24;
  }

  const hasModules = game.repair.hasModulesToRepair(player);
  if (hasModules) {
    const modAccum = game.repair._moduleRepairAccum ?? 0;
    ctx.font = PROMPT.font;
    ctx.fillStyle = CONDITION_FAULTY;
    ctx.fillText('MODULE REPAIR...', camera.width / 2, yOffset - 4);

    ctx.strokeStyle = CONDITION_FAULTY;
    ctx.lineWidth = 1;
    ctx.strokeRect(x - 1, yOffset - 1, barW + 2, barH + 2);
    ctx.fillStyle = BAR_TRACK;
    ctx.fillRect(x, yOffset, barW, barH);
    ctx.fillStyle = CONDITION_FAULTY;
    ctx.fillRect(x, yOffset, barW * modAccum, barH);

    yOffset -= barH + 24;
  }

  if (player.armorCurrent < player.armorMax) {
    const ratio = player.armorCurrent / player.armorMax;
    ctx.font = PROMPT.font;
    ctx.fillStyle = GREEN;
    ctx.fillText('REPAIRING...', camera.width / 2, yOffset - 4);

    ctx.strokeStyle = GREEN;
    ctx.lineWidth = 1;
    ctx.strokeRect(x - 1, yOffset - 1, barW + 2, barH + 2);
    ctx.fillStyle = BAR_TRACK;
    ctx.fillRect(x, yOffset, barW, barH);
    _drawSegBar(ctx, x, yOffset, barW, barH, Math.ceil(ratio * segCount), segCount, GREEN);
  }

  ctx.restore();
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
