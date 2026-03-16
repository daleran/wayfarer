// Hollow March — named derelict (unknown hull class, Pre-Collapse).

import { createDerelict } from '@/entities/registry.js';
import { registerContent } from '@data/dataRegistry.js';

export const HollowMarch = {
  name: 'Hollow March',
  shipClass: 'onyx-tug',
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

registerContent('derelicts', 'hollow-march', HollowMarch);
