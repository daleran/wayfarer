// Arkship Spines — shattered structural beams from the Exile Fleet.
// Merges renderer class + placement data.

import { Entity } from '@/entities/entity.js';
import { DIM_OUTLINE, VERY_DIM } from '@/rendering/colors.js';
import { registerContent } from '@data/dataRegistry.js';

// ── Renderer ────────────────────────────────────────────────────────────────

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

// ── Placement data ──────────────────────────────────────────────────────────
// Much larger than ships: 3000–6000 units long, 150–300 wide.

const SPINES = [
  // Western approach corridor
  { x: 4200,  y: 3200, rotation: 0.35,  length: 4500, width: 220 },
  { x: 3500,  y: 6800, rotation: -0.25, length: 3800, width: 190 },
  // Mid-zone (flanking trade path)
  { x: 7800,  y: 2500, rotation: 0.80,  length: 5500, width: 270 },
  { x: 8500,  y: 7200, rotation: -0.60, length: 4800, width: 240 },
  // Deep zone (surrounding The Coil)
  { x: 11200, y: 2000, rotation: 0.15,  length: 6000, width: 300 },
  { x: 15000, y: 6800, rotation: 1.20,  length: 4000, width: 200 },
  { x: 16500, y: 3500, rotation: -0.90, length: 5000, width: 250 },
  { x: 10500, y: 8200, rotation: 2.10,  length: 3500, width: 175 },
];

export const ArkshipSpines = {
  instantiate() {
    return SPINES.map(d => createArkshipSpine(d));
  },
};

registerContent('terrain', 'arkship-spines', {
  label: 'Arkship Spine',
  createSingle: createArkshipSpine,
  instantiate: ArkshipSpines.instantiate,
});
