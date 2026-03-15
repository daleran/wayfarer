// Cold Remnant — named derelict (Maverick-class courier, combat-modified).

import { createDerelict } from '@/entities/registry.js';
import { registerContent } from '@data/dataRegistry.js';

export const ColdRemnant = {
  name: 'Cold Remnant',
  derelictClass: 'fighter',
  salvageTime: 4,
  lore: `COLD REMNANT — Maverick-class courier, combat-modified.
Grave Clan markings, third kin. Killed over disputed salvage rights.
Hardpoint still attached. Ammunition cache in starboard locker.`,

  instantiate(x, y) {
    return createDerelict({
      ...this, x, y,
      loreText: this.lore.split('\n'),
    });
  },
};

registerContent('derelicts', 'cold-remnant', ColdRemnant);
