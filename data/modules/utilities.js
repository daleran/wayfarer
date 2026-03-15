import { registerData, registerContent, UTILITIES } from '../dataRegistry.js';
import {
  ExpandedHoldSmall, ExpandedHoldLarge,
  AuxTankSmall, AuxTankLarge,
  StrippedWeightSmall, StrippedWeightLarge,
  ExtraArmorSmall, ExtraArmorLarge,
  SalvageBayModule, EngineeringBayModule,
} from '@/modules/shipModule.js';

registerData(UTILITIES, {
  'expanded-hold-s': {
    displayName: 'EXPANDED HOLD (S)',
    size: 'S',
    weight: 30,
    cargoBonus: 30,
    fuelBonus: 0,
    armorBonus: -15,
  },
  'expanded-hold-l': {
    displayName: 'EXPANDED HOLD (L)',
    size: 'L',
    weight: 60,
    cargoBonus: 60,
    fuelBonus: 0,
    armorBonus: -25,
  },
  'aux-tank-s': {
    displayName: 'AUX TANK (S)',
    size: 'S',
    weight: 25,
    cargoBonus: 0,
    fuelBonus: 20,
    armorBonus: -10,
  },
  'aux-tank-l': {
    displayName: 'AUX TANK (L)',
    size: 'L',
    weight: 50,
    cargoBonus: 0,
    fuelBonus: 40,
    armorBonus: -20,
  },
  'stripped-weight-s': {
    displayName: 'STRIPPED WEIGHT (S)',
    size: 'S',
    weight: -40,
    cargoBonus: 0,
    fuelBonus: 0,
    armorBonus: -20,
  },
  'stripped-weight-l': {
    displayName: 'STRIPPED WEIGHT (L)',
    size: 'L',
    weight: -80,
    cargoBonus: 0,
    fuelBonus: 0,
    armorBonus: -40,
  },
  'extra-armor-s': {
    displayName: 'EXTRA ARMOR (S)',
    size: 'S',
    weight: 40,
    cargoBonus: 0,
    fuelBonus: 0,
    armorBonus: 30,
  },
  'extra-armor-l': {
    displayName: 'EXTRA ARMOR (L)',
    size: 'L',
    weight: 80,
    cargoBonus: 0,
    fuelBonus: 0,
    armorBonus: 60,
  },
  'salvage-bay': {
    displayName: 'SALVAGE BAY (L)',
    size: 'L',
    weight: 40,
    cargoBonus: 0,
    fuelBonus: 0,
    armorBonus: 0,
  },
  'engineering-bay': {
    displayName: 'ENGINEERING BAY (L)',
    size: 'L',
    weight: 35,
    cargoBonus: 0,
    fuelBonus: 0,
    armorBonus: 0,
  },
});

// Self-register into CONTENT.modules
registerContent('modules', 'expanded-hold-s',  { category: 'UTILITY', create: () => new ExpandedHoldSmall() });
registerContent('modules', 'expanded-hold-l',  { category: 'UTILITY', create: () => new ExpandedHoldLarge() });
registerContent('modules', 'aux-tank-s',       { category: 'UTILITY', create: () => new AuxTankSmall() });
registerContent('modules', 'aux-tank-l',       { category: 'UTILITY', create: () => new AuxTankLarge() });
registerContent('modules', 'stripped-weight-s', { category: 'UTILITY', create: () => new StrippedWeightSmall() });
registerContent('modules', 'stripped-weight-l', { category: 'UTILITY', create: () => new StrippedWeightLarge() });
registerContent('modules', 'extra-armor-s',    { category: 'UTILITY', create: () => new ExtraArmorSmall() });
registerContent('modules', 'extra-armor-l',    { category: 'UTILITY', create: () => new ExtraArmorLarge() });
registerContent('modules', 'salvage-bay',      { category: 'UTILITY', create: () => new SalvageBayModule() });
registerContent('modules', 'engineering-bay',   { category: 'UTILITY', create: () => new EngineeringBayModule() });
