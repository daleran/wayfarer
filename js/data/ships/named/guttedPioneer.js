// Gutted Pioneer — named derelict (G100-class hauler).

import { createDerelict } from '@/world/derelict.js';

export const GuttedPioneer = {
  name: 'Gutted Pioneer',
  derelictClass: 'hauler',
  salvageTime: 4,
  lootTable: [
    { type: 'scrap',    amount: 28 },
    { type: 'fuel',     amount: 15 },
    { type: 'moduleId', id: 'HydrogenFuelCell', condition: 'worn' },
    { type: 'ammo',     ammoType: 'rocket', amount: 3 },
  ],
  lore: `GUTTED PIONEER — G100-class hauler, cargo hold stripped.
Independent registry. Approached the Wall and did not clear it.
Fuel reserves partially intact. Drive: seized.`,

  instantiate(x, y) {
    return createDerelict({
      ...this, x, y,
      loreText: this.lore.split('\n'),
    });
  },
};
