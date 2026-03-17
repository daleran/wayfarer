// Unified Designer — ?designer&category=<cat>&id=<item>
// Up/Down: change category. Left/Right: cycle item within category.
// Ships: scaled drawShape(). POIs: mock camera render(). Weapons: projectile/beam visual + stats.

import { input } from '@/input.js';

// Ships and Characters — imported from central registry
import { getShipRegistry, getNamedShipRegistry, getCharacterRegistry } from '@/entities/registry.js';

// Content registry — all content self-registers here
import { CONTENT, LOCATION_TYPE } from '@data/index.js';
import { getLocationsByType } from '@data/dataRegistry.js';
import { getFactionName } from '@data/factionHelpers.js';

// POIs
import { createArkshipSpine } from '@data/locations/tyr/pale/orbital/terrain/arkship-spines/index.js';
import { createDebrisCloud } from '@data/locations/tyr/pale/orbital/terrain/debris-clouds/index.js';

import {
  CYAN, AMBER, GREEN, WHITE, RED, MAGENTA,
  DIM_TEXT, DIM_OUTLINE, conditionColor,
  DESIGNER_BG, DESIGNER_CROSSHAIR, DESIGNER_SCALE_RING, DESIGNER_GRID, DESIGNER_GRID_LABEL, DESIGNER_ORIGIN,
} from '@/rendering/colors.js';
import { moduleTooltipRows } from '@/ui/shipStats.js';
import { drawEmptyMount } from '@/rendering/moduleVisuals.js';
import { BOX_W, BOX_H, renderModuleHeader, renderModuleSlotBox } from '@/rendering/moduleSlotBoxes.js';
import { DesignerPanel } from '@/ui/designerPanel.js';
import { createModuleById } from '@/modules/registry.js';

// ─── SHIP GROUPING ────────────────────────────────────────────────────────────
// Reorders the flat registry so each variant follows its parent class.

function _buildShipClassItems() {
  return getShipRegistry().map(s => ({
    id: s.id,
    label: s.label,
    file: `data/hulls/${s.id}/hull.js`,
    type: 'ship',
    isVariant: false,
    create: () => s.create(0, 0),
  }));
}

function _buildNamedShipItems() {
  return getNamedShipRegistry().map(n => ({
    id: n.id,
    label: n.label,
    file: n.file,
    type: 'ship',
    parentClass: n.shipClass,
    isVariant: true,
    create: () => n.create(0, 0),
  }));
}

function _buildCharacterItems() {
  return getCharacterRegistry().map(n => {
    const ship = n.create(0, 0);
    const captain = ship.captain;
    return {
      id: `char-${n.id}`,
      label: captain?.name || n.label,
      file: n.file,
      type: 'character',
      flavorText: captain?.flavorText ?? null,
      shipFlavorText: ship.flavorText ?? null,
      create: () => n.create(0, 0),
      characterInfo: {
        Name: captain?.name || n.label,
        Faction: getFactionName(n.faction),
        Behavior: n.behavior,
        Ship: ship.name || n.label,
        'Hull Class': n.shipId,
      },
    };
  });
}

// ─── STATION ITEMS (from registry) ────────────────────────────────────────────

function _buildStationItems() {
  return Object.entries(getLocationsByType(LOCATION_TYPE.STATION)).map(([id, loc]) => ({
    id,
    label: loc.entity.name,
    file: null,
    type: 'poi',
    flavorText: loc.flavorText ?? null,
    create: () => loc.entity.instantiate(0, 0),
    info: {
      Type: loc.entity.renderer ? loc.entity.renderer : 'Station',
      Faction: getFactionName(loc.entity.faction),
      'Docking R': `${loc.entity.dockingRadius ?? 150}u`,
      Services: loc.entity.services.join(' · '),
    },
  }));
}

// ─── WEAPON ITEMS (from registry) ─────────────────────────────────────────────

function _buildWeaponItems() {
  return Object.values(CONTENT.weapons).map(entry => {
    const sample = entry.create();
    return {
      id: entry.slug,
      label: entry.label,
      file: 'data/modules/weapons.js',
      type: 'weapon',
      flavorText: entry.flavorText ?? null,
      create: entry.create,
      isBeam: !!/** @type {*} */ (sample).isBeam,
      projColor: entry.projColor,
      projLen: entry.projLen ?? 5,
      projTrail: entry.projTrail ?? false,
      flags: entry.flags ?? [],
    };
  });
}

// ─── MODULE ITEMS (from registry) ─────────────────────────────────────────────

const MODULE_CAT_FILES = {
  ENGINE: 'data/modules/engines.js',
  WEAPON: 'data/modules/weapons.js',
  UTILITY: 'data/modules/utilities.js',
  SENSOR: 'data/modules/sensors.js',
  POWER: 'data/modules/reactors.js',
};

function _buildModuleItems() {
  return Object.entries(CONTENT.modules).map(([id, entry]) => {
    const sample = entry.create();
    const isLarge = sample.size === 'large' || id.endsWith('-l') || id.endsWith('-large');
    return {
      id,
      label: sample.displayName || id,
      file: MODULE_CAT_FILES[entry.category] || 'data/modules/',
      type: 'module',
      category: entry.category,
      mountSize: isLarge ? 'large' : 'small',
      create: entry.create,
    };
  });
}

// ─── DERELICT ITEMS (from CONTENT.derelicts) ─────────────────────────────────

function _buildDerelictItems() {
  return Object.entries(CONTENT.derelicts).map(([slug, def]) => {
    const loot = (def.lootTable || []).map(l => {
      if (l.type === 'scrap' || l.type === 'fuel') return `${l.type}×${l.amount}`;
      if (l.type === 'ammo') return `${l.ammoType}×${l.amount}`;
      if (l.type === 'moduleId') return l.id;
      if (l.type === 'weaponId') return l.id;
      return l.type;
    }).join(', ');
    return {
      id: slug,
      label: def.name,
      file: null,
      type: 'poi',
      flavorText: def.lore,
      create: () => def.instantiate(0, 0),
      info: {
        Type: `Derelict (${def.shipClass})`,

        Loot: loot,
        'Interact R': '120u',
      },
    };
  });
}

function _buildPlanetItems() {
  return Object.entries(getLocationsByType(LOCATION_TYPE.PLANET)).map(([slug, def]) => ({
    id: slug,
    label: def.name,
    file: null,
    type: 'poi',
    flavorText: def.flavorText,
    create: () => def.backgroundData({ x: 0, y: 0 }),
    info: { Type: 'Planet' },
  }));
}

// ─── CATEGORY DEFINITIONS ─────────────────────────────────────────────────────

function _isShipCategory(id) { return id === 'ship-classes' || id === 'ships'; }

/** Short stat label for a module in the fitting picker. */
function _moduleStat(mod, category) {
  if (mod.isEngine) return `T:${mod.thrust} W:${mod.weight}`;
  if (category === 'WEAPON' && mod.weapon) {
    const d = mod.weapon.damage ?? mod.weapon.armorDamage;
    return d != null ? `${d} dmg` : '';
  }
  if (category === 'POWER') {
    const o = mod.effectivePowerOutput ?? mod.powerOutput;
    return o > 0 ? `+${o}W` : '';
  }
  if (category === 'SENSOR') return mod.sensor_range ? `${mod.sensor_range}u` : '';
  return mod.powerDraw > 0 ? `-${mod.powerDraw}W` : '';
}

