import { Ship } from '../../entities/ship.js';
import { Autocannon } from '../../weapons/autocannon.js';
import { PLAYER_FILL, PLAYER_STROKE, ENGINE_GREEN } from '../../ui/colors.js';

// Frigate (Kiter) — sleek, angular interceptor. Long sharp nose with sensor spike,
// narrow fuselage widening to swept-back wings with clipped tips.
// Fast and predatory, like a stripped-down racing yacht with guns.
const HULL_POINTS = [
  // Sensor spike and nose
  { x: 0,   y: -24 },  // sensor tip
  { x: 2,   y: -20 },  // starboard spike base
  { x: 3,   y: -16 },  // starboard nose

  // Starboard fuselage — narrow neck
  { x: 4,   y: -8  },  // starboard neck

  // Starboard wing — swept back
  { x: 6,   y: -4  },  // wing root leading edge
  { x: 16,  y: 4   },  // wing tip leading edge
  { x: 18,  y: 6   },  // wing tip point
  { x: 14,  y: 8   },  // wing tip trailing edge
  { x: 7,   y: 6   },  // wing root trailing edge

  // Stern
  { x: 6,   y: 12  },  // starboard stern
  { x: -6,  y: 12  },  // port stern

  // Port wing — mirror
  { x: -7,  y: 6   },  // wing root trailing edge
  { x: -14, y: 8   },  // wing tip trailing edge
  { x: -18, y: 6   },  // wing tip point
  { x: -16, y: 4   },  // wing tip leading edge
  { x: -6,  y: -4  },  // wing root leading edge

  // Port fuselage
  { x: -4,  y: -8  },  // port neck
  { x: -3,  y: -16 },  // port nose
  { x: -2,  y: -20 },  // port spike base
];

// Central spine line down the fuselage
const SPINE = [
  { x: 0, y: -18 },
  { x: 0, y: 10  },
];

// Wing spar lines (structural ribs inside each wing)
const STARBOARD_SPAR = [
  { x: 5,  y: -2 },
  { x: 15, y: 5  },
];

const PORT_SPAR = [
  { x: -5,  y: -2 },
  { x: -15, y: 5  },
];

// Cockpit canopy — small angular window near the nose
const CANOPY = [
  { x: -2, y: -14 },
  { x: 0,  y: -16 },
  { x: 2,  y: -14 },
  { x: 0,  y: -11 },
];

// Engines — set into the wing roots at the stern
const ENGINE_POS = [
  { x: 4,  y: 11 },
  { x: -4, y: 11 },
];

class Frigate extends Ship {
  constructor(x, y) {
    super(x, y);

    this.faction = 'player';
    this.shipType = 'frigate';
    this.behaviorType = 'kiter';
    this._trailColor = ENGINE_GREEN;

    this.armorMax = 40;
    this.armorCurrent = 40;
    this.hullMax = 80;
    this.hullCurrent = 80;
    this.speedMax = 110;
    this.acceleration = 35;
    this.turnRate = 3.0;
    this.cargoCapacity = 10;

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

    ctx.fillStyle = PLAYER_FILL;
    ctx.fill();
    ctx.strokeStyle = PLAYER_STROKE;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Central spine
    ctx.beginPath();
    ctx.moveTo(SPINE[0].x, SPINE[0].y);
    ctx.lineTo(SPINE[1].x, SPINE[1].y);
    ctx.strokeStyle = PLAYER_STROKE;
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.2;
    ctx.stroke();
    ctx.globalAlpha = 1;

    // Wing spars
    for (const spar of [STARBOARD_SPAR, PORT_SPAR]) {
      ctx.beginPath();
      ctx.moveTo(spar[0].x, spar[0].y);
      ctx.lineTo(spar[1].x, spar[1].y);
      ctx.strokeStyle = PLAYER_STROKE;
      ctx.lineWidth = 1;
      ctx.globalAlpha = 0.2;
      ctx.stroke();
      ctx.globalAlpha = 1;
    }

    // Cockpit canopy
    ctx.beginPath();
    ctx.moveTo(CANOPY[0].x, CANOPY[0].y);
    for (let i = 1; i < CANOPY.length; i++) {
      ctx.lineTo(CANOPY[i].x, CANOPY[i].y);
    }
    ctx.closePath();
    ctx.strokeStyle = PLAYER_STROKE;
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.4;
    ctx.stroke();
    ctx.globalAlpha = 1;

    // Engine glow
    const pulse = 0.6 + Math.sin(Date.now() * 0.008) * 0.4;
    const baseRadius = 1.5 + this.throttleLevel * 0.4;

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
    return { x: this.x, y: this.y, radius: 16 };
  }
}

export function createFrigate(x, y) {
  return new Frigate(x, y);
}
