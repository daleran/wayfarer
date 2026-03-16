import { conditionColor } from '@/rendering/colors.js';
import { THROTTLE_RATIOS, AMMO } from '@data/index.js';
import { createLootDrop, createModuleDrop, createWeaponDrop, createAmmoDrop } from '@/entities/lootDrop.js';
import { input } from '@/input.js';
import { hullStats, massStats, movementStats, moduleTooltipRows, weaponTooltipRows } from '@/ui/shipStats.js';
import { BOX_W, BOX_H, BOX_GAP, renderModuleHeader, renderModuleSlotBox, renderExpandedStats } from '@/rendering/moduleSlotBoxes.js';

// ── Ship Screen — left 30% HTML panel + canvas module mount UI ────────────
// DOM panel shows: header, stats, mass/thrust, cargo (including modules).
// Canvas renders installed module stat boxes connected to hull mount points.

const BOX_MARGIN_LEFT = 12;
const BOX_START_Y = 60;

export class ShipScreen {
  constructor() {
    this.visible = false;
    this._el = document.getElementById('ship-panel');
    this._selectedCargoModIdx = null;
    this._installing = false;
    this._installProgress = 0;
    this._installModuleIdx = null;
    this._installTargetSlot = null;
    this._cargoFilter = 'all';
    this._game = null;

    // Canvas module UI state
    this._hoveredSlot = -1;       // index into installed slots, or -1
    this._hoveredMount = -1;      // index into mount points, or -1
    this._boxRects = [];          // { x, y, w, h } per installed slot
    this._mountScreenPos = [];    // { x, y } per mount point (screen coords)

    // Tooltip
    this._tooltip = document.createElement('div');
    this._tooltip.className = 'panel-tooltip ship-tooltip';
    document.body.appendChild(this._tooltip);

    // Prevent clicks on DOM panel from reaching canvas
    if (this._el) {
      this._el.addEventListener('mousedown', e => e.stopPropagation());
      this._el.addEventListener('click', e => e.stopPropagation());
    }
  }

  open(game) {
    if (game) this._game = game;
    this.visible = true;
    this._selectedCargoModIdx = null;
    game?.camera?.pushZoom(4.0);
    if (game?.player) game.player._inventoryMode = true;
    this._render();
  }

  close() {
    this.visible = false;
    this._cancelInstall();
    this._hideTooltip();
    this._selectedCargoModIdx = null;
    if (this._game?.player) this._game.player._inventoryMode = false;
    this._game?.camera?.popZoom();
    this._hide();
  }

  toggle(game) { this.visible ? this.close() : this.open(game); }

  _cancelInstall() {
    this._installing = false;
    this._installProgress = 0;
    this._installModuleIdx = null;
    this._installTargetSlot = null;
  }

  _hide() {
    if (this._el) this._el.classList.remove('visible');
  }

  update(dt, game) {
    this._game = game;

    // Handle canvas click for installed module boxes (uninstall / install into empty)
    if (input.wasJustClicked() && !this._installing) {
      this._handleCanvasClick(game);
    }

    if (!this._installing) return;
    this._installProgress += dt;
    if (this._installProgress >= 1.5) {
      const mod = game.modules.splice(this._installModuleIdx, 1)[0];
      game.player.moduleSlots[this._installTargetSlot] = mod;
      if (mod.onInstall) mod.onInstall(game.player);
      game.player.recalcTW?.(game.fuel, game.totalCargoUsed);
      this._cancelInstall();
      this._selectedCargoModIdx = null;
      this._render();
    }
  }

  handleInput(inp, game) {
    this._game = game;
    if (!this.visible) return;
    if (inp.wasJustPressed('escape') || inp.wasJustPressed('i') || inp.wasJustPressed('tab')) {
      this.close();
    }
  }

  // ── Canvas click handling (installed module boxes) ────────────────────────

