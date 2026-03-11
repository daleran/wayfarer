// =============================================================================
// WAYFARER — SHIP TUNING
// Movement, health, cargo, fuel, throttle, and spawn constants.
// =============================================================================

// --- Global tuning knobs ---
export const SPEED_FACTOR = 1.4;

// --- Ship movement base ---
export const BASE_SPEED        = 70;   // world-units/sec at full throttle
export const BASE_ACCELERATION = 9;    // world-units/sec²
export const BASE_TURN_RATE    = 0.55; // radians/sec

// --- Ship health base ---
export const BASE_HULL  = 200;  // hit points
export const BASE_ARMOR = 100;  // per arc (front/port/starboard/aft)

// --- Ship economy base ---
export const BASE_CARGO          = 50;   // cargo units
export const BASE_FUEL_MAX       = 100;  // ship fuel tank capacity (world units)
export const BASE_FUEL_EFFICIENCY = 1.0; // drain rate multiplier (lower = more efficient)

// --- Throttle (shared by all ships via Ship base class) ---
export const THROTTLE_LEVELS = 6;
export const THROTTLE_RATIOS = [0, 0.15, 0.35, 0.55, 0.8, 1.5];

// --- Spawn radii (used in GameManager.init()) ---
export const SPAWN = {
  RAIDER_RADIUS: { MIN: 150, MAX: 200 },
  LURKER_RADIUS: { MIN:  60, MAX:  80 },
};
