// Central registries. Add new ships/NPCs here only.
// Consumers: game.js, designer.js, editor.js

import { OnyxClassTug }         from './classes/onyxTug.js';
import { MaverickCourier }      from './classes/maverickCourier.js';
import { G100ClassHauler }      from './classes/g100Hauler.js';
import { GarrisonFrigate }      from './classes/garrisonFrigate.js';
import { createHullbreaker }    from './player/hullbreaker.js';
import { createLightFighter }   from '../enemies/scavengers/lightFighter.js';
import { createArmedHauler }    from '../enemies/scavengers/armedHauler.js';
import { createSalvageMothership } from '../enemies/scavengers/salvageMothership.js';
import { createGraveClanAmbusher } from '../enemies/scavengers/graveClanAmbusher.js';
import { createTraderConvoy }   from './neutral/traderConvoy.js';
import { createMilitiaPatrol }  from './neutral/militiaPatrol.js';

// ── Hull templates ─────────────────────────────────────────────────────────────
// Pure physical vessel definitions: shape, stats, slot layout.
// No faction, no AI behavior, no identity.

export const SHIP_REGISTRY = [
  {
    id: 'onyx-tug',
    label: 'Onyx Class Tug',
    file: 'js/ships/classes/onyxTug.js',
    create: (x, y) => new OnyxClassTug(x, y),
  },
  {
    id: 'maverick-courier',
    label: 'Maverick Class Courier',
    file: 'js/ships/classes/maverickCourier.js',
    create: (x, y) => new MaverickCourier(x, y),
  },
  {
    id: 'g100-hauler',
    label: 'G100 Class Hauler',
    file: 'js/ships/classes/g100Hauler.js',
    create: (x, y) => new G100ClassHauler(x, y),
  },
  {
    id: 'garrison-frigate',
    label: 'Garrison Class Frigate',
    file: 'js/ships/classes/garrisonFrigate.js',
    create: (x, y) => new GarrisonFrigate(x, y),
  },
];

// ── NPC roster ─────────────────────────────────────────────────────────────────
// Configured actor instantiations: a specific ship + faction + AI behavior + identity.
// shipClass references a SHIP_REGISTRY id (the hull this NPC is built on).

export const NPC_REGISTRY = [
  {
    id: 'hullbreaker',
    label: 'Hullbreaker',
    faction: 'player',
    behavior: 'player',
    shipClass: 'onyx-tug',
    file: 'js/ships/player/hullbreaker.js',
    create: (x, y) => createHullbreaker(x, y),
  },
  {
    id: 'light-fighter',
    label: 'Light Fighter',
    faction: 'scavenger',
    behavior: 'stalker',
    shipClass: 'maverick-courier',
    file: 'js/enemies/scavengers/lightFighter.js',
    create: (x, y) => createLightFighter(x, y),
  },
  {
    id: 'armed-hauler',
    label: 'Armed Hauler',
    faction: 'scavenger',
    behavior: 'kiter',
    shipClass: 'g100-hauler',
    file: 'js/enemies/scavengers/armedHauler.js',
    create: (x, y) => createArmedHauler(x, y),
  },
  {
    id: 'salvage-mothership',
    label: 'Salvage Mothership',
    faction: 'scavenger',
    behavior: 'standoff',
    shipClass: 'garrison-frigate',
    file: 'js/enemies/scavengers/salvageMothership.js',
    create: (x, y) => createSalvageMothership(x, y),
  },
  {
    id: 'grave-clan-ambusher',
    label: 'Grave-Clan Ambusher',
    faction: 'scavenger',
    behavior: 'lurker',
    shipClass: 'maverick-courier',
    file: 'js/enemies/scavengers/graveClanAmbusher.js',
    create: (x, y) => createGraveClanAmbusher(x, y),
  },
  {
    id: 'trader-convoy',
    label: 'Trader Convoy',
    faction: 'neutral',
    behavior: 'trader',
    shipClass: 'g100-hauler',
    file: 'js/ships/neutral/traderConvoy.js',
    create: (x, y) => createTraderConvoy(x, y),
  },
  {
    id: 'militia-patrol',
    label: 'Militia Patrol',
    faction: 'neutral',
    behavior: 'militia',
    shipClass: 'garrison-frigate',
    file: 'js/ships/neutral/militiaPatrol.js',
    create: (x, y) => createMilitiaPatrol(x, y),
  },
];

// ── Lookup helpers ─────────────────────────────────────────────────────────────

export function createShip(id, x, y) {
  const entry = NPC_REGISTRY.find(n => n.id === id);
  if (!entry) throw new Error(`Unknown NPC id: ${id}`);
  return entry.create(x, y);
}
