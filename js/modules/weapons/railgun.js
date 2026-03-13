import { Projectile } from '@/entities/projectile.js';
import { RAIL_WHITE, WHITE } from '@/rendering/colors.js';
import { BASE_DAMAGE, BASE_HULL_DAMAGE, BASE_WEAPON_RANGE, BASE_PROJECTILE_SPEED,
         PROJECTILE_SPEED_FACTOR } from '@data/compiledData.js';

const VARIANTS = {
  'small-fixed':  { DAMAGE_MULT: 10.6, HULL_MULT: 12.0, SPEED_MULT: 4.5, RANGE_MULT: 2.0, fixed: true,  MAG_SIZE: 1, INTER_SHOT: 0,    RELOAD_TIME: 5.4, defaultAmmo: '30mm-kp' },
  'large-turret': { DAMAGE_MULT: 10.6, HULL_MULT: 12.0, SPEED_MULT: 4.5, RANGE_MULT: 2.0, fixed: false, MAG_SIZE: 1, INTER_SHOT: 0,    RELOAD_TIME: 5.4, defaultAmmo: '60mm-kp' },
  'large-fixed':  { DAMAGE_MULT: 21.2, HULL_MULT: 24.0, SPEED_MULT: 4.5, RANGE_MULT: 2.0, fixed: true,  MAG_SIZE: 2, INTER_SHOT: 0.35, RELOAD_TIME: 8.5, defaultAmmo: '60mm-kp' },
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

    if (variant === 'fixed')  variant = 'small-fixed';
    if (variant === 'turret') variant = 'large-turret';
    if (!VARIANTS[variant]) variant = 'large-turret';

    const V = VARIANTS[variant];
    this.isFixed     = V.fixed;
    this.displayName = DISPLAY_NAMES[variant];

    this.damage          = BASE_DAMAGE      * V.DAMAGE_MULT;
    this.hullDamage      = BASE_HULL_DAMAGE * V.HULL_MULT;
    this.projectileSpeed = BASE_PROJECTILE_SPEED * V.SPEED_MULT * PROJECTILE_SPEED_FACTOR;
    this.maxRange        = BASE_WEAPON_RANGE * V.RANGE_MULT;
    this.magSize         = V.MAG_SIZE;
    this.ammo            = V.MAG_SIZE;
    this.reloadTime      = V.RELOAD_TIME;
    this._reloadTimer    = 0;
    this._interShot      = V.INTER_SHOT;
    this._cooldown       = 0;
    this.pipCount        = V.MAG_SIZE;
    // Ammo item system
    this.acceptedAmmoTypes = [V.defaultAmmo];
    this.currentAmmoId     = V.defaultAmmo;
  }

  get isReloading() { return this._reloadTimer > 0; }

  update(dt) {
    if (this._cooldown > 0) this._cooldown -= dt;
  }

  fire(ship, tx, ty, entities) {
    if (this._cooldown > 0 || this._reloadTimer > 0) return;
    if (ship.relation === 'player' && this.ammo <= 0) return;

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
    proj.glowColor   = WHITE;
    proj.length      = 12;
    proj.hasTrail    = true;
    entities.push(proj);

    if (ship.relation === 'player') {
      this.ammo--;
      if (this.ammo <= 0) {
        this._reloadTimer = this.reloadTime;
      } else {
        this._cooldown = this._interShot;
      }
    } else {
      this._cooldown = this._interShot || this.reloadTime;
    }
  }
}
