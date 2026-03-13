import { conditionColor } from '@/rendering/colors.js';
import { THROTTLE_RATIOS } from '@data/compiledData.js';
import { createLootDrop, createModuleDrop, createWeaponDrop, createAmmoDrop } from '@/entities/lootDrop.js';

// ── Ship Screen — left 30% HTML panel (I key) ──────────────────────────────
// Replaces the old canvas-based 3-column overlay with a DOM panel.
// Module installation flow preserved: select cargo module → click empty slot.

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

    // Tooltip
    this._tooltip = document.createElement('div');
    this._tooltip.className = 'ship-tooltip';
    document.body.appendChild(this._tooltip);

    // Prevent clicks on panel from reaching canvas
    if (this._el) {
      this._el.addEventListener('mousedown', e => e.stopPropagation());
      this._el.addEventListener('click', e => e.stopPropagation());
    }
  }

  open(game)   { if (game) this._game = game; this.visible = true;  this._selectedCargoModIdx = null; game?.camera?.pushZoom(2.75); this._render(); }
  close()      { this.visible = false; this._cancelInstall(); this._hideTooltip(); this._game?.camera?.popZoom(); this._hide(); }
  toggle(game) { this.visible ? this.close() : this.open(game); }

  _cancelInstall() {
    this._installing = false;
    this._installProgress = 0;
    this._installModuleIdx = null;
    this._installTargetSlot = null;
    this._selectedCargoModIdx = null;
  }

  _hide() {
    if (this._el) this._el.classList.remove('visible');
  }

  update(dt, game) {
    this._game = game;
    if (!this._installing) return;
    this._installProgress += dt;
    if (this._installProgress >= 1.5) {
      const mod = game.modules.splice(this._installModuleIdx, 1)[0];
      game.player.moduleSlots[this._installTargetSlot] = mod;
      if (mod.onInstall) mod.onInstall(game.player);
      game.player.recalcTW?.(game.fuel, game.totalCargoUsed);
      this._cancelInstall();
      this._render();
    } else {
      // Update install progress bar
      this._updateInstallProgress();
    }
  }

  handleInput(input, game) {
    this._game = game;
    if (!this.visible) return;
    if (input.wasJustPressed('escape') || input.wasJustPressed('i') || input.wasJustPressed('tab')) {
      this.close();
    }
  }

  // ── Jettison ──────────────────────────────────────────────────────────────

  _jettison(type, key) {
    const game = this._game;
    if (!game || !game.player) return;
    const player = game.player;

    // Spawn point: behind the ship
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
      // Override scatter velocity — eject straight behind the ship
      const ejectSpeed = 30;
      drop.vx = -Math.sin(player.rotation) * ejectSpeed;
      drop.vy =  Math.cos(player.rotation) * ejectSpeed;
      game.entities.push(drop);
      player.recalcTW?.(game.fuel, game.totalCargoUsed);
    }

    this._render();
  }

  // Canvas render stub — no-op, everything is DOM now
  render(_ctx, game) {
    if (!this.visible || !this._el) return;
    this._game = game;
    this._el.classList.add('visible');
  }

  // ── DOM Rendering ──────────────────────────────────────────────────────────

  _render() {
    if (!this._el || !this._game) return;
    const game = this._game;
    const player = game.player;
    if (!player) return;

    this._el.innerHTML = '';
    this._el.classList.add('visible');

    // Header
    this._el.appendChild(this._buildHeader());

    // Stats
    this._el.appendChild(this._buildStats(player, game));

    // Mass & Thrust
    this._el.appendChild(this._buildThrustWeight(player, game));

    // Modules
    this._el.appendChild(this._buildModules(player, game));

    // Cargo
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

    const hullRatio = player.hullCurrent / player.hullMax;
    const hullCls = hullRatio > 0.5 ? 'green' : hullRatio > 0.25 ? '' : 'red';
    this._addStatRow(grid, 'HULL', `${Math.round(player.hullCurrent)}/${Math.round(player.hullMax)}`, hullCls);

    // Armor arcs
    for (const [arc, label] of [['front', 'ARM-F'], ['port', 'ARM-P'], ['starboard', 'ARM-S'], ['aft', 'ARM-A']]) {
      const cur = player.armorArcs[arc] || 0;
      const max = player.armorArcsMax[arc] || 0;
      const ratio = max > 0 ? cur / max : 0;
      const cls = ratio > 0.5 ? 'green' : ratio > 0.25 ? '' : 'red';
      this._addStatRow(grid, label, `${Math.round(cur)}/${Math.round(max)}`, cls);
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

    // Weight breakdown
    const totalWeight = player._totalWeight ?? 0;
    const baseWeight = player.baseWeight ?? 0;
    let moduleWeight = 0;
    for (const mod of (player.moduleSlots || [])) {
      if (mod) moduleWeight += mod.weight || 0;
    }
    const fuelWeight = Math.round((game.fuel ?? 0) * 0.5);  // FUEL_WEIGHT_PER_UNIT
    const cargoWeight = Math.round((game.totalCargoUsed ?? 0) * 1.5);  // CARGO_WEIGHT_PER_UNIT

    this._addStatRow(grid, 'HULL MASS', `${baseWeight}`, '');
    this._addStatRow(grid, 'MODULES', `+${moduleWeight}`, '');
    this._addStatRow(grid, 'FUEL', `+${fuelWeight}`, '');
    this._addStatRow(grid, 'CARGO', `+${cargoWeight}`, cargoWeight > 0 ? 'amber' : '');
    this._addStatRow(grid, 'TOTAL', `${Math.round(totalWeight)}`, 'cyan');

    // Thrust and T/W
    const totalThrust = player._totalThrust ?? 0;
    const twRatio = player._twRatio ?? 0;
    const refTW = player._refTwRatio ?? 0;
    const twPct = refTW > 0 ? Math.round((twRatio / refTW) * 100) : 0;
    const twCls = twPct >= 100 ? 'green' : twPct >= 80 ? '' : twPct >= 60 ? 'amber' : 'red';
    this._addStatRow(grid, 'THRUST', `${Math.round(totalThrust)}`, 'green');
    this._addStatRow(grid, 'T/W', `${twRatio.toFixed(2)} (${twPct}%)`, twCls);

    // Derived stats
    this._addStatRow(grid, 'ACCEL', `${Math.round(player.acceleration)} u/s²`, 'cyan');
    this._addStatRow(grid, 'TOP SPD', `${Math.round(player.speedMax * THROTTLE_RATIOS[4])} u/s`, 'cyan');
    this._addStatRow(grid, 'TURN', `${(player.turnRate * (180 / Math.PI)).toFixed(0)}°/s`, 'cyan');

    section.appendChild(grid);
    return section;
  }

  _buildModules(player, game) {
    const section = document.createElement('div');
    section.className = 'ship-modules';

    // Header with power budget
    const header = document.createElement('div');
    header.className = 'ship-modules-header';
    const title = document.createElement('span');
    title.className = 'ship-modules-title';
    title.textContent = 'MODULES';
    header.appendChild(title);

    const slots = player.moduleSlots || [];
    let totalOut = 0, totalDraw = 0;
    for (const mod of slots) {
      if (!mod) continue;
      totalOut += (mod.effectivePowerOutput ?? mod.powerOutput) || 0;
      totalDraw += mod.powerDraw || 0;
    }
    const net = totalOut - totalDraw;
    const powerEl = document.createElement('span');
    powerEl.className = 'ship-modules-power';
    powerEl.style.color = net >= 0 ? 'var(--p-green)' : 'var(--p-red)';
    powerEl.textContent = `${net >= 0 ? '+' : ''}${net}W`;
    header.appendChild(powerEl);
    section.appendChild(header);

    const hasSelectedCargo = this._selectedCargoModIdx !== null;

    for (let i = 0; i < slots.length; i++) {
      const mod = slots[i];
      const isInstalling = this._installTargetSlot === i && this._installing;

      const slot = document.createElement('div');
      slot.className = 'ship-module-slot';

      if (isInstalling) {
        slot.classList.add('installing');
        const prog = document.createElement('div');
        prog.className = 'ship-install-progress';
        prog.dataset.slotIdx = String(i);
        prog.style.width = `${Math.min(this._installProgress / 1.5, 1) * 100}%`;
        slot.appendChild(prog);

        const text = document.createElement('div');
        text.className = 'ship-module-name';
        text.style.color = 'var(--p-green)';
        text.textContent = 'INSTALLING...';
        text.style.position = 'relative';
        text.style.zIndex = '1';
        slot.appendChild(text);
      } else if (mod) {
        const top = document.createElement('div');
        top.className = 'ship-module-slot-top';

        const nameEl = document.createElement('span');
        nameEl.className = 'ship-module-name';
        nameEl.textContent = `[${i + 1}] ${mod.displayName}`;
        top.appendChild(nameEl);

        // Right side: condition + power at a glance
        const rightEl = document.createElement('span');
        rightEl.className = 'ship-module-right';

        if (mod.condition) {
          const cond = document.createElement('span');
          cond.className = 'ship-module-condition-badge';
          cond.style.color = conditionColor(mod.condition);
          cond.textContent = mod.condition.toUpperCase();
          rightEl.appendChild(cond);
        }

        const effOut = mod.effectivePowerOutput ?? mod.powerOutput;
        if (effOut > 0 || mod.powerDraw > 0) {
          const pwr = document.createElement('span');
          pwr.className = `ship-module-power ${effOut > 0 ? 'positive' : 'negative'}`;
          pwr.textContent = effOut > 0 ? `+${effOut}W` : `-${mod.powerDraw}W`;
          rightEl.appendChild(pwr);
        }

        top.appendChild(rightEl);
        slot.appendChild(top);

        // Tooltip on hover
        this._attachModuleTooltip(slot, mod);

        // Click to remove
        slot.addEventListener('click', () => {
          this._hideTooltip();
          if (mod.onRemove) mod.onRemove(game.player);
          game.modules.push(mod);
          game.player.moduleSlots[i] = null;
          game.player.recalcTW?.(game.fuel, game.totalCargoUsed);
          this._render();
        });
      } else {
        slot.classList.add('empty');
        if (hasSelectedCargo) slot.classList.add('can-install');

        const text = document.createElement('div');
        text.className = `ship-module-empty-text${hasSelectedCargo ? ' can-install' : ''}`;
        text.textContent = hasSelectedCargo ? `[${i + 1}] CLICK TO INSTALL` : `[${i + 1}] ─── EMPTY ───`;
        slot.appendChild(text);

        if (hasSelectedCargo) {
          slot.addEventListener('click', () => {
            this._installTargetSlot = i;
            this._installModuleIdx = this._selectedCargoModIdx;
            this._installing = true;
            this._installProgress = 0;
            this._selectedCargoModIdx = null;
            this._render();
          });
        }
      }

      section.appendChild(slot);
    }

    return section;
  }

  _buildCargo(player, game) {
    const section = document.createElement('div');
    section.className = 'ship-cargo';

    // Header
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

    // Cargo list
    const list = document.createElement('div');
    list.className = 'ship-cargo-list';

    let hasItems = false;

    // Scrap (always first, under 'all' or 'commodities')
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

    // Modules in cargo
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
          this._addCargoItem(list, type.toUpperCase(), `${amt}`, 'ammo',
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

  _updateInstallProgress() {
    if (!this._el) return;
    const prog = /** @type {HTMLElement} */ (this._el.querySelector('.ship-install-progress'));
    if (prog) {
      prog.style.width = `${Math.min(this._installProgress / 1.5, 1) * 100}%`;
    }
  }

  // ── Tooltip ────────────────────────────────────────────────────────────────

  _showTooltip(e, rows) {
    const tt = this._tooltip;
    if (!tt || rows.length === 0) return;
    tt.innerHTML = '';
    for (const { label, value, cls } of rows) {
      const row = document.createElement('div');
      row.className = 'ship-tooltip-row';
      const l = document.createElement('span');
      l.className = 'ship-tooltip-label';
      l.textContent = label;
      const v = document.createElement('span');
      v.className = `ship-tooltip-value${cls ? ' ' + cls : ''}`;
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

  _moduleTooltipRows(mod) {
    const rows = [];
    if (mod.condition) {
      const mult = mod.conditionMultiplier;
      rows.push({ label: 'CONDITION', value: `${mod.condition.toUpperCase()} ×${mult.toFixed(2)}`, cls: mod.condition === 'good' ? 'green' : '' });
    }
    const effOut = mod.effectivePowerOutput ?? mod.powerOutput;
    if (effOut > 0) rows.push({ label: 'POWER', value: `+${effOut}W`, cls: 'green' });
    if (mod.powerDraw > 0) rows.push({ label: 'DRAW', value: `-${mod.powerDraw}W`, cls: 'amber' });
    if (mod.fuelDrainRate > 0) rows.push({ label: 'FUEL DRAIN', value: `${mod.fuelDrainRate.toFixed(3)}/s`, cls: 'amber' });
    if (mod.thrust) rows.push({ label: 'THRUST', value: `${mod.thrust}`, cls: 'green' });
    if (mod.weight) rows.push({ label: 'WEIGHT', value: `${mod.weight}`, cls: '' });
    if (mod.fuelEffMult && mod.fuelEffMult !== 1.0) rows.push({ label: 'FUEL EFF', value: `×${mod.fuelEffMult.toFixed(2)}`, cls: '' });
    if (mod.isFissionReactor) {
      const interval = mod._overhaulInterval || 0;
      const elapsed = mod.timeSinceOverhaul || 0;
      if (mod.isOverdue) {
        rows.push({ label: 'OVERHAUL', value: 'OVERDUE', cls: 'red' });
      } else if (interval > 0) {
        const remaining = Math.max(0, interval - elapsed);
        const mins = Math.floor(remaining / 60);
        const secs = Math.floor(remaining % 60);
        rows.push({ label: 'OVERHAUL IN', value: `${mins}m ${secs}s`, cls: '' });
      }
      if (mod.overhaulCost) rows.push({ label: 'OVERHAUL COST', value: `${mod.overhaulCost} scrap`, cls: 'amber' });
    }
    if (mod.description) rows.push({ label: '', value: mod.description, cls: 'dim' });
    return rows;
  }

  _weaponTooltipRows(wep) {
    const rows = [];
    if (wep.damage) rows.push({ label: 'DAMAGE', value: `${wep.damage}`, cls: 'red' });
    if (wep.hullDamage) rows.push({ label: 'HULL DMG', value: `${wep.hullDamage}`, cls: 'red' });
    if (wep.maxRange) rows.push({ label: 'RANGE', value: `${wep.maxRange}`, cls: '' });
    if (wep.cooldownMax) rows.push({ label: 'FIRE RATE', value: `${(1 / wep.cooldownMax).toFixed(1)}/s`, cls: '' });
    if (wep.magSize) rows.push({ label: 'MAGAZINE', value: `${wep.magSize}`, cls: '' });
    if (wep.isBeam) rows.push({ label: 'TYPE', value: 'BEAM', cls: 'cyan' });
    if (wep.blastRadius) rows.push({ label: 'BLAST', value: `${wep.blastRadius}`, cls: 'amber' });
    if (wep.isSecondary) rows.push({ label: 'SLOT', value: 'SECONDARY', cls: '' });
    return rows;
  }
}
