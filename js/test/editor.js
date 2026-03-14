// EditorOverlay — live map viewer drawn on top of a running GameManager.
// Philosophy: code-first. Edit map files in your editor; Vite HMR reloads.
// This overlay adds pan/zoom, per-entity debug stats, and an object sidebar
// for temporary entity placement (position scouting — coords logged to console).

import { input } from '@/input.js';
import { SHIP_REGISTRY, CHARACTER_REGISTRY, createShip } from '@/ships/registry.js';
import { STATION_REGISTRY } from '@/world/stationRegistry.js';
import { createDerelict } from '@/world/derelict.js';
import { createModuleById } from '@/modules/registry.js';
import { WEAPON_REGISTRY } from '@/modules/weapons/registry.js';
import { COMMODITIES } from '@/data/commodities.js';
import {
  CYAN, AMBER, GREEN, MAGENTA,
} from '@/rendering/colors.js';
import { EditorHUDBar, EditorSidebar, EditorItemMenu, EditorPanBanner } from '@/ui/editorPanels.js';

// Map editor category label → designer category id
const DESIGNER_CAT = { SHIPS: 'ships', NPCS: 'ships', STATIONS: 'stations', DERELICTS: 'derelicts' };

// Module categories for the item menu
const MODULE_CATEGORIES = {
  'WEAPONS': ['autocannon-module', 'lance-small', 'cannon-module', 'rocket-pod-s', 'rocket-pod-l'],
  'ENGINES': ['onyx-drive-unit', 'chem-rocket-s', 'chem-rocket-l', 'magplasma-torch-s', 'magplasma-torch-l', 'ion-thruster'],
  'POWER':   ['HydrogenFuelCell', 'SmallFissionReactor', 'LargeFissionReactor', 'LargeFusionReactor'],
  'SENSORS': ['SalvagedSensorSuite', 'StandardSensorSuite', 'CombatComputer', 'SalvageScanner', 'LongRangeScanner'],
};

function _buildItemCategories() {
  const cats = [];

  // Scrap & Fuel
  cats.push({
    label: 'RESOURCES',
    items: [
      { id: 'scrap-50',   label: '+50 Scrap',    stats: 'currency', action: /** @param {*} g */ g => { g.inventory.scrap += 50; } },
      { id: 'scrap-200',  label: '+200 Scrap',   stats: 'currency', action: /** @param {*} g */ g => { g.inventory.scrap += 200; } },
      { id: 'scrap-1000', label: '+1000 Scrap',  stats: 'currency', action: /** @param {*} g */ g => { g.inventory.scrap += 1000; } },
      { id: 'fuel-25',    label: '+25 Fuel',      stats: 'consumable', action: /** @param {*} g */ g => { g.inventory.fuel = Math.min(g.inventory.fuel + 25, g.inventory.fuelMax); } },
      { id: 'fuel-full',  label: 'Full Fuel',     stats: 'fill to max', action: /** @param {*} g */ g => { g.inventory.fuel = g.inventory.fuelMax; } },
    ],
  });

  // Modules — grouped by type
  for (const [groupLabel, ids] of Object.entries(MODULE_CATEGORIES)) {
    cats.push({
      label: `MOD: ${groupLabel}`,
      items: ids.map(id => {
        const sample = createModuleById(id);
        return {
          id,
          label: sample.displayName || id,
          stats: _moduleStats(sample),
          action: g => { g.inventory.modules.push(createModuleById(id)); },
        };
      }),
    });
  }

  // Weapons
  cats.push({
    label: 'WEAPONS',
    items: WEAPON_REGISTRY.map(entry => {
      const sample = /** @type {*} */ (entry.create());
      return {
        id: entry.id,
        label: sample.displayName || entry.label,
        stats: `DMG:${sample.damage ?? '?'} RNG:${sample.maxRange ?? '?'}`,
        action: g => { g.inventory.weapons.push(entry.create()); },
      };
    }),
  });

  // Ammo
  const ammoTypes = [
    { id: '8mm',      label: '8mm Ball',              amount: 200 },
    { id: '25mm-ap',  label: '25mm Armor Piercing',   amount: 100 },
    { id: '25mm-he',  label: '25mm High Explosive',   amount: 50 },
    { id: '90mm-ap',  label: '90mm Armor Piercing',   amount: 12 },
    { id: '90mm-he',  label: '90mm High Explosive',   amount: 8 },
    { id: 'rkt',      label: 'Dumbfire Rocket',       amount: 10 },
    { id: 'wg',       label: 'Wire-Guided Missile',   amount: 10 },
    { id: 'ht',       label: 'Heat-Seeking Missile',  amount: 10 },
    { id: '30mm-kp',  label: '30mm Kinetic Penetrator', amount: 6 },
    { id: '60mm-kp',  label: '60mm Kinetic Penetrator', amount: 4 },
  ];
  cats.push({
    label: 'AMMO',
    items: ammoTypes.map(a => ({
      id: `ammo-${a.id}`,
      label: `+${a.amount} ${a.label}`,
      stats: `type: ${a.id}`,
      action: g => { g.inventory.ammo[a.id] = (g.inventory.ammo[a.id] || 0) + a.amount; },
    })),
  });

  // Commodities
  cats.push({
    label: 'COMMODITIES',
    items: Object.values(COMMODITIES).map(c => ({
      id: c.id,
      label: c.name,
      stats: `base price: ${c.basePrice} scrap`,
      action: g => { g.inventory.cargo[c.id] = (g.inventory.cargo[c.id] || 0) + 5; },
    })),
  });

  return cats;
}

