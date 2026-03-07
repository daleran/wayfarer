import { COMMODITIES, getBuyPrice, getSellPrice } from '../data/commodities.js';
import { SHIP_TYPES } from '../data/shipTypes.js';
import { createGunship } from '../ships/player/gunship.js';
import { createFrigate } from '../ships/player/frigate.js';
import { createHauler } from '../ships/player/hauler.js';
import {
  CYAN, AMBER, GREEN, RED, TEAL, WHITE,
  PANEL_BG, DIM_OUTLINE, DIM_TEXT, VERY_DIM, BAR_TRACK,
  FACTION,
} from './colors.js';

const SHIP_FACTORIES = {
  gunship: createGunship,
  frigate: createFrigate,
  hauler: createHauler,
};

const MAX_FLEET_SIZE = 5;
const REPAIR_DURATION = 2; // seconds
const CREW_HIRE_COST = 10; // credits per crew member

export class StationScreen {
  constructor() {
    this.visible = false;
    this.station = null;
    this._activeTab = 'services';
    this._armorRepairBtn = null;
    this._repairBtn = null;
    this._refuelBtn = null;
    this._closeBtn = null;
    this._crewButtons = [];
    this._tradeButtons = [];
    this._tabRects = {};
    this._shipyardButtons = [];
    // Hull repair progress
    this._repairing = false;
    this._repairProgress = 0;
    this._repairTotal = REPAIR_DURATION;
    this._repairCost = 0;
  }

  open(station) {
    this.visible = true;
    this.station = station;
    this._activeTab = 'services';
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
      game.credits -= this._repairCost;
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

    // Centered panel — 25% larger
    const panelW = 500;
    const hasShipyard = this.station.services && this.station.services.includes('shipyard');
    const fleetSize = 1 + game.fleet.length; // flagship + fleet
    let panelH = 475;
    if (this._activeTab === 'shipyard' && hasShipyard) panelH = 575;
    else if (this._activeTab === 'services') panelH = 570 + fleetSize * 28 + 40;
    const px = (W - panelW) / 2;
    const py = (H - panelH) / 2;
    const accent = FACTION[this.station.faction] ?? CYAN;

    // Panel background
    ctx.fillStyle = PANEL_BG;
    ctx.fillRect(px, py, panelW, panelH);

    // Corner brackets
    this._drawCornerBrackets(ctx, px, py, panelW, panelH, CYAN);

    // Station name header
    ctx.font = 'bold 20px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillStyle = CYAN;
    ctx.fillText(this.station.name, W / 2, py + 22);

    // Faction accent marker
    ctx.font = '11px monospace';
    ctx.fillStyle = accent;
    ctx.fillText(`[ ${this.station.faction} ]`, W / 2, py + 46);

    // Divider
    this._drawDivider(ctx, px, py + 62, panelW, CYAN);

    // Tab bar
    this._renderTabs(ctx, px, py, panelW, accent);

    // Divider below tabs
    this._drawDivider(ctx, px, py + 96, panelW, CYAN);

    // Tab content
    if (this._activeTab === 'services') {
      this._renderServicesTab(ctx, px, py, panelW, panelH, game, accent);
    } else if (this._activeTab === 'trade') {
      this._renderTradeTab(ctx, px, py, panelW, panelH, game, accent);
    } else if (this._activeTab === 'shipyard') {
      this._renderShipyardTab(ctx, px, py, panelW, panelH, game, accent);
    }

    // Close button
    const closeBtnX = px + 40;
    const closeBtnY = py + panelH - 60;
    const closeBtnW = panelW - 80;
    const closeBtnH = 40;

    ctx.strokeStyle = DIM_OUTLINE;
    ctx.lineWidth = 1;
    ctx.strokeRect(closeBtnX, closeBtnY, closeBtnW, closeBtnH);

    ctx.font = '15px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = DIM_TEXT;
    ctx.fillText('[Esc] Close', W / 2, closeBtnY + closeBtnH / 2);

    this._closeBtn = { x: closeBtnX, y: closeBtnY, w: closeBtnW, h: closeBtnH };
  }

