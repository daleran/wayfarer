// The Coil — lawless hub station.
// Renderer (CoilStation) + data + layout + instantiate(), all in one place.

import { Station } from '../../../station.js';
import { WHITE, AMBER, RED, GREEN } from '../../../../rendering/colors.js';
import { line, disc, ring, text, Shape } from '../../../../rendering/draw.js';

// ── CoilStation renderer ────────────────────────────────────────────────────

const HULL_FILL = 'rgba(25,12,0,0.92)';
const SHIP_FILL = 'rgba(4,8,12,0.9)';
const WRECK_FILL = 'rgba(8,4,2,0.7)';
const WINDOW_WARM = 'rgba(255,200,100,0.35)';
const WINDOW_COOL = 'rgba(100,200,255,0.25)';
const SPARK_COLOR = '#ffcc44';
const TANK_FILL = 'rgba(255,170,0,0.08)';

// Full layout (centered on 0,0):
//   Market circle:         cx=-1000, r=100
//   Slums:                 -880 to -520  (bolted to truss, tightened)
//   Truss spine:           -880 to +660  (heavy 50px tall backbone)
//   Salvage jetties:       -480 to -200  (thick jetties, cranes, sparks)
//   Dock & Salvage:        cx=-50        (on the truss, truss drawn over it)
//   Central dock:          cx=+180       (smaller chamfered square)
//   Fuel tanks:            cx=+180, y=±110 (huge circles)
//   Citadel:               cx=+600       (large 280×220 block + bridge tower)
//   Engine nozzle:         +740 to +920  (conical exhaust, dead)
const STATION_SCALE = 1.5;
const TOTAL_HALF_W = 1650; // 1100 * 1.5
const TRUSS_LEFT = -880;
const TRUSS_RIGHT = 740;
const TRUSS_HALF_H = 25; // Heavy 50px-tall arkship spine

// ── Market domes — spread-out non-overlapping domes near the rim ─────────
// Each dome protrudes from the market circle rim (r=100 at cx=-1000)
const MARKET_DOMES = [
  { x: -1070, y: -45, r: 26 },
  { x: -1055, y: 50, r: 20 },
  { x: -1005, y: -85, r: 22 },
  { x: -998, y: 82, r: 18 },
  { x: -940, y: -50, r: 24 },
  { x: -935, y: 35, r: 16 },
  { x: -1010, y: 0, r: 14 },
  { x: -960, y: -15, r: 12 },
];

// ── Slum modules — tightly fitted shapes bolted to the spine ──────────────
// Tightened: modules pulled closer to truss, slight overlaps
const SLUM_MODULES = [
  // Large modules bolted directly to the truss
  { x: -820, y: -38, w: 90, h: 55, type: 'chamf', c: 8 },
  { x: -730, y: -36, w: 100, h: 60, type: 'rect' },
  { x: -640, y: -40, w: 80, h: 50, type: 'chamf', c: 6 },
  { x: -820, y: 38, w: 85, h: 50, type: 'rect' },
  { x: -725, y: 40, w: 95, h: 55, type: 'chamf', c: 10 },
  { x: -635, y: 36, w: 75, h: 45, type: 'rect' },
  // Medium modules — second ring (tighter)
  { x: -860, y: -72, w: 55, h: 35, type: 'cigar', r: 40 },
  { x: -780, y: -76, w: 65, h: 30, type: 'stadium' },
  { x: -690, y: -74, w: 60, h: 32, type: 'chamf', c: 5 },
  { x: -610, y: -70, w: 50, h: 28, type: 'rect' },
  { x: -560, y: -56, w: 45, h: 35, type: 'chamf', c: 4 },
  { x: -860, y: 72, w: 60, h: 32, type: 'rect' },
  { x: -775, y: 76, w: 55, h: 30, type: 'cigar', r: 35 },
  { x: -685, y: 74, w: 65, h: 34, type: 'stadium' },
  { x: -605, y: 68, w: 50, h: 30, type: 'chamf', c: 5 },
  { x: -555, y: 55, w: 40, h: 32, type: 'rect' },
  // Small modules — outer fringe (pulled in)
  { x: -850, y: -98, w: 30, h: 20, type: 'rect' },
  { x: -770, y: -100, w: 35, h: 18, type: 'chamf', c: 3 },
  { x: -700, y: -96, w: 28, h: 22, type: 'cigar', r: 20 },
  { x: -630, y: -92, w: 32, h: 18, type: 'rect' },
  { x: -845, y: 96, w: 32, h: 18, type: 'chamf', c: 3 },
  { x: -765, y: 98, w: 30, h: 20, type: 'rect' },
  { x: -695, y: 94, w: 35, h: 18, type: 'stadium' },
  { x: -625, y: 90, w: 28, h: 20, type: 'rect' },
];

// ── Docking arms — many, varied widths/lengths ───────────────────────────
const DOCK_ARMS = [
  { x: -160, side: -1, len: 55, armW: 3, ships: [{ w: 16, h: 24, rot: 0.05 }] },
  { x: -100, side: -1, len: 70, armW: 4, ships: [{ w: 22, h: 32, rot: -0.1 }] },
  { x: -30, side: -1, len: 50, armW: 3, ships: [{ w: 14, h: 20, rot: 0.08 }] },
  { x: 250, side: 1, len: 65, armW: 4, ships: [{ w: 20, h: 28, rot: -0.06 }] },
  { x: 300, side: -1, len: 80, armW: 5, ships: [{ w: 26, h: 36, rot: 0.12 }, { w: 14, h: 18, rot: -0.2, offset: -20 }] },
  { x: 370, side: 1, len: 55, armW: 3, ships: [{ w: 16, h: 22, rot: -0.04 }] },
  { x: 420, side: -1, len: 60, armW: 3, ships: [{ w: 18, h: 26, rot: 0.1 }] },
  { x: 580, side: 1, len: 70, armW: 4, ships: [{ w: 20, h: 30, rot: -0.08 }] },
  { x: 580, side: -1, len: 50, armW: 3, ships: [{ w: 14, h: 20, rot: 0.06 }] },
];

// ── Salvage jetties — thick, with cranes and ships being cut ─────────────
const SALVAGE_JETTIES = [
  {
    x: -450, side: -1, len: 100, jettyW: 18, ships: [
      { w: 40, h: 55, rot: 0.04, gutted: true },
      { w: 20, h: 28, rot: -0.15, offset: 30 },
    ]
  },
  {
    x: -380, side: 1, len: 110, jettyW: 16, ships: [
      { w: 35, h: 50, rot: -0.06, gutted: true },
    ]
  },
  {
    x: -300, side: -1, len: 90, jettyW: 14, ships: [
      { w: 30, h: 42, rot: 0.08, gutted: true },
      { w: 18, h: 24, rot: -0.1, offset: -25 },
    ]
  },
  {
    x: -230, side: 1, len: 95, jettyW: 15, ships: [
      { w: 45, h: 60, rot: -0.03, gutted: true },
    ]
  },
];