const CATEGORIES = [
  {
    id: 'ship-classes',
    label: 'Ship Classes',
    items: _buildShipClassItems(),
  },
  {
    id: 'ships',
    label: 'Ships',
    items: _buildNamedShipItems(),
  },
  {
    id: 'characters',
    label: 'Characters',
    items: _buildCharacterItems(),
  },
  {
    id: 'stations',
    label: 'Stations',
    items: _buildStationItems(),
  },
  {
    id: 'planets',
    label: 'Planets',
    items: _buildPlanetItems(),
  },
  {
    id: 'derelicts',
    label: 'Derelicts',
    items: _buildDerelictItems(),
  },
  {
    id: 'environment',
    label: 'Environment',
    items: [
      {
        id: 'arkship-spine', label: 'Arkship Spine', file: 'js/world/arkshipSpine.js', type: 'poi',
        flavorText: "The skeletal remains of a colony ship, kilometers long. It still drifts on the course it was launched with centuries ago.",
        create: () => createArkshipSpine({ x: 0, y: 0, rotation: 0, length: 2200, width: 140 }),
        info: { Type: 'ArkshipSpine', Length: '2200u', Width: '140u', Note: 'Static terrain' },
      },
      {
        id: 'debris-cloud', label: 'Debris Cloud', file: 'js/world/debrisCloud.js', type: 'poi',
        flavorText: "The field spreads a little wider every year. Something blew here. Nobody agrees on what.",
        create: () => createDebrisCloud({ x: 0, y: 0, spreadRadius: 350, fragmentCount: 30 }),
        info: { Type: 'DebrisCloud', 'Spread R': '350u', Fragments: '30' },
      },
    ],
  },
  {
    id: 'weapons',
    label: 'Weapons',
    items: _buildWeaponItems(),
  },
  {
    id: 'modules',
    label: 'Modules',
    items: _buildModuleItems(),
  },
];

// ─── DESIGNER CLASS ───────────────────────────────────────────────────────────

const PANEL_W = 320;

export class Designer {
  constructor() {
    this.canvas = null;
    this.ctx = null;

    this._catIdx = 0;
    this._itemIdx = 0;

    // Current loaded entity
    this._entity = null;

    // Ship-specific
    this._autoRotate = false;
    this._angle = 0;

    // Global viewport state (persisted in URL)
    this._zoom = 1.0;
    this._panX = 0;
    this._panY = 0;

    // POI drag
    this._dragging = false;
    this._dragLastX = 0;
    this._dragLastY = 0;

    this._time = 0;

    // Compare panel
    this._compareOpen = false;
    this._comparePanel = null;
    this._compareTable = null;
    this._compareCatId = null; // which category the table was built for

    // Module slot hover state
    this._slotBoxRects = [];  // { x, y, w, h, mod } per slot
    this._hoveredSlotIdx = -1;

    // Tooltip
    this._tooltip = null;

    // DOM panel
    /** @type {DesignerPanel|null} */
    this._panel = null;

    // Fitting mode (ship-classes only)
    /** @type {(string|null)[]|null} */
    this._fittingConfig = null;
    this._fittingPickerSlot = -1;
    /** @type {HTMLElement|null} */
    this._fittingPickerEl = null;
  }

  // ── Init ────────────────────────────────────────────────────────────────────

  init() {
    /** @type {HTMLCanvasElement} */
    this.canvas = /** @type {HTMLCanvasElement} */ (document.getElementById('game'));
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this.ctx = this.canvas.getContext('2d');

    window.addEventListener('resize', () => {
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;
    });

    this.canvas.addEventListener('wheel', (e) => {
      e.preventDefault();
      const factor = e.deltaY < 0 ? 1.12 : 0.89;
      this._zoom = Math.max(0.005, Math.min(30, this._zoom * factor));
      this._syncZoomToUrl();
    }, { passive: false });

    // Drag to pan (suppressed when clicking slot boxes in fitting mode)
    this.canvas.addEventListener('mousedown', (e) => {
      if (e.button === 0) {
        // Fitting mode: clicking a slot box opens picker instead of dragging
        if (this._fittingConfig && this._hoveredSlotIdx >= 0) {
          this._openFittingPicker(this._hoveredSlotIdx);
          return;
        }
        // Close picker if clicking elsewhere on canvas
        if (this._fittingPickerSlot >= 0) {
          this._closeFittingPicker();
        }
        this._dragging = true;
        this._dragLastX = e.clientX;
        this._dragLastY = e.clientY;
      }
    });
    window.addEventListener('mouseup', (e) => { if (e.button === 0) this._dragging = false; });
    window.addEventListener('mousemove', (e) => {
      if (!this._dragging) return;
      this._panX += e.clientX - this._dragLastX;
      this._panY += e.clientY - this._dragLastY;
      this._dragLastX = e.clientX;
      this._dragLastY = e.clientY;
    });

    // Parse URL
    const params = new URLSearchParams(window.location.search);
    const urlCat = params.get('category');
    const urlId = params.get('id');
    const urlZoom = params.get('zoom');
    if (urlCat) {
      const ci = CATEGORIES.findIndex(c => c.id === urlCat);
      if (ci !== -1) this._catIdx = ci;
    }
    if (urlId) {
      const items = CATEGORIES[this._catIdx].items;
      const ii = items.findIndex(it => it.id === urlId);
      if (ii !== -1) this._itemIdx = ii;
    }
    if (urlZoom) {
      const z = parseFloat(urlZoom);
      if (isFinite(z) && z > 0) this._zoom = z;
    }

    // Tooltip element
    this._tooltip = document.createElement('div');
    this._tooltip.className = 'panel-tooltip ship-tooltip';
    document.body.appendChild(this._tooltip);

    // Track mouse for module slot hover
    this._mouseX = 0;
    this._mouseY = 0;
    this.canvas.addEventListener('mousemove', (e) => {
      this._mouseX = e.clientX;
      this._mouseY = e.clientY;
      this._updateSlotHover();
    });

    this._panel = new DesignerPanel();

    this._fittingPickerEl = /** @type {HTMLElement} */ (document.getElementById('fitting-picker'));
    this._fittingPickerEl.addEventListener('mousedown', (e) => e.stopPropagation());
    this._fittingPickerEl.addEventListener('wheel', (e) => e.stopPropagation(), { passive: true });

    this._load(false);
    this._initComparePanel();
  }

  // ── Slot hover & tooltip ─────────────────────────────────────────────────────

  _updateSlotHover() {
    const mx = this._mouseX;
    const my = this._mouseY;
    let found = -1;
    for (let i = 0; i < this._slotBoxRects.length; i++) {
      const r = this._slotBoxRects[i];
      if (mx >= r.x && mx <= r.x + r.w && my >= r.y && my <= r.y + r.h) {
        found = i;
        break;
      }
    }
    if (found !== this._hoveredSlotIdx) {
      this._hoveredSlotIdx = found;
      if (found >= 0 && this._slotBoxRects[found].mod) {
        this._showSlotTooltip(this._slotBoxRects[found].mod);
      } else {
        this._hideTooltip();
      }
    }
    // Pointer cursor when hovering clickable slots in fitting mode
    if (this._fittingConfig) {
      this.canvas.style.cursor = found >= 0 ? 'pointer' : '';
    }
    if (found >= 0) this._positionTooltip();
  }