  _handleCanvasClick(game) {
    const player = game?.player;
    if (!player) return;
    const slots = player.moduleSlots || [];

    // Click installed slot box → uninstall module to cargo
    if (this._hoveredSlot >= 0 && this._hoveredSlot < slots.length) {
      const i = this._hoveredSlot;
      const mod = slots[i];
      if (mod) {
        // Uninstall
        this._hideTooltip();
        if (mod.onRemove) mod.onRemove(player);
        game.modules.push(mod);
        player.moduleSlots[i] = null;
        player.recalcTW?.(game.fuel, game.totalCargoUsed);
        this._selectedCargoModIdx = null;
        this._render();
        return;
      }
      // Click empty slot → install selected cargo module if compatible
      if (!mod && this._selectedCargoModIdx !== null) {
        const mount = player._mountPoints?.[i];
        const isEngineSlot = mount?.slot === 'engine';
        const selectedMod = game.modules[this._selectedCargoModIdx];
        const isSelectedEngine = selectedMod?.isEngine ?? false;
        // Size constraint: large modules require large mounts
        const sizeOk = selectedMod?.size !== 'large' || mount?.size === 'large';
        if (isEngineSlot === isSelectedEngine && sizeOk) {
          this._installTargetSlot = i;
          this._installModuleIdx = this._selectedCargoModIdx;
          this._installing = true;
          this._installProgress = 0;
          this._selectedCargoModIdx = null;
          this._render();
        }
      }
    }
  }

  // ── Jettison ──────────────────────────────────────────────────────────────

  _jettison(type, key) {
    const game = this._game;
    if (!game || !game.player) return;
    const player = game.player;
    const JETTISON_DIST = 80;
    const jx = player.x - Math.sin(player.rotation) * JETTISON_DIST;
    const jy = player.y + Math.cos(player.rotation) * JETTISON_DIST;

    /** @type {import('@/entities/lootDrop.js').LootDrop | null} */
    let drop = null;

    if (type === 'scrap') {
      const amount = Math.min(game.scrap, 20);
      if (amount <= 0) return;
      game.scrap -= amount;
      drop = createLootDrop(jx, jy, 'scrap', amount);
    } else if (type === 'commodity') {
      if (!game.cargo[key] || game.cargo[key] <= 0) return;
      game.cargo[key]--;
      drop = createLootDrop(jx, jy, key, 1);
    } else if (type === 'module') {
      const idx = key;
      const mod = game.modules[idx];
      if (!mod) return;
      game.modules.splice(idx, 1);
      if (this._selectedCargoModIdx === idx) this._selectedCargoModIdx = null;
      else if (this._selectedCargoModIdx !== null && this._selectedCargoModIdx > idx) this._selectedCargoModIdx--;
      drop = createModuleDrop(jx, jy, mod);
    } else if (type === 'weapon') {
      const idx = key;
      const wep = game.weapons[idx];
      if (!wep) return;
      game.weapons.splice(idx, 1);
      drop = createWeaponDrop(jx, jy, wep);
    } else if (type === 'ammo') {
      const amt = game.ammo[key];
      if (!amt || amt <= 0) return;
      const jettAmt = Math.min(amt, 10);
      game.ammo[key] -= jettAmt;
      if (game.ammo[key] <= 0) delete game.ammo[key];
      drop = createAmmoDrop(jx, jy, key, jettAmt);
    }

    if (drop) {
      const ejectSpeed = 30;
      drop.vx = -Math.sin(player.rotation) * ejectSpeed;
      drop.vy =  Math.cos(player.rotation) * ejectSpeed;
      game.entities.push(drop);
      player.recalcTW?.(game.fuel, game.totalCargoUsed);
    }

    this._render();
  }

  // ── Canvas render — installed module boxes + connection lines ──────────────

