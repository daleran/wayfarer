// Ship module system — slot-based equipment that tracks power draw/output and passive effects.
// Weapon modules hold a real weapon instance; onInstall/onRemove wire it into ship.weapons.

import { Autocannon } from './weapons/autocannon.js';
import { Lance }      from './weapons/lance.js';
import { Cannon }     from './weapons/cannon.js';
import { RocketPodSmall } from './weapons/rocket.js';
import { RocketPodLarge } from './weapons/rocketLarge.js';
import { ENGINES, REACTORS, SENSORS, WEAPONS, UTILITIES } from '@data/index.js';
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
    this.name        = rocketSize === 'large' ? 'rocket-l' : 'rocket-s';
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

export class VintageMagplasmaSmall extends EngineModule {
  constructor() {
    super('vintage-magplasma-s');
  }
  drawAtMount(ctx, color, alpha) {
    // Nozzle — small rect at top (exhaust port)
    const nozzle = [
      { x: -1.5, y: -7 },
      { x: 1.5, y: -7 },
      { x: 1.5, y: -5 },
      { x: -1.5, y: -5 },
    ];
    ctx.beginPath();
    ctx.moveTo(nozzle[0].x, nozzle[0].y);
    for (let i = 1; i < nozzle.length; i++) ctx.lineTo(nozzle[i].x, nozzle[i].y);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.globalAlpha = alpha * 0.4;
    ctx.fill();
    ctx.globalAlpha = alpha * 0.8;
    ctx.lineWidth = 0.5;
    ctx.strokeStyle = color;
    ctx.stroke();

    // Coil housing — large square body with 4 vertical bars (magnetic coils)
    const body = [
      { x: -3.5, y: -5 },
      { x: 3.5, y: -5 },
      { x: 3.5, y: 3 },
      { x: -3.5, y: 3 },
    ];
    ctx.beginPath();
    ctx.moveTo(body[0].x, body[0].y);
    for (let i = 1; i < body.length; i++) ctx.lineTo(body[i].x, body[i].y);
    ctx.closePath();
    ctx.globalAlpha = alpha * 0.3;
    ctx.fill();
    ctx.globalAlpha = alpha * 0.8;
    ctx.stroke();

    // 4 vertical bars inside the housing
    ctx.lineWidth = 0.4;
    for (const bx of [-2, -0.7, 0.7, 2]) {
      ctx.beginPath();
      ctx.moveTo(bx, -4);
      ctx.lineTo(bx, 2);
      ctx.globalAlpha = alpha * 0.6;
      ctx.stroke();
    }

    // Intake bell — trapezoid, wider at top narrowing toward bottom
    const bell = [
      { x: -3.5, y: 3.5 },
      { x: 3.5, y: 3.5 },
      { x: 2, y: 8 },
      { x: -2, y: 8 },
    ];
    ctx.beginPath();
    ctx.moveTo(bell[0].x, bell[0].y);
    for (let i = 1; i < bell.length; i++) ctx.lineTo(bell[i].x, bell[i].y);
    ctx.closePath();
    ctx.globalAlpha = alpha * 0.4;
    ctx.fill();
    ctx.globalAlpha = alpha * 0.8;
    ctx.lineWidth = 0.5;
    ctx.stroke();
    ctx.globalAlpha = 1;
  }
}

