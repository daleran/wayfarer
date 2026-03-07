import { COMMODITIES, getBuyPrice, getSellPrice } from '../data/commodities.js';

const FACTION_COLORS = {
  neutral:     '#4af',
  independent: '#8f4',
  military:    '#f84',
  pirates:     '#f84',
};

export class StationScreen {
  constructor() {
    this.visible = false;
    this.station = null;
    this._activeTab = 'services';
    this._repairBtn = null;
    this._closeBtn = null;
    this._tradeButtons = [];
    this._tabRects = {};
  }

  open(station) {
    this.visible = true;
    this.station = station;
    this._activeTab = 'services';
  }

  close() {
    this.visible = false;
    this.station = null;
  }

  render(ctx, game) {
    if (!this.visible || !this.station) return;

    const W = game.camera.width;
    const H = game.camera.height;

    // Full-screen backdrop
    ctx.fillStyle = 'rgba(0, 5, 20, 0.8)';
    ctx.fillRect(0, 0, W, H);

    // Centered panel
    const panelW = 400;
    const panelH = 380;
    const px = (W - panelW) / 2;
    const py = (H - panelH) / 2;
    const color = FACTION_COLORS[this.station.faction] ?? '#4af';

    ctx.fillStyle = '#050d1a';
    ctx.fillRect(px, py, panelW, panelH);
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5;
    ctx.strokeRect(px, py, panelW, panelH);

    // Station name header
    ctx.font = 'bold 18px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillStyle = color;
    ctx.fillText(this.station.name, W / 2, py + 20);

    // Divider
    this._drawDivider(ctx, px, py + 50, panelW, color);

    // Tab bar
    this._renderTabs(ctx, px, py, panelW, color);

    // Divider below tabs
    this._drawDivider(ctx, px, py + 82, panelW, color);

    // Tab content
    if (this._activeTab === 'services') {
      this._renderServicesTab(ctx, px, py, panelW, panelH, game, color);
    } else {
      this._renderTradeTab(ctx, px, py, panelW, panelH, game, color);
    }

    // Close button
    const closeBtnX = px + 30;
    const closeBtnY = py + panelH - 56;
    const closeBtnW = panelW - 60;
    const closeBtnH = 36;

    ctx.fillStyle = 'rgba(80, 80, 100, 0.2)';
    ctx.fillRect(closeBtnX, closeBtnY, closeBtnW, closeBtnH);
    ctx.strokeStyle = '#446';
    ctx.lineWidth = 1;
    ctx.strokeRect(closeBtnX, closeBtnY, closeBtnW, closeBtnH);

    ctx.font = '13px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#88a';
    ctx.fillText('Close  [Esc / E]', W / 2, closeBtnY + closeBtnH / 2);

    this._closeBtn = { x: closeBtnX, y: closeBtnY, w: closeBtnW, h: closeBtnH };
  }

  _drawDivider(ctx, px, y, panelW, color) {
    ctx.strokeStyle = color;
    ctx.globalAlpha = 0.3;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(px + 20, y);
    ctx.lineTo(px + panelW - 20, y);
    ctx.stroke();
    ctx.globalAlpha = 1;
  }

  _renderTabs(ctx, px, py, panelW, color) {
    const tabs = [
      { id: 'services', label: 'Services' },
      { id: 'trade', label: 'Trade' },
    ];
    const tabW = 100;
    const tabH = 22;
    const tabY = py + 58;
    const startX = px + 30;

    this._tabRects = {};
    ctx.font = '13px monospace';
    ctx.textBaseline = 'middle';

    for (let i = 0; i < tabs.length; i++) {
      const tab = tabs[i];
      const tx = startX + i * (tabW + 16);
      const active = this._activeTab === tab.id;

      this._tabRects[tab.id] = { x: tx, y: tabY, w: tabW, h: tabH };

      ctx.textAlign = 'center';
      ctx.fillStyle = active ? color : '#556';
      ctx.fillText(tab.label, tx + tabW / 2, tabY + tabH / 2);

      if (active) {
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(tx, tabY + tabH);
        ctx.lineTo(tx + tabW, tabY + tabH);
        ctx.stroke();
      }
    }
  }

  _renderServicesTab(ctx, px, py, panelW, panelH, game, color) {
    const contentY = py + 90;

    // Credits readout
    ctx.font = '14px monospace';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillStyle = '#fd8';
    ctx.fillText(`Credits: ${game.credits} cr`, px + 30, contentY);

    // Repair Hull button
    const player = game.player;
    const needsRepair = player.hullCurrent < player.hullMax;
    if (needsRepair) {
      const cost = Math.ceil((player.hullMax - player.hullCurrent) * 2);
      const canAfford = game.credits >= cost;
      const btnX = px + 30;
      const btnY = contentY + 40;
      const btnW = panelW - 60;
      const btnH = 36;

      ctx.fillStyle = canAfford ? 'rgba(68, 170, 255, 0.15)' : 'rgba(80, 80, 80, 0.15)';
      ctx.fillRect(btnX, btnY, btnW, btnH);
      ctx.strokeStyle = canAfford ? '#4af' : '#555';
      ctx.lineWidth = 1;
      ctx.strokeRect(btnX, btnY, btnW, btnH);

      ctx.font = '13px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = canAfford ? '#8ef' : '#666';
      ctx.fillText(`Repair Hull — ${cost} cr`, btnX + btnW / 2, btnY + btnH / 2);

      this._repairBtn = { x: btnX, y: btnY, w: btnW, h: btnH, cost, canAfford };
    } else {
      this._repairBtn = null;
      ctx.font = '13px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillStyle = '#4fa';
      ctx.fillText('Hull at full integrity', px + panelW / 2, contentY + 48);
    }
  }

