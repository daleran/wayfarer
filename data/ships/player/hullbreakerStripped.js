import { registerContent } from '@data/dataRegistry.js';

const SHIP = {
  id: 'hullbreaker-stripped',
  label: 'Hullbreaker (Stripped)',
  shipClass: 'onyx-tug',
  name: 'Hullbreaker',
  modules: ['onyx-drive-unit', 'null', 'hydrogen-fuel-cell', 'salvage-scanner', 'null'],
  flavorText:
    'An Onyx Class Tug held together by habit and welding flux. Every panel has been ' +
    'opened, every system jury-rigged at least once. No weapons — the hardpoint mount ' +
    'was traded for reactor parts years ago. But the salvage scanner works, and the ' +
    'hull is stubborn enough to take a beating. A Gravewake native\'s ship: ugly, ' +
    'practical, and worth more in parts than it\'ll ever sell for whole.',
};

registerContent('ships', SHIP.id, SHIP);
