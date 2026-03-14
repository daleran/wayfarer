// =============================================================================
// WAYFARER — Global Tuning Constants
// Scalar config knobs — not content. Edit values directly.
// =============================================================================

// ─── Ship Base Constants ──────────────────────────────────────────────────────
export const SPEED_FACTOR = 1.4;
export const BASE_SPEED = 70;
export const BASE_ACCELERATION = 9;
export const BASE_TURN_RATE = 0.55;
export const BASE_HULL = 200;
export const BASE_ARMOR = 100;
export const BASE_CARGO = 50;
export const BASE_FUEL_MAX = 100;
export const BASE_FUEL_EFFICIENCY = 1;
export const BASE_HULL_WEIGHT = 1000;
export const FUEL_WEIGHT_PER_UNIT = 0.5;
export const TW_ACCEL_SENSITIVITY = 1.4;
export const TW_SPEED_SENSITIVITY = 0.6;
export const TW_TURN_SENSITIVITY = 0.3;
export const TW_MULT_MIN = 0.15;
export const TW_MULT_MAX = 2;
export const THROTTLE_LEVELS = 6;
export const THROTTLE_RATIOS = [0, 0.15, 0.35, 0.55, 0.8, 1.5];
export const SLOT_CARGO_SMALL = 40;
export const SLOT_CARGO_LARGE = 120;
export const CARGO_EXPANSION_MULT = 2;
export const REFERENCE_TW = 1;
export const SPAWN = {
  ENEMY_RADIUS: {
    MIN: 150,
    MAX: 200,
  },
  LURKER_RADIUS: {
    MIN: 60,
    MAX: 80,
  },
};

// ─── Weapon Base Constants ────────────────────────────────────────────────────
export const PROJECTILE_SPEED_FACTOR = 1.4;
export const BASE_PROJECTILE_SPEED = 200;
export const BASE_WEAPON_RANGE = 1400;
export const BASE_DAMAGE = 19;
export const BASE_HULL_DAMAGE = 12;
export const BASE_COOLDOWN = 0.9;
export const AUTOCANNON_MAG_SIZE = 60;
export const AUTOCANNON_RELOAD_TIME = 10;
export const CANNON_MAG_SIZE = 4;
export const CANNON_RELOAD_TIME = 14;
export const GATLING_MAG_SIZE = 200;
export const GATLING_RELOAD_TIME = 8;
export const ROCKET_MAG_SIZE = 2;
export const ROCKET_RELOAD_TIME = 13;
export const HE_AUTOCANNON_BLAST = 60;
export const HE_CANNON_BLAST = 150;
export const MODULE_BREACH_HULL_THRESHOLD = 0.6;
export const MODULE_BREACH_CHANCE_LOW = 0.12;
export const MODULE_BREACH_CHANCE_MID = 0.25;
export const MODULE_BREACH_CHANCE_HIGH = 0.4;

// ─── Economy Constants ───────────────────────────────────────────────────────
export const DEFAULT_SCRAP = 20;
export const FUEL_RATES = [0, 0, 0.1, 0.2, 0.5, 1];
export const REPAIR_RATE = 1.5;
export const REPAIR_COST_PER_PT = 1;
export const MODULE_REPAIR_RATE = 0.25;
export const MODULE_REPAIR_COST = 15;
export const SALVAGE_EFFICIENCY = 0.5;
export const SALVAGE_FUEL_RATE = 0.25;
export const SALVAGE_AMMO_RATE = 0.25;
export const SCRAP_MASS = 0.1;
export const HULL_REPAIR_RATE = 0.5;
export const HULL_REPAIR_COST = 3;
export const BOUNTY = {
  EXPIRY_WARNING_SECS: 60,
};

// ─── Reputation Constants ────────────────────────────────────────────────────
export const REPUTATION = {
  KILL_PENALTY: -10,
  RIVAL_BONUS: 5,
  BOUNTY_BONUS: 20,
  ATTACK_NEUTRAL_PENALTY: -25,
  HOSTILE_THRESHOLD: -50,
  ALLIED_THRESHOLD: 50,
  DISCOUNT_RATE: 0.15,
};
