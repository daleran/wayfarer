import { registerContent } from '@data/dataRegistry.js';

const SHIP = {
  id: 'grey-veil',
  label: 'Grey Veil',
  shipClass: 'cutter-scout',
  name: 'Grey Veil',
  modules: ['milspec-rocket-s', 'autocannon', 'null', 'fission-reactor-s', 'null'],
  flavorText:
    'A House Casimir patrol scout with its fleet transponder ripped out and the hull ' +
    'repainted in salvage grey. One weapon mount stripped and sold for fuel money during ' +
    'the flight out of the inner system. Still armed, still fast, still unmistakably ' +
    'military — the kind of silhouette that makes dock controllers nervous.',
};

registerContent('ships', SHIP.id, SHIP);
