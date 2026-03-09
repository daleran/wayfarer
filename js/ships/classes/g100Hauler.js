import { Ship } from '../../entities/ship.js';
import { BASE_SPEED, BASE_ACCELERATION, BASE_TURN_RATE, SPEED_FACTOR,
         BASE_HULL, BASE_CARGO,
         BASE_FUEL_MAX, BASE_FUEL_EFFICIENCY } from '../../data/stats.js';
import { drawEngineGlow } from '../../systems/engineGlow.js';

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
    const drawRect = (pts) => {
      ctx.beginPath();
      ctx.moveTo(pts[0].x, pts[0].y);
      for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
      ctx.closePath();
      ctx.fillStyle = this.hullFill;
      ctx.fill();
      ctx.strokeStyle = this.hullStroke;
      ctx.lineWidth = 1.5;
      ctx.stroke();
    };

    // Engine pods first — behind hull
    drawRect(ENGINE_POD_PORT);
    drawRect(ENGINE_POD_STBD);

    // Main cargo platform
    drawRect(HULL_POINTS);

    // Cab module — drawn over hull to appear raised
    drawRect(CAB);

    // Cab window frame and dividers
    ctx.globalAlpha = 0.55;
    ctx.strokeStyle = this.hullStroke;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(CAB_WINDOW[0].x, CAB_WINDOW[0].y);
    for (let i = 1; i < CAB_WINDOW.length; i++) ctx.lineTo(CAB_WINDOW[i].x, CAB_WINDOW[i].y);
    ctx.closePath();
    ctx.stroke();
    for (const seg of [WIN_DIV_L, WIN_DIV_R]) {
      ctx.beginPath();
      ctx.moveTo(seg[0].x, seg[0].y);
      ctx.lineTo(seg[1].x, seg[1].y);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;

    // Structural seam lines on deck and engine pods
    ctx.strokeStyle = this.hullStroke;
    ctx.lineWidth = 1;
    const primarySeams = [SEAM_CAB_BASE, SEAM_MID_DECK, SPINE_LINE, ENGINE_GAP];
    ctx.globalAlpha = 0.28;
    for (const s of primarySeams) {
      ctx.beginPath();
      ctx.moveTo(s[0].x, s[0].y);
      ctx.lineTo(s[1].x, s[1].y);
      ctx.stroke();
    }
    ctx.globalAlpha = 0.22;
    for (const s of [ENG_SEAM_S, ENG_SEAM_P]) {
      ctx.beginPath();
      ctx.moveTo(s[0].x, s[0].y);
      ctx.lineTo(s[1].x, s[1].y);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;

    // Engine glows — twin pods
    drawEngineGlow(ctx, ENGINE_POS, this.engineColor, 3 + this.throttleLevel * 0.65, 2.5, 2.5, 0.28);
  }

  getBounds() {
    return { x: this.x, y: this.y, radius: 36 };
  }
}
