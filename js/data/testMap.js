// Compact Gravewake test map.
// Load with ?test: npm run dev → http://localhost:5173/?test
// Map is 8000×5000 — same proportions as full map, ~44% scale.
// The Coil structure is FULL SIZE (3750×1800) — it dominates the eastern half.

export const TEST_MAP = {
  mapSize: { width: 8000, height: 5000 },
  playerStart: { x: 600, y: 2500 },

  stations: [
    {
      id: 'the_coil',
      name: 'The Coil',
      x: 5000, y: 1800,
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

  planets: [],

  background: [
    {
      type: 'pale',
      name: 'Pale',
      x: 4000,
      y: 13000,
      radius: 9000,
      colorLimb: '#4a7a9a',
      colorAtmo: '#1a3a5a',
    },
  ],

  zones: [
    { id: 'gravewake', center: { x: 4500, y: 2500 }, radius: 4500 },
  ],

  arkshipSpines: [
    // Flanking the approach to The Coil
    { x: 2000, y: 1400, rotation: 0.40, length: 2200, width: 140 },
    { x: 1800, y: 3400, rotation: -0.30, length: 1900, width: 110 },
    // Deep zone spines near The Coil
    { x: 3800, y: 900, rotation: 0.70, length: 2800, width: 160 },
    { x: 6800, y: 3500, rotation: 1.20, length: 1800, width: 100 },
  ],

  // Partial Wall of Wrecks — diagonal belt with one gap (trade lane)
  wallOfWrecks: [
    { x: 2400, y: 1300, spreadRadius: 350, fragmentCount: 28 },
    { x: 2800, y: 1700, spreadRadius: 380, fragmentCount: 32 },
    { x: 3200, y: 2100, spreadRadius: 360, fragmentCount: 30 },
    // gap (trade lane)
    { x: 3900, y: 2800, spreadRadius: 370, fragmentCount: 30 },
    { x: 4300, y: 3200, spreadRadius: 350, fragmentCount: 28 },
    { x: 4700, y: 3600, spreadRadius: 380, fragmentCount: 32 },
  ],

  derelicts: [
    {
      name: 'Wrecked Hauler', x: 1200, y: 2200, salvageTime: 3,
      lootTable: [
        { type: 'scrap', amount: 20 },
        { type: 'fuel', amount: 12 },
        { type: 'ore', amount: 3 },
      ],
    },
    {
      name: 'Hollow March', x: 2800, y: 2800, salvageTime: 5,
      lootTable: [
        { type: 'scrap', amount: 40 },
        { type: 'tech', amount: 3 },
        { type: 'exotics', amount: 2 },
      ],
    },
    {
      name: 'Cold Remnant', x: 4200, y: 1000, salvageTime: 4,
      lootTable: [
        { type: 'scrap', amount: 28 },
        { type: 'fuel', amount: 18 },
      ],
    },
  ],

  // Raiders at a den in the south — opposite The Coil in the north
  raiderSpawns: [
    { x: 900,  y: 4000, count: 2, behaviorType: 'kiter' },
    { x: 2000, y: 4200, count: 2, behaviorType: 'interceptor' },
  ],

  asteroidFields: [],
  nebulae: [],
};

// Test verification steps — shown on-screen in test mode.
export const TEST_STEPS = [
  // Gravewake world
  'Pale: fly south — the curved limb of the planet looms at the horizon, opaque body with lighter atmosphere above',
  'Arkship Spines: large wireframe beams visible northeast of start — fly along one',
  'Wall of Wrecks: dense debris belt diagonals across mid-map; find the gap (trade lane)',
  'The Coil: fly east to x≈5000 — station ~1 screen wide; districts visible (MARKET/PITS/SHIPYARD/VAULT)',
  'The Coil: dock → Services (repair/refuel), Trade (exotics:surplus), Intel (lore text)',
  // Raiders
  'Raiders: fly south to y≈4000 — kiter and interceptor enemies patrol the southwest den',
  // Salvage
  'Salvage Wrecked Hauler near start (x≈1200, y≈2200) — E to begin, watch progress bar',
];
