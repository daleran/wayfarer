import { Entity } from './entity.js';
import { RELATION_COLORS, RED, WHITE, AMBER, BLACK, DIM_TEXT, armorArcColor, conditionColor } from '@/rendering/colors.js';
import { trail as drawTrail, FLAVOR, PROMPT } from '@/rendering/draw.js';
import { drawEmptyMount, drawMountHighlight } from '@/rendering/moduleVisuals.js';
import { BASE_SPEED, BASE_ACCELERATION, BASE_TURN_RATE, SPEED_FACTOR,
         BASE_HULL, BASE_CARGO,
         BASE_ARMOR, BASE_FUEL_MAX, BASE_FUEL_EFFICIENCY,
         THROTTLE_LEVELS, THROTTLE_RATIOS,
         BASE_HULL_WEIGHT, FUEL_WEIGHT_PER_UNIT,
         TW_ACCEL_SENSITIVITY, TW_SPEED_SENSITIVITY, TW_TURN_SENSITIVITY,
         TW_MULT_MIN, TW_MULT_MAX } from '@data/compiledData.js';

const TRAIL_MAX_POINTS = 120;

export class Ship extends Entity {
  constructor(x, y) {
    super(x, y);

    // Identity
    this.isShip = true;
    this.faction = 'neutral';
    this.relation = 'none';   // 'none' | 'player' | 'friendly' | 'neutral' | 'hostile' | 'enemy'
    this.ai = null;            // set to { ...AI_TEMPLATES.x } in subclass constructors
    this.shipType = null;

    // Quad-arc armor: front (bow), port (left), starboard (right), aft (stern)
    this.armorArcs    = { front: 100, port: 100, starboard: 100, aft: 60 };
    this.armorArcsMax = { front: 100, port: 100, starboard: 100, aft: 60 };
    this._arcHitTimestamps = {};

    // Internal system integrity (0–100)
    this.reactorIntegrity = 100;
    this.engineIntegrity  = 100;
    this.sensorIntegrity  = 100;

    // Hull
    this.hullMax     = 200;
    this.hullCurrent = 200;

    // Degradation flags — updated once per tick in update()
    this._engineCutout  = false;
    this._weaponsOffline = false;
    this._fireCooldownMult = 1.0;

    // Damage effect timers — driven by game._updateDamageEffects()
    this._smokeTimer = 0;
    this._sparkTimer = 0;

    // Hit flash timer — brief red overlay on damage
    this._hitFlashTimer = 0;

    // Movement
    this.speedMax    = 120;
    this.acceleration = 30;
    this.turnRate    = 2.5; // radians per second
    this.speed       = 0;   // current speed (scalar, forward direction)

    // Throttle: 6 levels, 0-5 index
    this.throttleLevels  = THROTTLE_LEVELS;
    this.throttleLevel   = 0;
    this._throttleRatios = [...THROTTLE_RATIOS];

    // Cargo
    this.cargoCapacity = 50;

    // Fuel
    this.fuelMax = BASE_FUEL_MAX;
    this.fuelEfficiency = BASE_FUEL_EFFICIENCY;

    // Capabilities (set by modules)
    this.capabilities = {
      minimap_stations: false,
      minimap_ships: false,
      sensor_range: 0,
      lead_indicators: false,
      health_pips: false,
      salvage_detail: false,
      trajectory_line: false,
      enemy_telemetry: false,
      module_inspection: false,
      has_salvage_bay: false,
      has_engineering_bay: false,
    };

    // Input state (set by game each frame)
    this.rotationInput = 0; // -1 left, +1 right, 0 none

    // Collision / visual radius (overridden by subclasses via getBounds)
    this.radius = 20;

    // Modules (set by subclass constructors)
    this.moduleSlots = null;

    // Weapons
    this.weapons = [];
    this.primaryWeaponIdx   = 0;
    this.secondaryWeaponIdx = 0;

    // Derelict support — when crew === 0 the ship is inert wreckage
    this.crew = 1;
    this.lootTable = null;
    this.salvageTime = 0;
    this.salvaged = false;
    this.loreText = null;
    this.interactionRadius = 0;
    this.isNearby = false;
    this.canSalvage = false;
    this._salvageBayActive = false;
    this._loreAlpha = 0;

    // Identity metadata
    this.name = null;           // unique vessel name (e.g. "Iron Fang")
    this.shipClassName = null;  // hull class (e.g. "Onyx Class Tug") — set by ship class constructor
    this.isBountyTarget = false;

    // Turret tracking — world-space target set by game each frame (player only)
    this._turretTargetWorld = null;

    // Ship screen inventory mode — when true, mount points render in CYAN
    this._inventoryMode = false;

    // Spawn/respawn metadata (set dynamically by map loaders)
    this.homePosition = null;
    this._canRespawn = false;

    // Engine trail — array of arrays, one per engine
    this._trails     = [];
    this._trailTimer = 0;
  }