// ── Wrecks & derelicts — scattered along the truss and floating loose ────
// state: 'gutted' (full outline + broken interior), 'partial' (missing hull plates),
//        'frame' (skeleton only, very faint)
const WRECKS = [
  // ── Along truss — port side (above, negative y) ──
  // Small fighter hulks
  { x: -780, y: -52, w: 10, h: 16, rot: 0.3, state: 'frame', alpha: 0.2 },
  { x: -650, y: -46, w: 12, h: 18, rot: -0.2, state: 'gutted', alpha: 0.25 },
  { x: -500, y: -40, w: 8, h: 14, rot: 0.5, state: 'partial', alpha: 0.18 },
  { x: -350, y: -48, w: 11, h: 17, rot: -0.4, state: 'frame', alpha: 0.22 },
  { x: -180, y: -42, w: 10, h: 15, rot: 0.15, state: 'gutted', alpha: 0.2 },
  { x: 50, y: -38, w: 9, h: 14, rot: -0.3, state: 'partial', alpha: 0.17 },
  { x: 280, y: -45, w: 12, h: 19, rot: 0.25, state: 'frame', alpha: 0.2 },
  { x: 450, y: -50, w: 10, h: 16, rot: -0.15, state: 'gutted', alpha: 0.18 },
  // Medium hauler frames
  { x: -720, y: -68, w: 22, h: 32, rot: 0.1, state: 'gutted', alpha: 0.22 },
  { x: -550, y: -62, w: 20, h: 28, rot: -0.12, state: 'partial', alpha: 0.2 },
  { x: -200, y: -55, w: 24, h: 34, rot: 0.18, state: 'frame', alpha: 0.18 },
  { x: 100, y: -58, w: 18, h: 26, rot: -0.08, state: 'gutted', alpha: 0.22 },
  { x: 350, y: -65, w: 22, h: 30, rot: 0.14, state: 'partial', alpha: 0.2 },
  // Large frigate sections
  { x: -680, y: -92, w: 35, h: 50, rot: 0.06, state: 'gutted', alpha: 0.2 },
  { x: -400, y: -78, w: 30, h: 45, rot: -0.1, state: 'frame', alpha: 0.16 },
  { x: 200, y: -82, w: 28, h: 40, rot: 0.08, state: 'partial', alpha: 0.18 },

  // ── Along truss — starboard side (below, positive y) ──
  // Small fighters
  { x: -760, y: 50, w: 11, h: 17, rot: -0.35, state: 'partial', alpha: 0.2 },
  { x: -620, y: 44, w: 9, h: 15, rot: 0.22, state: 'frame', alpha: 0.18 },
  { x: -480, y: 48, w: 12, h: 18, rot: -0.15, state: 'gutted', alpha: 0.22 },
  { x: -300, y: 42, w: 10, h: 16, rot: 0.4, state: 'frame', alpha: 0.2 },
  { x: 80, y: 46, w: 11, h: 15, rot: -0.28, state: 'partial', alpha: 0.18 },
  { x: 320, y: 52, w: 10, h: 14, rot: 0.33, state: 'gutted', alpha: 0.2 },
  { x: 480, y: 48, w: 12, h: 18, rot: -0.18, state: 'frame', alpha: 0.22 },
  { x: 600, y: 44, w: 9, h: 13, rot: 0.2, state: 'partial', alpha: 0.17 },
  // Medium haulers
  { x: -690, y: 70, w: 20, h: 30, rot: -0.1, state: 'partial', alpha: 0.2 },
  { x: -520, y: 66, w: 24, h: 32, rot: 0.15, state: 'gutted', alpha: 0.22 },
  { x: -150, y: 56, w: 18, h: 28, rot: -0.08, state: 'frame', alpha: 0.18 },
  { x: 150, y: 62, w: 22, h: 30, rot: 0.12, state: 'partial', alpha: 0.2 },
  { x: 400, y: 68, w: 20, h: 28, rot: -0.14, state: 'gutted', alpha: 0.22 },
  // Large frigates
  { x: -580, y: 88, w: 32, h: 48, rot: -0.05, state: 'frame', alpha: 0.18 },
  { x: 250, y: 82, w: 28, h: 42, rot: 0.08, state: 'gutted', alpha: 0.2 },

  // ── Floating loose — further from station, drifting ──
  { x: -850, y: -160, w: 14, h: 20, rot: 0.7, state: 'frame', alpha: 0.14 },
  { x: -950, y: 140, w: 18, h: 26, rot: -0.5, state: 'partial', alpha: 0.12 },
  { x: -750, y: 170, w: 10, h: 15, rot: 0.4, state: 'frame', alpha: 0.1 },
  { x: -400, y: -155, w: 26, h: 38, rot: 0.35, state: 'gutted', alpha: 0.14 },
  { x: -200, y: 165, w: 20, h: 30, rot: -0.6, state: 'frame', alpha: 0.12 },
  { x: -100, y: -170, w: 12, h: 18, rot: 0.8, state: 'partial', alpha: 0.1 },
  { x: 100, y: -155, w: 15, h: 22, rot: -0.45, state: 'gutted', alpha: 0.12 },
  { x: 350, y: 150, w: 30, h: 44, rot: -0.25, state: 'gutted', alpha: 0.14 },
  { x: 500, y: -150, w: 16, h: 24, rot: 0.45, state: 'frame', alpha: 0.12 },
  { x: 650, y: 155, w: 22, h: 32, rot: -0.35, state: 'partial', alpha: 0.1 },
  // Very large distant wrecks
  { x: -1050, y: -175, w: 40, h: 55, rot: 0.15, state: 'frame', alpha: 0.1 },
  { x: 500, y: 185, w: 35, h: 50, rot: -0.2, state: 'gutted', alpha: 0.1 },
  { x: -300, y: -200, w: 45, h: 60, rot: 0.1, state: 'frame', alpha: 0.08 },
  { x: 700, y: -180, w: 38, h: 52, rot: -0.12, state: 'partial', alpha: 0.09 },
  { x: -600, y: 195, w: 42, h: 58, rot: 0.22, state: 'frame', alpha: 0.08 },
];

