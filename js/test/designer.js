// Unified Designer — ?designer&category=<cat>&id=<item>
// Up/Down: change category. Left/Right: cycle item within category.
// Ships: scaled drawShape(). POIs: mock camera render(). Weapons: projectile/beam visual + stats.

import { input } from '@/input.js';

// Ships and NPCs — imported from central registry
import { SHIP_REGISTRY, NPC_REGISTRY } from '@/ships/registry.js';

// Stations — imported from central registry
import { STATION_REGISTRY } from '@/world/stationRegistry.js';

// Modules and weapons — from their registries (designer auto-discovers all entries)
import { MODULE_REGISTRY } from '@/modules/shipModule.js';
import { WEAPON_REGISTRY } from '@/modules/weapons/registry.js';

// POIs
import { PlanetPale } from '@/data/zones/gravewake/planetPale.js';
import { createDerelict } from '@/world/derelict.js';
import { createArkshipSpine } from '@/world/arkshipSpine.js';
import { createDebrisCloud } from '@/world/debrisCloud.js';

import {
  CYAN, AMBER, GREEN, WHITE, RED, MAGENTA,
  DIM_TEXT, DIM_OUTLINE,
} from '@/rendering/colors.js';

// ─── SHIP GROUPING ────────────────────────────────────────────────────────────
// Reorders the flat registry so each variant follows its parent class.

function _buildShipItems() {
  // Hulls first (no parent), then NPCs grouped under their hull via shipClass.
  const flat = [
    ...SHIP_REGISTRY.map(s => ({
      id: s.id,
      label: s.label,
      file: s.file,
      type: 'ship',
      parentClass: null,
      isVariant: false,
      create: () => s.create(0, 0),
    })),
    ...NPC_REGISTRY.map(n => ({
      id: n.id,
      label: n.label,
      file: n.file,
      type: 'ship',
      parentClass: n.shipClass,
      isVariant: false,
      create: () => n.create(0, 0),
    })),
  ];

  const result = [];
  const added = new Set();

  for (const item of flat) {
    if (added.has(item.id) || item.parentClass) continue;
    result.push(item);
    added.add(item.id);
    for (const child of flat) {
      if (child.parentClass === item.id && !added.has(child.id)) {
        result.push({ ...child, isVariant: true });
        added.add(child.id);
      }
    }
  }
  // Orphans (parentClass set but parent missing — shouldn't happen normally)
  for (const item of flat) {
    if (!added.has(item.id)) result.push(item);
  }
  return result;
}

// ─── STATION ITEMS (from registry) ────────────────────────────────────────────

function _buildStationItems() {
  return STATION_REGISTRY.map(s => ({
    id: s.id,
    label: s.entity.name,
    file: null,
    type: 'poi',
    flavorText: s.flavorText ?? null,
    create: () => s.entity.instantiate(0, 0),
    info: {
      Type: s.entity.renderer ? s.entity.renderer : 'Station',
      Faction: s.entity.faction,
      'Docking R': `${s.entity.dockingRadius ?? 150}u`,
      Services: s.entity.services.join(' · '),
    },
  }));
}

// ─── WEAPON ITEMS (from registry) ─────────────────────────────────────────────