export class VintageMagplasmaLarge extends EngineModule {
  constructor() {
    super('vintage-magplasma-l');
  }
  drawAtMount(ctx, color, alpha) {
    // Twin nozzles at top (dual exhaust ports)
    for (const nx of [-3.5, 3.5]) {
      const nozzle = [
        { x: nx - 1.8, y: -8 },
        { x: nx + 1.8, y: -8 },
        { x: nx + 1.8, y: -5.5 },
        { x: nx - 1.8, y: -5.5 },
      ];
      ctx.beginPath();
      ctx.moveTo(nozzle[0].x, nozzle[0].y);
      for (let i = 1; i < nozzle.length; i++) ctx.lineTo(nozzle[i].x, nozzle[i].y);
      ctx.closePath();
      ctx.fillStyle = color;
      ctx.globalAlpha = alpha * 0.4;
      ctx.fill();
      ctx.globalAlpha = alpha * 0.8;
      ctx.lineWidth = 0.5;
      ctx.strokeStyle = color;
      ctx.stroke();

      // Inner nozzle detail line
      ctx.lineWidth = 0.3;
      ctx.beginPath();
      ctx.moveTo(nx, -7.5);
      ctx.lineTo(nx, -5.8);
      ctx.globalAlpha = alpha * 0.5;
      ctx.stroke();
    }

    // Upper flange — wide collar between nozzles and coil housing
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.moveTo(-7, -5.5);
    ctx.lineTo(7, -5.5);
    ctx.lineTo(7, -4.5);
    ctx.lineTo(-7, -4.5);
    ctx.closePath();
    ctx.globalAlpha = alpha * 0.5;
    ctx.fill();
    ctx.globalAlpha = alpha * 0.8;
    ctx.stroke();

    // Flange bolt dots
    for (const bx of [-5.5, -3, -0.5, 2, 4.5]) {
      ctx.beginPath();
      ctx.arc(bx, -5, 0.35, 0, Math.PI * 2);
      ctx.globalAlpha = alpha * 0.4;
      ctx.fill();
    }

    // Coil housing — large rectangular body filling mount width
    const body = [
      { x: -7, y: -4.5 },
      { x: 7, y: -4.5 },
      { x: 7, y: 6 },
      { x: -7, y: 6 },
    ];
    ctx.beginPath();
    ctx.moveTo(body[0].x, body[0].y);
    for (let i = 1; i < body.length; i++) ctx.lineTo(body[i].x, body[i].y);
    ctx.closePath();
    ctx.globalAlpha = alpha * 0.3;
    ctx.fill();
    ctx.globalAlpha = alpha * 0.8;
    ctx.lineWidth = 0.6;
    ctx.stroke();

    // 8 vertical bars (magnetic coils)
    ctx.lineWidth = 0.45;
    for (const bx of [-5.5, -4, -2.5, -1, 1, 2.5, 4, 5.5]) {
      ctx.beginPath();
      ctx.moveTo(bx, -3.5);
      ctx.lineTo(bx, 5);
      ctx.globalAlpha = alpha * 0.55;
      ctx.stroke();
    }

    // 4 horizontal cross-bars (coil bracing)
    ctx.lineWidth = 0.35;
    for (const by of [-2.5, -0.5, 1.5, 3.5]) {
      ctx.beginPath();
      ctx.moveTo(-6, by);
      ctx.lineTo(6, by);
      ctx.globalAlpha = alpha * 0.35;
      ctx.stroke();
    }

    // Lower flange — wide collar between housing and intake bell
    ctx.lineWidth = 0.6;
    ctx.beginPath();
    ctx.moveTo(-8, 6.5);
    ctx.lineTo(8, 6.5);
    ctx.lineTo(8, 8);
    ctx.lineTo(-8, 8);
    ctx.closePath();
    ctx.globalAlpha = alpha * 0.5;
    ctx.fill();
    ctx.globalAlpha = alpha * 0.8;
    ctx.stroke();

    // Lower flange bolt line
    ctx.lineWidth = 0.3;
    for (const bx of [-6.5, -4.5, -2.5, -0.5, 1.5, 3.5, 5.5]) {
      ctx.beginPath();
      ctx.arc(bx, 7.25, 0.35, 0, Math.PI * 2);
      ctx.globalAlpha = alpha * 0.4;
      ctx.fill();
    }

    // Intake bell — extends well beyond mount box, narrowing downward
    const bell = [
      { x: -7, y: 8.5 },
      { x: 7, y: 8.5 },
      { x: 3.5, y: 20 },
      { x: -3.5, y: 20 },
    ];
    ctx.beginPath();
    ctx.moveTo(bell[0].x, bell[0].y);
    for (let i = 1; i < bell.length; i++) ctx.lineTo(bell[i].x, bell[i].y);
    ctx.closePath();
    ctx.globalAlpha = alpha * 0.4;
    ctx.fill();
    ctx.globalAlpha = alpha * 0.8;
    ctx.lineWidth = 0.7;
    ctx.stroke();

    // Inner bell vanes (5 flow guides converging inward)
    ctx.lineWidth = 0.35;
    for (const vx of [-4.5, -2, 0, 2, 4.5]) {
      ctx.beginPath();
      ctx.moveTo(vx, 9);
      ctx.lineTo(vx * 0.5, 19.5);
      ctx.globalAlpha = alpha * 0.3;
      ctx.stroke();
    }

    // Bell circumferential rings
    ctx.lineWidth = 0.3;
    for (const t of [0.25, 0.55, 0.8]) {
      const y = 8.5 + t * 11.5;
      const halfTop = 7;
      const halfBot = 3.5;
      const halfW = halfTop + t * (halfBot - halfTop);
      ctx.beginPath();
      ctx.moveTo(-halfW, y);
      ctx.lineTo(halfW, y);
      ctx.globalAlpha = alpha * 0.2;
      ctx.stroke();
    }

    ctx.globalAlpha = 1;
  }
}

