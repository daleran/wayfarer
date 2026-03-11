import { Station } from './world/station.js';
import { Planet } from './world/planet.js';
import { LootDrop } from './entities/lootDrop.js';
import { Derelict } from './world/derelict.js';
import { HULL_POINTS } from './ships/classes/onyxTug.js';
import {
  CYAN, AMBER, GREEN, RED, BLUE, MAGENTA, WHITE,
  BAR_TRACK, DIM_OUTLINE, VERY_DIM, DIM_TEXT,
  CONDITION_FAULTY,
  FACTION,
  MINIMAP_BG, MINIMAP_BORDER, MINIMAP_PLANET, MINIMAP_STATION,
  MINIMAP_ENEMY, MINIMAP_PLAYER,
  MINIMAP_LOOT, MINIMAP_DERELICT,
  armorArcColor, conditionColor,
} from './ui/colors.js';

const THROTTLE_LABELS = ['Stop', '1/4', '1/2', '3/4', 'Full', 'Flank'];

const PIP_W = 32;
const PIP_H = 14;
const PIP_GAP = 6;
const PIP_BOTTOM_MARGIN = 20;
const PIP_LABEL_OFFSET = 18;

const PICKUP_DURATION = 1.5;
const PICKUP_DRIFT = 40;

const KILL_DURATION = 3.0;
const KILL_LOG_MAX  = 5;

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
    this._killLog = [];
  }

  addPickupText(text, worldX, worldY, colorHint = null) {
    this._pickupTexts.push({ text, worldX, worldY, createdAt: Date.now(), colorHint });
  }

  addKill(displayName) {
    this._killLog.unshift({ text: `${displayName} destroyed`, createdAt: Date.now() });
    if (this._killLog.length > KILL_LOG_MAX) this._killLog.length = KILL_LOG_MAX;
  }

  render(ctx, game) {
    const { player, camera } = game;
    if (!player) return;
    this._renderLeftPanel(ctx, game);
    this._renderThrottle(ctx, player, camera);
    if (game.isPaused) this._renderPauseIcon(ctx, camera);
    this._renderDockPrompt(ctx, game);
    this._renderDerelictPrompt(ctx, game);
    this._renderRepairPrompt(ctx, game);
    this._renderSalvageBar(ctx, game);
    this._renderRepairBar(ctx, game);
    this._renderPickupTexts(ctx, game);
    this._renderKillLog(ctx, game);
    this._renderAutoFireIndicator(ctx, game);
    this._renderMinimap(ctx, game);
    if (game.isTestMode && !game.isEditorMode) {
      this._renderDevControls(ctx, game);
      if (game.isPanMode) this._renderPanModeBanner(ctx, game);
    }
    if (game.stationScreen) game.stationScreen.render(ctx, game);
    if (game.shipScreen) game.shipScreen.render(ctx, game);
  }

  _renderLeftPanel(ctx, game) {
    const { player } = game;
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
      const color  = flash ? WHITE : armorArcColor(ratio);

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
      ctx.fillStyle = ratio > 0 ? armorArcColor(ratio) : VERY_DIM;
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

    // ── Weapon readout ────────────────────────────────────────────────
    let y = intY + 18;
    this._renderWeaponReadout(ctx, player, y, game.ammo);
    y += 38; // space for up to 2 weapon rows

    // ── Reactor readout ───────────────────────────────────────────────
    y += 6;
    const reactorNet = game.reactorOutput - game.reactorDraw;
    const reactorNetColor = reactorNet >= 0 ? GREEN : RED;
    ctx.font = '10px monospace';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = DIM_TEXT;
    ctx.fillText('PWR', MARGIN, y + 5);
    ctx.fillStyle = GREEN;
    ctx.fillText(`+${game.reactorOutput}W`, MARGIN + 30, y + 5);
    ctx.fillStyle = DIM_TEXT;
    ctx.fillText('/', MARGIN + 72, y + 5);
    ctx.fillStyle = RED;
    ctx.fillText(`${game.reactorDraw}W`, MARGIN + 80, y + 5);
    ctx.fillStyle = reactorNetColor;
    ctx.fillText(`[${reactorNet >= 0 ? '+' : ''}${reactorNet}W]`, MARGIN + 116, y + 5);
    y += 16;

    // ── Reactor overhaul warning ───────────────────────────────────────
    const overdueReactors = (player.moduleSlots || []).filter(m => m?.isOverdue);
    if (overdueReactors.length > 0) {
      ctx.font = 'bold 9px monospace';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = Math.floor(Date.now() / 500) % 2 === 0 ? MAGENTA : RED;
      ctx.fillText('! REACTOR OVERHAUL REQUIRED', MARGIN, y + 5);
      y += 14;
    }

    // ── FUEL bar ─────────────────────────────────────────────────────
    y += ROW_GAP;
    const fuelRatio  = game.fuel / game.fuelMax;
    const fuelLowNow = fuelRatio < 0.25;
    const fuelColor  = fuelLowNow ? RED : AMBER;
    const fuelFilled = Math.ceil(fuelRatio * SEG_COUNT);
    const barX = MARGIN + LABEL_W;

    // Burn rate label — above the bar, right-aligned to bar right edge
    if (game.fuelBurnRate > 0) {
      ctx.font = '9px monospace';
      ctx.textAlign = 'right';
      ctx.textBaseline = 'bottom';
      ctx.fillStyle = fuelLowNow ? RED : AMBER;
      ctx.globalAlpha = 0.65;
      ctx.fillText(`-${game.fuelBurnRate.toFixed(3)}/s`, barX + BAR_W, y - 1);
      ctx.globalAlpha = 1;
    }

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
    this._drawSegBar(ctx, barX, y, BAR_W, BAR_H, fuelFilled, SEG_COUNT, fuelColor);
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
    this._drawSegBar(ctx, barX, y, BAR_W, BAR_H, cargoFilled, SEG_COUNT, cargoColor);
    ctx.fillStyle = cargoColor;
    ctx.font = '11px monospace';
    ctx.fillText(`${cargoUsed}/${cargoCap}`, barX + BAR_W + 6, y + BAR_H / 2);
    y += BAR_H + ROW_GAP * 2;

    // ── SCRAP readout ─────────────────────────────────────────────────
    ctx.font = 'bold 18px monospace';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = AMBER;
    ctx.fillText(`\u2699 ${game.scrap}`, MARGIN, y + 9);

    // ── Ship screen hint ──────────────────────────────────────────────
    ctx.font = '10px monospace';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = DIM_TEXT;
    ctx.fillText('[I] SHIP', MARGIN, y + 28);

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
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';

    const baseY = camera.height - PIP_BOTTOM_MARGIN - PIP_H - PIP_LABEL_OFFSET - 24;

    // Lore line (first line of loreText, if any)
    const loreText = game.nearbyDerelict.loreText;
    if (loreText && loreText[0]) {
      ctx.font = '10px monospace';
      ctx.globalAlpha = alpha * 0.6;
      ctx.fillStyle = DIM_TEXT;
      ctx.fillText(loreText[0], camera.width / 2, baseY - 18);
    }

    ctx.font = '14px monospace';
    ctx.globalAlpha = alpha;
    ctx.fillStyle = AMBER;
    ctx.fillText(
      `Press E to salvage ${game.nearbyDerelict.name}`,
      camera.width / 2,
      baseY
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
    this._drawSegBar(ctx, x, y, barW, barH, filled, segCount, AMBER);

    ctx.restore();
  }

  _renderRepairPrompt(ctx, game) {
    const { player, camera } = game;
    if (game.isSalvaging || game.isRepairing || game.isDocked) return;
    if (!player || player.throttleLevel !== 0) return;

    const armorNeeded  = player.armorCurrent < player.armorMax;
    const modulesNeeded = game._hasModulesToRepair();
    if ((!armorNeeded && !modulesNeeded) || game.scrap <= 0) return;

    const alpha = 0.6 + Math.sin(Date.now() * 0.005) * 0.4;
    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.globalAlpha = alpha;

    const baseY = camera.height - PIP_BOTTOM_MARGIN - PIP_H - PIP_LABEL_OFFSET - 44;

    ctx.font = '14px monospace';
    ctx.fillStyle = GREEN;
    const costs = [];
    if (armorNeeded) costs.push('1 scrap/pt');
    if (modulesNeeded) costs.push('15 scrap/step');
    ctx.fillText(`Press R to Repair  [${costs.join(' · ')}]`, camera.width / 2, baseY);

    ctx.globalAlpha = 1;
    ctx.restore();
  }

  _renderRepairBar(ctx, game) {
    if (!game.isRepairing) return;
    const { player, camera } = game;

    const barW = 220;
    const barH = 16;
    const segCount = 10;
    const x = (camera.width - barW) / 2;
    const baseY = camera.height - PIP_BOTTOM_MARGIN - PIP_H - PIP_LABEL_OFFSET - 56;

    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';

    const hasModules = game._hasModulesToRepair();
    let yOffset = baseY;

    // Module repair bar — shown above armor bar if active
    if (hasModules) {
      const modAccum = game._moduleRepairAccum ?? 0;
      ctx.font = 'bold 13px monospace';
      ctx.fillStyle = CONDITION_FAULTY;
      ctx.fillText('MODULE REPAIR...', camera.width / 2, yOffset - 4);

      ctx.strokeStyle = CONDITION_FAULTY;
      ctx.lineWidth = 1;
      ctx.strokeRect(x - 1, yOffset - 1, barW + 2, barH + 2);
      ctx.fillStyle = BAR_TRACK;
      ctx.fillRect(x, yOffset, barW, barH);
      ctx.fillStyle = CONDITION_FAULTY;
      ctx.fillRect(x, yOffset, barW * modAccum, barH);

      yOffset -= barH + 24;
    }

    // Armor bar
    if (player.armorCurrent < player.armorMax) {
      const ratio = player.armorCurrent / player.armorMax;

      ctx.font = 'bold 13px monospace';
      ctx.fillStyle = GREEN;
      ctx.fillText('REPAIRING...', camera.width / 2, yOffset - 4);

      ctx.strokeStyle = GREEN;
      ctx.lineWidth = 1;
      ctx.strokeRect(x - 1, yOffset - 1, barW + 2, barH + 2);
      ctx.fillStyle = BAR_TRACK;
      ctx.fillRect(x, yOffset, barW, barH);

      const filled = Math.ceil(ratio * segCount);
      this._drawSegBar(ctx, x, yOffset, barW, barH, filled, segCount, GREEN);
    }

    ctx.restore();
  }

  _renderAutoFireIndicator(ctx, game) {
    if (!game.autoFireMode) return;
    const { camera } = game;
    const pulse = 0.75 + Math.sin(Date.now() * 0.008) * 0.25;
    ctx.save();
    ctx.font = 'bold 11px monospace';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = RED;
    ctx.globalAlpha = pulse;
    ctx.fillText('AUTO-FIRE', 20, camera.height - 52);
    ctx.globalAlpha = 1;
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
      // colorHint: null = AMBER (pickup), 'breach' = orange (module damage), 'repair' = GREEN, 'hostile' = RED
      ctx.fillStyle = pt.colorHint === 'breach'  ? CONDITION_FAULTY
                    : pt.colorHint === 'repair'   ? GREEN
                    : pt.colorHint === 'hostile'  ? RED
                    : AMBER;
      ctx.fillText(pt.text, screen.x, screen.y);
    }

    ctx.globalAlpha = 1;
    ctx.restore();
  }

  _renderKillLog(ctx, game) {
    if (this._killLog.length === 0) return;
    const { camera } = game;
    const now = Date.now();
    ctx.save();
    ctx.font = '10px monospace';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'top';

    const lineH = 14;
    const x = camera.width - 20;
    const startY = 20;

    for (let i = this._killLog.length - 1; i >= 0; i--) {
      const entry = this._killLog[i];
      const elapsed = (now - entry.createdAt) / 1000;
      if (elapsed > KILL_DURATION) {
        this._killLog.splice(i, 1);
        continue;
      }
      const t = elapsed / KILL_DURATION;
      ctx.globalAlpha = (1 - t) * 0.85;
      ctx.fillStyle = RED;
      ctx.fillText(entry.text, x, startY + i * lineH);
    }

    ctx.globalAlpha = 1;
    ctx.restore();
  }

  _renderMinimap(ctx, game) {
    const { camera, player, entities, raiders } = game;
    if (!player.active) return;

    // Check for any minimap capability
    const canSeeStations = player.capabilities.minimap_stations;
    const canSeeShips = player.capabilities.minimap_ships;
    if (!canSeeStations && !canSeeShips) return;

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

    if (canSeeStations) {
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
    }

    if (canSeeShips) {
      const rangeSq = player.capabilities.sensor_range * player.capabilities.sensor_range;
      for (const r of raiders) {
        if (!r.active) continue;
        const dx = r.x - player.x;
        const dy = r.y - player.y;
        if (dx * dx + dy * dy > rangeSq) continue;
        
        const mx = ox + r.x * SCALE;
        const my = oy + r.y * SCALE;
        ctx.fillStyle = MINIMAP_ENEMY;
        ctx.fillRect(mx - 1.5, my - 1.5, 3, 3);
      }
    }

    const px = ox + player.x * SCALE;
    const py = oy + player.y * SCALE;
    ctx.save();
    ctx.translate(px, py);
    ctx.rotate(player.rotation);
    ctx.fillStyle = MINIMAP_PLAYER;
    ctx.beginPath();
    ctx.moveTo(0, -5);
    ctx.lineTo(3.5, 4);
    ctx.lineTo(-3.5, 4);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    ctx.restore();
  }


  _renderTestOverlay(ctx, game) {
    const { camera, testSteps } = game;
    if (!testSteps || testSteps.length === 0) return;

    const padding = 10;
    const lineH = 16;
    const headerH = 22;
    const panelW = 700;
    const maxTextW = panelW - 2 * padding;

    ctx.save();
    ctx.font = '13px monospace';
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
    const oy = camera.height - panelH - padding;

    ctx.fillStyle = 'rgba(0, 10, 30, 0.85)';
    ctx.fillRect(ox, oy, panelW, panelH);
    ctx.strokeStyle = '#f0a';
    ctx.lineWidth = 1;
    ctx.strokeRect(ox, oy, panelW, panelH);

    ctx.font = 'bold 13px monospace';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillStyle = '#f0a';
    ctx.fillText('TEST MODE — VERIFICATION STEPS', ox + padding, oy + 5);

    ctx.font = '13px monospace';
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

    const panLine = game.isPanMode ? '?: exit pan mode  [PAN]' : '?: pan mode (WASD)';
    const aiLine  = game.aiDisabled ? 'V: enable AI  [AI FROZEN]' : 'V: freeze AI';

    const primaries   = player._primaryWeapons;
    const secondaries = player._secondaryWeapons;
    const priName = (primaries[player.primaryWeaponIdx]?.displayName || '—');
    const secName = (secondaries[player.secondaryWeaponIdx]?.displayName || '—');

    const lines = [
      'Z: spawn light fighter (stalker)',
      'X: spawn armed hauler (kiter)',
      'C: spawn salvage mothership (standoff)',
      '(spawns at mouse cursor)',
      '',
      'Q: toggle laser turret',
      aiLine,
      panLine,
      '',
      `PRI: [< 1  ${priName}  2 >]`,
      `SEC: [< 3  ${secName}  4 >]`,
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
      if (lines[i].startsWith('PRI:') || lines[i].startsWith('SEC:')) {
        ctx.fillStyle = CYAN;
      } else if (lines[i].startsWith('WEAPONS')) {
        ctx.fillStyle = CYAN;
      } else if (lines[i].startsWith('(')) {
        ctx.fillStyle = DIM_TEXT;
      } else if (lines[i].includes('[AI FROZEN]')) {
        ctx.fillStyle = MAGENTA;
      } else if (lines[i].includes('[PAN]')) {
        ctx.fillStyle = CYAN;
      } else {
        ctx.fillStyle = AMBER;
      }
      ctx.fillText(lines[i], ox + padding, y);
    }

    ctx.restore();
  }

  _renderPanModeBanner(ctx, game) {
    const { camera } = game;
    ctx.save();
    ctx.font = 'bold 13px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = CYAN;
    ctx.globalAlpha = 0.5 + Math.sin(Date.now() * 0.005) * 0.5;
    ctx.fillText('PAN MODE — WASD to pan  |  ? to return', camera.width / 2, 24);
    ctx.globalAlpha = 1;
    ctx.restore();
  }

  _renderWeaponReadout(ctx, player, startY, ammoReserve = {}) {
    const primaries   = player._primaryWeapons;
    const secondaries = player._secondaryWeapons;
    const activePri   = primaries[player.primaryWeaponIdx];
    const activeSec   = secondaries[player.secondaryWeaponIdx];

    ctx.font = '10px monospace';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';

    let y = startY;

    // Primary
    if (activePri) {
      const name = activePri.displayName || activePri.constructor.name.toUpperCase();
      ctx.fillStyle = DIM_TEXT;
      ctx.fillText('PRI', MARGIN, y + 5);
      ctx.fillStyle = CYAN;
      ctx.fillText(name, MARGIN + 26, y + 5);

      const bx = MARGIN + 26 + 90;
      const bw = 44;
      const bh = 6;

      if (activePri.isBeam) {
        const t = Math.min((activePri._rampUp || 0) / activePri.rampTime, 1);
        ctx.fillStyle = VERY_DIM;
        ctx.fillRect(bx, y + 2, bw, bh);
        if (activePri._overheated) {
          // Cooldown recovery — bar fills back up as it cools
          const cdProg = 1 - (activePri._cooldownTimer || 0) / (activePri.cooldownTime || 1);
          ctx.fillStyle = RED;
          ctx.fillRect(bx, y + 2, bw * cdProg, bh);
        } else {
          const burnFrac = (activePri._fullPowerTimer || 0) / (activePri.overheatLimit || 5);
          ctx.fillStyle = t >= 1
            ? (burnFrac > 0.6 ? RED : burnFrac > 0.3 ? AMBER : WHITE)
            : CYAN;
          ctx.fillRect(bx, y + 2, bw * t, bh);
        }
      } else if (activePri.magSize !== undefined) {
        // Magazine weapon — show reload bar or cooldown bar, then mag/cargo count
        const reloading = activePri._reloadTimer > 0;
        if (reloading) {
          const progress = 1 - activePri._reloadTimer / activePri.reloadTime;
          ctx.fillStyle = VERY_DIM;
          ctx.fillRect(bx, y + 2, bw, bh);
          ctx.fillStyle = AMBER;
          ctx.fillRect(bx, y + 2, bw * progress, bh);
        } else {
          const cdMax = activePri.cooldownMax ?? 0;
          const filled = cdMax > 0 ? Math.max(0, 1 - (activePri._cooldown || 0) / cdMax) : 1;
          ctx.fillStyle = VERY_DIM;
          ctx.fillRect(bx, y + 2, bw, bh);
          ctx.fillStyle = filled >= 1 ? CYAN : AMBER;
          ctx.fillRect(bx, y + 2, bw * filled, bh);
        }
        // mag / cargo count
        const cargo = ammoReserve[activePri.ammoType] ?? 0;
        ctx.font = '9px monospace';
        ctx.fillStyle = reloading ? AMBER : (activePri.ammo > 0 ? CYAN : RED);
        ctx.fillText(`${activePri.ammo} / ${cargo}`, bx + bw + 5, y + 5);
        ctx.font = '10px monospace';
      } else {
        // Cooldown bar only (no ammo, e.g. beam)
        const cdMax = activePri.cooldownMax ?? 0;
        if (cdMax > 0) {
          const filled = Math.max(0, 1 - (activePri._cooldown || 0) / cdMax);
          ctx.fillStyle = VERY_DIM;
          ctx.fillRect(bx, y + 2, bw, bh);
          ctx.fillStyle = filled >= 1 ? CYAN : AMBER;
          ctx.fillRect(bx, y + 2, bw * filled, bh);
        }
      }

      y += 16;
    }

    // Secondary
    if (activeSec) {
      const name = activeSec.displayName || activeSec.constructor.name.toUpperCase();
      ctx.fillStyle = DIM_TEXT;
      ctx.fillText('SEC', MARGIN, y + 5);
      ctx.fillStyle = MAGENTA;
      ctx.fillText(name, MARGIN + 26, y + 5);

      const pipX = MARGIN + 26 + 90;

      if (activeSec.pipCount !== undefined) {
        // Rocket-style: tube pips + reload or cooldown bar + mag/cargo count
        const pipW   = 6;
        const pipGap = 3;
        const pipCount = activeSec.pipCount;
        const reloading = activeSec._reloadTimer > 0;
        const ready     = !reloading && activeSec._cooldown <= 0 && activeSec.ammo > 0;

        for (let i = 0; i < pipCount; i++) {
          const filled = i < activeSec.ammo;
          ctx.fillStyle = filled && ready ? MAGENTA : VERY_DIM;
          ctx.fillRect(pipX + i * (pipW + pipGap), y + 2, pipW, pipW);
        }

        const barX = pipX + pipCount * (pipW + pipGap) + 5;
        const barW = 36;
        const barH = 6;
        ctx.fillStyle = VERY_DIM;
        ctx.fillRect(barX, y + 2, barW, barH);

        if (reloading) {
          const progress = 1 - activeSec._reloadTimer / activeSec.reloadTime;
          ctx.fillStyle = AMBER;
          ctx.fillRect(barX, y + 2, barW * progress, barH);
        } else {
          const cdMax  = activeSec.cooldownMax || 0;
          const cdFill = cdMax > 0 ? Math.max(0, 1 - (activeSec._cooldown || 0) / cdMax) : 1;
          ctx.fillStyle = cdFill >= 1 ? MAGENTA : DIM_TEXT;
          ctx.fillRect(barX, y + 2, barW * cdFill, barH);
        }

        const cargo = ammoReserve[activeSec.ammoType] ?? 0;
        ctx.font = '9px monospace';
        ctx.fillStyle = reloading ? AMBER : (activeSec.ammo > 0 ? MAGENTA : RED);
        const ammoStr = `${activeSec.ammo} / ${cargo}`;
        ctx.fillText(ammoStr, barX + barW + 5, y + 5);
        if (activeSec.guidanceMode) {
          const ammoW = ctx.measureText(ammoStr).width;
          ctx.fillStyle = DIM_TEXT;
          ctx.fillText(`[${activeSec.guidanceMode}]`, barX + barW + 5 + ammoW + 5, y + 5);
        }
        ctx.font = '10px monospace';

      } else if (activeSec.magSize !== undefined) {
        // Missile-style with mag tracking: pip-per-ammo + cargo count
        const pipW   = 8;
        const pipH   = 8;
        const pipGap = 2;
        const maxPips = Math.min(activeSec.magSize, 10);
        for (let i = 0; i < maxPips; i++) {
          ctx.fillStyle = i < activeSec.ammo ? MAGENTA : VERY_DIM;
          ctx.fillRect(pipX + i * (pipW + pipGap), y + 1, pipW, pipH);
        }
        const cargo = ammoReserve[activeSec.ammoType] ?? 0;
        ctx.font = '9px monospace';
        ctx.fillStyle = activeSec.ammo > 0 ? MAGENTA : RED;
        ctx.fillText(`/ ${cargo}`, pipX + maxPips * (pipW + pipGap) + 4, y + 5);
        ctx.font = '10px monospace';
      }
    }
  }

  _drawSegBar(ctx, x, y, w, h, filled, total, color) {
    const segW = w / total;
    for (let i = 0; i < total; i++) {
      if (i < filled) {
        ctx.fillStyle = color;
        ctx.fillRect(x + i * segW + 1, y + 1, segW - 2, h - 2);
      }
    }
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
    ctx.font = '16px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.fillText(
      `${label}  ${speed} u/s`,
      camera.width / 2,
      pipY - 8
    );

    ctx.restore();
  }

  _renderPauseIcon(ctx, camera) {
    const pipY = camera.height - PIP_BOTTOM_MARGIN - PIP_H;
    const cx   = camera.width / 2;
    const flash = Math.sin(Date.now() * 0.006) > 0;
    if (!flash) return;

    ctx.save();
    ctx.font = 'bold 13px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.fillStyle = AMBER;
    // Two vertical bars as a pause symbol, then label
    ctx.fillText('II  PAUSED', cx, pipY - 34);
    ctx.restore();
  }
}
