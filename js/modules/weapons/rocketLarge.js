import { Projectile } from '../../entities/projectile.js';
import { BASE_DAMAGE, BASE_HULL_DAMAGE, BASE_PROJECTILE_SPEED,
         PROJECTILE_SPEED_FACTOR, BASE_COOLDOWN } from '../../data/tuning/weaponTuning.js';
import { normalizeToTarget } from '../../utils/math.js';

const DAMAGE_MULT      = 5.3;   // ~90 armor damage per rocket
const HULL_DAMAGE_MULT = 6.5;   // 65 hull per rocket
const SPEED_MULT       = 1.4;
const COOLDOWN_MULT    = 1.5;   // slightly slower than small pod (heavier tubes)
const LARGE_MAG_SIZE   = 8;     // 8 tubes
const LARGE_RELOAD_TIME = 13.0;
const TUBE_SPREAD      = 0.07;  // radians between odd/even tubes (guided only)

export class RocketPodLarge {
  constructor() {
    this.isSecondary = true;
    this.isAutoFire  = false;
    this.ammoType    = 'rocket'; // shared pool with RocketPodSmall
    this.damage      = BASE_DAMAGE      * DAMAGE_MULT;
    this.hullDamage  = BASE_HULL_DAMAGE * HULL_DAMAGE_MULT;
    this.projectileSpeed = BASE_PROJECTILE_SPEED * SPEED_MULT * PROJECTILE_SPEED_FACTOR;
    this.cooldownMax = BASE_COOLDOWN * COOLDOWN_MULT;
    this._cooldown   = 0;
    this.magSize        = LARGE_MAG_SIZE;
    this.ammo           = LARGE_MAG_SIZE;
    this.reloadTime     = LARGE_RELOAD_TIME;
    this._reloadTimer   = 0;
    this.ammoCargoWeight = 1.0; // 1 cargo unit per rocket
    this.pipCount    = LARGE_MAG_SIZE;
    // Guidance mode
    this.guidanceModes = ['dumbfire', 'wire', 'heat'];
    this.guidanceMode  = 'dumbfire';
    // Tube alternation
    this._tubeIdx = 0;
  }

  get displayName() {
    return 'RPOD-L';
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

    const baseAngle = Math.atan2(ny, nx);
    const tubeSpread = this.guidanceMode === 'dumbfire'
      ? 0
      : (this._tubeIdx % 2 === 0 ? -TUBE_SPREAD / 2 : TUBE_SPREAD / 2);
    const a = baseAngle + tubeSpread;

    const proj = new Projectile(
      ship.x, ship.y,
      Math.cos(a) * this.projectileSpeed,
      Math.sin(a) * this.projectileSpeed,
      this.damage, ship
    );
    proj.hullDamage      = this.hullDamage;
    proj.maxRange        = dist + 20;
    proj.blastRadius     = 280;
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
    this._tubeIdx = (this._tubeIdx + 1) % LARGE_MAG_SIZE;

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
