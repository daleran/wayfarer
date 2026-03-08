import { Entity } from '../entities/entity.js';
import { AMBER, DIM_TEXT } from '../ui/colors.js';

const INTERACTION_RADIUS = 120;

export class Derelict extends Entity {
  constructor(x, y) {
    super(x, y);
    this.name = 'Derelict';
    this.lootTable = [];
    this.salvageTime = 3;
    this.interactionRadius = INTERACTION_RADIUS;
    this.salvaged = false;
    this._sparkTimer = 0;
    // Fixed tilted rotation
    this.rotation = (Math.random() - 0.5) * 1.2;
  }

  update(dt) {
    // Static — no movement. Spark timer managed by GameManager.
  }

  render(ctx, camera) {
    if (this.salvaged) return;
    const screen = camera.worldToScreen(this.x, this.y);

    ctx.save();
    ctx.translate(screen.x, screen.y);
    ctx.scale(camera.zoom, camera.zoom);
    ctx.rotate(this.rotation);

    // Irregular wreck polygon
    ctx.beginPath();
    ctx.moveTo(-12, -18);
    ctx.lineTo(8, -16);
    ctx.lineTo(15, -6);
    ctx.lineTo(14, 8);
    ctx.lineTo(6, 16);
    ctx.lineTo(-8, 14);
    ctx.lineTo(-16, 4);
    ctx.lineTo(-14, -10);
    ctx.closePath();
    ctx.fillStyle = 'rgba(30,20,5,0.3)';
    ctx.fill();
    ctx.strokeStyle = '#886633';
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.6;
    ctx.stroke();

    // Damage gash lines
    ctx.globalAlpha = 0.4;
    ctx.strokeStyle = '#553311';
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

    // Name label
    ctx.save();
    ctx.font = '10px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillStyle = DIM_TEXT;
    ctx.fillText(this.name, screen.x, screen.y + 22 * camera.zoom);
    ctx.restore();
  }

  getBounds() {
    return { x: this.x, y: this.y, radius: 20 };
  }
}

export function createDerelict(data) {
  const d = new Derelict(data.x, data.y);
  d.name = data.name || 'Derelict';
  d.lootTable = data.lootTable || [];
  d.salvageTime = data.salvageTime || 3;
  return d;
}
