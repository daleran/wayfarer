// DesignerPanel — DOM-based left sidebar for the designer tool.
// Replaces the canvas-rendered _renderPanel / _renderShipStats / etc.

import { hullStats, massStats, movementStats, fuelStats } from '@/ui/shipStats.js';

const CLS_MAP = { green: 't-green', red: 't-red', amber: 't-amber', cyan: 't-cyan', white: 't-white', magenta: 't-magenta', dim: 't-dim' };

function colorClass(cls) {
  return CLS_MAP[cls] || '';
}

export class DesignerPanel {
  constructor() {
    /** @type {HTMLElement} */
    this._el = /** @type {HTMLElement} */ (document.getElementById('designer-panel'));
    this._el.addEventListener('mousedown', (e) => e.stopPropagation());
    this._el.addEventListener('wheel', (e) => e.stopPropagation(), { passive: true });

    /** @type {string|null} */
    this._lastKey = null;
  }

  /**
   * Rebuild panel content. Call whenever item changes.
   * @param {number} catIdx
   * @param {number} catCount
   * @param {string} catLabel
   * @param {number} itemIdx
   * @param {number} itemCount
   * @param {*} def
   * @param {*} entity
   * @param {{ autoRotate: boolean, zoom: number, panX?: number, panY?: number }} state
   */
  update(catIdx, catCount, catLabel, itemIdx, itemCount, def, entity, state) {
    // Dirty check: skip rebuild if same item
    const key = `${catIdx}:${itemIdx}:${state.autoRotate}:${state.zoom.toFixed(3)}`;
    if (key === this._lastKey) return;
    this._lastKey = key;

    this._el.innerHTML = '';

    this._buildHeader(catIdx, catCount, catLabel, itemIdx, itemCount, def);

    if (def.type === 'ship') {
      this._buildShipStats(entity, def, state);
    } else if (def.type === 'character') {
      this._buildCharacterStats(def);
    } else if (def.type === 'weapon') {
      this._buildWeaponStats(entity, def);
    } else if (def.type === 'module') {
      this._buildModuleStats(entity, def);
    } else {
      this._buildPoiStats(def, state);
    }
  }

  /** Force rebuild on next update call */
  invalidate() {
    this._lastKey = null;
  }

  // ── Header ──────────────────────────────────────────────────────────────────

  /**
   * @param {number} catIdx
   * @param {number} catCount
   * @param {string} catLabel
   * @param {number} itemIdx
   * @param {number} itemCount
   * @param {*} def
   */
  _buildHeader(catIdx, catCount, catLabel, itemIdx, itemCount, def) {
    const el = this._el;

    const title = this._create('div', 'dsg-title');
    title.textContent = '[ DESIGNER ]';
    el.appendChild(title);

    el.appendChild(this._divider());

    const hint = this._create('div', 'dsg-hint');
    hint.textContent = '\u2191\u2193 category   \u2190 \u2192 item';
    el.appendChild(hint);

    const catRow = this._create('div', 'dsg-section');
    catRow.style.color = 'var(--p-amber)';
    catRow.textContent = `[ ${catLabel.toUpperCase()} ]  ${catIdx + 1}/${catCount}`;
    el.appendChild(catRow);

    const name = this._create('div', 'dsg-name');
    const displayLabel = def.isVariant ? '\u21b3 ' + def.label : def.label;
    name.textContent = displayLabel;
    name.style.color = def.isVariant ? 'var(--p-amber)' : 'var(--p-white)';
    el.appendChild(name);

    const idx = this._create('div', 'dsg-index');
    idx.textContent = `item ${itemIdx + 1} / ${itemCount}`;
    el.appendChild(idx);

    el.appendChild(this._divider());
  }

  // ── Ship Stats ──────────────────────────────────────────────────────────────