  // Color getters — derived entirely from this.relation.
  // Change this.relation and all hull/engine colors update automatically.
  get hullFill()    { return (RELATION_COLORS[this.relation] ?? RELATION_COLORS.none).fill; }
  get hullStroke()  { return (RELATION_COLORS[this.relation] ?? RELATION_COLORS.none).stroke; }
  get engineColor() { return (RELATION_COLORS[this.relation] ?? RELATION_COLORS.none).engine; }

  // ── Directional armor rendering helpers ─────────────────────────────────────
  // Used by _drawShape in every ship class to show directional health on the hull.
  // When relation === 'player': hull fill is health-based color, outline is per-arc color.

  // Returns a health-based rgba fill color for the hull interior.
  _playerHullFill() {
    const r = this.hullMax > 0 ? this.hullCurrent / this.hullMax : 1;
    if (r > 0.75) return 'rgba(0,255,102,0.20)';
    if (r > 0.50) return 'rgba(200,220,0,0.20)';
    if (r > 0.25) return 'rgba(255,140,0,0.22)';
    return 'rgba(255,60,60,0.26)';
  }

  // Strokes the CURRENT ctx path using the arc health color for arcKey.
  // Returns true if player (arc color applied). Returns false if NPC (caller should stroke normally).
  _strokeArcCurrent(ctx, arcKey) {
    if (this.relation !== 'player') return false;
    const maxVal = this.armorArcsMax[arcKey] || 1;
    const curVal = this.armorArcs[arcKey] || 0;
    const ratio  = curVal / maxVal;
    const hitAge = Date.now() - (this._arcHitTimestamps[arcKey] || 0);
    const flash  = hitAge < 150;
    ctx.strokeStyle = flash ? WHITE : armorArcColor(ratio);
    ctx.lineWidth   = 1.5;
    ctx.globalAlpha = flash ? 1.0 : Math.max(0.3, ratio * 0.7 + 0.3);
    ctx.stroke();
    ctx.globalAlpha = 1;
    return true;
  }

  // Draws arc-colored open-path outline SEGMENTS of a hull polygon for player ships.
  // arcSegmentMap: { front: [i0,i1,...], starboard: [...], aft: [...], port: [...] }
  // Returns true if drawn (player), false otherwise (NPC — caller should ctx.stroke() the full path).
  _drawHullArcs(ctx, hullPoints, arcSegmentMap) {
    if (this.relation !== 'player') return false;
    const now = Date.now();
    ctx.lineWidth = 1.5;
    for (const [arcKey, indices] of Object.entries(arcSegmentMap)) {
      const maxVal = this.armorArcsMax[arcKey] || 1;
      const curVal = this.armorArcs[arcKey] || 0;
      const ratio  = curVal / maxVal;
      const hitAge = now - (this._arcHitTimestamps[arcKey] || 0);
      const flash  = hitAge < 150;
      ctx.beginPath();
      ctx.moveTo(hullPoints[indices[0]].x, hullPoints[indices[0]].y);
      for (let i = 1; i < indices.length; i++) {
        ctx.lineTo(hullPoints[indices[i]].x, hullPoints[indices[i]].y);
      }
      ctx.strokeStyle = flash ? WHITE : armorArcColor(ratio);
      ctx.globalAlpha = flash ? 1.0 : Math.max(0.3, ratio * 0.7 + 0.3);
      ctx.stroke();
      ctx.globalAlpha = 1;
    }
    return true;
  }

