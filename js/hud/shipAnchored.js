import {
  CYAN, AMBER, GREEN, RED, WHITE, MAGENTA,
  VERY_DIM, DIM_TEXT,
  CONDITION_FAULTY,
} from '../ui/colors.js';

const GUIDANCE_LABELS = { dumbfire: 'DUMB', wire: 'WIRE', heat: 'HEAT' };
const THROTTLE_LABELS = ['STOP', '1/4', '1/2', '3/4', 'FULL', 'FLANK'];
const THROTTLE_BELOW_OFFSET = 55;
const WEAPON_PANEL_GAP      = 38;

export function renderWeaponPanels(ctx, game) {
  const { player, camera } = game;
  const shipScreen = camera.worldToScreen(player.x, player.y);
  const panelY     = shipScreen.y - 11;

  const priRightX = shipScreen.x - WEAPON_PANEL_GAP;
  const secLeftX  = shipScreen.x + WEAPON_PANEL_GAP;

  const primaries   = player._primaryWeapons;
  const secondaries = player._secondaryWeapons;
  const activePri   = primaries[player.primaryWeaponIdx];
  const activeSec   = secondaries[player.secondaryWeaponIdx];

  ctx.save();
  if (activePri) _renderWeaponPanel(ctx, activePri, 'pri', priRightX, panelY, game.ammo);
  if (activeSec) _renderWeaponPanel(ctx, activeSec, 'sec', secLeftX, panelY, game.ammo);
  ctx.restore();
}

export function renderThrottle(ctx, player, camera) {
  const shipScreen = camera.worldToScreen(player.x, player.y);
  const speed      = Math.round(player.speed);
  const label      = THROTTLE_LABELS[player.throttleLevel];
  const now        = Date.now();

  ctx.save();

  ctx.font = '9px monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.fillStyle = CYAN;
  ctx.globalAlpha = 0.5;
  ctx.fillText(`${label}  ${speed} U/S`, shipScreen.x, shipScreen.y + THROTTLE_BELOW_OFFSET);
  ctx.globalAlpha = 1;

  const intY    = shipScreen.y + THROTTLE_BELOW_OFFSET + 24;
  const sysList = [
    { label: 'R', val: player.reactorIntegrity },
    { label: 'E', val: player.engineIntegrity  },
    { label: 'S', val: player.sensorIntegrity  },
  ];
  ctx.font = '10px monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const intStartX = shipScreen.x - 26;
  for (let i = 0; i < sysList.length; i++) {
    const ratio   = sysList[i].val / 100;
    const flicker = ratio < 0.25 && Math.floor(now / 300) % 2 === 0;
    const color   = flicker      ? VERY_DIM
                  : ratio < 0.25 ? RED
                  : ratio < 0.5  ? CONDITION_FAULTY
                  : ratio < 0.75 ? AMBER
                  : DIM_TEXT;
    ctx.fillStyle = color;
    ctx.fillText(`[${sysList[i].label}]`, intStartX + i * 26, intY);
  }

  ctx.restore();
}

