import { GREEN, RED, RANGE_CIRCLE, AMBER, VERY_DIM, CYAN, WHITE, BLACK, STARFIELD_TINT_WHITE, BG_CLEAR, BEAM_GLOW_OUTER, BEAM_GLOW_MID, conditionColor } from './rendering/colors.js';
import { PROMPT } from './rendering/draw.js';
import { input } from './input.js';

// Starfield layer config: [count, parallaxFactor, starSize]
const STAR_LAYERS = [
  { count: 200, parallax: 0.05, size: 1 },
  { count: 100, parallax: 0.2, size: 1.5 },
  { count: 50, parallax: 0.5, size: 2 },
];

function generateStars(count, mapW, mapH) {
  const stars = [];
  for (let i = 0; i < count; i++) {
    stars.push({
      x: Math.random() * mapW,
      y: Math.random() * mapH,
      opacity: 0.4 + Math.random() * 0.6,
      tint: Math.random() < 0.3 ? CYAN : STARFIELD_TINT_WHITE,
    });
  }
  return stars;
}

export class Renderer {
  constructor(ctx, mapSize, background) {
    this.ctx = ctx;
    this.mapSize = mapSize;
    this._background = background || [];

    // Generate star layers
    this.starLayers = STAR_LAYERS.map((cfg) => ({
      stars: generateStars(cfg.count, mapSize.width, mapSize.height),
      parallax: cfg.parallax,
      size: cfg.size,
    }));

    // Offscreen caches (scanlines, vignette, starfield, edge warnings)
    this._scanlineCanvas = null;
    this._vignetteCanvas = null;
    this._starCanvases = [];
    this._flankGrads = null;
    this._hullGrads = null;
    this._cachedWidth = 0;
    this._cachedHeight = 0;
  }

  render(game) {
    const { ctx } = this;
    const { camera, entities } = game;

    // Rebuild offscreen caches on resize
    this._ensureCaches(camera.width, camera.height);

    // Clear
    ctx.clearRect(0, 0, camera.width, camera.height);
    ctx.fillStyle = BG_CLEAR;
    ctx.fillRect(0, 0, camera.width, camera.height);

    this._renderStarfield(camera);
    this._renderBackground(camera);
    this._renderEntities(entities, camera);
    this._renderTacticalUI(game, camera);
    this._renderWeaponRangeCircle(game, camera);
    this._renderBeams(game, camera);
    game.particlePool.render(ctx, camera);
    game.hud.render(ctx, game);

    // Combat mode border
    if (game.combatMode) this._renderCombatBorder(camera);

    // Flank speed warning — pulsing amber edge glow
    if (game.player && game.player.throttleLevel === 5) {
      this._renderFlankWarning(camera);
    }

    // Hull critical warning — pulsing red edge glow when player hull is red (≤25%)
    if (game.player && game.player.active) {
      const hr = game.player.hullCurrent / game.player.hullMax;
      if (hr <= 0.25) this._renderHullWarning(camera, hr);
    }

    // CRT post-processing
    ctx.drawImage(this._scanlineCanvas, 0, 0);
    ctx.drawImage(this._vignetteCanvas, 0, 0);

    // CRT phosphor flicker — subliminal brightness variation
    ctx.fillStyle = BLACK;
    ctx.globalAlpha = 0.03 * Math.random();
    ctx.fillRect(0, 0, camera.width, camera.height);
    ctx.globalAlpha = 1;

    // Crosshair cursor — always on top
    this._renderCrosshair(game, camera);
  }

  _renderTacticalUI(game, camera) {
    const { player, hostiles } = game;
    if (!player || !player.active) return;

    if (player.capabilities.health_pips) {
      this._renderHealthPips(hostiles, camera);
    }

    if (player.capabilities.lead_indicators) {
      this._renderLeadIndicators(game, camera);
    }

    const caps = player.capabilities;
    if (caps.enemy_telemetry || caps.module_inspection) {
      const target = this._findMouseTarget(hostiles, camera);
      if (target) {
        if (caps.enemy_telemetry)   this._renderEnemyTelemetry(target, camera);
        if (caps.module_inspection) this._renderModuleInspection(target, camera);
      }
    }
  }

