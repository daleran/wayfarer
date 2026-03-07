import { Ship } from '../../entities/ship.js';
import { PLAYER_FILL, PLAYER_STROKE, ENGINE_GREEN } from '../../ui/colors.js';

// Hauler — industrial tug cab with wide windshield, reinforced bumper frame,
// side-mounted engine pods on struts. Tows 3 cargo containers on couplings.
// Looks like a space trucker rig — practical, chunky, working-class.
const COCKPIT_POINTS = [
  // Bumper frame at the nose — wider than the cab body
  { x: -10, y: -16 },  // port bumper corner
  { x: -8,  y: -18 },  // port bumper chamfer
  { x: 8,   y: -18 },  // starboard bumper chamfer
  { x: 10,  y: -16 },  // starboard bumper corner

  // Cab body — slightly narrower than bumper
  { x: 10,  y: -12 },  // starboard upper
  { x: 9,   y: 6   },  // starboard lower (tapers slightly)
  { x: -9,  y: 6   },  // port lower
  { x: -10, y: -12 },  // port upper
];

// Windshield band across the upper cab
const WINDSHIELD = [
  { x: -8, y: -14 },
  { x: 8,  y: -14 },
];

// Cab roof antenna/sensor mast
const ANTENNA = [
  { x: -6, y: -10 },
  { x: -6, y: -6  },
];

// Hull seam across the cab mid-section
const CAB_SEAM = [
  { x: -9, y: -4 },
  { x: 9,  y: -4 },
];

// Cargo container template — rectangular box with cross-bracing
const CONTAINER_POINTS = [
  { x: -7, y: -8 },
  { x: 7,  y: -8 },
  { x: 7,  y: 8  },
  { x: -7, y: 8  },
];

// Cross-brace inside each container (X pattern)
const CONTAINER_BRACE_1 = [
  { x: -6, y: -7 },
  { x: 6,  y: 7  },
];
const CONTAINER_BRACE_2 = [
  { x: 6,  y: -7 },
  { x: -6, y: 7  },
];

// Engines on pylons, wide out to the sides of the cockpit
const ENGINE_POS = [
  { x: 18, y: -4 },
  { x: -18, y: -4 },
];

// Pylon struts connecting cab to engine pods (angled for character)
const PYLONS = [
  // Starboard — two struts for rigidity
  { from: { x: 10, y: -8 }, to: { x: 18, y: -6 } },
  { from: { x: 10, y: 0  }, to: { x: 18, y: -2 } },
  // Port
  { from: { x: -10, y: -8 }, to: { x: -18, y: -6 } },
  { from: { x: -10, y: 0  }, to: { x: -18, y: -2 } },
];

// Engine pod housing (small rectangles around each engine)
const ENGINE_POD = [
  { x: -3, y: -5 },
  { x: 3,  y: -5 },
  { x: 3,  y: 3  },
  { x: -3, y: 3  },
];

const NUM_CONTAINERS = 3;
const SEGMENT_SPACING = 18; // frames between each container
const MAX_HISTORY = 120;

class Hauler extends Ship {
  constructor(x, y) {
    super(x, y);

    this.faction = 'player';
    this.shipType = 'hauler';
    this.behaviorType = 'flee';
    this._trailColor = ENGINE_GREEN;

    this.armorMax = 30;
    this.armorCurrent = 30;
    this.hullMax = 120;
    this.hullCurrent = 120;
    this.speedMax = 70;
    this.acceleration = 20;
    this.turnRate = 2.0;
    this.cargoCapacity = 200;
    this.crewMax = 3;
    this.crewCurrent = 3;

    this._positionHistory = [];
  }

  get _engineOffsets() {
    return ENGINE_POS;
  }

  update(dt) {
    super.update(dt);

    // Record position history every tick
    this._positionHistory.push({
      x: this.x,
      y: this.y,
      rotation: this.rotation,
    });
    if (this._positionHistory.length > MAX_HISTORY) {
      this._positionHistory.shift();
    }
  }

