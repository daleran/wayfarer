import { HULL_POINTS } from '../ships/classes/onyxTug.js';
import {
  CYAN, AMBER, GREEN, RED, WHITE, MAGENTA,
  DIM_OUTLINE, DIM_TEXT, VERY_DIM,
  armorArcColor, conditionColor,
} from './colors.js';

export class ShipScreen {
  constructor() {
    this.visible = false;
    this._slotRects      = [];   // [{slotIdx, x1, y1, x2, y2}]
    this._cargoModRects  = [];   // [{moduleIdx, x1, y1, x2, y2}]
    this._selectedCargoModIdx = null;
    this._installing        = false;
    this._installProgress   = 0;
    this._installModuleIdx  = null;
    this._installTargetSlot = null;
    this._prevClick         = false;
    this._mx = 0;
    this._my = 0;
  }

  open()   { this.visible = true; }
  close()  { this.visible = false; this._cancelInstall(); }
  toggle() { this.visible ? this.close() : this.open(); }

  _cancelInstall() {
    this._installing        = false;
    this._installProgress   = 0;
    this._installModuleIdx  = null;
    this._installTargetSlot = null;
    this._selectedCargoModIdx = null;
  }

  update(dt, game) {
    if (!this._installing) return;
    this._installProgress += dt;
    if (this._installProgress >= 1.5) {
      const mod = game.modules.splice(this._installModuleIdx, 1)[0];
      game.player.moduleSlots[this._installTargetSlot] = mod;
      if (mod.onInstall) mod.onInstall(game.player);
      this._cancelInstall();
    }
  }

  handleInput(input, game) {
    if (!this.visible) return;

    // Always track mouse for hover
    this._mx = input.mouseScreen.x;
    this._my = input.mouseScreen.y;

    const clicked = input.wasJustClicked();
    if (!clicked) { this._prevClick = false; return; }
    if (this._prevClick) return;
    this._prevClick = true;

    if (this._installing) return;

    const mx = this._mx;
    const my = this._my;

    // Check installed module slots
    for (const sr of this._slotRects) {
      if (mx >= sr.x1 && mx <= sr.x2 && my >= sr.y1 && my <= sr.y2) {
        const slot = game.player.moduleSlots[sr.slotIdx];
        if (!slot && this._selectedCargoModIdx !== null) {
          // Install selected cargo mod into this empty slot
          this._installTargetSlot = sr.slotIdx;
          this._installModuleIdx  = this._selectedCargoModIdx;
          this._installing        = true;
          this._installProgress   = 0;
          this._selectedCargoModIdx = null;
        } else if (slot) {
          // Remove installed mod back to cargo
          if (slot.onRemove) slot.onRemove(game.player);
          game.modules.push(slot);
          game.player.moduleSlots[sr.slotIdx] = null;
        }
        return;
      }
    }

    // Check cargo module pills (right column)
    for (const cr of this._cargoModRects) {
      if (mx >= cr.x1 && mx <= cr.x2 && my >= cr.y1 && my <= cr.y2) {
        // Toggle selection
        this._selectedCargoModIdx =
          this._selectedCargoModIdx === cr.moduleIdx ? null : cr.moduleIdx;
        return;
      }
    }

    // Click elsewhere — deselect
    this._selectedCargoModIdx = null;
  }

