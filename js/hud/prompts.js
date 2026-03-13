import {
  CYAN, AMBER, GREEN, RED, MAGENTA,
  BAR_TRACK, DIM_TEXT,
  CONDITION_FAULTY,
} from '../rendering/colors.js';

const BMARGIN = 32;

export function renderPauseIcon(ctx, camera) {
  const flash = Math.sin(Date.now() * 0.006) > 0;
  if (!flash) return;
  ctx.save();
  ctx.font = 'bold 13px monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'bottom';
  ctx.fillStyle = AMBER;
  ctx.fillText('II  PAUSED', camera.width / 2, camera.height * 0.55);
  ctx.restore();
}

export function renderDockPrompt(ctx, game) {
  if (!game.nearbyStation || game.salvage.isSalvaging) return;
  const { camera } = game;
  const alpha   = 0.6 + Math.sin(Date.now() * 0.004) * 0.4;
  const promptY = camera.height * 0.62;
  ctx.save();
  ctx.font = '14px monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'bottom';
  ctx.globalAlpha = alpha;
  ctx.fillStyle = GREEN;
  ctx.fillText(`Press E to dock at ${game.nearbyStation.name}`, camera.width / 2, promptY);
  ctx.globalAlpha = 1;
  ctx.restore();
}

export function renderRepairPrompt(ctx, game) {
  const { player, camera } = game;
  if (game.salvage.isSalvaging || game.repair.isRepairing || game.isDocked) return;
  if (!player || player.throttleLevel !== 0) return;

  const armorNeeded   = player.armorCurrent < player.armorMax;
  const modulesNeeded = game.repair.hasModulesToRepair(player);
  if ((!armorNeeded && !modulesNeeded) || game.scrap <= 0) return;

  const alpha   = 0.6 + Math.sin(Date.now() * 0.005) * 0.4;
  const promptY = camera.height * 0.62;
  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'bottom';
  ctx.globalAlpha = alpha;
  ctx.font = '14px monospace';
  ctx.fillStyle = GREEN;
  const costs = [];
  if (armorNeeded)   costs.push('1 scrap/pt');
  if (modulesNeeded) costs.push('15 scrap/step');
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
  ctx.font = 'bold 13px monospace';
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
  const barW     = 220;
  const barH     = 16;
  const segCount = 10;
  const x        = (camera.width - barW) / 2;
  let   yOffset  = camera.height * 0.70;

  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'bottom';

  const hasModules = game.repair.hasModulesToRepair(player);
  if (hasModules) {
    const modAccum = game.repair._moduleRepairAccum ?? 0;
    ctx.font = 'bold 13px monospace';
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
    ctx.font = 'bold 13px monospace';
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

export function renderAutoFireIndicator(ctx, game) {
  if (!game.autoFireMode) return;
  const pulse = 0.75 + Math.sin(Date.now() * 0.008) * 0.25;
  ctx.save();
  ctx.font = 'bold 11px monospace';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillStyle = RED;
  ctx.globalAlpha = pulse;
  ctx.fillText('AUTO-FIRE', BMARGIN, BMARGIN);
  ctx.globalAlpha = 1;
  ctx.restore();
}

export function renderDevControls(ctx, game) {
  const { camera, player } = game;
  const MM_MARGIN = 24;
  const padding = 8;
  const lineH   = 14;
  const panelW  = 210;

  const panLine = game.isPanMode ? '?: exit pan mode  [PAN]' : '?: pan mode (WASD)';
  const aiLine  = game.aiDisabled ? 'V: enable AI  [AI FROZEN]' : 'V: freeze AI';

  const primaries   = player._primaryWeapons;
  const secondaries = player._secondaryWeapons;
  const priName = (primaries[player.primaryWeaponIdx]?.displayName || '—');
  const secName = (secondaries[player.secondaryWeaponIdx]?.displayName || '—');

  const lines = [
    'Z: spawn light fighter (stalker)',
    'X: spawn armed hauler (kiter)',
    'C: spawn salvage mothership (standoff)',
    '(spawns at mouse cursor)',
    '',
    'Q: toggle laser turret',
    aiLine,
    panLine,
    '',
    `PRI: [< 1  ${priName}  2 >]`,
    `SEC: [< 3  ${secName}  4 >]`,
  ];

  const panelH = padding + lines.length * lineH + padding;
  const ox     = camera.width - panelW - padding;
  const oy     = MM_MARGIN;

  ctx.save();
  ctx.fillStyle = 'rgba(0,8,20,0.82)';
  ctx.fillRect(ox, oy, panelW, panelH);
  ctx.strokeStyle = '#334455';
  ctx.lineWidth = 1;
  ctx.strokeRect(ox, oy, panelW, panelH);

  ctx.font = '10px monospace';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';

  for (let i = 0; i < lines.length; i++) {
    const y = oy + padding + i * lineH;
    if (lines[i] === '') continue;
    if (lines[i].startsWith('PRI:') || lines[i].startsWith('SEC:')) {
      ctx.fillStyle = CYAN;
    } else if (lines[i].startsWith('(')) {
      ctx.fillStyle = DIM_TEXT;
    } else if (lines[i].includes('[AI FROZEN]')) {
      ctx.fillStyle = MAGENTA;
    } else if (lines[i].includes('[PAN]')) {
      ctx.fillStyle = CYAN;
    } else {
      ctx.fillStyle = AMBER;
    }
    ctx.fillText(lines[i], ox + padding, y);
  }

  ctx.restore();
}

export function renderPanModeBanner(ctx, game) {
  const { camera } = game;
  ctx.save();
  ctx.font = 'bold 13px monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = CYAN;
  ctx.globalAlpha = 0.5 + Math.sin(Date.now() * 0.005) * 0.5;
  ctx.fillText('PAN MODE — WASD to pan  |  ? to return', camera.width / 2, 24);
  ctx.globalAlpha = 1;
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
