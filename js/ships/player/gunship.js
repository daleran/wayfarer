import { Ship } from '../../entities/ship.js';
import { Autocannon } from '../../weapons/autocannon.js';
import { PLAYER_FILL, PLAYER_STROKE, ENGINE_GREEN } from '../../ui/colors.js';

// Brawler — heavy armored box with angled bow deflector, recessed turret ring,
// twin engine nacelles flanking a reinforced stern. Thick, stubby, built to absorb hits.
const HULL_POINTS = [
  // Bow deflector — angled armor plate across the front
  { x: -12, y: -14 },  // port deflector edge
  { x: -6,  y: -18 },  // port deflector angle
  { x: 6,   y: -18 },  // starboard deflector angle
  { x: 12,  y: -14 },  // starboard deflector edge

  // Starboard hull — thick with engine nacelle bulge
  { x: 14,  y: -10 },  // starboard upper hull
  { x: 14,  y: 2   },  // starboard nacelle top
  { x: 18,  y: 4   },  // starboard nacelle outer top
  { x: 18,  y: 14  },  // starboard nacelle outer bottom
  { x: 12,  y: 14  },  // starboard nacelle inner bottom

  // Stern
  { x: 12,  y: 16  },  // starboard stern
  { x: -12, y: 16  },  // port stern

  // Port hull — mirror nacelle
  { x: -12, y: 14  },  // port nacelle inner bottom
  { x: -18, y: 14  },  // port nacelle outer bottom
  { x: -18, y: 4   },  // port nacelle outer top
  { x: -14, y: 2   },  // port nacelle top
  { x: -14, y: -10 },  // port upper hull
];

// Armor plate seam across the mid-hull
const ARMOR_SEAM_1 = [
  { x: -13, y: -4 },
  { x: 13,  y: -4 },
];

// Second seam further back
const ARMOR_SEAM_2 = [
  { x: -13, y: 6 },
  { x: 13,  y: 6 },
];

// Turret ring — circle detail on the dorsal hull
const TURRET_RING = { x: 0, y: -6, radius: 4 };

// Viewport slit in the deflector
const VIEWPORT = [
  { x: -8, y: -16 },
  { x: 8,  y: -16 },
];

// Engine positions — inside the nacelles
const ENGINE_POS = [
  { x: 15,  y: 13 },
  { x: -15, y: 13 },
];

// Central thruster between nacelles
const CENTER_ENGINE = { x: 0, y: 15 };

class Gunship extends Ship {
  constructor(x, y) {
    super(x, y);

    this.faction = 'player';
    this.shipType = 'gunship';
    this.behaviorType = 'brawler';
    this._trailColor = ENGINE_GREEN;

    this.armorMax = 80;
    this.armorCurrent = 80;
    this.hullMax = 150;
    this.hullCurrent = 150;
    this.speedMax = 100;
    this.acceleration = 30;
    this.turnRate = 2.5;
    this.cargoCapacity = 15;

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

    // Viewport slit in deflector
    ctx.beginPath();
    ctx.moveTo(VIEWPORT[0].x, VIEWPORT[0].y);
    ctx.lineTo(VIEWPORT[1].x, VIEWPORT[1].y);
    ctx.strokeStyle = PLAYER_STROKE;
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.4;
    ctx.stroke();
    ctx.globalAlpha = 1;

    // Armor plate seams
    for (const seam of [ARMOR_SEAM_1, ARMOR_SEAM_2]) {
      ctx.beginPath();
      ctx.moveTo(seam[0].x, seam[0].y);
      ctx.lineTo(seam[1].x, seam[1].y);
      ctx.strokeStyle = PLAYER_STROKE;
      ctx.lineWidth = 1;
      ctx.globalAlpha = 0.2;
      ctx.stroke();
      ctx.globalAlpha = 1;
    }

    // Turret ring
    ctx.beginPath();
    ctx.arc(TURRET_RING.x, TURRET_RING.y, TURRET_RING.radius, 0, Math.PI * 2);
    ctx.strokeStyle = PLAYER_STROKE;
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.3;
    ctx.stroke();
    ctx.globalAlpha = 1;

    // Engine glow — nacelle engines + center thruster
    const pulse = 0.6 + Math.sin(Date.now() * 0.008) * 0.4;
    const baseRadius = 2 + this.throttleLevel * 0.5;

    const allEngines = [...ENGINE_POS, CENTER_ENGINE];
    for (const pos of allEngines) {
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

export function createGunship(x, y) {
  return new Gunship(x, y);
}