  // Fills and strokes a hull polygon with player arc coloring or NPC flat style.
  // Traces the hull path, fills, then either draws arc-colored segments (player) or a plain stroke (NPC).
  _fillAndStrokeHull(ctx, hullPoints, arcMap) {
    ctx.beginPath();
    ctx.moveTo(hullPoints[0].x, hullPoints[0].y);
    for (let i = 1; i < hullPoints.length; i++) {
      ctx.lineTo(hullPoints[i].x, hullPoints[i].y);
    }
    ctx.closePath();
    if (this.relation === 'player') {
      ctx.fillStyle = this._playerHullFill();
      ctx.fill();
      this._drawHullArcs(ctx, hullPoints, arcMap);
    } else {
      ctx.fillStyle = this.hullFill;
      ctx.fill();
      ctx.strokeStyle = this.hullStroke;
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }
  }

  // Backward-compat getters: average of all 4 arcs
  get armorCurrent() {
    const { front, port, starboard, aft } = this.armorArcs;
    return (front + port + starboard + aft) / 4;
  }

  get armorMax() {
    const { front, port, starboard, aft } = this.armorArcsMax;
    return (front + port + starboard + aft) / 4;
  }

  // Setters: scale all arcs proportionally so the average equals the given value.
  // Allows subclasses to write this.armorMax = X without needing per-arc knowledge.
  set armorMax(value) {
    const avg = this.armorMax;
    const scale = avg > 0 ? value / avg : 1;
    for (const k of Object.keys(this.armorArcsMax)) {
      this.armorArcsMax[k] = Math.round(this.armorArcsMax[k] * scale);
    }
  }

  set armorCurrent(value) {
    const maxAvg = this.armorMax;
    const ratio = maxAvg > 0 ? value / maxAvg : 1;
    for (const k of Object.keys(this.armorArcs)) {
      this.armorArcs[k] = Math.round(this.armorArcsMax[k] * ratio);
    }
  }

  // Override in subclasses to define engine exhaust positions (local coords)
  get _engineOffsets() {
    return [{ x: 0, y: 8 }];
  }

  // Override in ship class subclasses to define module mount positions.
  // Returns null for ships without mount points (graceful fallback).
  get _mountPoints() {
    return null;
  }

  get isDestroyed() {
    return !this.active;
  }

  get isDerelict() {
    return this.crew === 0;
  }

  get effectiveSpeedMax() {
    const ratio = this.hullCurrent / this.hullMax;
    if (ratio <= 0.05) return this.speedMax * 0.1;
    if (ratio <= 0.10) return this.speedMax * 0.5;
    if (ratio <= 0.15) return this.speedMax * 0.75;  // engines stuck at 3/4
    if (this._engineCutout) return this.speedMax * 0.4;
    return this.speedMax;
  }

  get effectiveTurnRate() {
    const ratio = this.hullCurrent / this.hullMax;
    if (ratio <= 0.30) return this.turnRate * 0.7;
    return this.turnRate;
  }

  get targetSpeed() {
    return this._throttleRatios[this.throttleLevel] * this.effectiveSpeedMax;
  }

  get _primaryWeapons() {
    return this.weapons.filter(w => !w.isAutoFire && !w.isSecondary);
  }

  get _secondaryWeapons() {
    return this.weapons.filter(w => w.isSecondary);
  }

  addWeapon(weapon) {
    this.weapons.push(weapon);
  }

  removeWeapon(weapon) {
    const idx = this.weapons.indexOf(weapon);
    if (idx !== -1) this.weapons.splice(idx, 1);
  }

