import { registerContent } from '@data/dataRegistry.js';

const SHIP = {
  id: 'trader-convoy',
  label: 'Trader Convoy',
  shipClass: 'g100-hauler',
  name: 'Trader Convoy',
  modules: ['cruising-ion-s'],
  flavorText:
    'A G100 hauler on a regular trade run — lightly crewed, unarmed or barely ' +
    'armed, carrying whatever the stations need. The backbone of inter-settlement ' +
    'commerce in the Gravewake.',
};

registerContent('ships', SHIP.id, SHIP);
