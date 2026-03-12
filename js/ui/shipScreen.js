import { conditionColor } from './colors.js';

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

    // Prevent clicks on panel from reaching canvas
    if (this._el) {
      this._el.addEventListener('mousedown', e => e.stopPropagation());
      this._el.addEventListener('click', e => e.stopPropagation());
    }
  }

  open(game)   { if (game) this._game = game; this.visible = true;  this._selectedCargoModIdx = null; this._render(); }
  close()      { this.visible = false; this._cancelInstall(); this._hide(); }
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
        prog.dataset.slotIdx = i;
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

        // Power annotation
        const effOut = mod.effectivePowerOutput ?? mod.powerOutput;
        if (effOut > 0 || mod.powerDraw > 0) {
          const pwr = document.createElement('span');
          pwr.className = `ship-module-power ${effOut > 0 ? 'positive' : 'negative'}`;
          pwr.textContent = effOut > 0 ? `+${effOut}W` : `-${mod.powerDraw}W`;
          top.appendChild(pwr);
        }

        slot.appendChild(top);

        // Condition badge
        if (mod.condition && mod.condition !== 'good') {
          const cond = document.createElement('div');
          cond.className = 'ship-module-condition';
          cond.style.color = conditionColor(mod.condition);
          cond.textContent = mod.condition.toUpperCase();
          slot.appendChild(cond);
        }

        // Description
        if (mod.description) {
          const desc = document.createElement('div');
          desc.className = 'ship-module-desc';
          desc.textContent = mod.description;
          slot.appendChild(desc);
        }

        // Click to remove
        slot.addEventListener('click', () => {
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

        if (hasEmptySlot) {
          item.addEventListener('click', () => {
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
        this._addCargoItem(list, wep.displayName || wep.constructor.name,
          wep.isSecondary ? 'SEC' : 'PRI', 'weapon');
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
  }

  _updateInstallProgress() {
    if (!this._el) return;
    const prog = this._el.querySelector('.ship-install-progress');
    if (prog) {
      prog.style.width = `${Math.min(this._installProgress / 1.5, 1) * 100}%`;
    }
  }
}
