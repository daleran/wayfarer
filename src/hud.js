import { renderMinimap } from './hud/minimap.js';
import { renderMapView } from './hud/mapView.js';
import { renderNavIndicator } from './hud/navIndicator.js';
import { renderThrottle, renderCursorWeapons } from './hud/shipAnchored.js';
import {
  renderPauseIcon, renderDockPrompt, renderRepairPrompt,
  renderSalvageBar, renderRepairBar,
} from './hud/prompts.js';
import { armorArcColor, RED, GREEN, AMBER, BLUE } from './rendering/colors.js';

const PICKUP_ABOVE = 90;

export class HUD {
  constructor() {
    this._pickupTexts = [];
    this._killLog = [];

    this._killLogEl = document.getElementById('hud-kill-log');
    this._pickupEl = document.getElementById('hud-pickup-container');

    // Bottom HUD strip — DOM-based
    this._bottomEl = document.getElementById('hud-bottom');
    this._bottomBuilt = false;
    this._bottomRefs = {};
    this._buildBottomStrip();

    // Tooltip
    this._tooltip = null;
    this._buildTooltip();
  }

  addPickupText(text, worldX, worldY, colorHint = null) {
    this._pickupTexts.push({ text, worldX, worldY, createdAt: Date.now(), colorHint });

    if (this._pickupEl) {
      const PICKUP_GLYPHS = { module: '\u25a1 ', ammo: '\u25c7 ', cargo: '\u2b21 ', scrap: '\u2b21 ' };
      const cls = colorHint && ['breach', 'repair', 'hostile', 'module', 'cargo', 'ammo', 'scrap'].includes(colorHint)
        ? `pickup-${colorHint}` : 'pickup-default';
      const glyph = PICKUP_GLYPHS[colorHint] ?? '';
      const el = document.createElement('div');
      el.className = `hud-pickup-entry ${cls}`;
      el.textContent = glyph + text;
      el.addEventListener('animationend', () => el.remove());
      this._pickupEl.appendChild(el);
    }
  }

  addKill(displayName) {
    this._killLog.unshift({ text: `${displayName} destroyed`, createdAt: Date.now() });
    if (this._killLog.length > 5) this._killLog.length = 5;

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

    // Full-screen map overlay — skip all other HUD, hide DOM elements
    if (game.navigation?.mapOpen) {
      if (this._bottomEl) this._bottomEl.style.display = 'none';
      renderMapView(ctx, game);
      return;
    }
    if (this._bottomEl) this._bottomEl.style.display = '';

    renderMinimap(ctx, game);
    renderNavIndicator(ctx, game);
    renderThrottle(ctx, game);
    renderCursorWeapons(ctx, game);

    // Bottom strip is DOM-based — update it
    this._updateBottomStrip(game);

    if (game.isPaused) renderPauseIcon(ctx, camera);
    renderDockPrompt(ctx, game);
    renderRepairPrompt(ctx, game);
    renderSalvageBar(ctx, game);
    renderRepairBar(ctx, game);

    this._updatePickupPosition(game);

    if (game.shipScreen) game.shipScreen.render(ctx, game);
  }

  _updatePickupPosition(game) {
    if (!this._pickupEl) return;
    const { camera, player } = game;
    if (!player) return;
    const shipScreen = camera.worldToScreen(player.x, player.y);
    this._pickupEl.style.transform = `translate(${shipScreen.x}px, ${shipScreen.y - PICKUP_ABOVE}px)`;
  }

  // ── Bottom HUD Strip (DOM) ───────────────────────────────────────────────

