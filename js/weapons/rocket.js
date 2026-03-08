import { Projectile } from '../entities/projectile.js';
import { BASE_DAMAGE, BASE_HULL_DAMAGE, BASE_PROJECTILE_SPEED,
         PROJECTILE_SPEED_FACTOR, BASE_COOLDOWN } from '../data/stats.js';

const DAMAGE_MULT      = 5.3;   // ~90 armor damage
const HULL_DAMAGE_MULT = 6.5;   // 65 hull
const SPEED_MULT       = 1.4;
const COOLDOWN_MULT    = 5.0;

export class Rocket {
  constructor() {
    this.isSecondary = true;
    this.isAutoFire  = false;
    this.displayName = 'ROCKET';
    this.ammo        = 6;
    this.ammoMax     = 6;
    this.damage      = BASE_DAMAGE      * DAMAGE_MULT;
    this.hullDamage  = BASE_HULL_DAMAGE * HULL_DAMAGE_MULT;
    this.projectileSpeed = BASE_PROJECTILE_SPEED * SPEED_MULT * PROJECTILE_SPEED_FACTOR;
    this.cooldown    = BASE_COOLDOWN * COOLDOWN_MULT;
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
    proj.hullDamage     = this.hullDamage;
    proj.maxRange       = dist + 20; // just enough to reach the target
    proj.isRocket       = true;
    proj.rocketTargetX  = tx;
    proj.rocketTargetY  = ty;

    entities.push(proj);
    this.ammo--;
    this._cooldown = this.cooldown;
  }
}
