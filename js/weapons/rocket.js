import { Projectile } from '../entities/projectile.js';
import { BASE_DAMAGE, BASE_HULL_DAMAGE, BASE_PROJECTILE_SPEED,
         PROJECTILE_SPEED_FACTOR, BASE_COOLDOWN,
         ROCKET_MAG_SIZE, ROCKET_RELOAD_TIME } from '../data/tuning/weaponTuning.js';
import { normalizeToTarget } from '../utils/math.js';

const DAMAGE_MULT      = 5.3;   // ~100 armor damage
const HULL_DAMAGE_MULT = 6.5;   // ~78 hull
const SPEED_MULT       = 1.4;
const COOLDOWN_MULT    = 1.0;   // cooldown between individual shots
const BURST_SPREAD     = 0.07;  // radians between the two tubes (guided only)
const CARGO_WEIGHT     = 1.0;   // 1 cargo unit per rocket

export class RocketPodSmall {
  constructor() {
    this.isSecondary = true;
    this.isAutoFire  = false;
    this.ammoType    = 'rocket';
    this.damage      = BASE_DAMAGE      * DAMAGE_MULT;
    this.hullDamage  = BASE_HULL_DAMAGE * HULL_DAMAGE_MULT;
    this.projectileSpeed = BASE_PROJECTILE_SPEED * SPEED_MULT * PROJECTILE_SPEED_FACTOR;
    this.cooldownMax = BASE_COOLDOWN * COOLDOWN_MULT;
    this._cooldown   = 0;
    // Magazine — 2 tubes
    this.magSize        = ROCKET_MAG_SIZE;
    this.ammo           = ROCKET_MAG_SIZE;
    this.reloadTime     = ROCKET_RELOAD_TIME;
    this._reloadTimer   = 0;
    this.ammoCargoWeight = CARGO_WEIGHT;
    this.pipCount       = ROCKET_MAG_SIZE; // HUD pip count matches tube count
    // Guidance mode
    this.guidanceModes = ['dumbfire', 'wire', 'heat'];
    this.guidanceMode  = 'dumbfire';
    // Tube alternation
    this._tubeIdx = 0;
  }

  get displayName() {
    return 'RPOD-S';
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
    const { nx, ny, dist } = n;

    // Fire one tube per click; dumbfire goes straight, guided gets slight tube offset
    const baseAngle = Math.atan2(ny, nx);
    const tubeSpread = this.guidanceMode === 'dumbfire'
      ? 0
      : (this._tubeIdx === 0 ? -BURST_SPREAD / 2 : BURST_SPREAD / 2);
    const a = baseAngle + tubeSpread;

    const proj = new Projectile(
      ship.x, ship.y,
      Math.cos(a) * this.projectileSpeed,
      Math.sin(a) * this.projectileSpeed,
      this.damage,
      ship
    );
    proj.hullDamage      = this.hullDamage;
    proj.maxRange        = dist + 20;
    proj.isInterceptable = true;

    if (this.guidanceMode === 'dumbfire') {
      proj.isRocket      = true;
      proj.rocketTargetX = tx;
      proj.rocketTargetY = ty;
    } else if (this.guidanceMode === 'wire') {
      proj.isGuided         = true;
      proj.guidedType       = 'wire';
      proj.guidanceStrength = 3.0;
    } else if (this.guidanceMode === 'heat') {
      proj.isGuided         = true;
      proj.guidedType       = 'heat';
      proj.guidanceStrength = 2.5;
    }

    entities.push(proj);
    this._tubeIdx = 1 - this._tubeIdx;

    if (ship.relation === 'player') {
      this.ammo--;
      if (this.ammo <= 0) {
        this._reloadTimer = this.reloadTime;
        this._tubeIdx = 0;
      }
    }
    this._cooldown = this.cooldownMax;
  }
}

// Backward-compat alias so existing imports of Rocket still work
export { RocketPodSmall as Rocket };