  _buildBottomStrip() {
    if (!this._bottomEl) return;
    const r = this._bottomRefs;
    const SEG_COUNT = 10;

    // Weapon info row above the grid
    const weaponRow = document.createElement('div');
    weaponRow.className = 'hud-weapon-row';
    r.priWeaponEl = document.createElement('span');
    r.priWeaponEl.className = 'hud-weapon-info pri';
    r.secWeaponEl = document.createElement('span');
    r.secWeaponEl.className = 'hud-weapon-info sec';
    weaponRow.appendChild(r.priWeaponEl);
    weaponRow.appendChild(r.secWeaponEl);
    this._bottomEl.appendChild(weaponRow);

    // 3-column × 2-row grid
    // Col 1: ARMOR / HULL   Col 2: THROTTLE / FUEL   Col 3: PWR+CARGO / SCRAP
    const grid = document.createElement('div');
    grid.className = 'hud-grid';

    // ── Col 1, Row 1: ARMOR ────────────────────────────────────────────────
    const armorGroup = document.createElement('div');
    armorGroup.className = 'hud-group';
    const armorLabel = document.createElement('span');
    armorLabel.className = 'hud-group-label';
    armorLabel.textContent = 'ARMOR';
    armorGroup.appendChild(armorLabel);

    r.armorWrap = document.createElement('div');
    r.armorWrap.className = 'hud-armor-wrap';
    r.armorPips = {};
    for (const [key, label] of [['front', 'F'], ['port', 'P'], ['starboard', 'S'], ['aft', 'A']]) {
      const pip = document.createElement('div');
      pip.className = 'hud-armor-pip';
      const fill = document.createElement('div');
      fill.className = 'hud-armor-pip-fill';
      const lbl = document.createElement('div');
      lbl.className = 'hud-armor-pip-label';
      lbl.textContent = label;
      pip.appendChild(fill);
      pip.appendChild(lbl);
      r.armorWrap.appendChild(pip);
      r.armorPips[key] = { pip, fill };
    }
    armorGroup.appendChild(r.armorWrap);
    r.armorValue = document.createElement('span');
    r.armorValue.className = 'hud-bar-value';
    armorGroup.appendChild(r.armorValue);
    grid.appendChild(armorGroup);

    // ── Col 2, Row 1: THROTTLE ─────────────────────────────────────────────
    const throttleGroup = document.createElement('div');
    throttleGroup.className = 'hud-group';
    throttleGroup.style.justifyContent = 'center';
    const throttlePips = document.createElement('div');
    throttlePips.className = 'hud-throttle-pips';
    const THROTTLE_LABELS = ['STOP', '1/4', '1/2', '3/4', 'FULL', 'FLANK'];
    r.throttlePips = [];
    for (let i = 0; i < THROTTLE_LABELS.length; i++) {
      const pip = document.createElement('div');
      pip.className = 'hud-throttle-pip';
      pip.textContent = THROTTLE_LABELS[i];
      throttlePips.appendChild(pip);
      r.throttlePips.push(pip);
    }
    throttleGroup.appendChild(throttlePips);
    r.speedEl = document.createElement('span');
    r.speedEl.className = 'hud-speed';
    throttleGroup.appendChild(r.speedEl);
    grid.appendChild(throttleGroup);

    // ── Col 3, Row 1: PWR + SCRAP ──────────────────────────────────────────
    const pwrScrapGroup = document.createElement('div');
    pwrScrapGroup.className = 'hud-group';
    // Power readout
    const pwrReadout = document.createElement('div');
    pwrReadout.className = 'hud-power';
    const pwrLabel = document.createElement('span');
    pwrLabel.className = 'hud-power-label';
    pwrLabel.textContent = 'PWR';
    pwrReadout.appendChild(pwrLabel);
    r.powerOut = document.createElement('span');
    r.powerOut.className = 'hud-power-out';
    pwrReadout.appendChild(r.powerOut);
    r.powerNet = document.createElement('span');
    r.powerNet.className = 'hud-power-net';
    pwrReadout.appendChild(r.powerNet);
    pwrScrapGroup.appendChild(pwrReadout);
    r.overhaulWarn = document.createElement('span');
    r.overhaulWarn.className = 'hud-overhaul-warn';
    r.overhaulWarn.style.display = 'none';
    r.overhaulWarn.textContent = '! OVERHAUL';
    pwrScrapGroup.appendChild(r.overhaulWarn);
    // Separator + Scrap
    const sep = document.createElement('span');
    sep.className = 'hud-separator';
    sep.textContent = '\u2502';
    pwrScrapGroup.appendChild(sep);
    r.scrapEl = document.createElement('span');
    r.scrapEl.className = 'hud-scrap';
    pwrScrapGroup.appendChild(r.scrapEl);
    grid.appendChild(pwrScrapGroup);

    // ── Col 1, Row 2: HULL ─────────────────────────────────────────────────
    const hullGroup = document.createElement('div');
    hullGroup.className = 'hud-group';
    const hullLabel = document.createElement('span');
    hullLabel.className = 'hud-group-label';
    hullLabel.textContent = 'HULL';
    hullGroup.appendChild(hullLabel);
    r.hullBar = this._makeSegBar('hull', SEG_COUNT);
    hullGroup.appendChild(r.hullBar.wrap);
    r.hullValue = document.createElement('span');
    r.hullValue.className = 'hud-bar-value';
    hullGroup.appendChild(r.hullValue);
    grid.appendChild(hullGroup);

    // ── Col 2, Row 2: FUEL ─────────────────────────────────────────────────
    const fuelGroup = document.createElement('div');
    fuelGroup.className = 'hud-group';
    const fuelLabel = document.createElement('span');
    fuelLabel.className = 'hud-group-label';
    fuelLabel.textContent = 'FUEL';
    fuelGroup.appendChild(fuelLabel);
    r.fuelBar = this._makeSegBar('fuel', SEG_COUNT);
    fuelGroup.appendChild(r.fuelBar.wrap);
    r.fuelValue = document.createElement('span');
    r.fuelValue.className = 'hud-bar-value';
    fuelGroup.appendChild(r.fuelValue);
    r.fuelBurn = document.createElement('span');
    r.fuelBurn.className = 'hud-fuel-burn';
    fuelGroup.appendChild(r.fuelBurn);
    grid.appendChild(fuelGroup);

    // ── Col 3, Row 2: CARGO ─────────────────────────────────────────────────
    const cargoGroup = document.createElement('div');
    cargoGroup.className = 'hud-group';
    const cargoLabel = document.createElement('span');
    cargoLabel.className = 'hud-group-label';
    cargoLabel.textContent = 'CARGO';
    cargoGroup.appendChild(cargoLabel);
    r.cargoBar = this._makeSegBar('cargo', SEG_COUNT);
    cargoGroup.appendChild(r.cargoBar.wrap);
    r.cargoValue = document.createElement('span');
    r.cargoValue.className = 'hud-bar-value';
    cargoGroup.appendChild(r.cargoValue);
    grid.appendChild(cargoGroup);

    this._bottomEl.appendChild(grid);
    this._bottomBuilt = true;
  }

