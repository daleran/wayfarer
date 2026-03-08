import { CompactHauler } from '../classes/compactHauler.js';
import { BASE_SPEED, BASE_ACCELERATION, BASE_TURN_RATE, SPEED_FACTOR,
         BASE_HULL, BASE_ARMOR } from '../../data/stats.js';

const SPEED_MULT = 0.55;  // ~46 u/s — slow trading hauler
const ACCEL_MULT = 0.75;
const TURN_MULT  = 0.7;
const HULL_MULT  = 0.9;   // 180 hp — lightly built

const ARMOR_FRONT = 1.0;
const ARMOR_SIDE  = 1.0;
const ARMOR_AFT   = 1.0;

export class TraderConvoy extends CompactHauler {
  constructor(x, y) {
    super(x, y);

    this.faction         = 'neutral';
    this.relation        = 'neutral';
    this.shipType        = 'trader-convoy';
    this.neutralBehavior = 'trader';

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
  }
}

export function createTraderConvoy(x, y) {
  return new TraderConvoy(x, y);
}