function _moduleStats(mod) {
  const parts = [];
  if (mod.powerOutput) parts.push(`+${mod.powerOutput}W`);
  if (mod.powerDraw)   parts.push(`-${mod.powerDraw}W`);
  if (mod.thrust)      parts.push(`thrust:${mod.thrust}`);
  if (mod.weapon)      parts.push(`wpn:${mod.weapon.displayName}`);
  return parts.join(' ') || mod.description || '';
}

export class EditorOverlay {
  constructor(game) {
    this._game     = game;
    this._panMode  = false;
    this._debugMode = 0;
    this._barOpen  = false;
    this._catIdx   = 0;
    this._itemIdx  = 0;
    this._barItems = this._buildBarItems();

    // Item menu state
    this._itemMenuOpen = false;
    this._itemCatIdx   = 0;
    this._itemSelIdx   = 0;
    this._itemCats     = _buildItemCategories();
    this._itemFlash    = 0; // flash timer for add confirmation

    // DOM panels
    this._hudBar     = new EditorHUDBar();
    this._sidebar    = new EditorSidebar();
    this._itemMenu   = new EditorItemMenu();
    this._panBanner  = new EditorPanBanner();
  }

  // ── Registry ──────────────────────────────────────────────────────────────

  _buildBarItems() {
    const npcItems = CHARACTER_REGISTRY.map(n => ({
      id: n.id,
      label: n.label,
      faction: n.faction,
      create: n.create,
      stats: `${n.faction} · ${n.behavior}`,
    }));
    // Enemies (scavenger faction) first, then rest
    npcItems.sort((a, b) => {
      const aE = a.faction === 'scavenger' ? 0 : 1;
      const bE = b.faction === 'scavenger' ? 0 : 1;
      return aE - bE;
    });

    return [
      {
        label: 'NPCS',
        items: npcItems,
      },
      {
        label: 'SHIPS',
        items: SHIP_REGISTRY.map(s => ({
          id: s.id,
          label: s.label,
          faction: null,
          create: s.create,
          stats: s.label,
        })),
      },
      {
        label: 'STATIONS',
        items: STATION_REGISTRY.map(s => ({
          id: s.id,
          label: s.label,
          faction: s.faction,
          create: (x, y) => s.create(x, y),
          stats: `services: ${(s.services || []).join(', ') || '—'}`,
        })),
      },
      {
        label: 'DERELICTS',
        items: ['hauler', 'fighter', 'frigate', 'unknown'].map(cls => ({
          id: `derelict-${cls}`,
          label: cls.charAt(0).toUpperCase() + cls.slice(1),
          faction: null,
          create: (x, y) => createDerelict({ x, y, derelictClass: cls, name: `Derelict ${cls}` }),
          stats: `class: ${cls}`,
        })),
      },
    ];
  }

  // ── Update ────────────────────────────────────────────────────────────────

