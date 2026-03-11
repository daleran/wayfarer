import { CompactHauler } from '../classes/compactHauler.js';
import { BASE_SPEED, BASE_ACCELERATION, BASE_TURN_RATE, SPEED_FACTOR,
         BASE_HULL } from '../../data/tuning/shipTuning.js';
import { AI_TEMPLATES } from '../../data/tuning/aiTuning.js';

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

    this.faction  = 'neutral';
    this.relation = 'neutral';
    this.shipType = 'trader-convoy';
    this.ai       = { ...AI_TEMPLATES.trader };

    this.flavorText =
      'A G100 hauler on a regular trade run — lightly crewed, unarmed or barely ' +
      'armed, carrying whatever the stations need. The backbone of inter-settlement ' +
      'commerce in the Gravewake. Strength: runs a predictable route, carries goods ' +
      'worth trading for. Weakness: no real combat ability; relies entirely on route ' +
      'security or fast negotiation to avoid trouble.';

    this.speedMax     = BASE_SPEED        * SPEED_MULT * SPEED_FACTOR;
    this.acceleration = BASE_ACCELERATION * ACCEL_MULT * SPEED_FACTOR;
    this.turnRate     = BASE_TURN_RATE    * TURN_MULT  * SPEED_FACTOR;

    this.hullMax     = BASE_HULL * HULL_MULT;
    this.hullCurrent = this.hullMax;

    this._initArmorArcs(ARMOR_FRONT, ARMOR_SIDE, ARMOR_AFT);
  }
}

export function createTraderConvoy(x, y) {
  return new TraderConvoy(x, y);
}
