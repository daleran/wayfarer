import { Ship } from '../../entities/ship.js';
import { LaserTurret } from '../../weapons/laserTurret.js';

// 5-point hull polygon — nose pointing up (north, negative Y).
const HULL_POINTS = [
  { x: 0,   y: -14 }, // nose
  { x: 10,  y:   4 }, // starboard shoulder
  { x: 6,   y:  12 }, // starboard stern
  { x: -6,  y:  12 }, // port stern
  { x: -10, y:   4 }, // port shoulder
];

class Raider extends Ship {
  constructor(x, y) {
    super(x, y);

    this.armorMax = 40;
    this.armorCurrent = 40;
    this.hullMax = 60;
    this.hullCurrent = 60;

    this.speedMax = 150;
    this.acceleration = 40;
    this.turnRate = 3.0;
    this.throttleLevels = 5;
    this._throttleRatios = [0, 0.25, 0.5, 0.75, 1.0];

    this.addWeapon(new LaserTurret());
  }

  _drawShape(ctx) {
    ctx.beginPath();
    ctx.moveTo(HULL_POINTS[0].x, HULL_POINTS[0].y);
    for (let i = 1; i < HULL_POINTS.length; i++) {
      ctx.lineTo(HULL_POINTS[i].x, HULL_POINTS[i].y);
    }
    ctx.closePath();

    ctx.fillStyle = 'rgba(120, 20, 20, 0.6)';
    ctx.fill();
    ctx.strokeStyle = '#f64';
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }

  getBounds() {
    return { x: this.x, y: this.y, radius: 14 };
  }
}

export function createRaider(x, y) {
  return new Raider(x, y);
}
