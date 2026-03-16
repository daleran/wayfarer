// EditorPanels — DOM-based panels for the editor overlay.
// Replaces canvas-rendered sidebars, HUD bar, and pan banner.

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Block canvas input bleed */
function _stopBleed(el) {
  el.addEventListener('mousedown', e => e.stopPropagation());
  el.addEventListener('wheel', e => e.stopPropagation());
}

const HIDDEN = 'editor-hidden';

// ── EditorHUDBar ──────────────────────────────────────────────────────────────

export class EditorHUDBar {
  constructor() {
    this._el = /** @type {HTMLElement} */ (document.getElementById('editor-hud-bar'));
    _stopBleed(this._el);
    this._shown = false;
  }

  /** @param {Array<{ text: string, active: boolean, color?: string }>} segments */
  update(segments) {
    if (!this._shown) {
      this._el.classList.remove(HIDDEN);
      this._shown = true;
    }

    // Rebuild spans
    let html = '';
    for (const seg of segments) {
      const cls = seg.active ? 'edt-seg active' : 'edt-seg';
      const style = seg.color ? ` style="color:${seg.color}"` : '';
      html += `<span class="${cls}"${style}>${seg.text}</span>`;
    }
    this._el.innerHTML = html;
  }
}

// ── EditorSidebar ─────────────────────────────────────────────────────────────

export class EditorSidebar {
  constructor() {
    this._el = /** @type {HTMLElement} */ (document.getElementById('editor-sidebar'));
    _stopBleed(this._el);
    this._prevKey = '';
  }

  show() { this._el.classList.remove(HIDDEN); }
  hide() { this._el.classList.add(HIDDEN); this._prevKey = ''; }

  /**
   * @param {Array<{ label: string, items: Array<*> }>} barItems
   * @param {number} catIdx
   * @param {number} itemIdx
   */
  update(barItems, catIdx, itemIdx) {
    const cat = barItems[catIdx];
    const items = cat.items;
    const key = `${catIdx}:${itemIdx}`;
    if (key === this._prevKey) return;
    this._prevKey = key;

    let html = '';

    // Category header
    html += `<div class="edt-cat-hint">\u2190/\u2192 CATEGORY</div>`;
    html += `<div class="edt-cat-label cyan">${cat.label}</div>`;

    // Category dots
    html += '<div class="edt-dots">';
    for (let i = 0; i < barItems.length; i++) {
      html += `<div class="edt-dot${i === catIdx ? ' active' : ''}"></div>`;
    }
    html += '</div>';

    // Divider
    html += '<div class="edt-divider"></div>';

    // Item list
    html += '<div class="edt-list">';
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const sel = i === itemIdx ? ' selected' : '';
      const dotHtml = item.faction
        ? `<span class="edt-faction-dot" style="background:${_factionColor(item.faction)}"></span>`
        : '';
      html += `<div class="edt-item${sel}" data-idx="${i}">${_esc(item.label)}${dotHtml}</div>`;
    }
    html += '</div>';

    // Footer
    const selItem = items[itemIdx];
    html += '<div class="edt-footer">';
    if (selItem) {
      html += `<div class="edt-footer-stats">${_esc(selItem.stats ?? '')}</div>`;
    }
    html += `<div class="edt-footer-hint">\u2191/\u2193 select &nbsp; Alt: place<br>Bksp: open in designer</div>`;
    html += '</div>';

    this._el.innerHTML = html;

    // Scroll selected into view
    const list = this._el.querySelector('.edt-list');
    const selected = list?.querySelector('.edt-item.selected');
    if (selected && list) {
      selected.scrollIntoView({ block: 'nearest' });
    }
  }
}

// ── EditorItemMenu ────────────────────────────────────────────────────────────

export class EditorItemMenu {
  constructor() {
    this._el = /** @type {HTMLElement} */ (document.getElementById('editor-item-menu'));
    _stopBleed(this._el);
    this._prevKey = '';
  }

  show() { this._el.classList.remove(HIDDEN); }
  hide() { this._el.classList.add(HIDDEN); this._prevKey = ''; }

  /**
   * @param {Array<{ label: string, items: Array<*> }>} cats
   * @param {number} catIdx
   * @param {number} selIdx
   * @param {number} flash  - seconds remaining for flash effect
   * @param {{ scrap: number, fuel: number, fuelMax: number, modules: Array<*>, weapons: Array<*> }} inventory
   */
  update(cats, catIdx, selIdx, flash, inventory) {
    const cat = cats[catIdx];
    const items = cat.items;
    const flashActive = flash > 0;
    const key = `${catIdx}:${selIdx}:${flashActive ? 'f' : ''}`;
    if (key === this._prevKey) return;
    this._prevKey = key;

    let html = '';

    // Category header
    html += `<div class="edt-cat-hint">\u2190/\u2192 CATEGORY</div>`;
    html += `<div class="edt-cat-label amber">${_esc(cat.label)}</div>`;

    // Category dots
    html += '<div class="edt-dots">';
    for (let i = 0; i < cats.length; i++) {
      html += `<div class="edt-dot${i === catIdx ? ' active amber' : ''}"></div>`;
    }
    html += '</div>';

    // Divider
    html += '<div class="edt-divider"></div>';

    // Item list
    html += '<div class="edt-list">';
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      let cls = 'edt-item';
      if (i === selIdx) {
        cls += ' selected amber-sel';
        if (flashActive) cls += ' flash';
      }
      html += `<div class="${cls}" data-idx="${i}">${_esc(item.label)}</div>`;
    }
    html += '</div>';

    // Footer
    const selItem = items[selIdx];
    html += '<div class="edt-footer">';
    if (selItem?.stats) {
      html += `<div class="edt-footer-stats">${_esc(selItem.stats)}</div>`;
    }
    html += `<div class="edt-footer-inv">SCRAP: ${inventory.scrap}  FUEL: ${Math.round(inventory.fuel)}/${inventory.fuelMax}<br>MODS: ${inventory.modules.length}  WPNS: ${inventory.weapons.length}</div>`;
    html += `<div class="edt-footer-hint">\u2191/\u2193 select &nbsp; Enter: add to cargo</div>`;
    html += '</div>';

    this._el.innerHTML = html;

    // Scroll selected into view
    const list = this._el.querySelector('.edt-list');
    const selected = list?.querySelector('.edt-item.selected');
    if (selected && list) {
      selected.scrollIntoView({ block: 'nearest' });
    }
  }
}

// ── EditorPanBanner ───────────────────────────────────────────────────────────

export class EditorPanBanner {
  constructor() {
    this._el = /** @type {HTMLElement} */ (document.getElementById('editor-pan-banner'));
    this._el.textContent = 'PAN MODE  \u2014  ` to exit  \u2014  scroll to zoom';
  }

  show() { this._el.classList.remove(HIDDEN); }
  hide() { this._el.classList.add(HIDDEN); }
}

// ── Private helpers ───────────────────────────────────────────────────────────

/** @param {string} faction */
function _factionColor(faction) {
  const map = { player: '#00ff66', neutral: '#ffaa00', scavenger: '#ff4444', settlement: '#00ffcc' };
  return map[faction] ?? '#ffffff';
}

/** Escape HTML */
function _esc(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
