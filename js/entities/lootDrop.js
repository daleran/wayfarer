import { Entity } from './entity.js';
import { AMBER, CYAN, GREEN, MAGENTA } from '@/rendering/colors.js';
import {
  SalvagedSensorSuite, StandardSensorSuite, CombatComputerModule,
  SalvageScannerModule, LongRangeScannerModule,
  HydrogenFuelCell, SmallFissionReactor, LargeFusionReactor,
} from '@/modules/shipModule.js';
import { Autocannon } from '@/modules/weapons/autocannon.js';
import { Cannon }     from '@/modules/weapons/cannon.js';
import { Lance }      from '@/modules/weapons/lance.js';
import { LOOT_TABLES, DEFAULT_LOOT_TABLE } from '@/data/lootTables.js';
import { COMMODITIES } from '@/data/commodities.js';

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
  const typeLabel = ammoType.charAt(0).toUpperCase() + ammoType.slice(1).replace(/-/g, ' ');
  drop.label = `+${amount} ${typeLabel} Ammo`;
  return _scatter(drop);
}

// Module pool — maps loot table pool id to a factory function
const MODULE_FACTORIES = {
  SalvagedSensorSuite:   () => new SalvagedSensorSuite(),
  StandardSensorSuite:   () => new StandardSensorSuite(),
  CombatComputer:        () => new CombatComputerModule(),
  SalvageScanner:        () => new SalvageScannerModule(),
  LongRangeScanner:      () => new LongRangeScannerModule(),
  HydrogenFuelCell:      () => new HydrogenFuelCell(),
  SmallFissionReactor:   () => new SmallFissionReactor(),
  LargeFusionReactor:    () => new LargeFusionReactor(),
};

// Weapon pool — maps id to factory
const WEAPON_FACTORIES = {
  Autocannon: () => new Autocannon(),
  Cannon:     () => new Cannon(),
  LanceSmall: () => new Lance('small'),
};

function _rollCommodity(pool) {
  let roll = Math.random();
  for (const [id, weight] of Object.entries(pool)) {
    roll -= weight;
    if (roll <= 0) return id;
  }
  return Object.keys(pool)[0];
}

export function generateEnemyLoot(x, y, tableId = DEFAULT_LOOT_TABLE) {
  const table = LOOT_TABLES[tableId] ?? LOOT_TABLES[DEFAULT_LOOT_TABLE];
  const drops = [];

  // Scrap — always rolled
  if (table.scrap && Math.random() < table.scrap.chance) {
    const amount = table.scrap.min + Math.floor(Math.random() * (table.scrap.max - table.scrap.min + 1));
    drops.push(createLootDrop(x, y, 'scrap', amount));
  }
  // Fuel
  if (table.fuel && Math.random() < table.fuel.chance) {
    const amount = table.fuel.min + Math.floor(Math.random() * (table.fuel.max - table.fuel.min + 1));
    drops.push(createLootDrop(x, y, 'fuel', amount));
  }
  // Module
  if (table.module && Math.random() < table.module.chance) {
    const modId = table.module.pool[Math.floor(Math.random() * table.module.pool.length)];
    const factory = MODULE_FACTORIES[modId];
    if (factory) drops.push(createModuleDrop(x, y, factory()));
  }
  // Weapon
  if (table.weapon && Math.random() < table.weapon.chance) {
    const wepId = table.weapon.pool[Math.floor(Math.random() * table.weapon.pool.length)];
    const factory = WEAPON_FACTORIES[wepId];
    if (factory) drops.push(createWeaponDrop(x, y, factory()));
  }
  // Ammo
  if (table.ammo && Math.random() < table.ammo.chance) {
    const entry = table.ammo;
    const ammoType = entry.pool[Math.floor(Math.random() * entry.pool.length)];
    const amount = entry.min + Math.floor(Math.random() * (entry.max - entry.min + 1));
    drops.push(createAmmoDrop(x, y, ammoType, amount));
  }
  // Commodity
  if (table.commodity && Math.random() < table.commodity.chance) {
    const commodityId = _rollCommodity(table.commodity.pool);
    drops.push(createLootDrop(x, y, commodityId, 1));
  }

  return drops;
}
