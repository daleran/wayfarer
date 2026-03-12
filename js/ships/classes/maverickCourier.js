import { Ship } from '../../entities/ship.js';
import { polygonFill, lines, engineGlow } from '../../rendering/draw.js';

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

    this._initStats({
      speed: SPEED_MULT, accel: ACCEL_MULT, turn: TURN_MULT,
      hull: HULL_MULT, cargo: CARGO_MULT,
      fuelMax: FUEL_MAX_MULT, fuelEff: FUEL_EFF_MULT,
      armorFront: ARMOR_FRONT, armorSide: ARMOR_SIDE, armorAft: ARMOR_AFT,
    });
  }

  get _engineOffsets() {
    return ENGINE_POS;
  }

  _drawShape(ctx) {
    // Arc segment map (10 hull points, 0–9).
    const ARC_MAP = {
      front:     [9, 0, 1, 2],
      starboard: [2, 3, 4, 5],
      aft:       [5, 6],
      port:      [6, 7, 8, 9],
    };

    // Main hull
    this._fillAndStrokeHull(ctx, HULL_POINTS, ARC_MAP);

    // Cockpit canopy — slightly lighter fill
    polygonFill(ctx, COCKPIT, this.hullFill, 0.5);
    ctx.strokeStyle = this.hullStroke;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(COCKPIT[0].x, COCKPIT[0].y);
    for (let i = 1; i < COCKPIT.length; i++) ctx.lineTo(COCKPIT[i].x, COCKPIT[i].y);
    ctx.closePath();
    ctx.stroke();

    // Belt line crease
    lines(ctx, [[BELT_LINE[0], BELT_LINE[1]]], this.hullStroke, 1, 0.3);

    // Engine glow
    engineGlow(ctx, ENGINE_POS, this.engineColor, 2 + this.throttleLevel * 0.5, 2, 2, 0.3);
  }

  getBounds() {
    return { x: this.x, y: this.y, radius: 12 };
  }
}
