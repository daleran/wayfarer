import { COMMODITIES, getBuyPrice, getSellPrice } from '../data/commodities.js';
import {
  CYAN, AMBER, GREEN, RED, TEAL, WHITE, MAGENTA,
  PANEL_BG, DIM_OUTLINE, DIM_TEXT, VERY_DIM, BAR_TRACK,
  FACTION,
  standingColor,
} from './colors.js';
import { BOUNTY, REPUTATION } from '../data/tuning/economyTuning.js';
import { FACTIONS, FACTION_LABELS } from '../systems/reputation.js';

const REPAIR_DURATION = 2; // seconds

export class StationScreen {
  constructor() {
    this.visible = false;
    this.station = null;
    this._activeTab = 'services';
    this._armorRepairBtn = null;
    this._repairBtn = null;
    this._refuelBtn = null;
    this._closeBtn = null;
    this._tradeButtons = [];
    this._tabRects = {};
    // Intel tab scroll
    this._intelScrollY = 0;
    // Bounty tab scroll
    this._bountyScrollY = 0;
    this._bountyMaxScroll = 0;
    this._bountyButtons = [];
    // Hull repair progress
    this._repairing = false;
    this._repairProgress = 0;
    this._repairTotal = REPAIR_DURATION;
    this._repairCost = 0;
    // Reactor overhaul buttons (one per installed fission reactor, rebuilt each render)
    this._overhaulBtns = [];
  }

  open(station) {
    this.visible = true;
    this.station = station;
    this._activeTab = 'services';
    this._intelScrollY = 0;
    this._bountyScrollY = 0;
    this._bountyButtons = [];
    this._repairing = false;
    this._repairProgress = 0;
  }

  close() {
    this.visible = false;
    this.station = null;
    this._repairing = false;
  }

  update(dt, game) {
    if (!this._repairing) return;
    this._repairProgress += dt;
    if (this._repairProgress >= this._repairTotal) {
      this._repairing = false;
      game.scrap -= this._repairCost;
      game.player.hullCurrent = game.player.hullMax;
    }
  }

  render(ctx, game) {
    if (!this.visible || !this.station) return;

    const W = game.camera.width;
    const H = game.camera.height;

    // Full-screen backdrop
    ctx.fillStyle = 'rgba(0, 5, 20, 0.8)';
    ctx.fillRect(0, 0, W, H);

    // Centered panel
    const panelW = 625;
    let panelH = 612;
    if (this._activeTab === 'services')  panelH = 670;
    if (this._activeTab === 'intel')     panelH = 681;
    if (this._activeTab === 'bounties')  panelH = 681;
    if (this._activeTab === 'relations') panelH = 630;
    const px = (W - panelW) / 2;
    const py = (H - panelH) / 2;
    const accent = FACTION[this.station.faction] ?? CYAN;

    // Panel background
    ctx.fillStyle = PANEL_BG;
    ctx.fillRect(px, py, panelW, panelH);

    // Corner brackets
    this._drawCornerBrackets(ctx, px, py, panelW, panelH, CYAN);

    // Station name header
    ctx.font = 'bold 25px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillStyle = CYAN;
    ctx.fillText(this.station.name, W / 2, py + 28);

    // Faction accent marker
    ctx.font = '14px monospace';
    ctx.fillStyle = accent;
    ctx.fillText(`[ ${this.station.faction} ]`, W / 2, py + 58);

    // Reputation standing badge
    if (game?.reputation) {
      const repFaction = this.station.reputationFaction;
      const level = game.reputation.getLevel(repFaction);
      const standing = game.reputation.getStanding(repFaction);
      const sign = standing >= 0 ? '+' : '';
      ctx.font = '12px monospace';
      ctx.fillStyle = standingColor(level);
      ctx.fillText(`${level.toUpperCase()}  [${sign}${standing}]`, W / 2, py + 76);
    }

    // Divider
    this._drawDivider(ctx, px, py + 96, panelW, CYAN);

    // Tab bar
    this._renderTabs(ctx, px, py, panelW, accent, game);

    // Divider below tabs
    this._drawDivider(ctx, px, py + 138, panelW, CYAN);

    // Tab content
    if (this._activeTab === 'services') {
      this._renderServicesTab(ctx, px, py, panelW, panelH, game, accent);
    } else if (this._activeTab === 'trade') {
      this._renderTradeTab(ctx, px, py, panelW, panelH, game, accent);
    } else if (this._activeTab === 'intel') {
      this._renderIntelTab(ctx, px, py, panelW, panelH, accent);
    } else if (this._activeTab === 'bounties') {
      this._renderBountiesTab(ctx, px, py, panelW, panelH, game, accent);
    } else if (this._activeTab === 'relations') {
      this._renderRelationsTab(ctx, px, py, panelW, panelH, game, accent);
    }

    // Close button
    const closeBtnX = px + 50;
    const closeBtnY = py + panelH - 75;
    const closeBtnW = panelW - 100;
    const closeBtnH = 50;

    ctx.strokeStyle = DIM_OUTLINE;
    ctx.lineWidth = 1;
    ctx.strokeRect(closeBtnX, closeBtnY, closeBtnW, closeBtnH);

    ctx.font = '19px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = DIM_TEXT;
    ctx.fillText('[Esc] Close', W / 2, closeBtnY + closeBtnH / 2);

    this._closeBtn = { x: closeBtnX, y: closeBtnY, w: closeBtnW, h: closeBtnH };
  }

