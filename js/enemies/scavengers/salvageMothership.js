import { GarrisonFrigate } from '../../ships/classes/garrisonFrigate.js';
import { CannonModule, RocketPodModule } from '../../systems/shipModule.js';
import { BASE_SPEED, BASE_ACCELERATION, BASE_TURN_RATE, SPEED_FACTOR,
         BASE_HULL } from '../../data/tuning/shipTuning.js';
import { AI_TEMPLATES } from '../../data/tuning/aiTuning.js';

const SPEED_MULT = 0.6;   // ~50 u/s — slow, hangs back
const ACCEL_MULT = 0.6;
const TURN_MULT  = 0.65;
const HULL_MULT  = 2.2;   // ~440 hp — very tough

// Armor arc multipliers — heavy military conversion
const ARMOR_FRONT = 3.5;  // 350 — hardened bow
const ARMOR_SIDE  = 2.8;  // 280 — heavy flank plating
const ARMOR_AFT   = 2.0;  // 200 — protected stern

export class SalvageMothership extends GarrisonFrigate {
  constructor(x, y) {
    super(x, y);

    this.faction     = 'scavenger';
    this.relation    = 'hostile';
    this.shipType    = 'salvage-mothership';
    this.displayName = 'Salvage Mothership';
    this.ai          = { ...AI_TEMPLATES.standoff };

    this.flavorText =
      'A Garrison-class Frigate repurposed as a mobile salvage base and clan flagship. ' +
      'Cannon for hard targets. Missiles for deterrence. It moves slowly and fights ' +
      'cautiously — hanging back, making engagement too costly to press. Where you ' +
      'find one of these, the clan has been working this sector a long time. ' +
      'Strength: fortress-class armor, long-range standoff capability. Weakness: ' +
      'lumbering in close quarters, easy to outrun.';

    this.speedMax     = BASE_SPEED        * SPEED_MULT * SPEED_FACTOR;
    this.acceleration = BASE_ACCELERATION * ACCEL_MULT * SPEED_FACTOR;
    this.turnRate     = BASE_TURN_RATE    * TURN_MULT  * SPEED_FACTOR;

    this.hullMax     = BASE_HULL * HULL_MULT;
    this.hullCurrent = this.hullMax;

    this._initArmorArcs(ARMOR_FRONT, ARMOR_SIDE, ARMOR_AFT);

    this.moduleSlots = [new CannonModule(), new RocketPodModule('large', 'heat'), null, null];
    this._applyModules();
  }
}

export function createSalvageMothership(x, y) {
  return new SalvageMothership(x, y);
}