export class MakeshiftThermalModule extends EngineModule {
  constructor() {
    super('makeshift-thermal-s');
  }
  drawAtMount(ctx, color, alpha) {
    ctx.fillStyle = color;
    ctx.strokeStyle = color;

    // Main housing — asymmetric, lopsided box (wider on left)
    const housing = [
      { x: -1.8, y: -3 },
      { x: -3.2, y: -1.5 },
      { x: -3.5, y: 3.5 },
      { x: 2.8, y: 3 },
      { x: 3, y: -0.5 },
      { x: 2, y: -2.5 },
    ];
    ctx.beginPath();
    ctx.moveTo(housing[0].x, housing[0].y);
    for (let i = 1; i < housing.length; i++) ctx.lineTo(housing[i].x, housing[i].y);
    ctx.closePath();
    ctx.globalAlpha = alpha * 0.35;
    ctx.fill();
    ctx.globalAlpha = alpha * 0.8;
    ctx.lineWidth = 0.5;
    ctx.stroke();

    // Patch plate — welded-on rectangle at a slight angle
    const patch = [
      { x: -2.5, y: -1 },
      { x: 0.5, y: -1.3 },
      { x: 0.8, y: 1.2 },
      { x: -2.2, y: 1.5 },
    ];
    ctx.beginPath();
    ctx.moveTo(patch[0].x, patch[0].y);
    for (let i = 1; i < patch.length; i++) ctx.lineTo(patch[i].x, patch[i].y);
    ctx.closePath();
    ctx.globalAlpha = alpha * 0.2;
    ctx.fill();
    ctx.globalAlpha = alpha * 0.6;
    ctx.lineWidth = 0.4;
    ctx.stroke();

    // Scattered bolts — irregular placement
    ctx.globalAlpha = alpha * 0.6;
    for (const [bx, by] of [
      [-2.5, -2], [1.5, -1.8], [-2.8, 2.5], [2, 2.2],
      [-1, 0.3], [1.8, 0.5], [-0.5, -1.2],
    ]) {
      ctx.beginPath();
      ctx.arc(bx, by, 0.35, 0, Math.PI * 2);
      ctx.fill();
    }

    // Bracket stub — one side only (asymmetric mounting)
    ctx.beginPath();
    ctx.rect(-3.5, 0.5, -1.5, 2);
    ctx.globalAlpha = alpha * 0.4;
    ctx.fill();
    ctx.globalAlpha = alpha * 0.7;
    ctx.lineWidth = 0.4;
    ctx.stroke();

    // Bell nozzle — straight flare, but rough
    const bell = [
      { x: -2.2, y: 4 },
      { x: 2.2, y: 4 },
      { x: 3.3, y: 9.5 },
      { x: -3.3, y: 9.5 },
    ];
    ctx.beginPath();
    ctx.moveTo(bell[0].x, bell[0].y);
    for (let i = 1; i < bell.length; i++) ctx.lineTo(bell[i].x, bell[i].y);
    ctx.closePath();
    ctx.globalAlpha = alpha * 0.4;
    ctx.fill();
    ctx.globalAlpha = alpha * 0.8;
    ctx.lineWidth = 0.5;
    ctx.stroke();

    // Weld seam across the bell (visible repair)
    ctx.beginPath();
    ctx.moveTo(-2.5, 6);
    ctx.lineTo(-0.5, 6.3);
    ctx.lineTo(1, 5.8);
    ctx.lineTo(2.5, 6.2);
    ctx.globalAlpha = alpha * 0.4;
    ctx.lineWidth = 0.6;
    ctx.stroke();

    // Dent mark on bell — short diagonal scratch
    ctx.beginPath();
    ctx.moveTo(1.5, 7.5);
    ctx.lineTo(2.5, 8.2);
    ctx.globalAlpha = alpha * 0.3;
    ctx.lineWidth = 0.4;
    ctx.stroke();

    ctx.globalAlpha = 1;
  }
}

