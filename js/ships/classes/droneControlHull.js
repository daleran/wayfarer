// Drone Control Hull — Concord command platform.
// Wide sensor array, angular drone-bay notches. Extends GarrisonFrigate for base stats.

import { GarrisonFrigate } from './garrisonFrigate.js';
import { CONCORD_BLUE } from '@/rendering/colors.js';

const HULL_POINTS = [
  { x:  20, y: -55 },  // [0]  nose-top starboard
  { x:  30, y: -30 },  // [1]  shoulder flare
  { x:  55, y: -10 },  // [2]  max-width starboard
  { x:  55, y:  20 },  // [3]  starboard bay wall
  { x:  40, y:  35 },  // [4]  bay aft step
  { x:  25, y:  55 },  // [5]  aft pod outer starboard
  { x:  10, y:  60 },  // [6]  aft starboard corner
  { x: -10, y:  60 },  // [7]  aft port corner
  { x: -25, y:  55 },  // [8]  aft pod outer port
  { x: -40, y:  35 },  // [9]  bay aft step port
  { x: -55, y:  20 },  // [10] port bay wall
  { x: -55, y: -10 },  // [11] max-width port
  { x: -30, y: -30 },  // [12] shoulder flare port
  { x: -20, y: -55 },  // [13] nose-top port
];

export { HULL_POINTS };

export class DroneControlHull extends GarrisonFrigate {
  constructor(x, y) {
    super(x, y);
    this.shipClassName = 'Drone Control Hull';
  }

  _drawShape(ctx) {
    // Main hull polygon — Concord geometric profile
    ctx.beginPath();
    ctx.moveTo(HULL_POINTS[0].x, HULL_POINTS[0].y);
    for (let i = 1; i < HULL_POINTS.length; i++) {
      ctx.lineTo(HULL_POINTS[i].x, HULL_POINTS[i].y);
    }
    ctx.closePath();
    ctx.fillStyle = this.hullFill;
    ctx.fill();
    ctx.strokeStyle = this.hullStroke;
    ctx.lineWidth = 2;
    ctx.stroke();

    // Center spine — command module keel
    ctx.beginPath();
    ctx.moveTo(0, -48);
    ctx.lineTo(0, 55);
    ctx.strokeStyle = CONCORD_BLUE;
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.35;
    ctx.stroke();

    // Lateral bay notch detail lines — drone bay slots
    ctx.globalAlpha = 0.35;
    for (const bx of [40, -40]) {
      ctx.beginPath();
      ctx.moveTo(bx, -5);
      ctx.lineTo(bx,  30);
      ctx.stroke();
    }

    ctx.globalAlpha = 1;
  }

  getBounds() {
    return { x: this.x, y: this.y, radius: 58 };
  }
}
