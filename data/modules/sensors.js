import { registerData, registerContent, SENSORS } from '../dataRegistry.js';
import { ShipModule } from '@/modules/shipModule.js';
import { ring, disc, line } from '@/rendering/draw.js';
import { CYAN, AMBER, RED } from '@/rendering/colors.js';

/** @param {ShipModule} mod @param {string} id */
function _initSensor(mod, id) {
  const S = SENSORS[id];
  mod.name             = id;
  mod.displayName      = S.displayName;
  mod.powerDraw        = S.powerDraw;
  mod.weight           = S.weight;
  mod.size             = S.size === 'L' ? 'large' : 'small';
  mod.powerPriority    = 1; // sensors: first to lose power
  mod.minimap_ships    = !!S.minimapShips;
  mod.sensor_range     = S.sensorRange;
  mod.lead_indicators    = !!S.leadIndicators;
  mod.health_pips        = !!S.healthPips;
  mod.salvage_detail     = !!S.salvageDetail;
  mod.trajectory_line    = !!S.trajectoryLine;
  mod.enemy_telemetry    = !!S.enemyTelemetry;
  mod.module_inspection  = !!S.moduleInspection;
}

/** Draw a polygon from point array, fill + stroke */
function _poly(ctx, pts, color, fillAlpha, strokeAlpha, lw = 0.5) {
  ctx.beginPath();
  ctx.moveTo(pts[0].x, pts[0].y);
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.globalAlpha = fillAlpha;
  ctx.fill();
  ctx.strokeStyle = color;
  ctx.globalAlpha = strokeAlpha;
  ctx.lineWidth = lw;
  ctx.stroke();
}

class StandardSensorSuite extends ShipModule {
  constructor() {
    super();
    _initSensor(this, 'standard-sensor-suite');
    this.description = 'Modern array. Detects ships up to 3000 units.';
  }
  drawAtMount(ctx, color, alpha) {
    // 6×5 phased array panel
    _poly(ctx, [
      { x: -3, y: -2.5 }, { x: 3, y: -2.5 }, { x: 3, y: 2.5 }, { x: -3, y: 2.5 },
    ], color, alpha * 0.12, alpha * 0.85);
    // 3×3 element dot grid
    for (const ex of [-1.5, 0, 1.5]) {
      for (const ey of [-1.2, 0, 1.2]) {
        disc(ctx, ex, ey, 0.3, color, alpha * 0.5);
      }
    }
    // Feed line from bottom
    line(ctx, 0, 2.5, 0, 4.2, color, 0.5, alpha * 0.5);
    // Feed point disc accent
    disc(ctx, 0, 4.2, 0.5, CYAN, alpha * 0.7);
    // Center crosshair
    line(ctx, -1, 0, 1, 0, color, 0.4, alpha * 0.35);
    line(ctx, 0, -1, 0, 1, color, 0.4, alpha * 0.35);
  }
}

class CombatComputerModule extends ShipModule {
  constructor() {
    super();
    _initSensor(this, 'combat-computer');
    this.description = 'Targeting assist with lead indicators and integrity readout. Range: 2000.';
  }
  drawAtMount(ctx, color, alpha) {
    // 6×7 targeting computer body
    _poly(ctx, [
      { x: -3, y: -3.5 }, { x: 3, y: -3.5 }, { x: 3, y: 3.5 }, { x: -3, y: 3.5 },
    ], color, alpha * 0.12, alpha * 0.85);
    // Antenna stub top
    line(ctx, 0, -3.5, 0, -5, color, 0.6, alpha * 0.55);
    disc(ctx, 0, -5, 0.3, color, alpha * 0.5);
    // Inner screen rect
    _poly(ctx, [
      { x: -2, y: -2 }, { x: 2, y: -2 }, { x: 2, y: 1.5 }, { x: -2, y: 1.5 },
    ], color, alpha * 0.08, alpha * 0.45);
    // Crosshair inside screen
    line(ctx, -1.5, -0.25, 1.5, -0.25, color, 0.4, alpha * 0.35);
    line(ctx, 0, -1.5, 0, 1, color, 0.4, alpha * 0.35);
    // Red crosshair dot
    disc(ctx, 0, -0.25, 0.4, RED, alpha * 0.7);
    // 2 processing bar lines below screen
    line(ctx, -2, 2, 2, 2, color, 0.4, alpha * 0.35);
    line(ctx, -2, 2.8, 2, 2.8, color, 0.4, alpha * 0.3);
    // 3 heatsink fins right
    for (const fy of [-2, -0.5, 1]) {
      line(ctx, 3, fy, 4.2, fy, color, 0.5, alpha * 0.4);
    }
    // Amber power LED
    disc(ctx, -2.2, 2.8, 0.3, AMBER, alpha * 0.7);
  }
}

