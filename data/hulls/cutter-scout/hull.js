import { Ship } from '@/entities/ship.js';
import { polygonFill, polygonStroke, lines, pulse } from '@/rendering/draw.js';
import { registerContent } from '@data/dataRegistry.js';

const HULL_MULT   = 1.2;   // 240 hp — military scout frame
const WEIGHT_MULT = 0.9;   // 900 mass — medium military
const CARGO_MULT  = 0.2;   // 10 units — tiny hold

// Armor arc multipliers (× BASE_ARMOR = 100)
const ARMOR_FRONT = 1.4;  // 140 — hardened bow
const ARMOR_SIDE  = 1.1;  // 110 — decent flanks
const ARMOR_AFT   = 0.8;  //  80 — thin stern

const FUEL_MAX_MULT = 1.2; // 120 unit tank — long-range patrol

// Compact angular military scout. Narrow wedge bow, recessed cockpit,
// stubby angular wings with weapon hardpoints, single recessed engine block.
// Smaller footprint than Garrison but visually military.
//
// Profile (top-down):
//        ·           nose tip
//       / \
//      /   \         bow taper
//     │     │
//    ┌┤     ├┐       wing hardpoints
//    └┤     ├┘
//     └─┐ ┌─┘       engine block
//       └─┘          stern
export const HULL_POINTS = [
  { x: 0, y: -24 },   // nose tip
  { x: 3, y: -18 },   // starboard bow upper
  { x: 5, y: -10 },   // starboard bow lower
  { x: 7, y: -4 },    // starboard fuselage shoulder
  { x: 7, y: 6 },     // starboard fuselage mid
  { x: 5, y: 12 },    // starboard engine shoulder
  { x: 5, y: 18 },    // starboard stern corner
  { x: -5, y: 18 },   // port stern corner
  { x: -5, y: 12 },   // port engine shoulder
  { x: -7, y: 6 },    // port fuselage mid
  { x: -7, y: -4 },   // port fuselage shoulder
  { x: -5, y: -10 },  // port bow lower
  { x: -3, y: -18 },  // port bow upper
];

// Stubby angular wings — drawn under hull
const WING_STBD = [
  { x: 7, y: -2 },   // root leading edge
  { x: 14, y: 0 },   // tip leading edge
  { x: 14, y: 8 },   // tip trailing edge
  { x: 7, y: 6 },    // root trailing edge
];
const WING_PORT = [
  { x: -7, y: -2 },
  { x: -14, y: 0 },
  { x: -14, y: 8 },
  { x: -7, y: 6 },
];

// Cockpit canopy — small recessed window
const COCKPIT = [
  { x: -3, y: -8 },
  { x: 3, y: -8 },
  { x: 3, y: -3 },
  { x: -3, y: -3 },
];

// Engine housing — recessed block at stern
const ENGINE_HOUSING = [
  { x: -3.5, y: 14 },
  { x: -4.5, y: 15 },
  { x: -4.5, y: 20 },
  { x: 4.5, y: 20 },
  { x: 4.5, y: 15 },
  { x: 3.5, y: 14 },
];

// Engine bell nozzle
const NOZZLE_BELL = [
  { x: -2.5, y: 20.5 },
  { x: 2.5, y: 20.5 },
  { x: 3.5, y: 25 },
  { x: -3.5, y: 25 },
];

// Detail lines
const NOSE_SPINE = [{ x: 0, y: -22 }, { x: 0, y: -8 }];
const HULL_SEAM = [{ x: -5, y: -10 }, { x: 5, y: -10 }];
const AFT_SEAM = [{ x: -5, y: 12 }, { x: 5, y: 12 }];
const WING_SEAM_STBD = [{ x: 7, y: -2 }, { x: 14, y: 0 }];
const WING_SEAM_PORT = [{ x: -7, y: -2 }, { x: -14, y: 0 }];

// Single center engine trail origin — at bell exit
const ENGINE_POS = [{ x: 0, y: 25 }];

// Mount point positions — index i maps to moduleSlots[i].
// Slots: [engine, bow weapon, stbd weapon, port reactor, bow sensor]
const MOUNT_POINTS = [
  { x: 0,   y: 14,  arc: 'aft',       size: 'small', slot: 'engine' },  // engine — stern
  { x: 0,   y: -16, arc: 'front',     size: 'small' },  // weapon — bow gun
  { x: 11,  y: 4,   arc: 'starboard', size: 'small' },  // weapon — stbd wing hardpoint
  { x: -11, y: 4,   arc: 'port',      size: 'small' },  // reactor/utility — port wing
  { x: 0,   y: -10, arc: 'front',     size: 'small' },  // sensor — cockpit roof
];

export class CutterClassScout extends Ship {
  constructor(x, y) {
    super(x, y);

    this.faction = 'neutral';
    this.shipType = 'cutter-scout';

    this.flavorText =
      'House Casimir fields Cutter scouts in pairs along the inner shipping lanes. ' +
      'Compact, angular, built to face the enemy — the thin aft armor is a statement ' +
      'of intent. Fast enough to run down a courier, armed enough to make it hurt. ' +
      'The clans dread the silhouette. Strength: long range, well-armed for its size, ' +
      'solid frontal armor. Weakness: thin stern, small cargo, not built to run.';

    this.shipClassName = 'Cutter Class Scout';

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
    // Arc segment map (13 hull points, 0–12).
    const ARC_MAP = {
      front: [12, 0, 1, 2, 3],
      starboard: [3, 4, 5, 6],
      aft: [6, 7],
      port: [7, 8, 9, 10, 11, 12],
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
    lines(ctx, [HULL_SEAM, AFT_SEAM], this.hullStroke, 1, 0.25);
    lines(ctx, [WING_SEAM_STBD, WING_SEAM_PORT], this.hullStroke, 1, 0.2);

    // 5. Engine assembly
    polygonFill(ctx, ENGINE_HOUSING, this.hullStroke, 0.4);
    polygonStroke(ctx, ENGINE_HOUSING, this.hullStroke, 0.8, 0.5);

    polygonFill(ctx, NOZZLE_BELL, this.hullStroke, 0.5);
    polygonStroke(ctx, NOZZLE_BELL, this.hullStroke, 0.8, 0.6);

    // 6. Exhaust plume (throttle-scaled)
    if (this.throttleLevel > 0) {
      const pLen = 4 + this.throttleLevel * 5;
      const pAlpha = (0.3 + this.throttleLevel * 0.3) * pulse(0.012, 0.7, 1.0);
      const plume = [
        { x: -3, y: 25 },
        { x: 3, y: 25 },
        { x: 0, y: 25 + pLen },
      ];
      polygonFill(ctx, plume, this.engineColor, pAlpha);
    }
  }

  getBounds() {
    return { x: this.x, y: this.y, radius: 25 };
  }
}

registerContent('hulls', 'cutter-scout', {
  label: 'Cutter Class Scout',
  create: (x, y) => new CutterClassScout(x, y),
});
