import { Ship } from '../../entities/ship.js';
import { BASE_SPEED, BASE_ACCELERATION, BASE_TURN_RATE, SPEED_FACTOR,
         BASE_HULL, BASE_CARGO,
         BASE_FUEL_MAX, BASE_FUEL_EFFICIENCY } from '../../data/tuning/shipTuning.js';
import { drawEngineGlow } from '../../systems/engineGlow.js';

const SPEED_MULT = 1.3;   // ~109 u/s — fast but not a racer
const ACCEL_MULT = 1.2;   // responsive, not twitchy
const TURN_MULT  = 1.15;  // handles well, not a sports car
const HULL_MULT  = 0.85;  // 170 hp — solid everyday frame
const CARGO_MULT = 0.3;   // 15 units — small trunk

// Armor arc multipliers (× BASE_ARMOR = 100)
const ARMOR_FRONT = 1.0;  // 100 — standard nose
const ARMOR_SIDE  = 1.0;  // 100 — protected flanks
const ARMOR_AFT   = 0.85; //  85 — decent stern

const FUEL_MAX_MULT = 0.8;  // 80 unit tank — decent range
const FUEL_EFF_MULT = 0.9;  // burns at 90% base rate — economical enough

// Personal courier — narrow flat nose, one quick shoulder flare, then long
// straight sides to a wide flat stern. Boxy vehicle proportions.
export const HULL_POINTS = [
  { x: -3,  y: -10 },  // port nose
  { x:  3,  y: -10 },  // starboard nose
  { x:  7,  y:  -7 },  // starboard shoulder (quick flare)
  { x:  7,  y:   5 },  // starboard body (long straight run)
  { x:  5,  y:   9 },  // starboard haunch
  { x:  3,  y:  11 },  // starboard stern corner
  { x: -3,  y:  11 },  // port stern corner
  { x: -5,  y:   9 },  // port haunch
  { x: -7,  y:   5 },  // port body (long straight run)
  { x: -7,  y:  -7 },  // port shoulder (quick flare)
];

// Cockpit block — rectangular, flush with nose
const COCKPIT = [
  { x: -2, y: -10 },
  { x:  2, y: -10 },
  { x:  2, y:  -3 },
  { x: -2, y:  -3 },
];

// Belt line — at mid-body
const BELT_LINE = [
  { x: -7, y: 0 },
  { x:  7, y: 0 },
];

// Single center engine
const ENGINE_POS = [{ x: 0, y: 11 }];

export class MaverickCourier extends Ship {
  constructor(x, y) {
    super(x, y);

    this.faction  = 'neutral';
    this.shipType = 'maverick-courier';

    this.flavorText =
      'A common personal courier built wide and muscular — more substance than the ' +
      'needle-ships but still fast enough to matter. Every settlement has three. ' +
      'Couriers, fixers, and people in a hurry all fly them. Strength: fast, solid ' +
      'enough to survive a graze, handles well. Weakness: small cargo, not built ' +
      'for a stand-up fight.';

    this._initArmorArcs(ARMOR_FRONT, ARMOR_SIDE, ARMOR_AFT);

    this.hullMax     = BASE_HULL * HULL_MULT;
    this.hullCurrent = this.hullMax;

    this.speedMax     = BASE_SPEED        * SPEED_MULT * SPEED_FACTOR;
    this.acceleration = BASE_ACCELERATION * ACCEL_MULT * SPEED_FACTOR;
    this.turnRate     = BASE_TURN_RATE    * TURN_MULT  * SPEED_FACTOR;

    this.cargoCapacity  = BASE_CARGO * CARGO_MULT;
    this.fuelMax        = BASE_FUEL_MAX * FUEL_MAX_MULT;
    this.fuelEfficiency = BASE_FUEL_EFFICIENCY * FUEL_EFF_MULT;
  }

  get _engineOffsets() {
    return ENGINE_POS;
  }

  _drawShape(ctx) {
    // Main hull
    ctx.beginPath();
    ctx.moveTo(HULL_POINTS[0].x, HULL_POINTS[0].y);
    for (let i = 1; i < HULL_POINTS.length; i++) {
      ctx.lineTo(HULL_POINTS[i].x, HULL_POINTS[i].y);
    }
    ctx.closePath();
    ctx.fillStyle = this.hullFill;
    ctx.fill();
    ctx.strokeStyle = this.hullStroke;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Cockpit canopy — slightly lighter fill
    ctx.beginPath();
    ctx.moveTo(COCKPIT[0].x, COCKPIT[0].y);
    for (let i = 1; i < COCKPIT.length; i++) ctx.lineTo(COCKPIT[i].x, COCKPIT[i].y);
    ctx.closePath();
    ctx.fillStyle = this.hullFill;
    ctx.globalAlpha = 0.5;
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.strokeStyle = this.hullStroke;
    ctx.lineWidth = 1;
    ctx.stroke();

    // Belt line crease
    ctx.beginPath();
    ctx.moveTo(BELT_LINE[0].x, BELT_LINE[0].y);
    ctx.lineTo(BELT_LINE[1].x, BELT_LINE[1].y);
    ctx.strokeStyle = this.hullStroke;
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.3;
    ctx.stroke();
    ctx.globalAlpha = 1;

    // Engine glow
    drawEngineGlow(ctx, ENGINE_POS, this.engineColor, 2 + this.throttleLevel * 0.5, 2, 2, 0.3);
  }

  getBounds() {
    return { x: this.x, y: this.y, radius: 12 };
  }
}