  render(ctx, game) {
    if (!this.visible || !game.player) return;
    const W = game.camera.width;
    const H = game.camera.height;
    const player = game.player;

    ctx.save();

    // Full-screen overlay
    ctx.fillStyle = 'rgba(0,6,14,0.93)';
    ctx.fillRect(0, 0, W, H);

    const M = 40;
    ctx.strokeStyle = DIM_OUTLINE;
    ctx.lineWidth = 1;
    ctx.strokeRect(M, M, W - M * 2, H - M * 2);

    // Header
    ctx.font = 'bold 13px monospace';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillStyle = CYAN;
    ctx.fillText('SHIP STATUS', M + 20, M + 16);

    ctx.textAlign = 'right';
    ctx.fillStyle = DIM_TEXT;
    ctx.fillText('HULLBREAKER  ·  Onyx-Class Tug [Salvage Modified]', W - M - 20, M + 16);

    const contentY = M + 44;
    const contentH = H - M * 2 - 44;
    const colW = (W - M * 2) / 3;

    // Column dividers
    ctx.strokeStyle = VERY_DIM;
    ctx.lineWidth = 1;
    for (const col of [1, 2]) {
      ctx.beginPath();
      ctx.moveTo(M + colW * col, contentY);
      ctx.lineTo(M + colW * col, H - M);
      ctx.stroke();
    }

    // Header divider
    ctx.beginPath();
    ctx.moveTo(M, contentY);
    ctx.lineTo(W - M, contentY);
    ctx.stroke();

    this._renderStats(ctx, game, M + 18, contentY + 16, colW - 24);
    this._renderPaperDoll(ctx, game, M + colW, contentY, colW, contentH);
    this._renderCargo(ctx, game, M + colW * 2 + 18, contentY + 16, colW - 24);

    // Tooltip (drawn last, on top)
    this._renderTooltip(ctx, game, W, H);

    // Close hint
    ctx.font = '11px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.fillStyle = DIM_TEXT;
    const hasEmpty = (game.player.moduleSlots || []).some(s => !s);
    const hint = hasEmpty && game.modules.length > 0
      ? '[I]/[ESC] close  ·  select cargo module → click empty slot to install  ·  click installed module to remove'
      : '[I]/[ESC] close  ·  click installed module to remove';
    ctx.fillText(hint, W / 2, H - M - 10);

    ctx.restore();
  }

