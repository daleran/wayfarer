import { Ship } from '../../entities/ship.js';
import { LaserTurret } from '../../weapons/laserTurret.js';
import { ENEMY_FILL, ENEMY_STROKE, RED, ENGINE_RED } from '../../ui/colors.js';

// 5-point hull polygon — nose pointing up (north, negative Y).
const HULL_POINTS = [
  { x: 0,   y: -14 }, // nose
  { x: 10,  y:   4 }, // starboard shoulder
  { x: 6,   y:  12 }, // starboard stern
  { x: -6,  y:  12 }, // port stern
  { x: -10, y:   4 }, // port shoulder
];

const ENGINE_POS = [
  { x: 4, y: 10 },
  { x: -4, y: 10 },
];

class Raider extends Ship {
  constructor(x, y) {
    super(x, y);

    this.faction = 'scavenger';
    this._trailColor = RED;

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

  get _engineOffsets() {
    return ENGINE_POS;
  }

  _drawShape(ctx) {
    ctx.beginPath();
    ctx.moveTo(HULL_POINTS[0].x, HULL_POINTS[0].y);
    for (let i = 1; i < HULL_POINTS.length; i++) {
      ctx.lineTo(HULL_POINTS[i].x, HULL_POINTS[i].y);
    }
    ctx.closePath();

    ctx.fillStyle = ENEMY_FILL;
    ctx.fill();
    ctx.strokeStyle = ENEMY_STROKE;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Engine glow — pulsing circles (red/orange)
    const pulse = 0.6 + Math.sin(Date.now() * 0.008) * 0.4;
    const baseRadius = 1.5 + this.throttleLevel * 0.4;

    for (const pos of ENGINE_POS) {
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, baseRadius, 0, Math.PI * 2);
      ctx.strokeStyle = ENGINE_RED;
      ctx.lineWidth = 1.5;
      ctx.globalAlpha = pulse;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(pos.x, pos.y, baseRadius + 2 + pulse * 2, 0, Math.PI * 2);
      ctx.strokeStyle = RED;
      ctx.lineWidth = 1;
      ctx.globalAlpha = pulse * 0.3;
      ctx.stroke();

      ctx.globalAlpha = 1;
    }
  }

  getBounds() {
    return { x: this.x, y: this.y, radius: 14 };
  }
}

export function createRaider(x, y) {
  return new Raider(x, y);
}
