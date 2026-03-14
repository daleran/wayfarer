import { OnyxClassTug } from '@/ships/classes/onyxTug.js';
import { AutocannonModule, OnyxDriveUnit, HydrogenFuelCell, SalvagedSensorSuite } from '@/modules/shipModule.js';
import { Character } from '@/characters/character.js';

// Hullbreaker — salvage-modified Onyx Class Tug.
// All stat customization comes purely from modules.

export function createHullbreaker(x, y) {
  const ship = new OnyxClassTug(x, y);
  ship.shipType = 'hullbreaker';
  ship.name = 'Hullbreaker';

  // Module slots — 5 universal slots.
  // Weapons come from modules; no direct addWeapon() calls.
  ship.moduleSlots = [
    new OnyxDriveUnit(),
    new AutocannonModule(),
    new HydrogenFuelCell(),
    new SalvagedSensorSuite(),
    null,  // empty — for player's first find
  ];
  ship._applyModules();
  ship.flavorText =
    'A salvage-modified Onyx Class Tug — armor stripped for fuel capacity, ' +
    'hardpoints jury-rigged for whatever can be found. Whoever flew her before ' +
    'did not come back, but the ship did. Strength: long range, durable enough ' +
    'to take a beating, adaptable. Weakness: lighter armor than stock — the ' +
    'weight savings are the only thing keeping this run profitable.';

  const captain = new Character({
    id: 'player',
    name: 'Pilot',
    faction: 'player',
    relation: 'player',
    behavior: 'player',
  });
  captain.boardShip(ship);
  return ship;
}