  _renderStats(ctx, game, x, y, w) {
    const player = game.player;
    const lineH = 18;
    let row = y;
    this._slotRects = [];

    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';

    // Section: Hull
    ctx.font = 'bold 10px monospace';
    ctx.fillStyle = DIM_TEXT;
    ctx.fillText('HULL', x, row);
    row += 14;

    ctx.font = '11px monospace';
    const hullRatio = player.hullCurrent / player.hullMax;
    const hullColor = hullRatio > 0.5 ? GREEN : hullRatio > 0.25 ? AMBER : RED;
    ctx.fillStyle = hullColor;
    ctx.fillText(`${Math.round(player.hullCurrent)} / ${Math.round(player.hullMax)}`, x + 8, row);
    row += lineH + 4;

    // Section: Armor arcs
    ctx.font = 'bold 10px monospace';
    ctx.fillStyle = DIM_TEXT;
    ctx.fillText('ARMOR', x, row);
    row += 14;

    ctx.font = '11px monospace';
    for (const [arc, label] of [['front', 'F:'], ['port', 'P:'], ['starboard', 'S:'], ['aft', 'A:']]) {
      const cur = player.armorArcs[arc];
      const max = player.armorArcsMax[arc];
      const ratio = max > 0 ? cur / max : 0;
      ctx.fillStyle = DIM_TEXT;
      ctx.fillText(`  ${label}`, x + 8, row);
      ctx.fillStyle = armorArcColor(ratio);
      ctx.fillText(`${Math.round(cur)} / ${Math.round(max)}`, x + 36, row);
      row += lineH;
    }
    row += 6;

    // Section: Drive
    ctx.font = 'bold 10px monospace';
    ctx.fillStyle = DIM_TEXT;
    ctx.fillText('DRIVE', x, row);
    row += 14;

    ctx.font = '11px monospace';
    ctx.fillStyle = DIM_TEXT;
    ctx.fillText('  SPEED:', x + 8, row);
    ctx.fillStyle = CYAN;
    ctx.fillText(`${Math.round(player.speedMax)} u/s`, x + 68, row);
    row += lineH;

    const fuelRatio = game.fuel / game.fuelMax;
    const fuelColor = fuelRatio < 0.25 ? RED : AMBER;
    ctx.fillStyle = DIM_TEXT;
    ctx.fillText('  FUEL:', x + 8, row);
    ctx.fillStyle = fuelColor;
    ctx.fillText(`${Math.floor(game.fuel)} / ${game.fuelMax}`, x + 68, row);
    row += lineH + 6;

    // Section: Economy
    ctx.font = 'bold 10px monospace';
    ctx.fillStyle = DIM_TEXT;
    ctx.fillText('ECONOMY', x, row);
    row += 14;

    ctx.font = '11px monospace';
    ctx.fillStyle = DIM_TEXT;
    ctx.fillText('  SCRAP:', x + 8, row);
    ctx.fillStyle = AMBER;
    const scrapUnits = Math.floor(game.scrap / 20);
    ctx.fillText(`${game.scrap}  (${scrapUnits}u cargo)`, x + 68, row);
    row += lineH + 10;

    // Section: Modules (installed slots)
    const slots = player.moduleSlots || [];
    let totalPowerOut = 0;
    let totalPowerDraw = 0;
    let totalFuelDrain = 0;
    for (const mod of slots) {
      if (!mod) continue;
      totalPowerOut  += (mod.effectivePowerOutput ?? mod.powerOutput) || 0;
      totalPowerDraw += mod.powerDraw     || 0;
      totalFuelDrain += mod.fuelDrainRate || 0;
    }
    const powerNet = totalPowerOut - totalPowerDraw;

    ctx.font = 'bold 10px monospace';
    ctx.fillStyle = CYAN;
    ctx.fillText('MODULES', x, row);

    ctx.textAlign = 'right';
    ctx.fillStyle = powerNet >= 0 ? GREEN : RED;
    ctx.font = '10px monospace';
    ctx.fillText(`${powerNet >= 0 ? '+' : ''}${powerNet}W`, x + w, row);
    ctx.textAlign = 'left';

    row += 12;
    ctx.font = '9px monospace';
    ctx.fillStyle = VERY_DIM;
    ctx.fillText(`idle burn: ${totalFuelDrain.toFixed(3)} fuel/s`, x + 2, row);
    row += 14;

    const slotH = 44;
    ctx.font = '10px monospace';
    for (let i = 0; i < slots.length; i++) {
      const mod = slots[i];
      const isInstalling = this._installTargetSlot === i && this._installing;
      const isHovered = this._isHoveringSlot(i);
      const hasSelectedCargo = this._selectedCargoModIdx !== null;

      // Border
      ctx.strokeStyle = isInstalling ? GREEN
        : isHovered ? CYAN
        : (!mod && hasSelectedCargo) ? GREEN
        : DIM_OUTLINE;
      ctx.lineWidth = (isInstalling || isHovered || (!mod && hasSelectedCargo)) ? 1.5 : 1;
      ctx.strokeRect(x, row, w, slotH);

      // Slot background hint when ready to receive
      if (!mod && hasSelectedCargo && !isInstalling) {
        ctx.fillStyle = 'rgba(0,255,102,0.05)';
        ctx.fillRect(x + 1, row + 1, w - 2, slotH - 2);
      }

      this._slotRects.push({ slotIdx: i, x1: x, y1: row, x2: x + w, y2: row + slotH });

      if (isInstalling) {
        const prog = Math.min(this._installProgress / 1.5, 1);
        ctx.fillStyle = 'rgba(0,255,102,0.08)';
        ctx.fillRect(x + 1, row + 1, (w - 2) * prog, slotH - 2);
        ctx.fillStyle = GREEN;
        ctx.textAlign = 'center';
        ctx.fillText('INSTALLING...', x + w / 2, row + 16);
        const barY = row + slotH - 10;
        ctx.fillStyle = VERY_DIM;
        ctx.fillRect(x + 4, barY, w - 8, 4);
        ctx.fillStyle = GREEN;
        ctx.fillRect(x + 4, barY, (w - 8) * prog, 4);
        ctx.textAlign = 'left';
      } else if (mod) {
        // Name
        ctx.fillStyle = CYAN;
        ctx.fillText(`[${i + 1}] ${mod.displayName}`, x + 6, row + 6);

        // Condition badge (below name, only if not 'good')
        if (mod.condition && mod.condition !== 'good') {
          ctx.font = '9px monospace';
          ctx.fillStyle = conditionColor(mod.condition);
          ctx.fillText(mod.condition.toUpperCase(), x + 8, row + 18);
          ctx.font = '10px monospace';
        }

        // Power / fuel stats right-aligned
        ctx.textAlign = 'right';
        const effOut = mod.effectivePowerOutput ?? mod.powerOutput;
        if (effOut > 0) {
          ctx.fillStyle = mod.isOverdue ? MAGENTA : GREEN;
          ctx.fillText(`+${effOut}W${mod.isOverdue ? ' !' : ''}`, x + w - 4, row + 6);
        } else if (mod.powerDraw > 0) {
          ctx.fillStyle = AMBER;
          ctx.fillText(`-${mod.powerDraw}W`, x + w - 4, row + 6);
        }
        if (mod.fuelDrainRate > 0) {
          ctx.fillStyle = fuelRatio < 0.25 ? RED : AMBER;
          ctx.fillText(`${mod.fuelDrainRate.toFixed(3)}/s`, x + w - 4, row + 20);
        }
        ctx.textAlign = 'left';

        // Description (shifted down if condition badge shown)
        if (mod.description) {
          ctx.fillStyle = VERY_DIM;
          ctx.font = '9px monospace';
          const descY = (mod.condition && mod.condition !== 'good') ? row + 28 : row + 24;
          ctx.fillText(mod.description, x + 8, descY);
          ctx.font = '10px monospace';
        }

        // Remove hint
        ctx.textAlign = 'right';
        ctx.fillStyle = VERY_DIM;
        ctx.font = '9px monospace';
        ctx.fillText('[click to remove]', x + w - 4, row + 34);
        ctx.font = '10px monospace';
        ctx.textAlign = 'left';
      } else {
        // Empty slot
        if (hasSelectedCargo) {
          ctx.fillStyle = GREEN;
          ctx.fillText(`[${i + 1}] ── CLICK TO INSTALL ──`, x + 6, row + 16);
        } else {
          ctx.fillStyle = VERY_DIM;
          ctx.fillText(`[${i + 1}] ─── EMPTY ───`, x + 6, row + 16);
        }
      }
      row += slotH + 3;
    }
  }

