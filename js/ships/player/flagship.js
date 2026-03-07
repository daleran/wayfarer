import { Ship } from '../../entities/ship.js';

// 5-point hull polygon — nose pointing up (north, negative Y).
// Coordinates are relative to ship center, before rotation is applied.
const HULL_POINTS = [
  { x: 0,   y: -22 }, // nose
  { x: 12,  y:   2 }, // starboard shoulder
  { x: 8,   y:  16 }, // starboard stern
  { x: -8,  y:  16 }, // port stern
  { x: -12, y:   2 }, // port shoulder
];

// Engine glow positions (relative to ship center)
const ENGINE_POSITIONS = [
  { x: 6,  y: 14 },
  { x: -6, y: 14 },
];

class Flagship extends Ship {
  constructor(x, y) {
    super(x, y);

    // Override ship stats with flagship values (spec section 20)
    this.armorMax = 100;
    this.armorCurrent = 100;
    this.hullMax = 200;
    this.hullCurrent = 200;
    this.speedMax = 120;
    this.acceleration = 30;
    this.turnRate = 2.5;
    this.throttleLevels = 5;
    this._throttleRatios = [0, 0.25, 0.5, 0.75, 1.0];

    this.crewMax = 20;
    this.crewCurrent = 12;
    this.cargoCapacity = 100;
  }

  _drawShape(ctx) {
    // Hull
    ctx.beginPath();
    ctx.moveTo(HULL_POINTS[0].x, HULL_POINTS[0].y);
    for (let i = 1; i < HULL_POINTS.length; i++) {
      ctx.lineTo(HULL_POINTS[i].x, HULL_POINTS[i].y);
    }
    ctx.closePath();

    ctx.fillStyle = 'rgba(20, 80, 120, 0.6)';
    ctx.fill();
    ctx.strokeStyle = '#4af';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Engine glow (brighter at higher throttle)
    const glowAlpha = 0.3 + (this.throttleLevel / (this.throttleLevels - 1)) * 0.7;
    const glowRadius = 3 + this.throttleLevel * 1.5;

    for (const pos of ENGINE_POSITIONS) {
      const grad = ctx.createRadialGradient(pos.x, pos.y, 0, pos.x, pos.y, glowRadius);
      grad.addColorStop(0, `rgba(100, 180, 255, ${glowAlpha})`);
      grad.addColorStop(1, 'rgba(50, 100, 200, 0)');

      ctx.beginPath();
      ctx.arc(pos.x, pos.y, glowRadius, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();
    }
  }

  getBounds() {
    return { x: this.x, y: this.y, radius: 22 };
  }
}

export function createFlagship(x, y) {
  return new Flagship(x, y);
}