export class StandardRocketSmall extends EngineModule {
  constructor() {
    super('standard-rocket-s');
  }
  drawAtMount(ctx, color, alpha) {
    ctx.fillStyle = color;
    ctx.strokeStyle = color;

    // Chamfered housing box
    const housing = [
      { x: -2.2, y: -2 },
      { x: -3, y: -1 },
      { x: -3, y: 3 },
      { x: 3, y: 3 },
      { x: 3, y: -1 },
      { x: 2.2, y: -2 },
    ];
    ctx.beginPath();
    ctx.moveTo(housing[0].x, housing[0].y);
    for (let i = 1; i < housing.length; i++) ctx.lineTo(housing[i].x, housing[i].y);
    ctx.closePath();
    ctx.globalAlpha = alpha * 0.4;
    ctx.fill();
    ctx.globalAlpha = alpha * 0.8;
    ctx.lineWidth = 0.5;
    ctx.stroke();

    // Single bracing line
    ctx.lineWidth = 0.3;
    ctx.beginPath();
    ctx.moveTo(-2.5, 0.5);
    ctx.lineTo(2.5, 0.5);
    ctx.globalAlpha = alpha * 0.3;
    ctx.stroke();

    // Bell nozzle
    const bell = [
      { x: -2, y: 3.5 },
      { x: 2, y: 3.5 },
      { x: 3.3, y: 9.5 },
      { x: -3.3, y: 9.5 },
    ];
    ctx.beginPath();
    ctx.moveTo(bell[0].x, bell[0].y);
    for (let i = 1; i < bell.length; i++) ctx.lineTo(bell[i].x, bell[i].y);
    ctx.closePath();
    ctx.globalAlpha = alpha * 0.45;
    ctx.fill();
    ctx.globalAlpha = alpha * 0.8;
    ctx.lineWidth = 0.6;
    ctx.stroke();

    ctx.globalAlpha = 1;
  }
}

export class CruisingIonSmall extends EngineModule {
  constructor() {
    super('cruising-ion-s');
  }
  drawAtMount(ctx, color, alpha) {
    ctx.fillStyle = color;
    ctx.strokeStyle = color;

    // Cylindrical body — tall rect with ring bands
    const body = [
      { x: -3, y: -6 },
      { x: 3, y: -6 },
      { x: 3, y: 4 },
      { x: -3, y: 4 },
    ];
    ctx.beginPath();
    ctx.moveTo(body[0].x, body[0].y);
    for (let i = 1; i < body.length; i++) ctx.lineTo(body[i].x, body[i].y);
    ctx.closePath();
    ctx.globalAlpha = alpha * 0.25;
    ctx.fill();
    ctx.globalAlpha = alpha * 0.8;
    ctx.lineWidth = 0.5;
    ctx.stroke();

    // Ring bands along the body
    ctx.lineWidth = 0.4;
    for (const by of [-4.5, -2.5, -0.5, 1.5, 3]) {
      ctx.beginPath();
      ctx.moveTo(-3, by);
      ctx.lineTo(3, by);
      ctx.globalAlpha = alpha * 0.35;
      ctx.stroke();
    }

    // Magnet stubs — small rectangles protruding from sides
    ctx.lineWidth = 0.4;
    for (const [mx, my] of [[-3, -3.5], [-3, 0], [3, -3.5], [3, 0]]) {
      const dir = mx < 0 ? -1 : 1;
      ctx.beginPath();
      ctx.rect(mx, my - 0.8, dir * 1.5, 1.6);
      ctx.globalAlpha = alpha * 0.5;
      ctx.fill();
      ctx.globalAlpha = alpha * 0.7;
      ctx.stroke();
    }

    // Grid channel — short, narrow, straight exhaust
    const channel = [
      { x: -2.2, y: 4.5 },
      { x: 2.2, y: 4.5 },
      { x: 2.2, y: 7.8 },
      { x: -2.2, y: 7.8 },
    ];
    ctx.beginPath();
    ctx.moveTo(channel[0].x, channel[0].y);
    for (let i = 1; i < channel.length; i++) ctx.lineTo(channel[i].x, channel[i].y);
    ctx.closePath();
    ctx.globalAlpha = alpha * 0.2;
    ctx.fill();
    ctx.globalAlpha = alpha * 0.7;
    ctx.lineWidth = 0.5;
    ctx.stroke();

    // Ion grid plates — horizontal lines across the channel (edge-on view)
    ctx.lineWidth = 0.5;
    for (const t of [0.25, 0.55, 0.85]) {
      const y = 4.5 + t * 3.3;
      ctx.beginPath();
      ctx.moveTo(-2.2, y);
      ctx.lineTo(2.2, y);
      ctx.globalAlpha = alpha * 0.55;
      ctx.stroke();
    }

    // Central cathode channel line
    ctx.lineWidth = 0.3;
    ctx.beginPath();
    ctx.moveTo(0, 4.5);
    ctx.lineTo(0, 7.8);
    ctx.globalAlpha = alpha * 0.3;
    ctx.stroke();

    ctx.globalAlpha = 1;
  }
}