  render(ctx, game) {
    if (!this.visible || !this._el) return;
    this._game = game;
    this._el.classList.add('visible');

    const player = game.player;
    if (!player) return;
    const camera = game.camera;
    const mounts = player._mountPoints;
    const slots = player.moduleSlots || [];
    if (!mounts) return;

    const mx = input.mouseScreen.x;
    const my = input.mouseScreen.y;

    // Compute mount screen positions
    this._mountScreenPos = [];
    const sin = Math.sin(player.rotation);
    const cos = Math.cos(player.rotation);
    for (const m of mounts) {
      const wx = player.x + m.x * cos - m.y * sin;
      const wy = player.y + m.x * sin + m.y * cos;
      this._mountScreenPos.push(camera.worldToScreen(wx, wy));
    }

    // Box X position: right edge of DOM panel + margin
    const panelWidth = this._el.offsetWidth || Math.round(ctx.canvas.width * 0.30);
    const panelLeft = this._el.offsetLeft || 12;
    const boxX = panelLeft + panelWidth + BOX_MARGIN_LEFT;

    // ── Hover detection ──────────────────────────────────────────────────
    this._hoveredSlot = -1;
    this._hoveredMount = -1;

    // Check installed box rects
    for (let i = 0; i < this._boxRects.length; i++) {
      const r = this._boxRects[i];
      if (mx >= r.x && mx <= r.x + r.w && my >= r.y && my <= r.y + r.h) {
        this._hoveredSlot = i;
        break;
      }
    }

    // Check mount point proximity (12px radius)
    if (this._hoveredSlot < 0) {
      for (let i = 0; i < this._mountScreenPos.length; i++) {
        const mp = this._mountScreenPos[i];
        const dx = mx - mp.x;
        const dy = my - mp.y;
        if (dx * dx + dy * dy < 144) { // 12^2
          this._hoveredMount = i;
          this._hoveredSlot = i; // mount hover highlights corresponding stat box
          break;
        }
      }
    }

    // ── Draw installed module boxes ──────────────────────────────────────
    let curY = BOX_START_Y;
    this._boxRects = [];

    renderModuleHeader(ctx, boxX, curY - 6, slots);

    const hasSelectedCargo = this._selectedCargoModIdx !== null;
    const expandedCb = (ctxE, mod, x, y, w) => {
      renderExpandedStats(ctxE, this._moduleTooltipRows(mod), x, y, w);
    };

    for (let i = 0; i < slots.length; i++) {
      const mod = slots[i];
      const isHovered = this._hoveredSlot === i;
      const isInstalling = this._installTargetSlot === i && this._installing;
      const isEmptyCanInstall = !mod && !isInstalling && hasSelectedCargo && this._isSlotCompatible(i, game);

      const advance = renderModuleSlotBox(ctx, {
        boxX, curY, mod,
        mount: mounts[i],
        mountPos: this._mountScreenPos[i],
        slotIdx: i,
        isHovered,
        install: {
          isInstalling,
          progress: this._installProgress,
          canInstall: isEmptyCanInstall,
        },
        onExpanded: expandedCb,
      });

      // Compute boxH to match what renderModuleSlotBox used
      const boxH = isHovered && mod ? advance - BOX_GAP : BOX_H;
      this._boxRects.push({ x: boxX, y: curY, w: BOX_W, h: boxH });
      curY += advance;
    }
  }

  /** Check if a slot is compatible with the currently selected cargo module. */
  _isSlotCompatible(slotIdx, game) {
    if (this._selectedCargoModIdx === null) return false;
    const player = game.player;
    const mount = player._mountPoints?.[slotIdx];
    const isEngineSlot = mount?.slot === 'engine';
    const selectedMod = game.modules[this._selectedCargoModIdx];
    if (!selectedMod) return false;
    // Engine slot constraint
    if ((selectedMod.isEngine ?? false) !== isEngineSlot) return false;
    // Size constraint: large modules require large mounts
    if (selectedMod.size === 'large' && mount?.size !== 'large') return false;
    return true;
  }

  // ── DOM Rendering ──────────────────────────────────────────────────────────

  _render() {
    if (!this._el || !this._game) return;
    const game = this._game;
    const player = game.player;
    if (!player) return;

    this._el.innerHTML = '';
    this._el.classList.add('visible');

    this._el.appendChild(this._buildHeader());
    this._el.appendChild(this._buildStats(player, game));
    this._el.appendChild(this._buildThrustWeight(player, game));
    this._el.appendChild(this._buildCargo(player, game));
  }

