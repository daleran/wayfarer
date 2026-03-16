// Ship module system — base classes for slot-based equipment.
// Concrete module subclasses live in data/modules/*.js.

import { ENGINES } from '@data/index.js';
import { Shape } from '@/rendering/draw.js';

// ── Shared shape template (used by EngineModule default drawAtMount) ─────────
const ENGINE_SHAPE = Shape.trapezoid(7, 5, 5);

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
    this.breachMultiplier = 1.0; // per-module breach vulnerability (>1 = fragile, <1 = reliable)
    // Sensor capabilities (set by sensor subclasses via _initSensor)
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

// ─── Engine base ──────────────────────────────────────────────────────────────
// Engine modules provide thrust for the ship's T/W calculation.

export class EngineModule extends ShipModule {
  /** @param {string} id — engine ID key in ENGINES table */
  constructor(id) {
    super();
    this.isEngine    = true;
    this.thrust      = 0;    // raw thrust force
    this.fuelEffMult = 1.0;  // fuel burn multiplier
    this._ship       = null;

    if (id) {
      const E = ENGINES[id];
      this.name            = id;
      this.displayName     = E.displayName;
      this.description     = E.description;
      this.weight          = E.weight;
      this.thrust          = E.thrust;
      this.fuelEffMult     = E.fuelEffMult;
      this.fuelDrainRate   = E.fuelDrainRate;
      this.powerDraw       = E.powerDraw;
      this.powerPriority   = 3; // engines: last to lose power
      this.size            = E.size === 'L' ? 'large' : 'small';
      this.breachMultiplier = E.breachMultiplier ?? 1.0;
    }
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

// ─── Utility base ─────────────────────────────────────────────────────────────
// Passive stat-modifying modules: cargo holds, fuel tanks, armor plates, weight stripping.
// onInstall/onRemove apply additive bonuses to ship stats; condition scales the bonus.

export class UtilityModule extends ShipModule {
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
    if (this.fuelBonus)  ship.fuelMax       = Math.max(0, (ship.fuelMax || 0)       - this.fuelBonus);
    if (this.armorBonus) {
      for (const arc of ['front', 'port', 'starboard', 'aft']) {
        ship.armorArcsMax[arc] = (ship.armorArcsMax[arc] || 0) - this.armorBonus;
        ship.armorArcs[arc] = Math.min(ship.armorArcs[arc] || 0, ship.armorArcsMax[arc]);
      }
    }
  }
}
