import { Ship } from '@/entities/ship.js';
import { lines } from '@/rendering/draw.js';
import { registerContent } from '@data/dataRegistry.js';

const HULL_MULT   = 1.8;   // 360 hp — heavy frame
const WEIGHT_MULT = 1.2;   // 1200 mass — heavy tug frame
const CARGO_MULT  = 0.7;   // 35 base — empty slots add cargo capacity

// Armor arc multipliers (× BASE_ARMOR = 100)
const ARMOR_FRONT = 2.0;  // 200 — reinforced prow
const ARMOR_SIDE  = 1.5;  // 150 — welded flanks
const ARMOR_AFT   = 1.2;  // 120 — protected stern

const FUEL_MAX_MULT = 0.8; // 80 unit tank (small)

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

// Mount point positions — index i maps to moduleSlots[i].
// Slots: [engine, weapon, reactor, sensor, utility]
const MOUNT_POINTS = [
  { x: 11,  y: 10,  arc: 'starboard', size: 'small', slot: 'engine' },  // engine — stbd nacelle near exhaust
  { x: -8,  y: -22, arc: 'front',     size: 'small' },  // weapon — port cockpit hardpoint
  { x: 10,  y: -2,  arc: 'starboard', size: 'small' },  // reactor — stbd nacelle interior
  { x: 4,   y: -22, arc: 'front',     size: 'small' },  // sensor — cockpit roof
  { x: -8,  y: 2,   arc: 'port',      size: 'small' },  // utility — port nacelle
];

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

    this.shipClassName = 'Onyx Class Tug';

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
    // Arc segment map — maps each armor arc to the hull polygon indices it covers.
    // Used by _drawHullArcs() when this ship is player-owned.
    const ARC_MAP = {
      front:     [0, 1, 2, 3],
      starboard: [3, 4, 5, 6, 7, 8, 9, 10],
      aft:       [10, 11, 12],
      port:      [12, 13, 14, 15, 16, 17, 18, 0],
    };

    // Main hull
    this._fillAndStrokeHull(ctx, HULL_POINTS, ARC_MAP);

    // Cockpit window slit inside hammerhead
    lines(ctx, [[{x:-8,y:-24},{x:8,y:-24}]], this.hullStroke, 1, 0.4);

    // Engine bay + port bay internal frames
    lines(ctx, [BAY_FRAME, PORT_BAY_FRAME], this.hullStroke, 1, 0.3);

    // Weld seam across hull
    lines(ctx, [WELD_SEAM], this.hullStroke, 1, 0.25);

  }

  getBounds() {
    return { x: this.x, y: this.y, radius: 20 };
  }
}

registerContent('hulls', 'onyx-tug', {
  label: 'Onyx Class Tug',
  create: (x, y) => new OnyxClassTug(x, y),
});
