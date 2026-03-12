import { renderMinimap } from './hud/minimap.js';
import { renderBottomStrip } from './hud/bottomStrip.js';
import { renderWeaponPanels, renderThrottle } from './hud/shipAnchored.js';
import {
  renderPauseIcon, renderDockPrompt, renderRepairPrompt,
  renderSalvageBar, renderRepairBar, renderAutoFireIndicator,
  renderDevControls, renderPanModeBanner,
} from './hud/prompts.js';

const PICKUP_ABOVE = 90;

export class HUD {
  constructor() {
    this._pickupTexts = [];
    this._killLog = [];

    this._killLogEl = document.getElementById('hud-kill-log');
    this._pickupEl = document.getElementById('hud-pickup-container');
  }

  addPickupText(text, worldX, worldY, colorHint = null) {
    this._pickupTexts.push({ text, worldX, worldY, createdAt: Date.now(), colorHint });

    if (this._pickupEl) {
      const cls = colorHint && ['breach', 'repair', 'hostile', 'module', 'cargo'].includes(colorHint)
        ? `pickup-${colorHint}` : 'pickup-default';
      const el = document.createElement('div');
      el.className = `hud-pickup-entry ${cls}`;
      el.textContent = text;
      el.addEventListener('animationend', () => el.remove());
      this._pickupEl.appendChild(el);
    }
  }

  addKill(displayName) {
    this._killLog.unshift({ text: `${displayName} destroyed`, createdAt: Date.now() });
    if (this._killLog.length > 5) this._killLog.length = 5;

    if (this._killLogEl) {
      const el = document.createElement('div');
      el.className = 'hud-kill-entry';
      el.textContent = `${displayName} destroyed`;
      el.addEventListener('animationend', () => el.remove());
      this._killLogEl.appendChild(el);
    }
  }

  render(ctx, game) {
    const { player, camera } = game;
    if (!player) return;

    renderMinimap(ctx, game);
    renderWeaponPanels(ctx, game);
    renderThrottle(ctx, player, camera);
    renderBottomStrip(ctx, game);

    if (game.isPaused) renderPauseIcon(ctx, camera);
    renderDockPrompt(ctx, game);
    renderRepairPrompt(ctx, game);
    renderSalvageBar(ctx, game);
    renderRepairBar(ctx, game);

    this._updatePickupPosition(game);
    renderAutoFireIndicator(ctx, game);

    if (game.isTestMode && !game.isEditorMode) {
      renderDevControls(ctx, game);
      if (game.isPanMode) renderPanModeBanner(ctx, game);
    }

    if (game.shipScreen) game.shipScreen.render(ctx, game);
  }

  _updatePickupPosition(game) {
    if (!this._pickupEl) return;
    const { camera, player } = game;
    const shipScreen = camera.worldToScreen(player.x, player.y);
    this._pickupEl.style.transform = `translate(${shipScreen.x}px, ${shipScreen.y - PICKUP_ABOVE}px)`;
  }
}
