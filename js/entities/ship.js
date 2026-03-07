import { Entity } from './entity.js';
import { PLAYER_STROKE, GREEN } from '../ui/colors.js';

const TRAIL_MAX_POINTS = 120;

export class Ship extends Entity {
  constructor(x, y) {
    super(x, y);

    // Identity
    this.faction = 'neutral';
    this.behaviorType = null;
    this.shipType = null;

    // Health
    this.armorMax = 100;
    this.armorCurrent = 100;
    this.hullMax = 200;
    this.hullCurrent = 200;

    // Movement
    this.speedMax = 120;
    this.acceleration = 30;
    this.turnRate = 2.5; // radians per second
    this.speed = 0;      // current speed (scalar, forward direction)

    // Throttle: 6 levels, 0-5 index
    this.throttleLevels = 6;
    this.throttleLevel = 0;
    this._throttleRatios = [0, 0.15, 0.35, 0.55, 0.8, 1.5];

    // Crew / cargo
    this.crewMax = 4;
    this.crewCurrent = 3;
    this.cargoCapacity = 50;
    this.crewRepairRate = 0.15; // armor points/sec per crew member

    // Input state (set by game each frame)
    this.rotationInput = 0; // -1 left, +1 right, 0 none

    // Weapons
    this.weapons = [];

    // Engine trail — array of arrays, one per engine
    // Each sub-array holds {x, y} world positions
    this._trails = [];
    this._trailTimer = 0;
    this._trailColor = GREEN;
  }

  // Override in subclasses to define engine exhaust positions (local coords)
  get _engineOffsets() {
    return [{ x: 0, y: 8 }];
  }

  get isDestroyed() {
    return !this.active;
  }

  addWeapon(weapon) {
    this.weapons.push(weapon);
  }

  fireWeapons(tx, ty, entities) {
    if (this.crewEfficiency <= 0.1) return; // no crew = weapons offline
    for (const w of this.weapons) {
      w.fire(this, tx, ty, entities, this.crewEfficiency);
    }
  }