  _buildHeader() {
    const header = document.createElement('div');
    header.className = 'ship-header';

    const left = document.createElement('div');
    const name = document.createElement('div');
    name.className = 'ship-header-name';
    name.textContent = 'HULLBREAKER';
    const cls = document.createElement('div');
    cls.className = 'ship-header-class';
    cls.textContent = 'Onyx-Class Tug [Salvage Modified]';
    left.appendChild(name);
    left.appendChild(cls);
    header.appendChild(left);

    const esc = document.createElement('span');
    esc.className = 'ship-header-esc';
    esc.textContent = '[I] / [Esc]';
    header.appendChild(esc);

    return header;
  }

  _buildStats(player, game) {
    const section = document.createElement('div');
    section.className = 'ship-stats';

    const title = document.createElement('div');
    title.className = 'ship-stats-title';
    title.textContent = 'SHIP STATUS';
    section.appendChild(title);

    const grid = document.createElement('div');
    grid.className = 'ship-stats-grid';

    for (const r of hullStats(player, { live: true })) {
      this._addStatRow(grid, r.label, r.value, r.cls);
    }

    const cruiseSpeed = Math.round(player.speedMax * THROTTLE_RATIOS[4]);
    this._addStatRow(grid, 'SPEED', `${cruiseSpeed} u/s`, 'cyan');

    const fuelRatio = game.fuelMax > 0 ? game.fuel / game.fuelMax : 0;
    const fuelCls = fuelRatio < 0.25 ? 'red' : '';
    this._addStatRow(grid, 'FUEL', `${Math.floor(game.fuel)}/${game.fuelMax}`, fuelCls);

    this._addStatRow(grid, 'SCRAP', `${game.scrap}`, '');

    section.appendChild(grid);
    return section;
  }

  _addStatRow(grid, label, value, cls) {
    const row = document.createElement('div');
    row.className = 'ship-stat-row';
    const l = document.createElement('span');
    l.className = 'ship-stat-label';
    l.textContent = label;
    const v = document.createElement('span');
    v.className = `ship-stat-value${cls ? ' ' + cls : ''}`;
    v.textContent = value;
    row.appendChild(l);
    row.appendChild(v);
    grid.appendChild(row);
  }

  _buildThrustWeight(player, game) {
    const section = document.createElement('div');
    section.className = 'ship-stats';

    const title = document.createElement('div');
    title.className = 'ship-stats-title';
    title.textContent = 'MASS & THRUST';
    section.appendChild(title);

    const grid = document.createElement('div');
    grid.className = 'ship-stats-grid';

    for (const r of massStats(player, { fuel: game.fuel, cargoMass: game.totalCargoUsed })) {
      this._addStatRow(grid, r.label, r.value, r.cls);
    }

    for (const r of movementStats(player)) {
      this._addStatRow(grid, r.label, r.value, r.cls);
    }

    section.appendChild(grid);
    return section;
  }