function _buildWeaponItems() {
  return WEAPON_REGISTRY.map(entry => {
    const sample = entry.create();
    return {
      id: entry.slug,
      label: entry.label,
      file: `js/modules/weapons/`,
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

function _buildModuleItems() {
  return MODULE_REGISTRY.map(entry => {
    const sample = entry.create();
    return {
      id: entry.id,
      label: sample.displayName || entry.id,
      file: 'js/modules/shipModule.js',
      type: 'module',
      category: entry.category,
      create: entry.create,
    };
  });
}

// ─── CATEGORY DEFINITIONS ─────────────────────────────────────────────────────

const CATEGORIES = [
  {
    id: 'ships',
    label: 'Ships',
    items: _buildShipItems(),
  },
  {
    id: 'stations',
    label: 'Stations',
    items: _buildStationItems(),
  },
  {
    id: 'planets',
    label: 'Planets',
    items: [
      {
        id: 'planet-pale', label: 'Pale (ice planet)', file: 'js/data/zones/gravewake/planetPale.js', type: 'poi',
        flavorText: "A frozen world of nitrogen plains and fractured ice. Navigation charts list it as uninhabitable — the scavenger clans who've built settlements on its cryo-flats prefer it that way.",
        create: () => PlanetPale.backgroundData({ x: 0, y: 0 }),
        info: { Type: 'Planet (ice)', Radius: '540u', Note: 'Topographic contours' },
      },
    ],
  },
  {
    id: 'derelicts',
    label: 'Derelicts',
    items: [
      {
        id: 'derelict-hollow-march', label: 'Hollow March', file: 'js/world/derelict.js', type: 'poi',
        flavorText: "The registration marks are burned off. Cargo manifests mention nothing that would explain the damage.",
        create: () => createDerelict({ x: 0, y: 0, name: 'Hollow March', salvageTime: 5, lootTable: [{ type: 'scrap', amount: 40 }, { type: 'void_crystals', amount: 3 }] }),
        info: { Type: 'Derelict', 'Salvage Time': '5s', Loot: 'scrap×40, void_crystals×3', 'Interact R': '120u' },
      },
    ],
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

const PANEL_W = 280;
const MARGIN = 14;

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

    // Drag to pan
    this.canvas.addEventListener('mousedown', (e) => {
      if (e.button === 0) {
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

    this._load(false);
    this._initComparePanel();
  }

  // ── State helpers ────────────────────────────────────────────────────────────

  _cat() { return CATEGORIES[this._catIdx]; }
  _item() { return this._cat().items[this._itemIdx]; }

  _load(updateUrl = true) {
    const def = this._item();
    this._entity = def.create();
    this._angle = 0;
    this._autoRotate = false;

    // Designer preview: no relation context → white silhouette
    if (def.type === 'ship') {
      this._entity.relation = 'none';
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
    if (input.wasJustPressed('t') && this._cat().id === 'ships') {
      this._autoRotate = !this._autoRotate;
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
    if (this._entity && this._entity.update && this._cat().id !== 'ships') {
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
    ctx.fillStyle = '#000810';
    ctx.fillRect(0, 0, W, H);

    // Preview area bounds
    const previewX = PANEL_W;
    const previewW = W - PANEL_W;
    const pcx = previewX + previewW / 2;
    const pcy = H / 2;

    if (cat.id === 'ships') {
      this._renderShipPreview(ctx, W, H, pcx, pcy, def);
    } else if (def.type === 'weapon') {
      this._renderWeaponPreview(ctx, W, H, pcx, pcy, def);
    } else if (def.type === 'module') {
      this._renderModulePreview(ctx, W, H, pcx, pcy, def);
    } else {
      this._renderPoiPreview(ctx, W, H, pcx, pcy);
    }

    // Left panel
    this._renderPanel(ctx, W, H, cat, def);
  }

  // ── Ship Preview ─────────────────────────────────────────────────────────────

  _renderShipPreview(ctx, W, H, pcx, pcy, def) {
    // Crosshair
    ctx.save();
    ctx.strokeStyle = '#0d1e2e';
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
    ctx.strokeStyle = '#091525';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.restore();

    // Ship
    ctx.save();
    ctx.translate(pcx + this._panX, pcy + this._panY);
    ctx.scale(this._zoom, this._zoom);
    ctx.rotate(this._angle);
    this._entity._drawShape(ctx);
    ctx.restore();

    // Scale label
    ctx.save();
    ctx.font = "10px 'Fira Mono', monospace";
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillStyle = DIM_TEXT;
    ctx.fillText(`${this._zoom.toFixed(1)}× zoom  •  ${def.file}`, pcx, 12);
    ctx.restore();
  }

  // ── Module Preview ───────────────────────────────────────────────────────────

  _renderModulePreview(ctx, W, H, pcx, pcy, def) {
    const mod = this._entity;
    const cat = def.category ?? 'MODULE';

    // Background grid
    ctx.save();
    ctx.strokeStyle = '#0a1520';
    ctx.lineWidth = 1;
    const step = 60;
    for (let x = PANEL_W; x < W; x += step) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
    }
    for (let y = 0; y < H; y += step) {
      ctx.beginPath(); ctx.moveTo(PANEL_W, y); ctx.lineTo(W, y); ctx.stroke();
    }
    ctx.restore();

    // Category badge
    const BADGE_COLORS = { ENGINE: AMBER, WEAPON: RED, POWER: GREEN, SENSOR: CYAN };
    const badgeColor = BADGE_COLORS[cat] ?? WHITE;

    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    let cy = pcy - 80;

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
      if (mod.minimap_stations) caps.push('stations');
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
    ctx.strokeStyle = '#0a1520';
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

    // Origin crosshair
    const cam = this._makeCam(pcx, pcy);
    const origin = cam.worldToScreen(0, 0);
    ctx.strokeStyle = '#1a3a50';
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
    ctx.strokeStyle = '#0a1520';
    ctx.lineWidth = 1;
    const step = 60;
    for (let x = PANEL_W; x < W; x += step) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
    }
    for (let y = 0; y < H; y += step) {
      ctx.beginPath(); ctx.moveTo(PANEL_W, y); ctx.lineTo(W, y); ctx.stroke();
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

  // ── Stats Panel ──────────────────────────────────────────────────────────────

  _renderPanel(ctx, W, H, cat, def) {
    // Panel background
    ctx.fillStyle = 'rgba(0,6,14,0.95)';
    ctx.fillRect(0, 0, PANEL_W, H);
    ctx.strokeStyle = DIM_OUTLINE;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(PANEL_W, 0); ctx.lineTo(PANEL_W, H);
    ctx.stroke();

    ctx.save();
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    let y = MARGIN;

    // Header
    ctx.fillStyle = CYAN;
    ctx.font = "bold 11px 'Fira Mono', monospace";
    ctx.fillText('[ DESIGNER ]', MARGIN, y);
    y += 22;

    this._divider(ctx, y); y += 8;

    // Category breadcrumb
    ctx.fillStyle = DIM_TEXT;
    ctx.font = "10px 'Fira Mono', monospace";
    ctx.fillText(`↑↓ category   ← → item`, MARGIN, y); y += 14;

    // Category row
    ctx.fillStyle = AMBER;
    ctx.font = "bold 10px 'Fira Mono', monospace";
    ctx.fillText(`[ ${cat.label.toUpperCase()} ]  ${this._catIdx + 1}/${CATEGORIES.length}`, MARGIN, y); y += 18;

    // Item name (variants shown with ↳ prefix)
    const displayLabel = def.isVariant ? '↳ ' + def.label : def.label;
    const nameColor = def.isVariant ? AMBER : WHITE;
    ctx.fillStyle = nameColor;
    ctx.font = "bold 13px 'Fira Mono', monospace";
    y = this._wrapText(ctx, displayLabel, MARGIN, y, PANEL_W - MARGIN * 2, 16, nameColor, "bold 13px 'Fira Mono', monospace");
    y += 4;

    // Item index
    ctx.fillStyle = DIM_TEXT;
    ctx.font = "10px 'Fira Mono', monospace";
    ctx.fillText(`item ${this._itemIdx + 1} / ${cat.items.length}`, MARGIN, y); y += 16;

    this._divider(ctx, y); y += 10;

    // Type-specific stats
    if (def.type === 'ship') {
      this._renderShipStats(ctx, y, def);
    } else if (def.type === 'weapon') {
      this._renderWeaponStats(ctx, y, def);
    } else if (def.type === 'module') {
      this._renderModuleStats(ctx, y, def);
    } else {
      this._renderPoiStats(ctx, y, def);
    }

    ctx.restore();
  }

  _renderShipStats(ctx, y, def) {
    const ship = this._entity;

    // Controls hint
    ctx.fillStyle = DIM_TEXT;
    ctx.font = "10px 'Fira Mono', monospace";
    ctx.fillText(`T rotate [${this._autoRotate ? 'ON' : 'OFF'}]  •  R reset  •  scroll zoom  •  C compare`, MARGIN, y); y += 20;

    this._header(ctx, 'HULL', y); y += 18;
    this._row(ctx, 'Hull HP', ship.hullMax, GREEN, y); y += 16;
    this._row(ctx, 'Cargo', ship.cargoCapacity, AMBER, y); y += 20;

    this._header(ctx, 'ARMOR ARCS', y); y += 18;
    this._row(ctx, 'Front', ship.armorArcsMax.front, GREEN, y); y += 16;
    this._row(ctx, 'Port', ship.armorArcsMax.port, GREEN, y); y += 16;
    this._row(ctx, 'Starboard', ship.armorArcsMax.starboard, GREEN, y); y += 16;
    this._row(ctx, 'Aft', ship.armorArcsMax.aft, GREEN, y); y += 20;

    this._header(ctx, 'MOVEMENT', y); y += 18;
    this._row(ctx, 'Speed Max', ship.speedMax, AMBER, y); y += 16;
    this._row(ctx, 'Acceleration', ship.acceleration, AMBER, y); y += 16;
    this._row(ctx, 'Turn Rate', ship.turnRate.toFixed(2) + ' r/s', AMBER, y); y += 20;

    this._header(ctx, 'THROTTLE', y); y += 18;
    ctx.fillStyle = WHITE;
    ctx.font = "10px 'Fira Mono', monospace";
    ctx.fillText(ship._throttleRatios.join(' / '), MARGIN, y); y += 20;

    this._header(ctx, 'FUEL', y); y += 18;
    this._row(ctx, 'Tank', ship.fuelMax + ' u', AMBER, y); y += 16;
    this._row(ctx, 'Efficiency', '×' + ship.fuelEfficiency.toFixed(2), AMBER, y); y += 20;

    if (ship.weapons.length > 0) {
      this._header(ctx, 'WEAPONS', y); y += 18;
      for (const w of ship.weapons) {
        const tag = w.isAutoFire ? '[auto]' : w.isSecondary ? '[sec]' : '[pri]';
        ctx.fillStyle = DIM_TEXT;
        ctx.font = "10px 'Fira Mono', monospace";
        ctx.fillText((w.displayName ?? w.constructor.name) + ' ' + tag, MARGIN, y); y += 14;
        if (w.damage != null || w.armorDamage != null) {
          const dmg = w.damage ?? w.armorDamage;
          const detail = [
            dmg != null ? `${dmg} arm` : null,
            w.hullDamage != null ? `${w.hullDamage} hull` : null,
            w.cooldownMax != null ? `${(w.cooldownMax * 1000).toFixed(0)}ms cd` : null,
            w.maxRange != null ? `${Math.round(w.maxRange)}u rng` : null,
          ].filter(Boolean).join('  ');
          ctx.fillStyle = AMBER;
          ctx.fillText('  ' + detail, MARGIN, y); y += 14;
        }
      }
    }

    this._divider(ctx, y); y += 10;
    ctx.fillStyle = DIM_TEXT;
    ctx.font = "10px 'Fira Mono', monospace";
    ctx.fillText(def.file, MARGIN, y);
    y += 20;

    if (ship.flavorText) {
      this._divider(ctx, y); y += 10;
      this._header(ctx, 'LORE', y); y += 16;
      y = this._wrapText(ctx, ship.flavorText, MARGIN, y, PANEL_W - MARGIN * 2, 13, DIM_TEXT, "10px 'Fira Mono', monospace");
    }

    return y;
  }

  _renderWeaponStats(ctx, y, def) {
    const w = this._entity;

    ctx.fillStyle = DIM_TEXT;
    ctx.font = "10px 'Fira Mono', monospace";
    ctx.fillText('R reset view  •  scroll zoom', MARGIN, y); y += 20;

    this._header(ctx, 'DAMAGE', y); y += 18;

    if (def.isBeam) {
      this._row(ctx, 'Armor (base)', w.baseDamage + '/s', GREEN, y); y += 16;
      this._row(ctx, 'Armor (max)', w.maxDamage + '/s', GREEN, y); y += 16;
      this._row(ctx, 'Ramp time', w.rampTime + 's', AMBER, y); y += 20;
    } else {
      const armDmg = w.damage ?? w.armorDamage;
      if (armDmg != null) { this._row(ctx, 'Armor', armDmg, GREEN, y); y += 16; }
      if (w.hullDamage != null) { this._row(ctx, 'Hull', w.hullDamage, GREEN, y); y += 16; }
      if (w.blastRadius != null) { this._row(ctx, 'Blast R', w.blastRadius + 'u', AMBER, y); y += 16; }

      const armDps = (armDmg != null && w.cooldownMax != null) ? (armDmg / w.cooldownMax).toFixed(1) : null;
      if (armDps != null) { this._row(ctx, 'DPS (armor)', armDps, GREEN, y); y += 16; }
      y += 4;
    }

    this._header(ctx, 'PROFILE', y); y += 18;
    if (w.cooldownMax != null) { this._row(ctx, 'Cooldown', (w.cooldownMax * 1000).toFixed(0) + 'ms', AMBER, y); y += 16; }
    if (w.cooldown != null && w.cooldownMax == null) { this._row(ctx, 'Cooldown', (w.cooldown * 1000).toFixed(0) + 'ms', AMBER, y); y += 16; }
    if (w.maxRange != null) { this._row(ctx, 'Range', Math.round(w.maxRange) + 'u', AMBER, y); y += 16; }
    if (w.projectileSpeed != null) { this._row(ctx, 'Proj spd', Math.round(w.projectileSpeed) + 'u/s', AMBER, y); y += 16; }
    if (w.ammo != null) { this._row(ctx, 'Ammo', `${w.ammo} / ${w.ammoMax}`, WHITE, y); y += 16; }
    y += 4;

    if (def.flags && def.flags.length > 0) {
      this._header(ctx, 'FLAGS', y); y += 18;
      ctx.fillStyle = MAGENTA;
      ctx.font = "10px 'Fira Mono', monospace";
      for (const f of def.flags) {
        ctx.fillText('  · ' + f, MARGIN, y); y += 14;
      }
      y += 4;
    }

    this._divider(ctx, y); y += 10;
    ctx.fillStyle = DIM_TEXT;
    ctx.font = "10px 'Fira Mono', monospace";
    ctx.fillText(def.file, MARGIN, y);
    y += 20;

    if (def.flavorText) {
      this._divider(ctx, y); y += 10;
      this._header(ctx, 'LORE', y); y += 16;
      y = this._wrapText(ctx, def.flavorText, MARGIN, y, PANEL_W - MARGIN * 2, 13, DIM_TEXT, "10px 'Fira Mono', monospace");
    }

    return y;
  }

  _renderModuleStats(ctx, y, def) {
    const mod = this._entity;
    const cat = def.category ?? 'MODULE';

    ctx.fillStyle = DIM_TEXT;
    ctx.font = "10px 'Fira Mono', monospace";
    ctx.fillText('← → cycle  •  C compare', MARGIN, y); y += 20;

    // Category badge color
    const BADGE_COLORS = { ENGINE: AMBER, WEAPON: RED, POWER: GREEN, SENSOR: CYAN };
    const badgeColor = BADGE_COLORS[cat] ?? WHITE;
    this._header(ctx, cat, y);
    ctx.fillStyle = badgeColor;
    ctx.font = "bold 10px 'Fira Mono', monospace";
    ctx.fillText(cat, MARGIN, y); y += 18;

    if (mod.isEngine) {
      this._header(ctx, 'DRIVE STATS', y); y += 18;
      this._row(ctx, 'Thrust', `${mod.thrust}`, GREEN, y); y += 16;
      this._row(ctx, 'Weight', `${mod.weight}`, AMBER, y); y += 16;
      this._row(ctx, 'FuelEff Mult', `×${mod.fuelEffMult.toFixed(2)}`, mod.fuelEffMult > 1 ? RED : GREEN, y); y += 20;
    } else if (cat === 'WEAPON' && mod.weapon) {
      this._header(ctx, 'WEAPON STATS', y); y += 18;
      const w = mod.weapon;
      const arm = w.damage ?? w.armorDamage;
      if (arm != null) { this._row(ctx, 'Armor Dmg', arm, GREEN, y); y += 16; }
      if (w.hullDamage != null) { this._row(ctx, 'Hull Dmg', w.hullDamage, GREEN, y); y += 16; }
      if (w.cooldownMax != null) { this._row(ctx, 'Cooldown', `${(w.cooldownMax * 1000).toFixed(0)}ms`, AMBER, y); y += 16; }
      if (w.maxRange != null) { this._row(ctx, 'Range', `${Math.round(w.maxRange)}u`, AMBER, y); y += 16; }
      y += 4;
    } else if (cat === 'POWER') {
      this._header(ctx, 'POWER OUTPUT', y); y += 18;
      const out = mod.effectivePowerOutput ?? mod.powerOutput;
      if (out > 0) { this._row(ctx, 'Output', `+${out}W`, GREEN, y); y += 16; }
      if (mod.overhaulCost) {
        const interval = mod._overhaulInterval;
        const hrs = interval ? `every ${(interval / 3600).toFixed(0)}h` : '—';
        this._row(ctx, 'Overhaul', `${mod.overhaulCost} scrap`, MAGENTA, y); y += 16;
        this._row(ctx, 'Interval', hrs, MAGENTA, y); y += 16;
      }
      y += 4;
    } else if (cat === 'SENSOR') {
      this._header(ctx, 'SENSOR CAPS', y); y += 18;
      if (mod.sensor_range) { this._row(ctx, 'Range', `${mod.sensor_range}u`, CYAN, y); y += 16; }
      const caps = [];
      if (mod.minimap_stations) caps.push('stations');
      if (mod.minimap_ships) caps.push('ships');
      if (mod.lead_indicators) caps.push('lead');
      if (mod.health_pips) caps.push('pips');
      if (mod.salvage_detail) caps.push('salvage');
      if (caps.length) {
        ctx.fillStyle = DIM_TEXT; ctx.font = "10px 'Fira Mono', monospace";
        ctx.fillText('Detects', MARGIN, y);
        ctx.fillStyle = CYAN; ctx.textAlign = 'right';
        ctx.fillText(caps.join(' · '), PANEL_W - MARGIN, y);
        ctx.textAlign = 'left';
        y += 16;
      }
      y += 4;
    }

    this._header(ctx, 'POWER / FUEL', y); y += 18;
    const draw = mod.powerDraw ?? 0;
    const out = mod.powerOutput ?? 0;
    if (out > 0) { this._row(ctx, 'Pwr Output', `+${out}W`, GREEN, y); y += 16; }
    if (draw > 0) { this._row(ctx, 'Pwr Draw', `-${draw}W`, MAGENTA, y); y += 16; }
    const drain = mod.fuelDrainRate ?? 0;
    if (drain > 0) { this._row(ctx, 'Fuel Drain', `+${drain.toFixed(3)}/s`, AMBER, y); y += 16; }
    if (draw === 0 && out === 0 && drain === 0) {
      ctx.fillStyle = DIM_TEXT; ctx.font = "10px 'Fira Mono', monospace";
      ctx.fillText('  no power or fuel overhead', MARGIN, y); y += 16;
    }
    y += 8;

    this._divider(ctx, y); y += 10;
    ctx.fillStyle = DIM_TEXT;
    ctx.font = "10px 'Fira Mono', monospace";
    ctx.fillText(def.file, MARGIN, y); y += 20;

    if (mod.description) {
      this._divider(ctx, y); y += 10;
      this._header(ctx, 'DESCRIPTION', y); y += 16;
      y = this._wrapText(ctx, mod.description, MARGIN, y, PANEL_W - MARGIN * 2, 13, DIM_TEXT, "10px 'Fira Mono', monospace");
    }

    return y;
  }

  _renderPoiStats(ctx, y, def) {
    ctx.fillStyle = DIM_TEXT;
    ctx.font = "10px 'Fira Mono', monospace";
    ctx.fillText('R reset  •  scroll zoom  •  drag pan', MARGIN, y); y += 20;

    this._header(ctx, 'INFO', y); y += 18;
    for (const [k, v] of Object.entries(def.info ?? {})) {
      this._row(ctx, k, String(v), WHITE, y); y += 16;
    }
    y += 8;

    // Zoom / pan readout
    this._divider(ctx, y); y += 10;
    ctx.fillStyle = AMBER;
    ctx.font = "10px 'Fira Mono', monospace";
    ctx.fillText(`Zoom: ${this._zoom.toFixed(3)}×`, MARGIN, y); y += 16;
    const panWx = -(this._panX / this._zoom);
    const panWy = -(this._panY / this._zoom);
    ctx.fillStyle = DIM_TEXT;
    ctx.fillText(`Pan: (${panWx.toFixed(0)}, ${panWy.toFixed(0)})`, MARGIN, y); y += 20;

    ctx.fillText(def.file, MARGIN, y);
    y += 20;

    if (def.flavorText) {
      this._divider(ctx, y); y += 10;
      this._header(ctx, 'LORE', y); y += 16;
      y = this._wrapText(ctx, def.flavorText, MARGIN, y, PANEL_W - MARGIN * 2, 13, DIM_TEXT, "10px 'Fira Mono', monospace");
    }

    return y;
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

    if (cat.id === 'ships') {
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

  // ── Helpers ──────────────────────────────────────────────────────────────────

  _divider(ctx, y) {
    ctx.fillStyle = DIM_OUTLINE;
    ctx.fillRect(MARGIN, y, PANEL_W - MARGIN * 2, 1);
  }

  _header(ctx, label, y) {
    ctx.fillStyle = CYAN;
    ctx.font = "bold 10px 'Fira Mono', monospace";
    ctx.fillText(label, MARGIN, y);
  }

  _row(ctx, label, value, color, y) {
    ctx.fillStyle = DIM_TEXT;
    ctx.font = "10px 'Fira Mono', monospace";
    ctx.textAlign = 'left';
    ctx.fillText(label, MARGIN, y);
    ctx.fillStyle = color;
    ctx.textAlign = 'right';
    ctx.fillText(String(value), PANEL_W - MARGIN, y);
    ctx.textAlign = 'left';
  }

  _wrapText(ctx, text, x, y, maxW, lineH, color, font) {
    ctx.fillStyle = color;
    ctx.font = font;
    const words = text.split(' ');
    let line = '';
    for (const word of words) {
      const test = line ? line + ' ' + word : word;
      if (ctx.measureText(test).width > maxW && line) {
        ctx.fillText(line, x, y);
        y += lineH;
        line = word;
      } else {
        line = test;
      }
    }
    if (line) { ctx.fillText(line, x, y); y += lineH; }
    return y;
  }
}