class SalvageScannerModule extends ShipModule {
  constructor() {
    super();
    _initSensor(this, 'salvage-scanner');
    this.description = 'Reveals salvage details in derelicts. Range: 2500.';
  }
  drawAtMount(ctx, color, alpha) {
    // Rotating drum scanner — circle r=3
    ring(ctx, 0, 0, 3, color, 0.8, alpha * 0.85);
    disc(ctx, 0, 0, 3, color, alpha * 0.1);
    // Inner drum ring
    ring(ctx, 0, 0, 1.8, color, 0.5, alpha * 0.4);
    // 4 radial scan lines (45° offset from cardinal)
    const r1 = 1.8, r2 = 3;
    for (const a of [Math.PI * 0.25, Math.PI * 0.75, Math.PI * 1.25, Math.PI * 1.75]) {
      const c = Math.cos(a), s = Math.sin(a);
      line(ctx, c * r1, s * r1, c * r2, s * r2, color, 0.5, alpha * 0.4);
      // Radial tip dots
      disc(ctx, c * (r2 + 0.5), s * (r2 + 0.5), 0.25, AMBER, alpha * 0.5);
    }
    // Antenna nub top
    line(ctx, 0, -3, 0, -4.5, color, 0.6, alpha * 0.5);
    disc(ctx, 0, -4.5, 0.3, color, alpha * 0.45);
    // Amber center accent
    disc(ctx, 0, 0, 0.6, AMBER, alpha * 0.7);
  }
}

class LongRangeScannerModule extends ShipModule {
  constructor() {
    super();
    _initSensor(this, 'long-range-scanner');
    this.description = 'Deep-space array. Reveals salvage and module details at extreme range.';
  }
  drawAtMount(ctx, color, alpha) {
    // Parabolic dish array — circle r=6
    ring(ctx, 0, 0, 6, color, 0.8, alpha * 0.85);
    disc(ctx, 0, 0, 6, color, alpha * 0.08);
    // Concentric rings
    ring(ctx, 0, 0, 3, color, 0.5, alpha * 0.35);
    ring(ctx, 0, 0, 1.5, color, 0.5, alpha * 0.3);
    // 4 support struts (cardinal)
    line(ctx, 0, -6, 0, -1.5, color, 0.5, alpha * 0.35);
    line(ctx, 0, 6, 0, 1.5, color, 0.5, alpha * 0.35);
    line(ctx, -6, 0, -1.5, 0, color, 0.5, alpha * 0.35);
    line(ctx, 6, 0, 1.5, 0, color, 0.5, alpha * 0.35);
    // Feed horn disc center
    disc(ctx, 0, 0, 1, CYAN, alpha * 0.7);
    // Faint sweep ring accent
    ring(ctx, 0, 0, 4.5, CYAN, 0.4, alpha * 0.2);
    // 3 rim bolts (top-left, top-right, bottom)
    disc(ctx, -4.2, -4.2, 0.35, color, alpha * 0.5);
    disc(ctx, 4.2, -4.2, 0.35, color, alpha * 0.5);
    disc(ctx, 0, 5.5, 0.35, color, alpha * 0.5);
  }
}

class BattleDirectionCenterModule extends ShipModule {
  constructor() {
    super();
    _initSensor(this, 'battle-direction-center');
    this.description = 'Full-spectrum tactical suite. Lead indicators, telemetry, and module scans.';
  }
  drawAtMount(ctx, color, alpha) {
    // 14×10 AEGIS-style chamfered sensor block
    _poly(ctx, [
      { x: -6, y: -5 }, { x: 6, y: -5 }, { x: 7, y: -4 },
      { x: 7, y: 4 }, { x: 6, y: 5 }, { x: -6, y: 5 },
      { x: -7, y: 4 }, { x: -7, y: -4 },
    ], color, alpha * 0.1, alpha * 0.85);
    // 4×6 array dot grid (upper 2/3)
    for (const dx of [-4.5, -1.5, 1.5, 4.5]) {
      for (const dy of [-3.5, -2, -0.5, 1]) {
        disc(ctx, dx, dy, 0.3, color, alpha * 0.45);
      }
    }
    // Cyan boundary line separating upper array from lower processors
    line(ctx, -6.5, 2, 6.5, 2, CYAN, 0.6, alpha * 0.5);
    // 3 processor blocks (lower 1/3)
    for (const bx of [-4, 0, 4]) {
      _poly(ctx, [
        { x: bx - 1.5, y: 2.5 }, { x: bx + 1.5, y: 2.5 },
        { x: bx + 1.5, y: 4.2 }, { x: bx - 1.5, y: 4.2 },
      ], color, alpha * 0.1, alpha * 0.4);
    }
    // Dual antenna stubs top
    line(ctx, -3, -5, -3, -7, color, 0.6, alpha * 0.55);
    disc(ctx, -3, -7, 0.3, RED, alpha * 0.7);
    line(ctx, 3, -5, 3, -7, color, 0.6, alpha * 0.55);
    disc(ctx, 3, -7, 0.3, RED, alpha * 0.7);
    // Cooling vents (horizontal slots on sides)
    for (const vy of [-2, 0]) {
      line(ctx, -7, vy, -7.8, vy, color, 0.4, alpha * 0.35);
      line(ctx, 7, vy, 7.8, vy, color, 0.4, alpha * 0.35);
    }
    // 4 corner bolts
    disc(ctx, -6.2, -4.2, 0.3, color, alpha * 0.5);
    disc(ctx, 6.2, -4.2, 0.3, color, alpha * 0.5);
    disc(ctx, -6.2, 4.2, 0.3, color, alpha * 0.5);
    disc(ctx, 6.2, 4.2, 0.3, color, alpha * 0.5);
  }
}

