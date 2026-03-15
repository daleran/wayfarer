// The Coil — data, layout, and instantiate().

import { CoilStation } from './renderer.js';
import { registerContent } from '@data/dataRegistry.js';

// ── Layout ───────────────────────────────────────────────────────────────────

const LAYOUT = {
  zones: [
    {
      id: 'zone-dock',
      label: 'Dock & Salvage',
      services: ['repair', 'trade', 'bounties'],
      worldOffset: { x: -75, y: 0 },
      labelOffset: { x: -50, y: -265 },
      flavor: [
        'Rust-stained gantries. Ships jammed into every berth. Hulks arrive in pieces — they leave the same way, or rebuilt, depending on who\'s paying.',
        '',
        'The fee collector doesn\'t look up. The welders ask no questions. Neither should you.',
      ],
      requiredStanding: null,
    },
    {
      id: 'zone-market',
      label: 'Marketplace',
      services: ['trade', 'intel'],
      worldOffset: { x: -1500, y: 0 },
      labelOffset: { x: -80, y: 220 },
      flavor: [
        'Black-market goods. Fenced salvage. Contraband ROM cartridges from pre-Exile archive runs.',
        '',
        'Prices are negotiable. Arguments are not.',
      ],
      requiredStanding: null,
    },
    {
      id: 'zone-slums',
      label: 'The Slums',
      services: ['intel'],
      worldOffset: { x: -1050, y: 0 },
      labelOffset: { x: -80, y: -250 },
      flavor: [
        'The harbor interior. People without status and ships without berths.',
        '',
        'Word travels here first.',
      ],
      requiredStanding: null,
    },
    {
      id: 'zone-citadel',
      label: 'The Citadel',
      services: ['trade', 'relations'],
      worldOffset: { x: 900, y: 0 },
      labelOffset: { x: -170, y: 200 },
      requiredStanding: 'Trusted',
      requiredFaction: 'scavengers',
      flavor: [
        'Part arena, part court, part bazaar. The Salvage Lords hold court at the back, elevated above the floor where they watch everything that enters.',
        '',
        '[ TRUSTED STANDING REQUIRED ]',
      ],
    },
  ],
};

// ── Entity descriptor + instantiate ─────────────────────────────────────────

export const TheCoil = {
  id: 'the_coil',
  name: 'The Coil',
  flavorText: "A salvage lord's court dressed in wreckage and rust. The only law here is the price of docking.",
  faction: 'salvage_lords',
  renderer: 'coil',
  services: ['repair', 'trade'],
  dockingRadius: 300,
  commodities: {
    weapons_cache: 'surplus',
    raw_ore: 'medium',
    hull_plating: 'low',
    contraband: 'surplus',
    alloys: 'high',
    void_crystals: 'low',
  },
  lore: [
    'SALVAGE LORDS TERRITORY — OPEN PORT',
    'Classification: Hostile Neutral',
    '',
    'Stripped from the Gravewake graveyard and bolted',
    'together over decades of desperation. Two arms,',
    'one massive rear block. It shouldn\'t float.',
    'It does.',
    '',
    '[ MARKET DECK — STARBOARD ARM ]',
    'Black-market goods, fenced salvage, contraband',
    'ROM cartridges from pre-Exile archive runs.',
    'Prices are negotiable. Arguments are not.',
    '',
    '[ SALVAGE YARD & SHIPYARD — PORT ARM ]',
    'Hulks arrive in pieces. They leave the same way,',
    'or rebuilt — depending on who\'s paying.',
    'The welders ask no questions. Neither should you.',
    '',
    '[ THE PIT — REAR BLOCK ]',
    'Part arena, part court, part bazaar. Salvage is',
    'auctioned, disputes are settled by combat or coin,',
    'and the unsanctioned business happens in the dark.',
    'The Salvage Lords hold court at the back,',
    'elevated above the floor where they watch',
    'everything that enters.',
  ],
  layout: LAYOUT,
  bountyContracts: [
    {
      id: 'coil_b1', type: 'kill',
      title: 'Rival Clan Hit',
      targetName: '"Hollow" Brekk',
      targetCharacterId: 'hollow_brekk',
      targetShipType: 'armed-hauler',
      targetPosition: { x: 10800, y: 3000 },
      reward: 100, expirySeconds: 300,
    },
    {
      id: 'coil_b2', type: 'kill',
      title: 'Purgation Contract',
      targetName: '"Crestfall" Orin',
      targetCharacterId: 'crestfall_orin',
      targetShipType: 'grave-clan-ambusher',
      targetPosition: { x: 10500, y: 5800 },
      reward: 75, expirySeconds: 300,
    },
  ],

  instantiate(x, y) {
    return new CoilStation(x, y, this);
  },
};

registerContent('stations', 'the-coil', { entity: TheCoil, label: 'The Coil', flavorText: TheCoil.flavorText });
