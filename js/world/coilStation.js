// The Coil — lawless hub station in the Gravewake zone.
// Visual span: ~1700 wide × 820 tall (world units = pixels, ~1 screen).
//
// Districts (local space, 0,0 = structure center):
//   Port Freight Deck / MARKET    x: -850 to -270,  y:  -90 to  +90
//   Central Hub / THE PITS        x: -270 to +125,  y: -170 to +170
//   Starboard Shipyard Wing       x: +125 to +425,  y:  -95 to +100
//   The Vault (east, reinforced)  x: +425 to +855,  y: -130 to +130
//   North Market Annex / BAZAAR   x: -720 to -315,  y: -325 to  -90
//   South Shipyard Annex          x:  -45 to +280,  y: +100 to +335
//   Crane Tower A (tall)          x:  +20 to  +50,  y: +100 to +490
//   Crane Tower B                 x: +200 to +225,  y: +100 to +390
//   Crane Boom at y=490           x: -140 to +320

import { Station } from './station.js';
import { FACTION, AMBER, DIM_OUTLINE } from '../ui/colors.js';

const HULL_FILL  = 'rgba(25,12,0,0.92)';
const VAULT_FILL = 'rgba(12,6,0,0.96)';
const ANNEX_FILL = 'rgba(20,10,0,0.90)';
const BAY_FILL   = 'rgba(5,2,0,0.98)';

export class CoilStation extends Station {
  constructor(x, y, data) {
    super(x, y, data);
    this.dockingRadius = 1100;
  }

  update(dt) {
    super.update(dt);
  }

