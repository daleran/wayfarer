import { IRONBACK_MAREL } from '../../npcs/characters/ironbackMarel.js';
import { GUTSHOT_DREV }   from '../../npcs/characters/gutshotDrev.js';
import { LAYOUT }         from '../../ui/station-layouts/kellsStop.js';

export const KELLS_STOP = {
  id: 'kells_stop',
  name: "Kell's Stop",
  faction: 'neutral',
  renderer: 'fuel_depot',
  services: ['fuel', 'repair'],
  commodities: {
    reactor_fuel: 'high',
    alloys: 'medium',
    machine_parts: 'medium',
    hull_plating: 'low',
    ration_packs: 'surplus',
  },
  lore: [
    "KELL'S STOP — OPEN PORT",
    'Classification: Neutral',
    '',
    'A fuel platform bolted to whatever was left of',
    'an old survey barge. The two tanks on the starboard',
    'side are older than the platform. Nobody knows',
    "whose they were. Kell doesn't talk about it.",
    '',
    '[ FUEL DEPOT ]',
    'Cheap fuel. Rationing is enforced.',
    'First come, first filled.',
    '',
    '[ FIELD REPAIRS ]',
    'Basic hull work only. Expect to pay.',
    "Don't expect it fast.",
  ],
  layout: LAYOUT,
  bountyBoard: [ IRONBACK_MAREL, GUTSHOT_DREV ],
  bountyContracts: [
    {
      id: 'kells_b1', type: 'kill',
      title: 'Wanted: Grave-Clan Lurker',
      targetName: '"Ironback" Marel',
      targetShipType: 'grave-clan-ambusher',
      targetPosition: { x: 4200, y: 4000 },
      reward: 90, expirySeconds: 300,
    },
    {
      id: 'kells_b2', type: 'kill',
      title: 'Clear the Approach',
      targetName: '"Gutshot" Drev',
      targetShipType: 'light-fighter',
      targetPosition: { x: 3500, y: 3200 },
      reward: 60, expirySeconds: 240,
    },
  ],
};
