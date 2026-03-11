import { Projectile } from '../entities/projectile.js';
import { RAIL_WHITE } from '../ui/colors.js';
import { BASE_DAMAGE, BASE_HULL_DAMAGE, BASE_WEAPON_RANGE, BASE_PROJECTILE_SPEED,
         PROJECTILE_SPEED_FACTOR, BASE_COOLDOWN } from '../data/tuning/weaponTuning.js';

const VARIANTS = {
  'small-fixed':  { DAMAGE_MULT: 10.6, HULL_MULT: 12.0, COOLDOWN_MULT: 6.0, SPEED_MULT: 4.5, RANGE_MULT: 2.0, fixed: true  },
  'large-turret': { DAMAGE_MULT: 10.6, HULL_MULT: 12.0, COOLDOWN_MULT: 6.0, SPEED_MULT: 4.5, RANGE_MULT: 2.0, fixed: false },
  'large-fixed':  { DAMAGE_MULT: 21.2, HULL_MULT: 24.0, COOLDOWN_MULT: 7.5, SPEED_MULT: 4.5, RANGE_MULT: 2.0, fixed: true  },
};

const DISPLAY_NAMES = {
  'small-fixed':  'RAILGUN-SF',
  'large-turret': 'RAILGUN-LT',
  'large-fixed':  'RAILGUN-LF',
};

export class Railgun {
  constructor(variant = 'large-turret') {
    this.isSecondary = false;
    this.isAutoFire  = false;

    // Backward-compat: map old variant names to new ones
    if (variant === 'fixed')  variant = 'small-fixed';
    if (variant === 'turret') variant = 'large-turret';
    // Default fallback for unrecognized variants
    if (!VARIANTS[variant]) variant = 'large-turret';

    const V = VARIANTS[variant];
    this.isFixed     = V.fixed;
    this.displayName = DISPLAY_NAMES[variant];

    this.damage          = BASE_DAMAGE      * V.DAMAGE_MULT;
    this.hullDamage      = BASE_HULL_DAMAGE * V.HULL_MULT;
    this.projectileSpeed = BASE_PROJECTILE_SPEED * V.SPEED_MULT * PROJECTILE_SPEED_FACTOR;
    this.maxRange        = BASE_WEAPON_RANGE * V.RANGE_MULT;
    this.cooldownMax     = BASE_COOLDOWN * V.COOLDOWN_MULT;
    this._cooldown       = 0;
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