// ── Window lights — static warm/cool glow (city alive feel) ──────────────
const WINDOW_LIGHTS = [
  // Market windows
  { x: -1020, y: -20, type: 'dot', r: 2, color: 'warm' },
  { x: -1010, y: 15, type: 'dot', r: 1.5, color: 'cool' },
  { x: -990, y: -35, type: 'bar', w: 8, h: 2, color: 'warm' },
  { x: -975, y: 30, type: 'dot', r: 2, color: 'warm' },
  { x: -1000, y: 40, type: 'bar', w: 6, h: 1.5, color: 'cool' },
  // Slum windows — dense
  { x: -840, y: -42, type: 'bar', w: 12, h: 2, color: 'warm' },
  { x: -810, y: -30, type: 'dot', r: 1.5, color: 'cool' },
  { x: -795, y: -52, type: 'bar', w: 8, h: 1.5, color: 'warm' },
  { x: -750, y: -32, type: 'dot', r: 2, color: 'warm' },
  { x: -740, y: -56, type: 'bar', w: 10, h: 2, color: 'cool' },
  { x: -710, y: -42, type: 'dot', r: 1.5, color: 'warm' },
  { x: -680, y: -30, type: 'bar', w: 14, h: 2, color: 'warm' },
  { x: -660, y: -55, type: 'dot', r: 2, color: 'cool' },
  { x: -630, y: -38, type: 'bar', w: 8, h: 1.5, color: 'warm' },
  { x: -840, y: 42, type: 'dot', r: 2, color: 'warm' },
  { x: -810, y: 32, type: 'bar', w: 10, h: 2, color: 'cool' },
  { x: -760, y: 48, type: 'dot', r: 1.5, color: 'warm' },
  { x: -735, y: 35, type: 'bar', w: 12, h: 2, color: 'warm' },
  { x: -700, y: 44, type: 'dot', r: 2, color: 'cool' },
  { x: -670, y: 30, type: 'bar', w: 8, h: 1.5, color: 'warm' },
  { x: -645, y: 52, type: 'dot', r: 1.5, color: 'warm' },
  { x: -610, y: 40, type: 'bar', w: 10, h: 2, color: 'warm' },
  // Dock & Salvage windows (on truss)
  { x: -95, y: -35, type: 'bar', w: 18, h: 2.5, color: 'warm' },
  { x: -60, y: 25, type: 'dot', r: 2, color: 'cool' },
  { x: -30, y: -28, type: 'bar', w: 14, h: 2, color: 'warm' },
  { x: 5, y: 32, type: 'dot', r: 2.5, color: 'warm' },
  { x: -80, y: 40, type: 'bar', w: 16, h: 2, color: 'cool' },
  { x: -40, y: -42, type: 'dot', r: 2, color: 'warm' },
  { x: 0, y: 38, type: 'bar', w: 12, h: 2, color: 'warm' },
  // Citadel windows (cx=600, wider spread)
  { x: 510, y: -80, type: 'bar', w: 20, h: 3, color: 'warm' },
  { x: 550, y: -55, type: 'dot', r: 2.5, color: 'warm' },
  { x: 590, y: -85, type: 'bar', w: 14, h: 2, color: 'cool' },
  { x: 630, y: -60, type: 'dot', r: 2, color: 'warm' },
  { x: 680, y: -75, type: 'bar', w: 16, h: 2.5, color: 'warm' },
  { x: 510, y: 65, type: 'bar', w: 18, h: 2.5, color: 'warm' },
  { x: 560, y: 80, type: 'dot', r: 2, color: 'warm' },
  { x: 610, y: 55, type: 'bar', w: 12, h: 2, color: 'cool' },
  { x: 650, y: 75, type: 'dot', r: 2.5, color: 'warm' },
  { x: 700, y: 60, type: 'bar', w: 14, h: 2, color: 'warm' },
  // Bridge tower windows
  { x: 635, y: -12, type: 'bar', w: 10, h: 2, color: 'warm' },
  { x: 645, y: 8, type: 'dot', r: 1.5, color: 'cool' },
  { x: 630, y: 18, type: 'bar', w: 8, h: 1.5, color: 'warm' },
  // Truss-mounted habs
  { x: -100, y: -18, type: 'dot', r: 1.5, color: 'warm' },
  { x: 50, y: 18, type: 'bar', w: 6, h: 1.5, color: 'cool' },
  { x: 350, y: -16, type: 'dot', r: 1.5, color: 'warm' },
];

// ── Train route — piecewise segments with dwells ─────────────────────────
const TRAIN_A = -880;    // market end
const TRAIN_B = 180;     // dock
const TRAIN_C = 460;     // citadel left edge
const TRAIN_SPEED = 80;  // px/sec
const TRAIN_DWELL = 3;   // seconds at each stop
const SEG_AB = Math.abs(TRAIN_B - TRAIN_A) / TRAIN_SPEED;
const SEG_BC = Math.abs(TRAIN_C - TRAIN_B) / TRAIN_SPEED;
const TRAIN_CYCLE = SEG_AB + TRAIN_DWELL + SEG_BC + TRAIN_DWELL +
  SEG_BC + TRAIN_DWELL + SEG_AB + TRAIN_DWELL;
const TRAIN_GAP = 28; // gap between lead and trailing car

function trainPosition(t) {
  let p = ((t % TRAIN_CYCLE) + TRAIN_CYCLE) % TRAIN_CYCLE;
  if (p < SEG_AB) return { x: TRAIN_A + (p / SEG_AB) * (TRAIN_B - TRAIN_A), dir: 1 };
  p -= SEG_AB;
  if (p < TRAIN_DWELL) return { x: TRAIN_B, dir: 0 };
  p -= TRAIN_DWELL;
  if (p < SEG_BC) return { x: TRAIN_B + (p / SEG_BC) * (TRAIN_C - TRAIN_B), dir: 1 };
  p -= SEG_BC;
  if (p < TRAIN_DWELL) return { x: TRAIN_C, dir: 0 };
  p -= TRAIN_DWELL;
  if (p < SEG_BC) return { x: TRAIN_C + (p / SEG_BC) * (TRAIN_B - TRAIN_C), dir: -1 };
  p -= SEG_BC;
  if (p < TRAIN_DWELL) return { x: TRAIN_B, dir: 0 };
  p -= TRAIN_DWELL;
  if (p < SEG_AB) return { x: TRAIN_B + (p / SEG_AB) * (TRAIN_A - TRAIN_B), dir: -1 };
  return { x: TRAIN_A, dir: 0 };
}

// Precompute shapes
const DOCK_SALVAGE_SHAPE = Shape.chamferedRect(160, 120, 10);
const CITADEL_SHAPE = Shape.chamferedRect(280, 220, 16);
const BRIDGE_MAIN = Shape.chamferedRect(104, 80, 10);     // central bridge tower (~30% larger)
const BRIDGE_BAR = Shape.chamferedRect(32, 300, 5);       // horizontal bar extending past citadel both sides
const BRIDGE_GREEBLE_A = Shape.chamferedRect(14, 24, 3);  // sensor mast / antenna cluster
const BRIDGE_GREEBLE_B = Shape.chamferedRect(10, 18, 2);  // small equipment pod
const DOCK_SHAPE = Shape.chamferedRect(70, 60, 6);

// Docking zone in local (pre-scale) coords — square below the D&S section
const DOCK_ZONE_X = -50;     // center X (same as dsCx)
const DOCK_ZONE_Y = 58;      // top edge Y — flush with building bottom
const DOCK_ZONE_SIZE = 100;  // 100×100 square

class CoilStation extends Station {
  constructor(x, y, data) {
    super(x, y, data);
    this.dockingRadius = 1500;
  }

  // Override: docking only allowed inside the square zone
  isInDockingZone(wx, wy) {
    // Convert world pos to station-local coords (unscaled)
    const lx = (wx - this.x) / STATION_SCALE;
    const ly = (wy - this.y) / STATION_SCALE;
    const halfS = DOCK_ZONE_SIZE / 2;
    return lx >= DOCK_ZONE_X - halfS && lx <= DOCK_ZONE_X + halfS &&
           ly >= DOCK_ZONE_Y && ly <= DOCK_ZONE_Y + DOCK_ZONE_SIZE;
  }

  update(dt) {
    super.update(dt);
  }

