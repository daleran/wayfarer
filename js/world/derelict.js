import { Entity } from '../entities/entity.js';
import { AMBER, DIM_TEXT, MAGENTA, DERELICT_HAULER, DERELICT_FIGHTER, DERELICT_FRIGATE } from '../ui/colors.js';

const INTERACTION_RADIUS = 120;

// Hull shape point arrays — scaled at render time
// class: hauler — fat 8-point octagon (original shape)
const SHAPE_HAULER = [
  { x: -12, y: -18 }, { x: 8, y: -16 }, { x: 15, y: -6 }, { x: 14, y: 8 },
  { x: 6,  y:  16 }, { x: -8, y: 14 }, { x: -16, y: 4 }, { x: -14, y: -10 },
];

// class: fighter — narrow dart, pointed fore
const SHAPE_FIGHTER = [
  { x: 0, y: -22 }, { x: 5, y: -12 }, { x: 14, y: -4 }, { x: 10, y: 8 },
  { x: 3, y:  14 }, { x: -3, y: 14 }, { x: -10, y: 8 },
];

// class: frigate — wide H/I-beam profile matching Garrison Class shape language
const SHAPE_FRIGATE = [
  { x: -18, y: -14 }, { x: -8, y: -14 }, { x: -8, y: -8 }, { x: 8, y: -8 },
  { x: 8,  y: -14 }, { x: 18, y: -14 }, { x: 18, y: -4 }, { x: 14, y: 0 },
  { x: 18, y:  4  }, { x: 18, y:  14 }, { x: -18, y: 14 }, { x: -18, y: -14 },
];

// class: unknown — irregular asymmetric 9-point
const SHAPE_UNKNOWN = [
  { x: -6, y: -20 }, { x: 10, y: -16 }, { x: 18, y: -4 }, { x: 14, y: 6 },
  { x: 6,  y:  18 }, { x: -4, y: 14 }, { x: -18, y: 10 }, { x: -16, y: -6 },
  { x: -8, y: -14 },
];

const SHAPES = {
  hauler:  SHAPE_HAULER,
  fighter: SHAPE_FIGHTER,
  frigate: SHAPE_FRIGATE,
  unknown: SHAPE_UNKNOWN,
};

const CLASS_COLORS = {
  hauler:  DERELICT_HAULER,
  fighter: DERELICT_FIGHTER,
  frigate: DERELICT_FRIGATE,
  unknown: MAGENTA,
};

const FILL_COLOR = 'rgba(30,20,5,0.3)';

export class Derelict extends Entity {
  constructor(x, y) {
    super(x, y);
    this.name = 'Derelict';
    this.lootTable = [];
    this.lootTableId = null;  // optional table id for generated loot
    this.salvageTime = 3;
    this.interactionRadius = INTERACTION_RADIUS;
    this.salvaged = false;
    this._sparkTimer = 0;
    this.derelictClass = 'hauler';  // hauler | fighter | frigate | unknown
    this.loreText = [];             // 2-3 short lore lines shown on map
    this.isNearby = false;          // set by game when player is in interaction range
    this._loreAlpha = 0;            // fades in when player enters lore range (wider than interaction)
    // Fixed tilted rotation
    this.rotation = (Math.random() - 0.5) * 1.2;
  }

  render(ctx, camera) {
    if (this.salvaged) return;
    const screen = camera.worldToScreen(this.x, this.y);
    const hullColor = CLASS_COLORS[this.derelictClass] ?? DERELICT_HAULER;
    const pts = SHAPES[this.derelictClass] ?? SHAPE_HAULER;

    ctx.save();
    ctx.translate(screen.x, screen.y);
    ctx.scale(camera.zoom, camera.zoom);
    ctx.rotate(this.rotation);

    // Hull polygon
    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
    ctx.closePath();
    ctx.fillStyle = FILL_COLOR;
    ctx.fill();
    ctx.strokeStyle = hullColor;
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.6;
    ctx.stroke();

    // Damage gash lines
    ctx.globalAlpha = 0.4;
    ctx.strokeStyle = 'rgba(80,40,10,0.8)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(-6, -12);
    ctx.lineTo(4, 6);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(2, -8);
    ctx.lineTo(10, 4);
    ctx.stroke();

    ctx.globalAlpha = 1;
    ctx.restore();

    // Lore paragraph — fades in as player approaches (wider range than interaction)
    if (this._loreAlpha > 0 && this.loreText && this.loreText.length > 0) {
      const loreX = screen.x + 28 * camera.zoom + 10;
      const loreY = screen.y - (this.loreText.length - 1) * 6;
      ctx.save();
      ctx.font = '9px monospace';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillStyle = DIM_TEXT;
      ctx.globalAlpha = this._loreAlpha * 0.40;
      for (let i = 0; i < this.loreText.length; i++) {
        ctx.fillText(this.loreText[i], loreX, loreY + i * 13);
      }
      ctx.restore();
    }

    // "Press E" prompt — below hull, blinking, only at interaction range
    if (this.isNearby) {
      const alpha = 0.55 + Math.sin(Date.now() * 0.004) * 0.35;
      ctx.save();
      ctx.font = '11px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillStyle = AMBER;
      ctx.globalAlpha = alpha;
      ctx.fillText(`[ E ] SALVAGE`, screen.x, screen.y + 42 * camera.zoom);
      ctx.restore();
    }
  }

  getBounds() {
    return { x: this.x, y: this.y, radius: 20 };
  }
}

export function createDerelict(data) {
  const d = new Derelict(data.x, data.y);
  d.name = data.name || 'Derelict';
  d.lootTable = data.lootTable || [];
  d.lootTableId = data.lootTableId || null;
  d.salvageTime = data.salvageTime || 3;
  d.derelictClass = data.derelictClass || 'hauler';
  d.loreText = data.loreText || [];
  return d;
}
