import { Projectile } from '../entities/projectile.js';
import { AMBER, AUTOCANNON_GLOW } from '../ui/colors.js';
import { BASE_DAMAGE, BASE_WEAPON_RANGE, BASE_PROJECTILE_SPEED,
         PROJECTILE_SPEED_FACTOR, BASE_COOLDOWN,
         AUTOCANNON_MAG_SIZE, AUTOCANNON_RELOAD_TIME } from '../data/stats.js';
import { normalizeToTarget } from '../utils/math.js';

const DAMAGE_MULT  = 1.0;
const RANGE_MULT   = 1.0;
const SPEED_MULT   = 1.0;
const COOLDOWN_MULT = 1.04;
const CARGO_WEIGHT = 0.01; // 100 rounds per cargo unit

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
    // Magazine
    this.magSize        = AUTOCANNON_MAG_SIZE;
    this.ammo           = AUTOCANNON_MAG_SIZE;
    this.reloadTime     = AUTOCANNON_RELOAD_TIME;
    this._reloadTimer   = 0;
    this.ammoCargoWeight = CARGO_WEIGHT;
  }

  get isReloading() { return this._reloadTimer > 0; }

  update(dt) {
    if (this._cooldown > 0) this._cooldown -= dt;
  }

  fire(ship, tx, ty, entities) {
    if (this._cooldown > 0 || this._reloadTimer > 0) return;
    if (ship.relation === 'player' && this.ammo <= 0) return;
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
    proj.length = 3;
    proj.hasTrail = true;
    entities.push(proj);
    if (ship.relation === 'player') {
      this.ammo--;
      // Auto-start reload when magazine is empty
      if (this.ammo <= 0) this._reloadTimer = this.reloadTime;
    }
    this._cooldown = this.cooldownMax * (ship._fireCooldownMult ?? 1);
  }
}