  _showSlotTooltip(mod) {
    const tt = this._tooltip;
    if (!tt) return;
    const rows = moduleTooltipRows(mod);
    if (rows.length === 0) { this._hideTooltip(); return; }
    tt.innerHTML = '';
    for (const { label, value, cls } of rows) {
      const row = document.createElement('div');
      row.className = 'panel-tooltip-row ship-tooltip-row';
      const l = document.createElement('span');
      l.className = 'panel-tooltip-label ship-tooltip-label';
      l.textContent = label;
      const v = document.createElement('span');
      v.className = `panel-tooltip-value ship-tooltip-value${cls ? ' ' + cls : ''}`;
      v.textContent = value;
      row.appendChild(l);
      row.appendChild(v);
      tt.appendChild(row);
    }
    tt.classList.add('visible');
  }

  _hideTooltip() {
    if (this._tooltip) this._tooltip.classList.remove('visible');
  }

  _positionTooltip() {
    const tt = this._tooltip;
    if (!tt) return;
    const pad = 12;
    let x = this._mouseX + pad;
    let y = this._mouseY - pad;
    const rect = tt.getBoundingClientRect();
    if (x + rect.width > window.innerWidth) x = this._mouseX - rect.width - pad;
    if (y + rect.height > window.innerHeight) y = window.innerHeight - rect.height - 4;
    if (y < 4) y = 4;
    tt.style.left = `${x}px`;
    tt.style.top = `${y}px`;
  }

  // ── State helpers ────────────────────────────────────────────────────────────

  _cat() { return CATEGORIES[this._catIdx]; }
  _item() { return this._cat().items[this._itemIdx]; }

  _load(updateUrl = true) {
    const def = this._item();
    this._entity = def.create();
    this._angle = 0;
    this._autoRotate = false;
    this._slotBoxRects = [];
    this._hoveredSlotIdx = -1;
    this._hideTooltip();
    this._closeFittingPicker();
    if (this._panel) this._panel.invalidate();

    // Designer preview: no relation context → white silhouette
    if (def.type === 'ship') {
      this._entity.relation = 'none';
    }

    // Fitting mode: ship-classes get empty module slots for interactive fitting
    if (this._cat().id === 'ship-classes') {
      const mountLen = (this._entity._mountPoints || []).length;
      this._fittingConfig = new Array(mountLen).fill(null);
      this._entity.moduleSlots = new Array(mountLen).fill(null);
      this._entity.recalcTW();
    } else {
      this._fittingConfig = null;
    }

    if (updateUrl) this._updateUrl();

    // Rebuild compare table when category changes; otherwise just update highlight
    if (this._compareCatId !== this._cat().id) {
      this._rebuildCompareTable();
    } else {
      this._updateCompareHighlight();
    }
  }

  _updateUrl() {
    const url = new URL(window.location.href);
    url.searchParams.set('category', this._cat().id);
    url.searchParams.set('id', this._item().id);
    url.searchParams.set('zoom', this._zoom.toFixed(4));
    // Ensure ?designer param is preserved
    if (!url.searchParams.has('designer')) url.searchParams.set('designer', '');
    history.replaceState(null, '', url.toString());
  }

  _syncZoomToUrl() {
    const url = new URL(window.location.href);
    url.searchParams.set('zoom', this._zoom.toFixed(4));
    history.replaceState(null, '', url.toString());
  }

  // ── Update ───────────────────────────────────────────────────────────────────

  update(dt) {
    input.tick();
    this._time += dt;

    // Category navigation (up/down)
    if (input.wasJustPressed('arrowup')) {
      this._catIdx = (this._catIdx - 1 + CATEGORIES.length) % CATEGORIES.length;
      this._itemIdx = 0;
      this._load();
    }
    if (input.wasJustPressed('arrowdown')) {
      this._catIdx = (this._catIdx + 1) % CATEGORIES.length;
      this._itemIdx = 0;
      this._load();
    }

    // Item navigation (left/right)
    const items = this._cat().items;
    if (input.wasJustPressed('arrowleft')) {
      this._itemIdx = (this._itemIdx - 1 + items.length) % items.length;
      this._load();
    }
    if (input.wasJustPressed('arrowright')) {
      this._itemIdx = (this._itemIdx + 1) % items.length;
      this._load();
    }

    // C — toggle compare panel
    if (input.wasJustPressed('c')) this._toggleCompare();

    // T — toggle auto-rotate (ships only)
    if (input.wasJustPressed('t') && _isShipCategory(this._cat().id)) {
      this._autoRotate = !this._autoRotate;
    }

    // Escape — close fitting picker
    if (input.wasJustPressed('escape') && this._fittingPickerSlot >= 0) {
      this._closeFittingPicker();
    }

    // X — clear all fitted modules
    if (input.wasJustPressed('x') && this._fittingConfig) {
      this._fittingConfig.fill(null);
      this._closeFittingPicker();
      this._rebuildShipFromConfig();
    }

    // R — reset view
    if (input.wasJustPressed('r')) {
      this._zoom = 1.0;
      this._panX = 0;
      this._panY = 0;
      this._angle = 0;
      this._syncZoomToUrl();
    }

    // Ship rotation
    if (this._autoRotate) this._angle += dt * 0.5;

    // POI tick
    if (this._entity && this._entity.update && !_isShipCategory(this._cat().id)) {
      this._entity.update(dt);
    }
  }

  // ── Render ───────────────────────────────────────────────────────────────────

  render() {
    const { ctx, canvas } = this;
    const W = canvas.width;
    const H = canvas.height;
    const cat = this._cat();
    const def = this._item();

    // Background
    ctx.fillStyle = DESIGNER_BG;
    ctx.fillRect(0, 0, W, H);

    // Preview area bounds
    const previewX = PANEL_W;
    const previewW = W - PANEL_W;
    const pcx = previewX + previewW / 2;
    const pcy = H / 2;

    if (_isShipCategory(cat.id)) {
      this._renderShipPreview(ctx, W, H, pcx, pcy, def);
    } else if (def.type === 'character') {
      this._renderCharacterPreview(ctx, W, H, pcx, pcy, def);
    } else if (def.type === 'weapon') {
      this._renderWeaponPreview(ctx, W, H, pcx, pcy, def);
    } else if (def.type === 'module') {
      this._renderModulePreview(ctx, W, H, pcx, pcy, def);
    } else {
      this._renderPoiPreview(ctx, W, H, pcx, pcy);
    }

    // Left panel (DOM)
    this._panel.update(
      this._catIdx, CATEGORIES.length, cat.label,
      this._itemIdx, cat.items.length,
      def, this._entity,
      { autoRotate: this._autoRotate, zoom: this._zoom, panX: this._panX, panY: this._panY, fitting: !!this._fittingConfig },
    );
  }

  // ── Ship Preview ─────────────────────────────────────────────────────────────

