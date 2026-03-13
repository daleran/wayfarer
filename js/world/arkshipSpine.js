import { Entity } from '../entities/entity.js';
import { DIM_OUTLINE, VERY_DIM } from '../rendering/colors.js';

export class ArkshipSpine extends Entity {
  constructor(x, y, data) {
    super(x, y);
    this.length = data.length ?? 800;
    this.width = data.width ?? 70;
    this.rotation = data.rotation ?? 0;
  }

  update(_dt) {
    // Static terrain — no update
  }

  render(ctx, camera) {
    const screen = camera.worldToScreen(this.x, this.y);
    const cx = screen.x;
    const cy = screen.y;

    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(camera.zoom, camera.zoom);
    ctx.rotate(this.rotation);

    const hw = this.width / 2;
    const hl = this.length / 2;
    const ribCount = Math.floor(this.length / 120);
    const ribSpacing = this.length / (ribCount + 1);

    // Outer wireframe hull
    ctx.strokeStyle = DIM_OUTLINE;
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.5;
    ctx.strokeRect(-hl, -hw, this.length, this.width);

    // Longitudinal spine (center line)
    ctx.globalAlpha = 0.3;
    ctx.beginPath();
    ctx.moveTo(-hl, 0);
    ctx.lineTo(hl, 0);
    ctx.stroke();

    // Vertical cross-member ribs
    ctx.strokeStyle = VERY_DIM;
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.2;
    for (let i = 1; i <= ribCount; i++) {
      const rx = -hl + ribSpacing * i;
      ctx.beginPath();
      ctx.moveTo(rx, -hw);
      ctx.lineTo(rx, hw);
      ctx.stroke();
    }

    // Diagonal X-bracing per section
    ctx.globalAlpha = 0.15;
    for (let i = 0; i <= ribCount; i++) {
      const x0 = -hl + ribSpacing * i;
      const x1 = -hl + ribSpacing * (i + 1);
      // Forward diagonal
      ctx.beginPath();
      ctx.moveTo(x0, -hw);
      ctx.lineTo(x1, hw);
      ctx.stroke();
      // Back diagonal
      ctx.beginPath();
      ctx.moveTo(x0, hw);
      ctx.lineTo(x1, -hw);
      ctx.stroke();
    }

    ctx.globalAlpha = 1;
    ctx.restore();
  }

  getBounds() {
    // Circumscribed circle radius
    const hl = this.length / 2;
    const hw = this.width / 2;
    return { x: this.x, y: this.y, radius: Math.sqrt(hl * hl + hw * hw) };
  }
}

export function createArkshipSpine(data) {
  return new ArkshipSpine(data.x, data.y, data);
}
