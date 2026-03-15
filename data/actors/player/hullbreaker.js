import { registerData, NPC_SHIPS, registerContent } from '@data/dataRegistry.js';

const ACTOR = {
  hullbreaker: {
    label: 'Hullbreaker',
    shipClass: 'onyx-tug',
    faction: 'player',
    relation: 'player',
    name: 'Hullbreaker',
    modules: ['onyx-drive-unit', 'autocannon-module', 'HydrogenFuelCell', 'SalvagedSensorSuite', 'null'],
    flavorText:
      'A salvage-modified Onyx Class Tug — armor stripped for fuel capacity, ' +
      'hardpoints jury-rigged for whatever can be found. Whoever flew her before ' +
      'did not come back, but the ship did. Strength: long range, durable enough ' +
      'to take a beating, adaptable. Weakness: lighter armor than stock — the ' +
      'weight savings are the only thing keeping this run profitable.',
    character: {
      id: 'player',
      name: 'Pilot',
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
