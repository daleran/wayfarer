import { registerContent } from '@data/dataRegistry.js';

const SHIP = {
  id: 'hullbreaker',
  label: 'Hullbreaker',
  shipClass: 'onyx-tug',
  name: 'Hullbreaker',
  modules: ['onyx-drive-unit', 'autocannon-module', 'HydrogenFuelCell', 'SalvagedSensorSuite', 'null'],
  flavorText:
    'A salvage-modified Onyx Class Tug — armor stripped for fuel capacity, ' +
    'hardpoints jury-rigged for whatever can be found. Whoever flew her before ' +
    'did not come back, but the ship did. Strength: long range, durable enough ' +
    'to take a beating, adaptable. Weakness: lighter armor than stock — the ' +
    'weight savings are the only thing keeping this run profitable.',
};

registerContent('ships', SHIP.id, SHIP);
