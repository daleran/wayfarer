import { registerData, NPC_SHIPS, registerContent } from '@data/dataRegistry.js';

const ACTOR = {
  'crash-dummy': {
    label: 'Crash Dummy',
    shipClass: 'onyx-tug',
    faction: 'player',
    relation: 'player',
    name: 'Crash Dummy',
    modules: ['onyx-drive-unit', 'autocannon-module', 'HydrogenFuelCell', 'SalvagedSensorSuite', 'null'],
    flavorText:
      'Editor test vehicle. Stats mirror the Hullbreaker — armor stripped ' +
      'for fuel capacity, hardpoints jury-rigged. Expendable.',
    character: {
      id: 'crash-dummy',
      name: 'Test Pilot',
      faction: 'player',
      relation: 'player',
      behavior: 'player',
    },
  },
};

registerData(NPC_SHIPS, ACTOR);

for (const [id, data] of Object.entries(ACTOR)) {
  registerContent('actors', id, data);
}
