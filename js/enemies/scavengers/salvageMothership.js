import { DecFrigate } from '../../ships/classes/decFrigate.js';
import { Cannon } from '../../weapons/cannon.js';
import { MissileHeat } from '../../weapons/missileHeat.js';
import { BASE_SPEED, BASE_ACCELERATION, BASE_TURN_RATE, SPEED_FACTOR,
         BASE_HULL, BASE_ARMOR } from '../../data/stats.js';

const SPEED_MULT = 0.6;   // ~50 u/s — slow, hangs back
const ACCEL_MULT = 0.6;
const TURN_MULT  = 0.65;
const HULL_MULT  = 2.2;   // ~440 hp — very tough

// Armor arc multipliers — heavy military conversion
const ARMOR_FRONT = 3.5;  // 350 — hardened bow
const ARMOR_SIDE  = 2.8;  // 280 — heavy flank plating
const ARMOR_AFT   = 2.0;  // 200 — protected stern

export class SalvageMothership extends DecFrigate {
  constructor(x, y) {
    super(x, y);

    this.faction      = 'scavenger';
    this.relation     = 'enemy';
    this.shipType     = 'salvage-mothership';
    this.behaviorType = 'standoff';

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

    this.addWeapon(new Cannon());
    this.addWeapon(new MissileHeat('large'));
  }
}

export function createSalvageMothership(x, y) {
  return new SalvageMothership(x, y);
}
