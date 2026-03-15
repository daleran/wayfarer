import { registerContent } from '@data/dataRegistry.js';

const SHIP = {
  id: 'snatcher-drone',
  label: 'Snatcher Drone',
  shipClass: 'maverick-courier',
  name: 'Snatcher Drone',
  unmanned: true,
  faction: 'concord',
  relation: 'hostile',
  aiBehavior: 'latch',
  entityClass: 'snatcher-drone',
  flavorText:
    'A Concord Remnant autonomous intercept unit. No weapons, no crew, ' +
    'no hesitation. Designed to latch onto a hull and drain it from the outside. ' +
    'Fragile under fire — priority target when latched.',
};

registerContent('ships', SHIP.id, SHIP);
