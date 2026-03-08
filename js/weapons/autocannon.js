import { Projectile } from '../entities/projectile.js';
import { AMBER } from '../ui/colors.js';

export class Autocannon {
  constructor() {
    this.damage = 12;
    this.cooldownMax = 0.35;
    this._cooldown = 0;
    this.projectileSpeed = 380;
    this.maxRange = 400;
    this.isAutoFire = false;
    this.color = AMBER;
    this.glowColor = '#ffe0a0';
  }

  update(dt) {
    if (this._cooldown > 0) this._cooldown -= dt;
  }

  fire(ship, tx, ty, entities) {
    if (this._cooldown > 0) return;
    const dx = tx - ship.x;
    const dy = ty - ship.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist === 0) return;

    const nx = dx / dist;
    const ny = dy / dist;
    const proj = new Projectile(
      ship.x, ship.y,
      nx * this.projectileSpeed,
      ny * this.projectileSpeed,
      this.damage,
      ship
    );
    proj.maxRange = this.maxRange;
    proj.color = this.color;
    proj.glowColor = this.glowColor;
    proj.length = 6;
    entities.push(proj);
    this._cooldown = this.cooldownMax;
  }
}
