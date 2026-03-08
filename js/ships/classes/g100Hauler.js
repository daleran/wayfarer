import { Ship } from '../../entities/ship.js';
import { BASE_SPEED, BASE_ACCELERATION, BASE_TURN_RATE, SPEED_FACTOR,
         BASE_HULL, BASE_ARMOR, BASE_CARGO,
         BASE_FUEL_MAX, BASE_FUEL_EFFICIENCY } from '../../data/stats.js';

const SPEED_MULT = 0.85;  // ~71 u/s — reliable workhorse
const ACCEL_MULT = 0.85;  // moderate acceleration
const TURN_MULT  = 0.9;   // decent handling for its size
const HULL_MULT  = 1.1;   // 220 hp — solid frame
const CARGO_MULT = 3.5;   // 175 units — the whole point

// Armor arc multipliers (× BASE_ARMOR = 100)
const ARMOR_FRONT = 1.3;  // 130 — reinforced cab
const ARMOR_SIDE  = 1.2;  // 120 — cargo bay walls
const ARMOR_AFT   = 1.0;  // 100 — standard stern

const FUEL_MAX_MULT = 1.3; // 130 unit tank (good range for trade runs)
const FUEL_EFF_MULT = 0.9; // burns at 90% base rate

// Wide boxy cargo hauler body. Squared-off cab, flat aft with two square thruster blocks.
// The "pick-up truck" of the Gravewake — reliable, ugly, indispensable.
export const HULL_POINTS = [
  { x: -12, y: -18 },  // port bow
  { x:  12, y: -18 },  // starboard bow
  { x:  15, y: -12 },  // starboard shoulder
  { x:  16, y:   6 },  // starboard body
  { x:  14, y:  16 },  // starboard aft corner
  { x: -14, y:  16 },  // port aft corner
  { x: -16, y:   6 },  // port body
  { x: -15, y: -12 },  // port shoulder
];

// Square thruster blocks — drawn separately at aft
const THRUSTER_SB = [  // starboard
  { x:  7, y: 14 }, { x: 14, y: 14 }, { x: 14, y: 23 }, { x:  7, y: 23 },
];
const THRUSTER_PO = [  // port
  { x: -14, y: 14 }, { x: -7, y: 14 }, { x: -7, y: 23 }, { x: -14, y: 23 },
];

// Cargo bay divider — internal frame line
const BAY_DIVIDER = [
  { x: -11, y: -9 },
  { x:  11, y: -9 },
];

// Engine glow centers — middle of each thruster block
const ENGINE_POS = [
  { x:  10.5, y: 18 },  // starboard engine
  { x: -10.5, y: 18 },  // port engine
];

export class G100ClassHauler extends Ship {
  constructor(x, y) {
    super(x, y);

    this.faction  = 'neutral';
    this.shipType = 'g100-hauler';

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

    // Square thruster blocks
    for (const pts of [THRUSTER_SB, THRUSTER_PO]) {
      ctx.beginPath();
      ctx.moveTo(pts[0].x, pts[0].y);
      for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
      ctx.closePath();
      ctx.fillStyle = this.hullFill;
      ctx.fill();
      ctx.strokeStyle = this.hullStroke;
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }

    // Cargo bay divider line
    ctx.beginPath();
    ctx.moveTo(BAY_DIVIDER[0].x, BAY_DIVIDER[0].y);
    ctx.lineTo(BAY_DIVIDER[1].x, BAY_DIVIDER[1].y);
    ctx.strokeStyle = this.hullStroke;
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.25;
    ctx.stroke();
    ctx.globalAlpha = 1;

    // Engine glows — twin square pods
    const pulse = 0.6 + Math.sin(Date.now() * 0.008) * 0.4;
    const baseRadius = 2.5 + this.throttleLevel * 0.55;

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
    return { x: this.x, y: this.y, radius: 20 };
  }
}
