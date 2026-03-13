import { G100ClassHauler } from '@/ships/classes/g100Hauler.js';
import { AutocannonModule, LanceModuleSmall, OnyxDriveUnit } from '@/modules/shipModule.js';
import { AI_TEMPLATES } from '@data/compiledData.js';

export class ArmedHauler extends G100ClassHauler {
  constructor(x, y) {
    super(x, y);

    this.faction     = 'scavenger';
    this.relation    = 'hostile';
    this.shipType    = 'armed-hauler';
    this.displayName = 'Armed Hauler';
    this.ai          = { ...AI_TEMPLATES.kiter };

    this.flavorText =
      'A G100 hauler with the cargo bays gutted and armor plate welded over ' +
      'everything. What was once a trade vessel became a mobile fire platform. ' +
      'Scavenger conversion work — ugly, functional, surprisingly hard to kill. ' +
      'Strength: heavy armor in all arcs, kites well at range with lance and ' +
      'autocannon. Weakness: slow, predictable movement pattern.';

    this.moduleSlots = [new OnyxDriveUnit(), new AutocannonModule(), new LanceModuleSmall(), null];
    this._applyModules();
  }
}

export function createArmedHauler(x, y) {
  return new ArmedHauler(x, y);
}