  _makeSegBar(cls, segCount) {
    const wrap = document.createElement('div');
    wrap.className = `hud-seg-bar ${cls}`;
    const segs = [];
    for (let i = 0; i < segCount; i++) {
      const seg = document.createElement('div');
      seg.className = 'hud-seg-bar-seg';
      wrap.appendChild(seg);
      segs.push(seg);
    }
    return { wrap, segs };
  }

  _updateSegBar(bar, ratio, criticalCls) {
    const filled = Math.ceil(ratio * bar.segs.length);
    for (let i = 0; i < bar.segs.length; i++) {
      bar.segs[i].className = i < filled ? 'hud-seg-bar-seg filled' : 'hud-seg-bar-seg';
    }
    // Keep the base type class (hull/fuel/cargo), toggle critical/full
    if (!bar._type) bar._type = bar.wrap.className.replace('hud-seg-bar ', '').split(' ')[0];
    bar.wrap.className = criticalCls
      ? `hud-seg-bar ${bar._type} ${criticalCls}`
      : `hud-seg-bar ${bar._type}`;
  }

  _updateBottomStrip(game) {
    if (!this._bottomBuilt) return;
    const r = this._bottomRefs;
    const p = game.player;
    if (!p) return;

    // Weapon info
    const primaries   = p._primaryWeapons;
    const secondaries = p._secondaryWeapons;
    const activePri   = primaries[p.primaryWeaponIdx];
    const activeSec   = secondaries[p.secondaryWeaponIdx];
    r.priWeaponEl.textContent = activePri ? _weaponInfoText(activePri) : '';
    r.secWeaponEl.textContent = activeSec ? _weaponInfoText(activeSec) : '';

    // Armor pips
    const arcs = p.armorArcs;
    const arcsMax = p.armorArcsMax;
    let totalCur = 0, totalMax = 0;
    for (const key of ['front', 'port', 'starboard', 'aft']) {
      const cur = arcs[key] || 0;
      const max = arcsMax[key] || 0;
      const ratio = max > 0 ? cur / max : 0;
      totalCur += cur;
      totalMax += max;
      const ref = r.armorPips[key];
      ref.fill.style.width = `${ratio * 100}%`;
      const color = armorArcColor(ratio);
      ref.fill.style.background = color;
      ref.pip.style.borderColor = ratio > 0 ? color : 'rgba(255,255,255,0.15)';
    }
    r.armorValue.textContent = `${Math.floor(totalCur)}/${Math.floor(totalMax)}`;
    const avgArmorColor = armorArcColor(totalMax > 0 ? totalCur / totalMax : 0);
    r.armorValue.style.color = avgArmorColor;
    r.armorWrap.style.borderColor = avgArmorColor;

    // Throttle pips
    const current = p.throttleLevel ?? 0;
    const isFlank = current === 5;
    for (let i = 0; i < r.throttlePips.length; i++) {
      const cls = i === current ? (isFlank ? 'hud-throttle-pip active flank' : 'hud-throttle-pip active') : 'hud-throttle-pip';
      r.throttlePips[i].className = cls;
    }

    // Speed
    r.speedEl.textContent = `${Math.floor(p.speed)} U/S`;
    r.speedEl.className = isFlank ? 'hud-speed flank' : 'hud-speed';

    // Hull
    const hullRatio = p.hullMax > 0 ? p.hullCurrent / p.hullMax : 0;
    const hullCritical = hullRatio < 0.25;
    this._updateSegBar(r.hullBar, hullRatio, hullCritical ? 'critical' : null);
    r.hullValue.textContent = `${Math.floor(p.hullCurrent)}/${Math.floor(p.hullMax)}`;
    r.hullValue.style.color = hullCritical ? RED : GREEN;

    // Fuel
    const fuelRatio = game.fuelMax > 0 ? game.fuel / game.fuelMax : 0;
    const fuelCritical = fuelRatio < 0.25;
    this._updateSegBar(r.fuelBar, fuelRatio, fuelCritical ? 'critical' : null);
    r.fuelValue.textContent = `${Math.floor(game.fuel)}/${Math.floor(game.fuelMax)}`;
    r.fuelValue.style.color = fuelCritical ? RED : AMBER;
    r.fuelBurn.textContent = game.fuelBurnRate > 0 ? `-${game.fuelBurnRate.toFixed(3)}/s` : '';

    // Power
    const net = game.reactorOutput - game.reactorDraw;
    r.powerOut.textContent = `+${game.reactorOutput}W`;
    r.powerNet.textContent = `[${net >= 0 ? '+' : ''}${net}W]`;
    r.powerNet.className = `hud-power-net${net < 0 ? ' negative' : ''}`;

    // Overhaul warning
    const hasOverdue = (p.moduleSlots || []).some(m => m?.isOverdue);
    r.overhaulWarn.style.display = hasOverdue ? '' : 'none';

    // Cargo
    const cargoUsed = game.totalCargoUsed;
    const cargoCap = game.totalCargoCapacity;
    const cargoRatio = cargoCap > 0 ? cargoUsed / cargoCap : 0;
    const cargoFull = cargoUsed >= cargoCap;
    this._updateSegBar(r.cargoBar, cargoRatio, cargoFull ? 'full' : null);
    r.cargoValue.textContent = `${cargoUsed}/${cargoCap}`;
    r.cargoValue.style.color = cargoFull ? RED : BLUE;

    // Scrap
    r.scrapEl.textContent = `\u2699 ${game.scrap}`;
  }

