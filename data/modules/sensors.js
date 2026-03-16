import { registerData, registerContent, SENSORS } from '../dataRegistry.js';
import { ShipModule } from '@/modules/shipModule.js';
import { ring, disc, line } from '@/rendering/draw.js';

const SENSOR_DISH = 3;
const SENSOR_LINE = 4;

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

/** Shared sensor rendering — dish + antenna + tip dot */
function _drawSensorIcon(ctx, color, alpha) {
  ring(ctx, 0, 1, SENSOR_DISH, color, 0.8, alpha);
  line(ctx, 0, 1 - SENSOR_DISH, 0, 1 - SENSOR_DISH - SENSOR_LINE, color, 0.8, alpha);
  disc(ctx, 0, 1 - SENSOR_DISH - SENSOR_LINE, 1, color, alpha * 0.6);
}

class StandardSensorSuite extends ShipModule {
  constructor() {
    super();
    _initSensor(this, 'standard-sensor-suite');
    this.description = 'Modern array. Detects ships up to 3000 units.';
  }
  drawAtMount(ctx, color, alpha) { _drawSensorIcon(ctx, color, alpha); }
}

class CombatComputerModule extends ShipModule {
  constructor() {
    super();
    _initSensor(this, 'combat-computer');
    this.description = 'Targeting assist with lead indicators and integrity readout. Range: 2000.';
  }
  drawAtMount(ctx, color, alpha) { _drawSensorIcon(ctx, color, alpha); }
}

class SalvageScannerModule extends ShipModule {
  constructor() {
    super();
    _initSensor(this, 'salvage-scanner');
    this.description = 'Reveals salvage details in derelicts. Range: 2500.';
  }
  drawAtMount(ctx, color, alpha) { _drawSensorIcon(ctx, color, alpha); }
}

class LongRangeScannerModule extends ShipModule {
  constructor() {
    super();
    _initSensor(this, 'long-range-scanner');
    this.description = 'Deep-space array. Reveals salvage and module details at extreme range.';
  }
  drawAtMount(ctx, color, alpha) { _drawSensorIcon(ctx, color, alpha); }
}

class BattleDirectionCenterModule extends ShipModule {
  constructor() {
    super();
    _initSensor(this, 'battle-direction-center');
    this.description = 'Full-spectrum tactical suite. Lead indicators, telemetry, and module scans.';
  }
  drawAtMount(ctx, color, alpha) { _drawSensorIcon(ctx, color, alpha); }
}

class EnforcementScannerModule extends ShipModule {
  constructor() {
    super();
    _initSensor(this, 'enforcement-scanner');
    this.description = 'Inspection-grade scanner. Module readout and integrity pips at medium range.';
  }
  drawAtMount(ctx, color, alpha) { _drawSensorIcon(ctx, color, alpha); }
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