  _drawCornerBrackets(ctx, x, y, w, h, color) {
    const B = 18;
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(x, y + B); ctx.lineTo(x, y); ctx.lineTo(x + B, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x + w - B, y); ctx.lineTo(x + w, y); ctx.lineTo(x + w, y + B);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y + h - B); ctx.lineTo(x, y + h); ctx.lineTo(x + B, y + h);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x + w - B, y + h); ctx.lineTo(x + w, y + h); ctx.lineTo(x + w, y + h - B);
    ctx.stroke();
  }

  _drawDivider(ctx, px, y, panelW, color) {
    ctx.strokeStyle = color;
    ctx.globalAlpha = 0.3;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(px + 31, y);
    ctx.lineTo(px + panelW - 31, y);
    ctx.stroke();
    ctx.globalAlpha = 1;
  }

  _renderTabs(ctx, px, py, panelW, accent, game) {
    const haslore = this.station && this.station.lore && this.station.lore.length > 0;
    const hasBounties = (this.station.bounties?.length > 0) ||
      (game?.activeBounties?.some(b => b.stationId === this.station.id));
    const tabs = [
      { id: 'services',  label: 'Services'  },
      { id: 'trade',     label: 'Trade'     },
      { id: 'relations', label: 'Relations' },
      ...(hasBounties ? [{ id: 'bounties', label: 'Bounties' }] : []),
      ...(haslore ? [{ id: 'intel', label: 'Intel' }] : []),
    ];
    const tabW = 110;
    const tabH = 30;
    const tabY = py + 106;
    const startX = px + 35;

    this._tabRects = {};
    ctx.font = '18px monospace';
    ctx.textBaseline = 'middle';

    for (let i = 0; i < tabs.length; i++) {
      const tab = tabs[i];
      const tx = startX + i * (tabW + 20);
      const active = this._activeTab === tab.id;

      this._tabRects[tab.id] = { x: tx, y: tabY, w: tabW, h: tabH };

      ctx.textAlign = 'center';
      ctx.fillStyle = active ? CYAN : DIM_TEXT;
      ctx.fillText(tab.label, tx + tabW / 2, tabY + tabH / 2);

      if (active) {
        ctx.strokeStyle = CYAN;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(tx, tabY + tabH);
        ctx.lineTo(tx + tabW, tabY + tabH);
        ctx.stroke();
      }
    }
  }

  _renderServicesTab(ctx, px, py, panelW, panelH, game, accent) {
    const contentY = py + 151;

    // Credits readout
    ctx.font = '19px monospace';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillStyle = AMBER;
    ctx.fillText(`Scrap: ${game.scrap}`, px + 45, contentY);
    ctx.fillStyle = AMBER;
    ctx.fillText(`Fuel: ${Math.floor(game.fuel)}/${game.fuelMax}`, px + 250, contentY);

    const player = game.player;
    const needsArmorRepair = player.armorCurrent < player.armorMax;
    const needsRepair = player.hullCurrent < player.hullMax;
    const isAllied = game.reputation?.isAllied(this.station.reputationFaction) ?? false;
    const discount = isAllied ? (1 - REPUTATION.DISCOUNT_RATE) : 1;
    if (isAllied) {
      ctx.font = '12px monospace';
      ctx.textAlign = 'right';
      ctx.fillStyle = CYAN;
      ctx.fillText('ALLIED — 15% discount', px + panelW - 45, contentY + 2);
    }
    let btnYOffset = contentY + 60;

    // Repair Armor button
    if (needsArmorRepair) {
      const armorDmg = Math.ceil(player.armorMax - player.armorCurrent);
      const cost = Math.ceil(armorDmg * discount); // 1 scrap per armor point
      const canAfford = game.scrap >= cost;
      const btnX = px + 45;
      const btnY = btnYOffset;
      const btnW = panelW - 90;
      const btnH = 50;

      ctx.strokeStyle = canAfford ? GREEN : VERY_DIM;
      ctx.lineWidth = 1;
      ctx.strokeRect(btnX, btnY, btnW, btnH);

      ctx.font = '19px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = canAfford ? GREEN : DIM_TEXT;
      ctx.fillText(`Repair Armor — ${cost} scrap`, btnX + btnW / 2, btnY + btnH / 2);

      this._armorRepairBtn = { x: btnX, y: btnY, w: btnW, h: btnH, cost, canAfford };
      btnYOffset += btnH + 15;
    } else {
      this._armorRepairBtn = null;
    }

    // Repair Hull button / progress
    if (this._repairing) {
      const ratio = this._repairProgress / this._repairTotal;
      const barX = px + 45;
      const barY = btnYOffset;
      const barW = panelW - 90;
      const barH = 50;

      ctx.strokeStyle = CYAN;
      ctx.lineWidth = 1;
      ctx.strokeRect(barX, barY, barW, barH);
      ctx.fillStyle = BAR_TRACK;
      ctx.fillRect(barX, barY, barW, barH);
      ctx.fillStyle = CYAN;
      ctx.fillRect(barX + 2, barY + 2, (barW - 4) * ratio, barH - 4);

      ctx.font = '16px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = WHITE;
      ctx.fillText(`Repairing... ${Math.floor(ratio * 100)}%`, px + panelW / 2, barY + barH / 2);

      btnYOffset += barH + 15;
    } else if (needsRepair) {
      const cost = Math.ceil((player.hullMax - player.hullCurrent) * 2 * discount); // 2 scrap per hull point
      const canAfford = game.scrap >= cost;
      const btnX = px + 45;
      const btnY = btnYOffset;
      const btnW = panelW - 90;
      const btnH = 50;

      ctx.strokeStyle = canAfford ? CYAN : VERY_DIM;
      ctx.lineWidth = 1;
      ctx.strokeRect(btnX, btnY, btnW, btnH);

      ctx.font = '19px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = canAfford ? CYAN : DIM_TEXT;
      ctx.fillText(`Repair Hull — ${cost} scrap`, btnX + btnW / 2, btnY + btnH / 2);

      this._repairBtn = { x: btnX, y: btnY, w: btnW, h: btnH, cost, canAfford };
      btnYOffset += btnH + 15;
    } else {
      this._repairBtn = null;
      ctx.font = '19px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillStyle = GREEN;
      ctx.fillText('Hull at full integrity', px + panelW / 2, btnYOffset);
      btnYOffset += 45;
    }

    // Refuel button
    const fuelNeeded = game.fuelMax - game.fuel;
    const fuelCost = Math.ceil(fuelNeeded * 0.5 * discount); // 1 scrap per 2 fuel units
    if (fuelNeeded > 0.5) {
      const canAfford = game.scrap >= fuelCost;
      const btnX = px + 45;
      const btnY = btnYOffset;
      const btnW = panelW - 90;
      const btnH = 50;

      ctx.strokeStyle = canAfford ? AMBER : VERY_DIM;
      ctx.lineWidth = 1;
      ctx.strokeRect(btnX, btnY, btnW, btnH);

      ctx.font = '19px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = canAfford ? AMBER : DIM_TEXT;
      ctx.fillText(`Refuel — ${fuelCost} scrap`, btnX + btnW / 2, btnY + btnH / 2);

      this._refuelBtn = { x: btnX, y: btnY, w: btnW, h: btnH, cost: fuelCost, canAfford };
      btnYOffset += btnH + 15;
    } else {
      this._refuelBtn = null;
      ctx.font = '19px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillStyle = GREEN;
      ctx.fillText('Fuel tanks full', px + panelW / 2, btnYOffset);
      btnYOffset += 45;
    }

    // Reactor overhaul — only at stations with canOverhaulReactor
    this._overhaulBtns = [];
    if (this.station.canOverhaulReactor) {
      const fissionMods = (game.player.moduleSlots || [])
        .map((mod, idx) => ({ mod, idx }))
        .filter(({ mod }) => mod?.isFissionReactor);

      if (fissionMods.length > 0) {
        ctx.font = 'bold 13px monospace';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        ctx.fillStyle = MAGENTA;
        ctx.fillText('REACTOR OVERHAUL', px + 45, btnYOffset);
        btnYOffset += 20;

        for (const { mod, idx } of fissionMods) {
          const canAfford = game.scrap >= mod.overhaulCost;
          const btnX = px + 45;
          const btnY = btnYOffset;
          const btnW = panelW - 90;
          const btnH = 50;

          const labelColor = mod.isOverdue ? MAGENTA : (canAfford ? CYAN : DIM_TEXT);
          ctx.strokeStyle = mod.isOverdue ? MAGENTA : (canAfford ? CYAN : VERY_DIM);
          ctx.lineWidth = 1;
          ctx.strokeRect(btnX, btnY, btnW, btnH);

          ctx.font = '17px monospace';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillStyle = labelColor;
          const overhaulLabel = mod.isOverdue
            ? `!! Overhaul ${mod.displayName} — ${mod.overhaulCost} scrap  [OVERDUE]`
            : `Overhaul ${mod.displayName} — ${mod.overhaulCost} scrap`;
          ctx.fillText(overhaulLabel, btnX + btnW / 2, btnY + btnH / 2);

          this._overhaulBtns.push({ x: btnX, y: btnY, w: btnW, h: btnH, mod, canAfford });
          btnYOffset += btnH + 10;
        }
      }
    }

  }

  _renderTradeTab(ctx, px, py, panelW, panelH, game, accent) {
    const contentY = py + 151;
    this._tradeButtons = [];

    const cargoUsed = game.totalCargoUsed;
    const cargoCap = game.totalCargoCapacity;

    // Scrap & cargo header
    ctx.font = '18px monospace';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillStyle = AMBER;
    ctx.fillText(`Scrap: ${game.scrap}`, px + 45, contentY);
    ctx.fillStyle = cargoUsed >= cargoCap ? RED : TEAL;
    ctx.fillText(`Cargo: ${cargoUsed}/${cargoCap}`, px + 338, contentY);

    // Shift hint
    ctx.font = '14px monospace';
    ctx.fillStyle = DIM_TEXT;
    ctx.fillText('Hold Shift to trade x10', px + 45, contentY + 24);

    // Divider
    this._drawDivider(ctx, px, contentY + 44, panelW, CYAN);

    // Column headers
    const headerY = contentY + 54;
    ctx.font = '15px monospace';
    ctx.fillStyle = DIM_TEXT;
    ctx.textAlign = 'left';
    ctx.fillText('ITEM', px + 45, headerY);
    ctx.fillText('PRICE', px + 175, headerY);
    ctx.fillText('QTY', px + 300, headerY);

    // Commodity rows (scrap is the currency, not traded here)
    const rowH = 35;
    const commodityIds = Object.keys(COMMODITIES).filter(id => {
      const supply = this.station.commodities?.[id] ?? 'none';
      const qty = game.cargo[id] ?? 0;
      return supply !== 'none' || qty > 0;
    });
    const startRowY = headerY + 20;

    for (let i = 0; i < commodityIds.length; i++) {
      const id = commodityIds[i];
      const commodity = COMMODITIES[id];
      const supply = this.station.commodities[id] ?? 'none';
      const buyPrice = getBuyPrice(id, supply);
      const sellPrice = getSellPrice(id, supply);
      const qty = game.cargo[id];
      const rowY = startRowY + i * rowH;

      // Item name
      ctx.font = '18px monospace';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = CYAN;
      ctx.fillText(commodity.name, px + 45, rowY + rowH / 2);

      // Price (in scrap)
      ctx.fillStyle = buyPrice !== null ? AMBER : DIM_TEXT;
      ctx.fillText(buyPrice !== null ? `${buyPrice} scrap` : '---', px + 175, rowY + rowH / 2);

      // Quantity
      ctx.fillStyle = qty > 0 ? TEAL : DIM_TEXT;
      ctx.fillText(`${qty}`, px + 300, rowY + rowH / 2);

      // Buy button
      const buyBtnX = px + 375;
      const buyBtnY = rowY + 2;
      const buyBtnW = 75;
      const buyBtnH = rowH - 4;
      const canBuy = buyPrice !== null && game.scrap >= buyPrice && cargoUsed < cargoCap;

      this._renderSmallButton(ctx, buyBtnX, buyBtnY, buyBtnW, buyBtnH,
        buyPrice !== null ? 'Buy' : ' - ', canBuy);
      this._tradeButtons.push({
        x: buyBtnX, y: buyBtnY, w: buyBtnW, h: buyBtnH,
        action: 'buy', commodityId: id, enabled: canBuy,
      });

      // Sell button
      const sellBtnX = px + 465;
      const sellBtnY = rowY + 2;
      const sellBtnW = 75;
      const sellBtnH = rowH - 4;
      const canSell = qty > 0 && sellPrice !== null;

      this._renderSmallButton(ctx, sellBtnX, sellBtnY, sellBtnW, sellBtnH, 'Sell', canSell);
      this._tradeButtons.push({
        x: sellBtnX, y: sellBtnY, w: sellBtnW, h: sellBtnH,
        action: 'sell', commodityId: id, enabled: canSell,
      });
    }
  }

  _renderIntelTab(ctx, px, py, panelW, panelH, accent) {
    const lore = this.station.lore;
    if (!lore || lore.length === 0) return;

    const contentX = px + 45;
    const contentY = py + 151;
    const lineH = 21;
    const closeAreaH = 90; // space reserved for close button
    const clipH = panelH - (contentY - py) - closeAreaH;

    // Measure total content height
    let totalH = 0;
    for (const line of lore) {
      totalH += line === '' ? Math.floor(lineH * 0.6) : lineH;
    }
    this._intelMaxScroll = Math.max(0, totalH - clipH);

    // Clip to content area
    ctx.save();
    ctx.beginPath();
    ctx.rect(px, contentY, panelW, clipH);
    ctx.clip();

    ctx.font = '14px monospace';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';

    let y = contentY - this._intelScrollY;
    for (const line of lore) {
      if (line === '') {
        y += Math.floor(lineH * 0.6);
        continue;
      }
      // Section headings: lines starting with '[' or all-caps short lines
      const isHeading = line.startsWith('[') || (line === line.toUpperCase() && line.length > 2);
      if (isHeading) {
        ctx.fillStyle = accent;
        ctx.globalAlpha = 0.9;
      } else {
        ctx.fillStyle = DIM_TEXT;
        ctx.globalAlpha = 0.85;
      }
      ctx.fillText(line, contentX, y);
      ctx.globalAlpha = 1;
      y += lineH;
    }

    ctx.restore();

    // Scroll indicator
    if (this._intelMaxScroll > 0) {
      const trackX = px + panelW - 18;
      const trackY = contentY + 2;
      const trackH = clipH - 4;
      const thumbH = Math.max(20, trackH * (clipH / totalH));
      const thumbY = trackY + (this._intelScrollY / this._intelMaxScroll) * (trackH - thumbH);

      ctx.fillStyle = DIM_OUTLINE;
      ctx.globalAlpha = 0.4;
      ctx.fillRect(trackX, trackY, 4, trackH);
      ctx.fillStyle = CYAN;
      ctx.globalAlpha = 0.7;
      ctx.fillRect(trackX, thumbY, 4, thumbH);
      ctx.globalAlpha = 1;
    }
  }

  _renderSmallButton(ctx, x, y, w, h, label, enabled) {
    ctx.strokeStyle = enabled ? CYAN : VERY_DIM;
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, w, h);

    ctx.font = '15px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = enabled ? CYAN : DIM_TEXT;
    ctx.fillText(label, x + w / 2, y + h / 2);
  }

  handleInput(input, game) {
    if (!this.visible) return;

    if (input.wasJustPressed('escape') || input.wasJustPressed('e')) {
      this.close();
      return;
    }

    // Intel tab scrolling
    if (this._activeTab === 'intel' && input.wheelDelta !== 0) {
      this._intelScrollY = Math.max(0, Math.min(
        this._intelMaxScroll ?? 0,
        this._intelScrollY + input.wheelDelta * 0.5,
      ));
    }

    // Bounty tab scrolling
    if (this._activeTab === 'bounties' && input.wheelDelta !== 0) {
      this._bountyScrollY = Math.max(0,
        Math.min(this._bountyMaxScroll, this._bountyScrollY + input.wheelDelta * 0.5));
    }

    if (input.wasJustClicked()) {
      const mx = input.mouseScreen.x;
      const my = input.mouseScreen.y;

      // Tab clicks
      for (const [tabId, rect] of Object.entries(this._tabRects)) {
        if (mx >= rect.x && mx <= rect.x + rect.w && my >= rect.y && my <= rect.y + rect.h) {
          this._activeTab = tabId;
          this._intelScrollY = 0;
          this._bountyScrollY = 0;
          return;
        }
      }

      // Services tab buttons
      if (this._activeTab === 'services') {
        if (this._armorRepairBtn) {
          const b = this._armorRepairBtn;
          if (mx >= b.x && mx <= b.x + b.w && my >= b.y && my <= b.y + b.h) {
            if (b.canAfford) {
              game.scrap -= b.cost;
              const p = game.player;
              p.armorArcs.front     = p.armorArcsMax.front;
              p.armorArcs.port      = p.armorArcsMax.port;
              p.armorArcs.starboard = p.armorArcsMax.starboard;
              p.armorArcs.aft       = p.armorArcsMax.aft;
            }
            return;
          }
        }
        if (this._repairBtn) {
          const b = this._repairBtn;
          if (mx >= b.x && mx <= b.x + b.w && my >= b.y && my <= b.y + b.h) {
            if (b.canAfford && !this._repairing) {
              this._repairing = true;
              this._repairProgress = 0;
              this._repairCost = b.cost;
            }
            return;
          }
        }
        if (this._refuelBtn) {
          const b = this._refuelBtn;
          if (mx >= b.x && mx <= b.x + b.w && my >= b.y && my <= b.y + b.h) {
            if (b.canAfford) {
              game.scrap -= b.cost;
              game.fuel = game.fuelMax;
            }
            return;
          }
        }
        for (const b of this._overhaulBtns) {
          if (mx >= b.x && mx <= b.x + b.w && my >= b.y && my <= b.y + b.h) {
            if (b.canAfford) {
              game.scrap -= b.mod.overhaulCost;
              b.mod.resetOverhaul();
            }
            return;
          }
        }
      }

      // Trade tab buttons
      if (this._activeTab === 'trade') {
        const batchSize = input.isDown('shift') ? 10 : 1;
        for (const btn of this._tradeButtons) {
          if (mx >= btn.x && mx <= btn.x + btn.w && my >= btn.y && my <= btn.y + btn.h) {
            if (!btn.enabled) return;
            const supply = this.station.commodities[btn.commodityId] ?? 'none';
            if (btn.action === 'buy') {
              const price = getBuyPrice(btn.commodityId, supply);
              if (price !== null) {
                for (let i = 0; i < batchSize; i++) {
                  if (game.scrap < price) break;
                  if (game.totalCargoUsed >= game.totalCargoCapacity) break;
                  game.scrap -= price;
                  game.cargo[btn.commodityId]++;
                }
              }
            } else {
              const price = getSellPrice(btn.commodityId, supply);
              if (price !== null) {
                for (let i = 0; i < batchSize; i++) {
                  if (game.cargo[btn.commodityId] <= 0) break;
                  game.scrap += price;
                  game.cargo[btn.commodityId]--;
                }
              }
            }
            return;
          }
        }
      }

      // Bounty tab accept buttons
      if (this._activeTab === 'bounties') {
        for (const btn of this._bountyButtons) {
          const renderedBtnY = this._bountyScrollStartY + btn.listOffsetY - this._bountyScrollY;
          if (renderedBtnY < this._bountyScrollStartY ||
              renderedBtnY + btn.h > this._bountyClipBottom) continue;
          if (mx >= btn.x && mx <= btn.x + btn.w &&
              my >= renderedBtnY && my <= renderedBtnY + btn.h) {
            game.acceptBounty(this.station, btn.contract);
            return;
          }
        }
      }

      // Close button
      if (this._closeBtn) {
        const b = this._closeBtn;
        if (mx >= b.x && mx <= b.x + b.w && my >= b.y && my <= b.y + b.h) {
          this.close();
        }
      }
    }
  }

  _renderBountiesTab(ctx, px, py, panelW, panelH, game, accent) {
    const contentX = px + 45;
    const contentW = panelW - 90;
    const contentY = py + 151;
    const scrollStartY = contentY + 30;
    const closeAreaH = 90;
    const clipH = panelH - (scrollStartY - py) - closeAreaH;
    this._bountyButtons = [];
    this._bountyScrollStartY = scrollStartY;
    this._bountyClipBottom = scrollStartY + clipH;

    // Scrap header
    ctx.font = '19px monospace';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillStyle = AMBER;
    ctx.fillText(`Scrap: ${game.scrap}`, contentX, contentY);

    ctx.save();
    ctx.beginPath();
    ctx.rect(px, scrollStartY, panelW, clipH);
    ctx.clip();

    let y = scrollStartY - this._bountyScrollY;

    // ── Available ──────────────────────────────────────────────────────────
    const available = this.station.bounties ?? [];
    if (available.length > 0) {
      ctx.font = '12px monospace';
      ctx.fillStyle = DIM_TEXT;
      ctx.textBaseline = 'top';
      ctx.textAlign = 'left';
      ctx.fillText('AVAILABLE CONTRACTS', contentX, y);
      y += 20;

      for (const contract of available) {
        const cardH = 70;
        ctx.strokeStyle = DIM_OUTLINE;
        ctx.lineWidth = 1;
        ctx.strokeRect(contentX, y, contentW, cardH);

        ctx.font = '15px monospace';
        ctx.fillStyle = CYAN;
        ctx.textBaseline = 'top';
        ctx.textAlign = 'left';
        ctx.fillText(contract.title, contentX + 10, y + 8);

        ctx.font = '13px monospace';
        ctx.fillStyle = AMBER;
        ctx.fillText(`Target: ${contract.targetName}`, contentX + 10, y + 28);

        ctx.fillStyle = GREEN;
        ctx.fillText(`Reward: ${contract.reward} scrap`, contentX + 10, y + 46);

        // Accept button
        const btnW = 80; const btnH = 28;
        const btnX = contentX + contentW - btnW - 10;
        const btnY = y + (cardH - btnH) / 2;
        ctx.strokeStyle = CYAN;
        ctx.strokeRect(btnX, btnY, btnW, btnH);
        ctx.font = '14px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = CYAN;
        ctx.fillText('Accept', btnX + btnW / 2, btnY + btnH / 2);

        this._bountyButtons.push({
          x: btnX,
          listOffsetY: (y + this._bountyScrollY) - scrollStartY + (cardH - btnH) / 2,
          w: btnW, h: btnH,
          contract,
        });

        y += cardH + 8;
      }
    }

    // ── Your contracts ─────────────────────────────────────────────────────
    const mine = (game.activeBounties ?? []).filter(b => b.stationId === this.station.id);
    if (mine.length > 0) {
      ctx.font = '12px monospace';
      ctx.fillStyle = DIM_TEXT;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillText('YOUR CONTRACTS', contentX, y);
      y += 20;

      for (const bounty of mine) {
        const cardH = 56;
        const borderColor = bounty.status === 'completed' ? GREEN
                          : bounty.status === 'expired'   ? RED
                          : AMBER;
        ctx.strokeStyle = borderColor;
        ctx.globalAlpha = 0.5;
        ctx.lineWidth = 1;
        ctx.strokeRect(contentX, y, contentW, cardH);
        ctx.globalAlpha = 1;

        ctx.font = '14px monospace';
        ctx.fillStyle = CYAN;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        ctx.fillText(bounty.contract.title, contentX + 10, y + 8);

        let statusText, statusColor;
        if (bounty.status === 'completed') {
          statusText = 'COMPLETE — collect on dock';
          statusColor = GREEN;
        } else if (bounty.status === 'expired') {
          statusText = 'EXPIRED';
          statusColor = RED;
        } else {
          const rem = Math.max(0, bounty.expiryTime - game.totalTime);
          const m = Math.floor(rem / 60);
          const s = Math.floor(rem % 60).toString().padStart(2, '0');
          statusText = `ACTIVE — ${m}:${s} remaining`;
          statusColor = rem < BOUNTY.EXPIRY_WARNING_SECS ? RED : AMBER;
        }
        ctx.font = '13px monospace';
        ctx.fillStyle = statusColor;
        ctx.fillText(statusText, contentX + 10, y + 32);

        y += cardH + 8;
      }
    }

    const totalH = y + this._bountyScrollY - scrollStartY;
    this._bountyMaxScroll = Math.max(0, totalH - clipH);

    ctx.restore();

    // Scroll track
    if (this._bountyMaxScroll > 0) {
      const tx = px + panelW - 18;
      const ty = scrollStartY + 2;
      const th = clipH - 4;
      const visRatio = clipH / totalH;
      const thumbH = Math.max(20, th * visRatio);
      const thumbY = ty + (this._bountyScrollY / this._bountyMaxScroll) * (th - thumbH);
      ctx.fillStyle = DIM_OUTLINE; ctx.globalAlpha = 0.4;
      ctx.fillRect(tx, ty, 4, th);
      ctx.fillStyle = CYAN; ctx.globalAlpha = 0.7;
      ctx.fillRect(tx, thumbY, 4, thumbH);
      ctx.globalAlpha = 1;
    }
  }

  _renderRelationsTab(ctx, px, py, panelW, panelH, game, accent) {
    const contentX = px + 45;
    const contentY = py + 151;
    const rowH = 38;

    ctx.font = '12px monospace';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillStyle = DIM_TEXT;
    ctx.fillText('FACTION STANDINGS', contentX, contentY);

    for (let i = 0; i < FACTIONS.length; i++) {
      const faction = FACTIONS[i];
      const label = FACTION_LABELS[faction];
      const standing = game.reputation.getStanding(faction);
      const level = game.reputation.getLevel(faction);
      const color = standingColor(level);
      const rowY = contentY + 22 + i * rowH;
      const sign = standing >= 0 ? '+' : '';

      ctx.font = '16px monospace';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = WHITE;
      ctx.globalAlpha = 0.8;
      ctx.fillText(label, contentX, rowY + rowH / 2);

      ctx.textAlign = 'right';
      ctx.fillStyle = color;
      ctx.globalAlpha = 1;
      ctx.fillText(`${level}  [${sign}${standing}]`, px + panelW - 45, rowY + rowH / 2);

      // Thin separator
      this._drawDivider(ctx, px, rowY + rowH, panelW, DIM_OUTLINE);
    }
    ctx.globalAlpha = 1;
  }
}
