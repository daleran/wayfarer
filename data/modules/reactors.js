import { registerData, registerContent, REACTORS } from '../dataRegistry.js';
import {
  HydrogenFuelCell, SmallFissionReactor, LargeFissionReactor, LargeFusionReactor,
} from '@/modules/shipModule.js';

registerData(REACTORS, {
  'hydrogen-fuel-cell': {
    displayName: 'H2 FUEL CELL (S)',
    size: 'S',
    powerOutput: 80,
    fuelDrainRate: 0.025,
    degradedOutput: 0,
    weight: 20,
  },
  'fission-reactor-s': {
    displayName: 'FISSION REACTOR (S)',
    size: 'S',
    powerOutput: 160,
    fuelDrainRate: 0,
    overhaulInterval: 10800,
    overhaulCost: 800,
    degradedOutput: 0.6,
    weight: 40,
  },
  'fission-reactor-l': {
    displayName: 'FISSION REACTOR (L)',
    size: 'L',
    powerOutput: 300,
    fuelDrainRate: 0,
    overhaulInterval: 14400,
    overhaulCost: 1500,
    degradedOutput: 0.6,
    weight: 80,
  },
  'fusion-reactor-l': {
    displayName: 'FUSION REACTOR (L)',
    size: 'L',
    powerOutput: 500,
    fuelDrainRate: 0.005,
    degradedOutput: 0,
    weight: 100,
  },
});

// Self-register into CONTENT.modules
registerContent('modules', 'hydrogen-fuel-cell', { category: 'POWER', create: () => new HydrogenFuelCell() });
registerContent('modules', 'fission-reactor-s',  { category: 'POWER', create: () => new SmallFissionReactor() });
registerContent('modules', 'fission-reactor-l',  { category: 'POWER', create: () => new LargeFissionReactor() });
registerContent('modules', 'fusion-reactor-l',   { category: 'POWER', create: () => new LargeFusionReactor() });