  _renderShipPreview(ctx, W, H, pcx, pcy, def) {
    // Background grid
    ctx.save();
    ctx.strokeStyle = DESIGNER_GRID;
    ctx.lineWidth = 1;
    const step = Math.max(4, 50 * this._zoom);
    const worldStep = 50;
    const gridOffX = ((this._panX % step) + step) % step;
    const gridOffY = ((this._panY % step) + step) % step;
    for (let x = PANEL_W + gridOffX; x < W; x += step) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
    }
    for (let y = gridOffY; y < H; y += step) {
      ctx.beginPath(); ctx.moveTo(PANEL_W, y); ctx.lineTo(W, y); ctx.stroke();
    }
    // Grid labels (world px from center)
    ctx.font = "9px 'Fira Mono', monospace";
    ctx.fillStyle = DESIGNER_GRID_LABEL;
    ctx.textBaseline = 'top';
    ctx.textAlign = 'center';
    for (let x = PANEL_W + gridOffX; x < W; x += step) {
      const wx = Math.round((x - pcx - this._panX) / this._zoom);
      const snapped = Math.round(wx / worldStep) * worldStep;
      ctx.fillText(`${snapped}`, x, 2);
    }
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'left';
    for (let y = gridOffY; y < H; y += step) {
      const wy = Math.round((y - pcy - this._panY) / this._zoom);
      const snapped = Math.round(wy / worldStep) * worldStep;
      ctx.fillText(`${snapped}`, PANEL_W + 3, y);
    }
    ctx.restore();