  render(ctx, camera) {
    const screen = camera.worldToScreen(this.x, this.y);
    const cx = screen.x, cy = screen.y;
    const t = this._navPulse;
    const accent = this.accentColor;

    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(camera.zoom * STATION_SCALE, camera.zoom * STATION_SCALE);

    // ════════════════════════════════════════════════════════════════════
    // BELOW-TRUSS LAYER — drawn first so truss sits on top
    // ════════════════════════════════════════════════════════════════════

    // ── 1. DOCK & SALVAGE — on the truss (truss drawn over it) ─────────
    const dsCx = -50;
    DOCK_SALVAGE_SHAPE.at(dsCx, 0).fill(ctx, HULL_FILL);
    DOCK_SALVAGE_SHAPE.at(dsCx, 0).stroke(ctx, WHITE, 1.8, 0.5);
    // Interior grid
    ctx.strokeStyle = WHITE;
    ctx.lineWidth = 0.5;
    ctx.globalAlpha = 0.12;
    for (let ry = -45; ry <= 45; ry += 25) {
      ctx.beginPath();
      ctx.moveTo(dsCx - 70, ry);
      ctx.lineTo(dsCx + 70, ry);
      ctx.stroke();
    }
    for (let rx = dsCx - 55; rx <= dsCx + 55; rx += 25) {
      ctx.beginPath();
      ctx.moveTo(rx, -50);
      ctx.lineTo(rx, 50);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;

    // Dock spars and docking arms from D&S — main player entrance
    const dsArms = [
      { x: dsCx - 50, side: 1, len: 60, armW: 4 },
      { x: dsCx - 20, side: -1, len: 55, armW: 3 },
      { x: dsCx + 15, side: 1, len: 70, armW: 4 },
      { x: dsCx + 45, side: -1, len: 50, armW: 3 },
    ];
    for (const arm of dsArms) {
      const armEnd = arm.side * (60 + arm.len); // extend from D&S edge
      line(ctx, arm.x, arm.side * 60, arm.x, armEnd, WHITE, arm.armW, 0.35);
      line(ctx, arm.x - 8, armEnd, arm.x + 8, armEnd, WHITE, 1.2, 0.25);
      // Nav light at tip
      const armPhase2 = ((t * 2.0 + arm.x * 0.02) % 1 + 1) % 1;
      disc(ctx, arm.x, armEnd, 2, accent, armPhase2 < 0.25 ? 0.8 : 0.1);
    }

    // ── 2. SALVAGE JETTIES — thick jetties with cranes, sparks ─────────
    for (const jetty of SALVAGE_JETTIES) {
      const jTop = jetty.side * TRUSS_HALF_H;
      const jEnd = jetty.side * (TRUSS_HALF_H + jetty.len);

      // Thick jetty pier
      ctx.fillStyle = HULL_FILL;
      const jx = jetty.x - jetty.jettyW / 2;
      const jy = Math.min(jTop, jEnd);
      const jh = Math.abs(jEnd - jTop);
      ctx.fillRect(jx, jy, jetty.jettyW, jh);
      ctx.strokeStyle = WHITE;
      ctx.lineWidth = 1.5;
      ctx.globalAlpha = 0.4;
      ctx.strokeRect(jx, jy, jetty.jettyW, jh);
      ctx.globalAlpha = 1;

      // Crossbars along jetty
      for (let cy2 = Math.min(jTop, jEnd) + 15; cy2 < Math.max(jTop, jEnd); cy2 += 20) {
        line(ctx, jetty.x - jetty.jettyW, cy2, jetty.x + jetty.jettyW, cy2, WHITE, 0.8, 0.2);
      }

      // Docked ships on the jetty
      for (const ship of jetty.ships) {
        const shipOff = ship.offset || 0;
        const shipY = jEnd + jetty.side * (ship.h / 2 + 4);
        ctx.save();
        ctx.translate(jetty.x + shipOff, shipY);
        ctx.rotate(ship.rot);
        ctx.fillStyle = SHIP_FILL;
        ctx.strokeStyle = WHITE;
        ctx.lineWidth = 0.9;
        ctx.fillRect(-ship.w / 2, -ship.h / 2, ship.w, ship.h);
        ctx.globalAlpha = ship.gutted ? 0.3 : 0.45;
        ctx.strokeRect(-ship.w / 2, -ship.h / 2, ship.w, ship.h);
        if (ship.gutted) {
          ctx.globalAlpha = 0.15;
          ctx.beginPath();
          ctx.moveTo(-ship.w * 0.3, -ship.h * 0.3);
          ctx.lineTo(ship.w * 0.2, ship.h * 0.3);
          ctx.moveTo(ship.w * 0.3, -ship.h * 0.2);
          ctx.lineTo(-ship.w * 0.1, ship.h * 0.4);
          ctx.stroke();
        }
        ctx.globalAlpha = ship.gutted ? 0.25 : 0.4;
        ctx.fillRect(-ship.w * 0.3, -ship.h / 2 - 5, ship.w * 0.6, 6);
        ctx.strokeRect(-ship.w * 0.3, -ship.h / 2 - 5, ship.w * 0.6, 6);
        ctx.globalAlpha = 1;
        ctx.restore();

        // Crane arm reaching to gutted ships
        if (ship.gutted) {
          const craneBase = jEnd;
          const craneTip = shipY;
          const craneX = jetty.x + shipOff + ship.w * 0.3;
          line(ctx, jetty.x, craneBase, craneX, craneTip, WHITE, 1.5, 0.35);
          line(ctx, jetty.x - 8, craneBase, craneX, craneTip, WHITE, 0.8, 0.2);
          disc(ctx, craneX, craneTip, 3, WHITE, 0.3);

          // Animated sparks
          const sparkPhase = ((t * 3.5 + jetty.x * 0.02) % 1 + 1) % 1;
          const cutterX = jetty.x + shipOff + Math.sin(t * 2.1 + jetty.x) * ship.w * 0.25;
          const cutterY = shipY + Math.cos(t * 1.7 + jetty.x) * ship.h * 0.2;
          disc(ctx, cutterX, cutterY, 3, SPARK_COLOR, 0.5 + sparkPhase * 0.4);
          for (let si = 0; si < 6; si++) {
            const sa = (si / 6) * Math.PI * 2 + t * 4 + jetty.x;
            const sd = 4 + Math.sin(t * 8 + si * 2.3 + jetty.x) * 8;
            const sx = cutterX + Math.cos(sa) * sd;
            const sy = cutterY + Math.sin(sa) * sd;
            disc(ctx, sx, sy, 1.0, SPARK_COLOR, Math.max(0, 0.7 - sd / 14));
          }
          if (sparkPhase > 0.6) {
            const hotA = t * 6 + jetty.x * 0.5;
            disc(ctx, cutterX + Math.cos(hotA) * 10, cutterY + Math.sin(hotA) * 6, 1.2, RED, 0.5);
          }
        }
      }

      // Jetty nav light
      const jLightPhase = ((t * 2.0 + jetty.x * 0.015) % 1 + 1) % 1;
      disc(ctx, jetty.x, jEnd, 2.5, accent, jLightPhase < 0.3 ? 0.8 : 0.12);
    }

    // ── 3. DOCKING ARMS — along the truss ──────────────────────────────
    for (const arm of DOCK_ARMS) {
      const armEnd = arm.side * (TRUSS_HALF_H + arm.len);
      line(ctx, arm.x, arm.side * TRUSS_HALF_H, arm.x, armEnd, WHITE, arm.armW, 0.3);
      line(ctx, arm.x - 10, armEnd, arm.x + 10, armEnd, WHITE, 1.2, 0.25);

      for (const ship of arm.ships) {
        const shipOff = ship.offset || 0;
        const shipY = armEnd + arm.side * (ship.h / 2 + 3);
        ctx.save();
        ctx.translate(arm.x + shipOff, shipY);
        ctx.rotate(ship.rot);
        ctx.fillStyle = SHIP_FILL;
        ctx.strokeStyle = WHITE;
        ctx.lineWidth = 0.8;
        ctx.fillRect(-ship.w / 2, -ship.h / 2, ship.w, ship.h);
        ctx.globalAlpha = 0.4;
        ctx.strokeRect(-ship.w / 2, -ship.h / 2, ship.w, ship.h);
        ctx.fillRect(-ship.w * 0.3, -ship.h / 2 - 4, ship.w * 0.6, 5);
        ctx.strokeRect(-ship.w * 0.3, -ship.h / 2 - 4, ship.w * 0.6, 5);
        ctx.fillRect(-ship.w * 0.25, ship.h / 2, ship.w * 0.5, 4);
        ctx.strokeRect(-ship.w * 0.25, ship.h / 2, ship.w * 0.5, 4);
        ctx.globalAlpha = 1;
        ctx.restore();
      }

      const armPhase = ((t * 2.0 + arm.x * 0.012) % 1 + 1) % 1;
      disc(ctx, arm.x, arm.side * TRUSS_HALF_H, 2, accent, armPhase < 0.25 ? 0.8 : 0.1);
    }

    // ── 4. WRECKS & DERELICTS — scattered along truss and floating ─────
    for (const w of WRECKS) {
      ctx.save();
      ctx.translate(w.x, w.y);
      ctx.rotate(w.rot);
      const hw = w.w / 2, hh = w.h / 2;

      if (w.state === 'gutted') {
        // Full outline + broken interior
        ctx.fillStyle = WRECK_FILL;
        ctx.fillRect(-hw, -hh, w.w, w.h);
        ctx.strokeStyle = WHITE;
        ctx.lineWidth = 0.8;
        ctx.globalAlpha = w.alpha;
        ctx.strokeRect(-hw, -hh, w.w, w.h);
        // Broken ribs inside
        ctx.globalAlpha = w.alpha * 0.5;
        ctx.beginPath();
        ctx.moveTo(-hw * 0.6, -hh * 0.7);
        ctx.lineTo(hw * 0.4, hh * 0.5);
        ctx.moveTo(hw * 0.5, -hh * 0.4);
        ctx.lineTo(-hw * 0.3, hh * 0.6);
        ctx.moveTo(-hw * 0.8, 0);
        ctx.lineTo(hw * 0.8, 0);
        ctx.stroke();
      } else if (w.state === 'partial') {
        // Missing hull plates — only 2-3 sides drawn
        ctx.fillStyle = WRECK_FILL;
        ctx.globalAlpha = w.alpha * 0.6;
        ctx.fillRect(-hw, -hh, w.w, w.h);
        ctx.strokeStyle = WHITE;
        ctx.lineWidth = 0.7;
        ctx.globalAlpha = w.alpha;
        ctx.beginPath();
        // Top and right sides only (missing bottom-left plate)
        ctx.moveTo(-hw, -hh);
        ctx.lineTo(hw, -hh);
        ctx.lineTo(hw, hh);
        ctx.stroke();
        // Exposed ribs
        ctx.globalAlpha = w.alpha * 0.4;
        ctx.beginPath();
        for (let ry = -hh + hh * 0.4; ry < hh; ry += hh * 0.5) {
          ctx.moveTo(-hw * 0.7, ry);
          ctx.lineTo(hw * 0.7, ry);
        }
        ctx.stroke();
      } else {
        // 'frame' — skeleton only, faint dashed outline
        ctx.strokeStyle = WHITE;
        ctx.lineWidth = 0.5;
        ctx.globalAlpha = w.alpha * 0.6;
        // Faint perimeter
        ctx.setLineDash([3, 4]);
        ctx.strokeRect(-hw, -hh, w.w, w.h);
        ctx.setLineDash([]);
        // Skeleton ribs — the only solid lines
        ctx.globalAlpha = w.alpha;
        ctx.lineWidth = 0.6;
        ctx.beginPath();
        ctx.moveTo(0, -hh);
        ctx.lineTo(0, hh);
        ctx.moveTo(-hw, 0);
        ctx.lineTo(hw, 0);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
      ctx.restore();
    }

    // ════════════════════════════════════════════════════════════════════
    // TRUSS LAYER
    // ════════════════════════════════════════════════════════════════════

    // ── 5. TRUSS SPINE — heavy arkship backbone ────────────────────────
    ctx.fillStyle = HULL_FILL;
    ctx.fillRect(TRUSS_LEFT, -TRUSS_HALF_H, TRUSS_RIGHT - TRUSS_LEFT, TRUSS_HALF_H * 2);
    ctx.strokeStyle = WHITE;
    ctx.lineWidth = 2.0;
    ctx.globalAlpha = 0.5;
    ctx.strokeRect(TRUSS_LEFT, -TRUSS_HALF_H, TRUSS_RIGHT - TRUSS_LEFT, TRUSS_HALF_H * 2);
    ctx.globalAlpha = 1;

    // Heavy cross-bracing
    ctx.strokeStyle = WHITE;
    ctx.lineWidth = 1.2;
    ctx.globalAlpha = 0.18;
    const braceStep = 35;
    for (let bx = TRUSS_LEFT; bx < TRUSS_RIGHT; bx += braceStep) {
      ctx.beginPath();
      ctx.moveTo(bx, -TRUSS_HALF_H);
      ctx.lineTo(bx + braceStep, TRUSS_HALF_H);
      ctx.moveTo(bx, TRUSS_HALF_H);
      ctx.lineTo(bx + braceStep, -TRUSS_HALF_H);
      ctx.stroke();
    }
    // Center spine line
    ctx.beginPath();
    ctx.moveTo(TRUSS_LEFT, 0);
    ctx.lineTo(TRUSS_RIGHT, 0);
    ctx.lineWidth = 0.8;
    ctx.globalAlpha = 0.15;
    ctx.stroke();
    ctx.globalAlpha = 1;

    // ── 6. ANIMATED TRAIN — two-car shuttle along the truss center ─────
    const train = trainPosition(t);
    const trainY = 0; // center of the truss spine
    for (let car = 0; car < 2; car++) {
      const carX = train.x - car * TRAIN_GAP * (train.dir || 1);
      ctx.save();
      ctx.translate(carX, trainY);
      ctx.fillStyle = 'rgba(60,40,10,0.9)';
      ctx.strokeStyle = WHITE;
      ctx.lineWidth = 0.8;
      const carW = car === 0 ? 18 : 14;
      const carH = 8;
      ctx.fillRect(-carW / 2, -carH / 2, carW, carH);
      ctx.globalAlpha = 0.5;
      ctx.strokeRect(-carW / 2, -carH / 2, carW, carH);
      ctx.globalAlpha = 1;
      // Headlight on lead car
      if (car === 0 && train.dir !== 0) {
        disc(ctx, train.dir * (carW / 2 + 2), 0, 2, accent, 0.7);
        disc(ctx, train.dir * (carW / 2 + 2), 0, 6, accent, 0.08);
      }
      // Coupling between cars
      if (car === 0) {
        const coupleDir = train.dir || 1;
        line(ctx, -coupleDir * (carW / 2), 0, -coupleDir * (carW / 2 + 8), 0, WHITE, 0.6, 0.3);
      }
      ctx.restore();
    }

    // ════════════════════════════════════════════════════════════════════
    // STRUCTURES ON TOP
    // ════════════════════════════════════════════════════════════════════

    // ── 7. COIL MARKET — circular with spread-out domes ────────────────
    const mCx = -1000;
    const mR = 100;
    // Outer ring
    ctx.beginPath();
    ctx.arc(mCx, 0, mR, 0, Math.PI * 2);
    ctx.fillStyle = HULL_FILL;
    ctx.fill();
    ctx.strokeStyle = WHITE;
    ctx.lineWidth = 2.0;
    ctx.globalAlpha = 0.55;
    ctx.stroke();
    ctx.globalAlpha = 1;

    // Spread-out domes near the rim
    for (const d of MARKET_DOMES) {
      ctx.beginPath();
      ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
      ctx.fillStyle = HULL_FILL;
      ctx.fill();
      ctx.strokeStyle = WHITE;
      ctx.lineWidth = 1.0;
      ctx.globalAlpha = 0.3;
      ctx.stroke();
      // Inner ring detail
      ctx.beginPath();
      ctx.arc(d.x, d.y, d.r * 0.5, 0, Math.PI * 2);
      ctx.globalAlpha = 0.12;
      ctx.stroke();
    }
    ctx.globalAlpha = 1;

    // Connector from market to truss
    line(ctx, mCx + mR, 0, TRUSS_LEFT, 0, WHITE, 2.5, 0.4);
    line(ctx, mCx + mR, -12, TRUSS_LEFT, -TRUSS_HALF_H, WHITE, 1.2, 0.25);
    line(ctx, mCx + mR, 12, TRUSS_LEFT, TRUSS_HALF_H, WHITE, 1.2, 0.25);

    // ── 8. SLUMS — tightly packed modules bolted to the spine ──────────
    for (const m of SLUM_MODULES) {
      ctx.save();
      ctx.translate(m.x, m.y);
      if (m.type === 'cigar') {
        Shape.cigar(m.w, m.h, m.r).fill(ctx, HULL_FILL);
        Shape.cigar(m.w, m.h, m.r).stroke(ctx, WHITE, 1.0, 0.4);
      } else if (m.type === 'stadium') {
        Shape.stadium(m.w, m.h).fill(ctx, HULL_FILL);
        Shape.stadium(m.w, m.h).stroke(ctx, WHITE, 1.0, 0.4);
      } else if (m.type === 'chamf') {
        Shape.chamferedRect(m.w, m.h, m.c).fill(ctx, HULL_FILL);
        Shape.chamferedRect(m.w, m.h, m.c).stroke(ctx, WHITE, 1.0, 0.4);
      } else {
        const hw = m.w / 2, hh = m.h / 2;
        ctx.fillStyle = HULL_FILL;
        ctx.fillRect(-hw, -hh, m.w, m.h);
        ctx.strokeStyle = WHITE;
        ctx.lineWidth = 1.0;
        ctx.globalAlpha = 0.4;
        ctx.strokeRect(-hw, -hh, m.w, m.h);
        ctx.globalAlpha = 1;
      }
      ctx.restore();
    }

    // ── 9. CENTRAL DOCKING FACILITY ────────────────────────────────────
    const dockCx = 180;
    DOCK_SHAPE.at(dockCx, 0).fill(ctx, HULL_FILL);
    DOCK_SHAPE.at(dockCx, 0).stroke(ctx, WHITE, 1.4, 0.45);
    ctx.strokeStyle = WHITE;
    ctx.lineWidth = 0.5;
    ctx.globalAlpha = 0.12;
    ctx.beginPath();
    ctx.moveTo(dockCx - 25, 0);
    ctx.lineTo(dockCx + 25, 0);
    ctx.moveTo(dockCx, -20);
    ctx.lineTo(dockCx, 20);
    ctx.stroke();
    ctx.globalAlpha = 1;

    // ── 10. FUEL TANKS — two huge circles ──────────────────────────────
    const tankR = 50;
    for (const tankSide of [-1, 1]) {
      const ty = tankSide * 110;
      // Connector pipe to truss
      ctx.fillStyle = HULL_FILL;
      ctx.fillRect(dockCx - 6, tankSide > 0 ? TRUSS_HALF_H : ty + tankR, 12, Math.abs(ty - tankR * tankSide - TRUSS_HALF_H * tankSide));

      ctx.beginPath();
      ctx.arc(dockCx, ty, tankR, 0, Math.PI * 2);
      ctx.fillStyle = TANK_FILL;
      ctx.fill();
      ctx.strokeStyle = AMBER;
      ctx.lineWidth = 1.6;
      ctx.globalAlpha = 0.4;
      ctx.stroke();
      ctx.globalAlpha = 1;

      ring(ctx, dockCx, ty, tankR * 0.6, AMBER, 0.6, 0.2);
      ctx.strokeStyle = AMBER;
      ctx.lineWidth = 0.5;
      ctx.globalAlpha = 0.15;
      ctx.beginPath();
      ctx.moveTo(dockCx - tankR * 0.5, ty);
      ctx.lineTo(dockCx + tankR * 0.5, ty);
      ctx.moveTo(dockCx, ty - tankR * 0.5);
      ctx.lineTo(dockCx, ty + tankR * 0.5);
      ctx.stroke();
      ctx.globalAlpha = 1;
    }


    // ── 11. CITADEL — large block with Star Destroyer-style bridge ─────
    const citCx = 600;
    const citHalfW = 140; // 280 wide
    const citHalfH = 110; // 220 tall
    // Main block (280×220)
    CITADEL_SHAPE.at(citCx, 0).fill(ctx, HULL_FILL);
    CITADEL_SHAPE.at(citCx, 0).stroke(ctx, WHITE, 1.8, 0.5);
    // Interior ribs
    ctx.strokeStyle = WHITE;
    ctx.lineWidth = 0.5;
    ctx.globalAlpha = 0.12;
    for (let ry = -85; ry <= 85; ry += 28) {
      ctx.beginPath();
      ctx.moveTo(citCx - 120, ry);
      ctx.lineTo(citCx + 120, ry);
      ctx.stroke();
    }
    for (let rx = citCx - 110; rx <= citCx + 110; rx += 28) {
      ctx.beginPath();
      ctx.moveTo(rx, -95);
      ctx.lineTo(rx, 95);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;

    // Bridge — Star Destroyer style: horizontal bar extending past both sides,
    // large central tower block, greebles at the ends
    const bridgeX = citCx + 40; // offset toward the stern (right)
    // Horizontal bar — long and narrow, extends past citadel top and bottom
    BRIDGE_BAR.at(bridgeX, 0).fill(ctx, HULL_FILL);
    BRIDGE_BAR.at(bridgeX, 0).stroke(ctx, WHITE, 1.6, 0.5);
    // Central bridge tower — large imposing block
    BRIDGE_MAIN.at(bridgeX, 0).fill(ctx, HULL_FILL);
    BRIDGE_MAIN.at(bridgeX, 0).stroke(ctx, WHITE, 2.0, 0.6);
    // Bridge interior cross
    ctx.strokeStyle = WHITE;
    ctx.lineWidth = 0.5;
    ctx.globalAlpha = 0.12;
    ctx.beginPath();
    ctx.moveTo(bridgeX - 42, 0);
    ctx.lineTo(bridgeX + 42, 0);
    ctx.moveTo(bridgeX, -30);
    ctx.lineTo(bridgeX, 30);
    ctx.stroke();
    ctx.globalAlpha = 1;
    // Bridge window strip (horizontal band across the tower front)
    ctx.fillStyle = WINDOW_WARM;
    ctx.fillRect(bridgeX - 42, -2, 84, 3);

    // Greebles at bar ends — sensor masts, antenna clusters
    const barExtent = 150; // bar half-height
    // Top greeble cluster
    BRIDGE_GREEBLE_A.at(bridgeX - 4, -barExtent + 12).fill(ctx, HULL_FILL);
    BRIDGE_GREEBLE_A.at(bridgeX - 4, -barExtent + 12).stroke(ctx, WHITE, 0.8, 0.35);
    BRIDGE_GREEBLE_B.at(bridgeX + 8, -barExtent + 6).fill(ctx, HULL_FILL);
    BRIDGE_GREEBLE_B.at(bridgeX + 8, -barExtent + 6).stroke(ctx, WHITE, 0.8, 0.3);
    // Bottom greeble cluster
    BRIDGE_GREEBLE_A.at(bridgeX - 4, barExtent - 12).fill(ctx, HULL_FILL);
    BRIDGE_GREEBLE_A.at(bridgeX - 4, barExtent - 12).stroke(ctx, WHITE, 0.8, 0.35);
    BRIDGE_GREEBLE_B.at(bridgeX + 8, barExtent - 6).fill(ctx, HULL_FILL);
    BRIDGE_GREEBLE_B.at(bridgeX + 8, barExtent - 6).stroke(ctx, WHITE, 0.8, 0.3);
    // Small antenna lines at bar tips
    line(ctx, bridgeX, -barExtent, bridgeX, -barExtent - 12, WHITE, 0.8, 0.3);
    line(ctx, bridgeX, barExtent, bridgeX, barExtent + 12, WHITE, 0.8, 0.3);

    // ── 12. ENGINE NOZZLE — dead conical exhaust ───────────────────────
    const nozzleThroat = citCx + citHalfW; // starts at citadel right edge
    const nozzleMouth = nozzleThroat + 180;
    const mouthHalfH = 100;
    const throatHalfH = 80;

    // Nozzle cone — trapezoid
    ctx.beginPath();
    ctx.moveTo(nozzleThroat, -throatHalfH);
    ctx.lineTo(nozzleMouth, -mouthHalfH);
    ctx.lineTo(nozzleMouth, mouthHalfH);
    ctx.lineTo(nozzleThroat, throatHalfH);
    ctx.closePath();
    ctx.fillStyle = HULL_FILL;
    ctx.fill();
    ctx.strokeStyle = WHITE;
    ctx.lineWidth = 2.0;
    ctx.globalAlpha = 0.45;
    ctx.stroke();
    ctx.globalAlpha = 1;

    // Nozzle interior rings
    for (const ringR of [0.85, 0.6, 0.35]) {
      const ry = mouthHalfH * ringR;
      ctx.beginPath();
      ctx.moveTo(nozzleMouth - 5, -ry);
      ctx.lineTo(nozzleMouth - 5, ry);
      ctx.strokeStyle = WHITE;
      ctx.lineWidth = 1.0;
      ctx.globalAlpha = 0.15;
      ctx.stroke();
    }
    // Horizontal rib lines inside the cone
    ctx.strokeStyle = WHITE;
    ctx.lineWidth = 0.6;
    ctx.globalAlpha = 0.1;
    for (let ry = -mouthHalfH + 20; ry < mouthHalfH; ry += 25) {
      const frac = (ry + mouthHalfH) / (mouthHalfH * 2);
      const yAtStart = -throatHalfH + frac * throatHalfH * 2;
      const yAtEnd = -mouthHalfH + frac * mouthHalfH * 2;
      ctx.beginPath();
      ctx.moveTo(nozzleThroat, yAtStart);
      ctx.lineTo(nozzleMouth, yAtEnd);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;

    // Dead engine — dark interior with faint cold glow
    const deadGlow = ctx.createRadialGradient(nozzleMouth, 0, 10, nozzleMouth, 0, mouthHalfH);
    deadGlow.addColorStop(0, 'rgba(40,30,20,0.3)');
    deadGlow.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = deadGlow;
    ctx.fillRect(nozzleMouth - mouthHalfH, -mouthHalfH, mouthHalfH * 2, mouthHalfH * 2);

    // Nozzle lip
    line(ctx, nozzleMouth, -mouthHalfH, nozzleMouth, mouthHalfH, WHITE, 3.0, 0.35);


    // ── 13. WINDOW LIGHTS — alive city feel ────────────────────────────
    for (const w of WINDOW_LIGHTS) {
      const col = w.color === 'warm' ? WINDOW_WARM : WINDOW_COOL;
      if (w.type === 'dot') {
        disc(ctx, w.x, w.y, w.r, col, 1);
      } else {
        ctx.fillStyle = col;
        ctx.fillRect(w.x - w.w / 2, w.y - w.h / 2, w.w, w.h);
      }
    }

    // ── 14. RUNNING LIGHTS — sequential chase ──────────────────────────
    const runningLights = [
      // Market rim
      ...Array.from({ length: 8 }, (_, i) => {
        const a = (i / 8) * Math.PI * 2;
        return [mCx + Math.cos(a) * mR, Math.sin(a) * mR];
      }),
      // Dock & Salvage corners
      [dsCx - 80, -60], [dsCx + 80, -60],
      [dsCx + 80, 60], [dsCx - 80, 60],
      // Citadel corners (bigger shape)
      [citCx - citHalfW, -citHalfH], [citCx + citHalfW, -citHalfH],
      [citCx + citHalfW, citHalfH], [citCx - citHalfW, citHalfH],
      // Bridge bar tips
      [bridgeX, -150], [bridgeX, 150],
      // Nozzle lip
      [nozzleMouth, -mouthHalfH], [nozzleMouth, 0], [nozzleMouth, mouthHalfH],
      // Truss endpoints
      [TRUSS_LEFT, -TRUSS_HALF_H], [TRUSS_LEFT, TRUSS_HALF_H],
      [TRUSS_RIGHT, -TRUSS_HALF_H], [TRUSS_RIGHT, TRUSS_HALF_H],
    ];
    const litPhase = (t * 2.2) % 1;
    for (let i = 0; i < runningLights.length; i++) {
      const [lx, ly] = runningLights[i];
      const on = ((litPhase + i * 0.06) % 1) < 0.25;
      disc(ctx, lx, ly, 2.2, accent, on ? 0.8 : 0.1);
    }

    // ── DOCKING AREA — square zone with green gradient + blinking lights ──
    this._renderDockingArea(ctx);

    // ── ALL TEXT LABELS — drawn last so they sit on top of everything ────
    text(ctx, 'THE COIL', -100, -280, accent, { size: 56, weight: 'bold', alpha: 0.75 });
    text(ctx, 'SALVAGE YARD', dsCx, -110, accent, { size: 22, weight: 'bold', alpha: 0.6 });
    text(ctx, 'COIL MARKET', mCx, mR + 50, accent, { size: 25, weight: 'bold', alpha: 0.7 });
    text(ctx, 'SLUMS', -720, 160, accent, { size: 25, weight: 'bold', alpha: 0.6 });
    text(ctx, 'CITADEL', citCx, -citHalfH - 40, accent, { size: 25, weight: 'bold', alpha: 0.65 });

    ctx.restore();
  }

  // Square docking zone with green gradient fading outward + red/green blinking lights at top
  _renderDockingArea(ctx) {
    const x = DOCK_ZONE_X;
    const y = DOCK_ZONE_Y;
    const size = DOCK_ZONE_SIZE;
    const halfS = size / 2;
    const t = this._navPulse;

    // Green gradient extending downward from station — light spilling out
    const grad = ctx.createLinearGradient(x, y, x, y + size);
    grad.addColorStop(0, 'rgba(0,255,102,0.22)');
    grad.addColorStop(0.4, 'rgba(0,255,102,0.08)');
    grad.addColorStop(1, 'rgba(0,255,102,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(x - halfS, y, size, size);

    // Landing spars — left and right edges of the docking zone
    const sparLen = size * 0.8;
    const sparTop = y + (size - sparLen) / 2;
    line(ctx, x - halfS, sparTop, x - halfS, sparTop + sparLen, WHITE, 2.5, 0.35);
    line(ctx, x + halfS, sparTop, x + halfS, sparTop + sparLen, WHITE, 2.5, 0.35);
    // Crossbars on spars
    for (let sy = sparTop + 15; sy < sparTop + sparLen; sy += 20) {
      line(ctx, x - halfS - 4, sy, x - halfS + 4, sy, WHITE, 1.0, 0.2);
      line(ctx, x + halfS - 4, sy, x + halfS + 4, sy, WHITE, 1.0, 0.2);
    }

    // Blinking lights at the top edge of the docking square
    const phase = ((t * 1.8) % 2);
    const redOn = phase < 1;
    const greenOn = !redOn;
    const lightY = y + 2;
    const lightSpacing = 24;

    // Port (left) — red
    ctx.beginPath();
    ctx.arc(x - lightSpacing, lightY, 2.5, 0, Math.PI * 2);
    ctx.fillStyle = RED;
    ctx.globalAlpha = redOn ? 0.85 : 0.1;
    ctx.fill();
    if (redOn) {
      ctx.beginPath();
      ctx.arc(x - lightSpacing, lightY, 6, 0, Math.PI * 2);
      ctx.globalAlpha = 0.08;
      ctx.fill();
    }

    // Starboard (right) — green
    ctx.beginPath();
    ctx.arc(x + lightSpacing, lightY, 2.5, 0, Math.PI * 2);
    ctx.fillStyle = GREEN;
    ctx.globalAlpha = greenOn ? 0.85 : 0.1;
    ctx.fill();
    if (greenOn) {
      ctx.beginPath();
      ctx.arc(x + lightSpacing, lightY, 6, 0, Math.PI * 2);
      ctx.globalAlpha = 0.08;
      ctx.fill();
    }

    ctx.globalAlpha = 1;
  }

  getBounds() {
    return { x: this.x, y: this.y, radius: TOTAL_HALF_W };
  }
}

// ── Layout ───────────────────────────────────────────────────────────────────

const LAYOUT = {
  zones: [
    {
      id: 'zone-dock',
      label: 'The Dock',
      description: 'Berths, fuel lines, docking fees. Ships crammed into every slot.',
      services: ['repair'],
      flavor: [
        'Rust-stained gantries.',
        'Ships jammed into every berth.',
        '',
        "The fee collector doesn't look up.",
        '',
        'Hull work and refueling available.',
        'No questions asked.',
      ],
      requiredStanding: null,
    },
    {
      id: 'zone-salvage-yard',
      label: 'Salvage Yard',
      description: 'Hulk trade, salvaged modules, kill contracts.',
      services: ['trade', 'bounties'],
      flavor: [
        'Hulks arrive in pieces.',
        'They leave the same way,',
        'or rebuilt — depending on',
        "who's paying.",
        '',
        'The welders ask no questions.',
        'Neither should you.',
      ],
      requiredStanding: null,
    },
    {
      id: 'zone-market',
      label: 'Central Market',
      description: 'Black-market goods, fenced salvage, archive contraband.',
      services: ['trade', 'intel'],
      flavor: [
        'Black-market goods.',
        'Fenced salvage.',
        'Contraband ROM cartridges',
        'from pre-Exile archive runs.',
        '',
        'Prices are negotiable.',
        'Arguments are not.',
      ],
      requiredStanding: null,
    },
    {
      id: 'zone-palace',
      label: 'The Palace',
      description: 'Salvage Lord court. Elite trade and faction relations.',
      services: ['trade', 'relations'],
      requiredStanding: 'Trusted',
      requiredFaction: 'scavengers',
      flavor: [
        'Part arena, part court,',
        'part bazaar.',
        '',
        'The Salvage Lords hold court',
        'at the back, elevated above',
        'the floor where they watch',
        'everything that enters.',
        '',
        '[ TRUSTED STANDING REQUIRED ]',
      ],
    },
    {
      id: 'zone-slums',
      label: 'The Slums',
      description: 'The informal quarter. Rumors, gossip, and loose intelligence.',
      services: ['intel'],
      flavor: [
        'The harbor interior.',
        'People without status',
        'and ships without berths.',
        '',
        'Word travels here first.',
      ],
      requiredStanding: null,
    },
  ],
};

// ── Entity descriptor + instantiate ─────────────────────────────────────────

export const TheCoil = {
  id: 'the_coil',
  name: 'The Coil',
  flavorText: "A salvage lord's court dressed in wreckage and rust. The only law here is the price of docking.",
  faction: 'salvage_lords',
  renderer: 'coil',
  services: ['repair', 'trade'],
  dockingRadius: 300,
  commodities: {
    weapons_cache: 'surplus',
    raw_ore: 'medium',
    hull_plating: 'low',
    contraband: 'surplus',
    alloys: 'high',
    void_crystals: 'low',
  },
  lore: [
    'SALVAGE LORDS TERRITORY — OPEN PORT',
    'Classification: Hostile Neutral',
    '',
    'Stripped from the Gravewake graveyard and bolted',
    'together over decades of desperation. Two arms,',
    'one massive rear block. It shouldn\'t float.',
    'It does.',
    '',
    '[ MARKET DECK — STARBOARD ARM ]',
    'Black-market goods, fenced salvage, contraband',
    'ROM cartridges from pre-Exile archive runs.',
    'Prices are negotiable. Arguments are not.',
    '',
    '[ SALVAGE YARD & SHIPYARD — PORT ARM ]',
    'Hulks arrive in pieces. They leave the same way,',
    'or rebuilt — depending on who\'s paying.',
    'The welders ask no questions. Neither should you.',
    '',
    '[ THE PIT — REAR BLOCK ]',
    'Part arena, part court, part bazaar. Salvage is',
    'auctioned, disputes are settled by combat or coin,',
    'and the unsanctioned business happens in the dark.',
    'The Salvage Lords hold court at the back,',
    'elevated above the floor where they watch',
    'everything that enters.',
  ],
  layout: LAYOUT,
  bountyContracts: [
    {
      id: 'coil_b1', type: 'kill',
      title: 'Rival Clan Hit',
      targetName: '"Hollow" Brekk',
      targetShipType: 'armed-hauler',
      targetPosition: { x: 10800, y: 3000 },
      reward: 100, expirySeconds: 300,
    },
    {
      id: 'coil_b2', type: 'kill',
      title: 'Purgation Contract',
      targetName: '"Crestfall" Orin',
      targetShipType: 'grave-clan-ambusher',
      targetPosition: { x: 10500, y: 5800 },
      reward: 75, expirySeconds: 300,
    },
  ],

  instantiate(x, y) {
    return new CoilStation(x, y, this);
  },
};
