import { OnyxClassTug } from '@/ships/classes/onyxTug.js';
import { AutocannonModule, OnyxDriveUnit, HydrogenFuelCell, SalvagedSensorSuite } from '@/modules/shipModule.js';

// Hullbreaker — salvage-modified Onyx Class Tug.
// All stat customization comes purely from modules.

class Hullbreaker extends OnyxClassTug {
  constructor(x, y) {
    super(x, y);

    this.faction   = 'player';
    this.relation  = 'player';
    this.shipType  = 'hullbreaker';
    this.name      = 'Hullbreaker';

    this.flavorText =
      'A salvage-modified Onyx Class Tug — armor stripped for fuel capacity, ' +
      'hardpoints jury-rigged for whatever can be found. Whoever flew her before ' +
      'did not come back, but the ship did. Strength: long range, durable enough ' +
      'to take a beating, adaptable. Weakness: lighter armor than stock — the ' +
      'weight savings are the only thing keeping this run profitable.';

    // Module slots — 5 universal slots.
    // Weapons come from modules; no direct addWeapon() calls.
    this.moduleSlots = [
      new OnyxDriveUnit(),
      new AutocannonModule(),
      new HydrogenFuelCell(),
      new SalvagedSensorSuite(),
      null,  // empty — for player's first find
    ];

    this._applyModules();
  }
}

export function createHullbreaker(x, y) {
  return new Hullbreaker(x, y);
}
