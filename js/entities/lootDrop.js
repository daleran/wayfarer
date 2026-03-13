import { Entity } from './entity.js';
import { AMBER, CYAN, GREEN, MAGENTA } from '@/rendering/colors.js';
import { COMMODITIES } from '@/data/commodities.js';
import { AMMO } from '@data/compiledData.js';

const PICKUP_RADIUS = 40;
const LIFETIME = 30;
const BLINK_TIME = 5;
const DRAG = 0.97;

export class LootDrop extends Entity {
  constructor(x, y, lootType, amount) {
    super(x, y);
    this.lootType = lootType; // 'scrap', 'fuel', 'module', 'weapon', 'ammo', or commodity id
    this.amount = amount;
    this.moduleData = null;   // set for lootType === 'module'
    this.weaponData = null;   // set for lootType === 'weapon'
    this.ammoType   = null;   // set for lootType === 'ammo'
    this.label = LootDrop._makeLabel(lootType, amount);
    this.pickupRadius = PICKUP_RADIUS;
    this.lifetime = LIFETIME;
    this.age = 0;
    this._rotationSpeed = 1.5 + Math.random();
  }

  static _makeLabel(type, amount, moduleData, weaponData) {
    if (type === 'scrap') return `+${amount} Scrap`;
    if (type === 'fuel') return `+${amount} Fuel`;
    if (type === 'module') return moduleData ? `+${moduleData.displayName}` : '+Module';
    if (type === 'weapon') return weaponData ? `+${weaponData.displayName}` : '+Weapon';
    if (type === 'ammo') return `+${amount} Ammo`;
    const commodity = COMMODITIES[type];
    return commodity ? `+${amount} ${commodity.name}` : `+${amount} ${type}`;
  }

  update(dt) {
    this.age += dt;
    if (this.age >= this.lifetime) {
      this.active = false;
      return;
    }
    // Drag to stop
    this.vx *= DRAG;
    this.vy *= DRAG;
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    this.rotation += this._rotationSpeed * dt;
  }

  render(ctx, camera) {
    // Blink when near expiry
    const remaining = this.lifetime - this.age;
    if (remaining < BLINK_TIME && Math.floor(remaining * 4) % 2 === 0) return;

    const screen = camera.worldToScreen(this.x, this.y);
    const pulse = 0.6 + Math.sin(this.age * 4) * 0.4;

    ctx.save();
    ctx.translate(screen.x, screen.y);
    ctx.scale(camera.zoom, camera.zoom);
    ctx.rotate(this.rotation);
    ctx.globalAlpha = pulse;

    // Diamond shape — color by type
    const s = 6;
    ctx.beginPath();
    ctx.moveTo(0, -s);
    ctx.lineTo(s, 0);
    ctx.lineTo(0, s);
    ctx.lineTo(-s, 0);
    ctx.closePath();

    let strokeColor;
    if (this.lootType === 'module')      strokeColor = CYAN;
    else if (this.lootType === 'weapon') strokeColor = MAGENTA;
    else if (this.lootType === 'ammo')   strokeColor = GREEN;
    else                                 strokeColor = AMBER;

    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.globalAlpha = 1;
    ctx.restore();
  }

  getBounds() {
    return { x: this.x, y: this.y, radius: this.pickupRadius };
  }
}

function _scatter(drop) {
  const angle = Math.random() * Math.PI * 2;
  const speed = 20 + Math.random() * 40;
  drop.vx = Math.sin(angle) * speed;
  drop.vy = -Math.cos(angle) * speed;
  return drop;
}

export function createLootDrop(x, y, type, amount) {
  return _scatter(new LootDrop(x, y, type, amount));
}

export function createModuleDrop(x, y, moduleInstance) {
  // Destroyed modules convert to scrap
  if (moduleInstance.condition === 'destroyed') {
    return createLootDrop(x, y, 'scrap', 8);
  }
  const drop = new LootDrop(x, y, 'module', 1);
  drop.moduleData = moduleInstance;
  drop.label = LootDrop._makeLabel('module', 1, moduleInstance);
  return _scatter(drop);
}

export function createWeaponDrop(x, y, weaponInstance) {
  const drop = new LootDrop(x, y, 'weapon', 1);
  drop.weaponData = weaponInstance;
  drop.label = LootDrop._makeLabel('weapon', 1, null, weaponInstance);
  return _scatter(drop);
}

export function createAmmoDrop(x, y, ammoType, amount) {
  const drop = new LootDrop(x, y, 'ammo', amount);
  drop.ammoType = ammoType;
  const name = AMMO[ammoType]?.name || ammoType.toUpperCase();
  drop.label = `+${amount} ${name}`;
  return _scatter(drop);
}

