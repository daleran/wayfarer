import { GarrisonFrigate } from '../../ships/classes/garrisonFrigate.js';
import { CannonModule, RocketPodModule } from '../../modules/shipModule.js';
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

    this._initStats({
      speed: SPEED_MULT, accel: ACCEL_MULT, turn: TURN_MULT,
      hull: HULL_MULT, armorFront: ARMOR_FRONT, armorSide: ARMOR_SIDE, armorAft: ARMOR_AFT,
    });

    this.moduleSlots = [new CannonModule(), new RocketPodModule('large', 'heat'), null, null];
    this._applyModules();
  }
}

export function createSalvageMothership(x, y) {
  return new SalvageMothership(x, y);
}
