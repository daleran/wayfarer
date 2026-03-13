import { Projectile } from '@/entities/projectile.js';
import { GREEN, PROJ_GLOW_GREEN } from '@/rendering/colors.js';
import { BASE_DAMAGE, BASE_HULL_DAMAGE, BASE_WEAPON_RANGE, BASE_PROJECTILE_SPEED,
         PROJECTILE_SPEED_FACTOR, BASE_COOLDOWN,
         GATLING_MAG_SIZE, GATLING_RELOAD_TIME } from '@data/compiledData.js';

const DAMAGE_MULT      = 0.24;   // ~4 armor per shot (DPS via high fire rate)
const HULL_DAMAGE_MULT = 0.2;    // 2 hull per shot
const COOLDOWN_MULT    = 0.06;
const SPEED_MULT       = 2.0;
const RANGE_MULT       = 0.333;  // ~500u — short range

export class GatlingGun {
  constructor() {
    this.isSecondary = false;
    this.isAutoFire  = false;
    this.displayName = 'GATLING';
    this.damage       = BASE_DAMAGE      * DAMAGE_MULT;
    this.hullDamage   = BASE_HULL_DAMAGE * HULL_DAMAGE_MULT;
    this.projectileSpeed = BASE_PROJECTILE_SPEED * SPEED_MULT * PROJECTILE_SPEED_FACTOR;
    this.maxRange     = BASE_WEAPON_RANGE * RANGE_MULT;
    this.cooldownMax  = BASE_COOLDOWN * COOLDOWN_MULT;
    this._cooldown    = 0;
    // Magazine
    this.magSize      = GATLING_MAG_SIZE;
    this.ammo         = GATLING_MAG_SIZE;
    this.reloadTime   = GATLING_RELOAD_TIME;
    this._reloadTimer = 0;
    // Ammo item system
    this.acceptedAmmoTypes = ['8mm'];
    this.currentAmmoId     = '8mm';
  }

  get isReloading() { return this._reloadTimer > 0; }

  update(dt) {
    if (this._cooldown > 0) this._cooldown -= dt;
  }

  fire(ship, tx, ty, entities) {
    if (this._cooldown > 0 || this._reloadTimer > 0) return;
    if (ship.relation === 'player' && this.ammo <= 0) return;
    const dx = tx - ship.x; const dy = ty - ship.y;
    const dist = Math.sqrt(dx*dx + dy*dy); if (dist === 0) return;
    const nx = dx / dist; const ny = dy / dist;
    const proj = new Projectile(ship.x, ship.y, nx * this.projectileSpeed, ny * this.projectileSpeed, this.damage, ship);
    proj.hullDamage  = this.hullDamage;
    proj.maxRange    = this.maxRange;
    proj.color       = GREEN;
    proj.glowColor   = PROJ_GLOW_GREEN;
    proj.length      = 3;
    proj.canIntercept = true;
    entities.push(proj);
    if (ship.relation === 'player') {
      this.ammo--;
      if (this.ammo <= 0) this._reloadTimer = this.reloadTime;
    }
    this._cooldown = this.cooldownMax;
  }
}
