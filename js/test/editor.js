// EditorOverlay — live map viewer drawn on top of a running GameManager.
// Philosophy: code-first. Edit map files in your editor; Vite HMR reloads.
// This overlay adds pan/zoom, per-entity debug stats, and an object sidebar
// for temporary entity placement (position scouting — coords logged to console).

import { input } from '../input.js';
import { SHIP_REGISTRY, NPC_REGISTRY } from '../ships/registry.js';
import { STATION_REGISTRY } from '../world/stationRegistry.js';
import { createDerelict } from '../world/derelict.js';
import {
  CYAN, AMBER, GREEN, RED, MAGENTA, WHITE,
  PANEL_BG, DIM_TEXT, DIM_OUTLINE,
} from '../ui/colors.js';

const SIDEBAR_W = 240;

// Map editor category label → designer category id
const DESIGNER_CAT = { SHIPS: 'ships', NPCS: 'ships', STATIONS: 'stations', DERELICTS: 'derelicts' };

export class EditorOverlay {
  constructor(game) {
    this._game     = game;
    this._panMode  = false;
    this._debugMode = false;
    this._barOpen  = false;
    this._catIdx   = 0;
    this._itemIdx  = 0;
    this._barItems = this._buildBarItems();

    // Suppress the game's test-mode dev panel (top-right) in editor
    game.isEditorMode = true;
  }

  // ── Registry ──────────────────────────────────────────────────────────────

