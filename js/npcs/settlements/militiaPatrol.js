import { GarrisonFrigate } from '@/ships/classes/garrisonFrigate.js';
import { OnyxDriveUnit } from '@/modules/shipModule.js';
import { AI_TEMPLATES } from '@data/compiledData.js';

export class MilitiaPatrol extends GarrisonFrigate {
  constructor(x, y) {
    super(x, y);

    this.faction  = 'neutral';
    this.relation = 'neutral';
    this.shipType = 'militia-patrol';
    this.ai       = { ...AI_TEMPLATES.militia };

    this.flavorText =
      'A settlement-operated Garrison-class Frigate running security on nearby approaches. ' +
      'Not as well-armed as the original spec, but better maintained than most ' +
      'scavenger conversions. Steady, professional, and territorial. Strength: ' +
      'heavy armor, commands respect on sight. Weakness: follows patrol routes ' +
      'predictably; slow response to anything outside its zone.';

    this.moduleSlots = [new OnyxDriveUnit()];
    this._applyModules();
  }
}

export function createMilitiaPatrol(x, y) {
  return new MilitiaPatrol(x, y);
}
