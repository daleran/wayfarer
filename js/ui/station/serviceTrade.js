import { COMMODITIES, getBuyPrice, getSellPrice } from '@/data/commodities.js';

export function buildTradePanel(container, station, game) {
  container.innerHTML = '';

  const cargoUsed = game.totalCargoUsed;
  const cargoCap  = game.totalCargoCapacity;

  // Stats
  const stats = document.createElement('div');
  stats.className = 'svc-stats';
  stats.innerHTML = `
    <div class="svc-stat">
      <span class="svc-stat-label">Scrap</span>
      <span class="svc-stat-value">${game.scrap}</span>
    </div>
    <div class="svc-stat">
      <span class="svc-stat-label">Cargo</span>
      <span class="svc-stat-value ${cargoUsed >= cargoCap ? 'red' : 'green'}">${cargoUsed} / ${cargoCap}</span>
    </div>
  `;
  container.appendChild(stats);

  const hint = document.createElement('div');
  hint.className = 'trade-shift-hint';
  hint.textContent = 'Hold Shift to trade ×10';
  container.appendChild(hint);

  // Build trade table
  const commodityIds = Object.keys(COMMODITIES).filter(id => {
    const supply = station.commodities?.[id] ?? 'none';
    const qty    = game.cargo[id] ?? 0;
    return supply !== 'none' || qty > 0;
  });

  if (commodityIds.length === 0) {
    const msg = document.createElement('div');
    msg.className = 'svc-status-dim';
    msg.textContent = 'No goods available.';
    container.appendChild(msg);
    return;
  }

  const table = document.createElement('table');
  table.className = 'trade-table';

  const thead = document.createElement('thead');
  thead.innerHTML = `<tr>
    <th>Item</th>
    <th>Price</th>
    <th>Qty</th>
    <th colspan="2"></th>
  </tr>`;
  table.appendChild(thead);

  const tbody = document.createElement('tbody');

  for (const id of commodityIds) {
    const commodity = COMMODITIES[id];
    const supply    = station.commodities?.[id] ?? 'none';
    const buyPrice  = getBuyPrice(id, supply);
    const sellPrice = getSellPrice(id, supply);
    const qty       = game.cargo[id] ?? 0;
    const canBuy    = buyPrice !== null && game.scrap >= buyPrice && cargoUsed < cargoCap;
    const canSell   = qty > 0 && sellPrice !== null;

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td class="trade-item">${commodity.name}</td>
      <td class="trade-price">${buyPrice !== null ? buyPrice + ' scrap' : '—'}</td>
      <td class="trade-qty${qty === 0 ? ' zero' : ''}">${qty}</td>
      <td><button class="trade-btn${canBuy ? ' can' : ''}" data-action="buy" data-id="${id}" ${canBuy ? '' : 'disabled'}>Buy</button></td>
      <td><button class="trade-btn${canSell ? ' can' : ''}" data-action="sell" data-id="${id}" ${canSell ? '' : 'disabled'}>Sell</button></td>
    `;
    tbody.appendChild(tr);
  }

  table.appendChild(tbody);
  container.appendChild(table);

  // Event delegation — shift-click for ×10
  table.addEventListener('click', e => {
    const btn = /** @type {HTMLButtonElement} */ (/** @type {Element} */ (e.target).closest('button[data-action]'));
    if (!btn || btn.disabled) return;

    const action = btn.dataset.action;
    const itemId = btn.dataset.id;
    const supply = station.commodities?.[itemId] ?? 'none';
    const batch  = e.shiftKey ? 10 : 1;

    if (action === 'buy') {
      const price = getBuyPrice(itemId, supply);
      if (price !== null) {
        for (let i = 0; i < batch; i++) {
          if (game.scrap < price) break;
          if (game.totalCargoUsed >= game.totalCargoCapacity) break;
          game.scrap -= price;
          game.cargo[itemId] = (game.cargo[itemId] || 0) + 1;
        }
      }
    } else {
      const price = getSellPrice(itemId, supply);
      if (price !== null) {
        for (let i = 0; i < batch; i++) {
          if ((game.cargo[itemId] || 0) <= 0) break;
          game.scrap += price;
          game.cargo[itemId]--;
        }
      }
    }

    buildTradePanel(container, station, game);
  });
}