  _buildBarItems() {
    const npcItems = NPC_REGISTRY.map(n => ({
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

  update(dt) {
    const game = this._game;
    const cam  = game.camera;

    // Toggle pan mode (grave/tilde key)
    if (input.wasJustPressed('`')) {
      this._panMode = !this._panMode;
      game.isPanMode = this._panMode;
    }

    // Toggle debug overlay (= key)
    if (input.wasJustPressed('=')) this._debugMode = !this._debugMode;

    // Toggle object sidebar (- key)
    if (input.wasJustPressed('-')) this._barOpen = !this._barOpen;

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

    // Weapon cycling (player must exist)
    if (game.player) {
      if (input.wasJustPressed('[')) game.player.cyclePrimary(-1);
      if (input.wasJustPressed(']')) game.player.cyclePrimary(1);
      if (input.wasJustPressed('{')) game.player.cycleSecondary(-1);
      if (input.wasJustPressed('}')) game.player.cycleSecondary(1);
    }

    // Place selected object at mouse cursor (Alt key)
    if (input.wasJustPressed('alt')) this._placeObject();

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
      if (entity.relation === 'hostile') entity._aggro = true;
      game.ships.push(entity);
    }

    console.log(`[editor] placed ${item.label} at (${Math.round(world.x)}, ${Math.round(world.y)})`);
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
    const W    = game.canvas.width;
    const H    = game.canvas.height;

    if (this._panMode)   this._renderPanBanner(ctx, W);
    if (this._debugMode) this._renderDebugOverlay(ctx, game);
    if (this._barOpen)   this._renderSidebar(ctx, W, H);
    this._renderHUDBar(ctx, W, H);
  }

  // ── Pan mode banner ───────────────────────────────────────────────────────

  _renderPanBanner(ctx, W) {
    const bw = 300, bh = 28;
    const bx = W / 2 - bw / 2;
    ctx.save();
    ctx.fillStyle = PANEL_BG;
    ctx.fillRect(bx, 8, bw, bh);
    ctx.strokeStyle = MAGENTA;
    ctx.lineWidth = 1;
    ctx.strokeRect(bx, 8, bw, bh);
    ctx.font = 'bold 12px monospace';
    ctx.textAlign = 'center';
    ctx.fillStyle = MAGENTA;
    ctx.fillText('PAN MODE  \u2014  ` to exit  \u2014  scroll to zoom', W / 2, 28);
    ctx.restore();
  }

  // ── Debug overlay ─────────────────────────────────────────────────────────

  _renderDebugOverlay(ctx, game) {
    const cam = game.camera;
    ctx.save();
    ctx.font = '10px monospace';

    for (const entity of game.entities) {
      if (!entity.active) continue;
      if (entity.hullCurrent === undefined && entity.hull === undefined) continue;
      if (entity === game.player) continue;

      const s   = cam.worldToScreen(entity.x, entity.y);
      const ox  = s.x + 16;
      let   oy  = s.y - 24;

      const hull    = Math.round(entity.hullCurrent  ?? entity.hull    ?? 0);
      const hullMax = Math.round(entity.hullMax       ?? entity.hull    ?? 0);
      const speed   = Math.round(Math.hypot(entity.vx ?? 0, entity.vy ?? 0));
      const speedMax= Math.round(entity.speed ?? 0);
      const beh     = entity.ai?.combatBehavior ?? entity.ai?.passiveBehavior ?? '\u2014';
      const state   = entity.aiState      ?? '\u2014';

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
      const armorLines = hasArcs ? 4 : 1;
      const totalLines = 2 + armorLines + 1 + 2; // hull, armor×N, speed, beh, state
      const wepWrapped = _wrapText(wepLine, 18); // wrap at ~18 chars
      const boxH = (totalLines + wepWrapped.length) * 14 + 8;
      const boxW = 126;

      ctx.fillStyle = 'rgba(0,8,16,0.80)';
      ctx.fillRect(ox - 2, oy - 12, boxW, boxH);

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
      ctx.font = '9px monospace';
      for (const ln of wepWrapped) {
        ctx.fillText(ln, ox, oy); oy += 13;
      }
      ctx.font = '10px monospace';

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

    ctx.restore();
  }

  // ── Object sidebar ────────────────────────────────────────────────────────

  _renderSidebar(ctx, W, H) {
    const x   = W - SIDEBAR_W;
    const cat = this._barItems[this._catIdx];
    const items = cat.items;

    ctx.save();

    // Panel background
    ctx.fillStyle = 'rgba(0,6,14,0.94)';
    ctx.fillRect(x, 0, SIDEBAR_W, H);
    ctx.strokeStyle = CYAN;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, H);
    ctx.stroke();

    // Category header
    ctx.font = '10px monospace';
    ctx.textAlign = 'left';
    ctx.fillStyle = DIM_TEXT;
    ctx.fillText('\u2190/\u2192 CATEGORY', x + 10, 22);

    ctx.font = 'bold 13px monospace';
    ctx.fillStyle = CYAN;
    ctx.fillText(cat.label, x + 10, 42);

    // Category indicator dots
    for (let i = 0; i < this._barItems.length; i++) {
      ctx.fillStyle = i === this._catIdx ? CYAN : DIM_TEXT;
      ctx.beginPath();
      ctx.arc(x + 10 + i * 14, 54, 3, 0, Math.PI * 2);
      ctx.fill();
    }

    // Divider
    ctx.strokeStyle = DIM_OUTLINE;
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.moveTo(x + 8, 64);
    ctx.lineTo(x + SIDEBAR_W - 8, 64);
    ctx.stroke();

    // Item list
    ctx.font = '11px monospace';
    const itemH      = 22;
    const listTop    = 72;
    const maxVisible = Math.floor((H - listTop - 52) / itemH);
    const scrollOff  = Math.max(0, this._itemIdx - Math.floor(maxVisible / 2));

    for (let i = scrollOff; i < Math.min(items.length, scrollOff + maxVisible); i++) {
      const item       = items[i];
      const iy         = listTop + (i - scrollOff) * itemH;
      const isSelected = i === this._itemIdx;

      if (isSelected) {
        ctx.fillStyle   = 'rgba(0,255,204,0.08)';
        ctx.fillRect(x + 4, iy - 14, SIDEBAR_W - 8, itemH);
        ctx.strokeStyle = CYAN;
        ctx.lineWidth   = 0.5;
        ctx.strokeRect(x + 4, iy - 14, SIDEBAR_W - 8, itemH);
      }

      ctx.fillStyle = isSelected ? CYAN : DIM_TEXT;
      ctx.textAlign = 'left';
      ctx.fillText(item.label, x + 12, iy);

      // Faction color dot
      if (item.faction) {
        const dotColors = { player: GREEN, neutral: AMBER, scavenger: RED };
        ctx.fillStyle = dotColors[item.faction] ?? WHITE;
        ctx.beginPath();
        ctx.arc(x + SIDEBAR_W - 14, iy - 5, 3, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Selected item stats
    const selItem = items[this._itemIdx];
    if (selItem) {
      const sy = H - 70;
      ctx.strokeStyle = DIM_OUTLINE;
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.moveTo(x + 8, sy);
      ctx.lineTo(x + SIDEBAR_W - 8, sy);
      ctx.stroke();

      ctx.font = '10px monospace';
      ctx.fillStyle = DIM_TEXT;
      ctx.textAlign = 'left';
      ctx.fillText(selItem.stats ?? '', x + 10, sy + 14);
    }

    // Hint row at bottom
    ctx.font = '10px monospace';
    ctx.fillStyle = DIM_TEXT;
    ctx.textAlign = 'left';
    ctx.fillText('\u2191/\u2193 select   Alt: place', x + 10, H - 36);
    ctx.fillText('Bksp: open in designer', x + 10, H - 22);

    ctx.restore();
  }

  // ── Bottom HUD bar ────────────────────────────────────────────────────────

  _renderHUDBar(ctx, W, H) {
    const barH   = 22;
    const barY   = H - barH;
    const barW   = this._barOpen ? W - SIDEBAR_W : W;

    ctx.save();
    ctx.fillStyle = 'rgba(0,6,14,0.92)';
    ctx.fillRect(0, barY, barW, barH);
    ctx.strokeStyle = DIM_OUTLINE;
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.moveTo(0, barY);
    ctx.lineTo(barW, barY);
    ctx.stroke();

    const mapParam = new URLSearchParams(location.search).get('map') ?? 'test';
    const player = this._game.player;
    const priName = player
      ? (player._primaryWeapons[player.primaryWeaponIdx]?.displayName ?? '—')
      : '—';
    const secName = player
      ? (player._secondaryWeapons[player.secondaryWeaponIdx]?.displayName ?? '—')
      : '—';
    const segments = [
      { text: '[`: PAN]',      active: this._panMode  },
      { text: '[=: DEBUG]',    active: this._debugMode },
      { text: '[-: OBJECTS]',  active: this._barOpen  },
      { text: '[Alt: PLACE]',  active: false },
      { text: `[PRI: < ${priName} >]`,  active: false, color: CYAN },
      { text: `[SEC: < ${secName} >]`,  active: false, color: CYAN },
      { text: `[?map=${mapParam}]`, active: false },
    ];

    ctx.font = '10px monospace';
    ctx.textAlign = 'left';
    let cx = 10;
    for (const seg of segments) {
      ctx.fillStyle = seg.active ? CYAN : (seg.color ?? DIM_TEXT);
      ctx.fillText(seg.text, cx, barY + 15);
      cx += ctx.measureText(seg.text).width + 14;
    }

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