  _isHoveringSlot(idx) {
    const sr = this._slotRects[idx];
    if (!sr) return false;
    return this._mx >= sr.x1 && this._mx <= sr.x2 &&
           this._my >= sr.y1 && this._my <= sr.y2;
  }

  _isHoveringCargoMod(idx) {
    const cr = this._cargoModRects[idx];
    if (!cr) return false;
    return this._mx >= cr.x1 && this._mx <= cr.x2 &&
           this._my >= cr.y1 && this._my <= cr.y2;
  }

  _renderPaperDoll(ctx, game, x, y, w, h) {
    const player = game.player;
    const cx = x + w / 2;
    const cy = y + h * 0.42;
    const SCALE = 4;

    ctx.font = 'bold 10px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillStyle = DIM_TEXT;
    ctx.fillText('PAPER DOLL', cx, y + 16);

    const hullRatio = player.hullCurrent / player.hullMax;
    const hullColor = hullRatio > 0.5 ? GREEN : hullRatio > 0.25 ? AMBER : RED;

    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(SCALE, SCALE);
    ctx.beginPath();
    ctx.moveTo(HULL_POINTS[0].x, HULL_POINTS[0].y);
    for (let i = 1; i < HULL_POINTS.length; i++) {
      ctx.lineTo(HULL_POINTS[i].x, HULL_POINTS[i].y);
    }
    ctx.closePath();
    ctx.fillStyle = hullColor;
    ctx.globalAlpha = 0.12;
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.strokeStyle = hullColor;
    ctx.lineWidth = 1.5 / SCALE;
    ctx.stroke();
    ctx.restore();

    const GAP = 0.10;
    const R = 145;
    const TH = 14;
    const ARC_R = R - TH / 2;
    const arcDefs = [
      { key: 'front',     a0: -Math.PI * 3/4 + GAP, a1: -Math.PI/4 - GAP },
      { key: 'starboard', a0: -Math.PI/4 + GAP,      a1:  Math.PI/4 - GAP },
      { key: 'aft',       a0:  Math.PI/4 + GAP,      a1:  Math.PI * 3/4 - GAP },
      { key: 'port',      a0:  Math.PI * 3/4 + GAP,  a1:  Math.PI * 5/4 - GAP },
    ];

    ctx.lineWidth = TH;
    ctx.lineCap = 'butt';
    for (const { key, a0, a1 } of arcDefs) {
      const max = player.armorArcsMax[key];
      const cur = player.armorArcs[key];
      const ratio = max > 0 ? cur / max : 0;
      const color = armorArcColor(ratio);
      ctx.strokeStyle = VERY_DIM;
      ctx.beginPath();
      ctx.arc(cx, cy, ARC_R, a0, a1);
      ctx.stroke();
      if (ratio > 0) {
        const fillEnd = a0 + (a1 - a0) * ratio;
        ctx.strokeStyle = color;
        ctx.beginPath();
        ctx.arc(cx, cy, ARC_R, a0, fillEnd);
        ctx.stroke();
      }
    }
    ctx.lineCap = 'butt';

    const LABEL_R = R + 12;
    const arcMids = [
      { key: 'front',     angle: -Math.PI / 2, label: 'F', ax: 'center', yDir: -1 },
      { key: 'starboard', angle:  0,            label: 'S', ax: 'left',   yDir:  0 },
      { key: 'aft',       angle:  Math.PI / 2,  label: 'A', ax: 'center', yDir:  1 },
      { key: 'port',      angle:  Math.PI,       label: 'P', ax: 'right',  yDir:  0 },
    ];

    for (const { key, angle, label, ax, yDir } of arcMids) {
      const cur   = player.armorArcs[key];
      const max   = player.armorArcsMax[key];
      const ratio = max > 0 ? cur / max : 0;
      const color = ratio > 0 ? armorArcColor(ratio) : VERY_DIM;

      const lx = cx + Math.cos(angle) * LABEL_R;
      const ly = cy + Math.sin(angle) * LABEL_R;

      ctx.textAlign    = ax;
      ctx.textBaseline = 'middle';

      ctx.font      = 'bold 9px monospace';
      ctx.fillStyle = color;
      ctx.globalAlpha = 0.85;
      const letterY = yDir !== 0 ? ly - yDir * 8 : ly - 7;
      const valY    = yDir !== 0 ? ly + yDir * 4  : ly + 7;
      ctx.fillText(label, lx, letterY);

      ctx.font      = '9px monospace';
      ctx.fillStyle = color;
      ctx.globalAlpha = 0.7;
      ctx.fillText(`${Math.round(cur)}/${Math.round(max)}`, lx, valY);

      ctx.globalAlpha = 1;
    }

    const barW = 120;
    const barH = 6;
    const bx = cx - barW / 2;
    const barY = cy + R + 44;
    ctx.fillStyle = VERY_DIM;
    ctx.fillRect(bx, barY, barW, barH);
    ctx.fillStyle = hullColor;
    ctx.fillRect(bx, barY, barW * hullRatio, barH);
    ctx.strokeStyle = hullColor;
    ctx.lineWidth = 1;
    ctx.strokeRect(bx, barY, barW, barH);

    ctx.font = '10px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillStyle = hullColor;
    ctx.fillText(`HULL  ${Math.round(player.hullCurrent)} / ${Math.round(player.hullMax)}`, cx, barY + 10);
  }

