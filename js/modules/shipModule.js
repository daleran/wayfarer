// Ship module system — slot-based equipment that tracks power draw/output and passive effects.
// Weapon modules hold a real weapon instance; onInstall/onRemove wire it into ship.weapons.

import { Autocannon } from './weapons/autocannon.js';
import { Lance }      from './weapons/lance.js';
import { Cannon }     from './weapons/cannon.js';
import { RocketPodSmall } from './weapons/rocket.js';
import { RocketPodLarge } from './weapons/rocketLarge.js';
import { ENGINES, REACTORS, SENSORS, WEAPONS, UTILITIES } from '@data/compiledData.js';
import { Shape, ring, disc, line } from '@/rendering/draw.js';
import { CYAN, AMBER, MAGENTA, WHITE, GREEN } from '@/rendering/colors.js';

// ── Shared shape templates (created once, reused by subclasses) ─────────────
const ENGINE_SHAPE  = Shape.trapezoid(7, 5, 5);
const REACTOR_SHAPE = Shape.chamferedRect(7, 7, 1.5);
const UTILITY_SHAPE = Shape.chamferedRect(7, 7, 2);
const BARREL_SHAPE  = Shape.rect(2, 8);
const CANNON_SHAPE  = Shape.rect(3, 6);
const ROCKET_SHAPE  = Shape.rect(6, 5);
const SENSOR_DISH   = 3;
const SENSOR_LINE   = 4;
const LANCE_LINE    = 8;

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
    this.size          = 'small'; // 'small' | 'large' — mount size constraint
    this.weight        = 0;  // mass units for T/W calculation
    this.condition     = 'good'; // good | worn | faulty | damaged | destroyed
    this.isPowered     = true;   // set by power balance; false when insufficient reactor output
    this.powerPriority = 0;      // depower order: lower = depowered first (sensors 1, weapons 2, engines 3)
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

  /** Draw module icon at origin. ctx is already translated to mount point. */
  drawAtMount(_ctx, _color, _alpha) {}

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
    this.displayName = 'AUTOCANNON (S)';
    this.description = 'Kinetic hardpoint. Fires on trigger, mouse-aimed.';
    this.powerDraw   = W.powerDraw;
    this.weight      = W.weight;
    this.size        = W.size === 'L' ? 'large' : 'small';
    this.powerPriority = 2;
    this.weapon      = new Autocannon();
  }
  drawAtMount(ctx, color, alpha) {
    BARREL_SHAPE.fill(ctx, color, alpha * 0.3);
    BARREL_SHAPE.stroke(ctx, color, 0.8, alpha);
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
    this.size        = W.size === 'L' ? 'large' : 'small';
    this.powerPriority = 2;
    this.weapon      = new Lance('small');
  }
  drawAtMount(ctx, color, alpha) {
    line(ctx, 0, -LANCE_LINE / 2, 0, LANCE_LINE / 2, color, 1, alpha);
    disc(ctx, 0, -LANCE_LINE / 2, 1.2, color, alpha);
  }
  onInstall(ship) { ship.addWeapon(this.weapon); this._applyConditionToWeapon(); }
  onRemove(ship)  { ship.removeWeapon(this.weapon); }
}

export class CannonModule extends ShipModule {
  constructor() {
    super();
    const W = WEAPONS.cannon;
    this.name        = 'cannon';
    this.displayName = 'CANNON (S)';
    this.description = 'Heavy slug thrower. Slow fire rate, punishing impact.';
    this.powerDraw   = W.powerDraw;
    this.weight      = W.weight;
    this.size        = W.size === 'L' ? 'large' : 'small';
    this.powerPriority = 2;
    this.weapon      = new Cannon();
  }
  drawAtMount(ctx, color, alpha) {
    CANNON_SHAPE.fill(ctx, color, alpha * 0.3);
    CANNON_SHAPE.stroke(ctx, color, 0.8, alpha);
  }
  onInstall(ship) { ship.addWeapon(this.weapon); this._applyConditionToWeapon(); }
  onRemove(ship)  { ship.removeWeapon(this.weapon); }
}

