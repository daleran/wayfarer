import { Station } from './world/station.js';
import { Planet } from './world/planet.js';
import { LootDrop } from './entities/lootDrop.js';
import { Derelict } from './world/derelict.js';
import { HULL_POINTS } from './ships/player/flagship.js';
import {
  CYAN, AMBER, GREEN, RED, BLUE, MAGENTA, WHITE,
  BAR_TRACK, DIM_OUTLINE, VERY_DIM, DIM_TEXT,
  FACTION,
  MINIMAP_BG, MINIMAP_BORDER, MINIMAP_PLANET, MINIMAP_STATION,
  MINIMAP_ENEMY, MINIMAP_PLAYER,
  MINIMAP_LOOT, MINIMAP_DERELICT,
} from './ui/colors.js';

const THROTTLE_LABELS = ['Stop', '1/4', '1/2', '3/4', 'Full', 'Flank'];

const PIP_W = 32;
const PIP_H = 14;
const PIP_GAP = 6;
const PIP_BOTTOM_MARGIN = 20;
const PIP_LABEL_OFFSET = 18;

const PICKUP_DURATION = 1.5;
const PICKUP_DRIFT = 40;

// Left-side HUD layout
const MARGIN  = 20;
const BAR_W   = 160;
const BAR_H   = 12;
const LABEL_W = 56;
const ROW_GAP = 10;
const SEG_COUNT = 10;

// Circular armor ring constants
const RING_R  = 48;
const RING_TH = 10;

export class HUD {
  constructor() {
    this._pickupTexts = [];
  }

  addPickupText(text, worldX, worldY) {
    this._pickupTexts.push({ text, worldX, worldY, createdAt: Date.now() });
  }

  render(ctx, game) {
    const { player, camera } = game;
    if (!player) return;
    this._renderLeftPanel(ctx, game);
    this._renderThrottle(ctx, player, camera);
    this._renderDockPrompt(ctx, game);
    this._renderDerelictPrompt(ctx, game);
    this._renderRepairPrompt(ctx, game);
    this._renderSalvageBar(ctx, game);
    this._renderRepairBar(ctx, game);
    this._renderPickupTexts(ctx, game);
    this._renderMinimap(ctx, game);
    if (game.isTestMode) {
      this._renderTestOverlay(ctx, game);
      this._renderDevControls(ctx, game);
    }
    if (game.stationScreen) game.stationScreen.render(ctx, game);
  }

  _arcColor(ratio) {
    if (ratio > 0.6) return GREEN;
    if (ratio > 0.3) return AMBER;
    if (ratio > 0)   return RED;
    return VERY_DIM;
  }

  _renderLeftPanel(ctx, game) {
    const { player } = game;
    const segW = BAR_W / SEG_COUNT;
    const segGap = 1;
    const now = Date.now();

    ctx.save();
    ctx.font = '13px monospace';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';

    // ── Circular Armor Ring ────────────────────────────────────────────
    const ARC_R   = RING_R - RING_TH / 2;
    const GAP_RAD = 0.10;
    const cx = MARGIN + RING_R + 2;
    const cy = MARGIN + RING_R + 2;

    const arcDefs = [
      { key: 'front',     a0: -Math.PI * 3 / 4 + GAP_RAD, a1: -Math.PI / 4 - GAP_RAD },
      { key: 'starboard', a0: -Math.PI / 4 + GAP_RAD,      a1:  Math.PI / 4 - GAP_RAD },
      { key: 'aft',       a0:  Math.PI / 4 + GAP_RAD,      a1:  Math.PI * 3 / 4 - GAP_RAD },
      { key: 'port',      a0:  Math.PI * 3 / 4 + GAP_RAD,  a1:  Math.PI * 5 / 4 - GAP_RAD },
    ];

    ctx.lineWidth = RING_TH;
    ctx.lineCap   = 'butt';
    for (const { key, a0, a1 } of arcDefs) {
      const maxVal = player.armorArcsMax[key];
      const curVal = player.armorArcs[key];
      const ratio  = maxVal > 0 ? curVal / maxVal : 0;
      const hitAge = now - (player._arcHitTimestamps[key] || 0);
      const flash  = hitAge < 150;
      const color  = flash ? WHITE : this._arcColor(ratio);

      // Dim track
      ctx.strokeStyle = VERY_DIM;
      ctx.beginPath();
      ctx.arc(cx, cy, ARC_R, a0, a1);
      ctx.stroke();

      // Health fill
      if (ratio > 0) {
        const fillEnd = a0 + (a1 - a0) * ratio;
        ctx.strokeStyle = color;
        ctx.globalAlpha = flash ? 0.3 + (1 - hitAge / 150) * 0.7 : 1;
        ctx.beginPath();
        ctx.arc(cx, cy, ARC_R, a0, fillEnd);
        ctx.stroke();
        ctx.globalAlpha = 1;
      }
    }

    // Directional labels just outside the ring
    const LABEL_OUT_R = RING_R + 9;
    const arcMids = [
      { key: 'front',     angle: -Math.PI / 2, label: 'F' },
      { key: 'starboard', angle:  0,            label: 'S' },
      { key: 'aft',       angle:  Math.PI / 2,  label: 'A' },
      { key: 'port',      angle:  Math.PI,       label: 'P' },
    ];
    ctx.font = '8px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    for (const { key, angle, label } of arcMids) {
      const ratio = player.armorArcsMax[key] > 0 ? player.armorArcs[key] / player.armorArcsMax[key] : 0;
      ctx.fillStyle = ratio > 0 ? this._arcColor(ratio) : VERY_DIM;
      ctx.globalAlpha = 0.65;
      ctx.fillText(label, cx + Math.cos(angle) * LABEL_OUT_R, cy + Math.sin(angle) * LABEL_OUT_R);
      ctx.globalAlpha = 1;
    }

