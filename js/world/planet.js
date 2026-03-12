import { Entity } from '../entities/entity.js';
import { CYAN } from '../ui/colors.js';

export class Planet extends Entity {
  constructor(x, y, data) {
    super(x, y);
    this.name = data.name;
    this.radius = data.radius ?? 120;
    this.colorInner = data.colorInner ?? '#2a6a2a';
    this.colorOuter = data.colorOuter ?? '#1a3a1a';
  }

  update(_dt) {}

  render(ctx, camera) {
    const screen = camera.worldToScreen(this.x, this.y);
    const cx = screen.x;
    const cy = screen.y;
    const r = this.radius * camera.zoom;

    ctx.save();

    // Faint solid fill — no gradient
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fillStyle = this.colorOuter;
    ctx.globalAlpha = 0.25;
    ctx.fill();
    ctx.globalAlpha = 1;

    // Outline circle
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.strokeStyle = this.colorInner;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Name label
    ctx.font = '11px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillStyle = CYAN;
    ctx.globalAlpha = 0.7;
    ctx.fillText(this.name, cx, cy + r + 6);
    ctx.globalAlpha = 1;

    ctx.restore();
  }

  getBounds() {
    return { x: this.x, y: this.y, radius: this.radius };
  }
}

export function createPlanet(data) {
  return new Planet(data.x, data.y, data);
}
