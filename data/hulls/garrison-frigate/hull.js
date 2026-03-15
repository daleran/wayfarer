import { Ship } from '@/entities/ship.js';
import { lines } from '@/rendering/draw.js';
import { registerContent } from '@data/dataRegistry.js';

const HULL_MULT   = 2.5;   // 500 hp — military-grade frame
const WEIGHT_MULT = 2.0;   // 2000 mass — heavy military frame
const CARGO_MULT  = 0.4;   // 20 base — empty slots add cargo capacity

// Armor arc multipliers (× BASE_ARMOR = 100) — military-spec plate
const ARMOR_FRONT = 2.5;  // 250 — hardened bow
const ARMOR_SIDE  = 2.0;  // 200 — heavy flank plating
const ARMOR_AFT   = 1.5;  // 150 — protected stern

const FUEL_MAX_MULT = 2.5; // 250 unit tank — long-range patrol capability

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

// Mount point positions — index i maps to moduleSlots[i].
// SalvageMothership slots: [engine, cannon, rocketPod, null, null]
const MOUNT_POINTS = [
  { x: 0,    y: 36,  arc: 'aft',       size: 'large', slot: 'engine' },  // engine — stern center
  { x: 0,    y: -44, arc: 'front',     size: 'large' },  // weapon-1 — bow tower
  { x: -16,  y: -20, arc: 'port',      size: 'large' },  // weapon-2 — main hull port
  { x: 16,   y: 0,   arc: 'starboard', size: 'large' },  // reactor — main hull stbd
  { x: 0,    y: -50, arc: 'front',     size: 'small' },  // sensor — bow tower top
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

    this.shipClassName = 'Garrison Class Frigate';

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
    // Arc segment map for the main hull polygon (12 points, 0–11).
    const ARC_MAP = {
      front:     [11, 0],
      starboard: [0, 1, 2, 3, 4, 5],
      aft:       [5, 6],
      port:      [6, 7, 8, 9, 10, 11],
    };
    const isPlayer = this.relation === 'player';
    const fill = isPlayer ? this._playerHullFill() : this.hullFill;

    // Nacelles first so hull overlaps the pylon roots cleanly
    for (const [nacelle, arc] of /** @type {[Array<{x:number,y:number}>, string][]} */ ([[NACELLE_PORT, 'port'], [NACELLE_STBD, 'starboard']])) {
      ctx.beginPath();
      ctx.moveTo(nacelle[0].x, nacelle[0].y);
      for (let i = 1; i < nacelle.length; i++) ctx.lineTo(nacelle[i].x, nacelle[i].y);
      ctx.closePath();
      ctx.fillStyle = fill;
      ctx.fill();
      if (!this._strokeArcCurrent(ctx, arc)) {
        ctx.strokeStyle = this.hullStroke;
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }
    }

    // Main hull
    this._fillAndStrokeHull(ctx, HULL_POINTS, ARC_MAP);

    // Detail lines — structural seams and keel
    lines(ctx, [KEEL, BOW_RIB_STBD, BOW_RIB_PORT, NACELLE_SEAM_STBD, NACELLE_SEAM_PORT], this.hullStroke, 1, 0.3);
    lines(ctx, [SEAM_FWD, SEAM_AFT], this.hullStroke, 1, 0.22);

  }

  getBounds() {
    return { x: this.x, y: this.y, radius: 54 };
  }
}

registerContent('hulls', 'garrison-frigate', {
  label: 'Garrison Class Frigate',
  create: (x, y) => new GarrisonFrigate(x, y),
});
