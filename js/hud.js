import { Station } from './world/station.js';
import { Planet } from './world/planet.js';
import { LootDrop } from './entities/lootDrop.js';
import { Derelict } from './world/derelict.js';
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

const THROTTLE_LABELS = ['STOP', '1/4', '1/2', '3/4', 'FULL', 'FLANK'];

// Guidance mode display shortnames
const GUIDANCE_LABELS = { dumbfire: 'DUMB', wire: 'WIRE', heat: 'HEAT' };

const PIP_W = 32;
const PIP_H = 14;
const PIP_GAP = 6;

const PICKUP_DURATION = 2.0;
const PICKUP_LINE_H  = 16;
const PICKUP_ABOVE   = 90;  // px above ship center to bottom of list

const KILL_DURATION = 3.0;
const KILL_LOG_MAX  = 5;

// Bottom strip layout
const BMARGIN       = 32;   // margin from screen bottom for game UI
const STRIP_BAR_H   = 14;   // bar height in bottom strip
const STRIP_ROW_GAP = 7;    // vertical gap between armor row and hull row

// Ship-anchored UI offsets
const THROTTLE_BELOW_OFFSET = 55;  // px below ship screen center (speed label)
const WEAPON_PANEL_GAP      = 38;  // px from ship center x to weapon panel edge

// Minimap (top-left)
const MM_MARGIN = 24;
const MM_PANEL  = 225;

export class HUD {
  constructor() {
    this._pickupTexts = [];
    this._killLog = [];

    // DOM refs for kill log + pickup text
    this._killLogEl = document.getElementById('hud-kill-log');
    this._pickupEl = document.getElementById('hud-pickup-container');
  }

  addPickupText(text, worldX, worldY, colorHint = null) {
    this._pickupTexts.push({ text, worldX, worldY, createdAt: Date.now(), colorHint });

    // Create DOM element
    if (this._pickupEl) {
      const cls = colorHint && ['breach', 'repair', 'hostile', 'module', 'cargo'].includes(colorHint)
        ? `pickup-${colorHint}` : 'pickup-default';
      const el = document.createElement('div');
      el.className = `hud-pickup-entry ${cls}`;
      el.textContent = text;
      el.addEventListener('animationend', () => el.remove());
      this._pickupEl.appendChild(el);
    }
  }

  addKill(displayName) {
    this._killLog.unshift({ text: `${displayName} destroyed`, createdAt: Date.now() });
    if (this._killLog.length > KILL_LOG_MAX) this._killLog.length = KILL_LOG_MAX;

    // Create DOM element
    if (this._killLogEl) {
      const el = document.createElement('div');
      el.className = 'hud-kill-entry';
      el.textContent = `${displayName} destroyed`;
      el.addEventListener('animationend', () => el.remove());
      this._killLogEl.appendChild(el);
    }
  }

  render(ctx, game) {
    const { player, camera } = game;
    if (!player) return;

    // Top-left minimap
    this._renderMinimap(ctx, game);

    // Ship-anchored UI (follows the ship at screen center)
    this._renderWeaponPanels(ctx, game);
    this._renderThrottle(ctx, player, camera);

    // Bottom strip (centered, fixed screen-space position)
    this._renderBottomStrip(ctx, game);

    // Contextual prompts
    if (game.isPaused) this._renderPauseIcon(ctx, camera);
    this._renderDockPrompt(ctx, game);
    this._renderRepairPrompt(ctx, game);

    // Active operation bars
    this._renderSalvageBar(ctx, game);
    this._renderRepairBar(ctx, game);

    // Position pickup text container over ship
    this._updatePickupPosition(game);

    this._renderAutoFireIndicator(ctx, game);

    // Dev tools (test mode only, not shown in editor)
    if (game.isTestMode && !game.isEditorMode) {
      this._renderDevControls(ctx, game);
      if (game.isPanMode) this._renderPanModeBanner(ctx, game);
    }

    // stationScreen is now HTML (LocationOverlay) — no canvas render needed
    if (game.shipScreen) game.shipScreen.render(ctx, game);
  }

  // ── Bottom strip ───────────────────────────────────────────────────────────

