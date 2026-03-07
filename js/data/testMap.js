// Compact test map for playtesting new features.
// Load with ?test in the URL: npm run dev, then visit http://localhost:5173/?test

export const TEST_MAP = {
  mapSize: { width: 3000, height: 3000 },
  playerStart: { x: 1500, y: 1500 },
  startScrap: 30,

  stations: [
    { id: 'keelbreak',  name: 'Keelbreak',         x: 1500, y: 1200, faction: 'neutral',     services: ['repair', 'trade', 'shipyard'], commodities: { food: 'high', ore: 'low', tech: 'medium', exotics: 'none', scrap: 'surplus' }, shipyard: ['gunship', 'hauler'] },
    { id: 'crucible',   name: 'Crucible Station',   x: 800,  y: 2200, faction: 'independent', services: ['repair', 'trade', 'shipyard'], commodities: { food: 'low', ore: 'surplus', tech: 'low', exotics: 'deficit', scrap: 'high' }, shipyard: ['hauler'] },
    { id: 'thornwick',  name: 'Thornwick Archive',  x: 2200, y: 2200, faction: 'military',    services: ['repair', 'trade', 'shipyard'], commodities: { food: 'medium', ore: 'medium', tech: 'deficit', exotics: 'low', scrap: 'medium' }, shipyard: ['gunship', 'frigate'] },
  ],

  planets: [
    { id: 'thalassa', name: 'Thalassa', x: 600,  y: 800,  radius: 80, colorInner: '#2a6a2a', colorOuter: '#1a3a1a' },
    { id: 'grist',    name: 'Grist',    x: 2400, y: 800,  radius: 60, colorInner: '#8a5a2a', colorOuter: '#4a2a10' },
  ],

  derelicts: [
    {
      name: 'Wrecked Hauler', x: 1300, y: 1600, salvageTime: 3,
      lootTable: [
        { type: 'credits', amount: 150 },
        { type: 'scrap', amount: 5 },
        { type: 'ore', amount: 2 },
      ],
    },
    {
      name: 'Gutted Frigate', x: 1700, y: 1400, salvageTime: 4,
      lootTable: [
        { type: 'credits', amount: 250 },
        { type: 'scrap', amount: 8 },
        { type: 'tech', amount: 1 },
        { type: 'exotics', amount: 1 },
      ],
    },
    {
      name: 'Scrap Hulk', x: 1100, y: 1300, salvageTime: 2,
      lootTable: [
        { type: 'credits', amount: 50 },
        { type: 'scrap', amount: 15 },
        { type: 'food', amount: 3 },
      ],
    },
  ],

  raiderSpawns: [
    { stationId: 'crucible',  count: 2 },
    { stationId: 'thornwick', count: 1 },
  ],

  asteroidFields: [],
  nebulae: [],
};

// Test verification steps — shown on-screen in test mode.
export const TEST_STEPS = [
  'HUD: Crew readout below Scrap (e.g. "Crew: 12/20")',
  'HUD: Efficiency % shows when crew < 90% (amber/red)',
  'Fleet status: crew count shown after hull bars',
  'Flagship starts at 12/20 crew — check reduced speed/fire rate',
  'Dock at Keelbreak -> Services tab: CREW ROSTER section',
  'Crew roster: each ship shows name, crew count, efficiency %',
  'Click +1 to hire one crew (10 cr each)',
  'Click Fill to hire all missing crew at once',
  'Hire crew to full -> efficiency shows 100%, speed returns to normal',
  'Fight raiders -> hull hits have ~15% chance to kill crew',
  'Low crew (<25%): severe speed/turn/fire rate penalties',
  'Zero crew: weapons offline, ship barely moves (10% eff)',
  'Buy a ship at shipyard -> check it starts with full crew',
];