  update(_dt) {
    const game = this._game;
    const cam  = game.camera;

    // Toggle pan mode (grave/tilde key)
    if (input.wasJustPressed('`')) {
      this._panMode = !this._panMode;
      game.isPanMode = this._panMode;
    }

    // Toggle AI freeze (V key)
    if (input.wasJustPressed('v')) game.aiDisabled = !game.aiDisabled;

    // Toggle debug overlay (= key)
    if (input.wasJustPressed('=')) this._debugMode = (this._debugMode + 1) % 3;

    // Quick spawn at mouse cursor
    if (input.wasJustPressed('z')) this._quickSpawn('light-fighter');
    if (input.wasJustPressed('x')) this._quickSpawn('armed-hauler');
    if (input.wasJustPressed('c')) this._quickSpawn('salvage-mothership');

    // Toggle object sidebar (- key)
    if (input.wasJustPressed('-')) {
      this._barOpen = !this._barOpen;
      if (this._barOpen) this._itemMenuOpen = false; // close other panel
    }

    // Toggle item menu ([ key)
    if (input.wasJustPressed('[')) {
      this._itemMenuOpen = !this._itemMenuOpen;
      if (this._itemMenuOpen) this._barOpen = false; // close other panel
    }

    // Sidebar navigation — Left/Right = categories, Up/Down = items
    if (this._barOpen) {
      if (input.wasJustPressed('arrowleft')) {
        this._catIdx = (this._catIdx - 1 + this._barItems.length) % this._barItems.length;
        this._itemIdx = 0;
      }
      if (input.wasJustPressed('arrowright')) {
        this._catIdx = (this._catIdx + 1) % this._barItems.length;
        this._itemIdx = 0;
      }
      const cat = this._barItems[this._catIdx];
      if (input.wasJustPressed('arrowup')) {
        this._itemIdx = (this._itemIdx - 1 + cat.items.length) % cat.items.length;
      }
      if (input.wasJustPressed('arrowdown')) {
        this._itemIdx = (this._itemIdx + 1) % cat.items.length;
      }
    }

    // Item menu navigation
    if (this._itemMenuOpen) {
      const cats = this._itemCats;
      if (input.wasJustPressed('arrowleft')) {
        this._itemCatIdx = (this._itemCatIdx - 1 + cats.length) % cats.length;
        this._itemSelIdx = 0;
      }
      if (input.wasJustPressed('arrowright')) {
        this._itemCatIdx = (this._itemCatIdx + 1) % cats.length;
        this._itemSelIdx = 0;
      }
      const icat = cats[this._itemCatIdx];
      if (input.wasJustPressed('arrowup')) {
        this._itemSelIdx = (this._itemSelIdx - 1 + icat.items.length) % icat.items.length;
      }
      if (input.wasJustPressed('arrowdown')) {
        this._itemSelIdx = (this._itemSelIdx + 1) % icat.items.length;
      }
      // Add item (Enter key)
      if (input.wasJustPressed('enter')) {
        const item = icat.items[this._itemSelIdx];
        if (item?.action) {
          item.action(this._game);
          this._itemFlash = 0.4;
          console.log(`[editor] added ${item.label} to cargo`);
        }
      }
    }

    // Decay flash timer
    if (this._itemFlash > 0) this._itemFlash -= _dt;

    // Place selected object at mouse cursor (Alt key)
    if (input.wasJustPressed('alt') && !this._itemMenuOpen) this._placeObject();

    // Open selected object in designer (Backspace key)
    if (input.wasJustPressed('backspace')) this._openInDesigner();

    // Scroll zoom (only in pan mode, so it doesn't fight game zoom)
    if (this._panMode && input.wheelDelta !== 0) {
      cam.zoom *= 1 - input.wheelDelta * 0.001;
      cam.zoom = Math.max(0.1, Math.min(2.0, cam.zoom));
    }
  }

  _placeObject() {
    const game  = this._game;
    const world = game.camera.screenToWorld(input.mouseScreen.x, input.mouseScreen.y);
    const cat   = this._barItems[this._catIdx];
    const item  = cat.items[this._itemIdx];
    if (!item) return;

    const entity = item.create(world.x, world.y);
    game.entities.push(entity);

    // Register in the unified ships list so AI runs
    if (entity.ai) {
      if (entity.homePosition === undefined) entity.homePosition = { x: world.x, y: world.y };
      if (entity.relation === 'hostile') entity.ai._aggro = true;
      game.ships.push(entity);
    }

    console.log(`[editor] placed ${item.label} at (${Math.round(world.x)}, ${Math.round(world.y)})`);
  }

