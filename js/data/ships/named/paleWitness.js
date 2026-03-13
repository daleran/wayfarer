// Pale Witness — named derelict (G100-class hauler, running dark).

import { createDerelict } from '@/world/derelict.js';

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
