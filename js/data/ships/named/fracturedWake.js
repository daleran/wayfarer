// Fractured Wake — named derelict (Garrison-class frigate, hull split).

import { createDerelict } from '@/world/derelict.js';

export const FracturedWake = {
  name: 'Fractured Wake',
  derelictClass: 'frigate',
  salvageTime: 5,
  lore: `FRACTURED WAKE — Garrison-class frigate, hull split at midship.
Salvage Lords contract vessel, overloaded on exit run.
Heavy ordnance still aboard. Handle with care.`,

  instantiate(x, y) {
    return createDerelict({
      ...this, x, y,
      loreText: this.lore.split('\n'),
    });
  },
};
