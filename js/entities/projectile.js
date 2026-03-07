import { Entity } from './entity.js';

export class Projectile extends Entity {
  constructor(x, y, vx, vy, damage, owner) {
    super(x, y);
    this.vx = vx;
    this.vy = vy;
    this.damage = damage;
    this.owner = owner;
    this.distanceTravelled = 0;
    this.maxRange = 350;
  }

  update(dt) {
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    this.distanceTravelled += Math.sqrt(this.vx * this.vx + this.vy * this.vy) * dt;
    if (this.distanceTravelled > this.maxRange) {
      this.active = false;
    }
  }

  render(ctx, camera) {
    const screen = camera.worldToScreen(this.x, this.y);
    const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
    if (speed === 0) return;
    const nx = this.vx / speed;
    const ny = this.vy / speed;

    ctx.save();
    ctx.strokeStyle = '#8ef';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(screen.x - nx * 4, screen.y - ny * 4);
    ctx.lineTo(screen.x + nx * 4, screen.y + ny * 4);
    ctx.stroke();
    ctx.restore();
  }

  getBounds() {
    return { x: this.x, y: this.y, radius: 3 };
  }
}
