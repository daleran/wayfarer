// ashveilTrade — trade conversation at Ashveil Anchorage.

import { COMMODITIES, getBuyPrice, getSellPrice } from '@/data/commodities.js';

export async function ashveilTrade(ctx) {
  const { game, station, log } = ctx;

  log.narrate("The trade post occupies a converted cargo module on the starboard hull. Salvaged display cases line the walls, each one a different era. A merchant works an abacus — the old kind, with actual beads.", 'flavor');

  if (!game.storyFlags?.met_ashveil_trader) {
    log.dialogue('Venn', "New customer. I buy, I sell, I don't ask where it came from. Fair?", '#aaff44');
    if (game.storyFlags) game.storyFlags.met_ashveil_trader = true;
  } else {
    log.dialogue('Venn', "What are you moving today?", '#aaff44');
  }

  const commodityIds = Object.keys(COMMODITIES).filter(id => {
    const supply = station.commodities?.[id] ?? 'none';
    const qty = game.cargo[id] ?? 0;
    return supply !== 'none' || qty > 0;
  });

  if (commodityIds.length === 0) {
    log.dialogue('Venn', "Nothing to trade right now. Check back later.", '#aaff44');
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
      npcOffering.push({ id, name: commodity.name, unit: 1, price: buyPrice, currency: 'scrap' });
    }
    if (sellPrice !== null && (game.cargo[id] ?? 0) > 0) {
      playerOffering.push({ id, name: commodity.name, unit: 1, price: sellPrice, currency: 'scrap' });
    }
  }

  const result = await log.barter({
    title: 'Ashveil Anchorage — Trade Post',
    npcOffering,
    playerOffering,
    emptyText: "Shelves are bare. Try after the next convoy.",
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

    if (totalCost > 0) log.result(`-${totalCost} scrap spent.`, 'amber');
    if (totalEarn > 0) log.result(`+${totalEarn} scrap earned.`, 'green');
    if (totalCost === 0 && totalEarn === 0) log.narrate('No trade made.', 'system');
    if (totalCost > 0 || totalEarn > 0) {
      log.dialogue('Venn', "Done. Come back when you've got more.", '#aaff44');
    }
  } else {
    log.dialogue('Venn', "Suit yourself.", '#aaff44');
  }
}
