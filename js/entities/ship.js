import { Entity } from './entity.js';

export class Ship extends Entity {
  constructor(x, y) {
    super(x, y);

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

    // Throttle: 5 levels, 0–4 index
    this.throttleLevels = 5;
    this.throttleLevel = 0;
    this._throttleRatios = [0, 0.25, 0.5, 0.75, 1.0];

    // Crew / cargo
    this.crewMax = 10;
    this.crewCurrent = 5;
    this.cargoCapacity = 50;
    this.crewRepairRate = 0.5; // armor points/sec per crew member

    // Input state (set by game each frame)
    this.rotationInput = 0; // -1 left, +1 right, 0 none

    // Weapons
    this.weapons = [];
  }

  get isDestroyed() {
    return !this.active;
  }

  addWeapon(weapon) {
    this.weapons.push(weapon);
  }

  fireWeapons(tx, ty, entities) {
    for (const w of this.weapons) {
      w.fire(this, tx, ty, entities);
    }
  }

  takeDamage(amount) {
    let dmg = amount;
    if (this.armorCurrent > 0) {
      const absorbed = Math.min(this.armorCurrent, dmg);
      this.armorCurrent -= absorbed;
      dmg -= absorbed;
    }
    this.hullCurrent -= dmg;
    if (this.hullCurrent <= 0) {
      this.hullCurrent = 0;
      this.active = false;
      this.onDestroy();
    }
  }

  get targetSpeed() {
    return this._throttleRatios[this.throttleLevel] * this.speedMax;
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

    // Crew auto-repair armor
    if (this.armorCurrent < this.armorMax && this.crewCurrent > 0) {
      this.armorCurrent = Math.min(
        this.armorMax,
        this.armorCurrent + this.crewRepairRate * this.crewCurrent * dt
      );
    }

    // Rotate
    this.rotation += this.rotationInput * this.turnRate * dt;

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

    // Reset input each frame
    this.rotationInput = 0;
  }

  render(ctx, camera) {
    const screen = camera.worldToScreen(this.x, this.y);

    ctx.save();
    ctx.translate(screen.x, screen.y);
    ctx.rotate(this.rotation);
    this._drawShape(ctx);
    ctx.restore();
  }

  // Override in subclasses for custom hull shapes
  _drawShape(ctx) {
    ctx.strokeStyle = '#4af';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, -10);
    ctx.lineTo(6, 8);
    ctx.lineTo(0, 4);
    ctx.lineTo(-6, 8);
    ctx.closePath();
    ctx.stroke();
  }

  getBounds() {
    return { x: this.x, y: this.y, radius: 16 };
  }
}
