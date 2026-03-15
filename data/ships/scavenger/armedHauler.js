import { registerContent } from '@data/dataRegistry.js';

const SHIP = {
  id: 'armed-hauler',
  label: 'Armed Hauler',
  shipClass: 'g100-hauler',
  name: 'Armed Hauler',
  modules: ['onyx-drive-unit', 'autocannon', 'lance-st', 'null'],
  flavorText:
    'A G100 hauler with the cargo bays gutted and armor plate welded over ' +
    'everything. What was once a trade vessel became a mobile fire platform.',
};

registerContent('ships', SHIP.id, SHIP);
