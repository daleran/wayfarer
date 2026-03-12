import { GarrisonFrigate } from '../../ships/classes/garrisonFrigate.js';
import { AI_TEMPLATES } from '../../data/tuning/aiTuning.js';

const SPEED_MULT = 0.5;   // ~42 u/s — steady patrol speed
const ACCEL_MULT = 0.6;
const TURN_MULT  = 0.6;
const HULL_MULT  = 2.0;   // 400 hp — reinforced patrol vessel

const ARMOR_FRONT = 2.5;
const ARMOR_SIDE  = 2.0;
const ARMOR_AFT   = 1.5;

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

    this._initStats({
      speed: SPEED_MULT, accel: ACCEL_MULT, turn: TURN_MULT,
      hull: HULL_MULT, armorFront: ARMOR_FRONT, armorSide: ARMOR_SIDE, armorAft: ARMOR_AFT,
    });
  }
}

export function createMilitiaPatrol(x, y) {
  return new MilitiaPatrol(x, y);
}
