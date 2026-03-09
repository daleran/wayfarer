import { MaverickCourier } from '../../ships/classes/maverickCourier.js';
import { AutocannonModule, MissileHeatModule } from '../../systems/shipModule.js';
import { BASE_SPEED, BASE_ACCELERATION, BASE_TURN_RATE, SPEED_FACTOR,
         BASE_HULL } from '../../data/stats.js';

const SPEED_MULT = 1.1;   // ~120 u/s — fast courier, built to pounce
const ACCEL_MULT = 1.2;
const TURN_MULT  = 1.3;
const HULL_MULT  = 0.65;  // ~130 hp — lightly armored ambusher

// Armor arc multipliers — stripped and reinforced nose for fast attack runs
const ARMOR_FRONT = 0.85;  //  85
const ARMOR_SIDE  = 0.70;  //  70
const ARMOR_AFT   = 0.55;  //  55

export class GraveClanAmbusher extends MaverickCourier {
  constructor(x, y) {
    super(x, y);

    this.faction      = 'scavenger';
    this.relation     = 'enemy';
    this.shipType     = 'grave-clan-ambusher';
    this.displayName  = 'Grave-Clan Ambusher';
    this.behaviorType = 'lurker';

    this.flavorText =
      'A Maverick Courier fielded by Grave-Clan cells — the most patient killers in the ' +
      'Gravewake. They pick a spar or debris shadow and wait. When a convoy moves through ' +
      'they commit hard: autocannon for armor, a heat missile to finish it. ' +
      'They know the trade lanes the way scavengers know wreckage. ' +
      'Strength: ambush timing, missile punch, high speed. ' +
      'Weakness: fragile hull, commits fully when it attacks — no fallback plan.';

    this.speedMax     = BASE_SPEED        * SPEED_MULT * SPEED_FACTOR;
    this.acceleration = BASE_ACCELERATION * ACCEL_MULT * SPEED_FACTOR;
    this.turnRate     = BASE_TURN_RATE    * TURN_MULT  * SPEED_FACTOR;

    this.hullMax     = BASE_HULL * HULL_MULT;
    this.hullCurrent = this.hullMax;

    this._initArmorArcs(ARMOR_FRONT, ARMOR_SIDE, ARMOR_AFT);

    this.moduleSlots = [new AutocannonModule(), new MissileHeatModule('small')];
    this._applyModules();
  }
}

export function createGraveClanAmbusher(x, y) {
  return new GraveClanAmbusher(x, y);
}
