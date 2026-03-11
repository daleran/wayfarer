// Data-driven loot tables for enemy drops and derelict salvage.
// Each table defines chance, min/max or pool for each drop type.
// generateEnemyLoot() in lootDrop.js reads from these tables.
// To add a new loot type or adjust probabilities, edit only this file.

export const LOOT_TABLES = {
  'scavenger-default': {
    scrap:     { chance: 1.00, min: 4,  max: 12 },
    fuel:      { chance: 0.30, min: 5,  max: 15 },
    module:    { chance: 0.10, pool: ['SalvagedSensorSuite'] },
    commodity: {
      chance: 0.25,
      pool: { raw_ore: 0.30, machine_parts: 0.20, weapons_cache: 0.20, hull_plating: 0.15, electronics: 0.10, ration_packs: 0.05 },
    },
  },

  // ─── Derelict tables ──────────────────────────────────────────────────────
  // These are used by _completeSalvage via derelict.lootTableId

  'derelict-hauler': {
    // Old cargo hauler — fuel, commodities, some ammo
    scrap:     { chance: 1.00, min: 20, max: 40 },
    fuel:      { chance: 0.70, min: 10, max: 25 },
    ammo:      { chance: 0.30, pool: ['autocannon', 'rocket'], min: 60, max: 120 },
    module:    { chance: 0.15, pool: ['HydrogenFuelCell', 'SalvagedSensorSuite'] },
    commodity: {
      chance: 0.60,
      pool: { raw_ore: 0.30, ration_packs: 0.25, recycled_polymer: 0.20, alloys: 0.15, machine_parts: 0.10 },
    },
  },

  'derelict-fighter': {
    // Combat wreck — weapons and ammo, light cargo
    scrap:     { chance: 1.00, min: 15, max: 30 },
    fuel:      { chance: 0.25, min: 5,  max: 15 },
    weapon:    { chance: 0.30, pool: ['Autocannon', 'LanceSmall'] },
    ammo:      { chance: 0.60, pool: ['autocannon', 'rocket'], min: 80, max: 180 },
    module:    { chance: 0.10, pool: ['SalvagedSensorSuite', 'StandardSensorSuite'] },
  },

  'derelict-frigate': {
    // Heavy wreck — reactors, heavy weapons, mixed cargo
    scrap:     { chance: 1.00, min: 30, max: 60 },
    fuel:      { chance: 0.40, min: 10, max: 20 },
    weapon:    { chance: 0.25, pool: ['Cannon'] },
    ammo:      { chance: 0.50, pool: ['cannon', 'rocket', 'gatling'], min: 2, max: 8 },
    module:    { chance: 0.35, pool: ['SmallFissionReactor', 'HydrogenFuelCell', 'CombatComputer'] },
    commodity: {
      chance: 0.30,
      pool: { hull_plating: 0.25, electronics: 0.25, medical_supplies: 0.20, nav_charts: 0.15, reactor_fuel: 0.15 },
    },
  },

  'derelict-unknown': {
    // Anomalous wreck — exotic finds, rare modules, little fuel
    scrap:     { chance: 1.00, min: 25, max: 50 },
    fuel:      { chance: 0.20, min: 5,  max: 10 },
    module:    { chance: 0.45, pool: ['LargeFusionReactor', 'SalvageScanner', 'LongRangeScanner', 'CombatComputer'] },
    commodity: {
      chance: 0.50,
      pool: { void_crystals: 0.50, data_cores: 0.25, contraband: 0.15, nav_charts: 0.10 },
    },
  },
};

export const DEFAULT_LOOT_TABLE = 'scavenger-default';

// Condition distribution tables per derelict class.
// Used by game._rollCondition(derelictClass).
export const CONDITION_DISTRIBUTIONS = {
  hauler:  { worn: 0.50, faulty: 0.35, damaged: 0.15 },
  fighter: { worn: 0.40, faulty: 0.40, damaged: 0.20 },
  frigate: { good: 0.20, worn: 0.40, faulty: 0.30, damaged: 0.10 },
  unknown: { worn: 0.30, faulty: 0.30, damaged: 0.30, destroyed: 0.10 },
};
