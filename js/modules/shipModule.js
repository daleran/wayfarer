// Ship module system — slot-based equipment that tracks power draw/output and passive effects.
// Weapon modules hold a real weapon instance; onInstall/onRemove wire it into ship.weapons.

import { Autocannon } from './weapons/autocannon.js';
import { Lance }      from './weapons/lance.js';
import { Cannon }     from './weapons/cannon.js';
import { RocketPodSmall } from './weapons/rocket.js';
import { RocketPodLarge } from './weapons/rocketLarge.js';
import { ENGINES, REACTORS, SENSORS, WEAPONS } from '@data/compiledData.js';

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
    this.weight        = 0;  // mass units for T/W calculation
    this.condition     = 'good'; // good | worn | faulty | damaged | destroyed
    // Sensor capabilities (set by sensor subclasses via _initSensor)
    this.minimap_stations = false;
    this.minimap_ships    = false;
    this.sensor_range     = 0;
    this.lead_indicators    = false;
    this.health_pips        = false;
    this.salvage_detail     = false;
    this.trajectory_line    = false;
    this.enemy_telemetry    = false;
    this.module_inspection  = false;
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

  onInstall(_ship) {}
  onRemove(_ship)  {}
  update(_ship, _dt, _game) {}
}

// ─── Weapon modules ──────────────────────────────────────────────────────────

export class AutocannonModule extends ShipModule {
  constructor() {
    super();
    const W = WEAPONS.autocannon;
    this.name        = 'autocannon';
    this.displayName = 'AUTOCANNON';
    this.description = 'Kinetic hardpoint. Fires on trigger, mouse-aimed.';
    this.powerDraw   = W.powerDraw;
    this.weight      = W.weight;
    this.weapon      = new Autocannon();
  }
  onInstall(ship) { ship.addWeapon(this.weapon); this._applyConditionToWeapon(); }
  onRemove(ship)  { ship.removeWeapon(this.weapon); }
}

export class LanceModuleSmall extends ShipModule {
  constructor() {
    super();
    const W = WEAPONS['lance-st'];
    this.name        = 'lance-s';
    this.displayName = 'LANCE (S)';
    this.description = 'Hitscan beam emitter. Continuous fire, high power draw.';
    this.powerDraw   = W.powerDraw;
    this.weight      = W.weight;
    this.weapon      = new Lance('small');
  }
  onInstall(ship) { ship.addWeapon(this.weapon); this._applyConditionToWeapon(); }
  onRemove(ship)  { ship.removeWeapon(this.weapon); }
}

export class CannonModule extends ShipModule {
  constructor() {
    super();
    const W = WEAPONS.cannon;
    this.name        = 'cannon';
    this.displayName = 'CANNON';
    this.description = 'Heavy slug thrower. Slow fire rate, punishing impact.';
    this.powerDraw   = W.powerDraw;
    this.weight      = W.weight;
    this.weapon      = new Cannon();
  }
  onInstall(ship) { ship.addWeapon(this.weapon); this._applyConditionToWeapon(); }
  onRemove(ship)  { ship.removeWeapon(this.weapon); }
}

export class RocketPodModule extends ShipModule {
  constructor(size = 'small', defaultMode = 'heat') {
    super();
    const id = size === 'large' ? 'rocket-l' : 'rocket-s';
    const W = WEAPONS[id];
    this.name        = size === 'large' ? 'rocket-pod-l' : 'rocket-pod-s';
    this.displayName = size === 'large' ? 'RPOD-L' : 'RPOD-S';
    this.description = 'Rocket pod. Supports dumbfire, wire, and heat guidance modes.';
    this.powerDraw   = W.powerDraw;
    this.weight      = W.weight;
    this.weapon      = size === 'large' ? new RocketPodLarge() : new RocketPodSmall();
    this.weapon.guidanceMode = defaultMode;
  }
  onInstall(ship) { ship.addWeapon(this.weapon); this._applyConditionToWeapon(); }
  onRemove(ship)  { ship.removeWeapon(this.weapon); }
}

// ─── Engine modules ──────────────────────────────────────────────────────────
// Engine modules provide thrust for the ship's T/W calculation.
// Movement stats (speedMax, acceleration, turnRate) are derived from the T/W
// ratio in Ship.recalcTW(). Fuel efficiency is applied there as well.

class EngineModule extends ShipModule {
  constructor() {
    super();
    this.isEngine    = true;
    this.thrust      = 0;    // raw thrust force
    this.fuelEffMult = 1.0;  // fuel burn multiplier
    this._ship       = null;
  }
  onInstall(ship) {
    this._ship = ship;
  }
  onRemove(ship) {
    this._ship = null;
    ship.recalcTW?.();
  }
}