  _quickSpawn(shipType) {
    const game  = this._game;
    const world = game.camera.screenToWorld(input.mouseScreen.x, input.mouseScreen.y);
    const ship  = createShip(shipType, world.x, world.y);
    ship.homePosition = { x: world.x, y: world.y };
    ship.ai._aggro = true;
    game.entities.push(ship);
    game.ships.push(ship);
    console.log(`[editor] spawned ${shipType} at (${Math.round(world.x)}, ${Math.round(world.y)})`);
  }

  _openInDesigner() {
    const cat  = this._barItems[this._catIdx];
    const item = cat.items[this._itemIdx];
    if (!item) return;
    const designerCat = DESIGNER_CAT[cat.label] ?? 'ships';
    const url = `/designer.html?category=${designerCat}&id=${item.id}`;
    window.open(url, '_blank');
  }

  // ── Render ────────────────────────────────────────────────────────────────

  render() {
    const game = this._game;
    const ctx  = game.ctx;

    // Canvas-only: debug overlay (world-space)
    if (this._debugMode > 0) this._renderDebugOverlay(ctx, game, this._debugMode);

    // DOM panels
    if (this._panMode) this._panBanner.show(); else this._panBanner.hide();

    if (this._barOpen) {
      this._sidebar.show();
      this._sidebar.update(this._barItems, this._catIdx, this._itemIdx);
    } else {
      this._sidebar.hide();
    }

    if (this._itemMenuOpen) {
      this._itemMenu.show();
      this._itemMenu.update(this._itemCats, this._itemCatIdx, this._itemSelIdx, this._itemFlash, this._game.inventory);
    } else {
      this._itemMenu.hide();
    }

    // HUD bar (always visible)
    const mapParam = new URLSearchParams(location.search).get('map') ?? 'test';
    const aiFrozen = this._game.aiDisabled;
    const segments = [
      { text: '[`: PAN]',      active: this._panMode  },
      { text: '[V: AI]',       active: aiFrozen, color: aiFrozen ? MAGENTA : undefined },
      { text: '[=: DEBUG]',    active: this._debugMode > 0 },
      { text: '[-: OBJECTS]',  active: this._barOpen  },
      { text: '[[: ITEMS]',    active: this._itemMenuOpen, color: this._itemMenuOpen ? AMBER : undefined },
      { text: '[Alt: PLACE]',  active: false },
      { text: '[Z/X/C: SPAWN]', active: false },
      { text: `[?map=${mapParam}]`, active: false },
    ];
    this._hudBar.update(segments);
  }

  // ── Debug overlay ─────────────────────────────────────────────────────────

