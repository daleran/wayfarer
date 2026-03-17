// Gutted Pioneer — named derelict (G100-class hauler).

import { createDerelict } from '@/entities/registry.js';
import { registerContent } from '@data/dataRegistry.js';

export const GuttedPioneer = {
  name: 'Gutted Pioneer',
  shipClass: 'g100-hauler',
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

registerContent('derelicts', 'gutted-pioneer', GuttedPioneer);
