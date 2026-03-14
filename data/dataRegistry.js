// =============================================================================
// WAYFARER — Data Registry
// Mutable content tables — filled by data files at import time.
// =============================================================================

export const SHIP_CLASSES = {};
export const NPC_SHIPS = {};
export const ENGINES = {};
export const REACTORS = {};
export const SENSORS = {};
export const WEAPONS = {};
export const UTILITIES = {};
export const AI_TEMPLATES = {};
export const AMMO = {};

/** Register entries into a table. */
export function registerData(table, entries) {
  Object.assign(table, entries);
}
