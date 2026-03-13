// Hollow March — named derelict (unknown hull class, Pre-Collapse).

import { createDerelict } from '@/world/derelict.js';

export const HollowMarch = {
  name: 'Hollow March',
  derelictClass: 'unknown',
  salvageTime: 6,
  lootTable: [
    { type: 'scrap',        amount: 50 },
    { type: 'void_crystals', amount: 2 },
    { type: 'moduleId',     id: 'LargeFusionReactor', condition: 'damaged' },
  ],
  lore: `HOLLOW MARCH — hull class unidentified. Pre-Collapse origin suspected.
No registry. No crew manifest. Power signature: anomalous.
Approach with caution. Contents: unknown.`,

  instantiate(x, y) {
    return createDerelict({
      ...this, x, y,
      loreText: this.lore.split('\n'),
    });
  },
};
