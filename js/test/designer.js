// Unified Designer — ?designer&category=<cat>&id=<item>
// Up/Down: change category. Left/Right: cycle item within category.
// Ships: scaled drawShape(). POIs: mock camera render(). Weapons: projectile/beam visual + stats.

import { input } from '../input.js';

// Ships — imported from central registry
import { SHIP_REGISTRY } from '../ships/registry.js';

// POIs
import { createStation }     from '../world/station.js';
import { createCoilStation } from '../world/coilStation.js';
import { createPlanet }      from '../world/planet.js';
import { createDerelict }    from '../world/derelict.js';
import { createArkshipSpine } from '../world/arkshipSpine.js';
import { createDebrisCloud }  from '../world/debrisCloud.js';

// Weapons
import { Autocannon }   from '../weapons/autocannon.js';
import { Railgun }      from '../weapons/railgun.js';
import { FlakCannon }   from '../weapons/flakCannon.js';
import { Lance }        from '../weapons/lance.js';
import { PlasmaCannon } from '../weapons/plasmaCannon.js';
import { Cannon }       from '../weapons/cannon.js';
import { Rocket }       from '../weapons/rocket.js';
import { RocketLarge }  from '../weapons/rocketLarge.js';
import { MissileWire }  from '../weapons/missileWire.js';
import { MissileHeat }  from '../weapons/missileHeat.js';
import { Torpedo }      from '../weapons/torpedo.js';

import {
  CYAN, AMBER, GREEN, WHITE, RED, MAGENTA,
  RAIL_WHITE, PLASMA_GREEN, TORPEDO_AMBER,
  DIM_TEXT, DIM_OUTLINE,
} from '../ui/colors.js';

// ─── SHIP GROUPING ────────────────────────────────────────────────────────────
// Reorders the flat registry so each variant follows its parent class.

