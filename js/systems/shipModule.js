// Ship module system — slot-based equipment that tracks power draw/output and passive effects.
// Weapon modules hold a real weapon instance; onInstall/onRemove wire it into ship.weapons.

import { Autocannon } from '../weapons/autocannon.js';
import { Lance }      from '../weapons/lance.js';
import { Cannon }     from '../weapons/cannon.js';
import { RocketPodSmall } from '../weapons/rocket.js';
import { RocketPodLarge } from '../weapons/rocketLarge.js';
import {
  REACTOR_SMALL_FISSION_INTERVAL,
  REACTOR_LARGE_FISSION_INTERVAL,
  REACTOR_SMALL_FISSION_OVERHAUL_COST,
  REACTOR_LARGE_FISSION_OVERHAUL_COST,
  REACTOR_FISSION_DEGRADED_OUTPUT,
  ENGINE_CHEM_S_SPEED_MULT,    ENGINE_CHEM_S_ACCEL_MULT,    ENGINE_CHEM_S_FUEL_EFF_MULT,  ENGINE_CHEM_S_POWER_DRAW,
  ENGINE_CHEM_L_SPEED_MULT,    ENGINE_CHEM_L_ACCEL_MULT,    ENGINE_CHEM_L_FUEL_EFF_MULT,  ENGINE_CHEM_L_POWER_DRAW,
  ENGINE_MAGPLASMA_S_SPEED_MULT, ENGINE_MAGPLASMA_S_ACCEL_MULT, ENGINE_MAGPLASMA_S_FUEL_EFF_MULT, ENGINE_MAGPLASMA_S_FUEL_DRAIN, ENGINE_MAGPLASMA_S_POWER_DRAW,
  ENGINE_MAGPLASMA_L_SPEED_MULT, ENGINE_MAGPLASMA_L_ACCEL_MULT, ENGINE_MAGPLASMA_L_FUEL_EFF_MULT, ENGINE_MAGPLASMA_L_FUEL_DRAIN, ENGINE_MAGPLASMA_L_POWER_DRAW,
  ENGINE_ION_SPEED_MULT, ENGINE_ION_ACCEL_MULT, ENGINE_ION_FUEL_EFF_MULT, ENGINE_ION_FUEL_DRAIN, ENGINE_ION_POWER_DRAW,
} from '../data/stats.js';

export class ShipModule {
  constructor() {
    this.name          = '';
    this.displayName   = '';
    this.description   = '';
    this.slotType      = 'universal';
    this.powerOutput   = 0;  // watts generated (fuel cells)
    this.powerDraw     = 0;  // watts consumed
    this.fuelDrainRate = 0;  // fuel/sec idle (fuel cells only)
    this.weapon        = null; // set by weapon modules
    this.condition     = 'good'; // good | worn | faulty | damaged | destroyed
  }

  get conditionMultiplier() {
    return { good: 1.00, worn: 0.85, faulty: 0.65, damaged: 0.35, destroyed: 0.00 }[this.condition] ?? 1.00;
  }

  // Scales weapon damage by conditionMultiplier. Call from weapon module onInstall.
  _applyConditionToWeapon() {
    if (!this.weapon) return;
    const w = this.weapon;
    if (w._baseDamage === undefined && w.damage !== undefined) w._baseDamage = w.damage;
    if (w._baseHullDamage === undefined && w.hullDamage !== undefined) w._baseHullDamage = w.hullDamage;
    const mult = this.conditionMultiplier;
    if (w._baseDamage !== undefined) w.damage = Math.round(w._baseDamage * mult);
    if (w._baseHullDamage !== undefined) w.hullDamage = Math.round(w._baseHullDamage * mult);
  }

  onInstall(ship) {}
  onRemove(ship)  {}
  update(ship, dt, game) {}
}

// ─── Weapon modules ──────────────────────────────────────────────────────────

export class AutocannonModule extends ShipModule {
  constructor() {
    super();
    this.name        = 'autocannon';
    this.displayName = 'AUTOCANNON';
    this.description = 'Kinetic hardpoint. Fires on trigger, mouse-aimed.';
    this.powerDraw   = 20;
    this.weapon      = new Autocannon();
  }
  onInstall(ship) { ship.addWeapon(this.weapon); this._applyConditionToWeapon(); }
  onRemove(ship)  { ship.removeWeapon(this.weapon); }
}

