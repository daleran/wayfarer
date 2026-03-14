import { OnyxClassTug } from '@/ships/classes/onyxTug.js';
import { AutocannonModule, OnyxDriveUnit, HydrogenFuelCell, SalvagedSensorSuite } from '@/modules/shipModule.js';
import { Character } from '@/characters/character.js';

// Crash Dummy — editor-only test ship.
// Identical to the Hullbreaker so gameplay feel matches, but edits here
// don't affect the real player ship. Use the editor Items menu to spawn
// weapons, modules, and ammo as needed.
const ARMOR_REDUCTION = 0.7;
const FUEL_MAX_BOOST  = 1.3;

export function createCrashDummy(x, y) {
  const ship = new OnyxClassTug(x, y);
  ship.shipType = 'crash-dummy';
  ship.name = 'Crash Dummy';

  // Reduced armor — same as Hullbreaker
  for (const arc of Object.keys(ship.armorArcsMax)) {
    ship.armorArcsMax[arc] = Math.round(ship.armorArcsMax[arc] * ARMOR_REDUCTION);
    ship.armorArcs[arc]    = ship.armorArcsMax[arc];
  }

  // Enlarged fuel tank
  ship.fuelMax = Math.round(ship.fuelMax * FUEL_MAX_BOOST);

  // Module slots — mirrors Hullbreaker layout
  ship.moduleSlots = [
    new OnyxDriveUnit(),
    new AutocannonModule(),
    new HydrogenFuelCell(),
    new SalvagedSensorSuite(),
    null,
  ];
  ship._applyModules();
  ship.flavorText =
    'Editor test vehicle. Stats mirror the Hullbreaker — armor stripped ' +
    'for fuel capacity, hardpoints jury-rigged. Expendable.';

  const captain = new Character({
    id: 'crash-dummy',
    name: 'Test Pilot',
    faction: 'player',
    relation: 'player',
    behavior: 'player',
  });
  captain.boardShip(ship);
  return ship;
}
