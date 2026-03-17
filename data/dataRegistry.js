// =============================================================================
// WAYFARER — Data Registry
// Mutable content tables — filled by data files at import time.
// Two registration helpers:
//   registerData(table, entries)     — bulk-assign into a named table
//   registerContent(type, id, entry) — single entry into CONTENT sub-table
// =============================================================================

// ── Equipment & stat tables ─────────────────────────────────────────────────
export const SHIP_CLASSES = {};
export const ENGINES = {};
export const REACTORS = {};
export const SENSORS = {};
export const WEAPONS = {};
export const UTILITIES = {};
export const AI_TEMPLATES = {};
export const AMMO = {};
export const CHARACTERS = {};

/** Register entries into a table. */
export function registerData(table, entries) {
  Object.assign(table, entries);
}

// ── Content tables (self-registration target) ───────────────────────────────
export const CONTENT = {
  hulls: {},          // id → { label, create(x,y) }
  ships: {},          // id → { shipClass, modules, name, flavorText, unmanned?, faction?, ... }
  conversations: {},  // id → async function(ctx)
  derelicts: {},      // id → { ...data, instantiate(x,y) }
  terrain: {},        // id → { ...data, instantiate(x,y) }
  characters: {},     // id → { name, faction, behavior, shipId, bounty?, flavorText? }
  modules: {},        // id → { category, create() }
  weapons: {},        // id → { create(), slug, label, flavorText, projColor, ... }
  locations: {},      // id → { id, locationType, name, flavorText, entity?, backgroundData? }
  history: {},        // id → { date, text, related?, tags? }
  factions: {},       // id → { name, parent?, relationships?, defaultReputation? }
};

/** Register a content entry into the appropriate CONTENT sub-table. */
export function registerContent(type, id, entry) {
  CONTENT[type][id] = entry;
}

/** Return all location entries of a given locationType. */
export function getLocationsByType(locationType) {
  return Object.fromEntries(
    Object.entries(CONTENT.locations).filter(([, loc]) => loc.locationType === locationType)
  );
}
