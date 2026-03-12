import { MaverickCourier } from '../../ships/classes/maverickCourier.js';
import { AutocannonModule, RocketPodModule } from '../../modules/shipModule.js';
import { AI_TEMPLATES } from '../../data/tuning/aiTuning.js';

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

    this.faction     = 'scavenger';
    this.relation    = 'hostile';
    this.shipType    = 'grave-clan-ambusher';
    this.displayName = 'Grave-Clan Ambusher';
    this.ai          = { ...AI_TEMPLATES.lurker };

    this.flavorText =
      'A Maverick Courier fielded by Grave-Clan cells — the most patient killers in the ' +
      'Gravewake. They pick a spar or debris shadow and wait. When a convoy moves through ' +
      'they commit hard: autocannon for armor, a heat missile to finish it. ' +
      'They know the trade lanes the way scavengers know wreckage. ' +
      'Strength: ambush timing, missile punch, high speed. ' +
      'Weakness: fragile hull, commits fully when it attacks — no fallback plan.';

    this._initStats({
      speed: SPEED_MULT, accel: ACCEL_MULT, turn: TURN_MULT,
      hull: HULL_MULT, armorFront: ARMOR_FRONT, armorSide: ARMOR_SIDE, armorAft: ARMOR_AFT,
    });

    this.moduleSlots = [new AutocannonModule(), new RocketPodModule('small', 'heat')];
    this._applyModules();
  }
}

export function createGraveClanAmbusher(x, y) {
  return new GraveClanAmbusher(x, y);
}