  /**
   * @param {*} ship
   * @param {*} def
   * @param {{ autoRotate: boolean, zoom: number }} state
   */
  _buildShipStats(ship, def, state) {
    const el = this._el;

    const hint = this._create('div', 'dsg-hint');
    hint.textContent = `T rotate [${state.autoRotate ? 'ON' : 'OFF'}]  \u2022  R reset  \u2022  scroll zoom  \u2022  C compare`;
    el.appendChild(hint);

    // Hull class (for named ships)
    if (def.isVariant && ship.shipClassName) {
      el.appendChild(this._statRow('Hull Class', ship.shipClassName, 't-dim'));
    }

    // Hull & Armor
    el.appendChild(this._section('HULL & ARMOR'));
    for (const r of hullStats(ship)) {
      el.appendChild(this._statRow(r.label, r.value, colorClass(r.cls)));
    }

    // Mass & Thrust
    el.appendChild(this._section('MASS & THRUST'));
    for (const r of massStats(ship)) {
      el.appendChild(this._statRow(r.label, r.value, colorClass(r.cls)));
    }

    // Movement
    el.appendChild(this._section('MOVEMENT'));
    for (const r of movementStats(ship)) {
      el.appendChild(this._statRow(r.label, r.value, colorClass(r.cls)));
    }

    // Fuel
    el.appendChild(this._section('FUEL'));
    for (const r of fuelStats(ship)) {
      el.appendChild(this._statRow(r.label, r.value, colorClass(r.cls)));
    }

    // Weapons
    if (ship.weapons.length > 0) {
      el.appendChild(this._section('WEAPONS'));
      for (const w of ship.weapons) {
        const tag = w.isAutoFire ? '[auto]' : w.isSecondary ? '[sec]' : '[pri]';
        const wName = this._create('div', 'dsg-row-label');
        wName.textContent = (w.displayName ?? w.constructor.name) + ' ' + tag;
        el.appendChild(wName);

        const dmg = w.damage ?? w.armorDamage;
        if (dmg != null || w.hullDamage != null) {
          const detail = [
            dmg != null ? `${dmg} arm` : null,
            w.hullDamage != null ? `${w.hullDamage} hull` : null,
            w.cooldownMax != null ? `${(w.cooldownMax * 1000).toFixed(0)}ms cd` : null,
            w.maxRange != null ? `${Math.round(w.maxRange)}u rng` : null,
          ].filter(Boolean).join('  ');
          const detEl = this._create('div', 'dsg-row-value t-amber');
          detEl.style.textAlign = 'left';
          detEl.textContent = '  ' + detail;
          el.appendChild(detEl);
        }
      }
    }

    el.appendChild(this._divider());
    const file = this._create('div', 'dsg-file');
    file.textContent = def.file;
    el.appendChild(file);

    if (ship.flavorText) {
      el.appendChild(this._divider());
      el.appendChild(this._section('LORE'));
      el.appendChild(this._wrapText(ship.flavorText));
    }
  }

  // ── Character Stats ─────────────────────────────────────────────────────────

  /** @param {*} def */
  _buildCharacterStats(def) {
    const el = this._el;
    const info = def.characterInfo || {};
    const FACTION_COLORS = {
      scavenger: 't-red', neutral: 't-amber', player: 't-green', concord: 't-cyan',
    };
    const factionCls = FACTION_COLORS[info.Faction] ?? 't-white';

    el.appendChild(this._section('IDENTITY'));
    el.appendChild(this._statRow('Name', info.Name || '\u2014', 't-white'));
    el.appendChild(this._statRow('Faction', (info.Faction || '\u2014').toUpperCase(), factionCls));
    el.appendChild(this._statRow('Behavior', info.Behavior || '\u2014', 't-amber'));
    el.appendChild(this._statRow('Ship', info.Ship || '\u2014', 't-cyan'));
    el.appendChild(this._statRow('Hull', info['Hull Class'] || '\u2014', 't-dim'));

    if (def.flavorText) {
      el.appendChild(this._divider());
      el.appendChild(this._section('BACKSTORY'));
      el.appendChild(this._wrapText(def.flavorText));
    }

    if (def.shipFlavorText) {
      el.appendChild(this._divider());
      el.appendChild(this._section('SHIP'));
      el.appendChild(this._wrapText(def.shipFlavorText));
    }

    el.appendChild(this._divider());
    const file = this._create('div', 'dsg-file');
    file.textContent = def.file;
    el.appendChild(file);
  }

  // ── Weapon Stats ────────────────────────────────────────────────────────────

