import { PALE_WIDOW }  from '../../npcs/characters/paleWidow.js';
import { RUNT_CASSIN } from '../../npcs/characters/runtCassin.js';
import { SIX_WIRE_POL } from '../../npcs/characters/sixWirePol.js';

export const ASHVEIL_ANCHORAGE = {
  id: 'ashveil_anchorage',
  name: 'Ashveil Anchorage',
  faction: 'neutral',
  renderer: null,
  services: ['repair', 'trade'],
  canOverhaulReactor: true,
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
};