/** @param {string} id */
function _initEngine(mod, id) {
  const E = ENGINES[id];
  mod.name          = id;
  mod.displayName   = E.displayName;
  mod.weight        = E.weight;
  mod.thrust        = E.thrust;
  mod.fuelEffMult   = E.fuelEffMult;
  mod.fuelDrainRate = E.fuelDrainRate;
  mod.powerDraw     = E.powerDraw;
}

export class OnyxDriveUnit extends EngineModule {
  constructor() {
    super();
    _initEngine(this, 'onyx-drive-unit');
    this.description = 'Stock single-nacelle drive. Balanced output, minimal fuel overhead.';
  }
}

// Chemical Rocket (S) — high thrust, high fuel burn, near-zero power draw
export class ChemRocketSmall extends EngineModule {
  constructor() {
    super();
    _initEngine(this, 'chem-rocket-s');
    this.description = 'Bipropellant chemical rocket. High thrust. Burns fuel fast. Near-zero power draw.';
  }
}

// Chemical Rocket (L) — heavy thruster, extreme performance, extreme consumption
export class ChemRocketLarge extends EngineModule {
  constructor() {
    super();
    _initEngine(this, 'chem-rocket-l');
    this.description = 'Heavy bipropellant rocket. Extreme thrust. Fuel reserves drain rapidly under throttle.';
  }
}

// Magnetoplasma Torch (S) — moderate improvement, moderate fuel + power
export class MagplasmaTorchSmall extends EngineModule {
  constructor() {
    super();
    _initEngine(this, 'magplasma-torch-s');
    this.description = 'Electromagnetic plasma thruster. Moderate thrust gain. Draws fuel continuously for plasma generation.';
  }
}

// Magnetoplasma Torch (L) — stronger version of the torch
export class MagplasmaTorchLarge extends EngineModule {
  constructor() {
    super();
    _initEngine(this, 'magplasma-torch-l');
    this.description = 'Heavy-duty plasma thruster. Solid thrust. Requires significant fuel and power.';
  }
}

// Ion Thruster — low thrust, terrible acceleration, near-zero fuel, high power draw
export class IonThruster extends EngineModule {
  constructor() {
    super();
    _initEngine(this, 'ion-thruster');
    this.description = 'Electric ion drive. Extremely low thrust. Consumes almost no fuel — but demands heavy electrical draw.';
  }
}

// ─── Power generation ────────────────────────────────────────────────────────

/** @param {ShipModule} mod @param {string} id */
function _initReactor(mod, id) {
  const R = REACTORS[id];
  mod.name          = id;
  mod.displayName   = R.displayName;
  mod.powerOutput   = R.powerOutput;
  mod.fuelDrainRate = R.fuelDrainRate;
  mod.weight        = R.weight;
}

export class HydrogenFuelCell extends ShipModule {
  constructor() {
    super();
    _initReactor(this, 'hydrogen-fuel-cell');
    this.description = 'Small fuel cell. Steady 80W — burns fuel continuously.';
  }
  get effectivePowerOutput() {
    return Math.round(this.powerOutput * this.conditionMultiplier);
  }
}

export class SmallFissionReactor extends ShipModule {
  constructor() {
    super();
    _initReactor(this, 'fission-reactor-s');
    const R = REACTORS['fission-reactor-s'];
    this.description       = 'Compact fission core. High output, no fuel burn. Requires periodic overhaul.';
    this._overhaulInterval = R.overhaulInterval;
    this.overhaulCost      = R.overhaulCost;
    this._degradedOutput   = R.degradedOutput;
    this.timeSinceOverhaul = 0;
    this.isOverdue         = false;
    this.isFissionReactor  = true;
  }
  update(_ship, dt, _game) {
    this.timeSinceOverhaul += dt;
    this.isOverdue = this.timeSinceOverhaul >= this._overhaulInterval;
  }
  get effectivePowerOutput() {
    const base = this.isOverdue ? Math.round(this.powerOutput * this._degradedOutput) : this.powerOutput;
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
    _initReactor(this, 'fission-reactor-l');
    const R = REACTORS['fission-reactor-l'];
    this.description       = 'Heavy fission plant. Maximum fission output. Requires overhaul at certified stations.';
    this._overhaulInterval = R.overhaulInterval;
    this.overhaulCost      = R.overhaulCost;
    this._degradedOutput   = R.degradedOutput;
    this.timeSinceOverhaul = 0;
    this.isOverdue         = false;
    this.isFissionReactor  = true;
  }
  update(_ship, dt, _game) {
    this.timeSinceOverhaul += dt;
    this.isOverdue = this.timeSinceOverhaul >= this._overhaulInterval;
  }
  get effectivePowerOutput() {
    const base = this.isOverdue ? Math.round(this.powerOutput * this._degradedOutput) : this.powerOutput;
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
    _initReactor(this, 'fusion-reactor-l');
    this.description = 'Pre-Collapse fusion core. Immense output. Consumes trace fuel — no overhaul required.';
  }
  get effectivePowerOutput() {
    return Math.round(this.powerOutput * this.conditionMultiplier);
  }
}

