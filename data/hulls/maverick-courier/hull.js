import { Ship } from '@/entities/ship.js';
import { polygonFill, polygonStroke, lines, pulse } from '@/rendering/draw.js';
import { registerContent } from '@data/dataRegistry.js';

const HULL_MULT   = 0.85;  // 170 hp — solid everyday frame
const WEIGHT_MULT = 0.5;   // 500 mass — light courier frame
const CARGO_MULT  = 0.3;   // 15 units — small trunk

// Armor arc multipliers (× BASE_ARMOR = 100)
const ARMOR_FRONT = 1.0;  // 100 — standard nose
const ARMOR_SIDE = 1.0;  // 100 — protected flanks
const ARMOR_AFT = 0.85; //  85 — decent stern

const FUEL_MAX_MULT = 0.8;  // 80 unit tank — decent range

// Sleek needle-nose courier. Long sharp nose, set-back cockpit with
// shoulder flare, tapered engine block. X-wing proportions scaled to
// a personal craft — fast, pointy, purposeful.
//
// Profile (top-down):
//        ·           nose tip
//       / \
//      /   \         nose taper
//     │     │
//    ┌┘     └┐       cockpit flare (widest)
//    │       │
//    └┐     ┌┘       engine taper
//      └───┘         stern face
export const HULL_POINTS = [
  { x: 0, y: -18 },  // nose tip
  { x: 1.5, y: -14 },  // starboard nose upper
  { x: 3, y: -8 },  // starboard nose mid
  { x: 4, y: 0 },  // starboard nose base
  { x: 6, y: 1 },  // starboard cockpit flare
  { x: 6, y: 5 },  // starboard cockpit aft
  { x: 5, y: 7 },  // starboard engine shoulder
  { x: 4, y: 12 },  // starboard engine taper
  { x: 3, y: 14 },  // starboard stern corner
  { x: -3, y: 14 },  // port stern corner
  { x: -4, y: 12 },  // port engine taper
  { x: -5, y: 7 },  // port engine shoulder
  { x: -6, y: 5 },  // port cockpit aft
  { x: -6, y: 1 },  // port cockpit flare
  { x: -4, y: 0 },  // port nose base
  { x: -3, y: -8 },  // port nose mid
  { x: -1.5, y: -14 },  // port nose upper
];

// Stubby trapezoidal wings flanking cockpit — drawn under hull
const WING_STBD = [
  { x: 6, y: 1 },  // root leading edge
  { x: 11, y: 2 },  // tip leading edge
  { x: 11, y: 6 },  // tip trailing edge
  { x: 6, y: 7 },  // root trailing edge
];
const WING_PORT = [
  { x: -6, y: 1 },
  { x: -11, y: 2 },
  { x: -11, y: 6 },
  { x: -6, y: 7 },
];

// Cockpit canopy overlay
const COCKPIT = [
  { x: -3, y: 0 },
  { x: 3, y: 0 },
  { x: 3, y: 4 },
  { x: -3, y: 4 },
];

// Engine assembly — Saturn V F1-style: chamfered housing box + bell nozzle
// Housing anchored at stern face (y=14), bell hangs below with a gap

// Thrust structure housing — chamfered rectangle flush with stern
// Absolute coords (not offset by ENGINE_Y)
const ENGINE_HOUSING = [
  { x: -2.2, y: 12 },   // port top corner (chamfer)
  { x: -3, y: 13 },   // port upper
  { x: -3, y: 17 },   // port lower
  { x: 3, y: 17 },   // starboard lower
  { x: 3, y: 13 },   // starboard upper
  { x: 2.2, y: 12 },   // starboard top corner (chamfer)
];

// Bell nozzle — 0.5px gap below housing, narrow throat flaring to wide exit
const NOZZLE_BELL = [
  { x: -2, y: 17.5 },  // throat port
  { x: 2, y: 17.5 },  // throat starboard
  { x: 3.3, y: 23.5 },  // bell exit starboard
  { x: -3.3, y: 23.5 },  // bell exit port
];

// Detail lines
const NOSE_SPINE = [{ x: 0, y: -16 }, { x: 0, y: 0 }];
const HULL_SEAM = [{ x: -4, y: 0 }, { x: 4, y: 0 }];
const COCKPIT_SLIT = [{ x: -2.5, y: 2 }, { x: 2.5, y: 2 }];
const WING_SEAM_STBD = [{ x: 6, y: 1 }, { x: 11, y: 2 }];
const WING_SEAM_PORT = [{ x: -6, y: 1 }, { x: -11, y: 2 }];

// Single center engine trail origin — at bell exit
const ENGINE_POS = [{ x: 0, y: 23.5 }];

