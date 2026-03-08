import { Ship } from '../../entities/ship.js';
import { BASE_SPEED, BASE_ACCELERATION, BASE_TURN_RATE, SPEED_FACTOR,
         BASE_HULL, BASE_ARMOR, BASE_CARGO,
         BASE_FUEL_MAX, BASE_FUEL_EFFICIENCY } from '../../data/stats.js';

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

// Fletcher-class workhorse frigate. Long utilitarian hull — narrow prow, straight
// flanks that widen through the midsection with bulk slightly aft, blunt stern.
// Twin engine nacelles on outboard pylons for rapid field replacement.
// No elegance. Built fast, built hard, built to last twenty years past decommission.
export const HULL_POINTS = [
  { x:   0, y: -52 },  // bow tip (sharp prow)
  { x:   4, y: -46 },  // starboard bow
  { x:  12, y: -32 },  // starboard forward shoulder
  { x:  18, y: -16 },  // starboard forward body
  { x:  22, y:  -2 },  // starboard amidships
  { x:  22, y:  20 },  // starboard aft body (long parallel section)
  { x:  16, y:  30 },  // starboard aft shoulder
  { x:  10, y:  38 },  // starboard stern
  { x: -10, y:  38 },  // port stern
  { x: -16, y:  30 },  // port aft shoulder
  { x: -22, y:  20 },  // port aft body
  { x: -22, y:  -2 },  // port amidships
  { x: -18, y: -16 },  // port forward body
  { x: -12, y: -32 },  // port forward shoulder
  { x:  -4, y: -46 },  // port bow
];

// Outboard engine nacelles on pylons — separate polygons drawn after hull
const NACELLE_STBD = [
  { x:  22, y:   6 },  // pylon root top
  { x:  38, y:   4 },  // nacelle top outer
  { x:  44, y:  10 },  // nacelle tip (chamfer)
  { x:  44, y:  32 },  // nacelle aft outer
  { x:  38, y:  36 },  // nacelle aft
  { x:  22, y:  34 },  // pylon root aft
];
const NACELLE_PORT = [
  { x: -22, y:   6 },
  { x: -38, y:   4 },
  { x: -44, y:  10 },
  { x: -44, y:  32 },
  { x: -38, y:  36 },
  { x: -22, y:  34 },
];

// Center keel spine
const KEEL = [{ x: 0, y: -48 }, { x: 0, y: 32 }];
// Forward plate break
const FORWARD_SEAM = [{ x: -10, y: -38 }, { x: 10, y: -38 }];
// Shoulder plate break
const SHOULDER_SEAM = [{ x: -14, y: -26 }, { x: 14, y: -26 }];
// Nacelle/pylon inner seams — shows module boundary
const NACELLE_SEAM_STBD = [{ x: 24, y: 6 }, { x: 24, y: 34 }];
const NACELLE_SEAM_PORT  = [{ x: -24, y: 6 }, { x: -24, y: 34 }];

// Engine positions inside nacelles (aft center of each pod)
const ENGINE_POS = [
  { x:  40, y: 32 },  // starboard nacelle
  { x: -40, y: 32 },  // port nacelle
];

export class DecFrigate extends Ship {
  constructor(x, y) {
    super(x, y);

    this.faction  = 'neutral';
    this.shipType = 'dec-frigate';

    this.flavorText =
      'Built in the last years before the Collapse, the Decommissioned Frigate ' +
      'was a wartime production vessel — cheap to stamp out, fast to crew, meant ' +
      'to be replaced. The Compact Fleet decommissioned them by the hundred. ' +
      'The clans found better use for them. Strengths: heavy armor, long range, ' +
      'twin engines easy to hot-swap in the field. Weaknesses: slow to turn, ' +
      'thirsty on fuel, and every scavenger in the Gravewake recognizes the silhouette.';

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

    ctx.globalAlpha = 0.3;
    ctx.beginPath();
    ctx.moveTo(KEEL[0].x, KEEL[0].y);
    ctx.lineTo(KEEL[1].x, KEEL[1].y);
    ctx.stroke();

    ctx.globalAlpha = 0.25;
    ctx.beginPath();
    ctx.moveTo(FORWARD_SEAM[0].x, FORWARD_SEAM[0].y);
    ctx.lineTo(FORWARD_SEAM[1].x, FORWARD_SEAM[1].y);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(SHOULDER_SEAM[0].x, SHOULDER_SEAM[0].y);
    ctx.lineTo(SHOULDER_SEAM[1].x, SHOULDER_SEAM[1].y);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(NACELLE_SEAM_STBD[0].x, NACELLE_SEAM_STBD[0].y);
    ctx.lineTo(NACELLE_SEAM_STBD[1].x, NACELLE_SEAM_STBD[1].y);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(NACELLE_SEAM_PORT[0].x, NACELLE_SEAM_PORT[0].y);
    ctx.lineTo(NACELLE_SEAM_PORT[1].x, NACELLE_SEAM_PORT[1].y);
    ctx.stroke();

    ctx.globalAlpha = 1;

    // Engine glows — twin nacelle pods
    const pulse = 0.6 + Math.sin(Date.now() * 0.008) * 0.4;
    const baseRadius = 4 + this.throttleLevel * 0.8;

    for (const pos of ENGINE_POS) {
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, baseRadius, 0, Math.PI * 2);
      ctx.strokeStyle = this.engineColor;
      ctx.lineWidth = 1.5;
      ctx.globalAlpha = pulse;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(pos.x, pos.y, baseRadius + 3 + pulse * 3, 0, Math.PI * 2);
      ctx.strokeStyle = this.engineColor;
      ctx.lineWidth = 1;
      ctx.globalAlpha = pulse * 0.25;
      ctx.stroke();

      ctx.globalAlpha = 1;
    }
  }

  getBounds() {
    return { x: this.x, y: this.y, radius: 54 };
  }
}
