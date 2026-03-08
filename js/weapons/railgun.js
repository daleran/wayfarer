import { Projectile } from '../entities/projectile.js';
import { RAIL_WHITE } from '../ui/colors.js';
import { BASE_DAMAGE, BASE_HULL_DAMAGE, BASE_WEAPON_RANGE, BASE_PROJECTILE_SPEED,
         PROJECTILE_SPEED_FACTOR, BASE_COOLDOWN } from '../data/stats.js';

const DAMAGE_MULT      = 10.6;  // ~180 armor
const HULL_DAMAGE_MULT = 12.0;  // 120 hull
const COOLDOWN_MULT    = 6.0;
const SPEED_MULT       = 4.5;
const RANGE_MULT       = 2.0;

export class Railgun {
  constructor(variant = 'turret') {
    this.isSecondary = false;
    this.isAutoFire  = false;
    this.isFixed     = variant === 'fixed';
    this.displayName = this.isFixed ? 'RAILGUN-F' : 'RAILGUN';

    this.damage         = BASE_DAMAGE * DAMAGE_MULT;
    this.hullDamage     = BASE_HULL_DAMAGE * HULL_DAMAGE_MULT;
    this.projectileSpeed = BASE_PROJECTILE_SPEED * SPEED_MULT * PROJECTILE_SPEED_FACTOR;
    this.maxRange       = BASE_WEAPON_RANGE * RANGE_MULT;
    this.cooldownMax    = BASE_COOLDOWN * COOLDOWN_MULT;
    this._cooldown      = 0;
  }

  update(dt) {
    if (this._cooldown > 0) this._cooldown -= dt;
  }

  fire(ship, tx, ty, entities) {
    if (this._cooldown > 0) return;

    let nx, ny;
    if (this.isFixed) {
      nx = Math.sin(ship.rotation);
      ny = -Math.cos(ship.rotation);
    } else {
      const dx = tx - ship.x;
      const dy = ty - ship.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist === 0) return;
      nx = dx / dist;
      ny = dy / dist;
    }

    const proj = new Projectile(
      ship.x, ship.y,
      nx * this.projectileSpeed,
      ny * this.projectileSpeed,
      this.damage,
      ship
    );
    proj.hullDamage  = this.hullDamage;
    proj.maxRange    = this.maxRange;
    proj.color       = RAIL_WHITE;
    proj.glowColor   = '#ffffff';
    proj.length      = 12;
    proj.hasTrail    = true;
    entities.push(proj);
    this._cooldown = this.cooldownMax;
  }
}