function _buildShipItems() {
  const flat = SHIP_REGISTRY.map(s => ({
    id:          s.id,
    label:       s.label,
    file:        s.file,
    type:        'ship',
    zoom:        7,
    parentClass: s.parentClass ?? null,
    isVariant:   false,
    create:      () => s.create(0, 0),
  }));

  const result  = [];
  const added   = new Set();

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
    items: [
      {
        id: 'station-keelbreak', label: 'Keelbreak (neutral)', file: 'js/world/station.js', type: 'poi', zoom: 3.5,
        create: () => createStation({ x: 0, y: 0, id: 'keelbreak', name: 'Keelbreak', faction: 'neutral', services: ['repair', 'trade', 'fuel'] }),
        info: { Type: 'Station', Faction: 'neutral', 'Docking R': '150u', Services: 'repair · trade · fuel' },
      },
      {
        id: 'station-crucible', label: 'Crucible (scavengers)', file: 'js/world/station.js', type: 'poi', zoom: 3.5,
        create: () => createStation({ x: 0, y: 0, id: 'crucible', name: 'Crucible', faction: 'scavengers', services: ['trade'] }),
        info: { Type: 'Station', Faction: 'scavengers', 'Docking R': '150u', Services: 'trade' },
      },
      {
        id: 'station-thornwick', label: 'Thornwick (monastic)', file: 'js/world/station.js', type: 'poi', zoom: 3.5,
        create: () => createStation({ x: 0, y: 0, id: 'thornwick', name: 'Thornwick', faction: 'monastic', services: ['repair'] }),
        info: { Type: 'Station', Faction: 'monastic', 'Docking R': '150u', Services: 'repair' },
      },
      {
        id: 'the-coil', label: 'The Coil (salvage_lords)', file: 'js/world/coilStation.js', type: 'poi', zoom: 0.35,
        create: () => createCoilStation({ x: 0, y: 0, id: 'the_coil', name: 'The Coil', faction: 'salvage_lords', services: ['repair', 'trade'] }),
        info: { Type: 'CoilStation', Faction: 'salvage_lords', 'Docking R': '1100u', Note: 'Zoom out with scroll' },
      },
    ],
  },
  {
    id: 'planets',
    label: 'Planets',
    items: [
      {
        id: 'planet-thalassa', label: 'Thalassa (moon)', file: 'js/world/planet.js', type: 'poi', zoom: 1.0,
        create: () => createPlanet({ x: 0, y: 0, name: 'Thalassa', radius: 200, colorInner: '#4a9a4a', colorOuter: '#2a5a2a' }),
        info: { Type: 'Planet', Radius: '200u', Color: 'green gradient' },
      },
      {
        id: 'planet-pale', label: 'Pale (gas giant)', file: 'js/world/planet.js', type: 'poi', zoom: 0.04,
        create: () => createPlanet({ x: 0, y: 0, name: 'Pale', radius: 9000, colorInner: '#4a7a9a', colorOuter: '#1a3a5a' }),
        info: { Type: 'Planet (gas giant)', Radius: '9000u', Note: 'Zoom out far' },
      },
    ],
  },
  {
    id: 'derelicts',
    label: 'Derelicts',
    items: [
      {
        id: 'derelict-hollow-march', label: 'Hollow March', file: 'js/world/derelict.js', type: 'poi', zoom: 8.0,
        create: () => createDerelict({ x: 0, y: 0, name: 'Hollow March', salvageTime: 5, lootTable: [{ type: 'scrap', amount: 40 }, { type: 'tech', amount: 3 }] }),
        info: { Type: 'Derelict', 'Salvage Time': '5s', Loot: 'scrap×40, tech×3', 'Interact R': '120u' },
      },
    ],
  },
  {
    id: 'environment',
    label: 'Environment',
    items: [
      {
        id: 'arkship-spine', label: 'Arkship Spine', file: 'js/world/arkshipSpine.js', type: 'poi', zoom: 0.25,
        create: () => createArkshipSpine({ x: 0, y: 0, rotation: 0, length: 2200, width: 140 }),
        info: { Type: 'ArkshipSpine', Length: '2200u', Width: '140u', Note: 'Static terrain' },
      },
      {
        id: 'debris-cloud', label: 'Debris Cloud', file: 'js/world/debrisCloud.js', type: 'poi', zoom: 0.8,
        create: () => createDebrisCloud({ x: 0, y: 0, spreadRadius: 350, fragmentCount: 30 }),
        info: { Type: 'DebrisCloud', 'Spread R': '350u', Fragments: '30' },
      },
    ],
  },
  {
    id: 'weapons',
    label: 'Weapons',
    items: [
      {
        id: 'autocannon',  label: 'Autocannon',    file: 'js/weapons/autocannon.js',  type: 'weapon',
        create: () => new Autocannon(),
        projColor: AMBER,   projLen: 3,  projTrail: true,
        flags: ['manual'],
      },
      {
        id: 'railgun',     label: 'Railgun',       file: 'js/weapons/railgun.js',     type: 'weapon',
        create: () => new Railgun(),
        projColor: RAIL_WHITE, projLen: 12, projTrail: true,
        flags: ['manual', 'hull-dmg'],
      },
      {
        id: 'railgun-f',   label: 'Railgun (fixed)', file: 'js/weapons/railgun.js',  type: 'weapon',
        create: () => new Railgun('fixed'),
        projColor: RAIL_WHITE, projLen: 12, projTrail: true,
        flags: ['fixed', 'hull-dmg'],
      },
      {
        id: 'flak-s',      label: 'Flak Cannon (S)', file: 'js/weapons/flakCannon.js', type: 'weapon',
        create: () => new FlakCannon('small'),
        projColor: AMBER,   projLen: 5,  projTrail: false,
        flags: ['manual', 'aoe', 'intercept', 'hull-dmg'],
      },
      {
        id: 'flak-l',      label: 'Flak Cannon (L)', file: 'js/weapons/flakCannon.js', type: 'weapon',
        create: () => new FlakCannon('large'),
        projColor: AMBER,   projLen: 5,  projTrail: false,
        flags: ['manual', 'aoe', 'intercept', 'hull-dmg'],
      },
      {
        id: 'lance-s',     label: 'Lance (S)',     file: 'js/weapons/lance.js',       type: 'weapon',
        create: () => new Lance('small'),
        isBeam: true, projColor: CYAN,
        flags: ['beam', 'ramp-dmg'],
      },
      {
        id: 'lance-l',     label: 'Lance (L)',     file: 'js/weapons/lance.js',       type: 'weapon',
        create: () => new Lance('large'),
        isBeam: true, projColor: CYAN,
        flags: ['beam', 'ramp-dmg'],
      },
      {
        id: 'lance-f',     label: 'Lance (fixed)', file: 'js/weapons/lance.js',       type: 'weapon',
        create: () => new Lance('fixed'),
        isBeam: true, projColor: CYAN,
        flags: ['beam', 'fixed', 'ramp-dmg'],
      },
      {
        id: 'plasma-s',    label: 'Plasma (S)',    file: 'js/weapons/plasmaCannon.js', type: 'weapon',
        create: () => new PlasmaCannon('small'),
        projColor: PLASMA_GREEN, projLen: 5, projTrail: false,
        flags: ['manual', 'falloff', 'hull-dmg'],
      },
      {
        id: 'plasma-l',    label: 'Plasma (L)',    file: 'js/weapons/plasmaCannon.js', type: 'weapon',
        create: () => new PlasmaCannon('large'),
        projColor: PLASMA_GREEN, projLen: 5, projTrail: false,
        flags: ['manual', 'falloff', 'hull-dmg'],
      },
      {
        id: 'cannon',      label: 'Cannon',        file: 'js/weapons/cannon.js',      type: 'weapon',
        create: () => new Cannon(),
        projColor: '#dd8800', projLen: 7, projTrail: false,
        flags: ['manual', 'aoe', 'hull-dmg'],
      },
      {
        id: 'rocket',      label: 'Rocket',        file: 'js/weapons/rocket.js',      type: 'weapon',
        create: () => new Rocket(),
        projColor: AMBER,   projLen: 8,  projTrail: true,
        flags: ['secondary', 'aoe', 'hull-dmg', 'ammo'],
      },
      {
        id: 'rocket-large', label: 'Rocket ×5',   file: 'js/weapons/rocketLarge.js', type: 'weapon',
        create: () => new RocketLarge(),
        projColor: AMBER,   projLen: 8,  projTrail: true,
        flags: ['secondary', 'aoe', 'hull-dmg', 'ammo', 'burst'],
      },
      {
        id: 'wire-msl',    label: 'Wire Missile',  file: 'js/weapons/missileWire.js', type: 'weapon',
        create: () => new MissileWire('small'),
        projColor: AMBER,   projLen: 8,  projTrail: true,
        flags: ['secondary', 'guided', 'interceptable', 'aoe', 'ammo'],
      },
      {
        id: 'wire-msl-l',  label: 'Wire Missile ×3', file: 'js/weapons/missileWire.js', type: 'weapon',
        create: () => new MissileWire('large'),
        projColor: AMBER,   projLen: 8,  projTrail: true,
        flags: ['secondary', 'guided', 'interceptable', 'aoe', 'ammo', 'spread'],
      },
      {
        id: 'heat-msl',    label: 'Heat Missile',  file: 'js/weapons/missileHeat.js', type: 'weapon',
        create: () => new MissileHeat('small'),
        projColor: RED,     projLen: 8,  projTrail: true,
        flags: ['secondary', 'guided', 'interceptable', 'aoe', 'ammo'],
      },
      {
        id: 'heat-msl-l',  label: 'Heat Missile ×2', file: 'js/weapons/missileHeat.js', type: 'weapon',
        create: () => new MissileHeat('large'),
        projColor: RED,     projLen: 8,  projTrail: true,
        flags: ['secondary', 'guided', 'interceptable', 'aoe', 'ammo', 'burst'],
      },
      {
        id: 'torpedo',     label: 'Torpedo',       file: 'js/weapons/torpedo.js',     type: 'weapon',
        create: () => new Torpedo(),
        projColor: TORPEDO_AMBER, projLen: 16, projTrail: true,
        flags: ['secondary', 'fixed', 'interceptable', 'aoe', 'hull-dmg', 'ammo'],
      },
    ],
  },
];

