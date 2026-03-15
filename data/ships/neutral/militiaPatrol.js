import { registerContent } from '@data/dataRegistry.js';

const SHIP = {
  id: 'militia-patrol',
  label: 'Militia Patrol',
  shipClass: 'garrison-frigate',
  name: 'Militia Patrol',
  modules: ['onyx-drive-unit'],
  flavorText:
    'A settlement-operated Garrison-class Frigate running security on nearby approaches. ' +
    'Not as well-armed as the original spec, but better maintained than most scavenger conversions.',
};

registerContent('ships', SHIP.id, SHIP);
