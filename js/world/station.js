import { Entity } from '../entities/entity.js';

const FACTION_COLORS = {
  neutral:     '#4af',
  independent: '#8f4',
  military:    '#f84',
  pirates:     '#f84',
};

export class Station extends Entity {
  constructor(x, y, data) {
    super(x, y);
    this.name = data.name;
    this.faction = data.faction ?? 'neutral';
    this.services = data.services ?? [];
    this.commodities = data.commodities ?? {};
    this.dockingRadius = 150;
    this._navPulse = 0;
  }

  update(dt) {
    this._navPulse += dt;
  }

  render(ctx, camera) {
    const screen = camera.worldToScreen(this.x, this.y);
    const color = FACTION_COLORS[this.faction] ?? '#4af';
    const cx = screen.x;
    const cy = screen.y;

    ctx.save();

    // Outer glow ring
    ctx.beginPath();
    ctx.arc(cx, cy, 44, 0, Math.PI * 2);
    ctx.globalAlpha = 0.12;
    ctx.fillStyle = color;
    ctx.fill();
    ctx.globalAlpha = 1;

    // Hexagonal core (6 sides, radius 28px)
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2 - Math.PI / 6;
      const hx = cx + Math.cos(angle) * 28;
      const hy = cy + Math.sin(angle) * 28;
      if (i === 0) ctx.moveTo(hx, hy);
      else ctx.lineTo(hx, hy);
    }
    ctx.closePath();
    ctx.fillStyle = '#060c14';
    ctx.fill();
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // 4 docking arms radiating from cardinal angles
    ctx.strokeStyle = color;
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.5;
    for (let i = 0; i < 4; i++) {
      const angle = (i / 4) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(angle) * 28, cy + Math.sin(angle) * 28);
      ctx.lineTo(cx + Math.cos(angle) * 44, cy + Math.sin(angle) * 44);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;

    // Blinking nav lights — toggle every 0.8s
    const litUp = Math.floor(this._navPulse / 0.8) % 2 === 0;
    if (litUp) {
      ctx.fillStyle = color;
      for (let i = 0; i < 4; i++) {
        const angle = (i / 4) * Math.PI * 2 + Math.PI / 8;
        const lx = cx + Math.cos(angle) * 36;
        const ly = cy + Math.sin(angle) * 36;
        ctx.beginPath();
        ctx.arc(lx, ly, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.restore();
  }

  getBounds() {
    return { x: this.x, y: this.y, radius: 28 };
  }
}

export function createStation(data) {
  return new Station(data.x, data.y, data);
}
