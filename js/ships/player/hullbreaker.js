import { OnyxClassTug } from '../classes/onyxTug.js';
import { AutocannonModule, OnyxDriveUnit, HydrogenFuelCell, SalvagedSensorSuite } from '../../modules/shipModule.js';

// Hullbreaker — salvage-modified Onyx Class Tug.
// Armor stripped down to save weight, fuel tank enlarged for longer-range runs.
const ARMOR_REDUCTION = 0.7; // 70% of base tug armor
const FUEL_MAX_BOOST  = 1.3; // 30% larger tank (~104 units)

class Hullbreaker extends OnyxClassTug {
  constructor(x, y) {
    super(x, y);

    this.faction   = 'player';
    this.relation  = 'player';
    this.shipType  = 'hullbreaker';

    this.flavorText =
      'A salvage-modified Onyx Class Tug — armor stripped for fuel capacity, ' +
      'hardpoints jury-rigged for whatever can be found. Whoever flew her before ' +
      'did not come back, but the ship did. Strength: long range, durable enough ' +
      'to take a beating, adaptable. Weakness: lighter armor than stock — the ' +
      'weight savings are the only thing keeping this run profitable.';

    // Reduced armor — weight traded for extra fuel capacity
    for (const arc of Object.keys(this.armorArcsMax)) {
      this.armorArcsMax[arc] = Math.round(this.armorArcsMax[arc] * ARMOR_REDUCTION);
      this.armorArcs[arc]    = this.armorArcsMax[arc];
    }

    // Enlarged fuel tank
    this.fuelMax = Math.round(this.fuelMax * FUEL_MAX_BOOST);

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