export class CruisingIonLarge extends EngineModule {
  constructor() {
    super('cruising-ion-l');
  }
  drawAtMount(ctx, color, alpha) {
    ctx.fillStyle = color;
    ctx.strokeStyle = color;

    // Cylindrical body — fills most of the large mount box
    const body = [
      { x: -5.5, y: -7 },
      { x: 5.5, y: -7 },
      { x: 5.5, y: 6 },
      { x: -5.5, y: 6 },
    ];
    ctx.beginPath();
    ctx.moveTo(body[0].x, body[0].y);
    for (let i = 1; i < body.length; i++) ctx.lineTo(body[i].x, body[i].y);
    ctx.closePath();
    ctx.globalAlpha = alpha * 0.25;
    ctx.fill();
    ctx.globalAlpha = alpha * 0.8;
    ctx.lineWidth = 0.6;
    ctx.stroke();

    // Ring bands along the body
    ctx.lineWidth = 0.45;
    for (const by of [-5.5, -3.5, -1.5, 0.5, 2.5, 4.5]) {
      ctx.beginPath();
      ctx.moveTo(-5.5, by);
      ctx.lineTo(5.5, by);
      ctx.globalAlpha = alpha * 0.3;
      ctx.stroke();
    }

    // Longitudinal surface lines
    ctx.lineWidth = 0.25;
    for (const bx of [-3.5, -1.5, 1.5, 3.5]) {
      ctx.beginPath();
      ctx.moveTo(bx, -6.5);
      ctx.lineTo(bx, 5.5);
      ctx.globalAlpha = alpha * 0.15;
      ctx.stroke();
    }

    // Magnet stubs — 3 per side
    ctx.lineWidth = 0.5;
    for (const my of [-4.5, -1, 2.5]) {
      for (const side of [-1, 1]) {
        const mx = side * 5.5;
        ctx.beginPath();
        ctx.rect(mx, my - 1, side * 2.5, 2);
        ctx.globalAlpha = alpha * 0.45;
        ctx.fill();
        ctx.globalAlpha = alpha * 0.7;
        ctx.stroke();
        // Magnet detail line
        ctx.lineWidth = 0.3;
        ctx.beginPath();
        ctx.moveTo(mx + side * 0.8, my - 0.5);
        ctx.lineTo(mx + side * 0.8, my + 0.5);
        ctx.globalAlpha = alpha * 0.3;
        ctx.stroke();
        ctx.lineWidth = 0.5;
      }
    }

    // Mounting bolts on body
    ctx.globalAlpha = alpha * 0.4;
    for (const [bx, by] of [[-4.5, -6.2], [4.5, -6.2], [-4.5, 5.2], [4.5, 5.2]]) {
      ctx.beginPath();
      ctx.arc(bx, by, 0.5, 0, Math.PI * 2);
      ctx.fill();
    }

    // Grid housing flange
    ctx.beginPath();
    ctx.moveTo(-6.5, 6.5);
    ctx.lineTo(6.5, 6.5);
    ctx.lineTo(6.5, 7.5);
    ctx.lineTo(-6.5, 7.5);
    ctx.closePath();
    ctx.globalAlpha = alpha * 0.5;
    ctx.fill();
    ctx.globalAlpha = alpha * 0.8;
    ctx.lineWidth = 0.6;
    ctx.stroke();

    // Flange bolts
    ctx.globalAlpha = alpha * 0.4;
    for (const bx of [-5, -2.5, 0, 2.5, 5]) {
      ctx.beginPath();
      ctx.arc(bx, 7, 0.4, 0, Math.PI * 2);
      ctx.fill();
    }

    // Grid channel — short, narrow, straight exhaust extending beyond mount
    const channel = [
      { x: -4, y: 8 },
      { x: 4, y: 8 },
      { x: 4, y: 14 },
      { x: -4, y: 14 },
    ];
    ctx.beginPath();
    ctx.moveTo(channel[0].x, channel[0].y);
    for (let i = 1; i < channel.length; i++) ctx.lineTo(channel[i].x, channel[i].y);
    ctx.closePath();
    ctx.globalAlpha = alpha * 0.2;
    ctx.fill();
    ctx.globalAlpha = alpha * 0.7;
    ctx.lineWidth = 0.7;
    ctx.stroke();

    // Ion grid plates — horizontal lines across the channel (edge-on view)
    ctx.lineWidth = 0.6;
    for (const t of [0.15, 0.4, 0.65, 0.9]) {
      const y = 8 + t * 6;
      ctx.beginPath();
      ctx.moveTo(-4, y);
      ctx.lineTo(4, y);
      ctx.globalAlpha = alpha * 0.5;
      ctx.stroke();
    }

    // Cathode channel lines — 3 longitudinal lines through grid
    ctx.lineWidth = 0.3;
    for (const vx of [-1.8, 0, 1.8]) {
      ctx.beginPath();
      ctx.moveTo(vx, 8);
      ctx.lineTo(vx, 14);
      ctx.globalAlpha = alpha * 0.25;
      ctx.stroke();
    }

    // Exhaust lip
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(-4, 14);
    ctx.lineTo(4, 14);
    ctx.globalAlpha = alpha * 0.6;
    ctx.stroke();

    ctx.globalAlpha = 1;
  }
}

