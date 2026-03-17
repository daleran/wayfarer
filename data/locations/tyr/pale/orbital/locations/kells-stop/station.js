// Kell's Stop — fuel depot station data + layout.
import { FuelDepotStation } from './renderer.js';
import { registerContent } from '@data/dataRegistry.js';
import { LOCATION_TYPE } from '@data/enums.js';

// ── Layout ─────────────────────────────────────────────────────────────────

const LAYOUT = {
  sections: [
    {
      id:          'dock',
      label:       'Fuel Depot & Repairs',
      description: 'Cheap fuel, rationing enforced. Basic hull work only.',
      services:    ['repair'],
      worldOffset: { x: 90, y: 0 },
      flavor: [
        "KELL'S STOP — OPEN PORT",
        '',
        "A fuel platform bolted to whatever was left of an old survey barge. The two tanks on the starboard side are older than the platform. Nobody knows whose they were. Kell doesn't talk about it.",
        '',
        '[ FUEL DEPOT ]',
        'Cheap fuel. Rationing is enforced. First come, first filled.',
        '',
        '[ FIELD REPAIRS ]',
        "Basic hull work only. Expect to pay. Don't expect it fast.",
      ],
      requiredStanding: null,
    },
    {
      id:          'trade',
      label:       'Trade Post',
      description: 'Surplus rations, alloys, machine parts.',
      services:    ['trade'],
      worldOffset: { x: -65, y: -25 },
      flavor: [
        '[ TRADE POST ]',
        '',
        'Outbound cargo accepted. Prices reflect the difficulty of the run.',
      ],
      requiredStanding: null,
    },
    {
      id:          'bounties',
      label:       'Bounty Board',
      description: 'Contracts posted by local operators.',
      services:    ['bounties'],
      worldOffset: { x: -65, y: 17 },
      flavor: [
        '[ BOUNTY BOARD ]',
        '',
        'A single screen, chipped at the corner. The contracts are real. The targets are not friendly.',
      ],
      requiredStanding: null,
    },
    {
      id:          'intel',
      label:       'Intel',
      description: 'Station history and local intelligence.',
      services:    ['intel'],
      worldOffset: { x: 0, y: -25 },
      flavor: [],
      requiredStanding: null,
    },
    {
      id:          'relations',
      label:       'Relations',
      description: 'Faction standings.',
      services:    ['relations'],
      worldOffset: { x: 0, y: 52 },
      flavor: [],
      requiredStanding: null,
    },
  ],
};

// ── Entity descriptor + instantiate ─────────────────────────────────────────

export const KellsStop = {
  id: 'kells_stop',
  name: "Kell's Stop",
  flavorText: "A fuel platform bolted to whatever was left of an old survey barge. Kell herself has been dead for eleven years. Nobody's updated the sign.",
  faction: 'kells-stop',
  renderer: 'fuel_depot',
  services: ['fuel', 'repair'],
  dockingRadius: 150,
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
  conversations: {
    hub: 'kellHub',
    sections: {
      dock:      'kellDock',
      bounties:  'kellBounties',
      intel:     'kellIntel',
      trade:     'kellTrade',
      relations: 'kellRelations',
    },
  },
  bountyContracts: [
    {
      id: 'kells_b1', type: 'kill',
      title: 'Wanted: Grave-Clan Lurker',
      targetName: '"Ironback" Marel',
      targetCharacterId: 'ironback_marel',
      targetShipType: 'grave-clan-ambusher',
      targetPosition: { x: 4200, y: 4000 },
      reward: 90, expirySeconds: 300,
    },
    {
      id: 'kells_b2', type: 'kill',
      title: 'Clear the Approach',
      targetName: '"Gutshot" Drev',
      targetCharacterId: 'gutshot_drev',
      targetShipType: 'light-fighter',
      targetPosition: { x: 3500, y: 3200 },
      reward: 60, expirySeconds: 240,
    },
  ],

  instantiate(x, y) {
    return new FuelDepotStation(x, y, this);
  },
};

registerContent('locations', 'kells-stop', {
  id: 'kells-stop',
  locationType: LOCATION_TYPE.STATION,
  name: "Kell's Stop",
  flavorText: KellsStop.flavorText,
  entity: KellsStop,
});
