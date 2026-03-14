// Central registries. Add new ships/NPCs here only.
// Consumers: game.js, designer.js, editor.js
import { generateShipName } from './nameGenerator.js';

import { OnyxClassTug }         from './classes/onyxTug.js';
import { MaverickCourier }      from './classes/maverickCourier.js';
import { G100ClassHauler }      from './classes/g100Hauler.js';
import { GarrisonFrigate }      from './classes/garrisonFrigate.js';
import { DroneControlHull }     from './classes/droneControlHull.js';
import { SnatcHerDroneHull }    from './classes/snatcHerDroneHull.js';
import { createHullbreaker }    from './player/hullbreaker.js';
import { createLightFighter }   from '@/npcs/scavengers/lightFighter.js';
import { createArmedHauler }    from '@/npcs/scavengers/armedHauler.js';
import { createSalvageMothership } from '@/npcs/scavengers/salvageMothership.js';
import { createGraveClanAmbusher } from '@/npcs/scavengers/graveClanAmbusher.js';
import { createDroneControlFrigate } from '@/npcs/concord/droneControlFrigate.js';
import { createSnatcHerDrone }       from '@/npcs/concord/snatcHerDrone.js';
import { createTraderConvoy }   from '@/npcs/settlements/traderConvoy.js';
import { createMilitiaPatrol }  from '@/npcs/settlements/militiaPatrol.js';

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
  {
    id: 'drone-control-hull',
    label: 'Drone Control Hull',
    file: 'js/ships/classes/droneControlHull.js',
    create: (x, y) => new DroneControlHull(x, y),
  },
  {
    id: 'snatcher-drone-hull',
    label: 'Snatcher Drone Hull',
    file: 'js/ships/classes/snatcHerDroneHull.js',
    create: (x, y) => new SnatcHerDroneHull(x, y),
  },
];

// ── Character roster ────────────────────────────────────────────────────────────
// Each entry is a named ship instance (hull + modules) paired with its character.
// hullClass references a SHIP_REGISTRY id (the hull type this ship is built on).
// unmanned: true means the ship is an autonomous machine (no Character instance).

export const CHARACTER_REGISTRY = [
  {
    id: 'hullbreaker',
    label: 'Hullbreaker',
    faction: 'player',
    behavior: 'player',
    hullClass: 'onyx-tug',
    file: 'js/ships/player/hullbreaker.js',
    create: (x, y) => createHullbreaker(x, y),
  },
  {
    id: 'light-fighter',
    label: 'Light Fighter',
    faction: 'scavenger',
    behavior: 'stalker',
    hullClass: 'maverick-courier',
    file: 'js/npcs/scavengers/lightFighter.js',
    create: (x, y) => createLightFighter(x, y),
  },
  {
    id: 'armed-hauler',
    label: 'Armed Hauler',
    faction: 'scavenger',
    behavior: 'kiter',
    hullClass: 'g100-hauler',
    file: 'js/npcs/scavengers/armedHauler.js',
    create: (x, y) => createArmedHauler(x, y),
  },
  {
    id: 'salvage-mothership',
    label: 'Salvage Mothership',
    faction: 'scavenger',
    behavior: 'standoff',
    hullClass: 'garrison-frigate',
    file: 'js/npcs/scavengers/salvageMothership.js',
    create: (x, y) => createSalvageMothership(x, y),
  },
  {
    id: 'grave-clan-ambusher',
    label: 'Grave-Clan Ambusher',
    faction: 'scavenger',
    behavior: 'lurker',
    hullClass: 'maverick-courier',
    file: 'js/npcs/scavengers/graveClanAmbusher.js',
    create: (x, y) => createGraveClanAmbusher(x, y),
  },
  {
    id: 'trader-convoy',
    label: 'Trader Convoy',
    faction: 'neutral',
    behavior: 'trader',
    hullClass: 'g100-hauler',
    file: 'js/npcs/settlements/traderConvoy.js',
    create: (x, y) => createTraderConvoy(x, y),
  },
  {
    id: 'militia-patrol',
    label: 'Militia Patrol',
    faction: 'neutral',
    behavior: 'militia',
    hullClass: 'garrison-frigate',
    file: 'js/npcs/settlements/militiaPatrol.js',
    create: (x, y) => createMilitiaPatrol(x, y),
  },
  {
    id: 'drone-control-frigate',
    label: 'Drone Control Frigate',
    faction: 'concord',
    behavior: 'standoff',
    unmanned: true,
    hullClass: 'drone-control-hull',
    file: 'js/npcs/concord/droneControlFrigate.js',
    create: (x, y) => createDroneControlFrigate(x, y),
  },
  {
    id: 'snatcher-drone',
    label: 'Snatcher Drone',
    faction: 'concord',
    behavior: 'latch',
    unmanned: true,
    hullClass: 'snatcher-drone-hull',
    file: 'js/npcs/concord/snatcHerDrone.js',
    create: (x, y) => createSnatcHerDrone(x, y),
  },
];

// Backward-compat alias
export const NPC_REGISTRY = CHARACTER_REGISTRY;

// ── Lookup helpers ─────────────────────────────────────────────────────────────

export function createActor(id, x, y) {
  const entry = CHARACTER_REGISTRY.find(n => n.id === id);
  if (!entry) throw new Error(`Unknown character id: ${id}`);
  const ship = entry.create(x, y);
  if (!ship.name) ship.name = generateShipName(entry.faction);
  return ship;
}

// Backward-compat alias
export const createShip = createActor;