// ─── DESIGNER CLASS ───────────────────────────────────────────────────────────

const PANEL_W = 280;
const MARGIN  = 14;

export class Designer {
  constructor() {
    this.canvas = null;
    this.ctx    = null;

    this._catIdx  = 0;
    this._itemIdx = 0;

    // Current loaded entity
    this._entity = null;

    // Ship-specific
    this._autoRotate = false;
    this._angle      = 0;
    this._shipScale  = 7;

    // POI/ship shared viewport state
    this._zoom  = 1.0;
    this._panX  = 0;
    this._panY  = 0;

    // POI drag
    this._dragging  = false;
    this._dragLastX = 0;
    this._dragLastY = 0;

    this._time = 0;

    // Compare panel
    this._compareOpen   = false;
    this._comparePanel  = null;
    this._compareTable  = null;
    this._compareCatId  = null; // which category the table was built for
  }

  // ── Init ────────────────────────────────────────────────────────────────────

  init() {
    this.canvas = document.getElementById('game');
    this.canvas.width  = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this.ctx = this.canvas.getContext('2d');

    window.addEventListener('resize', () => {
      this.canvas.width  = window.innerWidth;
      this.canvas.height = window.innerHeight;
    });

    this.canvas.addEventListener('wheel', (e) => {
      e.preventDefault();
      const factor = e.deltaY < 0 ? 1.12 : 0.89;
      const cat = this._cat();
      if (cat.id === 'ships') {
        this._shipScale = Math.max(1, Math.min(30, this._shipScale * factor));
      } else {
        this._zoom = Math.max(0.005, Math.min(30, this._zoom * factor));
      }
    }, { passive: false });

    // POI drag
    this.canvas.addEventListener('mousedown', (e) => {
      if (e.button === 0 && this._cat().id !== 'ships') {
        this._dragging  = true;
        this._dragLastX = e.clientX;
        this._dragLastY = e.clientY;
      }
    });
    window.addEventListener('mouseup',   (e) => { if (e.button === 0) this._dragging = false; });
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
    const urlId  = params.get('id');
    if (urlCat) {
      const ci = CATEGORIES.findIndex(c => c.id === urlCat);
      if (ci !== -1) this._catIdx = ci;
    }
    if (urlId) {
      const items = CATEGORIES[this._catIdx].items;
      const ii = items.findIndex(it => it.id === urlId);
      if (ii !== -1) this._itemIdx = ii;
    }

    this._load(false);
    this._initComparePanel();
  }