  _renderDebugOverlay(ctx, game, mode) {
    const cam = game.camera;
    ctx.save();
    ctx.font = "10px 'Fira Mono', monospace";

    for (const entity of game.entities) {
      if (!entity.active) continue;
      if (entity.hullCurrent === undefined && entity.hull === undefined) continue;
      if (entity === game.player) continue;

      const s   = cam.worldToScreen(entity.x, entity.y);
      const ox  = s.x + 32;
      let   oy  = s.y - 40;

      const hull    = Math.round(entity.hullCurrent  ?? entity.hull    ?? 0);
      const hullMax = Math.round(entity.hullMax       ?? entity.hull    ?? 0);
      const speed   = Math.round(Math.hypot(entity.vx ?? 0, entity.vy ?? 0));
      const speedMax= Math.round(entity.speedMax ?? 0);
      const beh     = entity.ai?.combatBehavior ?? entity.ai?.passiveBehavior ?? '\u2014';
      const state   = entity.aiStatus      ?? '\u2014';

      // Armor arcs — show all 4 sides if available, else simple total
      const arcs    = entity.armorArcs    ?? null;
      const arcsMax = entity.armorArcsMax ?? null;
      const hasArcs = arcs && arcsMax;

      // Weapon loadout
      const weapons = entity.weapons ?? [];
      const wepLine = weapons.length
        ? weapons.map(w => w.displayName ?? w.constructor?.name ?? '?').join(', ')
        : '—';

      // Layout: calculate box height
      const wepWrapped = _wrapText(wepLine, 18); // wrap at ~18 chars
      const boxW = 126;

      ctx.globalAlpha = 0.6;
      ctx.textAlign = 'left';
      ctx.fillStyle = CYAN;
      ctx.fillText(`HP: ${hull}/${hullMax}`, ox, oy); oy += 14;

      if (hasArcs) {
        const fr = Math.round(arcs.front);     const frM = Math.round(arcsMax.front);
        const po = Math.round(arcs.port);      const poM = Math.round(arcsMax.port);
        const st = Math.round(arcs.starboard); const stM = Math.round(arcsMax.starboard);
        const af = Math.round(arcs.aft);       const afM = Math.round(arcsMax.aft);
        ctx.fillText(`AR(F): ${fr}/${frM}`,  ox, oy); oy += 14;
        ctx.fillText(`AR(P): ${po}/${poM}`,  ox, oy); oy += 14;
        ctx.fillText(`AR(S): ${st}/${stM}`,  ox, oy); oy += 14;
        ctx.fillText(`AR(A): ${af}/${afM}`,  ox, oy); oy += 14;
      } else {
        const armor    = Math.round(entity.armorCurrent ?? 0);
        const armorMax = Math.round(entity.armorMax     ?? 0);
        ctx.fillText(`ARM: ${armor}/${armorMax}`, ox, oy); oy += 14;
      }

      ctx.fillText(`SPD: ${speed}/${speedMax}`, ox, oy); oy += 14;
      ctx.fillStyle = AMBER;
      ctx.fillText(`BEH: ${beh}`,              ox, oy); oy += 14;
      ctx.fillText(`ST:  ${state}`,             ox, oy); oy += 14;

      ctx.fillStyle = GREEN;
      ctx.font = "9px 'Fira Mono', monospace";
      for (const ln of wepWrapped) {
        ctx.fillText(ln, ox, oy); oy += 13;
      }
      ctx.font = "10px 'Fira Mono', monospace";

      // Detailed layer
      if (mode === 2) {
        ctx.strokeStyle = 'rgba(0,200,220,0.35)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(ox - 2, oy + 2);
        ctx.lineTo(ox - 2 + boxW, oy + 2);
        ctx.stroke();
        oy += 10;

        ctx.fillStyle = 'rgba(200,200,200,0.55)';
        ctx.font = "10px 'Fira Mono', monospace";
        ctx.fillText(`ACC: ${(entity.acceleration ?? 0).toFixed(1)}`, ox, oy); oy += 14;
        ctx.fillText(`TRN: ${(entity.turnRate ?? 0).toFixed(3)} rad/s`, ox, oy); oy += 14;
        ctx.fillText(`THR: ${entity.throttleLevel ?? '--'}/${entity.throttleLevels ?? '--'}`, ox, oy); oy += 14;
        ctx.fillText(`WT:  --`, ox, oy); oy += 14;
        ctx.fillText(`THT: --`, ox, oy); oy += 14;

        if (entity._twRatio != null) {
          ctx.fillText(`T/W: ${entity._twRatio.toFixed(3)}`, ox, oy);
        }
      }

      ctx.globalAlpha = 1;

      // Velocity vector
      const vx = entity.vx ?? 0, vy = entity.vy ?? 0;
      const mag = Math.hypot(vx, vy);
      if (mag > 0.5 && speedMax > 0) {
        const scale = 40 / speedMax;
        const len   = Math.min(mag * scale, 50);
        ctx.strokeStyle = GREEN;
        ctx.lineWidth   = 1.5;
        ctx.beginPath();
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(s.x + (vx / mag) * len, s.y + (vy / mag) * len);
        ctx.stroke();
      }

      // Aim direction vector (rotation 0 = up)
      if (entity.rotation != null) {
        const aimLen = 50;
        ctx.strokeStyle = MAGENTA;
        ctx.lineWidth   = 1;
        ctx.beginPath();
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(
          s.x + Math.sin(entity.rotation)  * aimLen,
          s.y + (-Math.cos(entity.rotation)) * aimLen,
        );
        ctx.stroke();
      }
    }

    // Cursor world coordinates
    const ms    = input.mouseScreen;
    const mw    = game.camera.screenToWorld(ms.x, ms.y);
    const coordX = Math.round(mw.x);
    const coordY = Math.round(mw.y);
    ctx.font      = "10px 'Fira Mono', monospace";
    ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(80,120,180,0.55)';
    ctx.fillText(`${coordX}, ${coordY}`, ms.x, ms.y - 14);

    ctx.restore();
  }

}

// Wrap a string to maxLen characters per line
function _wrapText(text, maxLen) {
  if (text.length <= maxLen) return [text];
  const lines = [];
  let remaining = text;
  while (remaining.length > maxLen) {
    lines.push(remaining.slice(0, maxLen));
    remaining = remaining.slice(maxLen);
  }
  if (remaining.length) lines.push(remaining);
  return lines;
}