  // Initialize quad-arc armor from per-arc multipliers.
  // Subclasses call this instead of repeating the fa = { ... } boilerplate.
  _initArmorArcs(frontMult, sideMult, aftMult) {
    const fa = {
      front:     BASE_ARMOR * frontMult,
      port:      BASE_ARMOR * sideMult,
      starboard: BASE_ARMOR * sideMult,
      aft:       BASE_ARMOR * aftMult,
    };
    this.armorArcs    = { ...fa };
    this.armorArcsMax = { ...fa };
  }

  /**
   * Initialize all stat fields from multiplier config.
   * @param {{ speed: number, accel: number, turn: number, hull: number, weight?: number, cargo?: number, fuelMax?: number, fuelEff?: number, armorFront?: number, armorSide?: number, armorAft?: number }} opts
   */
  _initStats({ speed, accel, turn, hull, weight, cargo, fuelMax, fuelEff, armorFront, armorSide, armorAft }) {
    this.speedMax      = BASE_SPEED        * speed * SPEED_FACTOR;
    this.acceleration  = BASE_ACCELERATION * accel * SPEED_FACTOR;
    this.turnRate      = BASE_TURN_RATE    * turn  * SPEED_FACTOR;
    this.hullMax       = BASE_HULL * hull;
    this.hullCurrent   = this.hullMax;
    if (weight !== undefined) this.baseWeight    = BASE_HULL_WEIGHT * weight;
    if (cargo !== undefined)  this.cargoCapacity  = BASE_CARGO * cargo;
    if (fuelMax !== undefined) this.fuelMax        = BASE_FUEL_MAX * fuelMax;
    if (fuelEff !== undefined) this.fuelEfficiency = BASE_FUEL_EFFICIENCY * fuelEff;
    if (armorFront !== undefined) this._initArmorArcs(armorFront, armorSide, armorAft);
  }

  // Call at the end of any ship constructor that uses module-based weapons.
  _applyModules() {
    // Freeze base movement stats before any module effects.
    this._baseSpeedMax     = this.speedMax;
    this._baseAcceleration = this.acceleration;
    this._baseTurnRate     = this.turnRate;
    this._baseFuelEff      = this.fuelEfficiency;

    for (const mod of (this.moduleSlots || [])) {
      if (mod?.onInstall) mod.onInstall(this);
    }
    this.refreshCapabilities();

    // Compute initial T/W ratio — sets _refTwRatio on first call
    this.recalcTW();
  }

  /**
   * Recalculate movement stats from thrust-to-weight ratio.
   * Call after: module swap, cargo change, salvage, dock, engine damage.
   * @param {number} [fuel] - current fuel (defaults to fuelMax)
   * @param {number} [cargoMass] - total mass of cargo hold contents (defaults to 0)
   */
  recalcTW(fuel, cargoMass) {
    const modules = this.moduleSlots || [];

    // Sum module weights and engine thrust
    let moduleWeight = 0;
    let totalThrust = 0;
    let fuelEffMult = 1.0;
    let hasEngine = false;

    for (const mod of modules) {
      if (!mod) continue;
      moduleWeight += mod.weight || 0;
      if (mod.isEngine && mod.isPowered !== false) {
        totalThrust += (mod.thrust || 0) * mod.conditionMultiplier;
        fuelEffMult = mod.fuelEffMult * mod.conditionMultiplier;
        hasEngine = true;
      }
    }

    const fuelWeight = (fuel ?? this.fuelMax ?? 0) * FUEL_WEIGHT_PER_UNIT;
    const cargoWeight = cargoMass ?? 0;
    const totalWeight = (this.baseWeight || BASE_HULL_WEIGHT) + moduleWeight + fuelWeight + cargoWeight;
    const twRatio = totalThrust > 0 ? totalThrust / totalWeight : 0;

    // Store ref on first call (construction with stock modules, full fuel, zero cargo)
    if (this._refTwRatio === undefined) {
      this._refTwRatio = twRatio;
    }

    // Store current values for UI
    this._twRatio = twRatio;
    this._totalWeight = totalWeight;
    this._totalThrust = totalThrust;

    // Derive movement stats from T/W power curves
    if (this._refTwRatio > 0 && totalThrust > 0) {
      const r = twRatio / this._refTwRatio;
      const clamp = (v) => Math.max(TW_MULT_MIN, Math.min(TW_MULT_MAX, v));

      this.speedMax      = (this._baseSpeedMax     ?? this.speedMax)     * clamp(Math.pow(r, TW_SPEED_SENSITIVITY));
      this.acceleration  = (this._baseAcceleration ?? this.acceleration) * clamp(Math.pow(r, TW_ACCEL_SENSITIVITY));
      this.turnRate      = (this._baseTurnRate     ?? this.turnRate)     * clamp(Math.pow(r, TW_TURN_SENSITIVITY));
    } else if (this._refTwRatio > 0) {
      // No thrust (engine removed / destroyed) → floor values
      this.speedMax     = (this._baseSpeedMax     ?? this.speedMax)     * TW_MULT_MIN;
      this.acceleration = (this._baseAcceleration ?? this.acceleration) * TW_MULT_MIN;
      this.turnRate     = (this._baseTurnRate     ?? this.turnRate)     * TW_MULT_MIN;
    }

    // Fuel efficiency from engine
    if (hasEngine) {
      this.fuelEfficiency = (this._baseFuelEff ?? BASE_FUEL_EFFICIENCY) * fuelEffMult;
    }
  }

