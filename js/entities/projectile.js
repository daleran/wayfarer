import { Entity } from './entity.js';
import { GREEN, RED } from '../ui/colors.js';

export class Projectile extends Entity {
  constructor(x, y, vx, vy, damage, owner) {
    super(x, y);
    this.vx = vx;
    this.vy = vy;
    this.damage = damage;
    this.owner = owner;
    this.distanceTravelled = 0;
    this.maxRange = 350;
    // Custom colors — set by weapon after creation, or fall back to relation-based
    this.color = null;
    this.glowColor = null;
    this.length = 4; // half-length of the streak in pixels
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

    const isPlayer = this.owner && (this.owner.faction === 'player');
    const baseColor = this.color || (isPlayer ? GREEN : RED);
    const sharpColor = this.glowColor || (isPlayer ? '#ccffcc' : '#ffcccc');
    const len = this.length;

    ctx.save();

    // Glow pass — wider, low alpha
    ctx.strokeStyle = baseColor;
    ctx.lineWidth = 5;
    ctx.globalAlpha = 0.2;
    ctx.beginPath();
    ctx.moveTo(screen.x - nx * (len + 1), screen.y - ny * (len + 1));
    ctx.lineTo(screen.x + nx * (len + 1), screen.y + ny * (len + 1));
    ctx.stroke();

    // Sharp pass
    ctx.strokeStyle = sharpColor;
    ctx.lineWidth = 2;
    ctx.globalAlpha = 1;
    ctx.beginPath();
    ctx.moveTo(screen.x - nx * len, screen.y - ny * len);
    ctx.lineTo(screen.x + nx * len, screen.y + ny * len);
    ctx.stroke();

    ctx.restore();
  }

  getBounds() {
    return { x: this.x, y: this.y, radius: 3 };
  }
}
