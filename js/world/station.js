import { Entity } from '../entities/entity.js';
import { CYAN, AMBER, RED, GREEN, WHITE } from '../rendering/colors.js';
import { text, SUBTITLE } from '../rendering/draw.js';
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
    this.lore = data.lore ?? null;
    this.bounties = [...(data.bountyContracts ?? [])];
    this.canOverhaulReactor = data.canOverhaulReactor ?? false;
    this.layout = data.layout ?? null;
    this.flavorText = data.flavorText ?? null;
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

  // Outline color — bright accent, used for canvas labels and UI borders.
  get outlineColor() { return this.accentColor; }

  // Fill color — dimmed version of accent, used for UI panel backgrounds.
  get fillColor() {
    if (this.relation === 'friendly') return 'rgba(0,255,204,0.15)';
    if (this.relation === 'enemy')    return 'rgba(255,68,68,0.15)';
    return 'rgba(255,170,0,0.15)';
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

    // Docking lights
    this._renderDockingLights(ctx, 0, 44, 15);

    this._renderNameLabel(ctx, camera, 50);

    ctx.restore();
  }

  // Blinking red/green docking lights — standard pattern for all stations.
  // Call inside a render() block after ctx.scale(z, z).
  // x, y = center of the docking area; spacing = distance from center to each light.
  // Lights blink alternately: red (port) and green (starboard).
  _renderDockingLights(ctx, x, y, spacing = 20) {
    const t = this._navPulse;
    const phase = ((t * 1.8) % 2);
    const redOn = phase < 1;
    const greenOn = !redOn;

    // Port (left) — red
    ctx.beginPath();
    ctx.arc(x - spacing, y, 3, 0, Math.PI * 2);
    ctx.fillStyle = RED;
    ctx.globalAlpha = redOn ? 0.85 : 0.1;
    ctx.fill();
    if (redOn) {
      ctx.beginPath();
      ctx.arc(x - spacing, y, 8, 0, Math.PI * 2);
      ctx.globalAlpha = 0.08;
      ctx.fill();
    }

    // Starboard (right) — green
    ctx.beginPath();
    ctx.arc(x + spacing, y, 3, 0, Math.PI * 2);
    ctx.fillStyle = GREEN;
    ctx.globalAlpha = greenOn ? 0.85 : 0.1;
    ctx.fill();
    if (greenOn) {
      ctx.beginPath();
      ctx.arc(x + spacing, y, 8, 0, Math.PI * 2);
      ctx.globalAlpha = 0.08;
      ctx.fill();
    }

    ctx.globalAlpha = 1;
  }

  // Draw station name below the icon. Call inside a render() block after ctx.scale(z, z).
  // Text is world-space — scales with zoom like all other map labels.
  _renderNameLabel(ctx, camera, yOffset = 50) {
    text(ctx, this.name.toUpperCase(), 0, yOffset, this.outlineColor, { style: SUBTITLE });
  }

  // Can the player dock from this world-space position?
  // Default: circular radius check. Override for custom zones.
  isInDockingZone(wx, wy) {
    const dx = wx - this.x;
    const dy = wy - this.y;
    return Math.sqrt(dx * dx + dy * dy) < this.dockingRadius;
  }

  getBounds() {
    return { x: this.x, y: this.y, radius: 28 };
  }
}