  _drawCornerBrackets(ctx, x, y, w, h, color) {
    const B = 14;
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
    ctx.moveTo(px + 25, y);
    ctx.lineTo(px + panelW - 25, y);
    ctx.stroke();
    ctx.globalAlpha = 1;
  }

  _renderTabs(ctx, px, py, panelW, accent) {
    const hasShipyard = this.station.services && this.station.services.includes('shipyard');
    const tabs = [
      { id: 'services', label: 'Services' },
      { id: 'trade', label: 'Trade' },
    ];
    if (hasShipyard) tabs.push({ id: 'shipyard', label: 'Shipyard' });
    const tabW = 125;
    const tabH = 24;
    const tabY = py + 70;
    const startX = px + 36;

    this._tabRects = {};
    ctx.font = '14px monospace';
    ctx.textBaseline = 'middle';

    for (let i = 0; i < tabs.length; i++) {
      const tab = tabs[i];
      const tx = startX + i * (tabW + 16);
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
    const contentY = py + 106;

    // Credits readout
    ctx.font = '15px monospace';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillStyle = AMBER;
    ctx.fillText(`Credits: ${game.credits} cr`, px + 36, contentY);

    // Scrap readout
    ctx.fillText(`Scrap: ${game.scrap}`, px + 280, contentY);

    const player = game.player;
    const needsArmorRepair = player.armorCurrent < player.armorMax;
    const needsRepair = player.hullCurrent < player.hullMax;
    let btnYOffset = contentY + 48;

    // Repair Armor button
    if (needsArmorRepair) {
      const armorDmg = Math.ceil(player.armorMax - player.armorCurrent);
      const cost = Math.ceil(armorDmg * 1);
      const canAfford = game.credits >= cost;
      const btnX = px + 36;
      const btnY = btnYOffset;
      const btnW = panelW - 72;
      const btnH = 40;

      ctx.strokeStyle = canAfford ? GREEN : VERY_DIM;
      ctx.lineWidth = 1;
      ctx.strokeRect(btnX, btnY, btnW, btnH);

      ctx.font = '15px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = canAfford ? GREEN : DIM_TEXT;
      ctx.fillText(`Repair Armor — ${cost} cr`, btnX + btnW / 2, btnY + btnH / 2);

      this._armorRepairBtn = { x: btnX, y: btnY, w: btnW, h: btnH, cost, canAfford };
      btnYOffset += btnH + 12;
    } else {
      this._armorRepairBtn = null;
    }

    // Repair Hull button / progress
    if (this._repairing) {
      const ratio = this._repairProgress / this._repairTotal;
      const barX = px + 36;
      const barY = btnYOffset;
      const barW = panelW - 72;
      const barH = 40;

      ctx.strokeStyle = CYAN;
      ctx.lineWidth = 1;
      ctx.strokeRect(barX, barY, barW, barH);
      ctx.fillStyle = BAR_TRACK;
      ctx.fillRect(barX, barY, barW, barH);
      ctx.fillStyle = CYAN;
      ctx.fillRect(barX + 2, barY + 2, (barW - 4) * ratio, barH - 4);

      ctx.font = '13px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = WHITE;
      ctx.fillText(`Repairing... ${Math.floor(ratio * 100)}%`, px + panelW / 2, barY + barH / 2);

      btnYOffset += barH + 12;
    } else if (needsRepair) {
      const cost = Math.ceil((player.hullMax - player.hullCurrent) * 2);
      const canAfford = game.credits >= cost;
      const btnX = px + 36;
      const btnY = btnYOffset;
      const btnW = panelW - 72;
      const btnH = 40;

      ctx.strokeStyle = canAfford ? CYAN : VERY_DIM;
      ctx.lineWidth = 1;
      ctx.strokeRect(btnX, btnY, btnW, btnH);

      ctx.font = '15px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = canAfford ? CYAN : DIM_TEXT;
      ctx.fillText(`Repair Hull — ${cost} cr`, btnX + btnW / 2, btnY + btnH / 2);

      this._repairBtn = { x: btnX, y: btnY, w: btnW, h: btnH, cost, canAfford };
      btnYOffset += btnH + 12;
    } else {
      this._repairBtn = null;
      ctx.font = '15px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillStyle = GREEN;
      ctx.fillText('Hull at full integrity', px + panelW / 2, btnYOffset);
      btnYOffset += 36;
    }

    // Refuel button
    const fuelNeeded = game.fuelMax - game.fuel;
    const fuelCost = Math.ceil(fuelNeeded);
    if (fuelNeeded > 0.5) {
      const canAfford = game.credits >= fuelCost;
      const btnX = px + 36;
      const btnY = btnYOffset;
      const btnW = panelW - 72;
      const btnH = 40;

      ctx.strokeStyle = canAfford ? AMBER : VERY_DIM;
      ctx.lineWidth = 1;
      ctx.strokeRect(btnX, btnY, btnW, btnH);

      ctx.font = '15px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = canAfford ? AMBER : DIM_TEXT;
      ctx.fillText(`Refuel — ${fuelCost} cr`, btnX + btnW / 2, btnY + btnH / 2);

      this._refuelBtn = { x: btnX, y: btnY, w: btnW, h: btnH, cost: fuelCost, canAfford };
      btnYOffset += btnH + 12;
    } else {
      this._refuelBtn = null;
      ctx.font = '15px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillStyle = GREEN;
      ctx.fillText('Fuel tanks full', px + panelW / 2, btnYOffset);
      btnYOffset += 36;
    }

    // Crew hiring section
    btnYOffset += 12;
    this._drawDivider(ctx, px, btnYOffset, panelW, CYAN);
    btnYOffset += 12;

    ctx.font = '12px monospace';
    ctx.fillStyle = DIM_TEXT;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText('CREW ROSTER', px + 36, btnYOffset);
    ctx.textAlign = 'right';
    ctx.fillText(`${CREW_HIRE_COST} cr / crew`, px + panelW - 36, btnYOffset);
    btnYOffset += 20;

    this._crewButtons = [];
    const allShips = [game.player, ...game.fleet].filter(s => s && s.active);
    const rowH = 28;

    for (let i = 0; i < allShips.length; i++) {
      const ship = allShips[i];
      const name = i === 0 ? 'Flagship' : (SHIP_TYPES[ship.shipType]?.name ?? 'Ship');
      const needsCrew = ship.crewCurrent < ship.crewMax;
      const rowY = btnYOffset + i * rowH;

      // Ship name
      ctx.font = '13px monospace';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = CYAN;
      ctx.fillText(name, px + 36, rowY + rowH / 2);

      // Crew count
      const crewColor = ship.crewCurrent <= ship.crewMax * 0.25 ? RED
        : ship.crewCurrent < ship.crewMax ? AMBER : GREEN;
      ctx.fillStyle = crewColor;
      ctx.fillText(`${ship.crewCurrent}/${ship.crewMax}`, px + 160, rowY + rowH / 2);

      // Efficiency readout
      const eff = Math.round(ship.crewEfficiency * 100);
      ctx.font = '11px monospace';
      ctx.fillStyle = eff < 60 ? RED : eff < 90 ? AMBER : GREEN;
      ctx.fillText(`${eff}%`, px + 230, rowY + rowH / 2);

      if (needsCrew) {
        // Hire 1
        const h1x = px + 290;
        const h1y = rowY + 3;
        const h1w = 55;
        const h1h = rowH - 6;
        const canHire1 = game.credits >= CREW_HIRE_COST;
        this._renderSmallButton(ctx, h1x, h1y, h1w, h1h, '+1', canHire1);
        this._crewButtons.push({
          x: h1x, y: h1y, w: h1w, h: h1h,
          shipIndex: i, amount: 1, enabled: canHire1,
        });

        // Fill crew
        const deficit = ship.crewMax - ship.crewCurrent;
        const fillCost = deficit * CREW_HIRE_COST;
        const canFill = game.credits >= CREW_HIRE_COST && deficit > 1;
        const hFx = px + 355;
        const hFw = 80;
        this._renderSmallButton(ctx, hFx, h1y, hFw, h1h, `Fill ${fillCost}cr`, canFill);
        this._crewButtons.push({
          x: hFx, y: h1y, w: hFw, h: h1h,
          shipIndex: i, amount: deficit, enabled: canFill,
        });
      } else {
        ctx.font = '11px monospace';
        ctx.textAlign = 'left';
        ctx.fillStyle = DIM_TEXT;
        ctx.fillText('Full', px + 290, rowY + rowH / 2);
      }
    }
  }

  _renderTradeTab(ctx, px, py, panelW, panelH, game, accent) {
    const contentY = py + 106;
    this._tradeButtons = [];

    const cargoUsed = game.totalCargoUsed;
    const cargoCap = game.totalCargoCapacity;

    // Credits & cargo header
    ctx.font = '14px monospace';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillStyle = AMBER;
    ctx.fillText(`Credits: ${game.credits} cr`, px + 36, contentY);
    ctx.fillStyle = cargoUsed >= cargoCap ? RED : TEAL;
    ctx.fillText(`Cargo: ${cargoUsed}/${cargoCap}`, px + 270, contentY);

    // Scrap readout
    ctx.fillStyle = AMBER;
    ctx.fillText(`Scrap: ${game.scrap}`, px + 390, contentY);

    // Shift hint
    ctx.font = '11px monospace';
    ctx.fillStyle = DIM_TEXT;
    ctx.fillText('Hold Shift to trade x10', px + 36, contentY + 18);

    // Divider
    this._drawDivider(ctx, px, contentY + 24, panelW, CYAN);

    // Column headers
    const headerY = contentY + 32;
    ctx.font = '12px monospace';
    ctx.fillStyle = DIM_TEXT;
    ctx.textAlign = 'left';
    ctx.fillText('ITEM', px + 36, headerY);
    ctx.fillText('PRICE', px + 140, headerY);
    ctx.fillText('QTY', px + 240, headerY);

    // Commodity rows — include scrap
    const rowH = 28;
    const commodityIds = ['food', 'ore', 'tech', 'exotics', 'scrap'];
    const startRowY = contentY + 52;

    for (let i = 0; i < commodityIds.length; i++) {
      const id = commodityIds[i];
      const commodity = COMMODITIES[id];
      const supply = this.station.commodities[id] ?? 'none';
      const buyPrice = getBuyPrice(id, supply);
      const sellPrice = getSellPrice(id, supply);
      const isScrap = id === 'scrap';
      const qty = isScrap ? game.scrap : game.cargo[id];
      const rowY = startRowY + i * rowH;

      // Item name
      ctx.font = '14px monospace';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = CYAN;
      ctx.fillText(commodity.name, px + 36, rowY + rowH / 2);

      // Price
      ctx.fillStyle = buyPrice !== null ? AMBER : DIM_TEXT;
      ctx.fillText(buyPrice !== null ? `${buyPrice} cr` : '---', px + 140, rowY + rowH / 2);

      // Quantity
      ctx.fillStyle = qty > 0 ? TEAL : DIM_TEXT;
      ctx.fillText(`${qty}`, px + 240, rowY + rowH / 2);

      // Buy button
      const buyBtnX = px + 300;
      const buyBtnY = rowY + 2;
      const buyBtnW = 60;
      const buyBtnH = rowH - 4;
      const canBuy = buyPrice !== null && game.credits >= buyPrice && (isScrap || cargoUsed < cargoCap);

      this._renderSmallButton(ctx, buyBtnX, buyBtnY, buyBtnW, buyBtnH,
        buyPrice !== null ? 'Buy' : ' - ', canBuy);
      this._tradeButtons.push({
        x: buyBtnX, y: buyBtnY, w: buyBtnW, h: buyBtnH,
        action: 'buy', commodityId: id, enabled: canBuy,
      });

      // Sell button
      const sellBtnX = px + 372;
      const sellBtnY = rowY + 2;
      const sellBtnW = 60;
      const sellBtnH = rowH - 4;
      const canSell = qty > 0 && sellPrice !== null;

      this._renderSmallButton(ctx, sellBtnX, sellBtnY, sellBtnW, sellBtnH, 'Sell', canSell);
      this._tradeButtons.push({
        x: sellBtnX, y: sellBtnY, w: sellBtnW, h: sellBtnH,
        action: 'sell', commodityId: id, enabled: canSell,
      });
    }
  }

  _renderShipyardTab(ctx, px, py, panelW, panelH, game, accent) {
    const contentY = py + 106;
    this._shipyardButtons = [];

    // Credits & fleet count header
    ctx.font = '14px monospace';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillStyle = AMBER;
    ctx.fillText(`Credits: ${game.credits} cr`, px + 36, contentY);
    ctx.fillStyle = TEAL;
    ctx.fillText(`Fleet: ${game.fleet.length}/${MAX_FLEET_SIZE}`, px + 270, contentY);

    // Divider
    this._drawDivider(ctx, px, contentY + 22, panelW, CYAN);

    // BUY section header
    ctx.font = '12px monospace';
    ctx.fillStyle = DIM_TEXT;
    ctx.textAlign = 'left';
    ctx.fillText('AVAILABLE SHIPS', px + 36, contentY + 30);

    const rowH = 36;
    const shipyard = this.station.shipyard || [];
    let y = contentY + 50;

    for (const typeId of shipyard) {
      const spec = SHIP_TYPES[typeId];
      if (!spec) continue;

      ctx.font = '13px monospace';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = CYAN;
      ctx.fillText(spec.name, px + 36, y + rowH / 2);

      ctx.font = '11px monospace';
      ctx.fillStyle = DIM_TEXT;
      ctx.fillText(`A${spec.armor} H${spec.hull} S${spec.speed} C${spec.cargo}`, px + 130, y + rowH / 2);

      ctx.font = '12px monospace';
      ctx.fillStyle = AMBER;
      ctx.textAlign = 'right';
      ctx.fillText(`${spec.price} cr`, px + 360, y + rowH / 2);

      const canBuy = game.credits >= spec.price && game.fleet.length < MAX_FLEET_SIZE;
      const btnX = px + 372;
      const btnY2 = y + 6;
      const btnW = 60;
      const btnH = rowH - 12;
      this._renderSmallButton(ctx, btnX, btnY2, btnW, btnH, 'Buy', canBuy);
      this._shipyardButtons.push({
        x: btnX, y: btnY2, w: btnW, h: btnH,
        action: 'buy', shipTypeId: typeId, enabled: canBuy,
      });

      y += rowH;
    }

    // SELL section
    if (game.fleet.length > 0) {
      y += 10;
      this._drawDivider(ctx, px, y, panelW, CYAN);
      y += 10;

      ctx.font = '12px monospace';
      ctx.fillStyle = DIM_TEXT;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillText('YOUR FLEET', px + 36, y);
      y += 18;

      for (let i = 0; i < game.fleet.length; i++) {
        const ship = game.fleet[i];
        const spec = SHIP_TYPES[ship.shipType];
        if (!spec) continue;

        const hullPct = Math.round((ship.hullCurrent / ship.hullMax) * 100);
        const sellPrice = Math.floor(spec.price * 0.5);

        ctx.font = '13px monospace';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = CYAN;
        ctx.fillText(spec.name, px + 36, y + rowH / 2);

        ctx.font = '11px monospace';
        ctx.fillStyle = DIM_TEXT;
        ctx.fillText(`Hull ${hullPct}%`, px + 130, y + rowH / 2);

        ctx.font = '12px monospace';
        ctx.fillStyle = AMBER;
        ctx.textAlign = 'right';
        ctx.fillText(`${sellPrice} cr`, px + 360, y + rowH / 2);

        const btnX = px + 372;
        const btnY3 = y + 6;
        const btnW = 60;
        const btnH = rowH - 12;
        this._renderSmallButton(ctx, btnX, btnY3, btnW, btnH, 'Sell', true);
        this._shipyardButtons.push({
          x: btnX, y: btnY3, w: btnW, h: btnH,
          action: 'sell', fleetIndex: i, enabled: true,
        });

        y += rowH;
      }
    }
  }

  _renderSmallButton(ctx, x, y, w, h, label, enabled) {
    ctx.strokeStyle = enabled ? CYAN : VERY_DIM;
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, w, h);

    ctx.font = '12px monospace';
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

    if (input.wasJustClicked()) {
      const mx = input.mouseScreen.x;
      const my = input.mouseScreen.y;

      // Tab clicks
      for (const [tabId, rect] of Object.entries(this._tabRects)) {
        if (mx >= rect.x && mx <= rect.x + rect.w && my >= rect.y && my <= rect.y + rect.h) {
          this._activeTab = tabId;
          return;
        }
      }

      // Services tab buttons
      if (this._activeTab === 'services') {
        if (this._armorRepairBtn) {
          const b = this._armorRepairBtn;
          if (mx >= b.x && mx <= b.x + b.w && my >= b.y && my <= b.y + b.h) {
            if (b.canAfford) {
              game.credits -= b.cost;
              game.player.armorCurrent = game.player.armorMax;
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
              game.credits -= b.cost;
              game.fuel = game.fuelMax;
            }
            return;
          }
        }
        // Crew hire buttons
        const allShips = [game.player, ...game.fleet].filter(s => s && s.active);
        for (const btn of this._crewButtons) {
          if (mx >= btn.x && mx <= btn.x + btn.w && my >= btn.y && my <= btn.y + btn.h) {
            if (!btn.enabled) return;
            const ship = allShips[btn.shipIndex];
            if (!ship) return;
            const deficit = ship.crewMax - ship.crewCurrent;
            const canHire = Math.min(btn.amount, deficit, Math.floor(game.credits / CREW_HIRE_COST));
            if (canHire > 0) {
              ship.crewCurrent += canHire;
              game.credits -= canHire * CREW_HIRE_COST;
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
            const isScrap = btn.commodityId === 'scrap';
            const supply = this.station.commodities[btn.commodityId] ?? 'none';
            if (btn.action === 'buy') {
              const price = getBuyPrice(btn.commodityId, supply);
              if (price !== null) {
                for (let i = 0; i < batchSize; i++) {
                  if (game.credits < price) break;
                  if (!isScrap && game.totalCargoUsed >= game.totalCargoCapacity) break;
                  game.credits -= price;
                  if (isScrap) {
                    game.scrap++;
                  } else {
                    game.cargo[btn.commodityId]++;
                  }
                }
              }
            } else {
              const price = getSellPrice(btn.commodityId, supply);
              if (price !== null) {
                for (let i = 0; i < batchSize; i++) {
                  if (isScrap) {
                    if (game.scrap <= 0) break;
                    game.credits += price;
                    game.scrap--;
                  } else {
                    if (game.cargo[btn.commodityId] <= 0) break;
                    game.credits += price;
                    game.cargo[btn.commodityId]--;
                  }
                }
              }
            }
            return;
          }
        }
      }

      // Shipyard tab buttons
      if (this._activeTab === 'shipyard') {
        for (const btn of this._shipyardButtons) {
          if (mx >= btn.x && mx <= btn.x + btn.w && my >= btn.y && my <= btn.y + btn.h) {
            if (!btn.enabled) return;
            if (btn.action === 'buy') {
              const spec = SHIP_TYPES[btn.shipTypeId];
              if (spec && game.credits >= spec.price && game.fleet.length < MAX_FLEET_SIZE) {
                const factory = SHIP_FACTORIES[btn.shipTypeId];
                if (!factory) return;
                game.credits -= spec.price;
                const sx = this.station.x + (Math.random() - 0.5) * 100;
                const sy = this.station.y + (Math.random() - 0.5) * 100;
                const newShip = factory(sx, sy);
                game.fleet.push(newShip);
                game.entities.push(newShip);
                game.assignFormationOffsets();
              }
            } else if (btn.action === 'sell') {
              const ship = game.fleet[btn.fleetIndex];
              if (!ship) return;
              const spec = SHIP_TYPES[ship.shipType];
              const sellPrice = spec ? Math.floor(spec.price * 0.5) : 0;
              game.credits += sellPrice;
              ship.active = false;
              game.fleet.splice(btn.fleetIndex, 1);
              game.entities = game.entities.filter(e => e !== ship);
              game.assignFormationOffsets();
              game._enforceCargoCapacity();
            }
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
}
