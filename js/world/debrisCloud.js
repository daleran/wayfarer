import { Entity } from '../entities/entity.js';
import { VERY_DIM } from '../rendering/colors.js';

export class DebrisCloud extends Entity {
  constructor(x, y, data) {
    super(x, y);
    this.spreadRadius = data.spreadRadius ?? 200;
    this.fragmentCount = data.fragmentCount ?? 18;
    this._fragments = this._generateFragments();
  }

  _generateFragments() {
    const frags = [];
    // Deterministic layout using golden angle distribution
    const goldenAngle = 2.399963;
    for (let i = 0; i < this.fragmentCount; i++) {
      const r = Math.sqrt((i + 0.5) / this.fragmentCount) * this.spreadRadius;
      const theta = i * goldenAngle;
      const fx = Math.cos(theta) * r;
      const fy = Math.sin(theta) * r;
      // Semi-random size and angle seeded by index
      const size = 4 + ((i * 7) % 9);
      const aspect = 0.3 + ((i * 13) % 5) * 0.1;
      const angle = (i * 1.618) % (Math.PI * 2);
      frags.push({ fx, fy, size, aspect, angle });
    }
    return frags;
  }

  update(_dt) {
    // Static terrain — no update
  }

  render(ctx, camera) {
    const screen = camera.worldToScreen(this.x, this.y);

    ctx.save();
    ctx.translate(screen.x, screen.y);
    ctx.scale(camera.zoom, camera.zoom);
    ctx.strokeStyle = VERY_DIM;
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.35;

    for (const frag of this._fragments) {
      const hw = frag.size;
      const hh = frag.size * frag.aspect;

      ctx.save();
      ctx.translate(frag.fx, frag.fy);
      ctx.rotate(frag.angle);

      // Elongated pentagon polygon
      ctx.beginPath();
      ctx.moveTo(0, -hw);
      ctx.lineTo(hh, -hw * 0.4);
      ctx.lineTo(hh * 0.6, hw);
      ctx.lineTo(-hh * 0.6, hw);
      ctx.lineTo(-hh, -hw * 0.4);
      ctx.closePath();
      ctx.stroke();

      ctx.restore();
    }

    ctx.globalAlpha = 1;
    ctx.restore();
  }

  getBounds() {
    return { x: this.x, y: this.y, radius: this.spreadRadius + 20 };
  }
}

export function createDebrisCloud(data) {
  return new DebrisCloud(data.x, data.y, data);
}
