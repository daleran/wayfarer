import { Entity } from '../entities/entity.js';
import { CYAN, AMBER, RED, WHITE } from '../ui/colors.js';
import { FACTION_MAP } from '../systems/reputation.js';

export class Station extends Entity {
  constructor(x, y, data) {
    super(x, y);
    this.name = data.name;
    this.faction = data.faction ?? 'neutral';
    this.relation = data.relation ?? 'neutral';
    this.reputationFaction = FACTION_MAP[this.faction] ?? 'settlements';
    this.services = data.services ?? [];
    this.commodities = data.commodities ?? {};
    this.shipyard = data.shipyard ?? [];
    this.lore = data.lore ?? null;
    this.bounties = [...(data.bountyContracts ?? [])];
    this.canOverhaulReactor = data.canOverhaulReactor ?? false;
    this.layout = data.layout ?? null;
    this.dockingRadius = 150;
    this._navPulse = 0;
  }

  // Accent color for nav lights, docking arms, labels.
  // Friendly → CYAN. Enemy → RED. Neutral (all factions initially) → AMBER.
  get accentColor() {
    if (this.relation === 'friendly') return CYAN;
    if (this.relation === 'enemy')    return RED;
    return AMBER;
  }

  update(dt) {
    this._navPulse += dt;
  }

  render(ctx, camera) {
    const screen = camera.worldToScreen(this.x, this.y);
    const accent = this.accentColor;
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
    ctx.strokeStyle = accent;
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.globalAlpha = 1;

    // Hexagonal core — white structure
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
    ctx.strokeStyle = WHITE;
    ctx.lineWidth = 1.5;
    ctx.globalAlpha = 0.7;
    ctx.stroke();
    ctx.globalAlpha = 1;

    // 4 docking arms
    ctx.strokeStyle = WHITE;
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.3;
    for (let i = 0; i < 4; i++) {
      const angle = (i / 4) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(Math.cos(angle) * 28, Math.sin(angle) * 28);
      ctx.lineTo(Math.cos(angle) * 44, Math.sin(angle) * 44);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;

    // Blinking nav lights — accent color signals relation
    const litUp = Math.floor(this._navPulse / 0.8) % 2 === 0;
    if (litUp) {
      ctx.fillStyle = accent;
      for (let i = 0; i < 4; i++) {
        const angle = (i / 4) * Math.PI * 2 + Math.PI / 8;
        const lx = Math.cos(angle) * 36;
        const ly = Math.sin(angle) * 36;
        ctx.beginPath();
        ctx.arc(lx, ly, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    this._renderNameLabel(ctx, camera, 50);

    ctx.restore();
  }

  // Draw station name below the icon. Call inside a render() block after ctx.scale(z, z).
  // Callers must not have already unscaled — this method handles the 1/z rescale.
  _renderNameLabel(ctx, camera, yOffset = 50, font = '10px monospace', alpha = 0.7) {
    const z = camera.zoom;
    ctx.scale(1 / z, 1 / z);
    ctx.font = font;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillStyle = this.accentColor;
    ctx.globalAlpha = alpha;
    ctx.fillText(this.name, 0, yOffset * z);
    ctx.globalAlpha = 1;
  }

  getBounds() {
    return { x: this.x, y: this.y, radius: 28 };
  }
}

export function createStation(data) {
  return new Station(data.x, data.y, data);
}
