import { Projectile } from '../entities/projectile.js';

export class Rocket {
  constructor() {
    this.isSecondary = true;
    this.isAutoFire  = false;
    this.ammo        = 6;
    this.ammoMax     = 6;
    this.damage      = 35;
    this.hullDamage  = 25;
    this.projectileSpeed = 550;
    this.cooldown    = 2.0; // seconds between shots
    this._cooldown   = 0;
  }

  update(dt) {
    if (this._cooldown > 0) this._cooldown -= dt;
  }

  fire(ship, tx, ty, entities) {
    if (this._cooldown > 0 || this.ammo <= 0) return;

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
    proj.hullDamage = this.hullDamage;
    proj.maxRange   = 900;
    proj.isRocket   = true;

    entities.push(proj);
    this.ammo--;
    this._cooldown = this.cooldown;
  }
}