  _buildCargo(player, game) {
    const section = document.createElement('div');
    section.className = 'ship-cargo';

    const header = document.createElement('div');
    header.className = 'ship-cargo-header';
    const title = document.createElement('span');
    title.className = 'ship-cargo-title';
    title.textContent = 'CARGO BAY';
    header.appendChild(title);

    const used = game.totalCargoUsed;
    const cap = game.totalCargoCapacity;
    const capEl = document.createElement('span');
    capEl.className = `ship-cargo-capacity${used >= cap ? ' full' : ''}`;
    capEl.textContent = `${used}/${cap}`;
    header.appendChild(capEl);
    section.appendChild(header);

    // Filters
    const filters = document.createElement('div');
    filters.className = 'ship-cargo-filters';
    for (const f of ['all', 'modules', 'commodities', 'ammo']) {
      const btn = document.createElement('button');
      btn.className = `ship-cargo-filter${this._cargoFilter === f ? ' active' : ''}`;
      const filterGlyphs = { modules: '□ ', commodities: '⬡ ', ammo: '◇ ' };
      btn.textContent = (filterGlyphs[f] || '') + f.toUpperCase();
      btn.addEventListener('click', () => {
        this._cargoFilter = f;
        this._render();
      });
      filters.appendChild(btn);
    }
    section.appendChild(filters);

    const list = document.createElement('div');
    list.className = 'ship-cargo-list';

    let hasItems = false;

    // Scrap
    if (game.scrap > 0 && (this._cargoFilter === 'all' || this._cargoFilter === 'commodities')) {
      const scrapUnits = Math.floor(game.scrap / 20);
      this._addCargoItem(list, 'SCRAP', `${game.scrap} (${scrapUnits}u)`, 'scrap',
        () => this._jettison('scrap'));
      hasItems = true;
    }

    // Commodity cargo
    if (this._cargoFilter === 'all' || this._cargoFilter === 'commodities') {
      for (const [key, amt] of Object.entries(game.cargo)) {
        if (amt > 0) {
          this._addCargoItem(list, key.toUpperCase(), `${amt}`, '',
            () => this._jettison('commodity', key));
          hasItems = true;
        }
      }
    }

    // Modules in cargo — click to select for installation
    if ((this._cargoFilter === 'all' || this._cargoFilter === 'modules') && game.modules?.length > 0) {
      const hasEmptySlot = (player.moduleSlots || []).some(s => !s);
      for (let mi = 0; mi < game.modules.length; mi++) {
        const m = game.modules[mi];
        const isSelected = this._selectedCargoModIdx === mi;
        const item = document.createElement('div');
        item.className = `ship-cargo-item module${isSelected ? ' selected' : ''}`;

        const nameEl = document.createElement('span');
        nameEl.className = 'ship-cargo-item-name module-name';
        nameEl.textContent = '□ ' + m.displayName;
        item.appendChild(nameEl);

        const right = document.createElement('span');
        right.className = 'ship-cargo-item-value';
        const parts = [];
        if (m.condition && m.condition !== 'good') {
          parts.push(m.condition.toUpperCase());
        }
        const effOut = m.effectivePowerOutput ?? m.powerOutput;
        if (effOut > 0) parts.push(`+${effOut}W`);
        else if (m.powerDraw > 0) parts.push(`-${m.powerDraw}W`);
        right.textContent = parts.join(' ');
        if (m.condition && m.condition !== 'good') {
          right.style.color = conditionColor(m.condition);
        }
        item.appendChild(right);

        // Jettison button
        const jBtn = this._makeJettisonBtn(() => this._jettison('module', mi));
        item.appendChild(jBtn);

        this._attachModuleTooltip(item, m);
        if (hasEmptySlot) {
          item.addEventListener('click', (e) => {
            if (/** @type {HTMLElement} */ (e.target).closest('.ship-cargo-jettison')) return;
            this._hideTooltip();
            this._selectedCargoModIdx = isSelected ? null : mi;
            this._render();
          });
        }
        list.appendChild(item);
        hasItems = true;
      }
    }

    // Weapons in cargo
    if ((this._cargoFilter === 'all' || this._cargoFilter === 'modules') && game.weapons?.length > 0) {
      for (let wi = 0; wi < game.weapons.length; wi++) {
        const wep = game.weapons[wi];
        const wepItem = this._addCargoItem(list, wep.displayName || wep.constructor.name,
          wep.isSecondary ? 'SEC' : 'PRI', 'weapon',
          () => this._jettison('weapon', wi));
        this._attachWeaponTooltip(wepItem, wep);
        hasItems = true;
      }
    }

    // Ammo reserves
    if ((this._cargoFilter === 'all' || this._cargoFilter === 'ammo') && game.ammo) {
      for (const [type, amt] of Object.entries(game.ammo)) {
        if (amt > 0) {
          const ammoName = AMMO[type]?.name || type.toUpperCase();
          this._addCargoItem(list, ammoName, `${amt}`, 'ammo',
            () => this._jettison('ammo', type));
          hasItems = true;
        }
      }
    }

    if (!hasItems) {
      const empty = document.createElement('div');
      empty.className = 'ship-cargo-empty';
      empty.textContent = '— empty —';
      list.appendChild(empty);
    }

    section.appendChild(list);
    return section;
  }

