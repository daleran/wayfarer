import { Projectile } from '../entities/projectile.js';
import { AMBER, AUTOCANNON_GLOW } from '../ui/colors.js';
import { BASE_DAMAGE, BASE_HULL_DAMAGE, BASE_WEAPON_RANGE, BASE_PROJECTILE_SPEED,
         PROJECTILE_SPEED_FACTOR, BASE_COOLDOWN,
         AUTOCANNON_MAG_SIZE, AUTOCANNON_RELOAD_TIME,
         HE_AUTOCANNON_BLAST } from '../data/stats.js';
import { normalizeToTarget } from '../utils/math.js';

const DAMAGE_MULT  = 1.0;
const RANGE_MULT   = 1.0;
const SPEED_MULT   = 1.0;
const COOLDOWN_MULT = 1.04;
const CARGO_WEIGHT = 0.01; // 100 rounds per cargo unit

// Ammo mode definitions — all values relative to base weapon stats
const AMMO_MODES = {
  ap: {
    damageMult:    1.0,
    hullDamageBase: null, // uses weapon default (no hullDamage property on AP)
    blastRadius:   0,
    detonatesOnContact: false,
    canIntercept:  false,
  },
  he: {
    damageMult:    0.25,
    hullDamageBase: BASE_HULL_DAMAGE * 1.65,
    blastRadius:   HE_AUTOCANNON_BLAST,
    detonatesOnContact: true,
    canIntercept:  true,
  },
};

export class Autocannon {
  constructor() {
    this.damage = BASE_DAMAGE * DAMAGE_MULT;
    this.cooldownMax = BASE_COOLDOWN * COOLDOWN_MULT;
    this._cooldown = 0;
    this.projectileSpeed = BASE_PROJECTILE_SPEED * SPEED_MULT * PROJECTILE_SPEED_FACTOR;
    this.maxRange = BASE_WEAPON_RANGE * RANGE_MULT;
    this.isAutoFire = false;
    this.ammoType = 'autocannon';
    this.color = AMBER;
    this.glowColor = AUTOCANNON_GLOW;
    // Magazine
    this.magSize        = AUTOCANNON_MAG_SIZE;
    this.ammo           = AUTOCANNON_MAG_SIZE;
    this.reloadTime     = AUTOCANNON_RELOAD_TIME;
    this._reloadTimer   = 0;
    this.ammoCargoWeight = CARGO_WEIGHT;
    // Ammo mode
    this.ammoModes       = ['ap', 'he'];
    this.currentAmmoMode = 'ap';
  }

  get displayName() {
    return 'AUTOCANNON [' + this.currentAmmoMode.toUpperCase() + ']';
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
    const mode = AMMO_MODES[this.currentAmmoMode];
    const proj = new Projectile(
      ship.x, ship.y,
      nx * this.projectileSpeed,
      ny * this.projectileSpeed,
      this.damage * mode.damageMult,
      ship
    );
    proj.maxRange = this.maxRange;
    proj.color = this.color;
    proj.glowColor = this.glowColor;
    proj.length = 3;
    proj.hasTrail = true;
    if (mode.hullDamageBase !== null) proj.hullDamage = mode.hullDamageBase;
    if (mode.blastRadius > 0)         proj.blastRadius = mode.blastRadius;
    if (mode.detonatesOnContact)      proj.detonatesOnContact = true;
    if (mode.canIntercept)            proj.canIntercept = true;
    entities.push(proj);
    if (ship.relation === 'player') {
      this.ammo--;
      // Auto-start reload when magazine is empty
      if (this.ammo <= 0) this._reloadTimer = this.reloadTime;
    }
    this._cooldown = this.cooldownMax * (ship._fireCooldownMult ?? 1);
  }
}
