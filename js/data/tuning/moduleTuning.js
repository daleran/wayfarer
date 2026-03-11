// =============================================================================
// WAYFARER — MODULE TUNING
// Engine and reactor module stat constants.
// =============================================================================

// --- Engine module stats ---
// speedMult / accelMult: multipliers on ship's base speed & acceleration
// fuelEffMult: multiplies ship.fuelEfficiency (higher = more throttle fuel burned)

export const ENGINE_CHEM_S_SPEED_MULT    = 1.4;
export const ENGINE_CHEM_S_ACCEL_MULT    = 1.65;
export const ENGINE_CHEM_S_FUEL_EFF_MULT = 3.5;
export const ENGINE_CHEM_S_POWER_DRAW    = 2;

export const ENGINE_CHEM_L_SPEED_MULT    = 1.8;
export const ENGINE_CHEM_L_ACCEL_MULT    = 2.3;
export const ENGINE_CHEM_L_FUEL_EFF_MULT = 5.5;
export const ENGINE_CHEM_L_POWER_DRAW    = 3;

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
export const REACTOR_SMALL_FISSION_INTERVAL      = 10800; // 3 in-game hours before overhaul needed
export const REACTOR_LARGE_FISSION_INTERVAL      = 14400; // 4 in-game hours before overhaul needed
export const REACTOR_SMALL_FISSION_OVERHAUL_COST = 800;   // scrap
export const REACTOR_LARGE_FISSION_OVERHAUL_COST = 1500;  // scrap
export const REACTOR_FISSION_DEGRADED_OUTPUT     = 0.6;   // power output multiplier when overdue
