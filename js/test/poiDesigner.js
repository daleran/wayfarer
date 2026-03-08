// POI Designer — ?test-poi
// Left panel: POI info. Right: live render via mock camera. ←/→ cycle, scroll zoom, drag pan, R reset view.

import { input } from '../input.js';
import { createStation } from '../world/station.js';
import { createCoilStation } from '../world/coilStation.js';
import { createPlanet } from '../world/planet.js';
import { createDerelict } from '../world/derelict.js';
import { createArkshipSpine } from '../world/arkshipSpine.js';
import { createDebrisCloud } from '../world/debrisCloud.js';
import {
  CYAN, AMBER, GREEN, WHITE, RED,
  DIM_TEXT, DIM_OUTLINE,
} from '../ui/colors.js';

const PANEL_W = 280;
const MARGIN  = 14;

// Each POI is placed at world (0,0). The mock camera centers it in the preview area.
const ROSTER = [
  {
    label: 'Station — Keelbreak (neutral)',
    file: 'js/world/station.js',
    zoom: 3.5,
    create: () => createStation({ x: 0, y: 0, id: 'keelbreak', name: 'Keelbreak', faction: 'neutral', services: ['repair', 'trade', 'fuel'] }),
    info: { Type: 'Station', Faction: 'neutral', 'Docking R': '150u', Services: 'repair, trade, fuel' },
  },
  {
    label: 'Station — Scavengers',
    file: 'js/world/station.js',
    zoom: 3.5,
    create: () => createStation({ x: 0, y: 0, id: 'crucible', name: 'Crucible', faction: 'scavengers', services: ['trade'] }),
    info: { Type: 'Station', Faction: 'scavengers', 'Docking R': '150u' },
  },
  {
    label: 'Station — Monastic',
    file: 'js/world/station.js',
    zoom: 3.5,
    create: () => createStation({ x: 0, y: 0, id: 'shrine', name: 'Pale Shrine', faction: 'monastic', services: ['repair'] }),
    info: { Type: 'Station', Faction: 'monastic', 'Docking R': '150u' },
  },
  {
    label: 'The Coil (salvage_lords)',
    file: 'js/world/coilStation.js',
    zoom: 0.35,
    create: () => createCoilStation({ x: 0, y: 0, id: 'the_coil', name: 'The Coil', faction: 'salvage_lords', services: ['repair', 'trade'] }),
    info: { Type: 'CoilStation', Faction: 'salvage_lords', 'Docking R': '1100u', Note: 'Massive — zoom out with scroll' },
  },
  {
    label: 'Planet — Thalassa (moon)',
    file: 'js/world/planet.js',
    zoom: 1.0,
    create: () => createPlanet({ x: 0, y: 0, name: 'Thalassa', radius: 200, colorInner: '#4a9a4a', colorOuter: '#2a5a2a' }),
    info: { Type: 'Planet', Radius: '200u', Color: '#4a9a4a / #2a5a2a' },
  },
  {
    label: 'Planet — Pale (gas giant limb)',
    file: 'js/world/planet.js',
    zoom: 0.04,
    create: () => createPlanet({ x: 0, y: 0, name: 'Pale', radius: 9000, colorInner: '#4a7a9a', colorOuter: '#1a3a5a' }),
    info: { Type: 'Planet (gas giant)', Radius: '9000u', Note: 'Background limb — zoom out far' },
  },
  {
    label: 'Derelict — Hollow March',
    file: 'js/world/derelict.js',
    zoom: 8.0,
    create: () => createDerelict({ x: 0, y: 0, name: 'Hollow March', salvageTime: 5, lootTable: [{ type: 'scrap', amount: 40 }, { type: 'tech', amount: 3 }] }),
    info: { Type: 'Derelict', 'Salvage Time': '5s', Loot: 'scrap×40, tech×3', 'Interact R': '120u' },
  },
  {
    label: 'Arkship Spine (terrain)',
    file: 'js/world/arkshipSpine.js',
    zoom: 0.25,
    create: () => createArkshipSpine({ x: 0, y: 0, rotation: 0, length: 2200, width: 140 }),
    info: { Type: 'ArkshipSpine', Length: '2200u', Width: '140u', Note: 'Static terrain' },
  },
  {
    label: 'Debris Cloud (Wall of Wrecks)',
    file: 'js/world/debrisCloud.js',
    zoom: 0.8,
    create: () => createDebrisCloud({ x: 0, y: 0, spreadRadius: 350, fragmentCount: 30 }),
    info: { Type: 'DebrisCloud', 'Spread R': '350u', Fragments: '30' },
  },
];

