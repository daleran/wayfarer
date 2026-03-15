// Snatcher Drone Hull — Concord autonomous intercept unit.
// Tiny hexagonal dart. Standalone hull class (unmanned machine, not a courier variant).

import { Ship } from '@/entities/ship.js';
import { CONCORD_BLUE } from '@/rendering/colors.js';
import { registerContent } from '@data/dataRegistry.js';

const DRONE_POINTS = [
  { x:  0, y: -14 },
  { x:  9, y:   0 },
  { x:  4, y:   6 },
  { x:  0, y:  10 },
  { x: -4, y:   6 },
  { x: -9, y:   0 },
];

export { DRONE_POINTS };

const ENGINE_POS = [{ x: 0, y: 10 }];

export class SnatcHerDroneHull extends Ship {
  constructor(x, y) {
    super(x, y);
    this.shipClassName = 'Snatcher Drone Hull';

    this._initStats({
      hull: 0.4, weight: 0.2, cargo: 0,
      fuelMax: 0,
      armorFront: 0.3, armorSide: 0.3, armorAft: 0.3,
    });

    // Unmanned machine — movement hardcoded (no engine module)
    this.speedMax     = 127;
    this.acceleration = 15;
    this.turnRate     = 0.89;
  }

  get _engineOffsets() {
    return ENGINE_POS;
  }

  _drawShape(ctx) {
    // Tiny hexagonal dart — Concord machine aesthetic
    ctx.beginPath();
    ctx.moveTo(DRONE_POINTS[0].x, DRONE_POINTS[0].y);
    for (let i = 1; i < DRONE_POINTS.length; i++) {
      ctx.lineTo(DRONE_POINTS[i].x, DRONE_POINTS[i].y);
    }
    ctx.closePath();
    ctx.fillStyle = this.hullFill;
    ctx.fill();
    ctx.strokeStyle = this.hullStroke;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Core dot
    ctx.beginPath();
    ctx.arc(0, 0, 3, 0, Math.PI * 2);
    ctx.fillStyle = CONCORD_BLUE;
    ctx.fill();
  }

  getBounds() {
    return { x: this.x, y: this.y, radius: 14 };
  }
}

registerContent('hulls', 'snatcher-drone-hull', {
  label: 'Snatcher Drone Hull',
  create: (x, y) => new SnatcHerDroneHull(x, y),
});
