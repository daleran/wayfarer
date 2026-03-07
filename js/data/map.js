// Map data for the Wayfarer galaxy

export const MAP = {
  mapSize: { width: 20000, height: 20000 },

  stations: [
    { id: 'keelbreak',  name: 'Keelbreak',         x: 2200, y: 2800, faction: 'neutral',     services: ['repair', 'trade', 'shipyard'], commodities: { food: 'high', ore: 'low', tech: 'medium', exotics: 'none', scrap: 'surplus' }, shipyard: ['gunship', 'hauler'] },
    { id: 'crucible',   name: 'Crucible Station',   x: 5000, y: 7000, faction: 'independent', services: ['repair', 'trade', 'shipyard'], commodities: { food: 'low', ore: 'surplus', tech: 'low', exotics: 'deficit', scrap: 'high' }, shipyard: ['hauler'] },
    { id: 'thornwick',  name: 'Thornwick Archive',  x: 8000, y: 4000, faction: 'military',    services: ['repair', 'trade', 'shipyard'], commodities: { food: 'medium', ore: 'medium', tech: 'deficit', exotics: 'low', scrap: 'medium' }, shipyard: ['gunship', 'frigate'] },
  ],

  planets: [
    { id: 'thalassa', name: 'Thalassa', x: 3500, y: 4500, radius: 180, colorInner: '#2a6a2a', colorOuter: '#1a3a1a' },
    { id: 'grist',    name: 'Grist',    x: 9000, y: 5500, radius: 120, colorInner: '#8a5a2a', colorOuter: '#4a2a10' },
    { id: 'pale',     name: 'Pale',     x: 6000, y: 12000, radius: 200, colorInner: '#4a7a9a', colorOuter: '#1a3a5a' },
  ],

  derelicts: [
    {
      name: 'Wrecked Hauler', x: 4000, y: 3500, salvageTime: 3,
      lootTable: [
        { type: 'credits', amount: 200 },
        { type: 'scrap', amount: 8 },
        { type: 'ore', amount: 3 },
        { type: 'food', amount: 2 },
      ],
    },
    {
      name: 'Gutted Frigate', x: 7000, y: 6000, salvageTime: 4,
      lootTable: [
        { type: 'credits', amount: 350 },
        { type: 'scrap', amount: 12 },
        { type: 'tech', amount: 2 },
      ],
    },
  ],

  raiderSpawns: [
    { stationId: 'crucible',  count: 2 },
    { stationId: 'thornwick', count: 3 },
  ],

  asteroidFields: [],
  nebulae: [],
};