  // Recalculates based on currently installed modules.
  refreshCapabilities() {
    // Reset to defaults
    this.capabilities = {
      minimap_stations: false,
      minimap_ships: false,
      sensor_range: 0,
      lead_indicators: false,
      health_pips: false,
      salvage_detail: false,
      trajectory_line: false,
      enemy_telemetry: false,
      module_inspection: false,
      has_salvage_bay: false,
      has_engineering_bay: false,
    };

    if (!this.moduleSlots) return;

    for (const mod of this.moduleSlots) {
      if (!mod) continue;
      const operational = mod.conditionMultiplier > 0 && mod.isPowered !== false;
      // Capabilities go offline when module is destroyed or unpowered
      if (operational) {
        if (mod.minimap_stations)    this.capabilities.minimap_stations   = true;
        if (mod.minimap_ships)       this.capabilities.minimap_ships      = true;
        if (mod.lead_indicators)     this.capabilities.lead_indicators    = true;
        if (mod.health_pips)         this.capabilities.health_pips        = true;
        if (mod.salvage_detail)      this.capabilities.salvage_detail     = true;
        if (mod.trajectory_line)     this.capabilities.trajectory_line    = true;
        if (mod.enemy_telemetry)     this.capabilities.enemy_telemetry    = true;
        if (mod.module_inspection)   this.capabilities.module_inspection  = true;
        if (mod.hasSalvageBay)       this.capabilities.has_salvage_bay    = true;
        if (mod.hasEngineeringBay)   this.capabilities.has_engineering_bay = true;
      }
      // Sensor range scales with condition (degraded sensors have reduced range)
      if (mod.sensor_range) {
        const effective = mod.sensor_range * mod.conditionMultiplier;
        if (effective > this.capabilities.sensor_range) {
          this.capabilities.sensor_range = effective;
        }
      }
    }
  }

  // onlyActive=true → fire only the indexed weapon (player path)
  // onlyActive=false → fire all (AI path, unchanged)
  fireWeapons(tx, ty, entities, onlyActive = false) {
    if (this._weaponsOffline) return;
    const primaries = this._primaryWeapons;
    for (let i = 0; i < primaries.length; i++) {
      if (onlyActive && i !== this.primaryWeaponIdx) continue;
      if (primaries[i]._unpowered) continue;
      primaries[i].fire(this, tx, ty, entities);
    }
  }

  fireSecondary(tx, ty, entities, onlyActive = false) {
    if (this._weaponsOffline) return;
    const secondaries = this._secondaryWeapons;
    for (let i = 0; i < secondaries.length; i++) {
      if (onlyActive && i !== this.secondaryWeaponIdx) continue;
      if (secondaries[i]._unpowered) continue;
      secondaries[i].fire(this, tx, ty, entities);
    }
  }

