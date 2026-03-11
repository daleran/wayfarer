import { BASE_DAMAGE, BASE_WEAPON_RANGE } from '../data/tuning/weaponTuning.js';

const OVERHEAT_LIMIT = 5.0;  // seconds at full power before forced shutdown
const COOLDOWN_TIME  = 4.0;  // seconds required to cool before firing again

// Lance: ramping beam — baseDamage (at t=0) to maxDamage (at rampTime)
// Range expressed as a fraction of BASE_WEAPON_RANGE
const VARIANTS = {
  'small-fixed':  { BASE_MULT: 0.88, MAX_MULT: 4.12, RANGE_MULT: 0.233, fixed: true,  hullFactor: 1.0, canInterceptBeam: false, powerDraw: 30 },
  'small-turret': { BASE_MULT: 0.25, MAX_MULT: 1.20, RANGE_MULT: 0.200, fixed: false, hullFactor: 0.0, canInterceptBeam: true,  powerDraw: 15 },
  'large-fixed':  { BASE_MULT: 1.76, MAX_MULT: 8.24, RANGE_MULT: 0.333, fixed: true,  hullFactor: 1.0, canInterceptBeam: false, powerDraw: 60 },
  'large-turret': { BASE_MULT: 1.41, MAX_MULT: 6.59, RANGE_MULT: 0.300, fixed: false, hullFactor: 1.0, canInterceptBeam: false, powerDraw: 50 },
};

const DISPLAY_NAMES = {
  'small-fixed':  'LANCE-SF',
  'small-turret': 'LANCE-ST',
  'large-fixed':  'LANCE-LF',
  'large-turret': 'LANCE-LT',
};

export class Lance {
  constructor(variant = 'small-turret') {
    this.isSecondary = false;
    this.isAutoFire  = false;
    this.isBeam      = true;

    // Backward-compat: map old variant names to new ones
    if (variant === 'small') variant = 'small-turret';
    if (variant === 'large') variant = 'large-turret';
    if (variant === 'fixed') variant = 'small-fixed';
    // Default fallback
    if (!VARIANTS[variant]) variant = 'small-turret';

    const V = VARIANTS[variant];
    this.isFixed          = V.fixed;
    this.hullFactor       = V.hullFactor;
    this.canInterceptBeam = V.canInterceptBeam;
    this.displayName      = DISPLAY_NAMES[variant];

    this.baseDamage  = BASE_DAMAGE * V.BASE_MULT;
    this.maxDamage   = BASE_DAMAGE * V.MAX_MULT;
    this.maxRange    = BASE_WEAPON_RANGE * V.RANGE_MULT;
    this.rampTime    = 2.0;   // seconds to reach full damage
    this.overheatLimit = OVERHEAT_LIMIT;
    this.cooldownTime  = COOLDOWN_TIME;

    // State
    this._rampUp         = 0;   // 0..rampTime
    this._isFiring       = false;
    this._hitTarget      = null;
    this._beamOriginX    = 0;
    this._beamOriginY    = 0;
    this._beamEndX       = 0;
    this._beamEndY       = 0;
    this._fullPowerTimer = 0;   // accumulated seconds at full power
    this._overheated     = false;
    this._cooldownTimer  = 0;
  }

  update(dt) {
    // Overheat cooldown — beam is locked out until fully cooled
    if (this._overheated) {
      this._isFiring = false;
      this._cooldownTimer -= dt;
      this._rampUp = Math.max(this._rampUp - dt * 2, 0);
      if (this._cooldownTimer <= 0) {
        this._overheated     = false;
        this._cooldownTimer  = 0;
        this._fullPowerTimer = 0;
      }
      return;
    }

    if (this._isFiring) {
      this._rampUp = Math.min(this._rampUp + dt, this.rampTime);

      // Track full-power burn time; shut down if limit exceeded
      if (this._rampUp >= this.rampTime) {
        this._fullPowerTimer += dt;
        if (this._fullPowerTimer >= OVERHEAT_LIMIT) {
          this._overheated    = true;
          this._cooldownTimer = COOLDOWN_TIME;
          this._hitTarget     = null;
          this._isFiring      = false;
          return;
        }
      }

      // Apply damage to hit target
      if (this._hitTarget && this._hitTarget.active) {
        const t = this._rampUp / this.rampTime;
        const dmgPerSec = this.baseDamage + (this.maxDamage - this.baseDamage) * t;
        const dmg = dmgPerSec * dt;
        this._hitTarget.takeDamage(dmg, dmg * this.hullFactor, this._beamEndX, this._beamEndY);
        if (this._hitTarget.isDestroyed) this._hitTarget = null;
      }
    } else {
      this._rampUp = Math.max(this._rampUp - dt * 2, 0);
      // Releasing the trigger bleeds heat at the same rate it builds
      this._fullPowerTimer = Math.max(this._fullPowerTimer - dt, 0);
    }

    this._isFiring = false; // reset each frame; fire() re-sets it
  }

  fire(ship, tx, ty, entities) {
    if (this._overheated) return;
    this._isFiring    = true;
    this._beamOriginX = ship.x;
    this._beamOriginY = ship.y;

    let nx, ny, beamLength;
    if (this.isFixed) {
      nx = Math.sin(ship.rotation);
      ny = -Math.cos(ship.rotation);
      beamLength = this.maxRange;
    } else {
      const dx = tx - ship.x;
      const dy = ty - ship.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist === 0) return;
      nx = dx / dist;
      ny = dy / dist;
      beamLength = Math.min(dist, this.maxRange);
    }

    this._beamEndX = ship.x + nx * beamLength;
    this._beamEndY = ship.y + ny * beamLength;
    this._hitTarget = null;

    // Hitscan — find closest ship along beam
    let closestT = beamLength;
    for (const entity of entities) {
      if (!entity.active || !entity.isShip) continue;
      if (entity === ship) continue;
      if (entity.faction && ship.faction && entity.faction === ship.faction) continue;
      const ecx = entity.x - ship.x;
      const ecy = entity.y - ship.y;
      const t = ecx * nx + ecy * ny;
      if (t < 0 || t > closestT) continue;
      const px = ecx - t * nx;
      const py = ecy - t * ny;
      const r = entity.getBounds().radius;
      if (px*px + py*py < (r + 4) * (r + 4)) {
        closestT = t;
        this._hitTarget = entity;
      }
    }

    if (this._hitTarget) {
      this._beamEndX = ship.x + nx * closestT;
      this._beamEndY = ship.y + ny * closestT;
    }
  }
}
