import { Ship } from '../../entities/ship.js';
import { PLAYER_FILL, PLAYER_STROKE, ENGINE_GREEN } from '../../ui/colors.js';

// Repurposed tug — hammerhead cockpit block, narrow body, long starboard engine nacelle,
// smaller port utility nacelle. Nacelles are longer than wide (classic sci-fi).
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

  // Utility nacelle (port) — smaller but still longer than wide
  { x: -4,  y: 8   },  // nacelle inner bottom
  { x: -12, y: 8   },  // nacelle outer bottom
  { x: -12, y: -6  },  // nacelle outer top
  { x: -4,  y: -6  },  // nacelle inner top

  // Port neck
  { x: -4,  y: -20 },  // port neck top
  { x: -11, y: -20 },  // port cockpit bottom (closes to port cockpit side)
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
const ENGINE_POS = [
  { x: 11, y: 12 },
];

class ScrapShip extends Ship {
  constructor(x, y) {
    super(x, y);

    this.faction = 'player';
    this.shipType = 'scrapship';
    this._trailColor = ENGINE_GREEN;

    this.armorArcs    = { front: 120, port: 90, starboard: 90, aft: 70 };
    this.armorArcsMax = { front: 120, port: 90, starboard: 90, aft: 70 };
    this.hullMax     = 200;
    this.hullCurrent = 200;
    this.speedMax = 120;
    this.acceleration = 30;
    this.turnRate = 2.5;
    this.throttleLevels = 6;
    this._throttleRatios = [0, 0.15, 0.35, 0.55, 0.8, 1.5];

    this.cargoCapacity = 100;
  }

  get _engineOffsets() {
    return ENGINE_POS;
  }

  _drawShape(ctx) {
    // Main hull — wide bumper, narrow body, starboard engine bay
    ctx.beginPath();
    ctx.moveTo(HULL_POINTS[0].x, HULL_POINTS[0].y);
    for (let i = 1; i < HULL_POINTS.length; i++) {
      ctx.lineTo(HULL_POINTS[i].x, HULL_POINTS[i].y);
    }
    ctx.closePath();

    ctx.fillStyle = PLAYER_FILL;
    ctx.fill();
    ctx.strokeStyle = PLAYER_STROKE;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Cockpit window slit inside hammerhead
    ctx.beginPath();
    ctx.moveTo(-8, -24);
    ctx.lineTo(8, -24);
    ctx.strokeStyle = PLAYER_STROKE;
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.4;
    ctx.stroke();
    ctx.globalAlpha = 1;

    // Engine bay internal frame
    ctx.beginPath();
    ctx.moveTo(BAY_FRAME[0].x, BAY_FRAME[0].y);
    ctx.lineTo(BAY_FRAME[1].x, BAY_FRAME[1].y);
    ctx.strokeStyle = PLAYER_STROKE;
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.3;
    ctx.stroke();
    ctx.globalAlpha = 1;

    // Port bay internal frame
    ctx.beginPath();
    ctx.moveTo(PORT_BAY_FRAME[0].x, PORT_BAY_FRAME[0].y);
    ctx.lineTo(PORT_BAY_FRAME[1].x, PORT_BAY_FRAME[1].y);
    ctx.strokeStyle = PLAYER_STROKE;
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.3;
    ctx.stroke();
    ctx.globalAlpha = 1;

    // Weld seam across hull
    ctx.beginPath();
    ctx.moveTo(WELD_SEAM[0].x, WELD_SEAM[0].y);
    ctx.lineTo(WELD_SEAM[1].x, WELD_SEAM[1].y);
    ctx.strokeStyle = PLAYER_STROKE;
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.25;
    ctx.stroke();
    ctx.globalAlpha = 1;

    // Engine glow — pulsing circles
    const pulse = 0.6 + Math.sin(Date.now() * 0.008) * 0.4;
    const baseRadius = 3 + this.throttleLevel * 0.6;

    for (const pos of ENGINE_POS) {
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, baseRadius, 0, Math.PI * 2);
      ctx.strokeStyle = ENGINE_GREEN;
      ctx.lineWidth = 1.5;
      ctx.globalAlpha = pulse;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(pos.x, pos.y, baseRadius + 2 + pulse * 2, 0, Math.PI * 2);
      ctx.strokeStyle = ENGINE_GREEN;
      ctx.lineWidth = 1;
      ctx.globalAlpha = pulse * 0.3;
      ctx.stroke();

      ctx.globalAlpha = 1;
    }
  }

  getBounds() {
    return { x: this.x, y: this.y, radius: 20 };
  }
}

export function createScrapShip(x, y) {
  return new ScrapShip(x, y);
}
