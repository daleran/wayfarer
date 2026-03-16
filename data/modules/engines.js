import { registerData, registerContent, ENGINES } from '../dataRegistry.js';
import { EngineModule, MakeshiftThermalModule, VintageMagplasmaSmall, VintageMagplasmaLarge, StandardRocketSmall, StandardRocketLarge, CruisingIonSmall, CruisingIonLarge, MilspecRocketSmall, MilspecRocketLarge } from '@/modules/shipModule.js';

registerData(ENGINES, {
  'makeshift-thermal-s': {
    displayName: 'MAKESHIFT THERMAL (S)',
    description: 'Jury-rigged rocket cobbled from scavenged parts. Barely functional. The engine you replace, not the engine you want.',
    size: 'S',
    thrust: 800,
    fuelEffMult: 2.0,
    fuelDrainRate: 0,
    powerDraw: 1,
    weight: 35,
    breachMultiplier: 2.0,
  },
  'vintage-magplasma-s': {
    displayName: 'VINTAGE MAGPLASMA (S)',
    description: 'Pre-Exile magnetic-plasma engine. Centuries old, irreplaceable. Superb efficiency when it works — demands constant maintenance.',
    size: 'S',
    thrust: 1200,
    fuelEffMult: 0.4,
    fuelDrainRate: 0.012,
    powerDraw: 50,
    weight: 55,
    breachMultiplier: 1.5,
  },
  'vintage-magplasma-l': {
    displayName: 'VINTAGE MAGPLASMA (L)',
    description: 'Heavy pre-Exile plasma drive. Elegant engineering from the Arrival period. Outstanding range — if you can keep it running.',
    size: 'L',
    thrust: 2000,
    fuelEffMult: 0.65,
    fuelDrainRate: 0.024,
    powerDraw: 90,
    weight: 100,
    breachMultiplier: 1.5,
  },
  'standard-rocket-s': {
    displayName: 'STANDARD ROCKET (S)',
    description: 'Mass-manufactured rocket engine. Time-tested design, interchangeable parts. The backbone of civilian fleets.',
    size: 'S',
    thrust: 1800,
    fuelEffMult: 2.0,
    fuelDrainRate: 0,
    powerDraw: 2,
    weight: 70,
    breachMultiplier: 0.7,
  },
  'standard-rocket-l': {
    displayName: 'STANDARD ROCKET (L)',
    description: 'Heavy standard-pattern rocket. Same reliable design, scaled up. Parts available at any settlement forge.',
    size: 'L',
    thrust: 3000,
    fuelEffMult: 3.0,
    fuelDrainRate: 0,
    powerDraw: 3,
    weight: 130,
    breachMultiplier: 0.7,
  },
  'milspec-rocket-s': {
    displayName: 'MILSPEC ROCKET (S)',
    description: 'Prime Machinists Guild military engine. Raw thrust for combat sorties. Burns fuel like it has a fleet tender waiting.',
    size: 'S',
    thrust: 2800,
    fuelEffMult: 6.0,
    fuelDrainRate: 0,
    powerDraw: 3,
    weight: 90,
    breachMultiplier: 1.0,
  },
  'milspec-rocket-l': {
    displayName: 'MILSPEC ROCKET (L)',
    description: 'Heavy milspec propulsion. Peak thrust output in its class. Designed for carrier-based operations, not independent cruising.',
    size: 'L',
    thrust: 4500,
    fuelEffMult: 9.0,
    fuelDrainRate: 0,
    powerDraw: 5,
    weight: 170,
    breachMultiplier: 1.0,
  },
  'cruising-ion-s': {
    displayName: 'CRUISING ION (S)',
    description: 'Refined ion drive optimized for sustained output. Crosses the system on a single fuel load. Terrible in a fight.',
    size: 'S',
    thrust: 350,
    fuelEffMult: 0.02,
    fuelDrainRate: 0.001,
    powerDraw: 100,
    weight: 45,
    breachMultiplier: 0.5,
  },
  'cruising-ion-l': {
    displayName: 'CRUISING ION (L)',
    description: 'Heavy ion thruster for long-haul cargo runs. Maximum range per unit of fuel. Solid-state reliability, zero combat agility.',
    size: 'L',
    thrust: 600,
    fuelEffMult: 0.035,
    fuelDrainRate: 0.002,
    powerDraw: 180,
    weight: 85,
    breachMultiplier: 0.5,
  },
});

// Custom module classes for engines with unique visuals
const ENGINE_CLASSES = {
  'makeshift-thermal-s': MakeshiftThermalModule,
  'vintage-magplasma-s': VintageMagplasmaSmall,
  'vintage-magplasma-l': VintageMagplasmaLarge,
  'standard-rocket-s': StandardRocketSmall,
  'standard-rocket-l': StandardRocketLarge,
  'cruising-ion-s': CruisingIonSmall,
  'cruising-ion-l': CruisingIonLarge,
  'milspec-rocket-s': MilspecRocketSmall,
  'milspec-rocket-l': MilspecRocketLarge,
};

// Self-register into CONTENT.modules
for (const id of Object.keys(ENGINES)) {
  const Cls = ENGINE_CLASSES[id];
  registerContent('modules', id, { category: 'ENGINE', create: Cls ? () => new Cls() : () => new EngineModule(id) });
}