  render(ctx, camera) {
    // Draw trails first (behind everything)
    this._renderTrails(ctx, camera);

    const hist = this._positionHistory;
    const len = hist.length;

    // Draw containers from back to front (so front overlaps back)
    for (let i = NUM_CONTAINERS - 1; i >= 0; i--) {
      const histIdx = len - 1 - (i + 1) * SEGMENT_SPACING;

      let cx, cy, cr;
      if (histIdx >= 0) {
        cx = hist[histIdx].x;
        cy = hist[histIdx].y;
        cr = hist[histIdx].rotation;
      } else {
        const offset = (i + 1) * 20;
        cx = this.x - Math.sin(this.rotation) * offset;
        cy = this.y + Math.cos(this.rotation) * offset;
        cr = this.rotation;
      }

      const screen = camera.worldToScreen(cx, cy);

      // Coupling line from previous segment to this one
      let prevX, prevY;
      if (i === 0) {
        const sternOffset = 6;
        prevX = this.x + Math.sin(this.rotation) * sternOffset;
        prevY = this.y - Math.cos(this.rotation) * sternOffset;
      } else {
        const prevHistIdx = len - 1 - i * SEGMENT_SPACING;
        if (prevHistIdx >= 0) {
          const prevSternOffset = 8;
          prevX = hist[prevHistIdx].x + Math.sin(hist[prevHistIdx].rotation) * prevSternOffset;
          prevY = hist[prevHistIdx].y - Math.cos(hist[prevHistIdx].rotation) * prevSternOffset;
        } else {
          const prevOffset = i * 20;
          prevX = this.x - Math.sin(this.rotation) * prevOffset;
          prevY = this.y + Math.cos(this.rotation) * prevOffset;
        }
      }

      // Draw coupling line
      const prevScreen = camera.worldToScreen(prevX, prevY);
      const noseOffset = -8;
      const noseWX = cx + Math.sin(cr) * noseOffset;
      const noseWY = cy - Math.cos(cr) * noseOffset;
      const noseScreen = camera.worldToScreen(noseWX, noseWY);

      ctx.save();
      ctx.strokeStyle = PLAYER_STROKE;
      ctx.lineWidth = 1;
      ctx.globalAlpha = 0.4;
      ctx.beginPath();
      ctx.moveTo(prevScreen.x, prevScreen.y);
      ctx.lineTo(noseScreen.x, noseScreen.y);
      ctx.stroke();
      ctx.restore();

      // Draw container
      ctx.save();
      ctx.translate(screen.x, screen.y);
      ctx.rotate(cr);
      ctx.globalAlpha = 0.7;

      ctx.beginPath();
      ctx.moveTo(CONTAINER_POINTS[0].x, CONTAINER_POINTS[0].y);
      for (let j = 1; j < CONTAINER_POINTS.length; j++) {
        ctx.lineTo(CONTAINER_POINTS[j].x, CONTAINER_POINTS[j].y);
      }
      ctx.closePath();

      ctx.fillStyle = PLAYER_FILL;
      ctx.fill();
      ctx.strokeStyle = PLAYER_STROKE;
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Cross-bracing inside container
      ctx.globalAlpha = 0.15;
      ctx.beginPath();
      ctx.moveTo(CONTAINER_BRACE_1[0].x, CONTAINER_BRACE_1[0].y);
      ctx.lineTo(CONTAINER_BRACE_1[1].x, CONTAINER_BRACE_1[1].y);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(CONTAINER_BRACE_2[0].x, CONTAINER_BRACE_2[0].y);
      ctx.lineTo(CONTAINER_BRACE_2[1].x, CONTAINER_BRACE_2[1].y);
      ctx.stroke();

      ctx.restore();
    }

    // Draw cockpit on top
    const cockpitScreen = camera.worldToScreen(this.x, this.y);
    ctx.save();
    ctx.translate(cockpitScreen.x, cockpitScreen.y);
    ctx.rotate(this.rotation);
    this._drawShape(ctx);
    ctx.restore();
  }

  _drawShape(ctx) {
    // Cockpit hull
    ctx.beginPath();
    ctx.moveTo(COCKPIT_POINTS[0].x, COCKPIT_POINTS[0].y);
    for (let i = 1; i < COCKPIT_POINTS.length; i++) {
      ctx.lineTo(COCKPIT_POINTS[i].x, COCKPIT_POINTS[i].y);
    }
    ctx.closePath();

    ctx.fillStyle = PLAYER_FILL;
    ctx.fill();
    ctx.strokeStyle = PLAYER_STROKE;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Windshield band
    ctx.beginPath();
    ctx.moveTo(WINDSHIELD[0].x, WINDSHIELD[0].y);
    ctx.lineTo(WINDSHIELD[1].x, WINDSHIELD[1].y);
    ctx.strokeStyle = PLAYER_STROKE;
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.4;
    ctx.stroke();
    ctx.globalAlpha = 1;

    // Antenna mast
    ctx.beginPath();
    ctx.moveTo(ANTENNA[0].x, ANTENNA[0].y);
    ctx.lineTo(ANTENNA[1].x, ANTENNA[1].y);
    ctx.strokeStyle = PLAYER_STROKE;
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.35;
    ctx.stroke();
    ctx.globalAlpha = 1;

    // Cab seam
    ctx.beginPath();
    ctx.moveTo(CAB_SEAM[0].x, CAB_SEAM[0].y);
    ctx.lineTo(CAB_SEAM[1].x, CAB_SEAM[1].y);
    ctx.strokeStyle = PLAYER_STROKE;
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.2;
    ctx.stroke();
    ctx.globalAlpha = 1;

    // Engine pod housings
    for (const pos of ENGINE_POS) {
      ctx.save();
      ctx.translate(pos.x, pos.y);
      ctx.beginPath();
      ctx.moveTo(ENGINE_POD[0].x, ENGINE_POD[0].y);
      for (let i = 1; i < ENGINE_POD.length; i++) {
        ctx.lineTo(ENGINE_POD[i].x, ENGINE_POD[i].y);
      }
      ctx.closePath();
      ctx.fillStyle = PLAYER_FILL;
      ctx.fill();
      ctx.strokeStyle = PLAYER_STROKE;
      ctx.lineWidth = 1;
      ctx.globalAlpha = 0.5;
      ctx.stroke();
      ctx.globalAlpha = 1;
      ctx.restore();
    }

    // Engine pylons — double struts for rigidity
    for (const pylon of PYLONS) {
      ctx.beginPath();
      ctx.moveTo(pylon.from.x, pylon.from.y);
      ctx.lineTo(pylon.to.x, pylon.to.y);
      ctx.strokeStyle = PLAYER_STROKE;
      ctx.lineWidth = 1;
      ctx.globalAlpha = 0.4;
      ctx.stroke();
      ctx.globalAlpha = 1;
    }

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
    // Collision only on cockpit
    return { x: this.x, y: this.y, radius: 14 };
  }
}

export function createHauler(x, y) {
  return new Hauler(x, y);
}
