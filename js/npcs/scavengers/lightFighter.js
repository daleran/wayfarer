import { MaverickCourier } from '@/ships/classes/maverickCourier.js';
import { AutocannonModule, OnyxDriveUnit } from '@/modules/shipModule.js';
import { AI_TEMPLATES } from '@data/compiledData.js';

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

    this.moduleSlots = [new OnyxDriveUnit(), new AutocannonModule(), null];
    this._applyModules();
  }
}

export function createLightFighter(x, y) {
  return new LightFighter(x, y);
}
