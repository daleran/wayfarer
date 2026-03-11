// Registry of all raider/enemy ship factories.
// game.js uses this to spawn enemies without direct imports.
// To add a new enemy type: create the file, add a factory entry here,
// and add any spawn data to map.js — game.js needs no changes.

import { createLightFighter }      from './scavengers/lightFighter.js';
import { createArmedHauler }       from './scavengers/armedHauler.js';
import { createSalvageMothership } from './scavengers/salvageMothership.js';
import { createGraveClanAmbusher } from './scavengers/graveClanAmbusher.js';
import { createDroneControlFrigate } from './concord/droneControlFrigate.js';

export const RAIDER_REGISTRY = {
  'light-fighter':         createLightFighter,
  'armed-hauler':          createArmedHauler,
  'salvage-mothership':    createSalvageMothership,
  'grave-clan-ambusher':   createGraveClanAmbusher,
  'drone-control-frigate': createDroneControlFrigate,
};