export class LanceModuleSmall extends ShipModule {
  constructor() {
    super();
    this.name        = 'lance-s';
    this.displayName = 'LANCE (S)';
    this.description = 'Hitscan beam emitter. Continuous fire, high power draw.';
    this.powerDraw   = 15;
    this.weapon      = new Lance('small');
  }
  onInstall(ship) { ship.addWeapon(this.weapon); this._applyConditionToWeapon(); }
  onRemove(ship)  { ship.removeWeapon(this.weapon); }
}

export class CannonModule extends ShipModule {
  constructor() {
    super();
    this.name        = 'cannon';
    this.displayName = 'CANNON';
    this.description = 'Heavy slug thrower. Slow fire rate, punishing impact.';
    this.powerDraw   = 30;
    this.weapon      = new Cannon();
  }
  onInstall(ship) { ship.addWeapon(this.weapon); this._applyConditionToWeapon(); }
  onRemove(ship)  { ship.removeWeapon(this.weapon); }
}

export class RocketPodModule extends ShipModule {
  constructor(size = 'small', defaultMode = 'heat') {
    super();
    this.name        = size === 'large' ? 'rocket-pod-l' : 'rocket-pod-s';
    this.displayName = size === 'large' ? 'RPOD-L' : 'RPOD-S';
    this.description = 'Rocket pod. Supports dumbfire, wire, and heat guidance modes.';
    this.powerDraw   = 10;
    this.weapon      = size === 'large' ? new RocketPodLarge() : new RocketPodSmall();
    this.weapon.guidanceMode = defaultMode;
  }
  onInstall(ship) { ship.addWeapon(this.weapon); this._applyConditionToWeapon(); }
  onRemove(ship)  { ship.removeWeapon(this.weapon); }
}

// Backward-compat alias — old code using MissileHeatModule still works
export { RocketPodModule as MissileHeatModule };

// ─── Engine modules ──────────────────────────────────────────────────────────
// Engine modules modify ship speedMax, acceleration, and fuelEfficiency.
// Base stats are frozen on _baseSpeedMax / _baseAcceleration / _baseFuelEff
// in Ship._applyModules() before any module onInstall runs.

class EngineModule extends ShipModule {
  constructor() {
    super();
    this.isEngine   = true;
    this.speedMult  = 1.0;
    this.accelMult  = 1.0;
    this.fuelEffMult = 1.0;
  }
  onInstall(ship) {
    ship.speedMax     = (ship._baseSpeedMax     ?? ship.speedMax)     * this.speedMult;
    ship.acceleration = (ship._baseAcceleration ?? ship.acceleration) * this.accelMult;
    ship.fuelEfficiency = (ship._baseFuelEff    ?? ship.fuelEfficiency) * this.fuelEffMult;
  }
  onRemove(ship) {
    if (ship._baseSpeedMax     != null) ship.speedMax     = ship._baseSpeedMax;
    if (ship._baseAcceleration != null) ship.acceleration = ship._baseAcceleration;
    if (ship._baseFuelEff      != null) ship.fuelEfficiency = ship._baseFuelEff;
  }
}

export class OnyxDriveUnit extends EngineModule {
  constructor() {
    super();
    this.name          = 'onyx-drive-unit';
    this.displayName   = 'ONYX DRIVE UNIT';
    this.description   = 'Stock single-nacelle drive. Balanced output, minimal fuel overhead.';
    this.fuelDrainRate = 0.005; // small constant idle drain
    // speedMult / accelMult / fuelEffMult remain 1.0 — no change to base stats
  }
}

// Chemical Rocket (S) — high thrust, high fuel burn, near-zero power draw
export class ChemRocketSmall extends EngineModule {
  constructor() {
    super();
    this.name          = 'chem-rocket-s';
    this.displayName   = 'CHEM ROCKET (S)';
    this.description   = 'Bipropellant chemical rocket. High speed and acceleration. Burns fuel fast. Near-zero power draw.';
    this.speedMult     = ENGINE_CHEM_S_SPEED_MULT;
    this.accelMult     = ENGINE_CHEM_S_ACCEL_MULT;
    this.fuelEffMult   = ENGINE_CHEM_S_FUEL_EFF_MULT;
    this.powerDraw     = ENGINE_CHEM_S_POWER_DRAW;
  }
}