function _renderWeaponPanel(ctx, weapon, type, panelX, panelY, ammoReserve) {
  const isPri     = type === 'pri';
  const nameColor = isPri ? CYAN : MAGENTA;

  const rawName = weapon.displayName || weapon.constructor.name.toUpperCase();
  const name    = rawName.replace(/\s*\[.*?\]$/, '').trim();

  let modeTag = '';
  if (weapon.currentAmmoMode)   modeTag = `[${weapon.currentAmmoMode.toUpperCase()}]`;
  else if (weapon.guidanceMode) modeTag = `[${(GUIDANCE_LABELS[weapon.guidanceMode] ?? weapon.guidanceMode).toUpperCase()}]`;
  else if (weapon.isBeam)       modeTag = '[BEAM]';

  const BAR_W = 40;
  const BAR_H = 5;
  const barY  = panelY + 13;

  ctx.font = '9px monospace';
  ctx.textBaseline = 'top';
  ctx.globalAlpha = 0.65;

  if (isPri) {
    const typeLabel = type.toUpperCase();
    const typeLblW  = ctx.measureText(typeLabel).width;
    const nameTextW = ctx.measureText(name).width;

    ctx.textAlign = 'right';

    ctx.fillStyle = DIM_TEXT;
    ctx.fillText(typeLabel, panelX, panelY);

    ctx.fillStyle = nameColor;
    ctx.fillText(name, panelX - typeLblW - 6, panelY);

    if (modeTag) {
      ctx.fillStyle = nameColor;
      ctx.fillText(modeTag, panelX - typeLblW - 6 - nameTextW - 4, panelY);
    }

    const barX = panelX - BAR_W;
    _fillWeaponBar(ctx, weapon, barX, barY, BAR_W, BAR_H, nameColor);

    if (weapon.ammo !== undefined) {
      const cargo   = ammoReserve[weapon.ammoType] ?? 0;
      ctx.font = '9px monospace';
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = weapon._reloadTimer > 0 ? AMBER : (weapon.ammo > 0 ? nameColor : RED);
      ctx.fillText(`${weapon.ammo}/${cargo}`, barX - 4, barY + BAR_H / 2);
    }

  } else {
    const typeW = ctx.measureText(type.toUpperCase()).width + 6;
    const nameW = modeTag ? ctx.measureText(name).width + 4 : 0;

    ctx.textAlign = 'left';

    ctx.fillStyle = DIM_TEXT;
    ctx.fillText(type.toUpperCase(), panelX, panelY);
    ctx.fillStyle = nameColor;
    ctx.fillText(name, panelX + typeW, panelY);
    if (modeTag) {
      ctx.fillStyle = nameColor;
      ctx.fillText(modeTag, panelX + typeW + nameW, panelY);
    }

    _fillWeaponBar(ctx, weapon, panelX, barY, BAR_W, BAR_H, nameColor);

    if (weapon.ammo !== undefined) {
      const cargo   = ammoReserve[weapon.ammoType] ?? 0;
      ctx.font = '9px monospace';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = weapon._reloadTimer > 0 ? AMBER : (weapon.ammo > 0 ? nameColor : RED);
      ctx.fillText(`${weapon.ammo}/${cargo}`, panelX + BAR_W + 4, barY + BAR_H / 2);
    }
  }

  ctx.globalAlpha = 1;
}

function _fillWeaponBar(ctx, weapon, barX, barY, BAR_W, BAR_H, nameColor) {
  ctx.fillStyle = VERY_DIM;
  ctx.fillRect(barX, barY, BAR_W, BAR_H);

  if (weapon.isBeam) {
    const t = Math.min((weapon._rampUp || 0) / (weapon.rampTime || 1), 1);
    if (weapon._overheated) {
      const cdProg = 1 - (weapon._cooldownTimer || 0) / (weapon.cooldownTime || 1);
      ctx.fillStyle = RED;
      ctx.fillRect(barX, barY, BAR_W * cdProg, BAR_H);
    } else {
      const burnFrac = (weapon._fullPowerTimer || 0) / (weapon.overheatLimit || 5);
      ctx.fillStyle = t >= 1
        ? (burnFrac > 0.6 ? RED : burnFrac > 0.3 ? AMBER : WHITE)
        : nameColor;
      ctx.fillRect(barX, barY, BAR_W * t, BAR_H);
    }
  } else {
    const reloading = weapon._reloadTimer > 0;
    if (reloading) {
      const progress = 1 - weapon._reloadTimer / (weapon.reloadTime || 1);
      ctx.fillStyle = AMBER;
      ctx.fillRect(barX, barY, BAR_W * progress, BAR_H);
    } else {
      const cdMax  = weapon.cooldownMax ?? 0;
      const filled = cdMax > 0 ? Math.max(0, 1 - (weapon._cooldown || 0) / cdMax) : 1;
      ctx.fillStyle = filled >= 1 ? nameColor : AMBER;
      ctx.fillRect(barX, barY, BAR_W * filled, BAR_H);
    }
  }
}
