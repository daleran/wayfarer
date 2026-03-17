// Ashveil Anchorage — neutral repair/trade station data + layout.
import { AshveilStation } from './renderer.js';
import { registerContent } from '@data/dataRegistry.js';
import { LOCATION_TYPE } from '@data/enums.js';

// ── Layout ─────────────────────────────────────────────────────────────────

const LAYOUT = {
  sections: [
    {
      id:          'repair-bay',
      label:       'Repair Bay',
      description: 'Structural and armor work. Engine overhauls available.',
      services:    ['repair', 'reactor'],
      worldOffset: { x: -50, y: 33 },
      flavor: [
        'ASHVEIL ANCHORAGE — OPEN PORT',
        '',
        'Eastern terminus of the Gravewake trade lanes. Built from the hull of a decommissioned colony ship. Repairs are expensive. Being stranded is worse.',
        '',
        '[ REPAIR BAY ]',
        'Structural and armor work only. Engine overhauls require advance booking.',
      ],
      requiredStanding: null,
    },
    {
      id:          'trade-post',
      label:       'Trade Post',
      description: 'Outbound cargo accepted. Inbound prices reflect the run.',
      services:    ['trade'],
      worldOffset: { x: 70, y: 22 },
      flavor: [
        '[ TRADE POST ]',
        '',
        'Outbound cargo accepted. Inbound prices reflect the difficulty of the run.',
      ],
      requiredStanding: null,
    },
    {
      id:          'bounties',
      label:       'Bounty Board',
      description: 'Posted contracts from Anchorage operators.',
      services:    ['bounties'],
      worldOffset: { x: 120, y: -16 },
      flavor: [],
      requiredStanding: null,
    },
    {
      id:          'intel',
      label:       'Intel',
      description: 'Station intelligence and local knowledge.',
      services:    ['intel'],
      worldOffset: { x: -120, y: -10 },
      flavor: [],
      requiredStanding: null,
    },
    {
      id:          'relations',
      label:       'Relations',
      description: 'Faction standings.',
      services:    ['relations'],
      worldOffset: { x: -50, y: -50 },
      flavor: [],
      requiredStanding: null,
    },
  ],
};

// ── Entity descriptor + instantiate ─────────────────────────────────────────

export const AshveilAnchorage = {
  id: 'ashveil_anchorage',
  name: 'Ashveil Anchorage',
  flavorText: 'Neutral ground by tradition, respected by necessity. The nebula keeps most trouble at bay.',
  faction: 'ashveil',
  renderer: null,
  services: ['repair', 'trade'],
  canOverhaulReactor: true,
  dockingRadius: 150,
  commodities: {
    ration_packs: 'medium',
    machine_parts: 'medium',
    electronics: 'medium',
    medical_supplies: 'medium',
    data_cores: 'low',
    nav_charts: 'low',
    bio_cultures: 'high',
  },
  lore: [
    'ASHVEIL ANCHORAGE — OPEN PORT',
    'Classification: Neutral',
    '',
    'Eastern terminus of the Gravewake trade lanes.',
    'Built from the hull of a decommissioned colony ship.',
    'Repairs are expensive. Being stranded is worse.',
    '',
    '[ REPAIR BAY ]',
    'Structural and armor work only.',
    'Engine overhauls require advance booking.',
    '',
    '[ TRADE POST ]',
    'Outbound cargo accepted. Inbound prices',
    'reflect the difficulty of the run.',
  ],
  layout: LAYOUT,
  conversations: {
    hub: 'ashveilHub',
    sections: {
      'repair-bay':  'ashveilDock',
      'trade-post':  'ashveilTrade',
      bounties:      'ashveilBounties',
      intel:         'ashveilIntel',
      relations:     'ashveilRelations',
    },
  },
  bountyContracts: [
    {
      id: 'ashveil_b1', type: 'kill',
      title: 'Silence the Mothership',
      targetName: '"Pale Widow"',
      targetCharacterId: 'pale_widow',
      targetShipType: 'salvage-mothership',
      targetPosition: { x: 14800, y: 6200 },
      reward: 140, expirySeconds: 360,
    },
    {
      id: 'ashveil_b2', type: 'kill',
      title: 'Armed Hauler Ambush',
      targetName: '"Runt" Cassin',
      targetCharacterId: 'runt_cassin',
      targetShipType: 'armed-hauler',
      targetPosition: { x: 15500, y: 4200 },
      reward: 80, expirySeconds: 300,
    },
    {
      id: 'ashveil_b3', type: 'kill',
      title: 'Eastern Stalker',
      targetName: '"Six-Wire" Pol',
      targetCharacterId: 'six_wire_pol',
      targetShipType: 'light-fighter',
      targetPosition: { x: 16200, y: 6500 },
      reward: 55, expirySeconds: 240,
    },
  ],

  instantiate(x, y) {
    return new AshveilStation(x, y, this);
  },
};

registerContent('locations', 'ashveil-anchorage', {
  id: 'ashveil-anchorage',
  locationType: LOCATION_TYPE.STATION,
  name: 'Ashveil Anchorage',
  flavorText: AshveilAnchorage.flavorText,
  entity: AshveilAnchorage,
});