  render(ctx, camera) {
    const screen = camera.worldToScreen(this.x, this.y);
    const cx = screen.x;
    const cy = screen.y;

    ctx.save();
    ctx.translate(cx, cy);

    // ── APPROACH LIGHTS (pulsing amber dots, west docking guide) ────────────
    const litPhase = Math.floor(this._navPulse * 2) % 4;
    ctx.fillStyle = AMBER;
    for (let i = 0; i < 8; i++) {
      const lx = -950 - i * 100;
      ctx.globalAlpha = i % 4 === litPhase ? 0.55 : 0.1;
      ctx.beginPath();
      ctx.arc(lx, 110, 6, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    // ── CRANE STRUCTURES (drawn behind hull) ─────────────────────────────────
    ctx.strokeStyle = DIM_OUTLINE;
    ctx.lineWidth = 1;

    // Tower A: x 20–50, y 100–490
    ctx.globalAlpha = 0.55;
    ctx.strokeRect(20, 100, 30, 390);
    for (let y = 140; y < 490; y += 50) {
      ctx.beginPath(); ctx.moveTo(20, y); ctx.lineTo(50, y); ctx.stroke();
    }
    // Tower B: x 200–225, y 100–390
    ctx.strokeRect(200, 100, 25, 290);
    for (let y = 140; y < 390; y += 45) {
      ctx.beginPath(); ctx.moveTo(200, y); ctx.lineTo(225, y); ctx.stroke();
    }
    // Crane boom at y=490
    ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(-140, 490); ctx.lineTo(320, 490); ctx.stroke();
    // Support cables
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.2;
    ctx.beginPath(); ctx.moveTo(35, 140); ctx.lineTo(-140, 490); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(35, 140); ctx.lineTo(320, 490); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(212, 130); ctx.lineTo(90, 490); ctx.stroke();
    // Hook
    ctx.globalAlpha = 0.4;
    ctx.beginPath(); ctx.arc(35, 490, 9, 0, Math.PI * 2); ctx.stroke();
    ctx.globalAlpha = 1;

    // ── NORTH MARKET ANNEX (Bazaar) ───────────────────────────────────────────
    ctx.fillStyle = ANNEX_FILL;
    ctx.fillRect(-720, -325, 405, 235);
    ctx.strokeStyle = AMBER;
    ctx.lineWidth = 1.3;
    ctx.globalAlpha = 0.85;
    ctx.strokeRect(-720, -325, 405, 235);
    ctx.globalAlpha = 1;
    // Processing lines inside
    ctx.strokeStyle = AMBER;
    ctx.lineWidth = 0.8;
    ctx.globalAlpha = 0.1;
    for (let y = -290; y < -105; y += 55) {
      ctx.beginPath(); ctx.moveTo(-710, y); ctx.lineTo(-325, y); ctx.stroke();
    }
    for (const x of [-600, -500]) {
      ctx.beginPath(); ctx.moveTo(x, -325); ctx.lineTo(x, -90); ctx.stroke();
    }
    ctx.globalAlpha = 1;

    // ── SOUTH SHIPYARD ANNEX ──────────────────────────────────────────────────
    ctx.fillStyle = ANNEX_FILL;
    ctx.fillRect(-45, 100, 325, 235);
    ctx.strokeStyle = AMBER;
    ctx.lineWidth = 1.3;
    ctx.globalAlpha = 0.85;
    ctx.strokeRect(-45, 100, 325, 235);
    ctx.globalAlpha = 1;
    ctx.strokeStyle = AMBER;
    ctx.lineWidth = 0.8;
    ctx.globalAlpha = 0.1;
    for (const y of [150, 210, 270]) {
      ctx.beginPath(); ctx.moveTo(-35, y); ctx.lineTo(270, y); ctx.stroke();
    }
    ctx.globalAlpha = 1;

    // ── MAIN HULL FILLS ───────────────────────────────────────────────────────
    ctx.fillStyle = HULL_FILL;
    ctx.fillRect(-850, -90, 580, 180);   // Port Freight Deck
    ctx.fillRect(-270, -170, 395, 340);  // Central Hub
    ctx.fillRect(125, -95, 300, 195);    // Starboard Wing
    ctx.fillStyle = VAULT_FILL;
    ctx.fillRect(425, -130, 430, 260);   // The Vault

    // ── DOCKING BAYS (south face notches) ────────────────────────────────────
    ctx.fillStyle = BAY_FILL;
    ctx.strokeStyle = DIM_OUTLINE;
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.9;
    for (const bx of [-750, -600, -450]) {
      ctx.fillRect(bx, 90, 80, 50);
      ctx.strokeRect(bx, 90, 80, 50);
    }
    // Starboard docking bays
    for (const bx of [145, 255]) {
      ctx.fillRect(bx, 100, 70, 40);
      ctx.strokeRect(bx, 100, 70, 40);
    }
    ctx.globalAlpha = 1;

    // ── MAIN HULL OUTLINES ────────────────────────────────────────────────────
    ctx.strokeStyle = AMBER;
    ctx.lineWidth = 1.5;
    ctx.globalAlpha = 0.9;
    ctx.strokeRect(-850, -90, 580, 180);
    ctx.strokeRect(-270, -170, 395, 340);
    ctx.strokeRect(125, -95, 300, 195);
    ctx.lineWidth = 2.5;
    ctx.globalAlpha = 1.0;
    ctx.strokeRect(425, -130, 430, 260);  // Vault (heavy)
    ctx.globalAlpha = 1;

    // Hull junction seams
    ctx.strokeStyle = AMBER;
    ctx.lineWidth = 0.8;
    ctx.globalAlpha = 0.3;
    ctx.beginPath(); ctx.moveTo(-270, -90); ctx.lineTo(-270, 90); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(125, -95); ctx.lineTo(125, 100); ctx.stroke();
    ctx.globalAlpha = 1;

    // ── INTERIOR RIBS ─────────────────────────────────────────────────────────
    ctx.strokeStyle = DIM_OUTLINE;
    ctx.lineWidth = 0.8;
    ctx.globalAlpha = 0.22;
    // Port Deck ribs (every 90u)
    for (let x = -760; x < -290; x += 90) {
      ctx.beginPath(); ctx.moveTo(x, -85); ctx.lineTo(x, 85); ctx.stroke();
    }
    // Central Hub partitions
    for (const ry of [-60, +50]) {
      ctx.beginPath(); ctx.moveTo(-265, ry); ctx.lineTo(120, ry); ctx.stroke();
    }
    ctx.beginPath(); ctx.moveTo(-100, -165); ctx.lineTo(-100, 165); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(+30, -165);  ctx.lineTo(+30, 165);  ctx.stroke();
    // Starboard ribs
    for (let x = 185; x < 425; x += 60) {
      ctx.beginPath(); ctx.moveTo(x, -90); ctx.lineTo(x, 95); ctx.stroke();
    }
    // Vault ribs + cross-brace
    ctx.globalAlpha = 0.18;
    for (const x of [540, 660, 775]) {
      ctx.beginPath(); ctx.moveTo(x, -125); ctx.lineTo(x, 125); ctx.stroke();
    }
    ctx.globalAlpha = 0.14;
    ctx.beginPath(); ctx.moveTo(425, -130); ctx.lineTo(855, 130); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(855, -130); ctx.lineTo(425, 130); ctx.stroke();
    ctx.globalAlpha = 1;

    // ── WINDOW STRIPS ─────────────────────────────────────────────────────────
    ctx.strokeStyle = AMBER;
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.1;
    ctx.beginPath(); ctx.moveTo(-840, -50); ctx.lineTo(-285, -50); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-840,  30); ctx.lineTo(-285,  30); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-260, -120); ctx.lineTo(120, -120); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-260,  100); ctx.lineTo(120,  100); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(135, -55); ctx.lineTo(420, -55); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(435, -80); ctx.lineTo(850, -80); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(435,  60); ctx.lineTo(850,  60); ctx.stroke();
    ctx.globalAlpha = 1;

