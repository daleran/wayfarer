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

    // Movement
    this.speedMax    = 120;
    this.acceleration = 30;
    this.turnRate    = 2.5; // radians per second
    this.speed       = 0;   // current speed (scalar, forward direction)

    // Throttle: 6 levels, 0-5 index
    this.throttleLevels  = 6;
    this.throttleLevel   = 0;
    this._throttleRatios = [0, 0.15, 0.35, 0.55, 0.8, 1.5];

    // Cargo
    this.cargoCapacity = 50;

    // Input state (set by game each frame)
    this.rotationInput = 0; // -1 left, +1 right, 0 none

    // Weapons
    this.weapons = [];

    // Engine trail — array of arrays, one per engine
    this._trails     = [];
    this._trailTimer = 0;
    this._trailColor = GREEN;
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

  // Override in subclasses to define engine exhaust positions (local coords)
  get _engineOffsets() {
    return [{ x: 0, y: 8 }];
  }

  get isDestroyed() {
    return !this.active;
  }

  get effectiveSpeedMax() {
    const ratio = this.hullCurrent / this.hullMax;
    if (ratio <= 0.05) return this.speedMax * 0.1;
    if (ratio <= 0.15) return this.speedMax * 0.5;
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

  addWeapon(weapon) {
    this.weapons.push(weapon);
  }

  fireWeapons(tx, ty, entities) {
    if (this._weaponsOffline) return;
    for (const w of this.weapons) {
      if (w.isAutoFire || w.isSecondary) continue;
      w.fire(this, tx, ty, entities);
    }
  }

  fireSecondary(tx, ty, entities) {
    for (const w of this.weapons) {
      if (!w.isSecondary) continue;
      w.fire(this, tx, ty, entities);
    }
  }

  fireAutoWeapons(enemies, entities) {
    if (this._weaponsOffline) return;
    for (const w of this.weapons) {
      if (!w.isAutoFire) continue;
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

  takeDamage(amount, hullDamageOverride, hitX, hitY) {
    const arc = (hitX != null && hitY != null)
      ? this._getImpactArc(hitX, hitY)
      : 'front';

    this._arcHitTimestamps[arc] = Date.now();

    let hullDmg = 0;
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

    if (this.hullCurrent <= 0) {
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

  update(dt) {
    for (const w of this.weapons) w.update(dt);

    // Hull degradation — random flags updated once per tick
    const hullRatio = this.hullCurrent / this.hullMax;
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
        const t = i / trail.length;
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
