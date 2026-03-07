import { Station } from './world/station.js';
import { Planet } from './world/planet.js';
import { LootDrop } from './entities/lootDrop.js';
import { Derelict } from './world/derelict.js';
import {
  CYAN, AMBER, GREEN, RED, BLUE, TEAL, WHITE,
  DIM_OUTLINE, BAR_TRACK,
  MINIMAP_BG, MINIMAP_BORDER, MINIMAP_PLANET, MINIMAP_STATION,
  MINIMAP_ENEMY, MINIMAP_FLEET, MINIMAP_PLAYER,
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
const MARGIN = 20;
const LABEL_W = 56;
const BAR_W = 160;
const BAR_H = 12;
const ROW_GAP = 10;
const SEG_COUNT = 10;

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
    this._renderFleetStatus(ctx, game);
    this._renderThrottle(ctx, player, camera);
    this._renderDockPrompt(ctx, game);
    this._renderDerelictPrompt(ctx, game);
    this._renderSalvageBar(ctx, game);
    this._renderPickupTexts(ctx, game);
    this._renderMinimap(ctx, game);
    if (game.isTestMode) this._renderTestOverlay(ctx, game);
    if (game.stationScreen) game.stationScreen.render(ctx, game);
  }

  _renderLeftPanel(ctx, game) {
    const { player } = game;
    const segW = BAR_W / SEG_COUNT;
    const segGap = 1;
    let y = MARGIN;

    ctx.save();
    ctx.font = '13px monospace';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';

    // Credits
    ctx.fillStyle = AMBER;
    ctx.fillText(`${game.credits} cr`, MARGIN, y + BAR_H / 2);
    y += BAR_H + ROW_GAP;

    // Scrap
    ctx.fillStyle = AMBER;
    ctx.fillText(`Scrap: ${game.scrap}`, MARGIN, y + BAR_H / 2);
    y += BAR_H + ROW_GAP;

    // Crew — silhouette icons
    const crewColor = player.crewCurrent <= player.crewMax * 0.25 ? RED
      : player.crewCurrent < player.crewMax ? AMBER : CYAN;
    ctx.fillStyle = crewColor;
    ctx.fillText('CREW', MARGIN, y + BAR_H / 2);

    const barX = MARGIN + LABEL_W;
    const crewX = barX;
    const iconH = BAR_H;
    const iconW = 8;
    const iconGap = 2;
    const maxIcons = player.crewMax;
    for (let i = 0; i < maxIcons; i++) {
      const ix = crewX + i * (iconW + iconGap);
      const alive = i < player.crewCurrent;
      const flash = !alive && player.crewCurrent <= player.crewMax * 0.25
        && Math.floor(Date.now() / 300) % 2 === 0;
      ctx.fillStyle = alive ? crewColor : (flash ? RED : BAR_TRACK);
      // Draw person silhouette: head circle + body trapezoid
      const cx = ix + iconW / 2;
      const headR = iconH * 0.16;
      const headY = y + headR + 0.5;
      // Head
      ctx.beginPath();
      ctx.arc(cx, headY, headR, 0, Math.PI * 2);
      ctx.fill();
      // Body (trapezoid: narrow shoulders, wider base)
      const bodyTop = headY + headR + 0.5;
      const bodyBot = y + iconH;
      const shoulderW = iconW * 0.35;
      const baseW = iconW * 0.5;
      ctx.beginPath();
      ctx.moveTo(cx - shoulderW, bodyTop);
      ctx.lineTo(cx + shoulderW, bodyTop);
      ctx.lineTo(cx + baseW, bodyBot);
      ctx.lineTo(cx - baseW, bodyBot);
      ctx.closePath();
      ctx.fill();
    }

    // Crew count + efficiency
    const crewEndX = crewX + maxIcons * (iconW + iconGap);
    ctx.fillStyle = crewColor;
    ctx.font = '11px monospace';
    ctx.fillText(`${player.crewCurrent}/${player.crewMax}`, crewEndX + 4, y + BAR_H / 2);
    if (player.crewEfficiency < 0.9) {
      const eff = Math.round(player.crewEfficiency * 100);
      ctx.fillStyle = player.crewEfficiency < 0.5 ? RED : AMBER;
      ctx.fillText(`${eff}%`, crewEndX + 50, y + BAR_H / 2);
    }
    ctx.font = '13px monospace';
    y += BAR_H + ROW_GAP + 4;

    // ARMOR bar — green
    const armorRatio = Math.max(0, player.armorCurrent / player.armorMax);
    const armorFlash = armorRatio < 0.25 && Math.floor(Date.now() / 300) % 2 === 0;
    const armorColor = armorFlash ? RED : GREEN;
    const armorFilled = Math.ceil(armorRatio * SEG_COUNT);

    ctx.fillStyle = GREEN;
    ctx.fillText('ARMOR', MARGIN, y + BAR_H / 2);
    ctx.strokeStyle = GREEN;
    ctx.lineWidth = 1;
    ctx.strokeRect(barX - 1, y - 1, BAR_W + 2, BAR_H + 2);
    ctx.fillStyle = BAR_TRACK;
    ctx.fillRect(barX, y, BAR_W, BAR_H);
    for (let i = 0; i < SEG_COUNT; i++) {
      if (i < armorFilled) {
        ctx.fillStyle = armorColor;
        ctx.fillRect(barX + i * segW + segGap, y + 1, segW - segGap * 2, BAR_H - 2);
      }
    }
    ctx.fillStyle = GREEN;
    ctx.font = '11px monospace';
    ctx.fillText(`${Math.ceil(player.armorCurrent)}/${player.armorMax}`, barX + BAR_W + 6, y + BAR_H / 2);
    ctx.font = '13px monospace';
    y += BAR_H + ROW_GAP;

    // HULL bar — red
    const hullRatio = Math.max(0, player.hullCurrent / player.hullMax);
    const hullFlash = hullRatio < 0.25 && Math.floor(Date.now() / 300) % 2 === 0;
    const hullColor = hullFlash ? AMBER : RED;
    const hullFilled = Math.ceil(hullRatio * SEG_COUNT);

    ctx.fillStyle = RED;
    ctx.fillText('HULL', MARGIN, y + BAR_H / 2);
    ctx.strokeStyle = RED;
    ctx.lineWidth = 1;
    ctx.strokeRect(barX - 1, y - 1, BAR_W + 2, BAR_H + 2);
    ctx.fillStyle = BAR_TRACK;
    ctx.fillRect(barX, y, BAR_W, BAR_H);
    for (let i = 0; i < SEG_COUNT; i++) {
      if (i < hullFilled) {
        ctx.fillStyle = hullColor;
        ctx.fillRect(barX + i * segW + segGap, y + 1, segW - segGap * 2, BAR_H - 2);
      }
    }
    ctx.fillStyle = RED;
    ctx.font = '11px monospace';
    ctx.fillText(`${Math.ceil(player.hullCurrent)}/${player.hullMax}`, barX + BAR_W + 6, y + BAR_H / 2);
    ctx.font = '13px monospace';
    y += BAR_H + ROW_GAP;

    // FUEL bar
    const fuelRatio = game.fuel / game.fuelMax;
    const fuelLow = fuelRatio < 0.25;
    const fuelColor = fuelLow ? RED : AMBER;
    const fuelFilled = Math.ceil(fuelRatio * SEG_COUNT);

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

    // CARGO bar
    const cargoUsed = game.totalCargoUsed;
    const cargoCap = game.totalCargoCapacity;
    const cargoRatio = cargoCap > 0 ? cargoUsed / cargoCap : 0;
    const cargoFull = cargoUsed >= cargoCap;
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

    ctx.restore();
  }

  _renderFleetStatus(ctx, game) {
    const { fleet } = game;
    if (fleet.length === 0) return;

    const COLORS = { gunship: '#4fa', frigate: '#a8f', hauler: '#fa8' };
    const startY = MARGIN + (BAR_H + ROW_GAP) * 7 + 8;
    const barW = 60;
    const barH = 5;
    const rowH = 16;
    const segCount = 6;
    const segW = barW / segCount;
    const segGap = 1;

    ctx.save();
    ctx.font = '11px monospace';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';

    for (let i = 0; i < fleet.length; i++) {
      const ship = fleet[i];
      const y = startY + i * rowH;
      const color = COLORS[ship.shipType] || CYAN;
      const hullRatio = ship.hullCurrent / ship.hullMax;
      const lowHull = hullRatio < 0.25;
      const flash = lowHull && Math.floor(Date.now() / 300) % 2 === 0;

      ctx.fillStyle = color;
      ctx.fillRect(MARGIN, y - 3, 6, 6);

      ctx.fillStyle = flash ? RED : CYAN;
      ctx.fillText(ship.shipType, MARGIN + 10, y);

      const aBarX = MARGIN + 66;
      const armorRatio = ship.armorCurrent / ship.armorMax;
      const armorFilled = Math.ceil(armorRatio * segCount);

      ctx.strokeStyle = CYAN;
      ctx.lineWidth = 0.5;
      ctx.strokeRect(aBarX - 0.5, y - barH / 2 - 1.5, barW + 1, barH + 1);
      ctx.fillStyle = BAR_TRACK;
      ctx.fillRect(aBarX, y - barH / 2 - 1, barW, barH);
      for (let s = 0; s < segCount; s++) {
        if (s < armorFilled) {
          ctx.fillStyle = CYAN;
          ctx.fillRect(aBarX + s * segW + segGap, y - barH / 2, segW - segGap * 2, barH - 2);
        }
      }

      const hBarX = aBarX + barW + 2;
      const hullFilled = Math.ceil(hullRatio * segCount);

      ctx.strokeStyle = AMBER;
      ctx.strokeRect(hBarX - 0.5, y - barH / 2 - 1.5, barW + 1, barH + 1);
      ctx.fillStyle = BAR_TRACK;
      ctx.fillRect(hBarX, y - barH / 2 - 1, barW, barH);
      for (let s = 0; s < segCount; s++) {
        if (s < hullFilled) {
          ctx.fillStyle = flash ? RED : AMBER;
          ctx.fillRect(hBarX + s * segW + segGap, y - barH / 2, segW - segGap * 2, barH - 2);
        }
      }

      // Crew count after hull bar
      const crewX = hBarX + barW + 4;
      const crewLow = ship.crewCurrent <= ship.crewMax * 0.25;
      ctx.fillStyle = crewLow ? RED : DIM_OUTLINE;
      ctx.fillText(`${ship.crewCurrent}`, crewX, y);
    }

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
    const MAP_SIZE = game.map.mapSize.width;
    const PANEL = 150;
    const SCALE = PANEL / MAP_SIZE;
    const MM_MARGIN = 20;
    const ox = camera.width - MM_MARGIN - PANEL;
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
      ctx.fillStyle = MINIMAP_STATION;
      ctx.fillRect(mx - 2, my - 2, 4, 4);
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

    for (const s of game.fleet) {
      if (!s.active) continue;
      const mx = ox + s.x * SCALE;
      const my = oy + s.y * SCALE;
      ctx.fillStyle = MINIMAP_FLEET;
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

    const padding = 10;
    const lineH = 14;
    const headerH = 18;
    const panelW = 320;
    const maxTextW = panelW - 2 * padding;

    ctx.save();
    ctx.font = '10px monospace';
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
    // Right side of screen
    const ox = camera.width - panelW - padding;
    const oy = camera.height - panelH - 190;

    ctx.fillStyle = 'rgba(0, 10, 30, 0.85)';
    ctx.fillRect(ox, oy, panelW, panelH);
    ctx.strokeStyle = '#f0a';
    ctx.lineWidth = 1;
    ctx.strokeRect(ox, oy, panelW, panelH);

    ctx.font = 'bold 10px monospace';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillStyle = '#f0a';
    ctx.fillText('TEST MODE — VERIFICATION STEPS', ox + padding, oy + 4);

    ctx.font = '10px monospace';
    ctx.fillStyle = CYAN;
    for (let i = 0; i < wrappedLines.length; i++) {
      const y = oy + headerH + padding + i * lineH;
      ctx.fillText(wrappedLines[i], ox + padding, y);
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
