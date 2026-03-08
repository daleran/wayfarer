import { Ship } from '../../entities/ship.js';
import { BASE_SPEED, BASE_ACCELERATION, BASE_TURN_RATE, SPEED_FACTOR,
         BASE_HULL, BASE_ARMOR, BASE_CARGO,
         BASE_FUEL_MAX, BASE_FUEL_EFFICIENCY } from '../../data/stats.js';

const SPEED_MULT = 1.6;   // ~134 u/s — very fast personal craft
const ACCEL_MULT = 1.5;   // responsive acceleration
const TURN_MULT  = 1.5;   // nimble
const HULL_MULT  = 0.6;   // 120 hp — light frame
const CARGO_MULT = 0.2;   // 10 units — almost no cargo

// Armor arc multipliers (× BASE_ARMOR = 100)
const ARMOR_FRONT = 1.2;  // 120 — light nose reinforcement
const ARMOR_SIDE  = 0.8;  //  80 — minimal flanks
const ARMOR_AFT   = 0.7;  //  70 — exposed stern

const FUEL_MAX_MULT = 0.6; // 60 unit tank (short range)
const FUEL_EFF_MULT = 0.8; // burns at 80% base rate

// Narrow elongated needle. Long fuselage, slim profile, boxy lateral fin stubs mid-ship.
// Personal courier, racer, or smuggler hull — built for speed, not survival.
export const HULL_POINTS = [
  { x:  0,  y: -17 },  // nose tip
  { x:  3,  y: -11 },  // starboard shoulder
  { x:  4,  y:  -3 },  // starboard fuselage
  { x:  5,  y:   2 },  // starboard waist (wing root)
  { x:  4,  y:   8 },  // starboard hip
  { x:  3,  y:  12 },  // starboard stern
  { x:  2,  y:  15 },  // starboard exhaust
  { x: -2,  y:  15 },  // port exhaust
  { x: -3,  y:  12 },  // port stern
  { x: -4,  y:   8 },  // port hip
  { x: -5,  y:   2 },  // port waist (wing root)
  { x: -4,  y:  -3 },  // port fuselage
  { x: -3,  y: -11 },  // port shoulder
];

// Boxy lateral fin stubs — narrow rectangular tabs extending from the waist
const WING_STBD = [
  { x:  5, y: 2 }, { x: 10, y: 2 }, { x: 10, y: 6 }, { x: 5, y: 6 },
];
const WING_PORT = [
  { x: -5, y: 2 }, { x: -10, y: 2 }, { x: -10, y: 6 }, { x: -5, y: 6 },
];

// Wing root seam — panel line across the waist
const WING_SEAM = [
  { x: -5, y: 3.5 },
  { x:  5, y: 3.5 },
];

// Ventral keel line — structural spine
const KEEL_LINE = [
  { x: 0, y: -14 },
  { x: 0, y:  11 },
];

// Single center engine at aft
const ENGINE_POS = [{ x: 0, y: 14 }];

export class SwiftRunner extends Ship {
  constructor(x, y) {
    super(x, y);

    this.faction  = 'neutral';
    this.shipType = 'swift-runner';

    this.flavorText =
      'The cheapest fast ship money could buy before the Collapse — and after it. ' +
      'Couriers, smugglers, and desperate people have always needed something fast ' +
      'with few questions asked. No armor worth mentioning, no cargo space, no ' +
      'redundancy. Strength: speed, small profile, quick to turn. Weakness: one ' +
      'solid hit ends the conversation.';

    const fa = {
      front:     BASE_ARMOR * ARMOR_FRONT,
      port:      BASE_ARMOR * ARMOR_SIDE,
      starboard: BASE_ARMOR * ARMOR_SIDE,
      aft:       BASE_ARMOR * ARMOR_AFT,
    };
    this.armorArcs    = { ...fa };
    this.armorArcsMax = { ...fa };

    this.hullMax     = BASE_HULL * HULL_MULT;
    this.hullCurrent = this.hullMax;

    this.speedMax     = BASE_SPEED        * SPEED_MULT * SPEED_FACTOR;
    this.acceleration = BASE_ACCELERATION * ACCEL_MULT * SPEED_FACTOR;
    this.turnRate     = BASE_TURN_RATE    * TURN_MULT  * SPEED_FACTOR;
    this.throttleLevels  = 6;
    this._throttleRatios = [0, 0.15, 0.35, 0.55, 0.8, 1.5];

    this.cargoCapacity  = BASE_CARGO * CARGO_MULT;
    this.fuelMax        = BASE_FUEL_MAX * FUEL_MAX_MULT;
    this.fuelEfficiency = BASE_FUEL_EFFICIENCY * FUEL_EFF_MULT;
  }

  get _engineOffsets() {
    return ENGINE_POS;
  }

  _drawShape(ctx) {
    // Wing stubs — draw first so hull overlaps the roots cleanly
    for (const wing of [WING_PORT, WING_STBD]) {
      ctx.beginPath();
      ctx.moveTo(wing[0].x, wing[0].y);
      for (let i = 1; i < wing.length; i++) ctx.lineTo(wing[i].x, wing[i].y);
      ctx.closePath();
      ctx.fillStyle = this.hullFill;
      ctx.fill();
      ctx.strokeStyle = this.hullStroke;
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }

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

    // Wing root seam
    ctx.beginPath();
    ctx.moveTo(WING_SEAM[0].x, WING_SEAM[0].y);
    ctx.lineTo(WING_SEAM[1].x, WING_SEAM[1].y);
    ctx.strokeStyle = this.hullStroke;
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.35;
    ctx.stroke();
    ctx.globalAlpha = 1;

    // Ventral keel line
    ctx.beginPath();
    ctx.moveTo(KEEL_LINE[0].x, KEEL_LINE[0].y);
    ctx.lineTo(KEEL_LINE[1].x, KEEL_LINE[1].y);
    ctx.strokeStyle = this.hullStroke;
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.3;
    ctx.stroke();
    ctx.globalAlpha = 1;

    // Engine glow
    const pulse = 0.6 + Math.sin(Date.now() * 0.008) * 0.4;
    const baseRadius = 2 + this.throttleLevel * 0.5;

    for (const pos of ENGINE_POS) {
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, baseRadius, 0, Math.PI * 2);
      ctx.strokeStyle = this.engineColor;
      ctx.lineWidth = 1.5;
      ctx.globalAlpha = pulse;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(pos.x, pos.y, baseRadius + 2 + pulse * 2, 0, Math.PI * 2);
      ctx.strokeStyle = this.engineColor;
      ctx.lineWidth = 1;
      ctx.globalAlpha = pulse * 0.3;
      ctx.stroke();

      ctx.globalAlpha = 1;
    }
  }

  getBounds() {
    return { x: this.x, y: this.y, radius: 15 };
  }
}