// ─── Sensors / passive ───────────────────────────────────────────────────────

/** @param {ShipModule} mod @param {string} id */
function _initSensor(mod, id) {
  const S = SENSORS[id];
  mod.name             = id;
  mod.displayName      = S.displayName;
  mod.powerDraw        = S.powerDraw;
  mod.weight           = S.weight;
  mod.minimap_stations = !!S.minimapStations;
  mod.minimap_ships    = !!S.minimapShips;
  mod.sensor_range     = S.sensorRange;
  mod.lead_indicators    = !!S.leadIndicators;
  mod.health_pips        = !!S.healthPips;
  mod.salvage_detail     = !!S.salvageDetail;
  mod.trajectory_line    = !!S.trajectoryLine;
  mod.enemy_telemetry    = !!S.enemyTelemetry;
  mod.module_inspection  = !!S.moduleInspection;
}

export class SalvagedSensorSuite extends ShipModule {
  constructor() {
    super();
    _initSensor(this, 'salvaged-sensor-suite');
    this.description = 'Pre-Collapse array. Only detects static landmarks (planets/stations).';
  }
}

export class StandardSensorSuite extends ShipModule {
  constructor() {
    super();
    _initSensor(this, 'standard-sensor-suite');
    this.description = 'Modern array. Detects ships up to 3000 units.';
  }
}

export class CombatComputerModule extends ShipModule {
  constructor() {
    super();
    _initSensor(this, 'combat-computer');
    this.description = 'Displays lead-indicators and ship integrity pips. Range: 2000.';
  }
}

export class SalvageScannerModule extends ShipModule {
  constructor() {
    super();
    _initSensor(this, 'salvage-scanner');
    this.description = 'Reveals salvage details in derelicts. Range: 2500.';
  }
}

export class LongRangeScannerModule extends ShipModule {
  constructor() {
    super();
    _initSensor(this, 'long-range-scanner');
    this.description = 'Pulls contacts from deep space. Minimap range: 8000.';
  }
}

// ─── Module registry ────────────────────────────────────────────────────────
// Single source of truth for all installable modules.
// Designer and game systems iterate this instead of maintaining parallel lists.
// Each entry: { id, category, create() }. All other data comes from the instance.

export const MODULE_REGISTRY = [
  // Engines
  { id: 'onyx-drive-unit',    category: 'ENGINE', create: () => new OnyxDriveUnit() },
  { id: 'chem-rocket-s',      category: 'ENGINE', create: () => new ChemRocketSmall() },
  { id: 'chem-rocket-l',      category: 'ENGINE', create: () => new ChemRocketLarge() },
  { id: 'magplasma-torch-s',  category: 'ENGINE', create: () => new MagplasmaTorchSmall() },
  { id: 'magplasma-torch-l',  category: 'ENGINE', create: () => new MagplasmaTorchLarge() },
  { id: 'ion-thruster',       category: 'ENGINE', create: () => new IonThruster() },
  // Weapons
  { id: 'mod-autocannon',     category: 'WEAPON', create: () => new AutocannonModule() },
  { id: 'mod-lance-s',        category: 'WEAPON', create: () => new LanceModuleSmall() },
  { id: 'mod-cannon',         category: 'WEAPON', create: () => new CannonModule() },
  { id: 'mod-rpod-s',         category: 'WEAPON', create: () => new RocketPodModule('small', 'dumbfire') },
  { id: 'mod-rpod-l',         category: 'WEAPON', create: () => new RocketPodModule('large', 'dumbfire') },
  // Power
  { id: 'h2-fuel-cell',       category: 'POWER',  create: () => new HydrogenFuelCell() },
  { id: 'fission-s',          category: 'POWER',  create: () => new SmallFissionReactor() },
  { id: 'fission-l',          category: 'POWER',  create: () => new LargeFissionReactor() },
  { id: 'fusion-l',           category: 'POWER',  create: () => new LargeFusionReactor() },
  // Sensors
  { id: 'salvaged-sensors',   category: 'SENSOR', create: () => new SalvagedSensorSuite() },
  { id: 'standard-sensors',   category: 'SENSOR', create: () => new StandardSensorSuite() },
  { id: 'combat-computer',    category: 'SENSOR', create: () => new CombatComputerModule() },
  { id: 'salvage-scanner',    category: 'SENSOR', create: () => new SalvageScannerModule() },
  { id: 'long-range-sensors', category: 'SENSOR', create: () => new LongRangeScannerModule() },
];
