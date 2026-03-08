import { OnyxClassTug } from '../classes/onyxTug.js';

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

    // Reduced armor — weight traded for extra fuel capacity
    for (const arc of Object.keys(this.armorArcsMax)) {
      this.armorArcsMax[arc] = Math.round(this.armorArcsMax[arc] * ARMOR_REDUCTION);
      this.armorArcs[arc]    = this.armorArcsMax[arc];
    }

    // Enlarged fuel tank
    this.fuelMax = Math.round(this.fuelMax * FUEL_MAX_BOOST);
  }
}

export function createHullbreaker(x, y) {
  return new Hullbreaker(x, y);
}