  /**
   * @param {*} weapon
   * @param {*} def
   */
  _buildWeaponStats(weapon, def) {
    const el = this._el;

    const hint = this._create('div', 'dsg-hint');
    hint.textContent = 'R reset view  \u2022  scroll zoom';
    el.appendChild(hint);

    el.appendChild(this._section('DAMAGE'));

    if (def.isBeam) {
      el.appendChild(this._statRow('Armor (base)', weapon.baseDamage + '/s', 't-green'));
      el.appendChild(this._statRow('Armor (max)', weapon.maxDamage + '/s', 't-green'));
      el.appendChild(this._statRow('Ramp time', weapon.rampTime + 's', 't-amber'));
    } else {
      const armDmg = weapon.damage ?? weapon.armorDamage;
      if (armDmg != null) el.appendChild(this._statRow('Armor', String(armDmg), 't-green'));
      if (weapon.hullDamage != null) el.appendChild(this._statRow('Hull', String(weapon.hullDamage), 't-green'));
      if (weapon.blastRadius != null) el.appendChild(this._statRow('Blast R', weapon.blastRadius + 'u', 't-amber'));

      const armDps = (armDmg != null && weapon.cooldownMax != null) ? (armDmg / weapon.cooldownMax).toFixed(1) : null;
      if (armDps != null) el.appendChild(this._statRow('DPS (armor)', armDps, 't-green'));
    }

    el.appendChild(this._section('PROFILE'));
    if (weapon.cooldownMax != null) el.appendChild(this._statRow('Cooldown', (weapon.cooldownMax * 1000).toFixed(0) + 'ms', 't-amber'));
    if (weapon.cooldown != null && weapon.cooldownMax == null) el.appendChild(this._statRow('Cooldown', (weapon.cooldown * 1000).toFixed(0) + 'ms', 't-amber'));
    if (weapon.maxRange != null) el.appendChild(this._statRow('Range', Math.round(weapon.maxRange) + 'u', 't-amber'));
    if (weapon.projectileSpeed != null) el.appendChild(this._statRow('Proj spd', Math.round(weapon.projectileSpeed) + 'u/s', 't-amber'));
    if (weapon.ammo != null) el.appendChild(this._statRow('Ammo', `${weapon.ammo} / ${weapon.ammoMax}`, 't-white'));

    if (def.flags && def.flags.length > 0) {
      el.appendChild(this._section('FLAGS'));
      for (const f of def.flags) {
        const flag = this._create('div', 'dsg-flag');
        flag.textContent = '  \u00b7 ' + f;
        el.appendChild(flag);
      }
    }

    el.appendChild(this._divider());
    const file = this._create('div', 'dsg-file');
    file.textContent = def.file;
    el.appendChild(file);

    if (def.flavorText) {
      el.appendChild(this._divider());
      el.appendChild(this._section('LORE'));
      el.appendChild(this._wrapText(def.flavorText));
    }
  }

  // ── Module Stats ────────────────────────────────────────────────────────────

  /**
   * @param {*} mod
   * @param {*} def
   */
  _buildModuleStats(mod, def) {
    const el = this._el;
    const cat = def.category ?? 'MODULE';

    const hint = this._create('div', 'dsg-hint');
    hint.textContent = '\u2190 \u2192 cycle  \u2022  C compare';
    el.appendChild(hint);

    // Category badge
    const BADGE_CLS = { ENGINE: 't-amber', WEAPON: 't-red', POWER: 't-green', SENSOR: 't-cyan' };
    const badge = this._section(cat);
    badge.className = 'dsg-section ' + (BADGE_CLS[cat] || 't-white');
    el.appendChild(badge);

    if (mod.isEngine) {
      el.appendChild(this._section('DRIVE STATS'));
      el.appendChild(this._statRow('Thrust', `${mod.thrust}`, 't-green'));
      el.appendChild(this._statRow('Weight', `${mod.weight}`, 't-amber'));
      el.appendChild(this._statRow('FuelEff Mult', `\u00d7${mod.fuelEffMult.toFixed(2)}`, mod.fuelEffMult > 1 ? 't-red' : 't-green'));
    } else if (cat === 'WEAPON' && mod.weapon) {
      el.appendChild(this._section('WEAPON STATS'));
      const w = mod.weapon;
      const arm = w.damage ?? w.armorDamage;
      if (arm != null) el.appendChild(this._statRow('Armor Dmg', String(arm), 't-green'));
      if (w.hullDamage != null) el.appendChild(this._statRow('Hull Dmg', String(w.hullDamage), 't-green'));
      if (w.cooldownMax != null) el.appendChild(this._statRow('Cooldown', `${(w.cooldownMax * 1000).toFixed(0)}ms`, 't-amber'));
      if (w.maxRange != null) el.appendChild(this._statRow('Range', `${Math.round(w.maxRange)}u`, 't-amber'));
    } else if (cat === 'POWER') {
      el.appendChild(this._section('POWER OUTPUT'));
      const out = mod.effectivePowerOutput ?? mod.powerOutput;
      if (out > 0) el.appendChild(this._statRow('Output', `+${out}W`, 't-green'));
      if (mod.overhaulCost) {
        const interval = mod._overhaulInterval;
        const hrs = interval ? `every ${(interval / 3600).toFixed(0)}h` : '\u2014';
        el.appendChild(this._statRow('Overhaul', `${mod.overhaulCost} scrap`, 't-magenta'));
        el.appendChild(this._statRow('Interval', hrs, 't-magenta'));
      }
    } else if (cat === 'SENSOR') {
      el.appendChild(this._section('SENSOR CAPS'));
      if (mod.sensor_range) el.appendChild(this._statRow('Range', `${mod.sensor_range}u`, 't-cyan'));
      const caps = [];
      if (mod.minimap_stations) caps.push('stations');
      if (mod.minimap_ships) caps.push('ships');
      if (mod.lead_indicators) caps.push('lead');
      if (mod.health_pips) caps.push('pips');
      if (mod.salvage_detail) caps.push('salvage');
      if (caps.length) el.appendChild(this._statRow('Detects', caps.join(' \u00b7 '), 't-cyan'));
    }

    el.appendChild(this._section('POWER / FUEL'));
    const draw = mod.powerDraw ?? 0;
    const out = mod.powerOutput ?? 0;
    if (out > 0) el.appendChild(this._statRow('Pwr Output', `+${out}W`, 't-green'));
    if (draw > 0) el.appendChild(this._statRow('Pwr Draw', `-${draw}W`, 't-magenta'));
    const drain = mod.fuelDrainRate ?? 0;
    if (drain > 0) el.appendChild(this._statRow('Fuel Drain', `+${drain.toFixed(3)}/s`, 't-amber'));
    if (draw === 0 && out === 0 && drain === 0) {
      const none = this._create('div', 'dsg-hint');
      none.textContent = '  no power or fuel overhead';
      el.appendChild(none);
    }

    el.appendChild(this._divider());
    const file = this._create('div', 'dsg-file');
    file.textContent = def.file;
    el.appendChild(file);

    if (mod.description) {
      el.appendChild(this._divider());
      el.appendChild(this._section('DESCRIPTION'));
      el.appendChild(this._wrapText(mod.description));
    }
  }

