// Ashveil Anchorage — neutral repair/trade station (generic hex renderer).
// Data + layout + instantiate(), all in one place.

import { Station, createStation } from '../../station.js';
import { PALE_WIDOW }  from '../../../npcs/characters/paleWidow.js';
import { RUNT_CASSIN } from '../../../npcs/characters/runtCassin.js';
import { SIX_WIRE_POL } from '../../../npcs/characters/sixWirePol.js';

// ── Layout (simple) ─────────────────────────────────────────────────────────

const LAYOUT = {
  type:  'simple',
  theme: 'neutral',
  zones: [
    {
      id:          'repair-bay',
      label:       'Repair Bay',
      description: 'Structural and armor work. Engine overhauls available.',
      services:    ['repair', 'reactor'],
      flavor: [
        'ASHVEIL ANCHORAGE — OPEN PORT',
        '',
        'Eastern terminus of the Gravewake trade lanes.',
        'Built from the hull of a decommissioned colony ship.',
        'Repairs are expensive. Being stranded is worse.',
        '',
        '[ REPAIR BAY ]',
        'Structural and armor work only.',
        'Engine overhauls require advance booking.',
      ],
      requiredStanding: null,
    },
    {
      id:          'trade-post',
      label:       'Trade Post',
      description: 'Outbound cargo accepted. Inbound prices reflect the run.',
      services:    ['trade'],
      flavor: [
        '[ TRADE POST ]',
        '',
        'Outbound cargo accepted. Inbound prices',
        'reflect the difficulty of the run.',
      ],
      requiredStanding: null,
    },
    {
      id:          'bounties',
      label:       'Bounty Board',
      description: 'Posted contracts from Anchorage operators.',
      services:    ['bounties'],
      flavor: [],
      requiredStanding: null,
    },
    {
      id:          'intel',
      label:       'Intel',
      description: 'Station intelligence and local knowledge.',
      services:    ['intel'],
      flavor: [],
      requiredStanding: null,
    },
    {
      id:          'relations',
      label:       'Relations',
      description: 'Faction standings.',
      services:    ['relations'],
      flavor: [],
      requiredStanding: null,
    },
  ],
};

// ── Entity descriptor + instantiate ─────────────────────────────────────────

export const AshveilAnchorage = {
  id: 'ashveil_anchorage',
  name: 'Ashveil Anchorage',
  faction: 'neutral',
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
  bountyBoard: [ PALE_WIDOW, RUNT_CASSIN, SIX_WIRE_POL ],
  bountyContracts: [
    {
      id: 'ashveil_b1', type: 'kill',
      title: 'Silence the Mothership',
      targetName: '"Pale Widow"',
      targetShipType: 'salvage-mothership',
      targetPosition: { x: 14800, y: 6200 },
      reward: 140, expirySeconds: 360,
    },
    {
      id: 'ashveil_b2', type: 'kill',
      title: 'Armed Hauler Ambush',
      targetName: '"Runt" Cassin',
      targetShipType: 'armed-hauler',
      targetPosition: { x: 15500, y: 4200 },
      reward: 80, expirySeconds: 300,
    },
    {
      id: 'ashveil_b3', type: 'kill',
      title: 'Eastern Stalker',
      targetName: '"Six-Wire" Pol',
      targetShipType: 'light-fighter',
      targetPosition: { x: 16200, y: 6500 },
      reward: 55, expirySeconds: 240,
    },
  ],

  instantiate(x, y) {
    return createStation({ ...this, x, y });
  },
};
