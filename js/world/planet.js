import { Entity } from '../entities/entity.js';

export class Planet extends Entity {
  constructor(x, y, data) {
    super(x, y);
    this.name = data.name;
    this.radius = data.radius ?? 120;
    this.colorInner = data.colorInner ?? '#2a6a2a';
    this.colorOuter = data.colorOuter ?? '#1a3a1a';
  }

  update(dt) {}

  render(ctx, camera) {
    const screen = camera.worldToScreen(this.x, this.y);
    const cx = screen.x;
    const cy = screen.y;
    const r = this.radius; // world-units = screen pixels (no zoom)

    ctx.save();

    const grad = ctx.createRadialGradient(
      cx - r * 0.3, cy - r * 0.3, r * 0.1,
      cx, cy, r
    );
    grad.addColorStop(0, this.colorInner);
    grad.addColorStop(0.7, this.colorOuter);
    grad.addColorStop(1, 'rgba(0,0,0,0)');

    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.fill();

    ctx.font = '11px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillStyle = 'rgba(200, 220, 255, 0.7)';
    ctx.fillText(this.name, cx, cy + r + 6);

    ctx.restore();
  }

  getBounds() {
    return { x: this.x, y: this.y, radius: this.radius };
  }
}

export function createPlanet(data) {
  return new Planet(data.x, data.y, data);
}
