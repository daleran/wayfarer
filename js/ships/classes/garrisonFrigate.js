import { Ship } from '../../entities/ship.js';
import { BASE_SPEED, BASE_ACCELERATION, BASE_TURN_RATE, SPEED_FACTOR,
         BASE_HULL, BASE_CARGO,
         BASE_FUEL_MAX, BASE_FUEL_EFFICIENCY } from '../../data/tuning/shipTuning.js';
import { drawEngineGlow } from '../../systems/engineGlow.js';

const SPEED_MULT = 0.85;  // ~71 u/s — decent for its mass
const ACCEL_MULT = 0.7;   // heavy, slow to spin up
const TURN_MULT  = 0.8;   // sluggish
const HULL_MULT  = 2.5;   // 500 hp — military-grade frame
const CARGO_MULT = 1.5;   // 75 units — some salvage bays

// Armor arc multipliers (× BASE_ARMOR = 100) — military-spec plate
const ARMOR_FRONT = 2.5;  // 250 — hardened bow
const ARMOR_SIDE  = 2.0;  // 200 — heavy flank plating
const ARMOR_AFT   = 1.5;  // 150 — protected stern

const FUEL_MAX_MULT = 2.5; // 250 unit tank — long-range patrol capability
const FUEL_EFF_MULT = 1.1; // burns at 110% base rate (thirsty engines)

// Garrison-class workhorse frigate. H-profile hull: narrow bow tower, wide
// rectangular mid-hull, narrow stern block. No elegance, no curves — just
// flat plates, hard corners, and bolted module seams. Built fast, built hard,
// built to last twenty years past decommission.
//
// Hull cross-section (top-down, H/I-beam profile):
//    ┌──┐          bow tower (narrow)
//    │  │
// ┌──┘  └──┐       main body (wide)
// │        │
// └──┐  ┌──┘       stern section (narrow)
//    └──┘
export const HULL_POINTS = [
  { x:   8, y: -52 },  // bow tower starboard top
  { x:   8, y: -36 },  // bow tower starboard base
  { x:  22, y: -36 },  // main hull starboard forward corner
  { x:  22, y:  26 },  // main hull starboard aft corner
  { x:   8, y:  26 },  // stern section starboard shoulder
  { x:   8, y:  44 },  // stern starboard bottom
  { x:  -8, y:  44 },  // stern port bottom
  { x:  -8, y:  26 },  // stern section port shoulder
  { x: -22, y:  26 },  // main hull port aft corner
  { x: -22, y: -36 },  // main hull port forward corner
  { x:  -8, y: -36 },  // bow tower port base
  { x:  -8, y: -52 },  // bow tower port top
];

// Outboard engine nacelles — rectangular pods on short pylons
const NACELLE_STBD = [
  { x:  22, y:  -2 },  // pylon root top
  { x:  38, y:  -2 },  // nacelle top
  { x:  44, y:   4 },  // nacelle forward corner (chamfered)
  { x:  44, y:  34 },  // nacelle aft
  { x:  38, y:  38 },  // nacelle bottom corner
  { x:  22, y:  34 },  // pylon root bottom
];
const NACELLE_PORT = [
  { x: -22, y:  -2 },
  { x: -38, y:  -2 },
  { x: -44, y:   4 },
  { x: -44, y:  34 },
  { x: -38, y:  38 },
  { x: -22, y:  34 },
];

// Center keel spine
const KEEL = [{ x: 0, y: -48 }, { x: 0, y: 40 }];
// Inner bow tower ribs (structural detail)
const BOW_RIB_STBD = [{ x: 4, y: -52 }, { x: 4, y: -36 }];
const BOW_RIB_PORT = [{ x: -4, y: -52 }, { x: -4, y: -36 }];
// Main hull transverse seams (cross-bracing)
const SEAM_FWD = [{ x: -22, y: -10 }, { x: 22, y: -10 }];
const SEAM_AFT = [{ x: -22, y: 12 }, { x: 22, y: 12 }];
// Nacelle pylon inner seams
const NACELLE_SEAM_STBD = [{ x: 24, y: -2 }, { x: 24, y: 34 }];
const NACELLE_SEAM_PORT  = [{ x: -24, y: -2 }, { x: -24, y: 34 }];

// Engine positions — aft face of each nacelle pod
const ENGINE_POS = [
  { x:  41, y: 36 },  // starboard nacelle
  { x: -41, y: 36 },  // port nacelle
];

export class GarrisonFrigate extends Ship {
  constructor(x, y) {
    super(x, y);

    this.faction  = 'neutral';
    this.shipType = 'garrison-frigate';

    this.flavorText =
      'Garrison-class patrol frigates were the Compact Fleet\'s standard workhorse — ' +
      'stamped out by the hundred in the last years before the Collapse. Simple to ' +
      'build, simple to maintain, impossible to kill. The Fleet decommissioned them ' +
      'as fast as it could; the clans picked them up faster. Every scavenger in the ' +
      'Gravewake recognizes the silhouette: flat bow, wide mid-hull, twin pods. ' +
      'Strengths: heavy armor, long range, nacelles easy to hot-swap in the field. ' +
      'Weaknesses: slow to turn, thirsty on fuel, and no amount of paint hides what it is.';

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
    // Nacelles first so hull overlaps the pylon roots cleanly
    for (const nacelle of [NACELLE_PORT, NACELLE_STBD]) {
      ctx.beginPath();
      ctx.moveTo(nacelle[0].x, nacelle[0].y);
      for (let i = 1; i < nacelle.length; i++) ctx.lineTo(nacelle[i].x, nacelle[i].y);
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

    // Detail lines — structural seams and keel
    ctx.strokeStyle = this.hullStroke;
    ctx.lineWidth = 1;

    const seams = [KEEL, BOW_RIB_STBD, BOW_RIB_PORT, NACELLE_SEAM_STBD, NACELLE_SEAM_PORT];
    ctx.globalAlpha = 0.3;
    for (const s of seams) {
      ctx.beginPath();
      ctx.moveTo(s[0].x, s[0].y);
      ctx.lineTo(s[1].x, s[1].y);
      ctx.stroke();
    }

    ctx.globalAlpha = 0.22;
    for (const s of [SEAM_FWD, SEAM_AFT]) {
      ctx.beginPath();
      ctx.moveTo(s[0].x, s[0].y);
      ctx.lineTo(s[1].x, s[1].y);
      ctx.stroke();
    }

    ctx.globalAlpha = 1;

    // Engine glows — twin nacelle pods
    drawEngineGlow(ctx, ENGINE_POS, this.engineColor, 4 + this.throttleLevel * 0.8, 3, 3, 0.25);
  }

  getBounds() {
    return { x: this.x, y: this.y, radius: 54 };
  }
}
