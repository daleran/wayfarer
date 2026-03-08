import { Entity } from '../entities/entity.js';
import { FACTION, CYAN } from '../ui/colors.js';

export class Station extends Entity {
  constructor(x, y, data) {
    super(x, y);
    this.name = data.name;
    this.faction = data.faction ?? 'neutral';
    this.services = data.services ?? [];
    this.commodities = data.commodities ?? {};
    this.shipyard = data.shipyard ?? [];
    this.lore = data.lore ?? null;
    this.dockingRadius = 150;
    this._navPulse = 0;
  }

  update(dt) {
    this._navPulse += dt;
  }

  render(ctx, camera) {
    const screen = camera.worldToScreen(this.x, this.y);
    const color = FACTION[this.faction] ?? CYAN;
    const cx = screen.x;
    const cy = screen.y;
    const z = camera.zoom;

    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(z, z);

    // Outer glow ring — subtle
    ctx.beginPath();
    ctx.arc(0, 0, 44, 0, Math.PI * 2);
    ctx.globalAlpha = 0.08;
    ctx.strokeStyle = color;
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.globalAlpha = 1;

    // Hexagonal core — wireframe emphasis
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2 - Math.PI / 6;
      const hx = Math.cos(angle) * 28;
      const hy = Math.sin(angle) * 28;
      if (i === 0) ctx.moveTo(hx, hy);
      else ctx.lineTo(hx, hy);
    }
    ctx.closePath();
    ctx.fillStyle = 'rgba(0,4,8,0.8)';
    ctx.fill();
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // 4 docking arms
    ctx.strokeStyle = color;
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.5;
    for (let i = 0; i < 4; i++) {
      const angle = (i / 4) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(Math.cos(angle) * 28, Math.sin(angle) * 28);
      ctx.lineTo(Math.cos(angle) * 44, Math.sin(angle) * 44);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;

    // Blinking nav lights
    const litUp = Math.floor(this._navPulse / 0.8) % 2 === 0;
    if (litUp) {
      ctx.fillStyle = color;
      for (let i = 0; i < 4; i++) {
        const angle = (i / 4) * Math.PI * 2 + Math.PI / 8;
        const lx = Math.cos(angle) * 36;
        const ly = Math.sin(angle) * 36;
        ctx.beginPath();
        ctx.arc(lx, ly, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Station name label (drawn after scale so text size is in screen pixels)
    ctx.scale(1 / z, 1 / z);
    ctx.font = '10px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillStyle = CYAN;
    ctx.globalAlpha = 0.7;
    ctx.fillText(this.name, 0, 50 * z);
    ctx.globalAlpha = 1;

    ctx.restore();
  }

  getBounds() {
    return { x: this.x, y: this.y, radius: 28 };
  }
}

export function createStation(data) {
  return new Station(data.x, data.y, data);
}
