import { registerContent } from '@data/dataRegistry.js';

const SHIP = {
  id: 'swift-exit',
  label: 'Swift Exit',
  shipClass: 'maverick-courier',
  name: 'Swift Exit',
  modules: ['magplasma-torch-s', 'null', 'null'],
  flavorText:
    'A stolen Maverick courier with the serial numbers ground off and the transponder ' +
    'pulled. The previous owner — a settlement foreman — kept it docked and polished. ' +
    'Now it smells like engine grease and fear. No weapons, no cargo, just speed and a ' +
    'head start. The kind of ship you fly when you need to be somewhere else fast.',
};

registerContent('ships', SHIP.id, SHIP);
