// =============================================================================
// WAYFARER — ECONOMY TUNING
// Scrap, fuel, repair, and bounty constants.
// =============================================================================

// --- Fuel & economy ---
export const DEFAULT_SCRAP    = 20;
// Fuel drain per throttle level (index 0 = idle, index 5 = full boost)
export const FUEL_RATES = [0, 0, 0.1, 0.2, 0.5, 1];

// --- Field repair ---
export const REPAIR_RATE        = 1.5; // armor points restored per second
export const REPAIR_COST_PER_PT = 1;   // scrap cost per armor point

// --- Field module repair ---
export const MODULE_REPAIR_RATE = 0.25; // condition steps per second (1 step per 4 sec)
export const MODULE_REPAIR_COST = 15;   // scrap per condition step

// --- Bounty timers ---
export const BOUNTY = {
  EXPIRY_WARNING_SECS: 60, // timer flashes RED below this
};