  _addCargoItem(list, name, value, type, onJettison) {
    const item = document.createElement('div');
    item.className = 'ship-cargo-item';

    const nameEl = document.createElement('span');
    const nameCls = type === 'scrap' ? 'scrap' : type === 'weapon' ? 'weapon-name' : type === 'ammo' ? 'ammo-name' : '';
    nameEl.className = `ship-cargo-item-name${nameCls ? ' ' + nameCls : ''}`;
    const glyph = (type === 'ammo') ? '◇ ' : (type === 'weapon') ? '□ ' : '⬡ ';
    nameEl.textContent = glyph + name;
    item.appendChild(nameEl);

    const right = document.createElement('span');
    right.className = 'ship-cargo-item-right';

    const valEl = document.createElement('span');
    valEl.className = 'ship-cargo-item-value';
    valEl.textContent = value;
    right.appendChild(valEl);

    if (onJettison) {
      right.appendChild(this._makeJettisonBtn(onJettison));
    }

    item.appendChild(right);

    list.appendChild(item);
    return item;
  }

  _makeJettisonBtn(onClick) {
    const btn = document.createElement('button');
    btn.className = 'ship-cargo-jettison';
    btn.textContent = 'JETTISON';
    btn.title = 'Eject from cargo bay';
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      this._hideTooltip();
      onClick();
    });
    return btn;
  }

  // ── Tooltip ────────────────────────────────────────────────────────────────

  _showTooltip(e, rows) {
    const tt = this._tooltip;
    if (!tt || rows.length === 0) return;
    tt.innerHTML = '';
    for (const { label, value, cls } of rows) {
      const row = document.createElement('div');
      row.className = 'panel-tooltip-row ship-tooltip-row';
      const l = document.createElement('span');
      l.className = 'panel-tooltip-label ship-tooltip-label';
      l.textContent = label;
      const v = document.createElement('span');
      v.className = `panel-tooltip-value ship-tooltip-value${cls ? ' ' + cls : ''}`;
      v.textContent = value;
      row.appendChild(l);
      row.appendChild(v);
      tt.appendChild(row);
    }
    tt.classList.add('visible');
    this._positionTooltip(e);
  }

  _hideTooltip() {
    if (this._tooltip) this._tooltip.classList.remove('visible');
  }

  _positionTooltip(e) {
    const tt = this._tooltip;
    if (!tt) return;
    const pad = 12;
    let x = e.clientX + pad;
    let y = e.clientY - pad;
    const rect = tt.getBoundingClientRect();
    if (x + rect.width > window.innerWidth) x = e.clientX - rect.width - pad;
    if (y + rect.height > window.innerHeight) y = window.innerHeight - rect.height - 4;
    if (y < 4) y = 4;
    tt.style.left = `${x}px`;
    tt.style.top = `${y}px`;
  }

  _attachModuleTooltip(el, mod) {
    el.addEventListener('mouseenter', (e) => this._showTooltip(e, this._moduleTooltipRows(mod)));
    el.addEventListener('mousemove', (e) => this._positionTooltip(e));
    el.addEventListener('mouseleave', () => this._hideTooltip());
  }

  _attachWeaponTooltip(el, wep) {
    el.addEventListener('mouseenter', (e) => this._showTooltip(e, this._weaponTooltipRows(wep)));
    el.addEventListener('mousemove', (e) => this._positionTooltip(e));
    el.addEventListener('mouseleave', () => this._hideTooltip());
  }

  _moduleTooltipRows(mod) { return moduleTooltipRows(mod); }

  _weaponTooltipRows(wep) { return weaponTooltipRows(wep); }
}