  _renderBottomStrip(ctx, game) {
    const { player, camera } = game;
    const now = Date.now();
    const SEG = 10;
    ctx.save();

    const row2Y = camera.height - BMARGIN - STRIP_BAR_H;
    const row1Y = row2Y - STRIP_BAR_H - STRIP_ROW_GAP;

    // ── Layout: compute group width and center it ───────────────────────────
    const ARMOR_LBL_W  = 52;
    const LEFT_BAR_W   = 130;
    const LEFT_NUM_W   = 44;
    const LEFT_W       = ARMOR_LBL_W + LEFT_BAR_W + LEFT_NUM_W;  // 226

    const levels      = player.throttleLevels;
    const THROT_W     = levels * PIP_W + (levels - 1) * PIP_GAP; // 222 for 6 levels
    const FUEL_LBL_W  = 44;
    const FUEL_BAR_W  = 130;
    const FUEL_NUM_W  = 52;
    const CTR_W       = Math.max(THROT_W, FUEL_LBL_W + FUEL_BAR_W + FUEL_NUM_W); // 226

    const CARGO_LBL_W = 52;
    const CARGO_BAR_W = 130;  // matches fuel bar
    const CARGO_NUM_W = 52;   // includes 6px gap from bar + number text
    const SCRAP_W     = 72;   // ⚙ + up to 4-digit count
    const RIGHT_W     = CARGO_LBL_W + CARGO_BAR_W + CARGO_NUM_W + SCRAP_W;  // 306

    const H_GAP   = 22;
    const GROUP_W = LEFT_W + H_GAP + CTR_W + H_GAP + RIGHT_W;
    const groupX  = (camera.width - GROUP_W) / 2;

    const leftX  = groupX;
    const ctrX   = groupX + LEFT_W + H_GAP;
    const rightX = ctrX + CTR_W + H_GAP;

    // ── LEFT: Armor pips (row1) + Hull bar (row2) ───────────────────────────
    const arcsMax = player.armorArcsMax;
    const arcs    = player.armorArcs;

    // ARMOR pips (row1)
    {
      const arcKeys  = ['front', 'port', 'starboard', 'aft'];
      const arcLbls  = ['F', 'P', 'S', 'A'];
      const totalCur = arcKeys.reduce((s, k) => s + (arcs[k] || 0), 0);
      const totalMax = arcKeys.reduce((s, k) => s + (arcsMax[k] || 0), 0);
      const avgRatio = totalMax > 0 ? totalCur / totalMax : 0;
      const lblColor = armorArcColor(avgRatio);
      const barX     = leftX + ARMOR_LBL_W;

      ctx.font = '12px monospace';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = lblColor;
      ctx.fillText('ARMOR', leftX, row1Y + STRIP_BAR_H / 2);

      ctx.strokeStyle = lblColor;
      ctx.lineWidth = 1;
      ctx.globalAlpha = 0.6;
      ctx.strokeRect(barX - 1, row1Y - 1, LEFT_BAR_W + 2, STRIP_BAR_H + 2);
      ctx.globalAlpha = 1;

      const pipW = (LEFT_BAR_W - 3) / 4;
      for (let i = 0; i < 4; i++) {
        const key    = arcKeys[i];
        const ratio  = (arcsMax[key] || 0) > 0 ? (arcs[key] || 0) / arcsMax[key] : 0;
        const hitAge = now - (player._arcHitTimestamps[key] || 0);
        const flash  = hitAge < 150;
        const color  = flash ? WHITE : armorArcColor(ratio);
        const px     = barX + i * (pipW + 1);

        ctx.fillStyle = BAR_TRACK;
        ctx.fillRect(px, row1Y, pipW, STRIP_BAR_H);

        if (ratio > 0) {
          ctx.fillStyle = color;
          ctx.globalAlpha = flash ? 1.0 : 0.85;
          ctx.fillRect(px, row1Y, pipW * ratio, STRIP_BAR_H);
          ctx.globalAlpha = 1;
        }

        ctx.font = '8px monospace';
        ctx.textAlign = 'center';
        ctx.fillStyle = flash ? WHITE : (ratio > 0 ? color : VERY_DIM);
        ctx.globalAlpha = flash ? 1.0 : 0.7;
        ctx.fillText(arcLbls[i], px + pipW / 2, row1Y + STRIP_BAR_H / 2);
        ctx.globalAlpha = 1;
      }

      ctx.font = '10px monospace';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = lblColor;
      ctx.fillText(
        `${Math.floor(totalCur)}/${Math.floor(totalMax)}`,
        barX + LEFT_BAR_W + 6, row1Y + STRIP_BAR_H / 2
      );
    }

    // HULL bar (row2)
    {
      const hullRatio = player.hullMax > 0 ? player.hullCurrent / player.hullMax : 0;
      const hullColor = hullRatio > 0.5 ? GREEN : hullRatio > 0.25 ? AMBER : RED;
      const hullFlash = hullRatio < 0.25 && Math.floor(now / 300) % 2 === 0;
      const color     = hullFlash ? RED : hullColor;
      this._renderLabeledBar(ctx, leftX, row2Y, 'HULL', player.hullCurrent, player.hullMax, color, LEFT_BAR_W, STRIP_BAR_H, SEG, ARMOR_LBL_W);
    }

    // ── CENTER: Throttle pips (row1) + Fuel bar (row2) ─────────────────────

    // Throttle pips (row1) — centered in CTR_W
    {
      const current       = player.throttleLevel;
      const throttleStart = ctrX + (CTR_W - THROT_W) / 2;

      ctx.font = '11px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      for (let i = 0; i < levels; i++) {
        const x      = throttleStart + i * (PIP_W + PIP_GAP);
        const active = i === current;

        ctx.strokeStyle = active ? CYAN : DIM_OUTLINE;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.rect(x, row1Y, PIP_W, STRIP_BAR_H);
        ctx.stroke();

        if (active) {
          ctx.fillStyle = CYAN;
          ctx.fillRect(x + 1, row1Y + 1, PIP_W - 2, STRIP_BAR_H - 2);
        }

        ctx.fillStyle = active ? '#000000' : DIM_OUTLINE;
        ctx.fillText(THROTTLE_LABELS[i], x + PIP_W / 2, row1Y + STRIP_BAR_H / 2);
      }
    }