export class StandardRocketLarge extends EngineModule {
  constructor() {
    super('standard-rocket-l');
  }
  drawAtMount(ctx, color, alpha) {
    ctx.fillStyle = color;
    ctx.strokeStyle = color;

    // Chamfered housing box — fills large mount
    const housing = [
      { x: -5, y: -7 },
      { x: -7, y: -4 },
      { x: -7, y: 5 },
      { x: 7, y: 5 },
      { x: 7, y: -4 },
      { x: 5, y: -7 },
    ];
    ctx.beginPath();
    ctx.moveTo(housing[0].x, housing[0].y);
    for (let i = 1; i < housing.length; i++) ctx.lineTo(housing[i].x, housing[i].y);
    ctx.closePath();
    ctx.globalAlpha = alpha * 0.4;
    ctx.fill();
    ctx.globalAlpha = alpha * 0.8;
    ctx.lineWidth = 0.6;
    ctx.stroke();

    // Two bracing lines
    ctx.lineWidth = 0.35;
    for (const by of [-1, 3]) {
      ctx.beginPath();
      ctx.moveTo(-6, by);
      ctx.lineTo(6, by);
      ctx.globalAlpha = alpha * 0.3;
      ctx.stroke();
    }

    // Bell nozzle — extends beyond mount box
    const bell = [
      { x: -5, y: 5.5 },
      { x: 5, y: 5.5 },
      { x: 8, y: 20 },
      { x: -8, y: 20 },
    ];
    ctx.beginPath();
    ctx.moveTo(bell[0].x, bell[0].y);
    for (let i = 1; i < bell.length; i++) ctx.lineTo(bell[i].x, bell[i].y);
    ctx.closePath();
    ctx.globalAlpha = alpha * 0.4;
    ctx.fill();
    ctx.globalAlpha = alpha * 0.8;
    ctx.lineWidth = 0.7;
    ctx.stroke();

    // Single center rib
    ctx.lineWidth = 0.3;
    ctx.beginPath();
    ctx.moveTo(0, 6);
    ctx.lineTo(0, 19.5);
    ctx.globalAlpha = alpha * 0.25;
    ctx.stroke();

    ctx.globalAlpha = 1;
  }
}

