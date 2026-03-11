// Gravewake — the only current zone. A ship graveyard in high orbit above Pale.
// Map dimensions: 18000×10000 world units (1 world unit = 1 screen pixel, no zoom).
// Player enters from the west; The Coil is the central hub deep in the zone.
//
// This file is a thin composer. All entity data lives in:
//   js/world/zones/gravewake.js — zone placement manifest
//   js/world/stations/         — station descriptors
//   js/ships/named/            — named ship descriptors
//   js/npcs/characters/        — character descriptors
//   js/world/terrain/          — spines and debris clusters

import { GRAVEWAKE_ZONE } from '../../world/zones/gravewake.js';

export const MAP = {
  mapSize: { width: 18000, height: 10000 },
  playerStart: { x: 15000, y: 3000 },

  // Zone reference (used by Renderer for atmosphere layer)
  zones: [ GRAVEWAKE_ZONE ],

  // Backward-compatible flat arrays for game.js loader
  stations:       GRAVEWAKE_ZONE.stations,
  planets:        GRAVEWAKE_ZONE.planets,
  derelicts:      GRAVEWAKE_ZONE.derelicts,
  raiderSpawns:   GRAVEWAKE_ZONE.raiderSpawns,
  lurkerSpawns:   GRAVEWAKE_ZONE.lurkerSpawns,
  tradeConvoys:   GRAVEWAKE_ZONE.tradeConvoys,
  militiaPatrols: GRAVEWAKE_ZONE.militiaPatrols,
  background:     GRAVEWAKE_ZONE.background,

  // World objects: spines and debris clouds (for Renderer)
  arkshipSpines:  GRAVEWAKE_ZONE.arkshipSpines,
  wallOfWrecks:   GRAVEWAKE_ZONE.wallOfWrecks,

  asteroidFields: [],
  nebulae: [],
};
