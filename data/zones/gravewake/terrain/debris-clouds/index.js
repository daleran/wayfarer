// Debris Clouds — procedural debris clusters forming the Wall of Wrecks.
// Merges renderer class + placement data.

import { Entity } from '@/entities/entity.js';
import { VERY_DIM } from '@/rendering/colors.js';
import { registerContent } from '@data/dataRegistry.js';

// ── Renderer ────────────────────────────────────────────────────────────────

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

// ── Wall of Wrecks — placement data ─────────────────────────────────────────
// Diagonal debris belt creating 2 trade lane chokepoints.
// Belt runs NW→SE across the mid-zone.

const CLUSTERS = [
  { x: 5200,  y: 2800, spreadRadius: 700, fragmentCount: 45 },
  { x: 5700,  y: 3250, spreadRadius: 750, fragmentCount: 50 },
  { x: 6200,  y: 3700, spreadRadius: 680, fragmentCount: 42 },
  { x: 6700,  y: 4150, spreadRadius: 720, fragmentCount: 48 },
  { x: 7200,  y: 4600, spreadRadius: 690, fragmentCount: 44 },
  // gap (first trade lane)
  { x: 8200,  y: 5500, spreadRadius: 740, fragmentCount: 47 },
  { x: 8700,  y: 5950, spreadRadius: 710, fragmentCount: 46 },
  { x: 9200,  y: 6400, spreadRadius: 760, fragmentCount: 50 },
  { x: 9700,  y: 6850, spreadRadius: 700, fragmentCount: 44 },
  { x: 10200, y: 7300, spreadRadius: 730, fragmentCount: 48 },
  { x: 10700, y: 7750, spreadRadius: 750, fragmentCount: 46 },
  // gap (second trade lane)
  { x: 11700, y: 8650, spreadRadius: 720, fragmentCount: 45 },
  { x: 12200, y: 9100, spreadRadius: 700, fragmentCount: 42 },
];

export const WallOfWrecks = {
  instantiate() {
    return CLUSTERS.map(d => createDebrisCloud(d));
  },
};

registerContent('terrain', 'debris-clouds', {
  label: 'Debris Cloud',
  createSingle: createDebrisCloud,
  instantiate: WallOfWrecks.instantiate,
});