  // ── POI Stats ───────────────────────────────────────────────────────────────

  /**
   * @param {*} def
   * @param {{ zoom: number, panX?: number, panY?: number }} state
   */
  _buildPoiStats(def, state) {
    const el = this._el;

    const hint = this._create('div', 'dsg-hint');
    hint.textContent = 'R reset  \u2022  scroll zoom  \u2022  drag pan';
    el.appendChild(hint);

    el.appendChild(this._section('INFO'));
    for (const [k, v] of Object.entries(def.info ?? {})) {
      el.appendChild(this._statRow(k, String(v), 't-white'));
    }

    el.appendChild(this._divider());
    el.appendChild(this._statRow('Zoom', `${state.zoom.toFixed(3)}\u00d7`, 't-amber'));
    const panWx = -((state.panX ?? 0) / state.zoom);
    const panWy = -((state.panY ?? 0) / state.zoom);
    el.appendChild(this._statRow('Pan', `(${panWx.toFixed(0)}, ${panWy.toFixed(0)})`, 't-dim'));

    const file = this._create('div', 'dsg-file');
    file.textContent = def.file;
    el.appendChild(file);

    if (def.flavorText) {
      el.appendChild(this._divider());
      el.appendChild(this._section('LORE'));
      el.appendChild(this._wrapText(def.flavorText));
    }
  }

  // ── Generic helpers ─────────────────────────────────────────────────────────

  /**
   * @param {string} label
   * @param {string} value
   * @param {string} [valueCls]
   * @returns {HTMLElement}
   */
  _statRow(label, value, valueCls) {
    const row = this._create('div', 'dsg-row');
    const l = this._create('span', 'dsg-row-label');
    l.textContent = label;
    const v = this._create('span', 'dsg-row-value' + (valueCls ? ' ' + valueCls : ''));
    v.textContent = value;
    row.appendChild(l);
    row.appendChild(v);
    return row;
  }

  /**
   * @param {string} title
   * @returns {HTMLElement}
   */
  _section(title) {
    const el = this._create('div', 'dsg-section');
    el.textContent = title;
    return el;
  }

  /** @returns {HTMLElement} */
  _divider() {
    return this._create('hr', 'dsg-divider');
  }

  /**
   * @param {string} text
   * @param {string} [cls]
   * @returns {HTMLElement}
   */
  _wrapText(text, cls) {
    const p = this._create('p', 'dsg-flavor' + (cls ? ' ' + cls : ''));
    p.textContent = text;
    return p;
  }

  /**
   * @param {string} tag
   * @param {string} [className]
   * @returns {HTMLElement}
   */
  _create(tag, className) {
    const el = document.createElement(tag);
    if (className) el.className = className;
    return el;
  }
}
