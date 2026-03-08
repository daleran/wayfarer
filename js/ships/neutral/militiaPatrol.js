import { DecFrigate } from '../classes/decFrigate.js';
import { BASE_SPEED, BASE_ACCELERATION, BASE_TURN_RATE, SPEED_FACTOR,
         BASE_HULL, BASE_ARMOR } from '../../data/stats.js';

const SPEED_MULT = 0.5;   // ~42 u/s — steady patrol speed
const ACCEL_MULT = 0.6;
const TURN_MULT  = 0.6;
const HULL_MULT  = 2.0;   // 400 hp — reinforced patrol vessel

const ARMOR_FRONT = 2.5;
const ARMOR_SIDE  = 2.0;
const ARMOR_AFT   = 1.5;

export class MilitiaPatrol extends DecFrigate {
  constructor(x, y) {
    super(x, y);

    this.faction         = 'neutral';
    this.relation        = 'neutral';
    this.shipType        = 'militia-patrol';
    this.neutralBehavior = 'militia';

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

export function createMilitiaPatrol(x, y) {
  return new MilitiaPatrol(x, y);
}
