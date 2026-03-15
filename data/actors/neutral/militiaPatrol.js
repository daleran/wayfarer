import { registerData, NPC_SHIPS, registerContent } from '@data/dataRegistry.js';

const ACTOR = {
  'militia-patrol': {
    label: 'Militia Patrol',
    shipClass: 'garrison-frigate',
    faction: 'neutral',
    relation: 'neutral',
    aiBehavior: 'militia',
    modules: ['onyx-drive-unit'],
    flavorText:
      'A settlement-operated Garrison-class Frigate running security on nearby approaches. ' +
      'Not as well-armed as the original spec, but better maintained than most scavenger conversions.',
    character: {
      id: 'militia-patrol',
      name: 'Militia Officer',
      faction: 'neutral',
      relation: 'neutral',
      behavior: 'militia',
      flavorText:
        'A settlement security officer on permanent patrol rotation. Steady, ' +
        'professional, and territorial. They enforce order within their zone ' +
        'and ignore everything outside it. Not your ally, but not your enemy — ' +
        'unless you make them one.',
    },
  },
};

registerData(NPC_SHIPS, ACTOR);

for (const [id, data] of Object.entries(ACTOR)) {
  registerContent('actors', id, data);
}
