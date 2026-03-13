import { OnyxClassTug } from '@/ships/classes/onyxTug.js';
import { AutocannonModule, OnyxDriveUnit, HydrogenFuelCell, SalvagedSensorSuite } from '@/modules/shipModule.js';

// Crash Dummy — editor-only test ship.
// Identical to the Hullbreaker so gameplay feel matches, but edits here
// don't affect the real player ship. Use the editor Items menu to spawn
// weapons, modules, and ammo as needed.
const ARMOR_REDUCTION = 0.7;
const FUEL_MAX_BOOST  = 1.3;

class CrashDummy extends OnyxClassTug {
  constructor(x, y) {
    super(x, y);

    this.faction   = 'player';
    this.relation  = 'player';
    this.shipType  = 'crash-dummy';
    this.name      = 'Crash Dummy';

    this.flavorText =
      'Editor test vehicle. Stats mirror the Hullbreaker — armor stripped ' +
      'for fuel capacity, hardpoints jury-rigged. Expendable.';

    // Reduced armor — same as Hullbreaker
    for (const arc of Object.keys(this.armorArcsMax)) {
      this.armorArcsMax[arc] = Math.round(this.armorArcsMax[arc] * ARMOR_REDUCTION);
      this.armorArcs[arc]    = this.armorArcsMax[arc];
    }

    // Enlarged fuel tank
    this.fuelMax = Math.round(this.fuelMax * FUEL_MAX_BOOST);

    // Module slots — mirrors Hullbreaker layout
    this.moduleSlots = [
      new OnyxDriveUnit(),
      new AutocannonModule(),
      new HydrogenFuelCell(),
      new SalvagedSensorSuite(),
      null,
    ];

    this._applyModules();
  }
}

export function createCrashDummy(x, y) {
  return new CrashDummy(x, y);
}
