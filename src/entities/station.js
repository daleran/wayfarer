import { Entity } from '@/entities/entity.js';
import { CYAN, AMBER, RED, GREEN, WHITE, DIM_TEXT } from '@/rendering/colors.js';
import { text, SUBTITLE, FLAVOR } from '@/rendering/draw.js';
import { FACTION_MAP } from '@data/index.js';

export class Station extends Entity {
  constructor(x, y, data) {
    super(x, y);
    this.id = data.id ?? null;
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
    this.conversations = data.conversations ?? null;
    this.flavorText = data.flavorText ?? null;
    this.dockingRadius = 150;
    this._navPulse = 0;
    this._zoneFadeAlphas = {};  // zone.id → alpha (0–1) for flavor text proximity fade
  }

  // Accent color for nav lights, docking arms, labels.
  // Friendly → CYAN. Enemy → RED. Neutral (all factions initially) → AMBER.
  get accentColor() {
    if (this.relation === 'friendly') return CYAN;
    if (this.relation === 'enemy') return RED;
    return AMBER;
  }

  // Outline color — bright accent, used for canvas labels and UI borders.
  get outlineColor() { return this.accentColor; }

  // Fill color — dimmed version of accent, used for UI panel backgrounds.
  get fillColor() {
    if (this.relation === 'friendly') return 'rgba(0,255,204,0.15)';
    if (this.relation === 'enemy') return 'rgba(255,68,68,0.15)';
    return 'rgba(255,170,0,0.15)';
  }

  update(dt) {
    this._navPulse += dt;
  }

  /** Update per-zone flavor text fade based on player proximity. */
  updateZoneFade(dt, playerX, playerY) {
    const zones = this.layout?.zones;
    if (!zones) return;
    const FADE_RADIUS = 400;
    const FADE_SPEED = 1.2;
    for (const zone of zones) {
      if (!zone.flavor?.length || !zone.labelOffset) continue;
      const wx = this.x + (zone.worldOffset?.x ?? 0) + zone.labelOffset.x;
      const wy = this.y + (zone.worldOffset?.y ?? 0) + zone.labelOffset.y;
      const dx = wx - playerX;
      const dy = wy - playerY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const target = dist < FADE_RADIUS ? 1 : 0;
      const cur = this._zoneFadeAlphas[zone.id] ?? 0;
      this._zoneFadeAlphas[zone.id] = cur + (target - cur) * Math.min(1, FADE_SPEED * dt);
    }
  }

  /** Render zone subtitle labels (always) and flavor text (proximity fade).
   *  Drawn in world space so text scales with zoom like all other map labels. */
  renderZoneLabels(ctx, camera) {
    const zones = this.layout?.zones;
    if (!zones) return;
    const accent = this.accentColor;
    const z = camera.zoom;
    const screen = camera.worldToScreen(this.x, this.y);

    ctx.save();
    ctx.translate(screen.x, screen.y);
    ctx.scale(z, z);

    for (const zone of zones) {
      if (!zone.labelOffset) continue;
      const lx = (zone.worldOffset?.x ?? 0) + zone.labelOffset.x;
      const ly = (zone.worldOffset?.y ?? 0) + zone.labelOffset.y;

      // Zone subtitle — always visible, left-aligned
      text(ctx, zone.label.toUpperCase(), lx, ly, accent, {
        style: SUBTITLE, align: 'left',
      });

      // Flavor text — fades in on proximity, word-wrapped, left-aligned below subtitle
      const fadeAlpha = this._zoneFadeAlphas[zone.id] ?? 0;
      if (fadeAlpha > 0.01 && zone.flavor?.length) {
        const firstLine = zone.flavor.find(l => l !== '');
        if (firstLine) {
          ctx.save();
          ctx.font = `${FLAVOR.weight} ${FLAVOR.size}px monospace`;
          ctx.fillStyle = DIM_TEXT;
          ctx.globalAlpha = fadeAlpha * FLAVOR.alpha;
          ctx.textAlign = 'left';
          ctx.textBaseline = 'top';
          const words = firstLine.split(' ');
          let line = '';
          let y = ly + 22;
          for (const word of words) {
            const test = line ? `${line} ${word}` : word;
            if (ctx.measureText(test).width > 300 && line) {
              ctx.fillText(line, lx, y);
              line = word;
              y += 16;
            } else {
              line = test;
            }
          }
          if (line) ctx.fillText(line, lx, y);
          ctx.restore();
        }
      }
    }

    ctx.restore();
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

