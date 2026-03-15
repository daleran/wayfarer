// kellTrade — trade post conversation at Kell's Stop.

import { COMMODITIES, getBuyPrice, getSellPrice } from '@data/commodities.js';
import { registerContent } from '@data/dataRegistry.js';

export async function kellTrade(ctx) {
  const { game, station, log } = ctx;

  log.setNpcContext({
    trader: { name: 'Trader', color: '#ccaa44' },
  });

  log.narrate("A narrow counter behind a mesh partition. Crates and containers stacked floor to ceiling, labeled in grease pen. A trader works a manifest on a clipboard.", 'flavor');

  log.dln("Outbound cargo accepted. Prices reflect the difficulty of the run.", 'trader');

  const commodityIds = Object.keys(COMMODITIES).filter(id => {
    const supply = station.commodities?.[id] ?? 'none';
    const qty = game.cargo[id] ?? 0;
    return supply !== 'none' || qty > 0;
  });

  if (commodityIds.length === 0) {
    log.narrate('Nothing to trade.', 'system');
    return;
  }

  const npcOffering = [];
  const playerOffering = [];

  for (const id of commodityIds) {
    const commodity = COMMODITIES[id];
    const supply = station.commodities?.[id] ?? 'none';
    const buyPrice = getBuyPrice(id, supply);
    const sellPrice = getSellPrice(id, supply);

    if (buyPrice !== null) {
      npcOffering.push({
        id, name: commodity.name, unit: 1,
        price: buyPrice, currency: 'scrap',
      });
    }
    if (sellPrice !== null && (game.cargo[id] ?? 0) > 0) {
      playerOffering.push({
        id, name: commodity.name, unit: 1,
        price: sellPrice, currency: 'scrap',
      });
    }
  }

  const result = await log.barter({
    title: "Kell's Stop — Trade Post",
    npcOffering,
    playerOffering,
    emptyText: "Nothing in stock right now.",
  }, game);

  if (result.confirmed) {
    let totalCost = 0;
    let totalEarn = 0;

    for (const item of npcOffering) {
      const qty = result.quantities[item.id] || 0;
      if (qty > 0) {
        game.scrap -= qty * item.price;
        game.cargo[item.id] = (game.cargo[item.id] || 0) + qty;
        totalCost += qty * item.price;
      }
    }

    for (const item of playerOffering) {
      const qty = result.quantities[item.id] || 0;
      if (qty > 0) {
        game.scrap += qty * item.price;
        game.cargo[item.id] = Math.max(0, (game.cargo[item.id] || 0) - qty);
        totalEarn += qty * item.price;
      }
    }

    if (totalCost > 0) {
      log.dln("Pleasure doing business.", 'trader');
      log.result(`-${totalCost} scrap spent.`, 'amber');
    }
    if (totalEarn > 0) {
      log.dln("Fair enough. I'll take it.", 'trader');
      log.result(`+${totalEarn} scrap earned.`, 'green');
    }
    if (totalCost === 0 && totalEarn === 0) {
      log.dln("Changed your mind? Suit yourself.", 'trader');
    }
  } else {
    log.dln("Let me know if you change your mind.", 'trader');
  }
}

registerContent('conversations', 'kellTrade', kellTrade);