class EnforcementScannerModule extends ShipModule {
  constructor() {
    super();
    _initSensor(this, 'enforcement-scanner');
    this.description = 'Inspection-grade scanner. Module readout and integrity pips at medium range.';
  }
  drawAtMount(ctx, color, alpha) {
    // Tapered rect: 4 wide at base → 2 wide at top, 8 tall
    _poly(ctx, [
      { x: -1, y: -4 }, { x: 1, y: -4 },
      { x: 2, y: 4 }, { x: -2, y: 4 },
    ], color, alpha * 0.12, alpha * 0.85);
    // Lens ring at narrow end
    ring(ctx, 0, -3, 1, color, 0.6, alpha * 0.55);
    disc(ctx, 0, -3, 0.5, CYAN, alpha * 0.7);
    // Faint beam line extending from lens
    line(ctx, 0, -4, 0, -6.5, CYAN, 0.4, alpha * 0.25);
    // 2 barrel guide lines
    line(ctx, -1.3, -2, -1.8, 3, color, 0.4, alpha * 0.35);
    line(ctx, 1.3, -2, 1.8, 3, color, 0.4, alpha * 0.35);
    // Power connector stub bottom
    line(ctx, 0, 4, 0, 5.5, color, 0.5, alpha * 0.5);
    disc(ctx, 0, 5.5, 0.35, color, alpha * 0.45);
    // 2 focus bolts
    disc(ctx, -1.2, 1, 0.3, color, alpha * 0.5);
    disc(ctx, 1.2, 1, 0.3, color, alpha * 0.5);
  }
}

registerData(SENSORS, {
  'standard-sensor-suite': {
    displayName: 'STANDARD SENSORS (S)',
    powerDraw: 8,
    weight: 15,
    sensorRange: 3000,
    minimapShips: 1,
    leadIndicators: 0,
    healthPips: 0,
    salvageDetail: 0,
    trajectoryLine: 0,
    enemyTelemetry: 0,
    moduleInspection: 0,
  },
  'combat-computer': {
    displayName: 'COMBAT COMPUTER (S)',
    powerDraw: 15,
    weight: 20,
    sensorRange: 2000,
    minimapShips: 1,
    leadIndicators: 1,
    healthPips: 1,
    salvageDetail: 0,
    trajectoryLine: 0,
    enemyTelemetry: 0,
    moduleInspection: 0,
  },
  'salvage-scanner': {
    displayName: 'SALVAGE SCANNER (S)',
    powerDraw: 12,
    weight: 15,
    sensorRange: 2500,
    minimapShips: 1,
    leadIndicators: 0,
    healthPips: 0,
    salvageDetail: 1,
    trajectoryLine: 0,
    enemyTelemetry: 0,
    moduleInspection: 0,
  },
  'long-range-scanner': {
    displayName: 'LONG-RANGE SENSORS (L)',
    size: 'L',
    powerDraw: 20,
    weight: 25,
    sensorRange: 8000,
    minimapShips: 1,
    leadIndicators: 0,
    healthPips: 0,
    salvageDetail: 1,
    trajectoryLine: 0,
    enemyTelemetry: 0,
    moduleInspection: 1,
  },
  'battle-direction-center': {
    displayName: 'BATTLE DIRECTION CENTER (L)',
    size: 'L',
    powerDraw: 30,
    weight: 45,
    sensorRange: 4500,
    minimapShips: 1,
    leadIndicators: 1,
    healthPips: 1,
    salvageDetail: 0,
    trajectoryLine: 1,
    enemyTelemetry: 1,
    moduleInspection: 1,
  },
  'enforcement-scanner': {
    displayName: 'ENFORCEMENT SCANNER (S)',
    powerDraw: 14,
    weight: 18,
    sensorRange: 3000,
    minimapShips: 1,
    leadIndicators: 0,
    healthPips: 1,
    salvageDetail: 0,
    trajectoryLine: 0,
    enemyTelemetry: 0,
    moduleInspection: 1,
  },
});

// Self-register into CONTENT.modules
registerContent('modules', 'standard-sensor-suite',  { category: 'SENSOR', create: () => new StandardSensorSuite() });
registerContent('modules', 'combat-computer',         { category: 'SENSOR', create: () => new CombatComputerModule() });
registerContent('modules', 'salvage-scanner',          { category: 'SENSOR', create: () => new SalvageScannerModule() });
registerContent('modules', 'long-range-scanner',       { category: 'SENSOR', create: () => new LongRangeScannerModule() });
registerContent('modules', 'battle-direction-center',  { category: 'SENSOR', create: () => new BattleDirectionCenterModule() });
registerContent('modules', 'enforcement-scanner',      { category: 'SENSOR', create: () => new EnforcementScannerModule() });
