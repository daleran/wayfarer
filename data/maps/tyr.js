// Gravewake — the only current zone. A ship graveyard in high orbit above Pale.
// Map dimensions: 18000×10000 world units.
// Player enters near The Coil; all entity data lives in zone files under
//   data/locations/tyr/pale/orbital/

import { GRAVEWAKE } from '@data/locations/tyr/pale/orbital/manifest.js';

export const MAP = {
  mapSize: { width: 18000, height: 10000 },
  playerStart: { x: 15000, y: 3000 },
  ...GRAVEWAKE,
};
