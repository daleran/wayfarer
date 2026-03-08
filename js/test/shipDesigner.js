// Ship Designer — ?test-ships
// Left panel: stats. Right: ship at large scale. ←/→ cycle, T toggle rotation.
// Call ship._drawShape() directly after ctx.scale() — no Camera needed.

import { input } from '../input.js';
import { createScrapShip } from '../ships/player/flagship.js';
import { createGunship } from '../ships/player/gunship.js';
import { createFrigate } from '../ships/player/frigate.js';
import { createHauler } from '../ships/player/hauler.js';
import { createRaider } from '../enemies/scavengers/raider.js';
import {
  CYAN, AMBER, GREEN, WHITE,
  DIM_TEXT, DIM_OUTLINE,
} from '../ui/colors.js';

const PANEL_W  = 260;
const MARGIN   = 14;
const SHIP_SCALE = 7;

const ROSTER = [
  { label: 'ScrapShip',  file: 'js/ships/player/flagship.js',           create: () => createScrapShip(0, 0) },
  { label: 'Brawler',    file: 'js/ships/player/gunship.js',             create: () => createGunship(0, 0)  },
  { label: 'Frigate',    file: 'js/ships/player/frigate.js',             create: () => createFrigate(0, 0)  },
  { label: 'Hauler',     file: 'js/ships/player/hauler.js',              create: () => createHauler(0, 0)   },
  { label: 'Raider',     file: 'js/enemies/scavengers/raider.js',        create: () => createRaider(0, 0)   },
];

export class ShipDesigner {
  constructor() {
    this.canvas = null;
    this.ctx    = null;
    this._index = 0;
    this._ship  = null;
    this._autoRotate = false;
    this._angle = 0;
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
    this._load();
  }

  _load() {
    this._ship  = ROSTER[this._index].create();
    this._angle = 0;
  }

  update(dt) {
    input.tick();
    if (input.wasJustPressed('arrowleft'))  {
      this._index = (this._index - 1 + ROSTER.length) % ROSTER.length;
      this._load();
    }
    if (input.wasJustPressed('arrowright')) {
      this._index = (this._index + 1) % ROSTER.length;
      this._load();
    }
    if (input.wasJustPressed('t')) this._autoRotate = !this._autoRotate;
    if (this._autoRotate) this._angle += dt * 0.5;
  }

  render() {
    const { ctx, canvas } = this;
    const W = canvas.width;
    const H = canvas.height;
    const ship = this._ship;
    const def  = ROSTER[this._index];

    // ── BACKGROUND ────────────────────────────────────────────────────────
    ctx.fillStyle = '#000810';
    ctx.fillRect(0, 0, W, H);

    // ── PREVIEW AREA ──────────────────────────────────────────────────────
    const pcx = PANEL_W + (W - PANEL_W) / 2;
    const pcy = H / 2;

    // Crosshair
    ctx.save();
    ctx.strokeStyle = '#0d1e2e';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 10]);
    ctx.beginPath(); ctx.moveTo(PANEL_W, pcy); ctx.lineTo(W, pcy); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(pcx, 0);       ctx.lineTo(pcx, H); ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();

    // Scale reference ring (radius = 25 ship-local units × scale)
    ctx.save();
    ctx.beginPath();
    ctx.arc(pcx, pcy, 25 * SHIP_SCALE, 0, Math.PI * 2);
    ctx.strokeStyle = '#091525';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.restore();

    // Ship
    ctx.save();
    ctx.translate(pcx, pcy);
    ctx.scale(SHIP_SCALE, SHIP_SCALE);
    ctx.rotate(this._angle);
    ship._drawShape(ctx);
    ctx.restore();

    // Scale label
    ctx.save();
    ctx.font = '10px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillStyle = DIM_TEXT;
    ctx.fillText(`${SHIP_SCALE}× scale  •  ${def.file}`, pcx, 12);
    ctx.restore();

    // ── STATS PANEL ───────────────────────────────────────────────────────
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
    ctx.fillText('[ SHIP DESIGNER ]', MARGIN, y);
    y += 22;

    this._divider(ctx, y); y += 8;

    // Ship selector
    ctx.fillStyle = DIM_TEXT;
    ctx.font = '10px monospace';
    ctx.fillText(`${this._index + 1} / ${ROSTER.length}`, MARGIN, y);
    y += 14;

    ctx.fillStyle = WHITE;
    ctx.font = 'bold 13px monospace';
    ctx.fillText(def.label, MARGIN, y);
    y += 20;

    ctx.fillStyle = DIM_TEXT;
    ctx.font = '10px monospace';
    ctx.fillText(`← → cycle  •  T rotate [${this._autoRotate ? 'ON' : 'OFF'}]`, MARGIN, y);
    y += 22;

    this._divider(ctx, y); y += 8;

    // Stats
    this._header(ctx, 'HULL', y); y += 22;
    this._row(ctx, 'Hull HP',    ship.hullMax,          GREEN, y); y += 16;
    this._row(ctx, 'Cargo',      ship.cargoCapacity,    AMBER, y); y += 16;

    this._header(ctx, 'ARMOR ARCS', y); y += 22;
    this._row(ctx, 'Front',      ship.armorArcsMax.front,     GREEN, y); y += 16;
    this._row(ctx, 'Port',       ship.armorArcsMax.port,      GREEN, y); y += 16;
    this._row(ctx, 'Starboard',  ship.armorArcsMax.starboard, GREEN, y); y += 16;
    this._row(ctx, 'Aft',        ship.armorArcsMax.aft,       GREEN, y); y += 16;

    this._header(ctx, 'MOVEMENT', y); y += 22;
    this._row(ctx, 'Speed Max',    ship.speedMax,                    AMBER, y); y += 16;
    this._row(ctx, 'Acceleration', ship.acceleration,                AMBER, y); y += 16;
    this._row(ctx, 'Turn Rate',    ship.turnRate.toFixed(2) + ' r/s', AMBER, y); y += 16;

    this._header(ctx, 'THROTTLE', y); y += 22;
    ctx.fillStyle = WHITE;
    ctx.font = '10px monospace';
    ctx.fillText(ship._throttleRatios.join(' / '), MARGIN, y);
    y += 20;

    if (ship.weapons.length > 0) {
      this._header(ctx, 'WEAPONS', y); y += 22;
      for (const w of ship.weapons) {
        const tag  = w.isAutoFire ? '[auto]' : w.isSecondary ? '[sec]' : '[manual]';
        const name = w.constructor.name;
        ctx.fillStyle = DIM_TEXT;
        ctx.font = '10px monospace';
        ctx.fillText(name + ' ' + tag, MARGIN, y);
        y += 14;
        if (w.damage != null) {
          const detail = [
            w.damage != null ? `${w.damage} dmg` : null,
            w.cooldownMax != null ? `${(w.cooldownMax * 1000).toFixed(0)}ms cd` : null,
            w.maxRange != null ? `${w.maxRange}u range` : null,
          ].filter(Boolean).join('  ');
          ctx.fillStyle = AMBER;
          ctx.fillText('  ' + detail, MARGIN, y);
          y += 14;
        }
      }
    }

    this._divider(ctx, y); y += 10;
    ctx.fillStyle = DIM_TEXT;
    ctx.font = '10px monospace';
    ctx.fillText('Edit hull in ship JS file.', MARGIN, y); y += 14;
    ctx.fillText('Vite HMR reloads on save.', MARGIN, y);

    ctx.restore();
  }

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
}
