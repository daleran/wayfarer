import { Projectile } from '../entities/projectile.js';
import { BASE_DAMAGE, BASE_HULL_DAMAGE, BASE_WEAPON_RANGE, BASE_PROJECTILE_SPEED,
         PROJECTILE_SPEED_FACTOR, BASE_COOLDOWN } from '../data/stats.js';

const DAMAGE_MULT      = 17.65;  // ~300 armor — ship-killing AoE
const HULL_DAMAGE_MULT = 22.0;   // 220 hull
const COOLDOWN_MULT    = 15.0;
const SPEED_MULT       = 0.45;
const RANGE_MULT       = 1.467;  // ~2200u

export class Torpedo {
  constructor() {
    this.isSecondary = true;
    this.isAutoFire  = false;
    this.isFixed     = true;
    this.displayName = 'TORPEDO';
    this.damage         = BASE_DAMAGE      * DAMAGE_MULT;
    this.hullDamage     = BASE_HULL_DAMAGE * HULL_DAMAGE_MULT;
    this.projectileSpeed = BASE_PROJECTILE_SPEED * SPEED_MULT * PROJECTILE_SPEED_FACTOR;
    this.maxRange       = BASE_WEAPON_RANGE * RANGE_MULT;
    this.blastRadius    = 200;
    this.cooldownMax    = BASE_COOLDOWN * COOLDOWN_MULT;
    this._cooldown      = 0;
    this.ammo           = 3;
    this.ammoMax        = 3;
  }

  update(dt) { if (this._cooldown > 0) this._cooldown -= dt; }

  fire(ship, tx, ty, entities) {
    if (this._cooldown > 0 || this.ammo <= 0) return;
    const nx = Math.sin(ship.rotation);
    const ny = -Math.cos(ship.rotation);
    const proj = new Projectile(
      ship.x, ship.y,
      nx * this.projectileSpeed,
      ny * this.projectileSpeed,
      this.damage, ship
    );
    proj.hullDamage    = this.hullDamage;
    proj.maxRange      = this.maxRange;
    proj.isRocket      = true;
    proj.isTorpedo     = true;
    proj.isInterceptable = true;
    proj.blastRadius   = this.blastRadius;
    entities.push(proj);
    this.ammo--;
    this._cooldown = this.cooldownMax;
  }
}