  _renderTradeTab(ctx, px, py, panelW, panelH, game, color) {
    const contentY = py + 90;
    this._tradeButtons = [];

    const cargoUsed = Object.values(game.cargo).reduce((s, v) => s + v, 0);
    const cargoCap = game.player.cargoCapacity;

    // Credits & cargo header
    ctx.font = '13px monospace';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillStyle = '#fd8';
    ctx.fillText(`Credits: ${game.credits} cr`, px + 30, contentY);
    ctx.fillStyle = cargoUsed >= cargoCap ? '#f84' : '#8bf';
    ctx.fillText(`Cargo: ${cargoUsed}/${cargoCap}`, px + 220, contentY);

    // Divider
    this._drawDivider(ctx, px, contentY + 20, panelW, color);

    // Column headers
    const headerY = contentY + 28;
    ctx.font = '11px monospace';
    ctx.fillStyle = '#556';
    ctx.textAlign = 'left';
    ctx.fillText('ITEM', px + 30, headerY);
    ctx.fillText('PRICE', px + 120, headerY);
    ctx.fillText('QTY', px + 200, headerY);

    // Commodity rows
    const rowH = 26;
    const commodityIds = ['food', 'ore', 'tech', 'exotics'];
    const startRowY = contentY + 46;

    for (let i = 0; i < commodityIds.length; i++) {
      const id = commodityIds[i];
      const commodity = COMMODITIES[id];
      const supply = this.station.commodities[id] ?? 'none';
      const buyPrice = getBuyPrice(id, supply);
      const sellPrice = getSellPrice(id, supply);
      const qty = game.cargo[id];
      const rowY = startRowY + i * rowH;

      // Item name
      ctx.font = '13px monospace';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#cdf';
      ctx.fillText(commodity.name, px + 30, rowY + rowH / 2);

      // Price
      ctx.fillStyle = buyPrice !== null ? '#fd8' : '#445';
      ctx.fillText(buyPrice !== null ? `${buyPrice} cr` : '---', px + 120, rowY + rowH / 2);

      // Quantity
      ctx.fillStyle = qty > 0 ? '#8bf' : '#445';
      ctx.fillText(`${qty}`, px + 200, rowY + rowH / 2);

      // Buy button
      const buyBtnX = px + 248;
      const buyBtnY = rowY + 2;
      const buyBtnW = 50;
      const buyBtnH = rowH - 4;
      const canBuy = buyPrice !== null && game.credits >= buyPrice && cargoUsed < cargoCap;

      this._renderSmallButton(ctx, buyBtnX, buyBtnY, buyBtnW, buyBtnH,
        buyPrice !== null ? 'Buy' : ' - ', canBuy);
      this._tradeButtons.push({
        x: buyBtnX, y: buyBtnY, w: buyBtnW, h: buyBtnH,
        action: 'buy', commodityId: id, enabled: canBuy,
      });

      // Sell button
      const sellBtnX = px + 308;
      const sellBtnY = rowY + 2;
      const sellBtnW = 50;
      const sellBtnH = rowH - 4;
      const canSell = qty > 0 && sellPrice !== null;

      this._renderSmallButton(ctx, sellBtnX, sellBtnY, sellBtnW, sellBtnH, 'Sell', canSell);
      this._tradeButtons.push({
        x: sellBtnX, y: sellBtnY, w: sellBtnW, h: sellBtnH,
        action: 'sell', commodityId: id, enabled: canSell,
      });
    }
  }

  _renderSmallButton(ctx, x, y, w, h, label, enabled) {
    ctx.fillStyle = enabled ? 'rgba(68, 170, 255, 0.15)' : 'rgba(80, 80, 80, 0.1)';
    ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = enabled ? '#4af' : '#333';
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, w, h);

    ctx.font = '11px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = enabled ? '#8ef' : '#444';
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
      if (this._activeTab === 'services' && this._repairBtn) {
        const b = this._repairBtn;
        if (mx >= b.x && mx <= b.x + b.w && my >= b.y && my <= b.y + b.h) {
          if (b.canAfford) {
            game.credits -= b.cost;
            game.player.hullCurrent = game.player.hullMax;
          }
          return;
        }
      }

      // Trade tab buttons
      if (this._activeTab === 'trade') {
        for (const btn of this._tradeButtons) {
          if (mx >= btn.x && mx <= btn.x + btn.w && my >= btn.y && my <= btn.y + btn.h) {
            if (!btn.enabled) return;
            const supply = this.station.commodities[btn.commodityId] ?? 'none';
            if (btn.action === 'buy') {
              const price = getBuyPrice(btn.commodityId, supply);
              if (price !== null && game.credits >= price) {
                const used = Object.values(game.cargo).reduce((s, v) => s + v, 0);
                if (used < game.player.cargoCapacity) {
                  game.credits -= price;
                  game.cargo[btn.commodityId]++;
                }
              }
            } else {
              const price = getSellPrice(btn.commodityId, supply);
              if (price !== null && game.cargo[btn.commodityId] > 0) {
                game.credits += price;
                game.cargo[btn.commodityId]--;
              }
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
