// Cold Remnant — named derelict (Maverick-class courier, combat-modified).

import { createDerelict } from '@/world/derelict.js';

export const ColdRemnant = {
  name: 'Cold Remnant',
  derelictClass: 'fighter',
  salvageTime: 4,
  lootTable: [
    { type: 'scrap',    amount: 30 },
    { type: 'weaponId', id: 'Autocannon' },
    { type: 'ammo',     ammoType: '25mm-ap', amount: 30 },
  ],
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
