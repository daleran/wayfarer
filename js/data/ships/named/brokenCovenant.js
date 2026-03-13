// Broken Covenant — named derelict (Garrison-class frigate).

import { createDerelict } from '@/world/derelict.js';

export const BrokenCovenant = {
  name: 'Broken Covenant',
  derelictClass: 'frigate',
  salvageTime: 5,
  lootTable: [
    { type: 'scrap',    amount: 35 },
    { type: 'fuel',     amount: 20 },
    { type: 'moduleId', id: 'SmallFissionReactor', condition: 'faulty' },
    { type: 'ammo',     ammoType: '25mm-ap', amount: 20 },
  ],
  lore: `BROKEN COVENANT — Garrison-class frigate, registry struck.
Concord Remnant designation. Last port: Ashveil, 14 cycles ago.
Drive section intact. Reactor: unsecured.`,

  instantiate(x, y) {
    return createDerelict({
      ...this, x, y,
      loreText: this.lore.split('\n'),
    });
  },
};