  fireAutoWeapons(enemies, entities) {
    if (this._weaponsOffline) return;
    for (const w of this.weapons) {
      if (!w.isAutoFire || w._unpowered) continue;
      let nearest = null;
      let nearestDist = w.maxRange;
      for (const e of enemies) {
        if (!e.active) continue;
        const dx = e.x - this.x;
        const dy = e.y - this.y;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d < nearestDist) { nearestDist = d; nearest = e; }
      }
      if (nearest) {
        const travelTime = nearestDist / w.projectileSpeed;
        const tvx = Math.sin(nearest.rotation) * nearest.speed;
        const tvy = -Math.cos(nearest.rotation) * nearest.speed;
        const leadX = nearest.x + tvx * travelTime;
        const leadY = nearest.y + tvy * travelTime;
        w.fire(this, leadX, leadY, entities);
      }
    }
  }

  _getImpactArc(hitX, hitY) {
    const dx = hitX - this.x;
    const dy = hitY - this.y;
    let rel = Math.atan2(dy, dx) - this.rotation + Math.PI / 2;
    // Normalize to [-π, π]
    rel = ((rel % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
    if (rel > Math.PI) rel -= Math.PI * 2;

    const q = Math.PI / 4;
    if (rel >= -q && rel < q)       return 'front';
    if (rel >= q && rel < 3 * q)    return 'starboard';
    if (rel >= -3 * q && rel < -q)  return 'port';
    return 'aft';
  }

  _becomeDerelict() {
    this.crew = 0;
    this.relation = 'derelict';
    this.throttleLevel = 0;
    this.speed = 0;
    this.ai = null;
    this.salvageTime = 3;
    this.interactionRadius = 150;
    this._justCrippled = true;
  }

  takeDamage(amount, hullDamageOverride, hitX, hitY) {
    const arc = (hitX != null && hitY != null)
      ? this._getImpactArc(hitX, hitY)
      : 'front';

    this._lastHitArc = arc;
    this._arcHitTimestamps[arc] = Date.now();

    let hullDmg;
    const arcCurrent = this.armorArcs[arc];

    if (arcCurrent > 0) {
      const absorbed = Math.min(arcCurrent, amount);
      this.armorArcs[arc] -= absorbed;
      const remaining = amount - absorbed;
      hullDmg = hullDamageOverride != null
        ? (remaining > 0 ? hullDamageOverride : 0)
        : remaining;
    } else {
      hullDmg = hullDamageOverride != null ? hullDamageOverride : amount;
    }

    // Aft arc: 1.5× hull bleed + 50% engine integrity hit
    if (arc === 'aft') {
      hullDmg = Math.round(hullDmg * 1.5);
      if (Math.random() < 0.5) {
        this.engineIntegrity = Math.max(0, this.engineIntegrity - Math.max(1, hullDmg * 0.3));
      }
    }

    this.hullCurrent = Math.max(0, this.hullCurrent - hullDmg);

    // Trigger hit flash
    this._hitFlashTimer = 0.15;

    // Non-player ships become derelicts at ≤10% hull instead of dying
    if (this.hullCurrent <= this.hullMax * 0.1 && this.crew > 0 && this.relation !== 'player') {
      this._becomeDerelict();
    } else if (this.hullCurrent <= 0) {
      this.hullCurrent = 0;
      this.active = false;
      this.onDestroy();
    }
  }

  increaseThrottle() {
    if (this.throttleLevel < this.throttleLevels - 1) this.throttleLevel++;
  }

  decreaseThrottle() {
    if (this.throttleLevel > 0) this.throttleLevel--;
  }

  update(dt, entities) {
    if (this.isDerelict) {
      if (this._hitFlashTimer > 0) this._hitFlashTimer -= dt;
      return;
    }
    for (const w of this.weapons) w.update(dt, entities);
    if (this._hitFlashTimer > 0) this._hitFlashTimer -= dt;

    // Hull degradation — random flags updated once per tick
    const hullRatio = this.hullCurrent / this.hullMax;
    // Fire rate: enemies slow down linearly from 40% hull → 2× cooldown at 0%
    if ((this.relation === 'enemy' || this.relation === 'hostile') && hullRatio <= 0.40) {
      this._fireCooldownMult = 1.0 + (0.40 - hullRatio) / 0.40;
    } else {
      this._fireCooldownMult = 1.0;
    }
    this._engineCutout = hullRatio <= 0.5 && Math.random() < 0.05;
    if (hullRatio <= 0.05) {
      this._weaponsOffline = Math.random() < 0.9;
    } else if (hullRatio <= 0.15) {
      this._weaponsOffline = Math.random() < 0.4;
    } else if (hullRatio <= 0.30) {
      this._weaponsOffline = Math.random() < 0.2;
    } else {
      this._weaponsOffline = false;
    }

    this.rotation += this.rotationInput * this.effectiveTurnRate * dt;

    // Accelerate speed toward targetSpeed
    const target = this.targetSpeed;
    const diff = target - this.speed;
    const maxDelta = this.acceleration * dt;
    if (Math.abs(diff) <= maxDelta) {
      this.speed = target;
    } else {
      this.speed += Math.sign(diff) * maxDelta;
    }

    // Move in facing direction (rotation 0 = up/north = negative Y)
    this.x += Math.sin(this.rotation) * this.speed * dt;
    this.y -= Math.cos(this.rotation) * this.speed * dt;

    // Record engine trail points
    this._trailTimer += dt;
    if (this.speed > 5 && this._trailTimer >= 0.016) {
      this._trailTimer = 0;
      const offsets = this._engineOffsets;
      while (this._trails.length < offsets.length) this._trails.push([]);
      const sin = Math.sin(this.rotation);
      const cos = Math.cos(this.rotation);
      for (let i = 0; i < offsets.length; i++) {
        const off = offsets[i];
        const wx = this.x + off.x * cos - off.y * sin;
        const wy = this.y + off.x * sin + off.y * cos;
        this._trails[i].push({ x: wx, y: wy });
        if (this._trails[i].length > TRAIL_MAX_POINTS) this._trails[i].shift();
      }
    } else if (this.speed <= 5) {
      for (const trail of this._trails) {
        if (trail.length > 0) trail.shift();
      }
    }

    this.rotationInput = 0;
  }

  render(ctx, camera) {
    if (this.isDerelict) {
      if (!this.salvaged) this._renderDerelict(ctx, camera);
      return;
    }

    this._renderTrails(ctx, camera);

    const screen = camera.worldToScreen(this.x, this.y);
    ctx.save();
    ctx.translate(screen.x, screen.y);
    ctx.scale(camera.zoom, camera.zoom);
    ctx.rotate(this.rotation);
    this._drawShape(ctx);
    this._drawModules(ctx);

    // Hit flash — brief red overlay on damage
    if (this._hitFlashTimer > 0) {
      const alpha = (this._hitFlashTimer / 0.15) * 0.55;
      ctx.globalAlpha = alpha;
      ctx.fillStyle = RED;
      ctx.beginPath();
      ctx.arc(0, 0, (this.radius ?? 20) * 1.15, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    }

    // Enemy damage overlay — darkens at ≤50% hull
    if (this.relation === 'enemy' || this.relation === 'hostile') {
      const hullRatio = this.hullCurrent / this.hullMax;
      if (hullRatio <= 0.5) {
        const r = this.getBounds().radius;
        const alpha = ((0.5 - hullRatio) / 0.5) * 0.45;
        ctx.globalAlpha = alpha;
        ctx.fillStyle = BLACK;
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      }
    }

    ctx.restore();
  }

  _renderTrails(ctx, camera) {
    for (const t of this._trails) {
      if (t.length < 2) continue;
      const screenPoints = new Array(t.length);
      for (let i = 0; i < t.length; i++) {
        screenPoints[i] = camera.worldToScreen(t[i].x, t[i].y);
      }
      drawTrail(ctx, screenPoints, this.engineColor, 0.6, 2.5);
    }
  }

  _renderDerelict(ctx, camera) {
    const screen = camera.worldToScreen(this.x, this.y);

    // Draw hull at reduced alpha
    ctx.save();
    ctx.translate(screen.x, screen.y);
    ctx.scale(camera.zoom, camera.zoom);
    ctx.rotate(this.rotation);
    ctx.globalAlpha = 0.55;
    this._drawShape(ctx);
    this._drawModules(ctx);
    ctx.globalAlpha = 1;
    ctx.restore();

    // Lore text — fades in as player approaches
    if (this._loreAlpha > 0 && this.loreText && this.loreText.length > 0) {
      const loreX = screen.x + 28 * camera.zoom + 10;
      const loreY = screen.y - (this.loreText.length - 1) * 6;
      ctx.save();
      ctx.font = FLAVOR.font;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillStyle = DIM_TEXT;
      ctx.globalAlpha = this._loreAlpha * FLAVOR.alpha;
      for (let i = 0; i < this.loreText.length; i++) {
        ctx.fillText(this.loreText[i], loreX, loreY + i * 16);
      }
      ctx.restore();
    }

    // "[E] SALVAGE" / "STOP TO SALVAGE" prompt
    if (this.isNearby) {
      const alpha = 0.55 + Math.sin(Date.now() * 0.004) * 0.35;
      const promptY = screen.y + (this.getBounds().radius + 14) * camera.zoom;
      ctx.save();
      ctx.font = PROMPT.font;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.globalAlpha = alpha;
      if (this.canSalvage) {
        ctx.fillStyle = AMBER;
        const salvageLabel = this._salvageBayActive ? '[ E ] SALVAGE + MODULES' : '[ E ] SALVAGE';
        ctx.fillText(salvageLabel, screen.x, promptY);
      } else {
        ctx.fillStyle = RED;
        ctx.fillText('STOP TO SALVAGE', screen.x, promptY);
      }
      ctx.restore();
    }
  }

  _drawShape(ctx) {
    ctx.beginPath();
    ctx.moveTo(0, -10);
    ctx.lineTo(6, 8);
    ctx.lineTo(0, 4);
    ctx.lineTo(-6, 8);
    ctx.closePath();
    ctx.fillStyle = this.hullFill;
    ctx.fill();
    ctx.strokeStyle = this.hullStroke;
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }

  _drawModules(ctx) {
    const mounts = this._mountPoints;
    if (!mounts) return;
    const slots = this.moduleSlots;
    const invMode = this._inventoryMode;
    for (let i = 0; i < mounts.length; i++) {
      const mod = slots && slots[i];
      if (mod) {
        const unpowered = mod.isPowered === false && mod.powerDraw > 0;
        const color = unpowered ? '#555555' : conditionColor(mod.condition);
        const alpha = mod.condition === 'destroyed' ? 0.2 : unpowered ? 0.35 : 0.7;

        ctx.save();
        ctx.translate(mounts[i].x, mounts[i].y);

        // Rotate turret weapons to track target
        if (mod.weapon && !mod.weapon.isFixed && this._turretTargetWorld) {
          const dx = this._turretTargetWorld.x - this.x;
          const dy = this._turretTargetWorld.y - this.y;
          const cos = Math.cos(-this.rotation);
          const sin = Math.sin(-this.rotation);
          const localX = dx * cos - dy * sin;
          const localY = dx * sin + dy * cos;
          const mx = localX - mounts[i].x;
          const my = localY - mounts[i].y;
          ctx.rotate(Math.atan2(mx, -my));
        }

        mod.drawAtMount(ctx, color, alpha);
        ctx.restore();

        if (invMode) drawMountHighlight(ctx, mounts[i]);
      } else {
        drawEmptyMount(ctx, mounts[i], invMode);
      }
    }
  }

  getBounds() {
    return { x: this.x, y: this.y, radius: 16 };
  }
}
