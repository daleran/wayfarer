import { SwiftRunner } from '../../ships/classes/swiftRunner.js';
import { Autocannon } from '../../weapons/autocannon.js';
import { BASE_SPEED, BASE_ACCELERATION, BASE_TURN_RATE, SPEED_FACTOR,
         BASE_HULL, BASE_ARMOR } from '../../data/stats.js';

const SPEED_MULT = 1.55;  // ~130 u/s — fast; slightly slower than base runner for balance
const ACCEL_MULT = 1.4;
const TURN_MULT  = 1.45;
const HULL_MULT  = 0.45;  // ~90 hp — very fragile

// Armor arc multipliers — light, unprotected craft
const ARMOR_FRONT = 0.9;   //  90
const ARMOR_SIDE  = 0.7;   //  70
const ARMOR_AFT   = 0.6;   //  60

export class LightFighter extends SwiftRunner {
  constructor(x, y) {
    super(x, y);

    this.faction      = 'scavenger';
    this.relation     = 'enemy';
    this.shipType     = 'light-fighter';
    this.behaviorType = 'stalker';

    this.speedMax     = BASE_SPEED        * SPEED_MULT * SPEED_FACTOR;
    this.acceleration = BASE_ACCELERATION * ACCEL_MULT * SPEED_FACTOR;
    this.turnRate     = BASE_TURN_RATE    * TURN_MULT  * SPEED_FACTOR;

    this.hullMax     = BASE_HULL * HULL_MULT;
    this.hullCurrent = this.hullMax;

    const fa = {
      front:     BASE_ARMOR * ARMOR_FRONT,
      port:      BASE_ARMOR * ARMOR_SIDE,
      starboard: BASE_ARMOR * ARMOR_SIDE,
      aft:       BASE_ARMOR * ARMOR_AFT,
    };
    this.armorArcs    = { ...fa };
    this.armorArcsMax = { ...fa };

    this.addWeapon(new Autocannon());
  }
}

export function createLightFighter(x, y) {
  return new LightFighter(x, y);
}
