import { G100ClassHauler } from '../../ships/classes/g100Hauler.js';
import { AutocannonModule, LanceModuleSmall } from '../../systems/shipModule.js';
import { BASE_SPEED, BASE_ACCELERATION, BASE_TURN_RATE, SPEED_FACTOR,
         BASE_HULL } from '../../data/stats.js';

const SPEED_MULT = 1.0;   // ~84 u/s — faster than a stock hauler
const ACCEL_MULT = 0.9;
const TURN_MULT  = 0.85;
const HULL_MULT  = 1.0;   // 200 hp — solid base

// Armor arc multipliers — doubled from base hauler (welded war conversion)
const ARMOR_FRONT = 2.6;  // 260 — heavy reinforced cab
const ARMOR_SIDE  = 2.4;  // 240 — cargo bay walls replaced with armor plate
const ARMOR_AFT   = 2.0;  // 200 — armored stern

export class ArmedHauler extends G100ClassHauler {
  constructor(x, y) {
    super(x, y);

    this.faction      = 'scavenger';
    this.relation     = 'enemy';
    this.shipType     = 'armed-hauler';
    this.displayName  = 'Armed Hauler';
    this.behaviorType = 'kiter';

    this.flavorText =
      'A G100 hauler with the cargo bays gutted and armor plate welded over ' +
      'everything. What was once a trade vessel became a mobile fire platform. ' +
      'Scavenger conversion work — ugly, functional, surprisingly hard to kill. ' +
      'Strength: heavy armor in all arcs, kites well at range with lance and ' +
      'autocannon. Weakness: slow, predictable movement pattern.';

    this.speedMax     = BASE_SPEED        * SPEED_MULT * SPEED_FACTOR;
    this.acceleration = BASE_ACCELERATION * ACCEL_MULT * SPEED_FACTOR;
    this.turnRate     = BASE_TURN_RATE    * TURN_MULT  * SPEED_FACTOR;

    this.hullMax     = BASE_HULL * HULL_MULT;
    this.hullCurrent = this.hullMax;

    this._initArmorArcs(ARMOR_FRONT, ARMOR_SIDE, ARMOR_AFT);

    this.moduleSlots = [new AutocannonModule(), new LanceModuleSmall(), null];
    this._applyModules();
  }
}

export function createArmedHauler(x, y) {
  return new ArmedHauler(x, y);
}