    // Ship silhouette in center, colored by hull health
    const hullRatio = Math.max(0, player.hullCurrent / player.hullMax);
    const hullColor = hullRatio > 0.5 ? GREEN : hullRatio > 0.25 ? AMBER : RED;
    const hullFlash = hullRatio < 0.25 && Math.floor(now / 300) % 2 === 0;
    const silColor  = hullFlash ? RED : hullColor;
    const SHIP_SCALE = 1.1;

    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(SHIP_SCALE, SHIP_SCALE);
    ctx.beginPath();
    ctx.moveTo(HULL_POINTS[0].x, HULL_POINTS[0].y);
    for (let i = 1; i < HULL_POINTS.length; i++) {
      ctx.lineTo(HULL_POINTS[i].x, HULL_POINTS[i].y);
    }
    ctx.closePath();
    ctx.fillStyle = silColor;
    ctx.globalAlpha = 0.15;
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.strokeStyle = silColor;
    ctx.lineWidth = 1.2 / SHIP_SCALE;
    ctx.stroke();
    ctx.restore();

    // ── Integrity symbols [R] [E] [S] ────────────────────────────────
    const intY = cy + RING_R + 5;
    const systems = [
      { label: 'R', val: player.reactorIntegrity },
      { label: 'E', val: player.engineIntegrity  },
      { label: 'S', val: player.sensorIntegrity  },
    ];
    ctx.font = '10px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    let ix = MARGIN + 10;
    for (const sys of systems) {
      const ratio = sys.val / 100;
      const low   = ratio < 0.25;
      const warn  = ratio < 0.5;
      const flicker = low && Math.floor(now / 300) % 2 === 0;
      ctx.fillStyle = flicker ? VERY_DIM : warn ? RED : DIM_TEXT;
      ctx.fillText(`[${sys.label}]`, ix, intY + 6);
      ix += 26;
    }

    // ── Secondary weapon ammo (rockets) ──────────────────────────────
    let y = intY + 18;
    const rocket = player.weapons.find(w => w.isSecondary);
    if (rocket) {
      const rktPipW = 10;
      const rktPipH = 10;
      const rktPipGap = 3;

      ctx.font = '10px monospace';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = MAGENTA;
      ctx.fillText('RKT', MARGIN, y + rktPipH / 2);

      const pipStartX = MARGIN + 32;
      for (let i = 0; i < rocket.ammoMax; i++) {
        const px = pipStartX + i * (rktPipW + rktPipGap);
        ctx.fillStyle = i < rocket.ammo ? MAGENTA : VERY_DIM;
        ctx.fillRect(px, y, rktPipW, rktPipH);
      }

      if (rocket._cooldown > 0) {
        const cooldownX = pipStartX + rocket.ammoMax * (rktPipW + rktPipGap) + 4;
        ctx.fillStyle = DIM_TEXT;
        ctx.textAlign = 'left';
        ctx.fillText('...', cooldownX, y + rktPipH / 2);
      }

      y += rktPipH + ROW_GAP;
    }

