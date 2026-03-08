// =============================================================================
// WAYFARER — BASE STATS
// These are the reference values for a "standard" entity.
// Each ship/weapon defines multipliers relative to these.
// Raise SPEED_FACTOR / PROJECTILE_SPEED_FACTOR to shift overall game pacing.
// =============================================================================

// --- Global tuning knobs ---
export const SPEED_FACTOR = 1.2;
export const PROJECTILE_SPEED_FACTOR = 1.2;

// --- Ship movement base ---
export const BASE_SPEED = 70;   // world-units/sec at full throttle
export const BASE_ACCELERATION = 9;    // world-units/sec²
export const BASE_TURN_RATE = 0.55; // radians/sec

// --- Ship health base ---
export const BASE_HULL = 200;  // hit points
export const BASE_ARMOR = 100;  // per arc (front/port/dstarboard/aft)

// --- Ship economy base ---
export const BASE_CARGO = 50;   // cargo units
export const BASE_FUEL_MAX = 100;        // ship fuel tank capacity (world units)
export const BASE_FUEL_EFFICIENCY = 1.0; // drain rate multiplier (lower = more efficient)

// --- Weapon base ---
export const BASE_PROJECTILE_SPEED = 200;  // world-units/sec
export const BASE_WEAPON_RANGE = 1500; // world-units
export const BASE_DAMAGE = 17;         // armor damage per hit
export const BASE_HULL_DAMAGE = 10;    // hull bleed per hit (after armor)
export const BASE_COOLDOWN = 1.0;      // seconds between shots (standard single-shot weapon)

// --- Fuel & economy ---
export const DEFAULT_SCRAP = 20;
export const DEFAULT_FUEL = 100;
export const DEFAULT_FUEL_MAX = 100;
// Fuel drain per throttle level (index 0 = idle, index 5 = full boost)
export const FUEL_RATES = [0, 0, 0.1, 0.2, 0.5, 1];

// --- Field repair ---
export const REPAIR_RATE = 1.5;  // armor points restored per second
export const REPAIR_COST_PER_PT = 1;   // scrap cost per armor point

// --- Neutral AI tuning ---
export const NEUTRAL_AI = {
  TRADER_ARRIVE_RADIUS:     120,
  TRADER_SLOW_RADIUS:       400,
  TRADER_WAIT_MIN:          5,
  TRADER_WAIT_MAX:          8,
  TRADER_TRAVEL_THROTTLE:   3,
  TRADER_APPROACH_THROTTLE: 1,
};

// --- Raider AI distances (world-space, absolute — shared by all raiders) ---
export const RAIDER_AI = {
  AGGRO_RANGE: 1400,
  DEAGGRO_RANGE: 2000,
  FIRE_RANGE: 800,
  ORBIT_RADIUS: 550,
  KITE_RANGE: 750,
  PATROL_RADIUS: 300,
  FLEE_HULL_RATIO: 0.3,
  STANDOFF_RANGE: 1200,       // preferred engagement distance for standoff behavior
  STANDOFF_FIRE_RANGE: 1400,  // max range at which standoff ships fire
};
