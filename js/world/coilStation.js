// The Coil — lawless hub station icon. ~300px visual diameter.

import { Station } from './station.js';
import { AMBER, WHITE } from '../ui/colors.js';

const HULL_FILL = 'rgba(25,12,0,0.92)';

export class CoilStation extends Station {
  constructor(x, y, data) {
    super(x, y, data);
    this.dockingRadius = 200;
  }

  update(dt) {
    super.update(dt);
  }

  render(ctx, camera) {
    const screen = camera.worldToScreen(this.x, this.y);
    const cx = screen.x, cy = screen.y;
    const t = this._navPulse;

    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(camera.zoom, camera.zoom);

    const accent = this.accentColor;

    // ── BOXY SHIP SILHOUETTE HELPER ───────────────────────────────────────────
    const drawShip = (x, y, rot, sc, alpha) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rot);
      ctx.scale(sc, sc);
      ctx.fillStyle = 'rgba(12,9,0,0.9)';
      ctx.strokeStyle = WHITE;
      ctx.lineWidth = 1.1 / sc;
      const part = (rx, ry, rw, rh) => {
        ctx.beginPath();
        ctx.rect(rx, ry, rw, rh);
        ctx.globalAlpha = alpha;
        ctx.fill();
        ctx.globalAlpha = alpha * 0.72;
        ctx.stroke();
      };
      part(-9, -8, 18, 20);    // main hull body
      part(-5, -16, 10, 10);   // cockpit block
      part(-7, 12, 14,  6);    // engine block
      part(-16, -3,  7,  9);   // port wing stub
      part(  9, -3,  7,  9);   // starboard wing stub
      ctx.beginPath();
      ctx.arc(0, 18, 2.8, 0, Math.PI * 2);
      ctx.fillStyle = accent;
      ctx.globalAlpha = alpha * 0.4;
      ctx.fill();
      ctx.globalAlpha = 1;
      ctx.restore();
    };

    // ── HARBOR AMBIENT GLOW ──────────────────────────────────────────────────
    const hg = ctx.createRadialGradient(0, 10, 5, 0, 10, 110);
    hg.addColorStop(0, 'rgba(255,170,0,0.05)');
    hg.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = hg;
    ctx.fillRect(-90, -65, 182, 158);

    // ── HULL SECTIONS — 15 rects forming the U ───────────────────────────────
    // Each is a distinct panel section, deliberately misaligned for cobbled feel.
    // Inner harbor mouth: x −88 to +88, open at bottom (y > 93)
    const sections = [
      // Left arm — right edges cluster near x=−88
      { x: -155, y: -108, w: 67, h: 52 },   // upper-left
      { x: -158, y:  -57, w: 68, h: 58 },   // mid-left
      { x: -153, y:   -1, w: 65, h: 94 },   // lower-left
      // Back wall — bottom edges cluster near y=−60, much thicker than arms
      { x:  -88, y: -200, w: 52, h: 140 },  // left-back panel
      { x:  -36, y: -210, w: 74, h: 150 },  // center hub — tallest
      { x:   38, y: -195, w: 54, h: 135 },  // right-back panel
      // Right arm — left edges cluster near x=+88
      { x:   90, y: -104, w: 62, h: 46 },   // upper-right
      { x:   92, y:  -58, w: 58, h: 56 },   // mid-right
      { x:   88, y:   -3, w: 64, h: 90 },   // lower-right
      // Left outer jettys — right edges at x=−158
      { x: -208, y:  -84, w: 50, h: 22 },   // jetty L1
      { x: -200, y:  -18, w: 42, h: 17 },   // jetty L2
      { x: -196, y:   40, w: 38, h: 15 },   // jetty L3
      // Right outer jettys — left edges at x=+152
      { x:  152, y:  -78, w: 55, h: 20 },   // jetty R1
      { x:  152, y:   18, w: 46, h: 16 },   // jetty R2
      // Back top jetty — connects to hub top at y=−210
      { x:  -20, y: -262, w: 40, h: 52 },   // jetty top
    ];

    ctx.strokeStyle = WHITE;
    ctx.lineWidth = 1.6;
    for (const s of sections) {
      ctx.beginPath();
      ctx.rect(s.x, s.y, s.w, s.h);
      ctx.fillStyle = 'rgba(18,13,0,0.95)';
      ctx.fill();
      ctx.globalAlpha = 0.55;
      ctx.stroke();
      ctx.globalAlpha = 1;
    }

    // ── INTERIOR RIB LINES (panel plating detail) ─────────────────────────────
    ctx.strokeStyle = WHITE;
    ctx.lineWidth = 0.6;
    ctx.globalAlpha = 0.18;
    for (const y of [-88, -35, 22, 65]) {
      ctx.beginPath(); ctx.moveTo(-158, y); ctx.lineTo(-88, y); ctx.stroke();
    }
    for (const y of [-80, -22, 32, 72]) {
      ctx.beginPath(); ctx.moveTo(88, y); ctx.lineTo(152, y); ctx.stroke();
    }
    for (const x of [-58, -5, 55]) {
      ctx.beginPath(); ctx.moveTo(x, -210); ctx.lineTo(x, -60); ctx.stroke();
    }
    ctx.globalAlpha = 1;

    // ── HARBOR INNER DOCKING PIERS ────────────────────────────────────────────
    const harborArms = [
      { x: -88, y: -30, dir:  1, len: 45, w: 10 },
      { x: -88, y:  38, dir:  1, len: 30, w:  8 },
      { x:  88, y: -22, dir: -1, len: 40, w:  9 },
      { x:  88, y:  42, dir: -1, len: 50, w: 11 },
    ];
    for (const arm of harborArms) {
      const aw = arm.dir * arm.len;
      ctx.beginPath();
      ctx.rect(arm.x, arm.y - arm.w / 2, aw, arm.w);
      ctx.fillStyle = 'rgba(10,7,0,0.92)';
      ctx.fill();
      ctx.strokeStyle = WHITE;
      ctx.lineWidth = 1.1;
      ctx.globalAlpha = 0.35;
      ctx.stroke();
      const tipX = arm.x + aw;
      const pulse = 0.45 + 0.4 * Math.sin(t * 3.2 + arm.y * 0.15);
      ctx.beginPath();
      ctx.arc(tipX, arm.y, 3.5, 0, Math.PI * 2);
      ctx.fillStyle = accent;
      ctx.globalAlpha = pulse;
      ctx.fill();
      ctx.globalAlpha = 1;
    }

    // ── DOCKED / DISASSEMBLED SHIPS ───────────────────────────────────────────
    // Left outer jettys (nose pointing away from station — left)
    drawShip(-208,      -73, -Math.PI * 0.5,  1.4, 0.52);
    drawShip(-200,       -9,  Math.PI * 0.45, 1.6, 0.48);
    drawShip(-196,       47, -Math.PI * 0.5,  1.3, 0.44);
    // Right outer jettys
    drawShip(152 + 55,  -68,  Math.PI * 0.5,  1.5, 0.50);
    drawShip(152 + 46,   26,  Math.PI * 1.5,  1.4, 0.46);
    // Back top jetty
    drawShip(0,         -262, 0,              1.3, 0.45);
    // Harbor inner piers — docked alongside
    drawShip(-88 + 40,  -30, -Math.PI * 0.5,  1.2, 0.50);
    drawShip( 88 - 42,   42,  Math.PI * 0.5,  1.3, 0.48);

    // ── PATCHED PANELS (surface clutter) ──────────────────────────────────────
    const patches = [
      { x: -132, y:  44, rot:  0.15, w: 28, h: 15 },
      { x: -128, y: -48, rot: -0.10, w: 22, h: 12 },
      { x:  118, y: -28, rot:  0.20, w: 24, h: 12 },
      { x:  122, y:  50, rot: -0.12, w: 20, h: 10 },
      { x:   -8, y: -95, rot:  0.06, w: 32, h:  9 },
      { x:  -55, y: -82, rot: -0.08, w: 18, h:  8 },
    ];
    ctx.strokeStyle = WHITE;
    ctx.lineWidth = 0.9;
    for (const p of patches) {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.globalAlpha = 0.32;
      ctx.strokeRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx.beginPath();
      ctx.arc(0, 0, 1.5, 0, Math.PI * 2);
      ctx.fillStyle = WHITE;
      ctx.globalAlpha = 0.26;
      ctx.fill();
      ctx.restore();
    }
    ctx.globalAlpha = 1;

    // ── RUNNING LIGHTS — sequential chase ─────────────────────────────────────
    const litPhase = (t * 2.5) % 1;
    const leftLY  = [-82, -30, 30, 72];
    const rightLY = [-72, -15, 62];
    for (let i = 0; i < leftLY.length; i++) {
      ctx.beginPath();
      ctx.arc(-158, leftLY[i], 2.5, 0, Math.PI * 2);
      ctx.fillStyle = accent;
      ctx.globalAlpha = ((litPhase + i * 0.25) % 1) < 0.3 ? 0.85 : 0.15;
      ctx.fill();
    }
    for (let i = 0; i < rightLY.length; i++) {
      ctx.beginPath();
      ctx.arc(152, rightLY[i], 2.5, 0, Math.PI * 2);
      ctx.fillStyle = accent;
      ctx.globalAlpha = ((litPhase + i * 0.33 + 0.5) % 1) < 0.3 ? 0.85 : 0.15;
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    // ── HARBOR ENTRANCE BEACONS ───────────────────────────────────────────────
    const beaconPulse = 0.5 + 0.5 * Math.sin(t * Math.PI * 1.5);
    // Beacon glow color as rgba — derive from relation
    const rel = this.relation;
    const beaconGlowColor = rel === 'friendly' ? 'rgba(0,255,204,0.06)' : rel === 'enemy' ? 'rgba(255,68,68,0.06)' : 'rgba(255,170,0,0.06)';
    const beaconGlowStop0  = rel === 'friendly' ? 'rgba(0,255,204,0.09)' : rel === 'enemy' ? 'rgba(255,68,68,0.09)' : 'rgba(255,170,0,0.09)';
    const beaconGlowStop1  = rel === 'friendly' ? 'rgba(0,255,204,0)'    : rel === 'enemy' ? 'rgba(255,68,68,0)'    : 'rgba(255,170,0,0)';
    for (const bx of [-88, 88]) {
      ctx.beginPath();
      ctx.arc(bx, 93, 12, 0, Math.PI * 2);
      ctx.fillStyle = beaconGlowColor;
      ctx.globalAlpha = beaconPulse;
      ctx.fill();
      ctx.beginPath();
      ctx.arc(bx, 93, 5, 0, Math.PI * 2);
      ctx.fillStyle = accent;
      ctx.globalAlpha = beaconPulse * 0.9;
      ctx.fill();
      ctx.globalAlpha = 1;
    }

    // ── APPROACH BEAM ─────────────────────────────────────────────────────────
    const beam = ctx.createLinearGradient(0, 93, 0, 178);
    beam.addColorStop(0, beaconGlowStop0);
    beam.addColorStop(1, beaconGlowStop1);
    ctx.fillStyle = beam;
    ctx.beginPath();
    ctx.moveTo(-88, 93);
    ctx.lineTo(88, 93);
    ctx.lineTo(112, 178);
    ctx.lineTo(-112, 178);
    ctx.closePath();
    ctx.fill();

    this._renderNameLabel(ctx, camera, 110, 'bold 11px monospace', 0.85);

    ctx.restore();
  }

  getBounds() {
    return { x: this.x, y: this.y, radius: 150 };
  }
}

export function createCoilStation(data) {
  return new CoilStation(data.x, data.y, data);
}
