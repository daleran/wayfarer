import { CompactHauler } from '@/ships/classes/compactHauler.js';
import { OnyxDriveUnit } from '@/modules/shipModule.js';
import { AI_TEMPLATES } from '@data/compiledData.js';

const SPEED_MULT = 0.55;  // ~46 u/s — slow trading hauler
const ACCEL_MULT = 0.75;
const TURN_MULT  = 0.7;
const HULL_MULT  = 0.9;   // 180 hp — lightly built

const ARMOR_FRONT = 1.0;
const ARMOR_SIDE  = 1.0;
const ARMOR_AFT   = 1.0;

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

    this._initStats({
      speed: SPEED_MULT, accel: ACCEL_MULT, turn: TURN_MULT,
      hull: HULL_MULT, armorFront: ARMOR_FRONT, armorSide: ARMOR_SIDE, armorAft: ARMOR_AFT,
    });

    this.moduleSlots = [new OnyxDriveUnit()];
    this._applyModules();
  }
}

export function createTraderConvoy(x, y) {
  return new TraderConvoy(x, y);
}
