// =============================================================================
// WAYFARER — WEAPON TUNING
// Projectile, damage, cooldown, magazine, reload, and breach constants.
// =============================================================================

// --- Global tuning knob ---
export const PROJECTILE_SPEED_FACTOR = 1.4;

// --- Weapon base ---
export const BASE_PROJECTILE_SPEED = 200;  // world-units/sec
export const BASE_WEAPON_RANGE     = 1400; // world-units
export const BASE_DAMAGE           = 19;   // armor damage per hit
export const BASE_HULL_DAMAGE      = 12;   // hull bleed per hit (after armor)
export const BASE_COOLDOWN         = 0.9;  // seconds between shots (standard single-shot weapon)

// --- Magazine & reload ---
export const AUTOCANNON_MAG_SIZE    = 60;   // rounds per magazine
export const AUTOCANNON_RELOAD_TIME = 10.0; // seconds to reload a full magazine
export const CANNON_MAG_SIZE        = 4;    // shells per magazine
export const CANNON_RELOAD_TIME     = 14.0; // seconds to reload
export const GATLING_MAG_SIZE       = 200;  // rounds per belt
export const GATLING_RELOAD_TIME    = 8.0;  // seconds to reload belt
export const ROCKET_MAG_SIZE        = 2;    // rockets in launcher (2 tubes)
export const ROCKET_RELOAD_TIME     = 13.0; // seconds to reload both tubes

// --- Weapon AoE blast radii ---
export const HE_AUTOCANNON_BLAST = 60;  // HE autocannon blast radius (world units)
export const HE_CANNON_BLAST     = 150; // HE cannon blast radius (world units)

// --- Hull breach: module damage on hull hit ---
// Tiered chance per hit that deals hull damage while hull is below threshold.
export const MODULE_BREACH_HULL_THRESHOLD = 0.60;
export const MODULE_BREACH_CHANCE_LOW     = 0.12;  // hull 30–60%
export const MODULE_BREACH_CHANCE_MID     = 0.25;  // hull 10–30%
export const MODULE_BREACH_CHANCE_HIGH    = 0.40;  // hull < 10%
