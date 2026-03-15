import { registerContent } from '@data/dataRegistry.js';

const SHIP = {
  id: 'grave-clan-ambusher',
  label: 'Grave-Clan Ambusher',
  shipClass: 'maverick-courier',
  name: 'Grave-Clan Ambusher',
  modules: ['onyx-drive-unit', 'autocannon-module', 'rocket-pod-s:ht'],
  flavorText:
    'A Maverick Courier fielded by Grave-Clan cells. They pick a spar or debris ' +
    'shadow and wait. When a convoy moves through they commit hard: autocannon ' +
    'for armor, a heat missile to finish it.',
};

registerContent('ships', SHIP.id, SHIP);