  _renderHealthPips(hostiles, camera) {
    const { ctx } = this;
    ctx.save();
    for (const r of hostiles) {
      if (!r.active) continue;
      const bounds = r.getBounds();
      if (!camera.isVisible(bounds.x, bounds.y, bounds.radius)) continue;

      const screen = camera.worldToScreen(r.x, r.y);
      const totalIntegrity = r.armorMax + r.hullMax;
      const curIntegrity = r.armorCurrent + r.hullCurrent;
      const ratio = curIntegrity / totalIntegrity;

      const pipW = 10 * camera.zoom;
      const pipH = 3 * camera.zoom;
      const gap = 2 * camera.zoom;
      const xStart = screen.x - (pipW * 4 + gap * 3) / 2;
      const y = screen.y - bounds.radius * camera.zoom - 15 * camera.zoom;

      for (let i = 0; i < 4; i++) {
        const threshold = (i + 1) / 4;
        const filled = ratio >= threshold - 0.125; // slight tolerance
        ctx.fillStyle = filled ? (ratio > 0.5 ? GREEN : ratio > 0.25 ? AMBER : RED) : VERY_DIM;
        ctx.fillRect(xStart + i * (pipW + gap), y, pipW, pipH);
      }
    }
    ctx.restore();
  }

  _renderLeadIndicators(game, camera) {
    const { ctx } = this;
    const { player, hostiles } = game;
    const primaries = player._primaryWeapons;
    const weapon = primaries[player.primaryWeaponIdx];
    if (!weapon || !weapon.projectileSpeed) return;

    const showTrajectory = player.capabilities.trajectory_line;
    const playerScreen = showTrajectory ? camera.worldToScreen(player.x, player.y) : null;

    ctx.save();
    ctx.strokeStyle = AMBER;
    ctx.lineWidth = 1;
    ctx.setLineDash([2, 2]);

    for (const r of hostiles) {
      if (!r.active) continue;
      const dx = r.x - player.x;
      const dy = r.y - player.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > weapon.maxRange) continue;

      // Simple lead calculation
      const travelTime = dist / weapon.projectileSpeed;
      const tvx = Math.sin(r.rotation) * r.speed;
      const tvy = -Math.cos(r.rotation) * r.speed;
      const leadX = r.x + tvx * travelTime;
      const leadY = r.y + tvy * travelTime;

      const screen = camera.worldToScreen(leadX, leadY);

      // Trajectory line from player to lead point
      if (showTrajectory) {
        ctx.globalAlpha = 0.4;
        ctx.beginPath();
        ctx.moveTo(playerScreen.x, playerScreen.y);
        ctx.lineTo(screen.x, screen.y);
        ctx.stroke();
        ctx.globalAlpha = 1;
      }

      ctx.beginPath();
      ctx.arc(screen.x, screen.y, 4 * camera.zoom, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
  }

  _findMouseTarget(hostiles, camera) {
    let best = null;
    let bestDist = 200; // max pixel distance to consider
    const mx = input.mouseScreen.x;
    const my = input.mouseScreen.y;
    for (const r of hostiles) {
      if (!r.active) continue;
      const bounds = r.getBounds();
      if (!camera.isVisible(bounds.x, bounds.y, bounds.radius)) continue;
      const s = camera.worldToScreen(r.x, r.y);
      const dx = s.x - mx;
      const dy = s.y - my;
      const d = Math.sqrt(dx * dx + dy * dy);
      if (d < bestDist) { bestDist = d; best = r; }
    }
    return best;
  }

  _renderEnemyTelemetry(target, camera) {
    const { ctx } = this;
    const screen = camera.worldToScreen(target.x, target.y);
    const bounds = target.getBounds();
    const baseY = screen.y + bounds.radius * camera.zoom + 14 * camera.zoom;

    // Speed (units/s)
    const speed = Math.round(target.speed);
    // Heading (compass degrees — 0=N, 90=E, 180=S, 270=W)
    const headingRad = ((target.rotation % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
    const headingDeg = Math.round(headingRad * 180 / Math.PI);
    // Hull %
    const hullPct = Math.round((target.hullCurrent / target.hullMax) * 100);

    ctx.save();
    ctx.font = '11px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillStyle = CYAN;
    ctx.globalAlpha = 0.85;

    ctx.fillText(`SPD ${speed}  HDG ${headingDeg}\u00B0  HULL ${hullPct}%`, screen.x, baseY);
    ctx.restore();
  }

  _renderModuleInspection(target, camera) {
    if (!target.moduleSlots || target.moduleSlots.length === 0) return;
    const { ctx } = this;
    const screen = camera.worldToScreen(target.x, target.y);
    const bounds = target.getBounds();
    // Position below telemetry line (or below ship if no telemetry)
    const hasTelemAbove = target.speed !== undefined; // always true for ships
    const baseY = screen.y + bounds.radius * camera.zoom + (hasTelemAbove ? 28 : 14) * camera.zoom;

    ctx.save();
    ctx.font = '10px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.globalAlpha = 0.75;

    for (let i = 0; i < target.moduleSlots.length; i++) {
      const mod = target.moduleSlots[i];
      if (!mod) continue;
      ctx.fillStyle = conditionColor(mod.condition);
      ctx.fillText(mod.displayName, screen.x, baseY + i * 13);
    }
    ctx.restore();
  }

  _renderCrosshair(game, camera) {
    const { ctx } = this;
    const mx = input.mouseScreen.x;
    const my = input.mouseScreen.y;

    // Standard mode: simple hollow circle cursor
    if (!game.combatMode) {
      ctx.save();
      ctx.strokeStyle = CYAN;
      ctx.lineWidth = 1.5;
      ctx.globalAlpha = 0.75;
      ctx.beginPath();
      ctx.arc(mx, my, 6, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
      return;
    }

    // Combat mode: full crosshair with range check
    let inRange = true;
    const player = game.player;
    if (player && player.active) {
      const primaries = player._primaryWeapons;
      const weapon = primaries.length > 0 ? primaries[player.primaryWeaponIdx] : null;
      if (weapon) {
        const world = camera.screenToWorld(mx, my);
        const dx = world.x - player.x;
        const dy = world.y - player.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        inRange = dist <= weapon.maxRange;
      }
    }

    const color = inRange ? GREEN : RED;
    const arm = 8;
    const gap = 4;

    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5;
    ctx.globalAlpha = 0.9;

    // Four arms
    ctx.beginPath();
    ctx.moveTo(mx - gap, my); ctx.lineTo(mx - gap - arm, my);
    ctx.moveTo(mx + gap, my); ctx.lineTo(mx + gap + arm, my);
    ctx.moveTo(mx, my - gap); ctx.lineTo(mx, my - gap - arm);
    ctx.moveTo(mx, my + gap); ctx.lineTo(mx, my + gap + arm);
    ctx.stroke();

    // Center dot
    ctx.beginPath();
    ctx.arc(mx, my, 1.5, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();

    if (!inRange) {
      ctx.font = PROMPT.font;
      ctx.fillStyle = RED;
      ctx.textAlign = 'center';
      ctx.fillText('OUT OF RANGE', mx, my + gap + arm + 14);
    }

    ctx.restore();
  }

  _renderBackground(camera) {
    for (const el of this._background) {
      if (el.render) el.render(this.ctx, camera);
    }
  }

  _ensureCaches(w, h) {
    if (w === this._cachedWidth && h === this._cachedHeight) return;
    this._cachedWidth = w;
    this._cachedHeight = h;

    // Scanline cache
    this._scanlineCanvas = document.createElement('canvas');
    this._scanlineCanvas.width = w;
    this._scanlineCanvas.height = h;
    const slCtx = this._scanlineCanvas.getContext('2d');
    slCtx.fillStyle = 'rgba(0,0,0,0.07)';
    for (let y = 0; y < h; y += 3) {
      slCtx.fillRect(0, y, w, 1);
    }

    // Vignette cache
    this._vignetteCanvas = document.createElement('canvas');
    this._vignetteCanvas.width = w;
    this._vignetteCanvas.height = h;
    const vgCtx = this._vignetteCanvas.getContext('2d');
    const cx = w / 2;
    const cy = h / 2;
    const r = Math.max(cx, cy) * 1.2;
    const grad = vgCtx.createRadialGradient(cx, cy, r * 0.4, cx, cy, r);
    grad.addColorStop(0, 'rgba(0,0,0,0)');
    grad.addColorStop(1, 'rgba(0,0,0,0.4)');
    vgCtx.fillStyle = grad;
    vgCtx.fillRect(0, 0, w, h);

    // Edge warning gradient caches
    const flankEdgeW = 90;
    const hullEdgeW = 120;
    const flankColor = 'rgb(255,170,0)';
    const hullColor = 'rgb(255,0,0)';

    const makeGrad = (ctx, x0, y0, x1, y1, color, inward) => {
      const g = ctx.createLinearGradient(x0, y0, x1, y1);
      g.addColorStop(inward ? 0 : 1, color);
      g.addColorStop(inward ? 1 : 0, 'rgba(0,0,0,0)');
      return g;
    };

    this._flankGrads = {
      left:   makeGrad(vgCtx, 0, 0, flankEdgeW, 0, flankColor, true),
      right:  makeGrad(vgCtx, w - flankEdgeW, 0, w, 0, flankColor, false),
      top:    makeGrad(vgCtx, 0, 0, 0, flankEdgeW, flankColor, true),
      bottom: makeGrad(vgCtx, 0, h - flankEdgeW, 0, h, flankColor, false),
      edgeW:  flankEdgeW,
    };
    this._hullGrads = {
      left:   makeGrad(vgCtx, 0, 0, hullEdgeW, 0, hullColor, true),
      right:  makeGrad(vgCtx, w - hullEdgeW, 0, w, 0, hullColor, false),
      top:    makeGrad(vgCtx, 0, 0, 0, hullEdgeW, hullColor, true),
      bottom: makeGrad(vgCtx, 0, h - hullEdgeW, 0, h, hullColor, false),
      edgeW:  hullEdgeW,
    };

    // Starfield caches — one offscreen canvas per layer
    this._starCanvases = this.starLayers.map((layer) => {
      const c = document.createElement('canvas');
      c.width = w;
      c.height = h;
      const sCtx = c.getContext('2d');
      for (const star of layer.stars) {
        sCtx.globalAlpha = star.opacity;
        sCtx.fillStyle = star.tint;
        sCtx.fillRect(
          ((star.x % w) + w) % w,
          ((star.y % h) + h) % h,
          layer.size, layer.size
        );
      }
      sCtx.globalAlpha = 1;
      return c;
    });
  }

  _renderStarfield(camera) {
    const { ctx } = this;
    const w = camera.width;
    const h = camera.height;

    for (let li = 0; li < this.starLayers.length; li++) {
      const layer = this.starLayers[li];
      const canvas = this._starCanvases[li];
      if (!canvas) continue;

      const dx = ((-camera.x * layer.parallax) % w + w) % w;
      const dy = ((-camera.y * layer.parallax) % h + h) % h;

      // Tile up to 4 draws to cover wrapping
      ctx.drawImage(canvas, dx, dy);
      if (dx > 0) ctx.drawImage(canvas, dx - w, dy);
      if (dy > 0) ctx.drawImage(canvas, dx, dy - h);
      if (dx > 0 && dy > 0) ctx.drawImage(canvas, dx - w, dy - h);
    }
  }

  _renderFlankWarning(camera) {
    const { ctx } = this;
    const w = camera.width;
    const h = camera.height;
    const pulse = 0.08 + Math.sin(Date.now() * 0.006) * 0.06;
    const g = this._flankGrads;
    const edgeW = g.edgeW;

    ctx.save();
    ctx.globalAlpha = pulse;

    ctx.fillStyle = g.left;
    ctx.fillRect(0, 0, edgeW, h);
    ctx.fillStyle = g.right;
    ctx.fillRect(w - edgeW, 0, edgeW, h);
    ctx.fillStyle = g.top;
    ctx.fillRect(0, 0, w, edgeW);
    ctx.fillStyle = g.bottom;
    ctx.fillRect(0, h - edgeW, w, edgeW);

    ctx.restore();
  }

  _renderHullWarning(camera, hullRatio) {
    const { ctx } = this;
    const w = camera.width;
    const h = camera.height;
    // Pulse faster as hull drops toward 0 — urgent at very low hull
    const urgency = 1 - hullRatio / 0.25;
    const pulseSpeed = 0.004 + urgency * 0.010;
    const basePulse = 0.07 + Math.sin(Date.now() * pulseSpeed) * 0.07;
    const alpha = basePulse * (0.5 + urgency * 0.7);
    const g = this._hullGrads;
    const edgeW = g.edgeW;

    ctx.save();
    ctx.globalAlpha = alpha;

    ctx.fillStyle = g.left;
    ctx.fillRect(0, 0, edgeW, h);
    ctx.fillStyle = g.right;
    ctx.fillRect(w - edgeW, 0, edgeW, h);
    ctx.fillStyle = g.top;
    ctx.fillRect(0, 0, w, edgeW);
    ctx.fillStyle = g.bottom;
    ctx.fillRect(0, h - edgeW, w, edgeW);

    ctx.restore();
  }

  _renderWeaponRangeCircle(game, camera) {
    const { ctx } = this;
    const player = game.player;
    if (!player || !player.active) return;

    const primaries = player._primaryWeapons;
    const weapon = primaries.length > 0 ? primaries[player.primaryWeaponIdx] : null;
    if (!weapon || !weapon.maxRange) return;

    const center = camera.worldToScreen(player.x, player.y);
    const screenRadius = weapon.maxRange * camera.zoom;

    ctx.save();
    ctx.strokeStyle = RANGE_CIRCLE;
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 8]);
    ctx.beginPath();
    ctx.arc(center.x, center.y, screenRadius, 0, Math.PI * 2);
    ctx.stroke();

    // Flak: also draw blast-AoE ring at cursor position
    if (weapon.detonatesOnExpiry && weapon.blastRadius > 0) {
      const blastScreenRadius = weapon.blastRadius * camera.zoom;
      const mx = input.mouseScreen.x;
      const my = input.mouseScreen.y;
      ctx.beginPath();
      ctx.arc(mx, my, blastScreenRadius, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.setLineDash([]);
    ctx.restore();
  }

  _renderBeams(game, camera) {
    const { ctx } = this;
    for (const entity of game.entities) {
      if (!entity.isShip) continue;
      for (const w of entity.weapons || []) {
        if (!w.isBeam || w._rampUp <= 0) continue;
        const t = Math.min(w._rampUp / w.rampTime, 1);
        const s = camera.worldToScreen(w._beamOriginX, w._beamOriginY);
        const e = camera.worldToScreen(w._beamEndX, w._beamEndY);
        ctx.save();
        ctx.lineCap = 'round';
        // Outer glow
        ctx.strokeStyle = BEAM_GLOW_OUTER;
        ctx.lineWidth = (3 + t * 6) * camera.zoom;
        ctx.globalAlpha = 0.12 * t;
        ctx.beginPath();
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(e.x, e.y);
        ctx.stroke();
        // Mid glow
        ctx.strokeStyle = BEAM_GLOW_MID;
        ctx.lineWidth = (1 + t * 2.5) * camera.zoom;
        ctx.globalAlpha = 0.5 + t * 0.3;
        ctx.beginPath();
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(e.x, e.y);
        ctx.stroke();
        // Bright core
        ctx.strokeStyle = WHITE;
        ctx.lineWidth = Math.max(0.5, t) * camera.zoom;
        ctx.globalAlpha = t;
        ctx.beginPath();
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(e.x, e.y);
        ctx.stroke();
        ctx.globalAlpha = 1;
        ctx.restore();
      }
    }
  }

  _renderCombatBorder(camera) {
    const { ctx } = this;
    const w = camera.width;
    const h = camera.height;
    const inset = 8;
    const armLen = 40;

    ctx.save();
    ctx.strokeStyle = RED;
    ctx.globalAlpha = 0.85;

    // Solid inset frame
    ctx.lineWidth = 2;
    ctx.strokeRect(inset, inset, w - inset * 2, h - inset * 2);

    // L-shaped corner brackets (drawn over the frame, thicker)
    ctx.lineWidth = 3;
    const corners = [
      [inset, inset, 1, 1],
      [w - inset, inset, -1, 1],
      [inset, h - inset, 1, -1],
      [w - inset, h - inset, -1, -1],
    ];
    for (const [cx, cy, dx, dy] of corners) {
      ctx.beginPath();
      ctx.moveTo(cx + dx * armLen, cy);
      ctx.lineTo(cx, cy);
      ctx.lineTo(cx, cy + dy * armLen);
      ctx.stroke();
    }

    // [COMBAT MODE] text top-center
    ctx.font = PROMPT.font;
    ctx.fillStyle = RED;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText('[COMBAT MODE]', w / 2, inset + 8);

    ctx.restore();
  }

  _renderEntities(entities, camera) {
    // Two-pass: scenery first, ships always on top
    for (const entity of entities) {
      if (!entity.active || entity.isShip) continue;
      const bounds = entity.getBounds();
      if (!camera.isVisible(bounds.x, bounds.y, bounds.radius + 64)) continue;
      entity.render(this.ctx, camera);
      if (entity.renderZoneLabels) entity.renderZoneLabels(this.ctx, camera);
    }
    for (const entity of entities) {
      if (!entity.active || !entity.isShip) continue;
      const bounds = entity.getBounds();
      if (!camera.isVisible(bounds.x, bounds.y, bounds.radius + 64)) continue;
      entity.render(this.ctx, camera);
    }
  }
}
