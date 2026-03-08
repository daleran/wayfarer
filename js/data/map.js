// Gravewake — the only current zone. A ship graveyard in high orbit above Pale.
// Map dimensions: 18000×10000 world units (1 world unit = 1 screen pixel, no zoom).
// Player enters from the west; The Coil is the central hub deep in the zone.

export const MAP = {
  mapSize: { width: 18000, height: 10000 },
  playerStart: { x: 2000, y: 5000 },

  // All stations in this zone
  stations: [
    {
      id: 'the_coil',
      name: 'The Coil',
      x: 13000, y: 4500,
      faction: 'salvage_lords',
      renderer: 'coil',
      services: ['repair', 'trade'],
      commodities: { food: 'medium', ore: 'low', tech: 'medium', exotics: 'surplus' },
      lore: [
        'SALVAGE LORDS TERRITORY — OPEN PORT',
        'Classification: Hostile Neutral',
        '',
        'Assembled from four decommissioned cargo haulers,',
        'welded together over two decades of desperation',
        'and bad decisions. It shouldn\'t float. It does.',
        '',
        '[ MARKET — PORT FREIGHT DECK ]',
        'Black-market goods, fenced salvage, contraband',
        'ROM cartridges from pre-Exile archive runs.',
        'Prices are negotiable. Arguments are not.',
        '',
        '[ THE PITS — CENTRAL HUB ]',
        'Cantina, bunks, and synthetic alcohol that will',
        'leave you three days behind schedule. The Salvage',
        'Lords hold court here when they bother to meet.',
        '',
        '[ SHIPYARD — STARBOARD WING ]',
        'Illicit repairs and unregistered hull work.',
        'The welders ask no questions. Neither should you.',
        '',
        '[ THE VAULT — EAST END ]',
        'Sealed. Always sealed. The Lords haven\'t opened',
        'it while anyone was watching.',
      ],
    },
  ],

  // No small planet icons. Pale is rendered as a massive background element.
  planets: [],

  // Pale — rendered by the Renderer as a background arc, not an entity.
  // Center is far south of the playspace; only its curved limb is visible.
  background: [
    {
      type: 'pale',
      name: 'Pale',
      x: 9000,
      y: 22000,
      radius: 14000,
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
      lootTable: [
        { type: 'scrap', amount: 35 },
        { type: 'fuel',  amount: 20 },
        { type: 'tech',  amount: 3 },
      ],
    },
    {
      name: 'Gutted Pioneer', x: 6500, y: 3000, salvageTime: 4,
      lootTable: [
        { type: 'scrap', amount: 28 },
        { type: 'fuel',  amount: 15 },
        { type: 'ore',   amount: 5 },
      ],
    },
    {
      name: 'Hollow March', x: 9000, y: 4000, salvageTime: 6,
      lootTable: [
        { type: 'scrap',   amount: 50 },
        { type: 'tech',    amount: 4 },
        { type: 'exotics', amount: 2 },
      ],
    },
    {
      name: 'Cold Remnant', x: 11500, y: 3200, salvageTime: 4,
      lootTable: [
        { type: 'scrap', amount: 30 },
        { type: 'fuel',  amount: 25 },
        { type: 'food',  amount: 5 },
      ],
    },
    {
      name: 'Fractured Wake', x: 14500, y: 7000, salvageTime: 5,
      lootTable: [
        { type: 'scrap',   amount: 40 },
        { type: 'tech',    amount: 3 },
        { type: 'exotics', amount: 1 },
      ],
    },
    {
      name: 'Pale Witness', x: 7000, y: 7500, salvageTime: 3,
      lootTable: [
        { type: 'scrap', amount: 22 },
        { type: 'fuel',  amount: 18 },
        { type: 'ore',   amount: 4 },
      ],
    },
  ],

  // Raiders spawn at hidden dens on the west side — opposite The Coil
  raiderSpawns: [
    { x: 3200, y: 2200, count: 3 },
    { x: 2800, y: 7500, count: 3 },
  ],

  asteroidFields: [],
  nebulae: [],
};