    // ── FUEL bar ─────────────────────────────────────────────────────
    y += ROW_GAP;
    const fuelRatio  = game.fuel / game.fuelMax;
    const fuelLow    = fuelRatio < 0.25;
    const fuelColor  = fuelLow ? RED : AMBER;
    const fuelFilled = Math.ceil(fuelRatio * SEG_COUNT);
    const barX = MARGIN + LABEL_W;

    ctx.font = '13px monospace';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = fuelColor;
    ctx.fillText('FUEL', MARGIN, y + BAR_H / 2);
    ctx.strokeStyle = fuelColor;
    ctx.lineWidth = 1;
    ctx.strokeRect(barX - 1, y - 1, BAR_W + 2, BAR_H + 2);
    ctx.fillStyle = BAR_TRACK;
    ctx.fillRect(barX, y, BAR_W, BAR_H);
    for (let i = 0; i < SEG_COUNT; i++) {
      if (i < fuelFilled) {
        ctx.fillStyle = fuelColor;
        ctx.fillRect(barX + i * segW + segGap, y + 1, segW - segGap * 2, BAR_H - 2);
      }
    }
    ctx.fillStyle = fuelColor;
    ctx.font = '11px monospace';
    ctx.fillText(`${Math.floor(game.fuel)}/${game.fuelMax}`, barX + BAR_W + 6, y + BAR_H / 2);
    ctx.font = '13px monospace';
    y += BAR_H + ROW_GAP;

    // ── CARGO bar ────────────────────────────────────────────────────
    const cargoUsed  = game.totalCargoUsed;
    const cargoCap   = game.totalCargoCapacity;
    const cargoRatio = cargoCap > 0 ? cargoUsed / cargoCap : 0;
    const cargoFull  = cargoUsed >= cargoCap;
    const cargoColor = cargoFull ? RED : BLUE;
    const cargoFilled = Math.ceil(cargoRatio * SEG_COUNT);

    ctx.fillStyle = cargoColor;
    ctx.fillText('CARGO', MARGIN, y + BAR_H / 2);
    ctx.strokeStyle = cargoColor;
    ctx.lineWidth = 1;
    ctx.strokeRect(barX - 1, y - 1, BAR_W + 2, BAR_H + 2);
    ctx.fillStyle = BAR_TRACK;
    ctx.fillRect(barX, y, BAR_W, BAR_H);
    for (let i = 0; i < SEG_COUNT; i++) {
      if (i < cargoFilled) {
        ctx.fillStyle = cargoColor;
        ctx.fillRect(barX + i * segW + segGap, y + 1, segW - segGap * 2, BAR_H - 2);
      }
    }
    ctx.fillStyle = cargoColor;
    ctx.font = '11px monospace';
    ctx.fillText(`${cargoUsed}/${cargoCap}`, barX + BAR_W + 6, y + BAR_H / 2);
    y += BAR_H + ROW_GAP * 2;

    // ── SCRAP readout ─────────────────────────────────────────────────
    ctx.font = 'bold 26px monospace';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = AMBER;
    ctx.fillText(`\u2699 ${game.scrap}`, MARGIN, y + 13);

