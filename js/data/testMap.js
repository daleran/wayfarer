// Compact Gravewake test map.
// Load with ?test: npm run dev → http://localhost:5173/?test
// Map is 8000×5000 — same proportions as full map, ~44% scale.

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
      y: 2500,
      radius: 540,
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

  raiderSpawns: [
    // Light fighters — fast stalkers that hunt the player's aft
    { x: 1800, y: 2500, count: 2, shipType: 'light-fighter' },
    // Armed hauler — kiter with autocannon + lance
    { x: 2200, y: 2100, count: 1, shipType: 'armed-hauler' },
    // Salvage mothership — holds at range and lobs missiles
    { x: 2800, y: 2700, count: 1, shipType: 'salvage-mothership' },
  ],

  asteroidFields: [],
  nebulae: [],
};

// Test verification steps — shown on-screen in test mode.
export const TEST_STEPS = [
  // Ship
  'HULLBREAKER: confirm blocky tug shape (not hammerhead). Single green engine glow at aft center.',
  'FUEL: HUD fuel bar — Hullbreaker tank is ~104 units. Fuel drains at 50% base rate (move at throttle 5).',
  // Weapon cycling
  'CYCLING: press 2 to cycle primary — HUD shows AUTOCANNON → RAILGUN → FLAK-S → LANCE-S → PLASMA-S → CANNON',
  'CYCLING: press 4 to cycle secondary — HUD shows ROCKET → ROCKET×5 → WIRE-MSL → WIRE×3 → HEAT-MSL → TORPEDO',
  // Kinetic / energy primaries
  'AUTOCANNON (cycle to it): LMB — rapid amber bolts, tracer trail, hits at 1500u',
  'RAILGUN: cycle to it, LMB — 6s pause then brilliant white streak, high damage (use X raider as target)',
  'FLAK-S: cycle to it, LMB on far point — amber burst at click distance; LMB near missiles — intercepts them',
  'CANNON: cycle to it, LMB — slow heavy shell, AoE blast on ship contact (120u radius)',
  'PLASMA-S: cycle to it, LMB at short vs long range — more hull damage close up (falloff visible)',
  // Lance beam
  'LANCE: cycle to it, hold LMB — cyan beam appears toward cursor; brightens over 2s; releases and ramps down',
  // Secondary / missiles
  'ROCKETS (RMB): fire at raider — amber blast 280u; RMB again for ROCKET×5 burst of 5',
  'WIRE MISSILE: cycle to WIRE-MSL (RMB), steer missile with mouse; WIRE×3 fires spread of 3',
  'HEAT MISSILE: cycle to HEAT-MSL (RMB) — missile locks onto nearest raider automatically; 10s self-destruct',
  'TORPEDO: cycle to it (RMB) — face raider, fires along heading; slow amber blob; interceptable',
  // Enemy weapons
  'ENEMY WEAPONS: press X — kiter spawns with Railgun (fast blue-white streak). Press C — interceptor with flak',
  'INTERCEPTION: fire a wire missile, spawn C interceptor nearby — flak may shoot down your missile',
  // AI freeze (weapons/armor testing)
  'AI FREEZE: press V — dev panel shows [AI FROZEN] in magenta. All enemies halt and stop firing. Press V again to unfreeze.',
  // New enemy types (pre-spawned in test map)
  'LIGHT FIGHTERS: two red needle ships patrol east (~1800, 2500). Approach — they should flank to your aft and fire aligned.',
  'ARMED HAULER: wide red boxy ship at (~2200, 2100). Should kite at range with autocannon and lance beam.',
  'SALVAGE MOTHERSHIP: large red frigate at (~2800, 2700). Should hold at 1200u and lob cannon + heat missiles.',
];
