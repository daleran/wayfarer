import { Ship } from '../../entities/ship.js';
import { Autocannon } from '../../weapons/autocannon.js';
import { ENEMY_FILL, ENEMY_STROKE, RED, ENGINE_RED } from '../../ui/colors.js';

// Raider — cobbled-together scavenger attack ship. Asymmetric hull with a
// forward-raked ram prow, mismatched armor plates welded on, and exposed
// structural ribs. One oversized engine nacelle (starboard), one smaller
// thruster (port). Aggressive, jury-rigged, and mean.
const HULL_POINTS = [
  // Ram prow — sharp, off-center (slightly starboard-biased)
  { x: 1,   y: -18 },  // ram tip

  // Starboard hull — heavy side with welded-on armor plate
  { x: 5,   y: -14 },  // starboard prow
  { x: 8,   y: -8  },  // starboard mid forward
  { x: 12,  y: -4  },  // armor plate outer top
  { x: 14,  y: 2   },  // armor plate outer mid
  { x: 13,  y: 8   },  // starboard nacelle outer
  { x: 13,  y: 14  },  // starboard nacelle stern
  { x: 6,   y: 14  },  // starboard nacelle inner

  // Stern
  { x: 5,   y: 12  },  // starboard stern step
  { x: -3,  y: 12  },  // port stern

  // Port hull — lighter, narrower side
  { x: -5,  y: 10  },  // port thruster housing
  { x: -9,  y: 8   },  // port thruster outer
  { x: -9,  y: 4   },  // port thruster outer top
  { x: -6,  y: 2   },  // port mid
  { x: -7,  y: -6  },  // port mid forward
  { x: -4,  y: -14 },  // port prow
];

// Welded armor plate seam (starboard side)
const ARMOR_WELD = [
  { x: 10, y: -6 },
  { x: 12, y: 6  },
];

// Exposed structural rib (visible through hull gap)
const RIB_1 = [
  { x: -3, y: -4 },
  { x: 4,  y: -4 },
];
const RIB_2 = [
  { x: -2, y: 2 },
  { x: 5,  y: 2 },
];

// Ram prow reinforcement line
const RAM_LINE = [
  { x: 0, y: -16 },
  { x: 0, y: -8  },
];

// Engine positions — mismatched sizes
const ENGINE_STARBOARD = { x: 10, y: 13 };  // big engine
const ENGINE_PORT = { x: -7, y: 7 };        // small thruster

const ENGINE_POS = [
  ENGINE_STARBOARD,
  ENGINE_PORT,
];

class Raider extends Ship {
  constructor(x, y) {
    super(x, y);

    this.faction = 'scavenger';
    this._trailColor = RED;

    this.armorMax = 40;
    this.armorCurrent = 40;
    this.hullMax = 60;
    this.hullCurrent = 60;

    this.speedMax = 150;
    this.acceleration = 40;
    this.turnRate = 3.0;
    this.throttleLevels = 6;
    this._throttleRatios = [0, 0.15, 0.35, 0.55, 0.8, 1.5];
    this.crewMax = 4;
    this.crewCurrent = 4;

    this.addWeapon(new Autocannon());
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

    ctx.fillStyle = ENEMY_FILL;
    ctx.fill();
    ctx.strokeStyle = ENEMY_STROKE;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Welded armor plate seam
    ctx.beginPath();
    ctx.moveTo(ARMOR_WELD[0].x, ARMOR_WELD[0].y);
    ctx.lineTo(ARMOR_WELD[1].x, ARMOR_WELD[1].y);
    ctx.strokeStyle = ENEMY_STROKE;
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.3;
    ctx.stroke();
    ctx.globalAlpha = 1;

    // Exposed structural ribs
    for (const rib of [RIB_1, RIB_2]) {
      ctx.beginPath();
      ctx.moveTo(rib[0].x, rib[0].y);
      ctx.lineTo(rib[1].x, rib[1].y);
      ctx.strokeStyle = ENEMY_STROKE;
      ctx.lineWidth = 1;
      ctx.globalAlpha = 0.25;
      ctx.stroke();
      ctx.globalAlpha = 1;
    }

    // Ram prow reinforcement
    ctx.beginPath();
    ctx.moveTo(RAM_LINE[0].x, RAM_LINE[0].y);
    ctx.lineTo(RAM_LINE[1].x, RAM_LINE[1].y);
    ctx.strokeStyle = ENEMY_STROKE;
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.3;
    ctx.stroke();
    ctx.globalAlpha = 1;

    // Engine glow — mismatched engines
    const pulse = 0.6 + Math.sin(Date.now() * 0.008) * 0.4;

    // Big starboard engine
    const bigRadius = 2.5 + this.throttleLevel * 0.5;
    ctx.beginPath();
    ctx.arc(ENGINE_STARBOARD.x, ENGINE_STARBOARD.y, bigRadius, 0, Math.PI * 2);
    ctx.strokeStyle = ENGINE_RED;
    ctx.lineWidth = 1.5;
    ctx.globalAlpha = pulse;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(ENGINE_STARBOARD.x, ENGINE_STARBOARD.y, bigRadius + 2 + pulse * 2, 0, Math.PI * 2);
    ctx.strokeStyle = RED;
    ctx.lineWidth = 1;
    ctx.globalAlpha = pulse * 0.3;
    ctx.stroke();
    ctx.globalAlpha = 1;

    // Small port thruster
    const smallRadius = 1.5 + this.throttleLevel * 0.3;
    ctx.beginPath();
    ctx.arc(ENGINE_PORT.x, ENGINE_PORT.y, smallRadius, 0, Math.PI * 2);
    ctx.strokeStyle = ENGINE_RED;
    ctx.lineWidth = 1.5;
    ctx.globalAlpha = pulse;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(ENGINE_PORT.x, ENGINE_PORT.y, smallRadius + 1.5 + pulse * 1.5, 0, Math.PI * 2);
    ctx.strokeStyle = RED;
    ctx.lineWidth = 1;
    ctx.globalAlpha = pulse * 0.3;
    ctx.stroke();
    ctx.globalAlpha = 1;
  }

  getBounds() {
    return { x: this.x, y: this.y, radius: 16 };
  }
}

export function createRaider(x, y) {
  return new Raider(x, y);
}
