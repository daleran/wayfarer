// NarrativePanel — Disco Elysium-style scrolling narrative log panel.
// Replaces LocationOverlay. Same external API (open/close/update/handleInput/visible).

import { NarrativeLog } from './narrativeLog.js';
import { CONTENT } from '@data/index.js';

const CONVERSATIONS = CONTENT.conversations;
import { FACTION, standingColor } from '@/rendering/colors.js';

export class NarrativePanel {
  constructor() {
    this.visible = false;
    this._station = null;
    this._game = null;
    this._el = document.getElementById('narrative-panel');
    this._logEl = null;
    this._choicesEl = null;
    this._log = null;

    /** @type {AbortController | null} */
    this._abortController = null;

    this._buildDOM();
  }

  /** @private */
  _buildDOM() {
    this._el.innerHTML = `
      <div class="np-header">
        <span class="np-title"></span>
        <span class="np-faction"></span>
        <span class="np-standing"></span>
        <span class="np-scrap"></span>
        <span class="np-esc-hint">[Esc]</span>
      </div>
      <div class="np-log"></div>
      <div class="np-choices hidden"></div>
    `;
    this._logEl = this._el.querySelector('.np-log');
    this._choicesEl = this._el.querySelector('.np-choices');
    this._log = new NarrativeLog(this._logEl, this._choicesEl);

    // Prevent clicks from bleeding to canvas
    this._el.addEventListener('mousedown', (e) => e.stopPropagation());
    this._el.addEventListener('click', (e) => e.stopPropagation());
  }

  open(station, game) {
    this._station = station;
    this._game = game;
    this.visible = true;
    this._el.classList.remove('hidden');

    if (game?.camera) {
      game.camera.pushZoom(4.0);
      game.camera.panTo(station.x, station.y);
    }

    this._updateHeader();
    this._log.clear();

    // Start the hub conversation
    this._runHub();
  }

  close() {
    // Cancel running conversation
    if (this._abortController) {
      this._abortController.abort();
      this._abortController = null;
    }
    this._log.cancelChoices();
    this._log.clearNpcContext();

    if (this._game?.camera) {
      this._game.camera.popZoom();
      this._game.camera.clearPan();
    }
    this.visible = false;
    this._el.classList.add('hidden');
    this._log.clear();
    this._station = null;
    this._game = null;
  }

  update(_dt, _game) {
    if (!this.visible) return;
    this._updateHeader();
  }

  handleInput(input, _game) {
    if (!this.visible) return;
    if (input.wasJustPressed('escape')) {
      this.close();
    }
  }

  // ── Header ─────────────────────────────────────────────────────────────────

  /** @private */
  _updateHeader() {
    const station = this._station;
    if (!station) return;

    const titleEl = /** @type {HTMLElement} */ (this._el.querySelector('.np-title'));
    const factionEl = /** @type {HTMLElement} */ (this._el.querySelector('.np-faction'));
    const standingEl = /** @type {HTMLElement} */ (this._el.querySelector('.np-standing'));
    const scrapEl = /** @type {HTMLElement} */ (this._el.querySelector('.np-scrap'));

    titleEl.textContent = station.name;

    if (station.faction) {
      factionEl.style.color = FACTION[station.faction] ?? FACTION.neutral;
      factionEl.textContent = `[${station.faction.toUpperCase()}]`;
    } else {
      factionEl.textContent = '';
    }

    if (this._game?.reputation && station.reputationFaction) {
      const level = this._game.reputation.getLevel(station.reputationFaction);
      const standing = this._game.reputation.getStanding(station.reputationFaction);
      const sign = standing >= 0 ? '+' : '';
      standingEl.style.color = standingColor(level);
      standingEl.textContent = `${level.toUpperCase()} [${sign}${standing}]`;
    } else {
      standingEl.textContent = '';
    }

    scrapEl.textContent = `Scrap: ${this._game?.scrap ?? 0}`;
  }

  // ── Conversation runner ────────────────────────────────────────────────────

  /** @private */
  async _runHub() {
    const station = this._station;
    if (!station) return;

    const hubId = station.conversations?.hub ?? 'genericHub';
    const fn = CONVERSATIONS[hubId];
    if (!fn) {
      this._log.narrate(`[No conversation found: ${hubId}]`, 'system');
      return;
    }

    this._abortController = new AbortController();
    const signal = this._abortController.signal;

    const ctx = {
      game: this._game,
      station,
      log: this._log,
      signal,
      runZone: (zoneId) => this._runZone(zoneId),
    };

    try {
      await fn(ctx);
    } catch (e) {
      if (e.name !== 'AbortError') throw e;
    }

    // Hub returned — conversation is done, close panel
    if (this.visible) this.close();
  }

  /** @private */
  async _runZone(zoneId) {
    const station = this._station;
    if (!station) return;

    // Pan camera to zone's world position
    const zone = station.layout?.zones?.find(z => z.id === zoneId);
    if (zone?.worldOffset && this._game?.camera) {
      this._game.camera.panTo(
        station.x + zone.worldOffset.x,
        station.y + zone.worldOffset.y,
      );
    }

    const convId = station.conversations?.zones?.[zoneId] ?? `generic_${zoneId}`;
    const fn = CONVERSATIONS[convId];

    if (!fn) {
      // Fallback: try genericDock
      const fallback = CONVERSATIONS.genericDock;
      if (fallback) {
        await fallback({
          game: this._game,
          station,
          log: this._log,
          signal: this._abortController?.signal,
          zoneId,
        });
      } else {
        this._log.narrate(`[No conversation found: ${convId}]`, 'system');
      }
      // Pan back to station center
      this._panToStation();
      return;
    }

    await fn({
      game: this._game,
      station,
      log: this._log,
      signal: this._abortController?.signal,
      zoneId,
    });

    // Pan back to station center
    this._panToStation();
  }

  /** @private Pan camera back to station center. */
  _panToStation() {
    if (this._station && this._game?.camera) {
      this._game.camera.panTo(this._station.x, this._station.y);
    }
  }
}
