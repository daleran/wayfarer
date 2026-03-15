// Pale Witness — named derelict (G100-class hauler, running dark).

import { createDerelict } from '@/entities/registry.js';
import { registerContent } from '@data/dataRegistry.js';

export const PaleWitness = {
  name: 'Pale Witness',
  derelictClass: 'hauler',
  salvageTime: 3,
  lore: `PALE WITNESS — G100-class hauler, running dark below Pale.
No distress signal. No survivors recovered.
Scanner array still drawing power from backup cells.`,

  instantiate(x, y) {
    return createDerelict({
      ...this, x, y,
      loreText: this.lore.split('\n'),
    });
  },
};

registerContent('derelicts', 'pale-witness', PaleWitness);
