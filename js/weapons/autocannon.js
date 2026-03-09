import { Projectile } from '../entities/projectile.js';
import { AMBER, AUTOCANNON_GLOW } from '../ui/colors.js';
import { BASE_DAMAGE, BASE_WEAPON_RANGE, BASE_PROJECTILE_SPEED,
         PROJECTILE_SPEED_FACTOR, BASE_COOLDOWN } from '../data/stats.js';
import { normalizeToTarget } from '../utils/math.js';

const DAMAGE_MULT  = 1.0;
const RANGE_MULT   = 1.0;
const SPEED_MULT   = 1.0;
const COOLDOWN_MULT = 1.04;

export class Autocannon {
  constructor() {
    this.damage = BASE_DAMAGE * DAMAGE_MULT;
    this.cooldownMax = BASE_COOLDOWN * COOLDOWN_MULT;
    this._cooldown = 0;
    this.projectileSpeed = BASE_PROJECTILE_SPEED * SPEED_MULT * PROJECTILE_SPEED_FACTOR;
    this.maxRange = BASE_WEAPON_RANGE * RANGE_MULT;
    this.isAutoFire = false;
    this.displayName = 'AUTOCANNON';
    this.ammoType = 'autocannon';
    this.color = AMBER;
    this.glowColor = AUTOCANNON_GLOW;
    this.ammo = 60;
    this.ammoMax = 60;
    this.ammoCargoWeight = 0.1; // 10 rounds per cargo unit
  }

  update(dt) {
    if (this._cooldown > 0) this._cooldown -= dt;
  }

  fire(ship, tx, ty, entities) {
    if (this._cooldown > 0 || this.ammo <= 0) return;
    const n = normalizeToTarget(ship.x, ship.y, tx, ty);
    if (!n) return;
    const { nx, ny } = n;
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
    proj.length = 3;       // small tight bolt
    proj.hasTrail = true;  // short tracer tail
    entities.push(proj);
    this.ammo--;
    this._cooldown = this.cooldownMax * (ship._fireCooldownMult ?? 1);
  }
}
