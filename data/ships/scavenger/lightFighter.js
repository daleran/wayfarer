import { registerContent } from '@data/dataRegistry.js';

const SHIP = {
  id: 'light-fighter',
  label: 'Light Fighter',
  shipClass: 'maverick-courier',
  name: 'Light Fighter',
  modules: ['onyx-drive-unit', 'autocannon-module', 'null'],
  flavorText:
    'A Maverick Courier stripped for aggression — autocannon bolted to the nose, ' +
    'everything non-essential jettisoned. Cheap to field, cheap to replace.',
};

registerContent('ships', SHIP.id, SHIP);