  _renderCargo(ctx, game, x, y, w) {
    const lineH = 18;
    let row = y;

    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';

    // Cargo Bay
    ctx.font = 'bold 10px monospace';
    ctx.fillStyle = DIM_TEXT;
    ctx.fillText('CARGO BAY', x, row);
    row += 20;

    ctx.font = '11px monospace';

    const items = [];
    const scrapUnits = Math.floor(game.scrap / 20);
    if (game.scrap > 0) {
      items.push({ label: 'SCRAP', amount: game.scrap, suffix: `(${scrapUnits}u)`, color: AMBER });
    }
    for (const [key, amt] of Object.entries(game.cargo)) {
      if (amt > 0) {
        items.push({ label: key.toUpperCase(), amount: amt, suffix: '', color: AMBER });
      }
    }

    if (items.length === 0) {
      ctx.fillStyle = VERY_DIM;
      ctx.fillText('  — empty —', x + 8, row);
      row += lineH;
    } else {
      for (const item of items) {
        ctx.fillStyle = DIM_TEXT;
        ctx.fillText(item.label, x + 8, row);
        ctx.textAlign = 'right';
        ctx.fillStyle = item.color;
        const valStr = item.suffix ? `${item.amount}  ${item.suffix}` : `${item.amount}`;
        ctx.fillText(valStr, x + w - 4, row);
        ctx.textAlign = 'left';
        row += lineH;
      }
    }

    row += 8;
    ctx.strokeStyle = VERY_DIM;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x, row);
    ctx.lineTo(x + w - 4, row);
    ctx.stroke();
    row += 10;

