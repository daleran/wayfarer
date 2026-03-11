// Gravewake — the only current zone. A ship graveyard in high orbit above Pale.
// Map dimensions: 18000×10000 world units (1 world unit = 1 screen pixel, no zoom).
// Player enters from the west; The Coil is the central hub deep in the zone.

import { STATION_LORE } from '../stationLore.js';

export const MAP = {
  mapSize: { width: 18000, height: 10000 },
  playerStart: { x: 15000, y: 3000 },

  // All stations in this zone
  stations: [
    {
      id: 'the_coil',
      name: 'The Coil',
      x: 15000, y: 3000,
      faction: 'salvage_lords',
      renderer: 'coil',
      services: ['repair', 'trade'],
      commodities: { weapons_cache: 'surplus', raw_ore: 'medium', hull_plating: 'low', contraband: 'surplus', alloys: 'high', void_crystals: 'low' },
      lore: STATION_LORE.the_coil,
      bountyContracts: [
        {
          id: 'coil_b1', type: 'kill',
          title: 'Rival Clan Hit',
          targetName: '"Hollow" Brekk',
          targetShipType: 'armed-hauler',
          targetPosition: { x: 10800, y: 3000 },
          reward: 100, expirySeconds: 300,
        },
        {
          id: 'coil_b2', type: 'kill',
          title: 'Purgation Contract',
          targetName: '"Crestfall" Orin',
          targetShipType: 'grave-clan-ambusher',
          targetPosition: { x: 10500, y: 5800 },
          reward: 75, expirySeconds: 300,
        },
      ],
    },
    {
      id: 'kells_stop',
      name: "Kell's Stop",
      x: 5500, y: 3800,
      faction: 'neutral',
      renderer: 'fuel_depot',
      services: ['fuel', 'repair'],
      commodities: { reactor_fuel: 'high', alloys: 'medium', machine_parts: 'medium', hull_plating: 'low', ration_packs: 'surplus' },
      lore: STATION_LORE.kells_stop,
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
    },
    {
      id: 'ashveil_anchorage',
      name: 'Ashveil Anchorage',
      x: 16000, y: 5000,
      faction: 'neutral',
      services: ['repair', 'trade'],
      canOverhaulReactor: true,
      commodities: { ration_packs: 'medium', machine_parts: 'medium', electronics: 'medium', medical_supplies: 'medium', data_cores: 'low', nav_charts: 'low', bio_cultures: 'high' },
      lore: STATION_LORE.ashveil_anchorage,
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
    },
  ],

  // No small planet icons. Pale is rendered as a background element.
  planets: [],

  // Pale — rendered by the Renderer as a background sphere icon.
  background: [
    {
      type: 'pale',
      name: 'Pale',
      x: 9000,
      y: 5000,
      radius: 540,
      colorLimb: '#4a7a9a',
      colorAtmo: '#1a3a5a',
    },
  ],

  // Gravewake zone definition (used by Renderer for atmosphere layer)
  zones: [
    { id: 'gravewake', center: { x: 10000, y: 5000 }, radius: 9500 },
  ],

  // Arkship Spines — shattered structural beams from the Exile Fleet.
  // Much larger than ships: 3000–6000 units long, 150–300 wide.
  arkshipSpines: [
    // Western approach corridor
    { x: 4200,  y: 3200, rotation: 0.35,  length: 4500, width: 220 },
    { x: 3500,  y: 6800, rotation: -0.25, length: 3800, width: 190 },
    // Mid-zone (flanking trade path)
    { x: 7800,  y: 2500, rotation: 0.80,  length: 5500, width: 270 },
    { x: 8500,  y: 7200, rotation: -0.60, length: 4800, width: 240 },
    // Deep zone (surrounding The Coil)
    { x: 11200, y: 2000, rotation: 0.15,  length: 6000, width: 300 },
    { x: 15000, y: 6800, rotation: 1.20,  length: 4000, width: 200 },
    { x: 16500, y: 3500, rotation: -0.90, length: 5000, width: 250 },
    { x: 10500, y: 8200, rotation: 2.10,  length: 3500, width: 175 },
  ],

  // Wall of Wrecks — diagonal debris belt creating 2 trade lane chokepoints.
  // Belt runs NW→SE across the mid-zone. Gaps at indices 5–6 and 11–12.
  wallOfWrecks: [
    { x: 5200,  y: 2800, spreadRadius: 700, fragmentCount: 45 },
    { x: 5700,  y: 3250, spreadRadius: 750, fragmentCount: 50 },
    { x: 6200,  y: 3700, spreadRadius: 680, fragmentCount: 42 },
    { x: 6700,  y: 4150, spreadRadius: 720, fragmentCount: 48 },
    { x: 7200,  y: 4600, spreadRadius: 690, fragmentCount: 44 },
    // gap (first trade lane)
    { x: 8200,  y: 5500, spreadRadius: 740, fragmentCount: 47 },
    { x: 8700,  y: 5950, spreadRadius: 710, fragmentCount: 46 },
    { x: 9200,  y: 6400, spreadRadius: 760, fragmentCount: 50 },
    { x: 9700,  y: 6850, spreadRadius: 700, fragmentCount: 44 },
    { x: 10200, y: 7300, spreadRadius: 730, fragmentCount: 48 },
    { x: 10700, y: 7750, spreadRadius: 750, fragmentCount: 46 },
    // gap (second trade lane)
    { x: 11700, y: 8650, spreadRadius: 720, fragmentCount: 45 },
    { x: 12200, y: 9100, spreadRadius: 700, fragmentCount: 42 },
  ],

  derelicts: [
    {
      name: 'Broken Covenant', x: 3800, y: 4200, salvageTime: 5,
      derelictClass: 'frigate',
      lootTableId: 'derelict-frigate',
      lootTable: [
        { type: 'scrap',  amount: 35 },
        { type: 'fuel',   amount: 20 },
        { type: 'moduleId', id: 'SmallFissionReactor', condition: 'faulty' },
        { type: 'ammo',   ammoType: 'autocannon', amount: 20 },
      ],
      loreText: [
        'BROKEN COVENANT — Garrison-class frigate, registry struck.',
        'Concord Remnant designation. Last port: Ashveil, 14 cycles ago.',
        'Drive section intact. Reactor: unsecured.',
      ],
    },
    {
      name: 'Gutted Pioneer', x: 6500, y: 3000, salvageTime: 4,
      derelictClass: 'hauler',
      lootTableId: 'derelict-hauler',
      lootTable: [
        { type: 'scrap', amount: 28 },
        { type: 'fuel',  amount: 15 },
        { type: 'moduleId', id: 'HydrogenFuelCell', condition: 'worn' },
        { type: 'ammo',  ammoType: 'rocket', amount: 3 },
      ],
      loreText: [
        'GUTTED PIONEER — G100-class hauler, cargo hold stripped.',
        'Independent registry. Approached the Wall and did not clear it.',
        'Fuel reserves partially intact. Drive: seized.',
      ],
    },
    {
      name: 'Hollow March', x: 9000, y: 4000, salvageTime: 6,
      derelictClass: 'unknown',
      lootTableId: 'derelict-unknown',
      lootTable: [
        { type: 'scrap',        amount: 50 },
        { type: 'void_crystals', amount: 2 },
        { type: 'moduleId', id: 'LargeFusionReactor', condition: 'damaged' },
      ],
      loreText: [
        'HOLLOW MARCH — hull class unidentified. Pre-Collapse origin suspected.',
        'No registry. No crew manifest. Power signature: anomalous.',
        'Approach with caution. Contents: unknown.',
      ],
    },
    {
      name: 'Cold Remnant', x: 11500, y: 3200, salvageTime: 4,
      derelictClass: 'fighter',
      lootTableId: 'derelict-fighter',
      lootTable: [
        { type: 'scrap',  amount: 30 },
        { type: 'weaponId', id: 'Autocannon' },
        { type: 'ammo',   ammoType: 'autocannon', amount: 30 },
      ],
      loreText: [
        'COLD REMNANT — Maverick-class courier, combat-modified.',
        'Grave Clan markings, third kin. Killed over disputed salvage rights.',
        'Hardpoint still attached. Ammunition cache in starboard locker.',
      ],
    },
    {
      name: 'Fractured Wake', x: 14500, y: 7000, salvageTime: 5,
      derelictClass: 'frigate',
      lootTableId: 'derelict-frigate',
      lootTable: [
        { type: 'scrap',   amount: 40 },
        { type: 'weaponId', id: 'Cannon' },
        { type: 'ammo',    ammoType: 'rocket-large', amount: 2 },
      ],
      loreText: [
        'FRACTURED WAKE — Garrison-class frigate, hull split at midship.',
        'Salvage Lords contract vessel, overloaded on exit run.',
        'Heavy ordnance still aboard. Handle with care.',
      ],
    },
    {
      name: 'Pale Witness', x: 7000, y: 7500, salvageTime: 3,
      derelictClass: 'hauler',
      lootTableId: 'derelict-hauler',
      lootTable: [
        { type: 'scrap', amount: 22 },
        { type: 'fuel',  amount: 18 },
        { type: 'moduleId', id: 'SalvageScanner', condition: 'faulty' },
      ],
      loreText: [
        'PALE WITNESS — G100-class hauler, running dark below Pale.',
        'No distress signal. No survivors recovered.',
        'Scanner array still drawing power from backup cells.',
      ],
    },
  ],

  // Raiders spawn at hidden dens on the west side — opposite The Coil
  raiderSpawns: [
    { x: 3200, y: 2200, count: 3 },
    { x: 2800, y: 7500, count: 3 },
  ],

  // Grave-Clan Ambushers — hidden along trade lanes, pounce on passing convoys
  lurkerSpawns: [
    { x: 4200, y: 4000, count: 2, shipType: 'grave-clan-ambusher' },
    { x: 7500, y: 3600, count: 2, shipType: 'grave-clan-ambusher' },
    { x: 10500, y: 4200, count: 1, shipType: 'grave-clan-ambusher' },
  ],

  tradeConvoys: [
    { id: 'convoy_west_thorngate', routeA: { x: 2200, y: 5000 }, routeB: { x: 5500, y: 3800 }, shipCount: 2, shipType: 'trader-convoy' },
    { id: 'convoy_thorngate_coil', routeA: { x: 5500, y: 3800 }, routeB: { x: 15000, y: 3000 }, shipCount: 2, shipType: 'trader-convoy' },
    { id: 'convoy_coil_ashveil',   routeA: { x: 15000, y: 3000 }, routeB: { x: 16000, y: 5000 }, shipCount: 1, shipType: 'trader-convoy' },
  ],

  militiaPatrols: [
    { id: 'coil_inner_patrol', orbitCenter: { x: 15000, y: 3000 }, orbitRadius: 600,  orbitSpeed: 0.12, count: 2, shipType: 'militia-patrol' },
    { id: 'coil_outer_patrol', orbitCenter: { x: 13500, y: 3500 }, orbitRadius: 1200, orbitSpeed: 0.07, count: 1, shipType: 'militia-patrol' },
  ],

  asteroidFields: [],
  nebulae: [],
};
