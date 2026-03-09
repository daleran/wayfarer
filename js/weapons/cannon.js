import { Projectile } from '../entities/projectile.js';
import { AMBER, TORPEDO_AMBER } from '../ui/colors.js';
import { BASE_DAMAGE, BASE_HULL_DAMAGE, BASE_WEAPON_RANGE, BASE_PROJECTILE_SPEED,
         PROJECTILE_SPEED_FACTOR, BASE_COOLDOWN } from '../data/stats.js';
import { normalizeToTarget } from '../utils/math.js';

const DAMAGE_MULT      = 3.24;  // ~55 armor
const HULL_DAMAGE_MULT = 4.5;   // 45 hull
const COOLDOWN_MULT    = 3.0;
const SPEED_MULT       = 0.65;
const RANGE_MULT       = 0.933; // ~1400u

export class Cannon {
  constructor() {
    this.isSecondary = false;
    this.isAutoFire  = false;
    this.displayName = 'CANNON';
    this.ammoType    = 'cannon';
    this.damage         = BASE_DAMAGE      * DAMAGE_MULT;
    this.hullDamage     = BASE_HULL_DAMAGE * HULL_DAMAGE_MULT;
    this.projectileSpeed = BASE_PROJECTILE_SPEED * SPEED_MULT * PROJECTILE_SPEED_FACTOR;
    this.maxRange       = BASE_WEAPON_RANGE * RANGE_MULT;
    this.blastRadius    = 120;
    this.cooldownMax    = BASE_COOLDOWN * COOLDOWN_MULT;
    this._cooldown      = 0;
  }
  update(dt) { if (this._cooldown > 0) this._cooldown -= dt; }
  fire(ship, tx, ty, entities) {
    if (this._cooldown > 0) return;
    const n = normalizeToTarget(ship.x, ship.y, tx, ty);
    if (!n) return;
    const { nx, ny } = n;
    const proj = new Projectile(ship.x, ship.y, nx * this.projectileSpeed, ny * this.projectileSpeed, this.damage, ship);
    proj.hullDamage       = this.hullDamage;
    proj.maxRange         = this.maxRange;
    proj.color            = TORPEDO_AMBER;
    proj.glowColor        = AMBER;
    proj.length           = 7;
    proj.detonatesOnContact = true;
    proj.blastRadius      = this.blastRadius;
    entities.push(proj);
    this._cooldown = this.cooldownMax * (ship._fireCooldownMult ?? 1);
  }
}
