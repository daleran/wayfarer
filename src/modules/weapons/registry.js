// Weapon registry — resolves weapon ID strings via CONTENT.weapons.
// Used by SalvageSystem, loot tables, and the designer.

import { CONTENT } from '@data/index.js';

export function createWeaponById(id) {
  const entry = CONTENT.weapons[id];
  return entry ? entry.create() : null;
}