// Chemical Rocket (L) — heavy thruster, extreme performance, extreme consumption
export class ChemRocketLarge extends EngineModule {
  constructor() {
    super();
    this.name          = 'chem-rocket-l';
    this.displayName   = 'CHEM ROCKET (L)';
    this.description   = 'Heavy bipropellant rocket. Extreme thrust and top speed. Fuel reserves drain rapidly under throttle.';
    this.speedMult     = ENGINE_CHEM_L_SPEED_MULT;
    this.accelMult     = ENGINE_CHEM_L_ACCEL_MULT;
    this.fuelEffMult   = ENGINE_CHEM_L_FUEL_EFF_MULT;
    this.powerDraw     = ENGINE_CHEM_L_POWER_DRAW;
  }
}

// Magnetoplasma Torch (S) — moderate improvement, moderate fuel + power
export class MagplasmaTorchSmall extends EngineModule {
  constructor() {
    super();
    this.name          = 'magplasma-torch-s';
    this.displayName   = 'MAG-PLASMA TORCH (S)';
    this.description   = 'Electromagnetic plasma thruster. Moderate speed gain. Draws fuel continuously for plasma generation.';
    this.speedMult     = ENGINE_MAGPLASMA_S_SPEED_MULT;
    this.accelMult     = ENGINE_MAGPLASMA_S_ACCEL_MULT;
    this.fuelEffMult   = ENGINE_MAGPLASMA_S_FUEL_EFF_MULT;
    this.fuelDrainRate = ENGINE_MAGPLASMA_S_FUEL_DRAIN;
    this.powerDraw     = ENGINE_MAGPLASMA_S_POWER_DRAW;
  }
}

// Magnetoplasma Torch (L) — stronger version of the torch
export class MagplasmaTorchLarge extends EngineModule {
  constructor() {
    super();
    this.name          = 'magplasma-torch-l';
    this.displayName   = 'MAG-PLASMA TORCH (L)';
    this.description   = 'Heavy-duty plasma thruster. Solid speed and acceleration. Requires significant fuel and power.';
    this.speedMult     = ENGINE_MAGPLASMA_L_SPEED_MULT;
    this.accelMult     = ENGINE_MAGPLASMA_L_ACCEL_MULT;
    this.fuelEffMult   = ENGINE_MAGPLASMA_L_FUEL_EFF_MULT;
    this.fuelDrainRate = ENGINE_MAGPLASMA_L_FUEL_DRAIN;
    this.powerDraw     = ENGINE_MAGPLASMA_L_POWER_DRAW;
  }
}

// Ion Thruster — low speed, terrible acceleration, near-zero fuel, high power draw
export class IonThruster extends EngineModule {
  constructor() {
    super();
    this.name          = 'ion-thruster';
    this.displayName   = 'ION THRUSTER';
    this.description   = 'Electric ion drive. Extremely poor acceleration. Low top speed. Consumes almost no fuel — but demands heavy electrical draw.';
    this.speedMult     = ENGINE_ION_SPEED_MULT;
    this.accelMult     = ENGINE_ION_ACCEL_MULT;
    this.fuelEffMult   = ENGINE_ION_FUEL_EFF_MULT;
    this.fuelDrainRate = ENGINE_ION_FUEL_DRAIN;
    this.powerDraw     = ENGINE_ION_POWER_DRAW;
  }
}

// ─── Power generation ────────────────────────────────────────────────────────

export class HydrogenFuelCell extends ShipModule {
  constructor() {
    super();
    this.name          = 'hydrogen-fuel-cell';
    this.displayName   = 'H2 FUEL CELL (S)';
    this.description   = 'Small fuel cell. Steady 80W — burns fuel continuously.';
    this.powerOutput   = 80;
    this.fuelDrainRate = 0.025;
  }
  get effectivePowerOutput() {
    return Math.round(this.powerOutput * this.conditionMultiplier);
  }
}

export class SmallFissionReactor extends ShipModule {
  constructor() {
    super();
    this.name              = 'fission-reactor-s';
    this.displayName       = 'FISSION REACTOR (S)';
    this.description       = 'Compact fission core. High output, no fuel burn. Requires periodic overhaul.';
    this.powerOutput       = 160;
    this.fuelDrainRate     = 0;
    this._overhaulInterval = REACTOR_SMALL_FISSION_INTERVAL;
    this.overhaulCost      = REACTOR_SMALL_FISSION_OVERHAUL_COST;
    this.timeSinceOverhaul = 0;
    this.isOverdue         = false;
    this.isFissionReactor  = true;
  }
  update(ship, dt, game) {
    this.timeSinceOverhaul += dt;
    this.isOverdue = this.timeSinceOverhaul >= this._overhaulInterval;
  }
  get effectivePowerOutput() {
    const base = this.isOverdue ? Math.round(this.powerOutput * REACTOR_FISSION_DEGRADED_OUTPUT) : this.powerOutput;
    return Math.round(base * this.conditionMultiplier);
  }
  resetOverhaul() {
    this.timeSinceOverhaul = 0;
    this.isOverdue = false;
  }
}