    const used = game.totalCargoUsed;
    const cap  = game.totalCargoCapacity;
    const cargoColor = used >= cap ? RED : CYAN;
    ctx.fillStyle = DIM_TEXT;
    ctx.fillText('CAPACITY', x + 8, row);
    ctx.textAlign = 'right';
    ctx.fillStyle = cargoColor;
    ctx.fillText(`${used} / ${cap}`, x + w - 4, row);
    ctx.textAlign = 'left';
    row += lineH;

    const barW = w - 4;
    const barH = 6;
    const ratio = cap > 0 ? used / cap : 0;
    ctx.fillStyle = VERY_DIM;
    ctx.fillRect(x, row, barW, barH);
    if (ratio > 0) {
      ctx.fillStyle = cargoColor;
      ctx.fillRect(x, row, barW * Math.min(ratio, 1), barH);
    }
    ctx.strokeStyle = cargoColor;
    ctx.lineWidth = 1;
    ctx.strokeRect(x, row, barW, barH);
    row += lineH + 14;

    // Uninstalled modules — selectable for install
    this._cargoModRects = [];
    if (game.modules && game.modules.length > 0) {
      const hasEmptySlot = (game.player.moduleSlots || []).some(s => !s);

      ctx.font = 'bold 10px monospace';
      ctx.fillStyle = CYAN;
      ctx.fillText('MODULES (CARGO)', x, row);
      if (hasEmptySlot) {
        ctx.textAlign = 'right';
        ctx.fillStyle = VERY_DIM;
        ctx.font = '9px monospace';
        ctx.fillText('select to install', x + w - 4, row + 2);
        ctx.textAlign = 'left';
        ctx.font = '10px monospace';
      }
      row += 16;

      const pillH = 46;
      for (let mi = 0; mi < game.modules.length; mi++) {
        const m = game.modules[mi];
        const isSelected = this._selectedCargoModIdx === mi;
        const isHovered  = this._isHoveringCargoMod(mi);

        ctx.strokeStyle = isSelected ? GREEN : isHovered ? CYAN : DIM_OUTLINE;
        ctx.lineWidth   = isSelected || isHovered ? 1.5 : 1;
        if (isSelected) {
          ctx.fillStyle = 'rgba(0,255,102,0.07)';
          ctx.fillRect(x + 1, row + 1, w - 2, pillH - 2);
        }
        ctx.strokeRect(x, row, w, pillH);

        // Name
        ctx.fillStyle = isSelected ? GREEN : CYAN;
        ctx.font = '10px monospace';
        ctx.fillText(m.displayName, x + 6, row + 6);

        // Condition badge
        if (m.condition && m.condition !== 'good') {
          ctx.font = '9px monospace';
          ctx.fillStyle = conditionColor(m.condition);
          ctx.fillText(m.condition.toUpperCase(), x + 8, row + 18);
          ctx.font = '10px monospace';
        }

        // Power stat right-aligned
        ctx.textAlign = 'right';
        if (m.powerOutput > 0) {
          ctx.fillStyle = GREEN;
          ctx.fillText(`+${m.powerOutput}W`, x + w - 4, row + 6);
        } else if (m.powerDraw > 0) {
          ctx.fillStyle = AMBER;
          ctx.fillText(`-${m.powerDraw}W`, x + w - 4, row + 6);
        }
        if (m.fuelDrainRate > 0) {
          ctx.fillStyle = AMBER;
          ctx.fillText(`${m.fuelDrainRate.toFixed(3)}/s fuel`, x + w - 4, row + 20);
        }
        ctx.textAlign = 'left';

        // Description (shifted down if condition badge shown)
        if (m.description) {
          ctx.fillStyle = VERY_DIM;
          ctx.font = '9px monospace';
          const descY = (m.condition && m.condition !== 'good') ? row + 28 : row + 24;
          ctx.fillText(m.description, x + 8, descY);
          ctx.font = '10px monospace';
        }

        // Action hint
        ctx.textAlign = 'right';
        ctx.fillStyle = isSelected ? GREEN : VERY_DIM;
        ctx.font = '9px monospace';
        ctx.fillText(isSelected ? '[click empty slot]' : '[click to select]', x + w - 4, row + 36);
        ctx.font = '10px monospace';
        ctx.textAlign = 'left';

        this._cargoModRects.push({ moduleIdx: mi, x1: x, y1: row, x2: x + w, y2: row + pillH });
        row += pillH + 3;
      }
      row += 6;
    } else {
      this._cargoModRects = [];
    }

