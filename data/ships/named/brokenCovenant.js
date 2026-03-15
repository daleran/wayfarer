// Broken Covenant — named derelict (Garrison-class frigate).

import { createDerelict } from '@/entities/registry.js';
import { registerContent } from '@data/dataRegistry.js';

export const BrokenCovenant = {
  name: 'Broken Covenant',
  shipClass: 'garrison-frigate',
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

registerContent('derelicts', 'broken-covenant', BrokenCovenant);