export class MilspecRocketSmall extends EngineModule {
  constructor() {
    super('milspec-rocket-s');
  }
  drawAtMount(ctx, color, alpha) {
    ctx.fillStyle = color;
    ctx.strokeStyle = color;

    // Heavy armored housing — thick-walled box with reinforced corners
    const housing = [
      { x: -1.8, y: -3.5 },
      { x: -3.5, y: -2 },
      { x: -3.5, y: 3 },
      { x: 3.5, y: 3 },
      { x: 3.5, y: -2 },
      { x: 1.8, y: -3.5 },
    ];
    ctx.beginPath();
    ctx.moveTo(housing[0].x, housing[0].y);
    for (let i = 1; i < housing.length; i++) ctx.lineTo(housing[i].x, housing[i].y);
    ctx.closePath();
    ctx.globalAlpha = alpha * 0.45;
    ctx.fill();
    ctx.globalAlpha = alpha * 0.9;
    ctx.lineWidth = 0.8;
    ctx.stroke();

    // Corner gussets — reinforcement triangles
    ctx.lineWidth = 0.5;
    ctx.globalAlpha = alpha * 0.4;
    for (const [gx, gy, dx, dy] of [[-3.5, -2, 1.2, 0], [3.5, -2, -1.2, 0], [-3.5, 3, 1.2, 0], [3.5, 3, -1.2, 0]]) {
      ctx.beginPath();
      ctx.moveTo(gx, gy);
      ctx.lineTo(gx + dx, gy);
      ctx.lineTo(gx, gy + dy);
      ctx.closePath();
      ctx.fill();
    }

    // Heavy bracing lines
    ctx.lineWidth = 0.5;
    for (const by of [-1.2, 1.2]) {
      ctx.beginPath();
      ctx.moveTo(-3, by);
      ctx.lineTo(3, by);
      ctx.globalAlpha = alpha * 0.4;
      ctx.stroke();
    }

    // Mounting bolts — heavy rivets
    ctx.globalAlpha = alpha * 0.55;
    for (const [bx, by] of [[-2.5, -2.2], [2.5, -2.2], [-2.8, 2.2], [2.8, 2.2]]) {
      ctx.beginPath();
      ctx.arc(bx, by, 0.45, 0, Math.PI * 2);
      ctx.fill();
    }

    // Thick throat collar
    ctx.beginPath();
    ctx.moveTo(-3.5, 3.2);
    ctx.lineTo(3.5, 3.2);
    ctx.lineTo(3.5, 4.2);
    ctx.lineTo(-3.5, 4.2);
    ctx.closePath();
    ctx.globalAlpha = alpha * 0.5;
    ctx.fill();
    ctx.globalAlpha = alpha * 0.9;
    ctx.lineWidth = 0.6;
    ctx.stroke();

    // Bell nozzle — shorter and stockier than standard
    const bell = [
      { x: -2.5, y: 4.5 },
      { x: 2.5, y: 4.5 },
      { x: 3.8, y: 9 },
      { x: -3.8, y: 9 },
    ];
    ctx.beginPath();
    ctx.moveTo(bell[0].x, bell[0].y);
    for (let i = 1; i < bell.length; i++) ctx.lineTo(bell[i].x, bell[i].y);
    ctx.closePath();
    ctx.globalAlpha = alpha * 0.45;
    ctx.fill();
    ctx.globalAlpha = alpha * 0.9;
    ctx.lineWidth = 0.7;
    ctx.stroke();

    // Bell stiffening ribs
    ctx.lineWidth = 0.3;
    for (const vx of [-1, 1]) {
      const spread = vx / 2.5 * 1.3;
      ctx.beginPath();
      ctx.moveTo(vx, 5);
      ctx.lineTo(vx + spread, 8.7);
      ctx.globalAlpha = alpha * 0.3;
      ctx.stroke();
    }

    // Bell circumferential band
    ctx.lineWidth = 0.4;
    const bandY = 7;
    const bandHW = 2.5 + (7 - 4.5) / 4.5 * 1.3;
    ctx.beginPath();
    ctx.moveTo(-bandHW, bandY);
    ctx.lineTo(bandHW, bandY);
    ctx.globalAlpha = alpha * 0.35;
    ctx.stroke();

    // Heavy bell lip
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(-3.8, 9);
    ctx.lineTo(3.8, 9);
    ctx.globalAlpha = alpha * 0.6;
    ctx.stroke();

    ctx.globalAlpha = 1;
  }
}