    // Fuel bar (row2)
    {
      const fuelRatio = game.fuelMax > 0 ? game.fuel / game.fuelMax : 0;
      const fuelColor = fuelRatio < 0.25 ? RED : AMBER;
      this._renderLabeledBar(ctx, ctrX, row2Y, 'FUEL', game.fuel, game.fuelMax, fuelColor, FUEL_BAR_W, STRIP_BAR_H, SEG, FUEL_LBL_W);

      // Drain rate — below the fuel numerical counter
      if (game.fuelBurnRate > 0) {
        const fuelBarX = ctrX + FUEL_LBL_W;
        ctx.font = '9px monospace';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        ctx.fillStyle = fuelColor;
        ctx.globalAlpha = 0.55;
        ctx.fillText(`-${game.fuelBurnRate.toFixed(3)}/s`, fuelBarX + FUEL_BAR_W + 6, row2Y + STRIP_BAR_H + 2);
        ctx.globalAlpha = 1;
      }
    }

    // ── RIGHT: Power (row1, over cargo) + Cargo + Scrap (row2) ─────────────
    {
      const rightEdge = rightX + RIGHT_W;

      // Pre-compute cargo bar positions so PWR can align to them
      const cargoNumEnd = rightEdge - SCRAP_W;
      const cargoBarEnd = cargoNumEnd - CARGO_NUM_W;
      const cargoBarX   = cargoBarEnd - CARGO_BAR_W;
      const cargoLblX   = cargoBarX - CARGO_LBL_W;

      // POWER readout (row1) — left-aligned starting at cargoLblX, directly above cargo bar
      {
        const reactorNet  = game.reactorOutput - game.reactorDraw;
        const pwrNetColor = reactorNet >= 0 ? GREEN : RED;
        const outStr      = `+${game.reactorOutput}W`;
        const netStr      = ` [${reactorNet >= 0 ? '+' : ''}${reactorNet}W]`;

        ctx.font = '11px monospace';
        ctx.textBaseline = 'middle';
        ctx.textAlign = 'left';

        ctx.fillStyle = DIM_TEXT;
        ctx.fillText('PWR ', cargoLblX, row1Y + STRIP_BAR_H / 2);
        const pwrLblW = ctx.measureText('PWR ').width;

        ctx.fillStyle = GREEN;
        ctx.fillText(outStr, cargoLblX + pwrLblW, row1Y + STRIP_BAR_H / 2);
        const outW = ctx.measureText(outStr).width;

        ctx.fillStyle = pwrNetColor;
        ctx.fillText(netStr, cargoLblX + pwrLblW + outW, row1Y + STRIP_BAR_H / 2);

        // Reactor overhaul warning
        const overdueReactors = (player.moduleSlots || []).filter(m => m?.isOverdue);
        if (overdueReactors.length > 0) {
          ctx.font = 'bold 9px monospace';
          ctx.fillStyle = Math.floor(now / 500) % 2 === 0 ? MAGENTA : RED;
          ctx.fillText('! OVERHAUL', cargoLblX, row1Y - 4);
        }
      }

      // CARGO bar (row2)
      const cargoUsed  = game.totalCargoUsed;
      const cargoCap   = game.totalCargoCapacity;
      const cargoColor = cargoUsed >= cargoCap ? RED : BLUE;
      this._renderLabeledBar(ctx, cargoLblX, row2Y, 'CARGO', cargoUsed, cargoCap, cargoColor, CARGO_BAR_W, STRIP_BAR_H, SEG, CARGO_LBL_W);

      // SCRAP count — left-aligned immediately after cargo number area
      ctx.font = 'bold 13px monospace';
      ctx.textAlign = 'left';
      ctx.fillStyle = AMBER;
      ctx.fillText(`\u2699 ${game.scrap}`, cargoNumEnd + 6, row2Y + STRIP_BAR_H / 2);
    }