// Mount point positions — index i maps to moduleSlots[i].
// LightFighter/GraveClanAmbusher slots: [engine, autocannon, rocket/null]
const MOUNT_POINTS = [
  { x: 0,   y: 10,  arc: 'aft',       size: 'small', slot: 'engine' },  // engine — stern
  { x: 0,   y: -12, arc: 'front',     size: 'small' },  // weapon-1 — nose
  { x: 8,   y: 4,   arc: 'starboard', size: 'small' },  // weapon-2/utility — stbd wing
];

export class MaverickCourier extends Ship {
  constructor(x, y) {
    super(x, y);

    this.faction = 'neutral';
    this.shipType = 'maverick-courier';

    this.flavorText =
      'A common personal courier built wide and muscular — more substance than the ' +
      'needle-ships but still fast enough to matter. Every settlement has three. ' +
      'Couriers, fixers, and people in a hurry all fly them. Strength: fast, solid ' +
      'enough to survive a graze, handles well. Weakness: small cargo, not built ' +
      'for a stand-up fight.';

    this.shipClassName = 'Maverick Class Courier';

    this._initStats({
      hull: HULL_MULT, weight: WEIGHT_MULT, cargo: CARGO_MULT,
      fuelMax: FUEL_MAX_MULT,
      armorFront: ARMOR_FRONT, armorSide: ARMOR_SIDE, armorAft: ARMOR_AFT,
    });
  }

  get _engineOffsets() {
    return ENGINE_POS;
  }

  get _mountPoints() {
    return MOUNT_POINTS;
  }

  _drawShape(ctx) {
    // Arc segment map (17 hull points, 0–16).
    const ARC_MAP = {
      front: [16, 0, 1, 2, 3],
      starboard: [3, 4, 5, 6, 7, 8],
      aft: [8, 9],
      port: [9, 10, 11, 12, 13, 14, 15, 16],
    };
    const isPlayer = this.relation === 'player';
    const fill = isPlayer ? this._playerHullFill() : this.hullFill;

    // 1. Wings (under hull)
    for (const [wing, arc] of /** @type {[Array<{x:number,y:number}>, string][]} */ ([[WING_PORT, 'port'], [WING_STBD, 'starboard']])) {
      ctx.beginPath();
      ctx.moveTo(wing[0].x, wing[0].y);
      for (let i = 1; i < wing.length; i++) ctx.lineTo(wing[i].x, wing[i].y);
      ctx.closePath();
      ctx.fillStyle = fill;
      ctx.fill();
      if (!this._strokeArcCurrent(ctx, arc)) {
        ctx.strokeStyle = this.hullStroke;
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    }

    // 2. Main hull
    this._fillAndStrokeHull(ctx, HULL_POINTS, ARC_MAP);

    // 3. Cockpit overlay
    polygonFill(ctx, COCKPIT, this.hullFill, 0.5);
    polygonStroke(ctx, COCKPIT, this.hullStroke, 1, 0.6);

    // 4. Detail lines
    lines(ctx, [NOSE_SPINE], this.hullStroke, 1, 0.3);
    lines(ctx, [HULL_SEAM], this.hullStroke, 1, 0.25);
    lines(ctx, [COCKPIT_SLIT], this.hullStroke, 1, 0.4);
    lines(ctx, [WING_SEAM_STBD, WING_SEAM_PORT], this.hullStroke, 1, 0.2);

    // 5. Engine assembly — on top of hull (F1-style housing + bell)
    polygonFill(ctx, ENGINE_HOUSING, this.hullStroke, 0.4);
    polygonStroke(ctx, ENGINE_HOUSING, this.hullStroke, 0.8, 0.5);

    polygonFill(ctx, NOZZLE_BELL, this.hullStroke, 0.5);
    polygonStroke(ctx, NOZZLE_BELL, this.hullStroke, 0.8, 0.6);

    // 6. Exhaust plume (throttle-scaled)
    if (this.throttleLevel > 0) {
      const pLen = 5 + this.throttleLevel * 6;
      const pAlpha = (0.3 + this.throttleLevel * 0.3) * pulse(0.012, 0.7, 1.0);
      const plume = [
        { x: -2.8, y: 23.5 },
        { x: 2.8, y: 23.5 },
        { x: 0, y: 23.5 + pLen },
      ];
      polygonFill(ctx, plume, this.engineColor, pAlpha);
    }
  }

  getBounds() {
    return { x: this.x, y: this.y, radius: 20 };
  }
}

registerContent('hulls', 'maverick-courier', {
  label: 'Maverick Class Courier',
  create: (x, y) => new MaverickCourier(x, y),
});
