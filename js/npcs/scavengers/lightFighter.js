import { MaverickCourier } from '@/ships/classes/maverickCourier.js';
import { AutocannonModule, OnyxDriveUnit } from '@/modules/shipModule.js';
import { AI_TEMPLATES } from '@data/compiledData.js';

const SPEED_MULT = 1.55;  // ~130 u/s — fast; slightly slower than base runner for balance
const ACCEL_MULT = 1.4;
const TURN_MULT  = 1.45;
const HULL_MULT  = 0.45;  // ~90 hp — very fragile

// Armor arc multipliers — light, unprotected craft
const ARMOR_FRONT = 0.9;   //  90
const ARMOR_SIDE  = 0.7;   //  70
const ARMOR_AFT   = 0.6;   //  60

export class LightFighter extends MaverickCourier {
  constructor(x, y) {
    super(x, y);

    this.faction     = 'scavenger';
    this.relation    = 'hostile';
    this.shipType    = 'light-fighter';
    this.displayName = 'Light Fighter';
    this.ai          = { ...AI_TEMPLATES.stalker };

    this.flavorText =
      'A Maverick Courier stripped for aggression — autocannon bolted to the nose, ' +
      'everything non-essential jettisoned. Cheap to field, cheap to replace. ' +
      'Scavenger clans send them in packs to harass while heavier ships reposition. ' +
      'Strength: extreme speed, hard to pin down, evasive. Weakness: will ' +
      'disintegrate under sustained return fire. They know it and stay moving.';

    this._initStats({
      speed: SPEED_MULT, accel: ACCEL_MULT, turn: TURN_MULT,
      hull: HULL_MULT, armorFront: ARMOR_FRONT, armorSide: ARMOR_SIDE, armorAft: ARMOR_AFT,
    });

    this.moduleSlots = [new OnyxDriveUnit(), new AutocannonModule(), null];
    this._applyModules();
  }
}

export function createLightFighter(x, y) {
  return new LightFighter(x, y);
}