    ctx.restore();
  }

  // ── Weapon panels (PRI center-left / SEC center-right of ship) ─────────────

  _renderWeaponPanels(ctx, game) {
    const { player, camera } = game;
    const shipScreen = camera.worldToScreen(player.x, player.y);
    // Vertically center the 2-line panel on the ship's y position
    const panelY     = shipScreen.y - 11;

    // PRI: right edge at shipX - gap (right-justified)
    // SEC: left edge at shipX + gap (left-justified)
    const priRightX = shipScreen.x - WEAPON_PANEL_GAP;
    const secLeftX  = shipScreen.x + WEAPON_PANEL_GAP;

    const primaries   = player._primaryWeapons;
    const secondaries = player._secondaryWeapons;
    const activePri   = primaries[player.primaryWeaponIdx];
    const activeSec   = secondaries[player.secondaryWeaponIdx];

    ctx.save();
    if (activePri) this._renderWeaponPanel(ctx, activePri, 'pri', priRightX, panelY, game.ammo);
    if (activeSec) this._renderWeaponPanel(ctx, activeSec, 'sec', secLeftX, panelY, game.ammo);
    ctx.restore();
  }

  // panelX = right edge for 'pri' (right-justified), left edge for 'sec' (left-justified)
  _renderWeaponPanel(ctx, weapon, type, panelX, panelY, ammoReserve) {
    const isPri     = type === 'pri';
    const nameColor = isPri ? CYAN : MAGENTA;

    // Strip embedded mode tag from displayName (e.g. 'AUTOCANNON [AP]' → 'AUTOCANNON')
    const rawName = weapon.displayName || weapon.constructor.name.toUpperCase();
    const name    = rawName.replace(/\s*\[.*?\]$/, '').trim();

    // Mode tag: prefer currentAmmoMode, then guidanceMode (shortened), then isBeam
    let modeTag = '';
    if (weapon.currentAmmoMode)   modeTag = `[${weapon.currentAmmoMode.toUpperCase()}]`;
    else if (weapon.guidanceMode) modeTag = `[${(GUIDANCE_LABELS[weapon.guidanceMode] ?? weapon.guidanceMode).toUpperCase()}]`;
    else if (weapon.isBeam)       modeTag = '[BEAM]';

    const BAR_W = 40;
    const BAR_H = 5;
    const barY  = panelY + 13;

    ctx.font = '9px monospace';
    ctx.textBaseline = 'top';
    ctx.globalAlpha = 0.65;

    if (isPri) {
      // Right-justified: panelX is the right edge
      // Order right-to-left: PRI | NAME | [AP]  (mirrors SEC left-to-right: SEC | NAME | [MODE])
      const typeLabel = type.toUpperCase();
      const typeLblW  = ctx.measureText(typeLabel).width;
      const nameTextW = ctx.measureText(name).width;

      ctx.textAlign = 'right';

      // PRI — rightmost (closest to ship)
      ctx.fillStyle = DIM_TEXT;
      ctx.fillText(typeLabel, panelX, panelY);

      // Name — middle
      ctx.fillStyle = nameColor;
      ctx.fillText(name, panelX - typeLblW - 6, panelY);

      // [AP] — far left
      if (modeTag) {
        ctx.fillStyle = nameColor;
        ctx.fillText(modeTag, panelX - typeLblW - 6 - nameTextW - 4, panelY);
      }

      // Bar: right edge at panelX
      const barX = panelX - BAR_W;
      this._fillWeaponBar(ctx, weapon, barX, barY, BAR_W, BAR_H, nameColor);

      // Ammo text: right-aligned to barX - 5
      if (weapon.ammo !== undefined) {
        const cargo   = ammoReserve[weapon.ammoType] ?? 0;
        ctx.font = '9px monospace';
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = weapon._reloadTimer > 0 ? AMBER : (weapon.ammo > 0 ? nameColor : RED);
        ctx.fillText(`${weapon.ammo}/${cargo}`, barX - 4, barY + BAR_H / 2);
      }

    } else {
      // Left-justified: panelX is the left edge
      const typeW = ctx.measureText(type.toUpperCase()).width + 6;
      const nameW = modeTag ? ctx.measureText(name).width + 4 : 0;

      ctx.textAlign = 'left';

      ctx.fillStyle = DIM_TEXT;
      ctx.fillText(type.toUpperCase(), panelX, panelY);
      ctx.fillStyle = nameColor;
      ctx.fillText(name, panelX + typeW, panelY);
      if (modeTag) {
        ctx.fillStyle = nameColor;
        ctx.fillText(modeTag, panelX + typeW + nameW, panelY);
      }

      // Bar: left edge at panelX
      this._fillWeaponBar(ctx, weapon, panelX, barY, BAR_W, BAR_H, nameColor);

      // Ammo text: left-aligned after bar
      if (weapon.ammo !== undefined) {
        const cargo   = ammoReserve[weapon.ammoType] ?? 0;
        ctx.font = '9px monospace';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = weapon._reloadTimer > 0 ? AMBER : (weapon.ammo > 0 ? nameColor : RED);
        ctx.fillText(`${weapon.ammo}/${cargo}`, panelX + BAR_W + 4, barY + BAR_H / 2);
      }
    }

    ctx.globalAlpha = 1;
  }

  _fillWeaponBar(ctx, weapon, barX, barY, BAR_W, BAR_H, nameColor) {
    ctx.fillStyle = VERY_DIM;
    ctx.fillRect(barX, barY, BAR_W, BAR_H);

    if (weapon.isBeam) {
      const t = Math.min((weapon._rampUp || 0) / (weapon.rampTime || 1), 1);
      if (weapon._overheated) {
        const cdProg = 1 - (weapon._cooldownTimer || 0) / (weapon.cooldownTime || 1);
        ctx.fillStyle = RED;
        ctx.fillRect(barX, barY, BAR_W * cdProg, BAR_H);
      } else {
        const burnFrac = (weapon._fullPowerTimer || 0) / (weapon.overheatLimit || 5);
        ctx.fillStyle = t >= 1
          ? (burnFrac > 0.6 ? RED : burnFrac > 0.3 ? AMBER : WHITE)
          : nameColor;
        ctx.fillRect(barX, barY, BAR_W * t, BAR_H);
      }
    } else {
      const reloading = weapon._reloadTimer > 0;
      if (reloading) {
        const progress = 1 - weapon._reloadTimer / (weapon.reloadTime || 1);
        ctx.fillStyle = AMBER;
        ctx.fillRect(barX, barY, BAR_W * progress, BAR_H);
      } else {
        const cdMax  = weapon.cooldownMax ?? 0;
        const filled = cdMax > 0 ? Math.max(0, 1 - (weapon._cooldown || 0) / cdMax) : 1;
        ctx.fillStyle = filled >= 1 ? nameColor : AMBER;
        ctx.fillRect(barX, barY, BAR_W * filled, BAR_H);
      }
    }
  }

  // ── Throttle / speed label (below ship) ────────────────────────────────────

  _renderThrottle(ctx, player, camera) {
    const shipScreen = camera.worldToScreen(player.x, player.y);
    const speed      = Math.round(player.speed);
    const label      = THROTTLE_LABELS[player.throttleLevel];
    const now        = Date.now();

    ctx.save();

    // Speed / throttle label — uppercase, reduced opacity cyan
    ctx.font = '9px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillStyle = CYAN;
    ctx.globalAlpha = 0.5;
    ctx.fillText(`${label}  ${speed} U/S`, shipScreen.x, shipScreen.y + THROTTLE_BELOW_OFFSET);
    ctx.globalAlpha = 1;

    // [R][E][S] integrity — 6px further down to avoid speed overlap
    const intY    = shipScreen.y + THROTTLE_BELOW_OFFSET + 24;
    const sysList = [
      { label: 'R', val: player.reactorIntegrity },
      { label: 'E', val: player.engineIntegrity  },
      { label: 'S', val: player.sensorIntegrity  },
    ];
    ctx.font = '10px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const intStartX = shipScreen.x - 26;
    for (let i = 0; i < sysList.length; i++) {
      const ratio   = sysList[i].val / 100;
      const flicker = ratio < 0.25 && Math.floor(now / 300) % 2 === 0;
      const color   = flicker      ? VERY_DIM
                    : ratio < 0.25 ? RED
                    : ratio < 0.5  ? CONDITION_FAULTY
                    : ratio < 0.75 ? AMBER
                    : DIM_TEXT;
      ctx.fillStyle = color;
      ctx.fillText(`[${sysList[i].label}]`, intStartX + i * 26, intY);
    }

    ctx.restore();
  }

  // ── Pause icon ─────────────────────────────────────────────────────────────

  _renderPauseIcon(ctx, camera) {
    const flash = Math.sin(Date.now() * 0.006) > 0;
    if (!flash) return;
    ctx.save();
    ctx.font = 'bold 13px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.fillStyle = AMBER;
    ctx.fillText('II  PAUSED', camera.width / 2, camera.height * 0.55);
    ctx.restore();
  }

  // ── Contextual prompts ─────────────────────────────────────────────────────

  _renderDockPrompt(ctx, game) {
    if (!game.nearbyStation || game.salvage.isSalvaging) return;
    const { camera } = game;
    const alpha   = 0.6 + Math.sin(Date.now() * 0.004) * 0.4;
    const promptY = camera.height * 0.62;
    ctx.save();
    ctx.font = '14px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.globalAlpha = alpha;
    ctx.fillStyle = GREEN;
    ctx.fillText(`Press E to dock at ${game.nearbyStation.name}`, camera.width / 2, promptY);
    ctx.globalAlpha = 1;
    ctx.restore();
  }

  _renderRepairPrompt(ctx, game) {
    const { player, camera } = game;
    if (game.salvage.isSalvaging || game.repair.isRepairing || game.isDocked) return;
    if (!player || player.throttleLevel !== 0) return;

    const armorNeeded   = player.armorCurrent < player.armorMax;
    const modulesNeeded = game.repair.hasModulesToRepair(player);
    if ((!armorNeeded && !modulesNeeded) || game.scrap <= 0) return;

    const alpha   = 0.6 + Math.sin(Date.now() * 0.005) * 0.4;
    const promptY = camera.height * 0.62;
    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.globalAlpha = alpha;
    ctx.font = '14px monospace';
    ctx.fillStyle = GREEN;
    const costs = [];
    if (armorNeeded)   costs.push('1 scrap/pt');
    if (modulesNeeded) costs.push('15 scrap/step');
    ctx.fillText(`Press R to Repair  [${costs.join(' · ')}]`, camera.width / 2, promptY);
    ctx.globalAlpha = 1;
    ctx.restore();
  }

  // ── Active operation bars ──────────────────────────────────────────────────

  _renderSalvageBar(ctx, game) {
    if (!game.salvage.isSalvaging) return;
    const { camera } = game;
    const ratio    = game.salvage.salvageProgress / game.salvage.salvageTotal;
    const barW     = 220;
    const barH     = 16;
    const segCount = 10;
    const x        = (camera.width - barW) / 2;
    const y        = camera.height * 0.70;

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
    this._drawSegBar(ctx, x, y, barW, barH, Math.ceil(ratio * segCount), segCount, AMBER);
    ctx.restore();
  }

  _renderRepairBar(ctx, game) {
    if (!game.repair.isRepairing) return;
    const { player, camera } = game;
    const barW     = 220;
    const barH     = 16;
    const segCount = 10;
    const x        = (camera.width - barW) / 2;
    let   yOffset  = camera.height * 0.70;

    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';

    const hasModules = game.repair.hasModulesToRepair(player);
    if (hasModules) {
      const modAccum = game.repair._moduleRepairAccum ?? 0;
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
      this._drawSegBar(ctx, x, yOffset, barW, barH, Math.ceil(ratio * segCount), segCount, GREEN);
    }

    ctx.restore();
  }

  // Kill log is now DOM-based — no canvas rendering needed

  // ── Minimap (top-left) ─────────────────────────────────────────────────────

  _renderMinimap(ctx, game) {
    const { camera, player, entities, hostiles } = game;
    if (!player.active) return;

    const canSeeStations = player.capabilities.minimap_stations;
    const canSeeShips    = player.capabilities.minimap_ships;
    if (!canSeeStations && !canSeeShips) return;

    const mapW  = game.map.mapSize.width;
    const mapH  = game.map.mapSize.height;
    const SCALE = MM_PANEL / Math.max(mapW, mapH);
    const ox    = MM_MARGIN;
    const oy    = MM_MARGIN;
    const BRKT  = 8;

    ctx.save();

    ctx.fillStyle = MINIMAP_BG;
    ctx.fillRect(ox, oy, MM_PANEL, MM_PANEL);

    ctx.strokeStyle = MINIMAP_BORDER;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(ox, oy + BRKT); ctx.lineTo(ox, oy); ctx.lineTo(ox + BRKT, oy);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(ox + MM_PANEL - BRKT, oy); ctx.lineTo(ox + MM_PANEL, oy); ctx.lineTo(ox + MM_PANEL, oy + BRKT);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(ox, oy + MM_PANEL - BRKT); ctx.lineTo(ox, oy + MM_PANEL); ctx.lineTo(ox + BRKT, oy + MM_PANEL);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(ox + MM_PANEL - BRKT, oy + MM_PANEL); ctx.lineTo(ox + MM_PANEL, oy + MM_PANEL); ctx.lineTo(ox + MM_PANEL, oy + MM_PANEL - BRKT);
    ctx.stroke();

    ctx.beginPath();
    ctx.rect(ox, oy, MM_PANEL, MM_PANEL);
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
        const mx    = ox + e.x * SCALE;
        const my    = oy + e.y * SCALE;
        const color = FACTION[e.faction] ?? MINIMAP_STATION;
        ctx.fillStyle = color;
        ctx.globalAlpha = 0.9;
        ctx.fillRect(mx - 4, my - 4, 8, 8);
        ctx.strokeStyle = MINIMAP_STATION;
        ctx.lineWidth = 1;
        ctx.strokeRect(mx - 4, my - 4, 8, 8);
        ctx.globalAlpha = 1;
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
      for (const r of hostiles) {
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

  // ── Misc indicators ────────────────────────────────────────────────────────

  _renderAutoFireIndicator(ctx, game) {
    if (!game.autoFireMode) return;
    const { camera } = game;
    const pulse = 0.75 + Math.sin(Date.now() * 0.008) * 0.25;
    ctx.save();
    ctx.font = 'bold 11px monospace';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillStyle = RED;
    ctx.globalAlpha = pulse;
    ctx.fillText('AUTO-FIRE', BMARGIN, BMARGIN);
    ctx.globalAlpha = 1;
    ctx.restore();
  }

  _updatePickupPosition(game) {
    if (!this._pickupEl) return;
    const { camera, player } = game;
    const shipScreen = camera.worldToScreen(player.x, player.y);
    this._pickupEl.style.transform = `translate(${shipScreen.x}px, ${shipScreen.y - PICKUP_ABOVE}px)`;
  }

  // ── Dev overlays ───────────────────────────────────────────────────────────

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
    const ox     = camera.width - panelW - padding;
    const oy     = MM_MARGIN;

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

  // ── Helpers ────────────────────────────────────────────────────────────────

  _renderLabeledBar(ctx, x, y, label, current, max, color, barW, barH, segments, labelW) {
    const ratio = max > 0 ? current / max : 0;
    const filled = Math.ceil(ratio * segments);
    const barX = x + labelW;

    ctx.font = '12px monospace';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = color;
    ctx.fillText(label, x, y + barH / 2);

    ctx.strokeStyle = color;
    ctx.lineWidth = 1;
    ctx.strokeRect(barX - 1, y - 1, barW + 2, barH + 2);
    ctx.fillStyle = BAR_TRACK;
    ctx.fillRect(barX, y, barW, barH);
    this._drawSegBar(ctx, barX, y, barW, barH, filled, segments, color);

    ctx.font = '10px monospace';
    ctx.textAlign = 'left';
    ctx.fillStyle = color;
    ctx.fillText(
      `${Math.floor(current)}/${Math.floor(max)}`,
      barX + barW + 6, y + barH / 2
    );
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
}
