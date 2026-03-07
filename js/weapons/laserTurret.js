import { Projectile } from '../entities/projectile.js';

export class LaserTurret {
  constructor() {
    this.damage = 8;
    this.cooldownMax = 0.2;
    this._cooldown = 0;
    this.projectileSpeed = 600;
    this.maxRange = 350;
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
    entities.push(proj);
    this._cooldown = this.cooldownMax;
  }
}