export class PoiDesigner {
  constructor() {
    this.canvas = null;
    this.ctx    = null;
    this._index = 0;
    this._poi   = null;
    this._zoom  = 1.0;
    this._panX  = 0; // offset from preview center
    this._panY  = 0;
    this._dragging  = false;
    this._dragLastX = 0;
    this._dragLastY = 0;
    this._time  = 0;
  }

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
      this._zoom = Math.max(0.01, Math.min(30, this._zoom * factor));
    }, { passive: false });

    this.canvas.addEventListener('mousedown', (e) => {
      if (e.button === 0) {
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

    this._load();
  }

  _load() {
    const def = ROSTER[this._index];
    this._poi  = def.create();
    this._zoom = def.zoom;
    this._panX = 0;
    this._panY = 0;
  }

  _makeCam() {
    const pcx = PANEL_W + (this.canvas.width - PANEL_W) / 2;
    const pcy = this.canvas.height / 2;
    const zoom = this._zoom;
    const panX = this._panX;
    const panY = this._panY;
    return {
      width:  this.canvas.width,
      height: this.canvas.height,
      x: 0,
      y: 0,
      worldToScreen: (wx, wy) => ({
        x: pcx + panX + wx * zoom,
        y: pcy + panY + wy * zoom,
      }),
      isVisible: () => true,
    };
  }

  update(dt) {
    input.tick();
    this._time += dt;

    if (input.wasJustPressed('arrowleft')) {
      this._index = (this._index - 1 + ROSTER.length) % ROSTER.length;
      this._load();
    }
    if (input.wasJustPressed('arrowright')) {
      this._index = (this._index + 1) % ROSTER.length;
      this._load();
    }
    if (input.wasJustPressed('r')) {
      this._panX = 0;
      this._panY = 0;
      this._zoom = ROSTER[this._index].zoom;
    }

    if (this._poi && this._poi.update) this._poi.update(dt);
  }

  render() {
    const { ctx, canvas } = this;
    const W = canvas.width;
    const H = canvas.height;
    const def = ROSTER[this._index];

    // ── BACKGROUND ────────────────────────────────────────────────────────
    ctx.fillStyle = '#000810';
    ctx.fillRect(0, 0, W, H);

    // Faint grid in preview area
    ctx.save();
    ctx.strokeStyle = '#0a1520';
    ctx.lineWidth = 1;
    const cam = this._makeCam();
    const pcx = PANEL_W + (W - PANEL_W) / 2;
    const pcy = H / 2;
    const gridStep = Math.max(4, 100 * this._zoom);
    const gridOffX = ((this._panX % gridStep) + gridStep) % gridStep;
    const gridOffY = ((this._panY % gridStep) + gridStep) % gridStep;
    for (let x = PANEL_W + gridOffX; x < W; x += gridStep) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
    }
    for (let y = gridOffY; y < H; y += gridStep) {
      ctx.beginPath(); ctx.moveTo(PANEL_W, y); ctx.lineTo(W, y); ctx.stroke();
    }
    // World-origin crosshair
    const origin = cam.worldToScreen(0, 0);
    ctx.strokeStyle = '#1a3a50';
    ctx.setLineDash([3, 6]);
    ctx.beginPath(); ctx.moveTo(PANEL_W, origin.y); ctx.lineTo(W, origin.y); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(origin.x, 0); ctx.lineTo(origin.x, H); ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();

    // Clip to preview area
    ctx.save();
    ctx.beginPath();
    ctx.rect(PANEL_W, 0, W - PANEL_W, H);
    ctx.clip();

    // Render POI
    if (this._poi) this._poi.render(ctx, cam);

    ctx.restore();

    // ── INFO PANEL ────────────────────────────────────────────────────────
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

    ctx.fillStyle = CYAN;
    ctx.font = 'bold 11px monospace';
    ctx.fillText('[ POI DESIGNER ]', MARGIN, y);
    y += 22;

    this._divider(ctx, y); y += 8;

    ctx.fillStyle = DIM_TEXT;
    ctx.font = '10px monospace';
    ctx.fillText(`${this._index + 1} / ${ROSTER.length}`, MARGIN, y);
    y += 14;

    ctx.fillStyle = WHITE;
    ctx.font = 'bold 12px monospace';
    // Word-wrap the label
    y = this._wrapText(ctx, def.label, MARGIN, y, PANEL_W - MARGIN * 2, 16, WHITE, 'bold 12px monospace');
    y += 6;

    ctx.fillStyle = DIM_TEXT;
    ctx.font = '10px monospace';
    ctx.fillText('← → cycle  •  R reset view', MARGIN, y); y += 14;
    ctx.fillText('scroll: zoom  •  drag: pan',  MARGIN, y); y += 20;

    this._divider(ctx, y); y += 10;

    ctx.fillStyle = DIM_TEXT;
    ctx.font = '10px monospace';
    ctx.fillText(def.file, MARGIN, y); y += 20;

    // POI-specific info
    for (const [k, v] of Object.entries(def.info)) {
      ctx.fillStyle = DIM_TEXT;
      ctx.font = '10px monospace';
      ctx.textAlign = 'left';
      ctx.fillText(k, MARGIN, y);
      ctx.fillStyle = WHITE;
      ctx.textAlign = 'right';
      ctx.fillText(String(v), PANEL_W - MARGIN, y);
      ctx.textAlign = 'left';
      y += 16;
    }

    y += 4;
    this._divider(ctx, y); y += 10;

    // Zoom readout
    ctx.fillStyle = AMBER;
    ctx.font = '10px monospace';
    ctx.fillText(`Zoom: ${this._zoom.toFixed(2)}×`, MARGIN, y); y += 16;

    // World-origin position readout
    const originWorld = {
      x: -(this._panX / this._zoom),
      y: -(this._panY / this._zoom),
    };
    ctx.fillStyle = DIM_TEXT;
    ctx.fillText(`Pan: (${originWorld.x.toFixed(0)}, ${originWorld.y.toFixed(0)})`, MARGIN, y);

    ctx.restore();
  }

  _divider(ctx, y) {
    ctx.fillStyle = DIM_OUTLINE;
    ctx.fillRect(MARGIN, y, PANEL_W - MARGIN * 2, 1);
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