    ctx.restore();
  }

  _renderDockPrompt(ctx, game) {
    if (!game.nearbyStation || game.isSalvaging) return;
    const { camera } = game;
    const alpha = 0.6 + Math.sin(Date.now() * 0.004) * 0.4;
    ctx.save();
    ctx.font = '14px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.globalAlpha = alpha;
    ctx.fillStyle = GREEN;
    ctx.fillText(
      `Press E to dock at ${game.nearbyStation.name}`,
      camera.width / 2,
      camera.height - PIP_BOTTOM_MARGIN - PIP_H - PIP_LABEL_OFFSET - 24
    );
    ctx.globalAlpha = 1;
    ctx.restore();
  }

  _renderDerelictPrompt(ctx, game) {
    if (!game.nearbyDerelict || game.isSalvaging) return;
    const { camera } = game;
    const alpha = 0.6 + Math.sin(Date.now() * 0.004) * 0.4;
    ctx.save();
    ctx.font = '14px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.globalAlpha = alpha;
    ctx.fillStyle = AMBER;
    ctx.fillText(
      `Press E to salvage ${game.nearbyDerelict.name}`,
      camera.width / 2,
      camera.height - PIP_BOTTOM_MARGIN - PIP_H - PIP_LABEL_OFFSET - 24
    );
    ctx.globalAlpha = 1;
    ctx.restore();
  }

  _renderSalvageBar(ctx, game) {
    if (!game.isSalvaging) return;
    const { camera } = game;
    const ratio = game.salvageProgress / game.salvageTotal;

    const barW = 220;
    const barH = 16;
    const segCount = 10;
    const segW = barW / segCount;
    const segGap = 1;
    const x = (camera.width - barW) / 2;
    const y = camera.height - PIP_BOTTOM_MARGIN - PIP_H - PIP_LABEL_OFFSET - 56;

    ctx.save();

    ctx.font = 'bold 13px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.fillStyle = AMBER;
    ctx.fillText('SALVAGING...', camera.width / 2, y - 4);

    ctx.strokeStyle = AMBER;
    ctx.lineWidth = 1;
    ctx.strokeRect(x - 1, y - 1, barW + 2, barH + 2);
    ctx.fillStyle = BAR_TRACK;
    ctx.fillRect(x, y, barW, barH);

    const filled = Math.ceil(ratio * segCount);
    for (let i = 0; i < segCount; i++) {
      if (i < filled) {
        ctx.fillStyle = AMBER;
        ctx.fillRect(x + i * segW + segGap, y + 1, segW - segGap * 2, barH - 2);
      }
    }

    ctx.restore();
  }

  _renderRepairPrompt(ctx, game) {
    const { player, camera } = game;
    if (game.isSalvaging || game.isRepairing || game.isDocked) return;
    if (!player || player.throttleLevel !== 0) return;
    if (player.armorCurrent >= player.armorMax || game.scrap <= 0) return;

    const alpha = 0.6 + Math.sin(Date.now() * 0.005) * 0.4;
    ctx.save();
    ctx.font = '14px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.globalAlpha = alpha;
    ctx.fillStyle = GREEN;
    ctx.fillText(
      'Press R to Repair  [1 scrap/pt]',
      camera.width / 2,
      camera.height - PIP_BOTTOM_MARGIN - PIP_H - PIP_LABEL_OFFSET - 44
    );
    ctx.globalAlpha = 1;
    ctx.restore();
  }

  _renderRepairBar(ctx, game) {
    if (!game.isRepairing) return;
    const { player, camera } = game;

    const barW = 220;
    const barH = 16;
    const segCount = 10;
    const segW = barW / segCount;
    const segGap = 1;
    const x = (camera.width - barW) / 2;
    const y = camera.height - PIP_BOTTOM_MARGIN - PIP_H - PIP_LABEL_OFFSET - 56;

    const ratio = player.armorCurrent / player.armorMax;

    ctx.save();

    ctx.font = 'bold 13px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.fillStyle = GREEN;
    ctx.fillText('REPAIRING...', camera.width / 2, y - 4);

    ctx.strokeStyle = GREEN;
    ctx.lineWidth = 1;
    ctx.strokeRect(x - 1, y - 1, barW + 2, barH + 2);
    ctx.fillStyle = BAR_TRACK;
    ctx.fillRect(x, y, barW, barH);

    const filled = Math.ceil(ratio * segCount);
    for (let i = 0; i < segCount; i++) {
      if (i < filled) {
        ctx.fillStyle = GREEN;
        ctx.fillRect(x + i * segW + segGap, y + 1, segW - segGap * 2, barH - 2);
      }
    }

    ctx.restore();
  }

  _renderPickupTexts(ctx, game) {
    const { camera } = game;
    const now = Date.now();
    ctx.save();
    ctx.font = 'bold 13px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    for (let i = this._pickupTexts.length - 1; i >= 0; i--) {
      const pt = this._pickupTexts[i];
      const elapsed = (now - pt.createdAt) / 1000;
      if (elapsed > PICKUP_DURATION) {
        this._pickupTexts.splice(i, 1);
        continue;
      }
      const t = elapsed / PICKUP_DURATION;
      const screen = camera.worldToScreen(pt.worldX, pt.worldY - PICKUP_DRIFT * t);
      ctx.globalAlpha = 1 - t;
      ctx.fillStyle = AMBER;
      ctx.fillText(pt.text, screen.x, screen.y);
    }

    ctx.globalAlpha = 1;
    ctx.restore();
  }

  _renderMinimap(ctx, game) {
    const { camera, player, entities, raiders } = game;
    const mapW = game.map.mapSize.width;
    const mapH = game.map.mapSize.height;
    const PANEL = 225;
    const SCALE = PANEL / Math.max(mapW, mapH);
    const MM_MARGIN = 20;
    const ox = MM_MARGIN;
    const oy = camera.height - MM_MARGIN - PANEL;
    const BRACKET = 8;

    ctx.save();

    ctx.fillStyle = MINIMAP_BG;
    ctx.fillRect(ox, oy, PANEL, PANEL);

    ctx.strokeStyle = MINIMAP_BORDER;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(ox, oy + BRACKET); ctx.lineTo(ox, oy); ctx.lineTo(ox + BRACKET, oy);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(ox + PANEL - BRACKET, oy); ctx.lineTo(ox + PANEL, oy); ctx.lineTo(ox + PANEL, oy + BRACKET);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(ox, oy + PANEL - BRACKET); ctx.lineTo(ox, oy + PANEL); ctx.lineTo(ox + BRACKET, oy + PANEL);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(ox + PANEL - BRACKET, oy + PANEL); ctx.lineTo(ox + PANEL, oy + PANEL); ctx.lineTo(ox + PANEL, oy + PANEL - BRACKET);
    ctx.stroke();

    ctx.beginPath();
    ctx.rect(ox, oy, PANEL, PANEL);
    ctx.clip();

    for (const e of entities) {
      if (!(e instanceof Planet) || !e.active) continue;
      const mx = ox + e.x * SCALE;
      const my = oy + e.y * SCALE;
      const mr = Math.max(2, e.radius * SCALE);
      ctx.beginPath();
      ctx.arc(mx, my, mr, 0, Math.PI * 2);
      ctx.fillStyle = MINIMAP_PLANET;
      ctx.fill();
    }

    for (const e of entities) {
      if (!(e instanceof Station) || !e.active) continue;
      const mx = ox + e.x * SCALE;
      const my = oy + e.y * SCALE;
      const color = FACTION[e.faction] ?? MINIMAP_STATION;
      // Filled square with contrasting outline
      ctx.fillStyle = color;
      ctx.globalAlpha = 0.9;
      ctx.fillRect(mx - 4, my - 4, 8, 8);
      ctx.strokeStyle = MINIMAP_STATION;
      ctx.lineWidth = 1;
      ctx.strokeRect(mx - 4, my - 4, 8, 8);
      ctx.globalAlpha = 1;
      // Station name label
      ctx.font = '8px monospace';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = color;
      ctx.fillText(e.name, mx + 6, my);
    }

    for (const e of entities) {
      if (!(e instanceof Derelict) || !e.active || e.salvaged) continue;
      const mx = ox + e.x * SCALE;
      const my = oy + e.y * SCALE;
      ctx.strokeStyle = MINIMAP_DERELICT;
      ctx.lineWidth = 1;
      ctx.strokeRect(mx - 1.5, my - 1.5, 3, 3);
    }

    for (const e of entities) {
      if (!(e instanceof LootDrop) || !e.active) continue;
      const mx = ox + e.x * SCALE;
      const my = oy + e.y * SCALE;
      ctx.fillStyle = MINIMAP_LOOT;
      ctx.fillRect(mx - 0.75, my - 0.75, 1.5, 1.5);
    }

    for (const r of raiders) {
      if (!r.active) continue;
      const mx = ox + r.x * SCALE;
      const my = oy + r.y * SCALE;
      ctx.fillStyle = MINIMAP_ENEMY;
      ctx.fillRect(mx - 1.5, my - 1.5, 3, 3);
    }

    const px = ox + player.x * SCALE;
    const py = oy + player.y * SCALE;
    ctx.strokeStyle = MINIMAP_PLAYER;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(px - 4, py);
    ctx.lineTo(px + 4, py);
    ctx.moveTo(px, py - 4);
    ctx.lineTo(px, py + 4);
    ctx.stroke();

    ctx.restore();
  }

  _renderTestOverlay(ctx, game) {
    const { camera, testSteps } = game;
    if (!testSteps || testSteps.length === 0) return;

    const padding = 14;
    const lineH = 21;
    const headerH = 26;
    const panelW = 480;
    const maxTextW = panelW - 2 * padding;

    ctx.save();
    ctx.font = '15px monospace';
    const wrappedLines = [];
    for (let i = 0; i < testSteps.length; i++) {
      const prefix = `${i + 1}. `;
      const text = prefix + testSteps[i];
      const words = text.split(' ');
      let line = '';
      for (const word of words) {
        const test = line ? line + ' ' + word : word;
        if (ctx.measureText(test).width > maxTextW && line) {
          wrappedLines.push(line);
          line = '   ' + word;
        } else {
          line = test;
        }
      }
      if (line) wrappedLines.push(line);
    }

    const panelH = headerH + padding + wrappedLines.length * lineH + padding;
    const ox = camera.width - panelW - padding;
    const oy = camera.height - panelH - 190;

    ctx.fillStyle = 'rgba(0, 10, 30, 0.85)';
    ctx.fillRect(ox, oy, panelW, panelH);
    ctx.strokeStyle = '#f0a';
    ctx.lineWidth = 1;
    ctx.strokeRect(ox, oy, panelW, panelH);

    ctx.font = 'bold 15px monospace';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillStyle = '#f0a';
    ctx.fillText('TEST MODE — VERIFICATION STEPS', ox + padding, oy + 6);

    ctx.font = '15px monospace';
    ctx.fillStyle = CYAN;
    for (let i = 0; i < wrappedLines.length; i++) {
      const y = oy + headerH + padding + i * lineH;
      ctx.fillText(wrappedLines[i], ox + padding, y);
    }

    ctx.restore();
  }

  _renderDevControls(ctx, game) {
    const { camera, player } = game;
    const padding = 8;
    const lineH   = 14;
    const panelW  = 210;

    const weapons = player.weapons.map(w => {
      const tag = w.isAutoFire ? 'A' : w.isSecondary ? 'S' : 'M';
      return `${w.constructor.name}[${tag}]`;
    }).join('  ');

    const lines = [
      'Z: spawn shielding raider',
      'X: spawn kiter raider',
      'C: spawn interceptor raider',
      '(spawns at mouse cursor)',
      '',
      'Q: toggle laser turret',
      '',
      'WEAPONS: ' + (weapons || 'none'),
    ];

    const panelH = padding + lines.length * lineH + padding;
    const ox = camera.width - panelW - padding;
    const oy = padding;

    ctx.save();
    ctx.fillStyle = 'rgba(0,8,20,0.82)';
    ctx.fillRect(ox, oy, panelW, panelH);
    ctx.strokeStyle = '#334455';
    ctx.lineWidth = 1;
    ctx.strokeRect(ox, oy, panelW, panelH);

    ctx.font = '10px monospace';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';

    for (let i = 0; i < lines.length; i++) {
      const y = oy + padding + i * lineH;
      if (lines[i] === '') continue;
      if (lines[i].startsWith('WEAPONS')) {
        ctx.fillStyle = CYAN;
      } else if (lines[i].startsWith('(')) {
        ctx.fillStyle = DIM_TEXT;
      } else {
        ctx.fillStyle = AMBER;
      }
      ctx.fillText(lines[i], ox + padding, y);
    }

    ctx.restore();
  }

  _renderThrottle(ctx, player, camera) {
    const levels = player.throttleLevels;
    const current = player.throttleLevel;
    const totalW = levels * PIP_W + (levels - 1) * PIP_GAP;
    const startX = (camera.width - totalW) / 2;
    const pipY = camera.height - PIP_BOTTOM_MARGIN - PIP_H;

    ctx.save();
    ctx.font = '11px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    for (let i = 0; i < levels; i++) {
      const x = startX + i * (PIP_W + PIP_GAP);
      const active = i === current;

      ctx.strokeStyle = active ? CYAN : DIM_OUTLINE;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.rect(x, pipY, PIP_W, PIP_H);
      ctx.stroke();

      if (active) {
        ctx.fillStyle = CYAN;
        ctx.fillRect(x + 1, pipY + 1, PIP_W - 2, PIP_H - 2);
      }

      ctx.fillStyle = active ? WHITE : DIM_OUTLINE;
      ctx.fillText(THROTTLE_LABELS[i], x + PIP_W / 2, pipY + PIP_H / 2);
    }

    const speed = Math.round(player.speed);
    const label = THROTTLE_LABELS[current];
    ctx.fillStyle = CYAN;
    ctx.font = '12px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(
      `${label}  ${speed} u/s`,
      camera.width / 2,
      pipY + PIP_H + PIP_LABEL_OFFSET
    );

    ctx.restore();
  }
}
