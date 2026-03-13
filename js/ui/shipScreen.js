import { conditionColor } from '../rendering/colors.js';

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
    if (input.wasJustPressed('escape') || input.wasJustPressed('i')) {
      this.close();
    }
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

    this._addStatRow(grid, 'SPEED', `${Math.round(player.speedMax)} u/s`, 'cyan');

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
    powerEl.style.color = net >= 0 ? '#00ff66' : '#ff4444';
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
        text.style.color = '#00ff66';
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
      btn.textContent = f.toUpperCase();
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
      this._addCargoItem(list, 'SCRAP', `${game.scrap} (${scrapUnits}u)`, 'scrap');
      hasItems = true;
    }

    // Commodity cargo
    if (this._cargoFilter === 'all' || this._cargoFilter === 'commodities') {
      for (const [key, amt] of Object.entries(game.cargo)) {
        if (amt > 0) {
          this._addCargoItem(list, key.toUpperCase(), `${amt}`, '');
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
        nameEl.textContent = m.displayName;
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

        this._attachModuleTooltip(item, m);
        if (hasEmptySlot) {
          item.addEventListener('click', () => {
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
      for (const wep of game.weapons) {
        const wepItem = this._addCargoItem(list, wep.displayName || wep.constructor.name,
          wep.isSecondary ? 'SEC' : 'PRI', 'weapon');
        this._attachWeaponTooltip(wepItem, wep);
        hasItems = true;
      }
    }

    // Ammo reserves
    if ((this._cargoFilter === 'all' || this._cargoFilter === 'ammo') && game.ammo) {
      for (const [type, amt] of Object.entries(game.ammo)) {
        if (amt > 0) {
          this._addCargoItem(list, type.toUpperCase(), `${amt}`, 'ammo');
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

  _addCargoItem(list, name, value, type) {
    const item = document.createElement('div');
    item.className = 'ship-cargo-item';

    const nameEl = document.createElement('span');
    const nameCls = type === 'scrap' ? 'scrap' : type === 'weapon' ? 'weapon-name' : type === 'ammo' ? 'ammo-name' : '';
    nameEl.className = `ship-cargo-item-name${nameCls ? ' ' + nameCls : ''}`;
    nameEl.textContent = name;
    item.appendChild(nameEl);

    const valEl = document.createElement('span');
    valEl.className = 'ship-cargo-item-value';
    valEl.textContent = value;
    item.appendChild(valEl);

    list.appendChild(item);
    return item;
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
    if (mod.speedMult) rows.push({ label: 'SPEED', value: `×${mod.speedMult.toFixed(2)}`, cls: '' });
    if (mod.accelMult) rows.push({ label: 'ACCEL', value: `×${mod.accelMult.toFixed(2)}`, cls: '' });
    if (mod.fuelEffMult) rows.push({ label: 'FUEL EFF', value: `×${mod.fuelEffMult.toFixed(2)}`, cls: '' });
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