    // Crosshair
    ctx.save();
    ctx.strokeStyle = DESIGNER_CROSSHAIR;
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 10]);
    ctx.beginPath(); ctx.moveTo(PANEL_W, pcy); ctx.lineTo(W, pcy); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(pcx, 0); ctx.lineTo(pcx, H); ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();

    // Scale reference ring
    ctx.save();
    ctx.beginPath();
    ctx.arc(pcx, pcy, 25 * this._zoom, 0, Math.PI * 2);
    ctx.strokeStyle = DESIGNER_SCALE_RING;
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.restore();

    // Ship
    ctx.save();
    ctx.translate(pcx + this._panX, pcy + this._panY);
    ctx.scale(this._zoom, this._zoom);
    ctx.rotate(this._angle);
    this._entity._drawShape(ctx);
    this._entity._drawModules(ctx);
    ctx.restore();

    // Scale label
    ctx.save();
    ctx.font = "10px 'Fira Mono', monospace";
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillStyle = DIM_TEXT;
    ctx.fillText(`${this._zoom.toFixed(1)}× zoom  •  ${def.file}`, pcx, 12);
    ctx.restore();

    // Module slot boxes with cyan connection lines
    this._renderModuleSlots(ctx, W, H, pcx, pcy);
  }

  // ── Character Preview ────────────────────────────────────────────────────────

  _renderCharacterPreview(ctx, W, H, pcx, pcy, def) {
    const info = def.characterInfo || {};

    // Background grid (subtle)
    ctx.save();
    ctx.strokeStyle = DESIGNER_GRID;
    ctx.lineWidth = 1;
    const step = 60;
    for (let x = PANEL_W; x < W; x += step) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
    }
    for (let y = 0; y < H; y += step) {
      ctx.beginPath(); ctx.moveTo(PANEL_W, y); ctx.lineTo(W, y); ctx.stroke();
    }
    ctx.restore();

    // Character portrait placeholder — large monogram circle
    const FACTION_COLORS = {
      'Scavenger Clans': RED, 'Scavengers': RED,
      'Settlements': AMBER, "Kell's Stop": AMBER, 'Ashveil Anchorage': AMBER,
      player: GREEN,
      'Concord Remnants': CYAN, 'The Coil': RED,
      'Monastic Orders': MAGENTA, 'Grave Clan': RED,
      'Communes': GREEN,
      'Zealots': AMBER,
      'House Casimir': CYAN,
    };
    const factionColor = FACTION_COLORS[info.Faction] ?? WHITE;
    const initials = (info.Name || '?').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

    // Portrait circle
    const portraitR = 60;
    ctx.save();
    ctx.beginPath();
    ctx.arc(pcx, pcy - 80, portraitR, 0, Math.PI * 2);
    ctx.strokeStyle = factionColor;
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fill();
    ctx.restore();

    // Initials
    ctx.save();
    ctx.font = "bold 36px 'Fira Mono', monospace";
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = factionColor;
    ctx.globalAlpha = 0.7;
    ctx.fillText(initials, pcx, pcy - 80);
    ctx.globalAlpha = 1;
    ctx.restore();

    // Name
    ctx.save();
    ctx.font = "bold 22px 'Fira Mono', monospace";
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillStyle = WHITE;
    ctx.fillText(info.Name || def.label, pcx, pcy);
    ctx.restore();

    // Faction badge
    ctx.save();
    ctx.font = "bold 11px 'Fira Mono', monospace";
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillStyle = factionColor;
    ctx.fillText(`[ ${(info.Faction || '').toUpperCase()} ]`, pcx, pcy + 30);
    ctx.restore();

    // Separator
    ctx.save();
    ctx.strokeStyle = DIM_OUTLINE;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(pcx - 120, pcy + 52); ctx.lineTo(pcx + 120, pcy + 52);
    ctx.stroke();
    ctx.restore();

    // Character info rows
    const rows = [
      { label: 'BEHAVIOR', value: info.Behavior },
      { label: 'SHIP', value: info.Ship },
      { label: 'HULL', value: info['Hull Class'] },
    ];
    let ry = pcy + 66;
    ctx.save();
    ctx.font = "10px 'Fira Mono', monospace";
    ctx.textBaseline = 'top';
    for (const row of rows) {
      ctx.textAlign = 'left';
      ctx.fillStyle = DIM_TEXT;
      ctx.fillText(row.label, pcx - 100, ry);
      ctx.textAlign = 'right';
      ctx.fillStyle = AMBER;
      ctx.fillText(row.value || '—', pcx + 100, ry);
      ry += 16;
    }
    ctx.restore();

    // Backstory
    if (def.flavorText) {
      ry += 10;
      ctx.save();
      ctx.strokeStyle = DIM_OUTLINE;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(pcx - 120, ry); ctx.lineTo(pcx + 120, ry);
      ctx.stroke();
      ctx.restore();
      ry += 12;

      ctx.save();
      ctx.font = "10px 'Fira Mono', monospace";
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillStyle = DIM_TEXT;
      // Wrap text manually within preview area
      const maxW = 260;
      const words = def.flavorText.split(' ');
      let line = '';
      for (const word of words) {
        const test = line ? line + ' ' + word : word;
        if (ctx.measureText(test).width > maxW && line) {
          ctx.fillText(line, pcx, ry);
          ry += 13;
          line = word;
        } else {
          line = test;
        }
      }
      if (line) ctx.fillText(line, pcx, ry);
      ctx.restore();
    }

    // File label
    ctx.save();
    ctx.font = "10px 'Fira Mono', monospace";
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillStyle = DIM_TEXT;
    ctx.fillText(def.file, pcx, 12);
    ctx.restore();
  }

  // ── Module Slot Boxes (ship preview overlay) ─────────────────────────────────

  _renderModuleSlots(ctx, W, H, pcx, pcy) {
    const ship = this._entity;
    const mounts = ship._mountPoints;
    const slots = ship.moduleSlots;
    if (!mounts || !slots || slots.length === 0) {
      this._slotBoxRects = [];
      return;
    }

    const BOX_MARGIN_LEFT = 12;
    const boxX = PANEL_W + BOX_MARGIN_LEFT;
    let curY = 60;

    renderModuleHeader(ctx, boxX, curY - 6, slots);

    // Compute mount screen positions
    const sin = Math.sin(this._angle);
    const cos = Math.cos(this._angle);

    this._slotBoxRects = [];

    for (let i = 0; i < slots.length; i++) {
      const mod = slots[i];
      const mount = mounts[i];
      if (!mount) continue;

      const mx = (mount.x * cos - mount.y * sin) * this._zoom + pcx + this._panX;
      const my = (mount.x * sin + mount.y * cos) * this._zoom + pcy + this._panY;

      const advance = renderModuleSlotBox(ctx, {
        boxX, curY, mod, mount, mountPos: { x: mx, y: my },
        slotIdx: i,
        isHovered: this._hoveredSlotIdx === i,
      });

      this._slotBoxRects.push({ x: boxX, y: curY, w: BOX_W, h: BOX_H, mod });
      curY += advance;
    }
  }

  // ── Fitting Mode ────────────────────────────────────────────────────────────

  _rebuildShipFromConfig() {
    const def = this._item();
    const savedAngle = this._angle;
    const savedZoom = this._zoom;
    const savedPanX = this._panX;
    const savedPanY = this._panY;
    const savedRotate = this._autoRotate;

    this._entity = def.create();
    this._entity.relation = 'none';

    const mountLen = (this._entity._mountPoints || []).length;
    this._entity.moduleSlots = new Array(mountLen).fill(null);

    for (let i = 0; i < this._fittingConfig.length; i++) {
      const modId = this._fittingConfig[i];
      if (modId) {
        this._entity.moduleSlots[i] = createModuleById(modId);
      }
    }

    this._entity._applyModules();

    this._angle = savedAngle;
    this._zoom = savedZoom;
    this._panX = savedPanX;
    this._panY = savedPanY;
    this._autoRotate = savedRotate;

    if (this._panel) this._panel.invalidate();
  }

  _openFittingPicker(slotIdx) {
    const el = this._fittingPickerEl;
    if (!el) return;

    this._fittingPickerSlot = slotIdx;
    const ship = this._entity;
    const mount = ship._mountPoints[slotIdx];
    const currentMod = ship.moduleSlots[slotIdx];

    // Filter compatible modules
    const isEngineMount = mount.slot === 'engine';
    const mountSize = mount.size || 'small';
    const items = [];

    for (const [id, entry] of Object.entries(CONTENT.modules)) {
      // General mounts exclude engines; engine mounts accept everything
      if (!isEngineMount && entry.category === 'ENGINE') continue;

      // Size constraint: small mount can't take large modules
      const sample = entry.create();
      if (mountSize === 'small' && sample.size === 'large') continue;

      // Build stat summary
      const stat = _moduleStat(sample, entry.category);

      items.push({
        id,
        label: sample.displayName || id,
        category: entry.category,
        stat,
        isCurrent: this._fittingConfig[slotIdx] === id,
      });
    }

    // Build DOM
    el.innerHTML = '';

    const header = document.createElement('div');
    header.className = 'fitting-picker-header';
    const sizeTag = mountSize === 'large' ? 'LARGE' : 'SMALL';
    const slotType = isEngineMount ? 'ENGINE' : 'GENERAL';
    header.textContent = `SLOT ${slotIdx + 1} · ${slotType} · ${sizeTag}`;
    el.appendChild(header);

    // Remove button if slot is occupied
    if (currentMod) {
      const removeRow = document.createElement('div');
      removeRow.className = 'fitting-picker-item fp-remove';
      removeRow.textContent = '✕ REMOVE MODULE';
      removeRow.addEventListener('click', () => {
        this._fittingConfig[slotIdx] = null;
        this._closeFittingPicker();
        this._rebuildShipFromConfig();
      });
      el.appendChild(removeRow);
    }

    for (const item of items) {
      const row = document.createElement('div');
      row.className = 'fitting-picker-item' + (item.isCurrent ? ' fp-current' : '');

      const name = document.createElement('span');
      name.textContent = `[${item.category.slice(0, 3)}] ${item.label}`;
      row.appendChild(name);

      if (item.stat) {
        const stat = document.createElement('span');
        stat.className = 'fitting-picker-stat';
        stat.textContent = item.stat;
        row.appendChild(stat);
      }

      row.addEventListener('click', () => {
        this._fittingConfig[slotIdx] = item.id;
        this._closeFittingPicker();
        this._rebuildShipFromConfig();
      });
      el.appendChild(row);
    }

    // Position near the slot box, clamped to viewport
    const rect = this._slotBoxRects[slotIdx];
    if (rect) {
      el.style.left = `${rect.x + rect.w + 8}px`;
      el.style.top = '0px';
      el.style.bottom = 'auto';
    }

    el.classList.add('open');

    // After rendering, clamp so the picker stays fully on-screen
    requestAnimationFrame(() => {
      const pickerH = el.offsetHeight;
      const targetY = rect ? rect.y : 0;
      const maxTop = window.innerHeight - pickerH - 8;
      el.style.top = `${Math.max(8, Math.min(targetY, maxTop))}px`;
    });
  }

  _closeFittingPicker() {
    if (this._fittingPickerEl) {
      this._fittingPickerEl.classList.remove('open');
      this._fittingPickerEl.innerHTML = '';
    }
    this._fittingPickerSlot = -1;
  }

  // ── Module Preview ───────────────────────────────────────────────────────────

  _renderModulePreview(ctx, W, H, pcx, pcy, def) {
    const mod = this._entity;
    const cat = def.category ?? 'MODULE';

    // Background grid
    ctx.save();
    ctx.strokeStyle = DESIGNER_GRID;
    ctx.lineWidth = 1;
    const step = 60;
    for (let x = PANEL_W; x < W; x += step) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
    }
    for (let y = 0; y < H; y += step) {
      ctx.beginPath(); ctx.moveTo(PANEL_W, y); ctx.lineTo(W, y); ctx.stroke();
    }
    // Grid labels (px from center)
    ctx.font = "9px 'Fira Mono', monospace";
    ctx.fillStyle = DESIGNER_GRID_LABEL;
    ctx.textBaseline = 'top';
    ctx.textAlign = 'center';
    for (let x = PANEL_W; x < W; x += step) {
      const px = Math.round(x - pcx);
      ctx.fillText(`${px}`, x, 2);
    }
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'left';
    for (let y = 0; y < H; y += step) {
      const px = Math.round(y - pcy);
      ctx.fillText(`${px}`, PANEL_W + 3, y);
    }
    ctx.restore();

    // Category badge
    const BADGE_COLORS = { ENGINE: AMBER, WEAPON: RED, POWER: GREEN, SENSOR: CYAN };
    const badgeColor = BADGE_COLORS[cat] ?? WHITE;
    const previewW = W - PANEL_W;

    // Module icon — drawn large at center
    const iconScale = 8;

    // Mount point outline for size reference
    ctx.save();
    ctx.translate(pcx, pcy - 140);
    ctx.scale(iconScale, iconScale);
    drawEmptyMount(ctx, { x: 0, y: 0, size: def.mountSize ?? 'small' }, true);
    ctx.restore();

    // Module icon
    ctx.save();
    ctx.translate(pcx, pcy - 140);
    ctx.scale(iconScale, iconScale);
    const mColor = conditionColor(mod.condition);
    const mAlpha = mod.condition === 'destroyed' ? 0.2 : 0.7;
    mod.drawAtMount(ctx, mColor, mAlpha);
    ctx.restore();

    // Weapon firing animation (below the module icon)
    if (cat === 'WEAPON' && mod.weapon) {
      const w = mod.weapon;
      if (w.isBeam) {
        // Beam animation
        const beamLen = Math.min(previewW * 0.35, 180);
        const t = (Math.sin(this._time * 0.8) + 1) / 2;
        ctx.save();
        ctx.translate(pcx, pcy - 60);
        ctx.shadowColor = CYAN;
        ctx.shadowBlur = 12 * t;
        ctx.strokeStyle = CYAN;
        ctx.globalAlpha = 0.2 + 0.7 * t;
        ctx.lineWidth = 6;
        ctx.beginPath(); ctx.moveTo(-beamLen, 0); ctx.lineTo(beamLen, 0); ctx.stroke();
        ctx.globalAlpha = 0.5 + 0.5 * t;
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = WHITE;
        ctx.beginPath(); ctx.moveTo(-beamLen, 0); ctx.lineTo(beamLen, 0); ctx.stroke();
        ctx.restore();
      } else {
        // Projectile animation
        const travelW = Math.min(previewW * 0.5, 260);
        const speed = 140;
        const xOff = ((this._time * speed) % travelW) - travelW / 2;
        const projLen = Math.max(6, 5 * 3);
        const projColor = AMBER;
        ctx.save();
        ctx.translate(pcx + xOff, pcy - 60);
        // Trail
        const grad = ctx.createLinearGradient(-projLen * 4, 0, 0, 0);
        grad.addColorStop(0, 'transparent');
        grad.addColorStop(1, projColor + '88');
        ctx.fillStyle = grad;
        ctx.fillRect(-projLen * 4, -1, projLen * 4, 2);
        // Bolt
        ctx.shadowColor = projColor;
        ctx.shadowBlur = 6;
        ctx.fillStyle = WHITE;
        ctx.fillRect(-projLen, -1.5, projLen, 3);
        ctx.shadowBlur = 0;
        ctx.fillStyle = projColor;
        ctx.fillRect(-projLen, -1, projLen, 2);
        ctx.restore();
      }
    }

    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    let cy = pcy - 20;

    // Category label
    ctx.fillStyle = badgeColor;
    ctx.font = "bold 11px 'Fira Mono', monospace";
    ctx.fillText(`[ ${cat} ]`, pcx, cy); cy += 28;

    // Module display name
    ctx.fillStyle = WHITE;
    ctx.font = "bold 22px 'Fira Mono', monospace";
    ctx.fillText(mod.displayName ?? def.label, pcx, cy); cy += 36;

    // Separator line
    ctx.strokeStyle = DIM_OUTLINE;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(pcx - 120, cy); ctx.lineTo(pcx + 120, cy);
    ctx.stroke(); cy += 18;

    // Key stats block — varies by category
    const statLine = (label, value, color) => {
      ctx.fillStyle = DIM_TEXT;
      ctx.font = "11px 'Fira Mono', monospace";
      ctx.textAlign = 'right';
      ctx.fillText(label, pcx - 8, cy);
      ctx.fillStyle = color;
      ctx.font = "bold 11px 'Fira Mono', monospace";
      ctx.textAlign = 'left';
      ctx.fillText(value, pcx + 8, cy);
      cy += 18;
    };

    if (mod.isEngine) {
      statLine('THRUST', `${mod.thrust}`, GREEN);
      statLine('WEIGHT', `${mod.weight}`, AMBER);
      statLine('FUEL EFF MULT', `×${mod.fuelEffMult.toFixed(2)}`, mod.fuelEffMult > 1 ? RED : GREEN);
      if (mod.fuelDrainRate > 0)
        statLine('FUEL DRAIN', `+${mod.fuelDrainRate.toFixed(3)}/s`, AMBER);
      if (mod.powerDraw > 0)
        statLine('POWER DRAW', `-${mod.powerDraw}W`, MAGENTA);
    } else if (cat === 'WEAPON' && mod.weapon) {
      const w = mod.weapon;
      const arm = w.damage ?? w.armorDamage;
      if (arm != null) statLine('ARMOR DMG', String(arm), GREEN);
      if (w.hullDamage != null) statLine('HULL DMG', String(w.hullDamage), GREEN);
      if (w.cooldownMax != null) statLine('COOLDOWN', `${(w.cooldownMax * 1000).toFixed(0)}ms`, AMBER);
      if (w.maxRange != null) statLine('RANGE', `${Math.round(w.maxRange)}u`, AMBER);
      if (mod.powerDraw > 0) statLine('POWER DRAW', `-${mod.powerDraw}W`, MAGENTA);
    } else if (cat === 'POWER') {
      if (mod.powerOutput > 0) statLine('OUTPUT', `+${mod.effectivePowerOutput ?? mod.powerOutput}W`, GREEN);
      if (mod.fuelDrainRate > 0) statLine('FUEL DRAIN', `+${mod.fuelDrainRate.toFixed(3)}/s`, AMBER);
      if (mod.overhaulCost) statLine('OVERHAUL', `${mod.overhaulCost} scrap`, MAGENTA);
    } else if (cat === 'SENSOR') {
      if (mod.sensor_range) statLine('SENSOR RANGE', `${mod.sensor_range}u`, CYAN);
      if (mod.powerDraw > 0) statLine('POWER DRAW', `-${mod.powerDraw}W`, MAGENTA);
      const caps = [];
      if (mod.minimap_ships) caps.push('ships');
      if (mod.lead_indicators) caps.push('lead');
      if (mod.health_pips) caps.push('pips');
      if (mod.salvage_detail) caps.push('salvage');
      if (caps.length) statLine('DETECTS', caps.join(' · '), CYAN);
    }

    ctx.restore();

    // File label bottom
    ctx.save();
    ctx.font = "10px 'Fira Mono', monospace";
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillStyle = DIM_TEXT;
    ctx.fillText(def.file, pcx, 12);
    ctx.restore();
  }

  // ── POI Preview ──────────────────────────────────────────────────────────────

  _renderPoiPreview(ctx, W, H, pcx, pcy) {
    // Grid
    ctx.save();
    ctx.strokeStyle = DESIGNER_GRID;
    ctx.lineWidth = 1;
    const gridStep = Math.max(4, 100 * this._zoom);
    const gridOffX = ((this._panX % gridStep) + gridStep) % gridStep;
    const gridOffY = ((this._panY % gridStep) + gridStep) % gridStep;
    for (let x = PANEL_W + gridOffX; x < W; x += gridStep) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
    }
    for (let y = gridOffY; y < H; y += gridStep) {
      ctx.beginPath(); ctx.moveTo(PANEL_W, y); ctx.lineTo(W, y); ctx.stroke();
    }

    // Grid labels (world-space coordinates)
    const worldStep = 100; // each grid line = 100 world units
    ctx.font = "9px 'Fira Mono', monospace";
    ctx.fillStyle = DESIGNER_GRID_LABEL;
    ctx.textBaseline = 'top';
    ctx.textAlign = 'center';
    for (let x = PANEL_W + gridOffX; x < W; x += gridStep) {
      const wx = Math.round((x - this._panX - PANEL_W) / this._zoom);
      const snapped = Math.round(wx / worldStep) * worldStep;
      ctx.fillText(`${snapped}`, x, 2);
    }
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'left';
    for (let y = gridOffY; y < H; y += gridStep) {
      const wy = Math.round((y - this._panY) / this._zoom);
      const snapped = Math.round(wy / worldStep) * worldStep;
      ctx.fillText(`${snapped}`, PANEL_W + 3, y);
    }

    // Origin crosshair
    const cam = this._makeCam(pcx, pcy);
    const origin = cam.worldToScreen(0, 0);
    ctx.strokeStyle = DESIGNER_ORIGIN;
    ctx.setLineDash([3, 6]);
    ctx.beginPath(); ctx.moveTo(PANEL_W, origin.y); ctx.lineTo(W, origin.y); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(origin.x, 0); ctx.lineTo(origin.x, H); ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();

    // Clip & render
    ctx.save();
    ctx.beginPath();
    ctx.rect(PANEL_W, 0, W - PANEL_W, H);
    ctx.clip();
    if (this._entity) this._entity.render(ctx, cam);
    ctx.restore();

    // Zoom label
    ctx.save();
    ctx.font = "10px 'Fira Mono', monospace";
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillStyle = DIM_TEXT;
    ctx.fillText(`${this._zoom.toFixed(3)}× zoom  •  ${this._item().file}`, pcx, 12);
    ctx.restore();
  }

  _makeCam(pcx, pcy) {
    const zoom = this._zoom;
    const panX = this._panX;
    const panY = this._panY;
    return {
      width: this.canvas.width,
      height: this.canvas.height,
      x: 0, y: 0,
      zoom,
      worldToScreen: (wx, wy) => ({
        x: pcx + panX + wx * zoom,
        y: pcy + panY + wy * zoom,
      }),
      isVisible: () => true,
    };
  }

  // ── Weapon Preview ───────────────────────────────────────────────────────────

  _renderWeaponPreview(ctx, W, H, pcx, pcy, def) {
    const weapon = this._entity;

    // Background grid
    ctx.save();
    ctx.strokeStyle = DESIGNER_GRID;
    ctx.lineWidth = 1;
    const step = 60;
    for (let x = PANEL_W; x < W; x += step) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
    }
    for (let y = 0; y < H; y += step) {
      ctx.beginPath(); ctx.moveTo(PANEL_W, y); ctx.lineTo(W, y); ctx.stroke();
    }
    // Grid labels (px from center)
    ctx.font = "9px 'Fira Mono', monospace";
    ctx.fillStyle = DESIGNER_GRID_LABEL;
    ctx.textBaseline = 'top';
    ctx.textAlign = 'center';
    for (let x = PANEL_W; x < W; x += step) {
      const px = Math.round(x - pcx);
      ctx.fillText(`${px}`, x, 2);
    }
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'left';
    for (let y = 0; y < H; y += step) {
      const px = Math.round(y - pcy);
      ctx.fillText(`${px}`, PANEL_W + 3, y);
    }
    ctx.restore();

    if (def.isBeam) {
      // Beam: draw a horizontal line from center-left to center+range/4
      const beamLen = Math.min(previewW() * 0.4, 200);
      const t = (Math.sin(this._time * 0.8) + 1) / 2; // 0..1 ramp animation

      ctx.save();
      ctx.translate(pcx, pcy);

      // Glow
      ctx.shadowColor = def.projColor;
      ctx.shadowBlur = 12 * t;
      ctx.strokeStyle = def.projColor;
      ctx.globalAlpha = 0.2 + 0.7 * t;
      ctx.lineWidth = 8;
      ctx.beginPath(); ctx.moveTo(-beamLen, 0); ctx.lineTo(beamLen, 0); ctx.stroke();

      // Core
      ctx.globalAlpha = 0.5 + 0.5 * t;
      ctx.lineWidth = 2;
      ctx.strokeStyle = WHITE;
      ctx.beginPath(); ctx.moveTo(-beamLen, 0); ctx.lineTo(beamLen, 0); ctx.stroke();

      ctx.restore();

      // Label
      ctx.save();
      ctx.font = "10px 'Fira Mono', monospace";
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillStyle = DIM_TEXT;
      ctx.fillText('BEAM (hitscan) — ramps to max damage', pcx, 12);
      ctx.restore();
    } else {
      // Projectile: animated bolt travelling left to right
      const speed = 160; // pixels per second in preview
      const travelW = Math.min(previewW() * 0.6, 300);
      const xOff = ((this._time * speed) % travelW) - travelW / 2;
      const projLen = Math.max(6, (def.projLen ?? 5) * 3);

      ctx.save();
      ctx.translate(pcx + xOff, pcy);

      // Trail
      if (def.projTrail) {
        const grad = ctx.createLinearGradient(-projLen * 4, 0, 0, 0);
        grad.addColorStop(0, 'transparent');
        grad.addColorStop(1, def.projColor + '88');
        ctx.fillStyle = grad;
        ctx.fillRect(-projLen * 4, -1, projLen * 4, 2);
      }

      // Bolt glow
      ctx.shadowColor = def.projColor;
      ctx.shadowBlur = 6;
      ctx.fillStyle = WHITE;
      ctx.fillRect(-projLen, -1.5, projLen, 3);

      // Bolt core color
      ctx.shadowBlur = 0;
      ctx.fillStyle = def.projColor;
      ctx.fillRect(-projLen, -1, projLen, 2);

      ctx.restore();

      // Label
      ctx.save();
      ctx.font = "10px 'Fira Mono', monospace";
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillStyle = DIM_TEXT;
      const spd = weapon.projectileSpeed != null ? `${Math.round(weapon.projectileSpeed)}u/s` : '—';
      ctx.fillText(`speed: ${spd}  •  ${def.file}`, pcx, 12);
      ctx.restore();
    }

    function previewW() { return W - PANEL_W; }
  }


  // ── Compare Panel ─────────────────────────────────────────────────────────────

  _initComparePanel() {
    this._comparePanel = document.getElementById('compare-panel');
    this._compareTable = document.getElementById('compare-table');

    const tab = document.getElementById('compare-tab');
    const close = document.getElementById('compare-close');

    tab.addEventListener('click', () => this._toggleCompare());
    close.addEventListener('click', () => this._toggleCompare());

    // Clicking a row navigates to that item
    this._compareTable.addEventListener('click', (e) => {
      const row = /** @type {HTMLElement} */ (/** @type {Element} */ (e.target).closest('tr[data-idx]'));
      if (!row) return;
      const idx = parseInt(row.dataset.idx, 10);
      this._itemIdx = idx;
      this._load();
    });
  }

  _toggleCompare() {
    this._compareOpen = !this._compareOpen;
    this._comparePanel.classList.toggle('open', this._compareOpen);
    if (this._compareOpen) this._rebuildCompareTable();
  }

  _rebuildCompareTable() {
    if (!this._compareTable) return;
    const cat = this._cat();
    this._compareCatId = cat.id;

    document.getElementById('compare-title').textContent =
      `COMPARE — ${cat.label.toUpperCase()}  (${cat.items.length})`;

    const table = this._compareTable;
    table.innerHTML = '';

    const cols = this._compareColumns(cat);
    const thead = /** @type {HTMLTableElement} */ (table).createTHead();
    const hrow = thead.insertRow();

    // Name column header
    const th0 = document.createElement('th');
    th0.textContent = 'NAME';
    hrow.appendChild(th0);

    for (const col of cols) {
      const th = document.createElement('th');
      th.textContent = col.label;
      hrow.appendChild(th);
    }

    const tbody = /** @type {HTMLTableElement} */ (table).createTBody();
    cat.items.forEach((def, idx) => {
      const entity = def.create();
      const vals = cols.map(col => col.get(def, entity));

      const tr = tbody.insertRow();
      tr.dataset.idx = idx;
      if (idx === this._itemIdx) tr.classList.add('cmp-current');
      if (def.isVariant) tr.classList.add('cmp-variant');

      // Name cell
      const nameCell = tr.insertCell();
      nameCell.textContent = def.isVariant ? '↳ ' + def.label : def.label;

      for (let c = 0; c < cols.length; c++) {
        const td = tr.insertCell();
        const val = vals[c];
        td.textContent = typeof val === 'object' ? val.text : val;
        if (typeof val === 'object' && val.cls) td.classList.add(val.cls);
      }
    });

    this._updateCompareHighlight();
  }

  _updateCompareHighlight() {
    if (!this._compareTable) return;
    const rows = this._compareTable.querySelectorAll('tbody tr[data-idx]');
    rows.forEach(row => {
      row.classList.toggle('cmp-current', parseInt(/** @type {HTMLElement} */(row).dataset.idx, 10) === this._itemIdx);
    });
    // Scroll current row into view
    const cur = this._compareTable.querySelector('tr.cmp-current');
    if (cur) cur.scrollIntoView({ block: 'nearest' });
  }

  // Returns column definitions for the current category.
  // Each column has { label, get(def, entity) → { text, cls } }
  _compareColumns(cat) {
    const v = (text, cls) => ({ text: String(text), cls: cls ?? '' });

    if (_isShipCategory(cat.id)) {
      return [
        { label: 'FACTION', get: (d) => v(d.faction ?? '—', 'cmp-dim') },
        { label: 'HULL', get: (_, e) => v(e.hullMax, 'cmp-white') },
        { label: 'ARM-F', get: (_, e) => v(e.armorArcsMax?.front ?? '—', 'cmp-green') },
        { label: 'ARM-P', get: (_, e) => v(e.armorArcsMax?.port ?? '—', 'cmp-green') },
        { label: 'ARM-S', get: (_, e) => v(e.armorArcsMax?.starboard ?? '—', 'cmp-green') },
        { label: 'ARM-A', get: (_, e) => v(e.armorArcsMax?.aft ?? '—', 'cmp-green') },
        { label: 'SPEED', get: (_, e) => v(Math.round(e.speedMax), 'cmp-amber') },
        { label: 'ACCEL', get: (_, e) => v(Math.round(e.acceleration), 'cmp-amber') },
        { label: 'TURN r/s', get: (_, e) => v(e.turnRate?.toFixed(2) ?? '—', 'cmp-amber') },
        { label: 'FUEL', get: (_, e) => v(e.fuelMax ?? '—', 'cmp-cyan') },
        { label: 'EFF ×', get: (_, e) => v(e.fuelEfficiency?.toFixed(2) ?? '—', 'cmp-cyan') },
        { label: 'CARGO', get: (_, e) => v(e.cargoCapacity ?? '—', 'cmp-dim') },
        {
          label: 'WEAPONS', get: (_, e) => v(
            (e.weapons ?? []).map(w => w.displayName ?? w.constructor.name).join(', ') || '—',
            'cmp-dim')
        },
      ];
    }

    if (cat.id === 'weapons') {
      return [
        { label: 'ARM DMG', get: (_, e) => { const d = e.damage ?? e.armorDamage ?? null; return v(d ?? '—', d != null ? 'cmp-green' : 'cmp-dim'); } },
        { label: 'HULL DMG', get: (_, e) => v(e.hullDamage ?? '—', e.hullDamage != null ? 'cmp-green' : 'cmp-dim') },
        {
          label: 'DPS', get: (_, e) => {
            const d = e.damage ?? e.armorDamage;
            const cd = e.cooldownMax;
            if (d != null && cd != null) return v((d / cd).toFixed(1), 'cmp-green');
            if (e.baseDamage != null) return v(e.baseDamage + '/s', 'cmp-green');
            return v('—', 'cmp-dim');
          }
        },
        {
          label: 'CD ms', get: (_, e) => {
            const cd = e.cooldownMax ?? e.cooldown;
            return v(cd != null ? Math.round(cd * 1000) : '—', cd != null ? 'cmp-amber' : 'cmp-dim');
          }
        },
        { label: 'RANGE u', get: (_, e) => v(e.maxRange != null ? Math.round(e.maxRange) : '—', e.maxRange != null ? 'cmp-amber' : 'cmp-dim') },
        { label: 'PROJ u/s', get: (_, e) => v(e.projectileSpeed != null ? Math.round(e.projectileSpeed) : '—', e.projectileSpeed != null ? 'cmp-amber' : 'cmp-dim') },
        { label: 'BLAST R', get: (_, e) => v(e.blastRadius ?? '—', e.blastRadius != null ? 'cmp-mag' : 'cmp-dim') },
        { label: 'AMMO', get: (_, e) => v(e.magSize ?? '—', e.magSize != null ? 'cmp-white' : 'cmp-dim') },
        { label: 'FLAGS', get: (d) => v((d.flags ?? []).join(' '), 'cmp-dim') },
      ];
    }

    if (cat.id === 'modules') {
      return [
        { label: 'CAT', get: (d) => v(d.category ?? '—', 'cmp-dim') },
        { label: 'PWR OUT', get: (_, e) => { const o = e.powerOutput ?? 0; return v(o > 0 ? `+${o}W` : '—', o > 0 ? 'cmp-green' : 'cmp-dim'); } },
        { label: 'PWR DRAW', get: (_, e) => { const d = e.powerDraw ?? 0; return v(d > 0 ? `-${d}W` : '—', d > 0 ? 'cmp-mag' : 'cmp-dim'); } },
        { label: 'FUEL/s', get: (_, e) => { const f = e.fuelDrainRate ?? 0; return v(f > 0 ? f.toFixed(3) : '—', f > 0 ? 'cmp-amber' : 'cmp-dim'); } },
        { label: 'THRUST', get: (_, e) => v(e.isEngine ? `${e.thrust}` : '—', e.isEngine ? 'cmp-green' : 'cmp-dim') },
        { label: 'WEIGHT', get: (_, e) => v(`${e.weight ?? 0}`, (e.weight ?? 0) > 0 ? 'cmp-amber' : 'cmp-dim') },
        { label: 'FEFF ×', get: (_, e) => v(e.isEngine ? `×${e.fuelEffMult.toFixed(2)}` : '—', e.isEngine ? (e.fuelEffMult > 1 ? 'cmp-red' : 'cmp-green') : 'cmp-dim') },
        { label: 'SENSOR', get: (_, e) => v(e.sensor_range ? `${e.sensor_range}u` : '—', e.sensor_range ? 'cmp-cyan' : 'cmp-dim') },
        { label: 'OVERHAUL', get: (_, e) => v(e.overhaulCost ? `${e.overhaulCost} sc` : '—', e.overhaulCost ? 'cmp-mag' : 'cmp-dim') },
      ];
    }

    // Generic: use the static info object
    if (cat.items.some(it => it.info)) {
      // Collect all keys across all items
      const keys = [];
      for (const it of cat.items) {
        for (const k of Object.keys(it.info ?? {})) {
          if (!keys.includes(k)) keys.push(k);
        }
      }
      return keys.map(k => ({
        label: k.toUpperCase(),
        get: (d) => v(d.info?.[k] ?? '—', 'cmp-white'),
      }));
    }

    return [];
  }

}
