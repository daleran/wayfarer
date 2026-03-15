import { registerData, NPC_SHIPS, registerContent } from '@data/dataRegistry.js';

const ACTOR = {
  'armed-hauler': {
    label: 'Armed Hauler',
    shipClass: 'g100-hauler',
    faction: 'scavenger',
    relation: 'hostile',
    aiBehavior: 'kiter',
    modules: ['onyx-drive-unit', 'autocannon-module', 'lance-small', 'null'],
    flavorText:
      'A G100 hauler with the cargo bays gutted and armor plate welded over ' +
      'everything. What was once a trade vessel became a mobile fire platform.',
    character: {
      id: 'armed-hauler',
      name: 'Scavenger Gunner',
      faction: 'scavenger',
      relation: 'hostile',
      behavior: 'kiter',
      flavorText:
        'A veteran scavenger who graduated from courier raids to a proper gun platform. ' +
        'Patient, methodical, and hard to rattle. Prefers to keep distance and let ' +
        'the lance do the talking. Has survived longer than most — which in the ' +
        'Gravewake means they know when to run.',
    },
  },
};

registerData(NPC_SHIPS, ACTOR);

for (const [id, data] of Object.entries(ACTOR)) {
  registerContent('actors', id, data);
}
