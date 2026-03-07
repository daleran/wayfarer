// Map data for the Wayfarer galaxy
// Stub data included for future phases — uncomment sections as needed

export const MAP = {
  mapSize: { width: 20000, height: 20000 },

  // Phase 3: Stations
  stations: [
    { id: 'haven',    name: 'Haven Station',    x: 2200, y: 2800, faction: 'neutral',     services: ['repair', 'trade'], commodities: { food: 'high', ore: 'low', tech: 'medium', exotics: 'none' } },
    { id: 'frontier', name: 'Frontier Outpost', x: 5000, y: 7000, faction: 'independent', services: ['repair', 'trade'], commodities: { food: 'low', ore: 'surplus', tech: 'low', exotics: 'deficit' } },
    { id: 'bastion',  name: 'Bastion',          x: 8000, y: 4000, faction: 'military',    services: ['repair', 'trade'], commodities: { food: 'medium', ore: 'medium', tech: 'deficit', exotics: 'low' } },
  ],

  // Phase 3: Planets
  planets: [
    { id: 'verdant', name: 'Verdant', x: 3500, y: 4500, radius: 180, colorInner: '#2a6a2a', colorOuter: '#1a3a1a' },
    { id: 'arid',    name: 'Arid',    x: 9000, y: 5500, radius: 120, colorInner: '#8a5a2a', colorOuter: '#4a2a10' },
    { id: 'glacius', name: 'Glacius', x: 6000, y: 12000, radius: 200, colorInner: '#4a7a9a', colorOuter: '#1a3a5a' },
  ],

  // Phase 2+: Jump gates / warp points
  jumpGates: [
    // { id: 'gate_alpha', name: 'Alpha Gate', x: 1000, y: 1000, destination: 'gate_beta' },
    // { id: 'gate_beta', name: 'Beta Gate', x: 19000, y: 19000, destination: 'gate_alpha' },
  ],

  // Phase 2+: Asteroid fields
  asteroidFields: [
    // { id: 'belt_a', x: 8000, y: 6000, radius: 1200, density: 0.6 },
    // { id: 'belt_b', x: 14000, y: 11000, radius: 800, density: 0.4 },
  ],

  // Phase 2+: Nebulae (sensor/speed penalties)
  nebulae: [
    // { id: 'red_nebula', x: 5000, y: 9000, radius: 2000, color: '#3a0010', sensorPenalty: 0.5, speedPenalty: 0 },
  ],
};
