import { registerData, registerContent, SENSORS } from '../dataRegistry.js';
import {
  StandardSensorSuite, CombatComputerModule, SalvageScannerModule, LongRangeScannerModule,
  BattleDirectionCenterModule, EnforcementScannerModule,
} from '@/modules/shipModule.js';

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
    displayName: 'LONG-RANGE SENSORS (S)',
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
