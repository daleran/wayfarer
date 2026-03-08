import { Entity } from './entity.js';
import { AMBER } from '../ui/colors.js';

const PICKUP_RADIUS = 40;
const LIFETIME = 30;
const BLINK_TIME = 5;
const DRAG = 0.97;

export class LootDrop extends Entity {
  constructor(x, y, lootType, amount) {
    super(x, y);
    this.lootType = lootType; // 'scrap', 'fuel', or commodity id
    this.amount = amount;
    this.label = LootDrop._makeLabel(lootType, amount);
    this.pickupRadius = PICKUP_RADIUS;
    this.lifetime = LIFETIME;
    this.age = 0;
    this._rotationSpeed = 1.5 + Math.random();
  }

  static _makeLabel(type, amount) {
    if (type === 'scrap') return `+${amount} Scrap`;
    if (type === 'fuel') return `+${amount} Fuel`;
    return `+${amount} ${type.charAt(0).toUpperCase() + type.slice(1)}`;
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
    ctx.rotate(this.rotation);
    ctx.globalAlpha = pulse;

    // Diamond shape
    const s = 6;
    ctx.beginPath();
    ctx.moveTo(0, -s);
    ctx.lineTo(s, 0);
    ctx.lineTo(0, s);
    ctx.lineTo(-s, 0);
    ctx.closePath();
    ctx.strokeStyle = AMBER;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.globalAlpha = 1;
    ctx.restore();
  }

  getBounds() {
    return { x: this.x, y: this.y, radius: this.pickupRadius };
  }
}

export function createLootDrop(x, y, type, amount) {
  const drop = new LootDrop(x, y, type, amount);
  // Scatter velocity from explosion
  const angle = Math.random() * Math.PI * 2;
  const speed = 20 + Math.random() * 40;
  drop.vx = Math.sin(angle) * speed;
  drop.vy = -Math.cos(angle) * speed;
  return drop;
}

export function generateEnemyLoot(x, y) {
  const drops = [];
  // Always: scrap
  drops.push(createLootDrop(x, y, 'scrap', 4 + Math.floor(Math.random() * 8)));
  // 30% chance: fuel
  if (Math.random() < 0.30) {
    drops.push(createLootDrop(x, y, 'fuel', 5 + Math.floor(Math.random() * 10)));
  }
  // 25% chance: commodity
  if (Math.random() < 0.25) {
    const roll = Math.random();
    let commodityId;
    if (roll < 0.50) commodityId = 'ore';
    else if (roll < 0.80) commodityId = 'tech';
    else if (roll < 0.95) commodityId = 'food';
    else commodityId = 'exotics';
    drops.push(createLootDrop(x, y, commodityId, 1));
  }
  return drops;
}
