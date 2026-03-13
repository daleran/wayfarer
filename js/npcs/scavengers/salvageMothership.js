import { GarrisonFrigate } from '@/ships/classes/garrisonFrigate.js';
import { CannonModule, RocketPodModule, OnyxDriveUnit } from '@/modules/shipModule.js';
import { AI_TEMPLATES } from '@data/compiledData.js';

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

    this.moduleSlots = [new OnyxDriveUnit(), new CannonModule(), new RocketPodModule('large', 'heat'), null, null];
    this._applyModules();
  }
}

export function createSalvageMothership(x, y) {
  return new SalvageMothership(x, y);
}