  // ── State helpers ────────────────────────────────────────────────────────────

  _cat()  { return CATEGORIES[this._catIdx]; }
  _item() { return this._cat().items[this._itemIdx]; }

  _load(updateUrl = true) {
    const def = this._item();
    this._entity = def.create();
    this._angle  = 0;
    this._autoRotate = false;

    // Designer preview: no relation context → white silhouette
    if (def.type === 'ship') {
      this._entity.relation = 'none';
    }

    // Reset viewport to item default
    if (def.type === 'ship') {
      this._shipScale = def.zoom ?? 7;
    } else {
      this._zoom = def.zoom ?? 1.0;
      this._panX = 0;
      this._panY = 0;
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
    // Ensure ?designer param is preserved
    if (!url.searchParams.has('designer')) url.searchParams.set('designer', '');
    history.replaceState(null, '', url.toString());
  }

  // ── Update ───────────────────────────────────────────────────────────────────

  update(dt) {
    input.tick();
    this._time += dt;

    // Category navigation (up/down)
    if (input.wasJustPressed('arrowup')) {
      this._catIdx  = (this._catIdx - 1 + CATEGORIES.length) % CATEGORIES.length;
      this._itemIdx = 0;
      this._load();
    }
    if (input.wasJustPressed('arrowdown')) {
      this._catIdx  = (this._catIdx + 1) % CATEGORIES.length;
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
      const def = this._item();
      this._panX = 0;
      this._panY = 0;
      if (def.type === 'ship') {
        this._shipScale = def.zoom ?? 7;
        this._angle = 0;
      } else {
        this._zoom = def.zoom ?? 1.0;
      }
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
    const cat  = this._cat();
    const def  = this._item();

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
    ctx.beginPath(); ctx.moveTo(pcx, 0);       ctx.lineTo(pcx, H); ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();

    // Scale reference ring
    ctx.save();
    ctx.beginPath();
    ctx.arc(pcx, pcy, 25 * this._shipScale, 0, Math.PI * 2);
    ctx.strokeStyle = '#091525';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.restore();

    // Ship
    ctx.save();
    ctx.translate(pcx, pcy);
    ctx.scale(this._shipScale, this._shipScale);
    ctx.rotate(this._angle);
    this._entity._drawShape(ctx);
    ctx.restore();

    // Scale label
    ctx.save();
    ctx.font = '10px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillStyle = DIM_TEXT;
    ctx.fillText(`${this._shipScale.toFixed(1)}× scale  •  ${def.file}`, pcx, 12);
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
    ctx.font = '10px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillStyle = DIM_TEXT;
    ctx.fillText(`zoom ${this._zoom.toFixed(3)}×  •  ${this._item().file}`, pcx, 12);
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
      ctx.shadowBlur  = 12 * t;
      ctx.strokeStyle = def.projColor;
      ctx.globalAlpha = 0.2 + 0.7 * t;
      ctx.lineWidth   = 8;
      ctx.beginPath(); ctx.moveTo(-beamLen, 0); ctx.lineTo(beamLen, 0); ctx.stroke();

      // Core
      ctx.globalAlpha = 0.5 + 0.5 * t;
      ctx.lineWidth   = 2;
      ctx.strokeStyle = WHITE;
      ctx.beginPath(); ctx.moveTo(-beamLen, 0); ctx.lineTo(beamLen, 0); ctx.stroke();

      ctx.restore();

      // Label
      ctx.save();
      ctx.font = '10px monospace';
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
      ctx.shadowBlur  = 6;
      ctx.fillStyle   = WHITE;
      ctx.fillRect(-projLen, -1.5, projLen, 3);

      // Bolt core color
      ctx.shadowBlur  = 0;
      ctx.fillStyle   = def.projColor;
      ctx.fillRect(-projLen, -1, projLen, 2);

      ctx.restore();

      // Label
      ctx.save();
      ctx.font = '10px monospace';
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
    ctx.font = 'bold 11px monospace';
    ctx.fillText('[ DESIGNER ]', MARGIN, y);
    y += 22;

    this._divider(ctx, y); y += 8;

    // Category breadcrumb
    ctx.fillStyle = DIM_TEXT;
    ctx.font = '10px monospace';
    ctx.fillText(`↑↓ category   ← → item`, MARGIN, y); y += 14;

    // Category row
    ctx.fillStyle = AMBER;
    ctx.font = 'bold 10px monospace';
    ctx.fillText(`[ ${cat.label.toUpperCase()} ]  ${this._catIdx + 1}/${CATEGORIES.length}`, MARGIN, y); y += 18;

    // Item name (variants shown with ↳ prefix)
    const displayLabel = def.isVariant ? '↳ ' + def.label : def.label;
    const nameColor    = def.isVariant ? AMBER : WHITE;
    ctx.fillStyle = nameColor;
    ctx.font = 'bold 13px monospace';
    y = this._wrapText(ctx, displayLabel, MARGIN, y, PANEL_W - MARGIN * 2, 16, nameColor, 'bold 13px monospace');
    y += 4;

    // Item index
    ctx.fillStyle = DIM_TEXT;
    ctx.font = '10px monospace';
    ctx.fillText(`item ${this._itemIdx + 1} / ${cat.items.length}`, MARGIN, y); y += 16;

    this._divider(ctx, y); y += 10;

    // Type-specific stats
    if (def.type === 'ship') {
      y = this._renderShipStats(ctx, y, def);
    } else if (def.type === 'weapon') {
      y = this._renderWeaponStats(ctx, y, def);
    } else {
      y = this._renderPoiStats(ctx, y, def);
    }

    ctx.restore();
  }

  _renderShipStats(ctx, y, def) {
    const ship = this._entity;

    // Controls hint
    ctx.fillStyle = DIM_TEXT;
    ctx.font = '10px monospace';
    ctx.fillText(`T rotate [${this._autoRotate ? 'ON' : 'OFF'}]  •  R reset  •  C compare`, MARGIN, y); y += 20;

    this._header(ctx, 'HULL', y); y += 18;
    this._row(ctx, 'Hull HP',  ship.hullMax,       GREEN, y); y += 16;
    this._row(ctx, 'Cargo',    ship.cargoCapacity,  AMBER, y); y += 20;

    this._header(ctx, 'ARMOR ARCS', y); y += 18;
    this._row(ctx, 'Front',     ship.armorArcsMax.front,     GREEN, y); y += 16;
    this._row(ctx, 'Port',      ship.armorArcsMax.port,      GREEN, y); y += 16;
    this._row(ctx, 'Starboard', ship.armorArcsMax.starboard, GREEN, y); y += 16;
    this._row(ctx, 'Aft',       ship.armorArcsMax.aft,       GREEN, y); y += 20;

    this._header(ctx, 'MOVEMENT', y); y += 18;
    this._row(ctx, 'Speed Max',    ship.speedMax,                    AMBER, y); y += 16;
    this._row(ctx, 'Acceleration', ship.acceleration,                AMBER, y); y += 16;
    this._row(ctx, 'Turn Rate',    ship.turnRate.toFixed(2) + ' r/s', AMBER, y); y += 20;

    this._header(ctx, 'THROTTLE', y); y += 18;
    ctx.fillStyle = WHITE;
    ctx.font = '10px monospace';
    ctx.fillText(ship._throttleRatios.join(' / '), MARGIN, y); y += 20;

    this._header(ctx, 'FUEL', y); y += 18;
    this._row(ctx, 'Tank',       ship.fuelMax + ' u',                AMBER, y); y += 16;
    this._row(ctx, 'Efficiency', '×' + ship.fuelEfficiency.toFixed(2), AMBER, y); y += 20;

    if (ship.weapons.length > 0) {
      this._header(ctx, 'WEAPONS', y); y += 18;
      for (const w of ship.weapons) {
        const tag  = w.isAutoFire ? '[auto]' : w.isSecondary ? '[sec]' : '[pri]';
        ctx.fillStyle = DIM_TEXT;
        ctx.font = '10px monospace';
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
    ctx.font = '10px monospace';
    ctx.fillText(def.file, MARGIN, y);
    return y;
  }

  _renderWeaponStats(ctx, y, def) {
    const w = this._entity;

    ctx.fillStyle = DIM_TEXT;
    ctx.font = '10px monospace';
    ctx.fillText('R reset view  •  scroll zoom', MARGIN, y); y += 20;

    this._header(ctx, 'DAMAGE', y); y += 18;

    if (def.isBeam) {
      this._row(ctx, 'Armor (base)', w.baseDamage + '/s', GREEN, y); y += 16;
      this._row(ctx, 'Armor (max)',  w.maxDamage  + '/s', GREEN, y); y += 16;
      this._row(ctx, 'Ramp time',   w.rampTime   + 's',  AMBER, y); y += 20;
    } else {
      const armDmg = w.damage ?? w.armorDamage;
      if (armDmg != null) { this._row(ctx, 'Armor',  armDmg,       GREEN, y); y += 16; }
      if (w.hullDamage != null) { this._row(ctx, 'Hull', w.hullDamage, GREEN, y); y += 16; }
      if (w.blastRadius != null) { this._row(ctx, 'Blast R', w.blastRadius + 'u', AMBER, y); y += 16; }

      const armDps = (armDmg != null && w.cooldownMax != null) ? (armDmg / w.cooldownMax).toFixed(1) : null;
      if (armDps != null) { this._row(ctx, 'DPS (armor)', armDps, GREEN, y); y += 16; }
      y += 4;
    }

    this._header(ctx, 'PROFILE', y); y += 18;
    if (w.cooldownMax != null)    { this._row(ctx, 'Cooldown', (w.cooldownMax * 1000).toFixed(0) + 'ms', AMBER, y); y += 16; }
    if (w.cooldown != null && w.cooldownMax == null) { this._row(ctx, 'Cooldown', (w.cooldown * 1000).toFixed(0) + 'ms', AMBER, y); y += 16; }
    if (w.maxRange != null)       { this._row(ctx, 'Range',  Math.round(w.maxRange) + 'u',     AMBER, y); y += 16; }
    if (w.projectileSpeed != null){ this._row(ctx, 'Proj spd', Math.round(w.projectileSpeed) + 'u/s', AMBER, y); y += 16; }
    if (w.ammo != null)           { this._row(ctx, 'Ammo',  `${w.ammo} / ${w.ammoMax}`,        WHITE, y); y += 16; }
    y += 4;

    if (def.flags && def.flags.length > 0) {
      this._header(ctx, 'FLAGS', y); y += 18;
      ctx.fillStyle = MAGENTA;
      ctx.font = '10px monospace';
      for (const f of def.flags) {
        ctx.fillText('  · ' + f, MARGIN, y); y += 14;
      }
      y += 4;
    }

    this._divider(ctx, y); y += 10;
    ctx.fillStyle = DIM_TEXT;
    ctx.font = '10px monospace';
    ctx.fillText(def.file, MARGIN, y);
    return y;
  }

  _renderPoiStats(ctx, y, def) {
    ctx.fillStyle = DIM_TEXT;
    ctx.font = '10px monospace';
    ctx.fillText('R reset  •  scroll zoom  •  drag pan', MARGIN, y); y += 20;

    this._header(ctx, 'INFO', y); y += 18;
    for (const [k, v] of Object.entries(def.info ?? {})) {
      this._row(ctx, k, String(v), WHITE, y); y += 16;
    }
    y += 8;

    // Zoom / pan readout
    this._divider(ctx, y); y += 10;
    ctx.fillStyle = AMBER;
    ctx.font = '10px monospace';
    ctx.fillText(`Zoom: ${this._zoom.toFixed(3)}×`, MARGIN, y); y += 16;
    const panWx = -(this._panX / this._zoom);
    const panWy = -(this._panY / this._zoom);
    ctx.fillStyle = DIM_TEXT;
    ctx.fillText(`Pan: (${panWx.toFixed(0)}, ${panWy.toFixed(0)})`, MARGIN, y); y += 20;

    ctx.fillText(def.file, MARGIN, y);
    return y;
  }

  // ── Compare Panel ─────────────────────────────────────────────────────────────

  _initComparePanel() {
    this._comparePanel = document.getElementById('compare-panel');
    this._compareTable = document.getElementById('compare-table');

    const tab   = document.getElementById('compare-tab');
    const close = document.getElementById('compare-close');

    tab.addEventListener('click',   () => this._toggleCompare());
    close.addEventListener('click', () => this._toggleCompare());

    // Clicking a row navigates to that item
    this._compareTable.addEventListener('click', (e) => {
      const row = e.target.closest('tr[data-idx]');
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

    const cols  = this._compareColumns(cat);
    const thead = table.createTHead();
    const hrow  = thead.insertRow();

    // Name column header
    const th0 = document.createElement('th');
    th0.textContent = 'NAME';
    hrow.appendChild(th0);

    for (const col of cols) {
      const th = document.createElement('th');
      th.textContent = col.label;
      hrow.appendChild(th);
    }

    const tbody = table.createTBody();
    cat.items.forEach((def, idx) => {
      const entity = def.create();
      const vals   = cols.map(col => col.get(def, entity));

      const tr = tbody.insertRow();
      tr.dataset.idx = idx;
      if (idx === this._itemIdx) tr.classList.add('cmp-current');
      if (def.isVariant)         tr.classList.add('cmp-variant');

      // Name cell
      const nameCell = tr.insertCell();
      nameCell.textContent = def.isVariant ? '↳ ' + def.label : def.label;

      for (let c = 0; c < cols.length; c++) {
        const td = tr.insertCell();
        td.textContent = vals[c].text ?? vals[c];
        if (vals[c].cls) td.classList.add(vals[c].cls);
      }
    });

    this._updateCompareHighlight();
  }

  _updateCompareHighlight() {
    if (!this._compareTable) return;
    const rows = this._compareTable.querySelectorAll('tbody tr[data-idx]');
    rows.forEach(row => {
      row.classList.toggle('cmp-current', parseInt(row.dataset.idx, 10) === this._itemIdx);
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
        { label: 'FACTION',  get: (d)    => v(d.faction ?? '—',               'cmp-dim') },
        { label: 'HULL',     get: (_, e) => v(e.hullMax,                       'cmp-white') },
        { label: 'ARM-F',    get: (_, e) => v(e.armorArcsMax?.front  ?? '—',   'cmp-green') },
        { label: 'ARM-P',    get: (_, e) => v(e.armorArcsMax?.port   ?? '—',   'cmp-green') },
        { label: 'ARM-S',    get: (_, e) => v(e.armorArcsMax?.starboard ?? '—','cmp-green') },
        { label: 'ARM-A',    get: (_, e) => v(e.armorArcsMax?.aft    ?? '—',   'cmp-green') },
        { label: 'SPEED',    get: (_, e) => v(Math.round(e.speedMax),          'cmp-amber') },
        { label: 'ACCEL',    get: (_, e) => v(Math.round(e.acceleration),      'cmp-amber') },
        { label: 'TURN r/s', get: (_, e) => v(e.turnRate?.toFixed(2) ?? '—',   'cmp-amber') },
        { label: 'FUEL',     get: (_, e) => v(e.fuelMax ?? '—',                'cmp-cyan') },
        { label: 'EFF ×',    get: (_, e) => v(e.fuelEfficiency?.toFixed(2) ?? '—', 'cmp-cyan') },
        { label: 'CARGO',    get: (_, e) => v(e.cargoCapacity ?? '—',          'cmp-dim') },
        { label: 'WEAPONS',  get: (_, e) => v(
            (e.weapons ?? []).map(w => w.displayName ?? w.constructor.name).join(', ') || '—',
            'cmp-dim') },
      ];
    }

    if (cat.id === 'weapons') {
      return [
        { label: 'ARM DMG',   get: (_, e) => { const d = e.damage ?? e.armorDamage ?? null; return v(d ?? '—', d != null ? 'cmp-green' : 'cmp-dim'); } },
        { label: 'HULL DMG',  get: (_, e) => v(e.hullDamage ?? '—',           e.hullDamage != null ? 'cmp-green' : 'cmp-dim') },
        { label: 'DPS',       get: (_, e) => {
            const d  = e.damage ?? e.armorDamage;
            const cd = e.cooldownMax;
            if (d != null && cd != null) return v((d / cd).toFixed(1), 'cmp-green');
            if (e.baseDamage != null)    return v(e.baseDamage + '/s', 'cmp-green');
            return v('—', 'cmp-dim');
          }
        },
        { label: 'CD ms',     get: (_, e) => {
            const cd = e.cooldownMax ?? e.cooldown;
            return v(cd != null ? Math.round(cd * 1000) : '—', cd != null ? 'cmp-amber' : 'cmp-dim');
          }
        },
        { label: 'RANGE u',   get: (_, e) => v(e.maxRange != null ? Math.round(e.maxRange) : '—', e.maxRange != null ? 'cmp-amber' : 'cmp-dim') },
        { label: 'PROJ u/s',  get: (_, e) => v(e.projectileSpeed != null ? Math.round(e.projectileSpeed) : '—', e.projectileSpeed != null ? 'cmp-amber' : 'cmp-dim') },
        { label: 'BLAST R',   get: (_, e) => v(e.blastRadius ?? '—',          e.blastRadius != null ? 'cmp-mag' : 'cmp-dim') },
        { label: 'AMMO',      get: (_, e) => v(e.ammoMax ?? '—',              e.ammoMax != null ? 'cmp-white' : 'cmp-dim') },
        { label: 'FLAGS',     get: (d)    => v((d.flags ?? []).join(' '),      'cmp-dim') },
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
    ctx.font = 'bold 10px monospace';
    ctx.fillText(label, MARGIN, y);
  }

  _row(ctx, label, value, color, y) {
    ctx.fillStyle = DIM_TEXT;
    ctx.font = '10px monospace';
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