    // ── ANTENNAE ──────────────────────────────────────────────────────────────
    ctx.strokeStyle = DIM_OUTLINE;
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.5;
    for (const [ax, h] of [[-190, 50], [-90, 80], [+25, 44], [+85, 65]]) {
      ctx.beginPath(); ctx.moveTo(ax, -170); ctx.lineTo(ax, -170 - h); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(ax - 12, -170 - h + 6); ctx.lineTo(ax + 12, -170 - h + 6); ctx.stroke();
    }
    // Comms dish on Central Hub
    ctx.globalAlpha = 0.35;
    ctx.beginPath(); ctx.arc(-40, -170, 24, Math.PI, 0); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-40, -194); ctx.lineTo(-40, -170); ctx.stroke();
    ctx.globalAlpha = 1;

    // ── VAULT GUARD POSTS ─────────────────────────────────────────────────────
    ctx.fillStyle = AMBER;
    ctx.globalAlpha = 0.65;
    for (const [gx, gy] of [[425, -130], [855, -130], [425, 130], [855, 130]]) {
      ctx.fillRect(gx - 8, gy - 8, 16, 16);
    }
    ctx.globalAlpha = 1;

    // ── DISTRICT LABELS ───────────────────────────────────────────────────────
    ctx.font = '10px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = AMBER;
    ctx.globalAlpha = 0.35;
    ctx.fillText('MARKET',  -560,  0);
    ctx.fillText('THE PITS', -72,  0);
    ctx.fillText('SHIPYARD', 275,  0);
    ctx.fillText('VAULT',    640,  0);
    ctx.fillText('BAZAAR',  -520, -207);
    ctx.globalAlpha = 1;

    // ── STATION NAME ──────────────────────────────────────────────────────────
    ctx.font = 'bold 16px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.fillStyle = AMBER;
    ctx.globalAlpha = 0.9;
    ctx.fillText('THE COIL', -150, -370);
    ctx.globalAlpha = 1;

    ctx.restore();
  }

  getBounds() {
    return { x: this.x, y: this.y, radius: 1000 };
  }
}

export function createCoilStation(data) {
  return new CoilStation(data.x, data.y, data);
}
