// Central ship registry. Add new ships here only.
// game.js and designer.js both import from here.
import { OnyxClassTug } from './classes/onyxTug.js';
import { MaverickCourier } from './classes/maverickCourier.js';
import { G100ClassHauler } from './classes/g100Hauler.js';
import { GarrisonFrigate } from './classes/garrisonFrigate.js';
import { createHullbreaker } from './player/hullbreaker.js';
import { createLightFighter } from '../enemies/scavengers/lightFighter.js';
import { createArmedHauler } from '../enemies/scavengers/armedHauler.js';
import { createSalvageMothership } from '../enemies/scavengers/salvageMothership.js';
import { createGraveClanAmbusher } from '../enemies/scavengers/graveClanAmbusher.js';
import { createTraderConvoy }  from './neutral/traderConvoy.js';
import { createMilitiaPatrol } from './neutral/militiaPatrol.js';

export const SHIP_REGISTRY = [
  {
    id: 'onyx-tug',
    label: 'Onyx Class Tug',
    faction: 'neutral',
    file: 'js/ships/classes/onyxTug.js',
    parentClass: null,
    create: (x, y) => new OnyxClassTug(x, y),
  },
  {
    id: 'hullbreaker',
    label: 'Hullbreaker',
    faction: 'player',
    file: 'js/ships/player/hullbreaker.js',
    parentClass: 'onyx-tug',
    create: (x, y) => createHullbreaker(x, y),
  },
  {
    id: 'maverick-courier',
    label: 'Maverick Class Courier',
    faction: 'neutral',
    file: 'js/ships/classes/maverickCourier.js',
    parentClass: null,
    create: (x, y) => new MaverickCourier(x, y),
  },
  {
    id: 'light-fighter',
    label: 'Light Fighter',
    faction: 'scavenger',
    file: 'js/enemies/scavengers/lightFighter.js',
    parentClass: 'maverick-courier',
    create: (x, y) => createLightFighter(x, y),
  },
  {
    id: 'g100-hauler',
    label: 'G100 Class Hauler',
    faction: 'neutral',
    file: 'js/ships/classes/g100Hauler.js',
    parentClass: null,
    create: (x, y) => new G100ClassHauler(x, y),
  },
  {
    id: 'armed-hauler',
    label: 'Armed Hauler',
    faction: 'scavenger',
    file: 'js/enemies/scavengers/armedHauler.js',
    parentClass: 'g100-hauler',
    create: (x, y) => createArmedHauler(x, y),
  },
  {
    id: 'garrison-frigate',
    label: 'Garrison Class Frigate',
    faction: 'neutral',
    file: 'js/ships/classes/garrisonFrigate.js',
    parentClass: null,
    create: (x, y) => new GarrisonFrigate(x, y),
  },
  {
    id: 'salvage-mothership',
    label: 'Salvage Mothership',
    faction: 'scavenger',
    file: 'js/enemies/scavengers/salvageMothership.js',
    parentClass: 'garrison-frigate',
    create: (x, y) => createSalvageMothership(x, y),
  },
  {
    id: 'grave-clan-ambusher',
    label: 'Grave-Clan Ambusher',
    faction: 'scavenger',
    file: 'js/enemies/scavengers/graveClanAmbusher.js',
    parentClass: 'maverick-courier',
    create: (x, y) => createGraveClanAmbusher(x, y),
  },
  {
    id: 'trader-convoy',
    label: 'Trader Convoy',
    faction: 'neutral',
    file: 'js/ships/neutral/traderConvoy.js',
    parentClass: 'g100-hauler',
    create: (x, y) => createTraderConvoy(x, y),
  },
  {
    id: 'militia-patrol',
    label: 'Militia Patrol',
    faction: 'neutral',
    file: 'js/ships/neutral/militiaPatrol.js',
    parentClass: 'garrison-frigate',
    create: (x, y) => createMilitiaPatrol(x, y),
  },
];

export function createShip(id, x, y) {
  const entry = SHIP_REGISTRY.find(s => s.id === id);
  if (!entry) throw new Error(`Unknown ship id: ${id}`);
  return entry.create(x, y);
}
