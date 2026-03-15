import { registerData, NPC_SHIPS, registerContent } from '@data/dataRegistry.js';

const ACTOR = {
  'snatcher-drone': {
    label: 'Snatcher Drone',
    shipClass: 'maverick-courier',
    faction: 'concord',
    relation: 'hostile',
    aiBehavior: 'latch',
    unmanned: true,
    entityClass: 'snatcher-drone',
    flavorText:
      'A Concord Remnant autonomous intercept unit. No weapons, no crew, ' +
      'no hesitation. Designed to latch onto a hull and drain it from the outside. ' +
      'Fragile under fire — priority target when latched.',
  },
};

registerData(NPC_SHIPS, ACTOR);

for (const [id, data] of Object.entries(ACTOR)) {
  registerContent('actors', id, data);
}
