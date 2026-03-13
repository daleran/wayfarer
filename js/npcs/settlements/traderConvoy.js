import { CompactHauler } from '@/ships/classes/compactHauler.js';
import { OnyxDriveUnit } from '@/modules/shipModule.js';
import { AI_TEMPLATES } from '@data/compiledData.js';

export class TraderConvoy extends CompactHauler {
  constructor(x, y) {
    super(x, y);

    this.faction  = 'neutral';
    this.relation = 'neutral';
    this.shipType = 'trader-convoy';
    this.ai       = { ...AI_TEMPLATES.trader };

    this.flavorText =
      'A G100 hauler on a regular trade run — lightly crewed, unarmed or barely ' +
      'armed, carrying whatever the stations need. The backbone of inter-settlement ' +
      'commerce in the Gravewake. Strength: runs a predictable route, carries goods ' +
      'worth trading for. Weakness: no real combat ability; relies entirely on route ' +
      'security or fast negotiation to avoid trouble.';

    this.moduleSlots = [new OnyxDriveUnit()];
    this._applyModules();
  }
}

export function createTraderConvoy(x, y) {
  return new TraderConvoy(x, y);
}
