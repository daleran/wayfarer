import {
  CYAN, AMBER, RED, MAGENTA, WHITE,
  VERY_DIM,
} from '@/rendering/colors.js';
import { LABEL } from '@/rendering/draw.js';
import { input } from '@/input.js';
import { AMMO } from '@data/index.js';
const THROTTLE_BELOW_OFFSET = 55;
const THROTTLE_LABELS = ['STOP', '1/4', '1/2', '3/4', 'FULL', 'FLANK'];

export function renderThrottle(ctx, game) {
  const { player, camera } = game;
  if (!player) return;
  const screen = camera.worldToScreen(player.x, player.y);
  const label = THROTTLE_LABELS[player.throttleLevel ?? 0];
  const speed = Math.floor(player.speed);

  ctx.save();
  ctx.font = LABEL.font;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.globalAlpha = LABEL.alpha;
  ctx.fillStyle = (player.throttleLevel ?? 0) === 5 ? RED : CYAN;
  ctx.fillText(`[${label}]  ${speed} U/S`, screen.x, screen.y + THROTTLE_BELOW_OFFSET);
  ctx.restore();
}

const CURSOR_GAP   = 22;
const CURSOR_BAR_W = 3;
const CURSOR_BAR_H = 24;

export function renderCursorWeapons(ctx, game) {
  if (!game.combatMode) return;
  const { player } = game;
  if (!player) return;
  const mx = input.mouseScreen.x;
  const my = input.mouseScreen.y;

  const activePri = player._primaryWeapons[player.primaryWeaponIdx];
  const activeSec = player._secondaryWeapons[player.secondaryWeaponIdx];

  ctx.save();
  ctx.globalAlpha = 0.55;

  if (activePri) _renderCursorSide(ctx, activePri, mx - CURSOR_GAP, my, 'left', CYAN);
  if (activeSec) _renderCursorSide(ctx, activeSec, mx + CURSOR_GAP, my, 'right', MAGENTA);

  ctx.restore();
}

function _renderCursorSide(ctx, weapon, x, y, side, color) {
  const isLeft = side === 'left';
  const barX = isLeft ? x - CURSOR_BAR_W : x;
  const barY = y - CURSOR_BAR_H / 2;

  // Vertical cooldown/reload bar (fills bottom-to-top)
  _fillWeaponBarV(ctx, weapon, barX, barY, CURSOR_BAR_W, CURSOR_BAR_H, color);

  // Ammo type + count on the outside, vertically centered
  ctx.font = LABEL.font;
  ctx.textAlign = isLeft ? 'right' : 'left';
  const textX = isLeft ? barX - 4 : barX + CURSOR_BAR_W + 4;
  const centerY = barY + CURSOR_BAR_H / 2;

  if (weapon.ammo !== undefined) {
    // Ammo type on top
    let modeLabel = '';
    if (weapon.currentAmmoId) {
      modeLabel = AMMO[weapon.currentAmmoId]?.tag || '';
    } else if (weapon.isBeam) {
      modeLabel = 'BEAM';
    }
    if (modeLabel) {
      ctx.fillStyle = color;
      ctx.textBaseline = 'bottom';
      ctx.fillText(modeLabel, textX, centerY - 1);
    }

    // Magazine count on bottom
    ctx.fillStyle = weapon._reloadTimer > 0 ? AMBER : (weapon.ammo > 0 ? color : RED);
    ctx.textBaseline = 'top';
    ctx.fillText(`${weapon.ammo}`, textX, centerY + 1);
  }
}

function _fillWeaponBarV(ctx, weapon, barX, barY, BAR_W, BAR_H, nameColor) {
  ctx.fillStyle = VERY_DIM;
  ctx.fillRect(barX, barY, BAR_W, BAR_H);

  if (weapon.isBeam) {
    const t = Math.min((weapon._rampUp || 0) / (weapon.rampTime || 1), 1);
    if (weapon._overheated) {
      const cdProg = 1 - (weapon._cooldownTimer || 0) / (weapon.cooldownTime || 1);
      ctx.fillStyle = RED;
      ctx.fillRect(barX, barY + BAR_H * (1 - cdProg), BAR_W, BAR_H * cdProg);
    } else {
      const burnFrac = (weapon._fullPowerTimer || 0) / (weapon.overheatLimit || 5);
      ctx.fillStyle = t >= 1
        ? (burnFrac > 0.6 ? RED : burnFrac > 0.3 ? AMBER : WHITE)
        : nameColor;
      ctx.fillRect(barX, barY + BAR_H * (1 - t), BAR_W, BAR_H * t);
    }
  } else {
    const reloading = weapon._reloadTimer > 0;
    if (reloading) {
      const progress = 1 - weapon._reloadTimer / (weapon.reloadTime || 1);
      ctx.fillStyle = AMBER;
      ctx.fillRect(barX, barY + BAR_H * (1 - progress), BAR_W, BAR_H * progress);
    } else {
      const cdMax  = weapon.cooldownMax ?? 0;
      const filled = cdMax > 0 ? Math.max(0, 1 - (weapon._cooldown || 0) / cdMax) : 1;
      ctx.fillStyle = filled >= 1 ? nameColor : AMBER;
      ctx.fillRect(barX, barY + BAR_H * (1 - filled), BAR_W, BAR_H * filled);
    }
  }
}

