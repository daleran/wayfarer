// =============================================================================
// WAYFARER — BASE STATS
// These are the reference values for a "standard" entity.
// Each ship/weapon defines multipliers relative to these.
// Raise SPEED_FACTOR / PROJECTILE_SPEED_FACTOR to shift overall game pacing.
// =============================================================================

// --- Global tuning knobs ---
export const SPEED_FACTOR = 1.4;
export const PROJECTILE_SPEED_FACTOR = 1.4;

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
export const BASE_WEAPON_RANGE = 1400; // world-units
export const BASE_DAMAGE = 19;         // armor damage per hit
export const BASE_HULL_DAMAGE = 12;    // hull bleed per hit (after armor)
export const BASE_COOLDOWN = 0.9;      // seconds between shots (standard single-shot weapon)

// --- Magazine & reload ---
export const AUTOCANNON_MAG_SIZE    = 60;   // rounds per magazine
export const AUTOCANNON_RELOAD_TIME = 10.0; // seconds to reload a full magazine
export const ROCKET_MAG_SIZE        = 2;    // rockets in launcher (2 tubes)
export const ROCKET_RELOAD_TIME     = 13.0; // seconds to reload both tubes

// --- Fuel & economy ---
export const DEFAULT_SCRAP = 20;
export const DEFAULT_FUEL = 100;
export const DEFAULT_FUEL_MAX = 100;
// Fuel drain per throttle level (index 0 = idle, index 5 = full boost)
export const FUEL_RATES = [0, 0, 0.1, 0.2, 0.5, 1];

// --- Field repair ---
export const REPAIR_RATE = 1.5;  // armor points restored per second
export const REPAIR_COST_PER_PT = 1;   // scrap cost per armor point

// --- Field module repair ---
export const MODULE_REPAIR_RATE = 0.25;  // condition steps per second (1 step per 4 sec)
export const MODULE_REPAIR_COST = 15;    // scrap per condition step

// --- Hull breach: module damage on hull hit ---
// Tiered chance per hit that deals hull damage while hull is below threshold.
export const MODULE_BREACH_HULL_THRESHOLD = 0.60;
export const MODULE_BREACH_CHANCE_LOW  = 0.12;  // hull 30–60%
export const MODULE_BREACH_CHANCE_MID  = 0.25;  // hull 10–30%
export const MODULE_BREACH_CHANCE_HIGH = 0.40;  // hull < 10%

// --- Throttle (shared by all ships via Ship base class) ---
export const THROTTLE_LEVELS = 6;
export const THROTTLE_RATIOS = [0, 0.15, 0.35, 0.55, 0.8, 1.5];

// --- Spawn radii (used in GameManager.init()) ---
export const SPAWN = {
  RAIDER_RADIUS: { MIN: 150, MAX: 200 },
  LURKER_RADIUS: { MIN:  60, MAX:  80 },
};

// --- Neutral AI tuning ---
export const NEUTRAL_AI = {
  TRADER_ARRIVE_RADIUS: 120,
  TRADER_SLOW_RADIUS: 400,
  TRADER_WAIT_MIN: 5,
  TRADER_WAIT_MAX: 8,
  TRADER_TRAVEL_THROTTLE: 3,
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
  LURKER_SCAN_RANGE: 700,             // radius within which lurkers scan for trader targets
  LURKER_HIDE_RADIUS: 150,            // how close to cover point before lurker considers itself hidden
  STALKER_AFT_DISTANCE: 300,          // aft offset for stalker behavior
  INTERCEPTOR_AFT_DISTANCE: 350,      // aft offset for interceptor behavior
  ORBIT_HOLD_THRESHOLD: 80,           // distance below which ship holds orbit throttle
  AIM_TOLERANCE: 0.4,                 // max off-axis angle (radians) to fire in stalker mode
};

export const BOUNTY = {
  EXPIRY_WARNING_SECS: 60,  // timer flashes RED below this
};

export const REPUTATION = {
  KILL_PENALTY:          -10,
  RIVAL_BONUS:             5,
  BOUNTY_BONUS:           20,
  ATTACK_NEUTRAL_PENALTY:-25,
  HOSTILE_THRESHOLD:     -50,   // docking refused
  ALLIED_THRESHOLD:       50,   // services discounted
  DISCOUNT_RATE:          0.15, // 15% off when Allied
};

// --- Engine module stats ---
// speedMult / accelMult: multipliers on ship's base speed & acceleration
// fuelEffMult: multiplies ship.fuelEfficiency (higher = more throttle fuel burned)
export const ENGINE_CHEM_S_SPEED_MULT     = 1.4;
export const ENGINE_CHEM_S_ACCEL_MULT     = 1.65;
export const ENGINE_CHEM_S_FUEL_EFF_MULT  = 3.5;
export const ENGINE_CHEM_S_POWER_DRAW     = 2;

export const ENGINE_CHEM_L_SPEED_MULT     = 1.8;
export const ENGINE_CHEM_L_ACCEL_MULT     = 2.3;
export const ENGINE_CHEM_L_FUEL_EFF_MULT  = 5.5;
export const ENGINE_CHEM_L_POWER_DRAW     = 3;

export const ENGINE_MAGPLASMA_S_SPEED_MULT    = 1.10;
export const ENGINE_MAGPLASMA_S_ACCEL_MULT    = 1.15;
export const ENGINE_MAGPLASMA_S_FUEL_EFF_MULT = 1.3;
export const ENGINE_MAGPLASMA_S_FUEL_DRAIN    = 0.010; // constant plasma draw
export const ENGINE_MAGPLASMA_S_POWER_DRAW    = 40;

export const ENGINE_MAGPLASMA_L_SPEED_MULT    = 1.25;
export const ENGINE_MAGPLASMA_L_ACCEL_MULT    = 1.35;
export const ENGINE_MAGPLASMA_L_FUEL_EFF_MULT = 1.6;
export const ENGINE_MAGPLASMA_L_FUEL_DRAIN    = 0.020;
export const ENGINE_MAGPLASMA_L_POWER_DRAW    = 80;

export const ENGINE_ION_SPEED_MULT    = 0.65;
export const ENGINE_ION_ACCEL_MULT    = 0.12;  // abysmal acceleration
export const ENGINE_ION_FUEL_EFF_MULT = 0.05;  // nearly no throttle fuel burn
export const ENGINE_ION_FUEL_DRAIN    = 0.002; // trace idle drain
export const ENGINE_ION_POWER_DRAW    = 120;   // heavy electrical draw

// --- Fission reactor maintenance ---
export const REACTOR_SMALL_FISSION_INTERVAL  = 10800; // 3 in-game hours before overhaul needed
export const REACTOR_LARGE_FISSION_INTERVAL  = 14400; // 4 in-game hours before overhaul needed
export const REACTOR_SMALL_FISSION_OVERHAUL_COST = 800;  // scrap
export const REACTOR_LARGE_FISSION_OVERHAUL_COST = 1500; // scrap
export const REACTOR_FISSION_DEGRADED_OUTPUT = 0.6; // power output multiplier when overdue
