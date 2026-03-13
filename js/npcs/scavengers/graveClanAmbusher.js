import { MaverickCourier } from '@/ships/classes/maverickCourier.js';
import { AutocannonModule, RocketPodModule, OnyxDriveUnit } from '@/modules/shipModule.js';
import { AI_TEMPLATES } from '@data/compiledData.js';

export class GraveClanAmbusher extends MaverickCourier {
  constructor(x, y) {
    super(x, y);

    this.faction     = 'scavenger';
    this.relation    = 'hostile';
    this.shipType    = 'grave-clan-ambusher';
    this.ai          = { ...AI_TEMPLATES.lurker };

    this.flavorText =
      'A Maverick Courier fielded by Grave-Clan cells — the most patient killers in the ' +
      'Gravewake. They pick a spar or debris shadow and wait. When a convoy moves through ' +
      'they commit hard: autocannon for armor, a heat missile to finish it. ' +
      'They know the trade lanes the way scavengers know wreckage. ' +
      'Strength: ambush timing, missile punch, high speed. ' +
      'Weakness: fragile hull, commits fully when it attacks — no fallback plan.';

    this.moduleSlots = [new OnyxDriveUnit(), new AutocannonModule(), new RocketPodModule('small', 'ht')];
    this._applyModules();
  }
}

export function createGraveClanAmbusher(x, y) {
  return new GraveClanAmbusher(x, y);
}
