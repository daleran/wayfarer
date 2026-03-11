import { Ship } from '../../entities/ship.js';
import { BASE_SPEED, BASE_ACCELERATION, BASE_TURN_RATE, SPEED_FACTOR,
         BASE_HULL, BASE_CARGO,
         BASE_FUEL_MAX, BASE_FUEL_EFFICIENCY } from '../../data/tuning/shipTuning.js';
import { drawEngineGlow } from '../../systems/engineGlow.js';

const SPEED_MULT = 0.55;  // ~46 u/s — very slow
const ACCEL_MULT = 0.65;  // ~7 u/s²
const TURN_MULT  = 0.65;  // ~0.43 rad/s — sluggish
const HULL_MULT  = 1.8;   // 360 hp — heavy frame
const CARGO_MULT = 2.5;   // 125 units

// Armor arc multipliers (× BASE_ARMOR = 100)
const ARMOR_FRONT = 2.0;  // 200 — reinforced prow
const ARMOR_SIDE  = 1.5;  // 150 — welded flanks
const ARMOR_AFT   = 1.2;  // 120 — protected stern

const FUEL_MAX_MULT = 0.8; // 80 unit tank (small)
const FUEL_EFF_MULT = 0.5; // burns at 50% base rate (efficient)

// Hammerhead cockpit block, narrow body, long starboard engine nacelle,
// smaller port utility nacelle. Repurposed hauling tug — asymmetric working vessel.
export const HULL_POINTS = [
  // Hammerhead cockpit block (bow) — wide with chamfered front corners
  { x: -11, y: -23 },  // port cockpit side
  { x: -9,  y: -26 },  // port chamfer
  { x: 9,   y: -26 },  // starboard chamfer
  { x: 11,  y: -23 },  // starboard cockpit side
  { x: 11,  y: -20 },  // starboard cockpit bottom
  { x: 5,   y: -20 },  // starboard neck top

  // Engine nacelle (starboard) — long, rounded top entry
  { x: 5,   y: -10 },  // nacelle inner top
  { x: 12,  y: -12 },  // nacelle outer top curve
  { x: 17,  y: -8  },  // nacelle outer shoulder
  { x: 17,  y: 14  },  // nacelle outer bottom
  { x: 5,   y: 14  },  // nacelle inner bottom

  // Stern (narrow body continues past nacelle)
  { x: 5,   y: 18  },  // starboard stern
  { x: -4,  y: 18  },  // port stern

  // Utility nacelle (port) — smaller
  { x: -4,  y: 8   },  // nacelle inner bottom
  { x: -12, y: 8   },  // nacelle outer bottom
  { x: -12, y: -6  },  // nacelle outer top
  { x: -4,  y: -6  },  // nacelle inner top

  // Port neck
  { x: -4,  y: -20 },  // port neck top
  { x: -11, y: -20 },  // port cockpit bottom
];

// Engine nacelle internal frame line
const BAY_FRAME = [
  { x: 6, y: -8 },
  { x: 6, y: 12 },
];

// Port nacelle frame line
const PORT_BAY_FRAME = [
  { x: -5, y: -4 },
  { x: -5, y: 6  },
];

// Weld seam across narrow body
const WELD_SEAM = [
  { x: -3, y: -14 },
  { x: 4,  y: -14 },
];

// Single large engine at the back of the starboard nacelle
const ENGINE_POS = [{ x: 11, y: 12 }];

export class OnyxClassTug extends Ship {
  constructor(x, y) {
    super(x, y);

    this.faction = 'neutral';
    this.shipType = 'onyx-tug';

    this.flavorText =
      'Pre-Collapse inner-system workhorse. The Onyx class moved ore, water, and ' +
      'salvage across a hundred stations before the lights went out. Slow and ugly, ' +
      'but the hull plating outlasts everything around it. Strength: exceptional ' +
      'survivability for its class, reliable in every condition. Weakness: painfully ' +
      'slow, nearly impossible to mount meaningful weapons on without custom work.';

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
    // Arc segment map — maps each armor arc to the hull polygon indices it covers.
    // Used by _drawHullArcs() when this ship is player-owned.
    const ARC_MAP = {
      front:     [0, 1, 2, 3],
      starboard: [3, 4, 5, 6, 7, 8, 9, 10],
      aft:       [10, 11, 12],
      port:      [12, 13, 14, 15, 16, 17, 18, 0],
    };

    // Main hull
    ctx.beginPath();
    ctx.moveTo(HULL_POINTS[0].x, HULL_POINTS[0].y);
    for (let i = 1; i < HULL_POINTS.length; i++) {
      ctx.lineTo(HULL_POINTS[i].x, HULL_POINTS[i].y);
    }
    ctx.closePath();
    if (this.relation === 'player') {
      ctx.fillStyle = this._playerHullFill();
      ctx.fill();
      this._drawHullArcs(ctx, HULL_POINTS, ARC_MAP);
    } else {
      ctx.fillStyle = this.hullFill;
      ctx.fill();
      ctx.strokeStyle = this.hullStroke;
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }

    // Cockpit window slit inside hammerhead
    ctx.beginPath();
    ctx.moveTo(-8, -24);
    ctx.lineTo(8, -24);
    ctx.strokeStyle = this.hullStroke;
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.4;
    ctx.stroke();
    ctx.globalAlpha = 1;

    // Engine bay internal frame
    ctx.beginPath();
    ctx.moveTo(BAY_FRAME[0].x, BAY_FRAME[0].y);
    ctx.lineTo(BAY_FRAME[1].x, BAY_FRAME[1].y);
    ctx.strokeStyle = this.hullStroke;
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.3;
    ctx.stroke();
    ctx.globalAlpha = 1;

    // Port bay internal frame
    ctx.beginPath();
    ctx.moveTo(PORT_BAY_FRAME[0].x, PORT_BAY_FRAME[0].y);
    ctx.lineTo(PORT_BAY_FRAME[1].x, PORT_BAY_FRAME[1].y);
    ctx.strokeStyle = this.hullStroke;
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.3;
    ctx.stroke();
    ctx.globalAlpha = 1;

    // Weld seam across hull
    ctx.beginPath();
    ctx.moveTo(WELD_SEAM[0].x, WELD_SEAM[0].y);
    ctx.lineTo(WELD_SEAM[1].x, WELD_SEAM[1].y);
    ctx.strokeStyle = this.hullStroke;
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.25;
    ctx.stroke();
    ctx.globalAlpha = 1;

    // Engine glow — nacelle engine
    drawEngineGlow(ctx, ENGINE_POS, this.engineColor, 3 + this.throttleLevel * 0.6, 2, 2, 0.3);
  }

  getBounds() {
    return { x: this.x, y: this.y, radius: 20 };
  }
}