export class RocketPodModule extends ShipModule {
  constructor(rocketSize = 'small', defaultMode = 'ht') {
    super();
    const id = rocketSize === 'large' ? 'rocket-l' : 'rocket-s';
    const W = WEAPONS[id];
    this.name        = rocketSize === 'large' ? 'rocket-pod-l' : 'rocket-pod-s';
    this.displayName = rocketSize === 'large' ? 'RPOD-L' : 'RPOD-S';
    this.description = 'Rocket pod. Fires RKT (dumbfire), WG (wire-guided), or HT (heat-seeking) ordnance.';
    this.powerDraw   = W.powerDraw;
    this.weight      = W.weight;
    this.size        = W.size === 'L' ? 'large' : 'small';
    this.powerPriority = 2;
    this.weapon      = rocketSize === 'large' ? new RocketPodLarge() : new RocketPodSmall();
    this.weapon.currentAmmoId = defaultMode;
  }
  drawAtMount(ctx, color, alpha) {
    ROCKET_SHAPE.fill(ctx, color, alpha * 0.3);
    ROCKET_SHAPE.stroke(ctx, color, 0.8, alpha);
    disc(ctx, -1.5, 0, 1, color, alpha * 0.6);
    disc(ctx, 1.5, 0, 1, color, alpha * 0.6);
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
  drawAtMount(ctx, color, alpha) {
    ENGINE_SHAPE.fill(ctx, color, alpha * 0.3);
    ENGINE_SHAPE.stroke(ctx, color, 0.8, alpha);
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
  mod.powerPriority = 3; // engines: last to lose power
  mod.size          = E.size === 'L' ? 'large' : 'small';
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
  mod.size          = R.size === 'L' ? 'large' : 'small';
}

export class HydrogenFuelCell extends ShipModule {
  constructor() {
    super();
    _initReactor(this, 'hydrogen-fuel-cell');
    this.description = 'Small fuel cell. Steady 80W — burns fuel continuously.';
  }
  drawAtMount(ctx, color, alpha) {
    REACTOR_SHAPE.fill(ctx, color, alpha * 0.25);
    REACTOR_SHAPE.stroke(ctx, color, 0.8, alpha);
    disc(ctx, 0, 0, 2, CYAN, alpha * 0.6);
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
  drawAtMount(ctx, color, alpha) {
    REACTOR_SHAPE.fill(ctx, color, alpha * 0.25);
    REACTOR_SHAPE.stroke(ctx, color, 0.8, alpha);
    disc(ctx, 0, 0, 2, AMBER, alpha * 0.6);
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
  drawAtMount(ctx, color, alpha) {
    REACTOR_SHAPE.fill(ctx, color, alpha * 0.25);
    REACTOR_SHAPE.stroke(ctx, color, 0.8, alpha);
    disc(ctx, 0, 0, 2, AMBER, alpha * 0.6);
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
  drawAtMount(ctx, color, alpha) {
    REACTOR_SHAPE.fill(ctx, color, alpha * 0.25);
    REACTOR_SHAPE.stroke(ctx, color, 0.8, alpha);
    disc(ctx, 0, 0, 2, MAGENTA, alpha * 0.6);
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
  mod.powerPriority    = 1; // sensors: first to lose power
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

/** Shared sensor rendering — dish + antenna + tip dot */
function _drawSensorIcon(ctx, color, alpha) {
  ring(ctx, 0, 1, SENSOR_DISH, color, 0.8, alpha);
  line(ctx, 0, 1 - SENSOR_DISH, 0, 1 - SENSOR_DISH - SENSOR_LINE, color, 0.8, alpha);
  disc(ctx, 0, 1 - SENSOR_DISH - SENSOR_LINE, 1, color, alpha * 0.6);
}

export class SalvagedSensorSuite extends ShipModule {
  constructor() {
    super();
    _initSensor(this, 'salvaged-sensor-suite');
    this.description = 'Pre-Collapse array. Only detects static landmarks (planets/stations).';
  }
  drawAtMount(ctx, color, alpha) { _drawSensorIcon(ctx, color, alpha); }
}

export class StandardSensorSuite extends ShipModule {
  constructor() {
    super();
    _initSensor(this, 'standard-sensor-suite');
    this.description = 'Modern array. Detects ships up to 3000 units.';
  }
  drawAtMount(ctx, color, alpha) { _drawSensorIcon(ctx, color, alpha); }
}

export class CombatComputerModule extends ShipModule {
  constructor() {
    super();
    _initSensor(this, 'combat-computer');
    this.description = 'Displays lead-indicators and ship integrity pips. Range: 2000.';
  }
  drawAtMount(ctx, color, alpha) { _drawSensorIcon(ctx, color, alpha); }
}

export class SalvageScannerModule extends ShipModule {
  constructor() {
    super();
    _initSensor(this, 'salvage-scanner');
    this.description = 'Reveals salvage details in derelicts. Range: 2500.';
  }
  drawAtMount(ctx, color, alpha) { _drawSensorIcon(ctx, color, alpha); }
}

export class LongRangeScannerModule extends ShipModule {
  constructor() {
    super();
    _initSensor(this, 'long-range-scanner');
    this.description = 'Pulls contacts from deep space. Minimap range: 8000.';
  }
  drawAtMount(ctx, color, alpha) { _drawSensorIcon(ctx, color, alpha); }
}

// ─── Utility modules ─────────────────────────────────────────────────────────
// Passive stat-modifying modules: cargo holds, fuel tanks, armor plates, weight stripping.
// onInstall/onRemove apply additive bonuses to ship stats; condition scales the bonus.

/** @param {UtilityModule} mod @param {string} id */
function _initUtility(mod, id) {
  const U = UTILITIES[id];
  mod.name        = id;
  mod.displayName = U.displayName;
  mod.weight      = U.weight;
  mod.size        = U.size === 'L' ? 'large' : 'small';
  mod.isUtility   = true;
  mod._cargoBonus = U.cargoBonus || 0;
  mod._fuelBonus  = U.fuelBonus  || 0;
  mod._armorBonus = U.armorBonus || 0;
}

class UtilityModule extends ShipModule {
  constructor() {
    super();
    this.isUtility   = true;
    this._cargoBonus = 0;
    this._fuelBonus  = 0;
    this._armorBonus = 0;
  }

  /** Effective bonus scaled by condition */
  get cargoBonus() { return Math.round(this._cargoBonus * this.conditionMultiplier); }
  get fuelBonus()  { return Math.round(this._fuelBonus  * this.conditionMultiplier); }
  get armorBonus() { return Math.round(this._armorBonus * this.conditionMultiplier); }

  onInstall(ship) {
    if (this.cargoBonus) ship.cargoCapacity = (ship.cargoCapacity || 0) + this.cargoBonus;
    if (this.fuelBonus)  ship.fuelMax       = (ship.fuelMax || 0)       + this.fuelBonus;
    if (this.armorBonus) {
      for (const arc of ['front', 'port', 'starboard', 'aft']) {
        ship.armorArcsMax[arc] = (ship.armorArcsMax[arc] || 0) + this.armorBonus;
        // If armor was at max, keep it at max; otherwise clamp
        if (this.armorBonus > 0) {
          ship.armorArcs[arc] = (ship.armorArcs[arc] || 0) + this.armorBonus;
        } else {
          ship.armorArcs[arc] = Math.min(ship.armorArcs[arc] || 0, ship.armorArcsMax[arc]);
        }
      }
    }
  }

  onRemove(ship) {
    if (this.cargoBonus) ship.cargoCapacity = Math.max(0, (ship.cargoCapacity || 0) - this.cargoBonus);
    if (this.fuelBonus)  ship.fuelMax       = Math.max(0, (ship.fuelMax || 0)       - this.fuelBonus);
    if (this.armorBonus) {
      for (const arc of ['front', 'port', 'starboard', 'aft']) {
        ship.armorArcsMax[arc] = (ship.armorArcsMax[arc] || 0) - this.armorBonus;
        ship.armorArcs[arc] = Math.min(ship.armorArcs[arc] || 0, ship.armorArcsMax[arc]);
      }
    }
  }
}

/** Shared utility rendering — chamfered box + colored cross */
function _drawUtilityIcon(ctx, color, alpha, glowColor) {
  UTILITY_SHAPE.fill(ctx, color, alpha * 0.25);
  UTILITY_SHAPE.stroke(ctx, color, 0.8, alpha);
  line(ctx, -2.5, 0, 2.5, 0, glowColor, 1, alpha * 0.7);
  line(ctx, 0, -2.5, 0, 2.5, glowColor, 1, alpha * 0.7);
}

export class ExpandedHoldSmall extends UtilityModule {
  constructor() {
    super();
    _initUtility(this, 'expanded-hold-s');
    this.description = 'Welded-in cargo frames. More hold space — heavier hull, thinner armor.';
  }
  drawAtMount(ctx, color, alpha) { _drawUtilityIcon(ctx, color, alpha, AMBER); }
}

export class ExpandedHoldLarge extends UtilityModule {
  constructor() {
    super();
    _initUtility(this, 'expanded-hold-l');
    this.description = 'Full cargo bay extension. Major capacity gain — significant mass and armor penalty.';
  }
  drawAtMount(ctx, color, alpha) { _drawUtilityIcon(ctx, color, alpha, AMBER); }
}

export class AuxTankSmall extends UtilityModule {
  constructor() {
    super();
    _initUtility(this, 'aux-tank-s');
    this.description = 'Bolt-on fuel bladder. Extended range — adds weight, weakens hull plating.';
  }
  drawAtMount(ctx, color, alpha) { _drawUtilityIcon(ctx, color, alpha, CYAN); }
}

export class AuxTankLarge extends UtilityModule {
  constructor() {
    super();
    _initUtility(this, 'aux-tank-l');
    this.description = 'Pressurized reserve tank. Long-range capability — heavy, reduces armor protection.';
  }
  drawAtMount(ctx, color, alpha) { _drawUtilityIcon(ctx, color, alpha, CYAN); }
}

export class StrippedWeightSmall extends UtilityModule {
  constructor() {
    super();
    _initUtility(this, 'stripped-weight-s');
    this.description = 'Non-essential systems removed. Lighter hull — less armor protection.';
  }
  drawAtMount(ctx, color, alpha) { _drawUtilityIcon(ctx, color, alpha, GREEN); }
}

export class StrippedWeightLarge extends UtilityModule {
  constructor() {
    super();
    _initUtility(this, 'stripped-weight-l');
    this.description = 'Gutted interior, thinned bulkheads. Major weight reduction — armor severely compromised.';
  }
  drawAtMount(ctx, color, alpha) { _drawUtilityIcon(ctx, color, alpha, GREEN); }
}

export class ExtraArmorSmall extends UtilityModule {
  constructor() {
    super();
    _initUtility(this, 'extra-armor-s');
    this.description = 'Bolted armor plating. Better protection — heavier ship.';
  }
  drawAtMount(ctx, color, alpha) { _drawUtilityIcon(ctx, color, alpha, WHITE); }
}

export class ExtraArmorLarge extends UtilityModule {
  constructor() {
    super();
    _initUtility(this, 'extra-armor-l');
    this.description = 'Heavy composite armor panels. Substantial protection boost — significant mass penalty.';
  }
  drawAtMount(ctx, color, alpha) { _drawUtilityIcon(ctx, color, alpha, WHITE); }
}

export class SalvageBayModule extends UtilityModule {
  constructor() {
    super();
    _initUtility(this, 'salvage-bay');
    this.description = 'Field salvage bay. Extracts installed modules and weapons from derelicts during salvage.';
    this.hasSalvageBay = true;
  }
  drawAtMount(ctx, color, alpha) { _drawUtilityIcon(ctx, color, alpha, AMBER); }
}

export class EngineeringBayModule extends UtilityModule {
  constructor() {
    super();
    _initUtility(this, 'engineering-bay');
    this.description = 'Field engineering bay. Enables hull repair using scrap while stationary.';
    this.hasEngineeringBay = true;
  }
  drawAtMount(ctx, color, alpha) { _drawUtilityIcon(ctx, color, alpha, GREEN); }
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
  { id: 'mod-rpod-s',         category: 'WEAPON', create: () => new RocketPodModule('small', 'rkt') },
  { id: 'mod-rpod-l',         category: 'WEAPON', create: () => new RocketPodModule('large', 'rkt') },
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
  // Utility
  { id: 'expanded-hold-s',   category: 'UTILITY', create: () => new ExpandedHoldSmall() },
  { id: 'expanded-hold-l',   category: 'UTILITY', create: () => new ExpandedHoldLarge() },
  { id: 'aux-tank-s',        category: 'UTILITY', create: () => new AuxTankSmall() },
  { id: 'aux-tank-l',        category: 'UTILITY', create: () => new AuxTankLarge() },
  { id: 'stripped-weight-s',  category: 'UTILITY', create: () => new StrippedWeightSmall() },
  { id: 'stripped-weight-l',  category: 'UTILITY', create: () => new StrippedWeightLarge() },
  { id: 'extra-armor-s',     category: 'UTILITY', create: () => new ExtraArmorSmall() },
  { id: 'extra-armor-l',     category: 'UTILITY', create: () => new ExtraArmorLarge() },
  { id: 'salvage-bay',       category: 'UTILITY', create: () => new SalvageBayModule() },
  { id: 'engineering-bay',   category: 'UTILITY', create: () => new EngineeringBayModule() },
];
