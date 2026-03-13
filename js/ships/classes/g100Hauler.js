import { Ship } from '@/entities/ship.js';
import { lines, polygonStroke } from '@/rendering/draw.js';

const SPEED_MULT  = 0.85;  // ~71 u/s — reliable workhorse
const ACCEL_MULT  = 0.85;  // moderate acceleration
const TURN_MULT   = 0.9;   // decent handling for its size
const HULL_MULT   = 1.1;   // 220 hp — solid frame
const WEIGHT_MULT = 1.4;   // 1400 mass — heavy hauler frame
const CARGO_MULT  = 3.5;   // 175 units — the whole point

// Armor arc multipliers (× BASE_ARMOR = 100)
const ARMOR_FRONT = 1.3;  // 130 — reinforced cab
const ARMOR_SIDE  = 1.2;  // 120 — cargo bay walls
const ARMOR_AFT   = 1.0;  // 100 — standard stern

const FUEL_MAX_MULT = 1.3; // 130 unit tank (good range for trade runs)
const FUEL_EFF_MULT = 0.9; // burns at 90% base rate

// G100 Class Hauler — the space truck of the Gravewake.
// Wide flat cargo platform: rectangular barge deck, raised cab module at the
// bow, two large square engine pods at the stern with a gap between them.
// No elegance. Built to haul.
//
// Top-down profile:
//    ┌──[CAB]──┐        bow (forward)
//    │  [deck] │        flat cargo platform
//    [POD] [POD]        twin square engine pods, protruding aft

// Main cargo platform — wide flat rectangle
export const HULL_POINTS = [
  { x: -22, y: -26 },  // port bow corner
  { x:  22, y: -26 },  // starboard bow corner
  { x:  22, y:  20 },  // starboard aft corner
  { x: -22, y:  20 },  // port aft corner
];

// Raised cab module at bow — drawn on top of hull
const CAB = [
  { x: -13, y: -26 },  // port bow
  { x:  13, y: -26 },  // starboard bow
  { x:  13, y:  -9 },  // starboard base
  { x: -13, y:  -9 },  // port base
];

// Cab window frame — inner detail rect
const CAB_WINDOW = [
  { x: -10, y: -24 },
  { x:  10, y: -24 },
  { x:  10, y: -11 },
  { x: -10, y: -11 },
];
// Window vertical dividers
const WIN_DIV_L = [{ x: -4, y: -24 }, { x: -4, y: -11 }];
const WIN_DIV_R = [{ x:  4, y: -24 }, { x:  4, y: -11 }];

// Square engine pods — large boxy blocks at stern, gap between them
const ENGINE_POD_STBD = [
  { x:  10, y: 17 },
  { x:  22, y: 17 },
  { x:  22, y: 34 },
  { x:  10, y: 34 },
];
const ENGINE_POD_PORT = [
  { x: -22, y: 17 },
  { x: -10, y: 17 },
  { x: -10, y: 34 },
  { x: -22, y: 34 },
];

// Structural seam lines on cargo deck
const SEAM_CAB_BASE = [{ x: -22, y:  -9 }, { x: 22, y:  -9 }];  // cab/deck boundary
const SEAM_MID_DECK = [{ x: -22, y:   5 }, { x: 22, y:   5 }];  // mid-deck panel seam
const SPINE_LINE    = [{ x:   0, y:  -9 }, { x:  0, y:  20 }];  // longitudinal spine
const ENGINE_GAP    = [{ x:   0, y:  17 }, { x:  0, y:  34 }];  // gap between pods
// Engine pod inner seams (divides each pod into two thruster cells)
const ENG_SEAM_S    = [{ x: 16, y: 17 }, { x: 16, y: 34 }];
const ENG_SEAM_P    = [{ x:-16, y: 17 }, { x:-16, y: 34 }];

// Engine glow centers — rear face of each pod
const ENGINE_POS = [
  { x:  16, y: 30 },  // starboard pod
  { x: -16, y: 30 },  // port pod
];

// Mount point positions — index i maps to moduleSlots[i].
// Slots: [engine, weapon-1, weapon-2, utility]
const MOUNT_POINTS = [
  { x: 0,    y: 24,  arc: 'aft',   size: 'small', slot: 'engine' },  // engine — between pods
  { x: -10,  y: -18, arc: 'front', size: 'small' },  // weapon-1 — cab port
  { x: 10,   y: -18, arc: 'front', size: 'small' },  // weapon-2 — cab stbd
  { x: 0,    y: 6,   arc: 'port',  size: 'small' },  // utility — mid-deck
];

export class G100ClassHauler extends Ship {
  constructor(x, y) {
    super(x, y);

    this.faction  = 'neutral';
    this.shipType = 'g100-hauler';

    this.flavorText =
      'The space truck of the Gravewake. Wide flat deck, boxy cab, twin engine pods — ' +
      'immediately recognizable. Found everywhere: neutral ports, scavenger yards, ' +
      'monastery docks. It hauls what needs hauling and asks nothing but fuel. ' +
      'Unglamorous by design. Strength: exceptional cargo volume, twin engines for ' +
      'redundancy, solid all-around armor for a civilian hull. Weakness: no speed, ' +
      'no finesse — getting cornered means relying on whatever you bolted to the hardpoints.';

    this.shipClassName = 'G100 Class Hauler';

    this._initStats({
      speed: SPEED_MULT, accel: ACCEL_MULT, turn: TURN_MULT,
      hull: HULL_MULT, weight: WEIGHT_MULT, cargo: CARGO_MULT,
      fuelMax: FUEL_MAX_MULT, fuelEff: FUEL_EFF_MULT,
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
    // Arc segment map for the 4-point main hull rectangle.
    const HULL_ARC_MAP = { front: [0, 1], starboard: [1, 2], aft: [2, 3], port: [3, 0] };
    const isPlayer = this.relation === 'player';
    const fill = isPlayer ? this._playerHullFill() : this.hullFill;

    const buildAndFill = (pts) => {
      ctx.beginPath();
      ctx.moveTo(pts[0].x, pts[0].y);
      for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
      ctx.closePath();
      ctx.fillStyle = fill;
      ctx.fill();
    };

    // Engine pods first — behind hull
    for (const [pod, arc] of [[ENGINE_POD_PORT, 'port'], [ENGINE_POD_STBD, 'starboard']]) {
      buildAndFill(pod);
      if (!this._strokeArcCurrent(ctx, arc)) {
        ctx.strokeStyle = this.hullStroke;
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }
    }

    // Main cargo platform
    this._fillAndStrokeHull(ctx, HULL_POINTS, HULL_ARC_MAP);

    // Cab module — drawn over hull to appear raised
    buildAndFill(CAB);
    if (!this._strokeArcCurrent(ctx, 'front')) {
      ctx.strokeStyle = this.hullStroke;
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }

    // Cab window frame and dividers
    polygonStroke(ctx, CAB_WINDOW, this.hullStroke, 1, 0.55);
    lines(ctx, [WIN_DIV_L, WIN_DIV_R], this.hullStroke, 1, 0.55);

    // Structural seam lines on deck and engine pods
    lines(ctx, [SEAM_CAB_BASE, SEAM_MID_DECK, SPINE_LINE, ENGINE_GAP], this.hullStroke, 1, 0.28);
    lines(ctx, [ENG_SEAM_S, ENG_SEAM_P], this.hullStroke, 1, 0.22);

  }

  getBounds() {
    return { x: this.x, y: this.y, radius: 36 };
  }
}