    // Weapons (cargo) — read-only list of unequipped weapons from loot
    if (game.weapons && game.weapons.length > 0) {
      ctx.font = 'bold 10px monospace';
      ctx.fillStyle = MAGENTA;
      ctx.fillText('WEAPONS (CARGO)', x, row);
      row += 16;

      ctx.font = '10px monospace';
      for (const wep of game.weapons) {
        ctx.fillStyle = CYAN;
        ctx.fillText(wep.displayName || wep.constructor.name, x + 6, row);
        ctx.textAlign = 'right';
        ctx.fillStyle = VERY_DIM;
        ctx.fillText(wep.isSecondary ? 'SECONDARY' : 'PRIMARY', x + w - 4, row);
        ctx.textAlign = 'left';
        row += 16;
      }
    }

  }

  // Floating tooltip for hovered slots and cargo modules
  _renderTooltip(ctx, game, W, H) {
    let mod = null;

    // Check hovered installed slot
    for (const sr of this._slotRects) {
      if (this._mx >= sr.x1 && this._mx <= sr.x2 &&
          this._my >= sr.y1 && this._my <= sr.y2) {
        mod = game.player.moduleSlots[sr.slotIdx];
        break;
      }
    }

    // Check hovered cargo mod
    if (!mod) {
      for (const cr of this._cargoModRects) {
        if (this._mx >= cr.x1 && this._mx <= cr.x2 &&
            this._my >= cr.y1 && this._my <= cr.y2) {
          mod = game.modules[cr.moduleIdx];
          break;
        }
      }
    }

    if (!mod) return;

    // Build stat lines
    const lines = [];
    if (mod.slotType && mod.slotType !== 'universal') {
      lines.push({ label: 'SLOT', value: mod.slotType.toUpperCase(), color: DIM_TEXT });
    }
    if (mod.powerOutput > 0) {
      lines.push({ label: 'POWER OUT',  value: `+${mod.powerOutput} W`,           color: GREEN });
    }
    if (mod.powerDraw > 0) {
      lines.push({ label: 'POWER DRAW', value: `-${mod.powerDraw} W`,              color: AMBER });
    }
    if (mod.fuelDrainRate > 0) {
      lines.push({ label: 'FUEL DRAIN', value: `${mod.fuelDrainRate.toFixed(4)} /s`, color: AMBER });
    }
    if (mod.isFissionReactor) {
      if (mod.isOverdue) {
        lines.push({ label: 'OVERHAUL', value: 'OVERDUE — output degraded', color: MAGENTA });
      } else {
        const remaining = mod._overhaulInterval - mod.timeSinceOverhaul;
        const h = Math.floor(remaining / 3600);
        const m = Math.floor((remaining % 3600) / 60);
        const warning = remaining < 1800; // last 30 min
        lines.push({ label: 'OVERHAUL IN', value: `${h}h ${m}m`, color: warning ? AMBER : GREEN });
      }
      lines.push({ label: 'OVERHAUL COST', value: `${mod.overhaulCost} scrap`, color: DIM_TEXT });
    }

    // Weapon stats
    if (mod.weapon) {
      const w = mod.weapon;
      lines.push({ label: 'MOUNT',   value: w.isSecondary ? 'SECONDARY' : 'PRIMARY', color: CYAN });
      if (w.damage)      lines.push({ label: 'DAMAGE',   value: `${Math.round(w.damage)} armor`,     color: RED });
      if (w.hullDamage)  lines.push({ label: 'HULL DMG', value: `${Math.round(w.hullDamage)}`,       color: RED });
      if (w.blastRadius) lines.push({ label: 'BLAST',    value: `${w.blastRadius} u radius`,         color: AMBER });
      if (w.maxRange && w.maxRange < 50000)
                         lines.push({ label: 'RANGE',    value: `${Math.round(w.maxRange)} u`,       color: DIM_TEXT });
      if (w.ammoMax)     lines.push({ label: 'AMMO',     value: `${w.ammo} / ${w.ammoMax}`,          color: AMBER });
      const cd = w.cooldownMax ?? 0;
      if (cd)            lines.push({ label: 'COOLDOWN', value: `${cd.toFixed(2)} s`,                color: DIM_TEXT });
    }

    // Condition
    if (mod.condition) {
      lines.push({ label: 'CONDITION', value: mod.condition.toUpperCase(), color: conditionColor(mod.condition) });
      if (mod.condition !== 'good') {
        const mult = { worn: 0.85, faulty: 0.65, damaged: 0.35, destroyed: 0.00 }[mod.condition] ?? 1.00;
        lines.push({ label: 'MULT', value: `×${mult.toFixed(2)}`, color: conditionColor(mod.condition) });
      }
    }

    if (!mod.weapon && mod.powerOutput === 0 && mod.powerDraw === 0 && mod.fuelDrainRate === 0) {
      lines.push({ label: 'EFFECT', value: 'Passive / no stat effect', color: VERY_DIM });
    }

    // Dimensions
    const TW = 240;
    const lineH = 16;
    const padX = 10;
    const padY = 8;
    const headerH = 32;
    const descH = mod.description ? 24 : 0;
    const TH = headerH + descH + lines.length * lineH + padY * 2;

    // Position near cursor, keep on screen
    let tx = this._mx + 16;
    let ty = this._my - TH / 2;
    if (tx + TW > W - 40) tx = this._mx - TW - 12;
    if (ty < 40) ty = 40;
    if (ty + TH > H - 40) ty = H - 40 - TH;

    // Background
    ctx.fillStyle = 'rgba(0,8,18,0.97)';
    ctx.fillRect(tx, ty, TW, TH);
    ctx.strokeStyle = CYAN;
    ctx.lineWidth = 1;
    ctx.strokeRect(tx, ty, TW, TH);

    // Title
    ctx.font = 'bold 11px monospace';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillStyle = CYAN;
    ctx.fillText(mod.displayName, tx + padX, ty + padY);

    // Divider
    const divY = ty + padY + 16;
    ctx.strokeStyle = DIM_OUTLINE;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(tx + padX, divY);
    ctx.lineTo(tx + TW - padX, divY);
    ctx.stroke();

    let ry = divY + 6;

    // Description
    if (mod.description) {
      ctx.font = '9px monospace';
      ctx.fillStyle = VERY_DIM;
      ctx.fillText(mod.description, tx + padX, ry);
      ry += descH;
    }

    // Stat lines
    ctx.font = '10px monospace';
    for (const { label, value, color } of lines) {
      ctx.fillStyle = DIM_TEXT;
      ctx.textAlign = 'left';
      ctx.fillText(label, tx + padX, ry);
      ctx.fillStyle = color;
      ctx.textAlign = 'right';
      ctx.fillText(value, tx + TW - padX, ry);
      ry += lineH;
    }
  }
}