export class LargeFissionReactor extends ShipModule {
  constructor() {
    super();
    this.name              = 'fission-reactor-l';
    this.displayName       = 'FISSION REACTOR (L)';
    this.description       = 'Heavy fission plant. Maximum fission output. Requires overhaul at certified stations.';
    this.powerOutput       = 300;
    this.fuelDrainRate     = 0;
    this._overhaulInterval = REACTOR_LARGE_FISSION_INTERVAL;
    this.overhaulCost      = REACTOR_LARGE_FISSION_OVERHAUL_COST;
    this.timeSinceOverhaul = 0;
    this.isOverdue         = false;
    this.isFissionReactor  = true;
  }
  update(ship, dt, game) {
    this.timeSinceOverhaul += dt;
    this.isOverdue = this.timeSinceOverhaul >= this._overhaulInterval;
  }
  get effectivePowerOutput() {
    const base = this.isOverdue ? Math.round(this.powerOutput * REACTOR_FISSION_DEGRADED_OUTPUT) : this.powerOutput;
    return Math.round(base * this.conditionMultiplier);
  }
  resetOverhaul() {
    this.timeSinceOverhaul = 0;
    this.isOverdue = false;
  }
}

export class LargeFusionReactor extends ShipModule {
  constructor() {
    super();
    this.name          = 'fusion-reactor-l';
    this.displayName   = 'FUSION REACTOR (L)';
    this.description   = 'Pre-Collapse fusion core. Immense output. Consumes trace fuel — no overhaul required.';
    this.powerOutput   = 500;
    this.fuelDrainRate = 0.005;
  }
  get effectivePowerOutput() {
    return Math.round(this.powerOutput * this.conditionMultiplier);
  }
}

// ─── Sensors / passive ───────────────────────────────────────────────────────

export class SalvagedSensorSuite extends ShipModule {
  constructor() {
    super();
    this.name        = 'salvaged-sensor-suite';
    this.displayName = 'SALVAGED SENSORS';
    this.description = 'Pre-Collapse array. Only detects static landmarks (planets/stations).';
    this.powerDraw   = 2;
    this.minimap_stations = true;
  }
}

export class StandardSensorSuite extends ShipModule {
  constructor() {
    super();
    this.name        = 'standard-sensor-suite';
    this.displayName = 'STANDARD SENSORS';
    this.description = 'Modern array. Detects ships up to 3000 units.';
    this.powerDraw   = 8;
    this.minimap_stations = true;
    this.minimap_ships    = true;
    this.sensor_range     = 3000;
  }
}

export class CombatComputerModule extends ShipModule {
  constructor() {
    super();
    this.name        = 'combat-computer';
    this.displayName = 'COMBAT COMPUTER';
    this.description = 'Displays lead-indicators and ship integrity pips. Range: 2000.';
    this.powerDraw   = 15;
    this.minimap_stations = true;
    this.minimap_ships    = true;
    this.sensor_range     = 2000;
    this.lead_indicators  = true;
    this.health_pips      = true;
  }
}

export class SalvageScannerModule extends ShipModule {
  constructor() {
    super();
    this.name        = 'salvage-scanner';
    this.displayName = 'SALVAGE SCANNER';
    this.description = 'Reveals salvage details in derelicts. Range: 2500.';
    this.powerDraw   = 12;
    this.minimap_stations = true;
    this.minimap_ships    = true;
    this.sensor_range     = 2500;
    this.salvage_detail   = true;
  }
}

export class LongRangeScannerModule extends ShipModule {
  constructor() {
    super();
    this.name        = 'long-range-scanner';
    this.displayName = 'LONG-RANGE SENSORS';
    this.description = 'Pulls contacts from deep space. Minimap range: 8000.';
    this.powerDraw   = 20;
    this.minimap_stations = true;
    this.minimap_ships    = true;
    this.sensor_range     = 8000;
  }
}

