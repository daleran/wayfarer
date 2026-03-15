import { registerContent } from '@data/dataRegistry.js';

const SHIP = {
  id: 'crash-dummy',
  label: 'Crash Dummy',
  shipClass: 'onyx-tug',
  name: 'Crash Dummy',
  modules: ['standard-rocket-s', 'autocannon', 'hydrogen-fuel-cell', 'null', 'null'],
  flavorText:
    'Editor test vehicle. Stats mirror the Hullbreaker — armor stripped ' +
    'for fuel capacity, hardpoints jury-rigged. Expendable.',
};

registerContent('ships', SHIP.id, SHIP);
