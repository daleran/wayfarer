// Module registry — maps module ID strings to constructors.
// Used by game.js _createModuleById. All module classes live in js/modules/shipModule.js.

import {
  AutocannonModule,
  LanceModuleSmall,
  CannonModule,
  RocketPodModule,
  OnyxDriveUnit,
  ChemRocketSmall,
  ChemRocketLarge,
  MagplasmaTorchSmall,
  MagplasmaTorchLarge,
  IonThruster,
  HydrogenFuelCell,
  SmallFissionReactor,
  LargeFissionReactor,
  LargeFusionReactor,
  SalvagedSensorSuite,
  StandardSensorSuite,
  CombatComputerModule,
  SalvageScannerModule,
  LongRangeScannerModule,
  ExpandedHoldSmall,
  ExpandedHoldLarge,
  AuxTankSmall,
  AuxTankLarge,
  StrippedWeightSmall,
  StrippedWeightLarge,
  ExtraArmorSmall,
  ExtraArmorLarge,
} from './shipModule.js';

export const MODULE_REGISTRY = {
  // Weapons
  'autocannon-module':  AutocannonModule,
  'lance-small':        LanceModuleSmall,
  'cannon-module':      CannonModule,
  'rocket-pod-s':       RocketPodModule,
  'rocket-pod-l':       () => new RocketPodModule('large'),

  // Engines
  'onyx-drive-unit':    OnyxDriveUnit,
  'chem-rocket-s':      ChemRocketSmall,
  'chem-rocket-l':      ChemRocketLarge,
  'magplasma-torch-s':  MagplasmaTorchSmall,
  'magplasma-torch-l':  MagplasmaTorchLarge,
  'ion-thruster':       IonThruster,

  // Power
  'HydrogenFuelCell':   HydrogenFuelCell,
  'SmallFissionReactor': SmallFissionReactor,
  'LargeFissionReactor': LargeFissionReactor,
  'LargeFusionReactor':  LargeFusionReactor,

  // Sensors
  'SalvagedSensorSuite':  SalvagedSensorSuite,
  'StandardSensorSuite':  StandardSensorSuite,
  'CombatComputer':       CombatComputerModule,
  'SalvageScanner':       SalvageScannerModule,
  'LongRangeScanner':     LongRangeScannerModule,

  // Utility
  'expanded-hold-s':      ExpandedHoldSmall,
  'expanded-hold-l':      ExpandedHoldLarge,
  'aux-tank-s':           AuxTankSmall,
  'aux-tank-l':           AuxTankLarge,
  'stripped-weight-s':     StrippedWeightSmall,
  'stripped-weight-l':     StrippedWeightLarge,
  'extra-armor-s':        ExtraArmorSmall,
  'extra-armor-l':        ExtraArmorLarge,
};

export function createModuleById(id) {
  const entry = MODULE_REGISTRY[id];
  if (!entry) throw new Error(`Unknown module: ${id}`);
  // Support both class constructors and factory functions (for parameterised variants)
  return typeof entry === 'function' && entry.prototype && entry.prototype.constructor === entry
    ? new entry()
    : entry();
}
