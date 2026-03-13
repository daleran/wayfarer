import { Entity } from '../entities/entity.js';
import { G100ClassHauler } from '../ships/classes/g100Hauler.js';
import { MaverickCourier } from '../ships/classes/maverickCourier.js';
import { GarrisonFrigate } from '../ships/classes/garrisonFrigate.js';
import { OnyxClassTug } from '../ships/classes/onyxTug.js';
import { AMBER, DIM_TEXT } from '../rendering/colors.js';

const INTERACTION_RADIUS = 120;
const HULL_ALPHA = 0.55;

// Maps derelict class names to ship class constructors.
// The delegate instance is used only for _drawShape — it never moves or fires.
const DELEGATE_CLASSES = {
  hauler:  G100ClassHauler,
  fighter: MaverickCourier,
  frigate: GarrisonFrigate,
  unknown: OnyxClassTug,
};

function _makeDelegate(derelictClass) {
  const Cls = DELEGATE_CLASSES[derelictClass] ?? G100ClassHauler;
  const d = new Cls(0, 0);
  d.relation = 'derelict';  // grey fill/stroke via RELATION_COLORS
  return d;
}

export class Derelict extends Entity {
  constructor(x, y) {
    super(x, y);
    this.name = 'Derelict';
    this.lootTable = [];
    this.salvageTime = 3;
    this.interactionRadius = INTERACTION_RADIUS;
    this.salvaged = false;
    this._sparkTimer = 0;
    this.derelictClass = 'hauler';
    this.loreText = [];
    this.isNearby = false;
    this._loreAlpha = 0;
    this.rotation = (Math.random() - 0.5) * 1.2;

    // Shape delegate — set in createDerelict once derelictClass is known
    this._delegate = null;
  }

  render(ctx, camera) {
    if (this.salvaged) return;
    const screen = camera.worldToScreen(this.x, this.y);
    const delegate = this._delegate;

    // Draw ship hull via delegate
    ctx.save();
    ctx.translate(screen.x, screen.y);
    ctx.scale(camera.zoom, camera.zoom);
    ctx.rotate(this.rotation);
    ctx.globalAlpha = HULL_ALPHA;
    if (delegate) delegate._drawShape(ctx);
    ctx.globalAlpha = 1;
    ctx.restore();

    // Lore paragraph — fades in as player approaches
    if (this._loreAlpha > 0 && this.loreText && this.loreText.length > 0) {
      const loreX = screen.x + 28 * camera.zoom + 10;
      const loreY = screen.y - (this.loreText.length - 1) * 6;
      ctx.save();
      ctx.font = '9px monospace';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillStyle = DIM_TEXT;
      ctx.globalAlpha = this._loreAlpha * 0.75;
      for (let i = 0; i < this.loreText.length; i++) {
        ctx.fillText(this.loreText[i], loreX, loreY + i * 13);
      }
      ctx.restore();
    }

    // "Press E" prompt — blinking, only at interaction range
    if (this.isNearby) {
      const alpha = 0.55 + Math.sin(Date.now() * 0.004) * 0.35;
      const promptY = screen.y + (this.getBounds().radius + 14) * camera.zoom;
      ctx.save();
      ctx.font = '11px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillStyle = AMBER;
      ctx.globalAlpha = alpha;
      ctx.fillText('[ E ] SALVAGE', screen.x, promptY);
      ctx.restore();
    }
  }

  getBounds() {
    const r = this._delegate ? this._delegate.getBounds().radius : 20;
    return { x: this.x, y: this.y, radius: r };
  }
}

export function createDerelict(data) {
  const d = new Derelict(data.x, data.y);
  d.name        = data.name        || 'Derelict';
  d.lootTable   = data.lootTable   || [];
  d.salvageTime = data.salvageTime || 3;
  d.derelictClass = data.derelictClass || 'hauler';
  d.loreText    = data.loreText    || [];
  d._delegate   = _makeDelegate(d.derelictClass);
  return d;
}