export class MilspecRocketLarge extends EngineModule {
  constructor() {
    super('milspec-rocket-l');
  }
  drawAtMount(ctx, color, alpha) {
    ctx.fillStyle = color;
    ctx.strokeStyle = color;

    // Heavy armored housing — thick walls, reinforced corners
    const housing = [
      { x: -4, y: -7 },
      { x: -7, y: -4 },
      { x: -7, y: 5 },
      { x: 7, y: 5 },
      { x: 7, y: -4 },
      { x: 4, y: -7 },
    ];
    ctx.beginPath();
    ctx.moveTo(housing[0].x, housing[0].y);
    for (let i = 1; i < housing.length; i++) ctx.lineTo(housing[i].x, housing[i].y);
    ctx.closePath();
    ctx.globalAlpha = alpha * 0.45;
    ctx.fill();
    ctx.globalAlpha = alpha * 0.9;
    ctx.lineWidth = 1;
    ctx.stroke();

    // Corner gussets — heavy reinforcement triangles
    ctx.lineWidth = 0.6;
    ctx.globalAlpha = alpha * 0.4;
    for (const [gx, gy, dx, dy] of [
      [-7, -4, 2, 0], [7, -4, -2, 0],
      [-7, 5, 2, 0], [7, 5, -2, 0],
    ]) {
      ctx.beginPath();
      ctx.moveTo(gx, gy);
      ctx.lineTo(gx + dx, gy);
      ctx.lineTo(gx, gy + dy);
      ctx.closePath();
      ctx.fill();
    }

    // Heavy bracing lines
    ctx.lineWidth = 0.5;
    for (const by of [-1.5, 1, 3.5]) {
      ctx.beginPath();
      ctx.moveTo(-6, by);
      ctx.lineTo(6, by);
      ctx.globalAlpha = alpha * 0.35;
      ctx.stroke();
    }

    // Mounting bolts — heavy rivets
    ctx.globalAlpha = alpha * 0.55;
    for (const [bx, by] of [
      [-5.5, -3], [5.5, -3], [-5.5, 3.5], [5.5, 3.5],
      [-3, -6], [3, -6],
    ]) {
      ctx.beginPath();
      ctx.arc(bx, by, 0.55, 0, Math.PI * 2);
      ctx.fill();
    }

    // Armor side rails — thickened strips along housing edges
    ctx.lineWidth = 1.2;
    ctx.globalAlpha = alpha * 0.3;
    ctx.beginPath();
    ctx.moveTo(-7, -3.5);
    ctx.lineTo(-7, 4.5);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(7, -3.5);
    ctx.lineTo(7, 4.5);
    ctx.stroke();

    // Thick throat collar
    ctx.beginPath();
    ctx.moveTo(-7.5, 5.5);
    ctx.lineTo(7.5, 5.5);
    ctx.lineTo(7.5, 7);
    ctx.lineTo(-7.5, 7);
    ctx.closePath();
    ctx.globalAlpha = alpha * 0.5;
    ctx.fill();
    ctx.globalAlpha = alpha * 0.9;
    ctx.lineWidth = 0.8;
    ctx.stroke();

    // Bell nozzle — stocky and wide, extends beyond mount
    const bell = [
      { x: -5.5, y: 7.5 },
      { x: 5.5, y: 7.5 },
      { x: 8.5, y: 18 },
      { x: -8.5, y: 18 },
    ];
    ctx.beginPath();
    ctx.moveTo(bell[0].x, bell[0].y);
    for (let i = 1; i < bell.length; i++) ctx.lineTo(bell[i].x, bell[i].y);
    ctx.closePath();
    ctx.globalAlpha = alpha * 0.45;
    ctx.fill();
    ctx.globalAlpha = alpha * 0.9;
    ctx.lineWidth = 0.8;
    ctx.stroke();

    // Bell stiffening ribs
    ctx.lineWidth = 0.4;
    for (const vx of [-3, -1, 1, 3]) {
      const spread = vx / 5.5 * 3;
      ctx.beginPath();
      ctx.moveTo(vx, 8);
      ctx.lineTo(vx + spread, 17.5);
      ctx.globalAlpha = alpha * 0.25;
      ctx.stroke();
    }

    // Bell circumferential bands
    ctx.lineWidth = 0.45;
    for (const t of [0.35, 0.7]) {
      const y = 7.5 + t * 10.5;
      const halfW = 5.5 + t * 3;
      ctx.beginPath();
      ctx.moveTo(-halfW, y);
      ctx.lineTo(halfW, y);
      ctx.globalAlpha = alpha * 0.3;
      ctx.stroke();
    }

    // Heavy bell lip
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(-8.5, 18);
    ctx.lineTo(8.5, 18);
    ctx.globalAlpha = alpha * 0.6;
    ctx.stroke();

    ctx.globalAlpha = 1;
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
  mod.size             = S.size === 'L' ? 'large' : 'small';
  mod.powerPriority    = 1; // sensors: first to lose power
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
    this.description = 'Targeting assist with lead indicators and integrity readout. Range: 2000.';
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
    this.description = 'Deep-space array. Reveals salvage and module details at extreme range.';
  }
  drawAtMount(ctx, color, alpha) { _drawSensorIcon(ctx, color, alpha); }
}

export class BattleDirectionCenterModule extends ShipModule {
  constructor() {
    super();
    _initSensor(this, 'battle-direction-center');
    this.description = 'Full-spectrum tactical suite. Lead indicators, telemetry, and module scans.';
  }
  drawAtMount(ctx, color, alpha) { _drawSensorIcon(ctx, color, alpha); }
}

export class EnforcementScannerModule extends ShipModule {
  constructor() {
    super();
    _initSensor(this, 'enforcement-scanner');
    this.description = 'Inspection-grade scanner. Module readout and integrity pips at medium range.';
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
    this.isCargoExpansion = true;
  }
  drawAtMount(ctx, color, alpha) { _drawUtilityIcon(ctx, color, alpha, AMBER); }
}

export class ExpandedHoldLarge extends UtilityModule {
  constructor() {
    super();
    _initUtility(this, 'expanded-hold-l');
    this.description = 'Full cargo bay extension. Major capacity gain — significant mass and armor penalty.';
    this.isCargoExpansion = true;
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