  // ── Tooltip ──────────────────────────────────────────────────────────────

  _buildTooltip() {
    this._tooltip = document.createElement('div');
    this._tooltip.className = 'hud-tooltip';
    document.body.appendChild(this._tooltip);
  }

  showTooltip(x, y, rows) {
    if (!this._tooltip) return;
    this._tooltip.innerHTML = '';
    for (const { label, value, cls } of rows) {
      const row = document.createElement('div');
      row.className = 'hud-tooltip-row';
      const l = document.createElement('span');
      l.className = 'hud-tooltip-label';
      l.textContent = label;
      const v = document.createElement('span');
      v.className = `hud-tooltip-value${cls ? ' ' + cls : ''}`;
      v.textContent = value;
      row.appendChild(l);
      row.appendChild(v);
      this._tooltip.appendChild(row);
    }
    this._tooltip.style.left = `${x + 12}px`;
    this._tooltip.style.top = `${y - 10}px`;
    this._tooltip.classList.add('visible');
  }

  hideTooltip() {
    if (this._tooltip) this._tooltip.classList.remove('visible');
  }
}

function _weaponInfoText(weapon) {
  const rawName = weapon.displayName || weapon.constructor.name.toUpperCase();
  const name = rawName.replace(/\s*\[.*?\]$/, '').trim();

  let mode = '';
  if (weapon.isBeam) mode = 'BEAM';

  const modePart = mode ? `  ${mode}` : '';
  const ammoPart = weapon.ammo !== undefined ? `  ${weapon.ammo}/${weapon.magSize || '∞'}` : '';
  return `${name}${modePart}${ammoPart}`;
}
