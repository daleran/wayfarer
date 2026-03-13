import { G100ClassHauler } from '@/ships/classes/g100Hauler.js';
import { MaverickCourier } from '@/ships/classes/maverickCourier.js';
import { GarrisonFrigate } from '@/ships/classes/garrisonFrigate.js';
import { OnyxClassTug } from '@/ships/classes/onyxTug.js';

// Maps derelict class names to ship class constructors.
const DERELICT_SHIP_CLASSES = {
  hauler:  G100ClassHauler,
  fighter: MaverickCourier,
  frigate: GarrisonFrigate,
  unknown: OnyxClassTug,
};

export function createDerelict(data) {
  const Cls = DERELICT_SHIP_CLASSES[data.derelictClass] ?? G100ClassHauler;
  const ship = new Cls(data.x, data.y);

  ship.relation = 'derelict';
  ship.crew = 0;
  ship.ai = null;
  ship.name = data.name || 'Derelict';
  ship.lootTable = data.lootTable || [];
  ship.salvageTime = data.salvageTime || 3;
  ship.loreText = data.loreText || [];
  ship.derelictClass = data.derelictClass || 'hauler';
  ship.interactionRadius = 120;
  ship.rotation = (Math.random() - 0.5) * 1.2;
  ship.throttleLevel = 0;
  ship.speed = 0;

  return ship;
}