  fireAutoWeapons(enemies, entities) {
    if (this.crewEfficiency <= 0.1) return; // no crew = weapons offline
    for (const w of this.weapons) {
      if (!w.isAutoFire) continue;
      // Find nearest enemy in weapon range
      let nearest = null;
      let nearestDist = w.maxRange;
      for (const e of enemies) {
        if (!e.active) continue;
        const dx = e.x - this.x;
        const dy = e.y - this.y;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d < nearestDist) {
          nearestDist = d;
          nearest = e;
        }
      }
      if (nearest) {
        // Lead targeting
        const travelTime = nearestDist / w.projectileSpeed;
        const tvx = Math.sin(nearest.rotation) * nearest.speed;
        const tvy = -Math.cos(nearest.rotation) * nearest.speed;
        const leadX = nearest.x + tvx * travelTime;
        const leadY = nearest.y + tvy * travelTime;
        w.fire(this, leadX, leadY, entities, this.crewEfficiency);
      }
    }
  }

  takeDamage(amount, hullDamageOverride) {
    let hullDmg = 0;
    if (this.armorCurrent > 0) {
      const absorbed = Math.min(this.armorCurrent, amount);
      this.armorCurrent -= absorbed;
      const remaining = amount - absorbed;
      hullDmg = hullDamageOverride != null
        ? (remaining > 0 ? hullDamageOverride : 0)
        : remaining;
    } else {
      hullDmg = hullDamageOverride != null ? hullDamageOverride : amount;
    }
    this.hullCurrent -= hullDmg;

    // Hull breaches can kill crew when hull is below 50%
    const hullRatio = this.hullCurrent / this.hullMax;
    if (hullDmg > 0 && this.crewCurrent > 0 && hullRatio < 0.5) {
      // Chance scales: 10% at 50% hull, up to 35% at 0% hull
      const deathChance = 0.10 + 0.25 * (1 - hullRatio * 2);
      if (Math.random() < deathChance) {
        this.crewCurrent = Math.max(0, this.crewCurrent - 1);
      }
    }

    if (this.hullCurrent <= 0) {
      this.hullCurrent = 0;
      this.active = false;
      this.onDestroy();
    }
  }

  // Crew effectiveness ratio — 0 crew = limping, full crew = 100%
  // Returns a multiplier from 0.1 (no crew) to 1.0 (full crew)
  get crewEfficiency() {
    if (this.crewMax <= 0) return 1; // drones/fighters with no crew concept
    const ratio = this.crewCurrent / this.crewMax;
    if (ratio <= 0) return 0.1;       // ghost ship — barely functional
    if (ratio <= 0.25) return 0.25 + ratio * 1.0;  // 0.25–0.50 range
    return 0.5 + ratio * 0.5;        // 0.50–1.0 range
  }

  get effectiveSpeedMax() {
    return this.speedMax * this.crewEfficiency;
  }

  get effectiveTurnRate() {
    return this.turnRate * this.crewEfficiency;
  }

  get targetSpeed() {
    return this._throttleRatios[this.throttleLevel] * this.effectiveSpeedMax;
  }

  increaseThrottle() {
    if (this.throttleLevel < this.throttleLevels - 1) {
      this.throttleLevel++;
    }
  }

  decreaseThrottle() {
    if (this.throttleLevel > 0) {
      this.throttleLevel--;
    }
  }

  update(dt) {
    // Update weapons (cooldown timers)
    for (const w of this.weapons) w.update(dt);

    // Rotate (crew efficiency affects turn rate)
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
      while (this._trails.length < offsets.length) {
        this._trails.push([]);
      }
      const sin = Math.sin(this.rotation);
      const cos = Math.cos(this.rotation);
      for (let i = 0; i < offsets.length; i++) {
        const off = offsets[i];
        // Rotate local engine offset to world position
        const wx = this.x + off.x * cos - off.y * sin;
        const wy = this.y + off.x * sin + off.y * cos;
        this._trails[i].push({ x: wx, y: wy });
        if (this._trails[i].length > TRAIL_MAX_POINTS) {
          this._trails[i].shift();
        }
      }
    } else if (this.speed <= 5) {
      for (const trail of this._trails) {
        if (trail.length > 0) trail.shift();
      }
    }

    // Reset input each frame
    this.rotationInput = 0;
  }

  render(ctx, camera) {
    // Draw trails behind the ship (before ship shape)
    this._renderTrails(ctx, camera);

    const screen = camera.worldToScreen(this.x, this.y);

    ctx.save();
    ctx.translate(screen.x, screen.y);
    ctx.rotate(this.rotation);
    this._drawShape(ctx);
    ctx.restore();
  }

  _renderTrails(ctx, camera) {
    for (const trail of this._trails) {
      if (trail.length < 2) continue;

      ctx.save();
      ctx.lineCap = 'round';

      for (let i = 1; i < trail.length; i++) {
        const p0 = camera.worldToScreen(trail[i - 1].x, trail[i - 1].y);
        const p1 = camera.worldToScreen(trail[i].x, trail[i].y);
        const t = i / trail.length; // 0 = oldest, 1 = newest

        ctx.strokeStyle = this._trailColor;
        ctx.globalAlpha = t * 0.6;
        ctx.lineWidth = 1 + t * 1.5;
        ctx.beginPath();
        ctx.moveTo(p0.x, p0.y);
        ctx.lineTo(p1.x, p1.y);
        ctx.stroke();
      }

      ctx.restore();
    }
  }

  // Override in subclasses for custom hull shapes
  _drawShape(ctx) {
    ctx.beginPath();
    ctx.moveTo(0, -10);
    ctx.lineTo(6, 8);
    ctx.lineTo(0, 4);
    ctx.lineTo(-6, 8);
    ctx.closePath();
    ctx.fillStyle = 'rgba(0,20,30,0.15)';
    ctx.fill();
    ctx.strokeStyle = PLAYER_STROKE;
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }

  getBounds() {
    return { x: this.x, y: this.y, radius: 16 };
  }
}
