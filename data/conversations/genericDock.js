// genericDock — minimal fallback for stations without authored zone conversations.
// Wraps repair/fuel/trade/bounties/relations/reactor/intel into basic narrative.

import { REPUTATION } from '@data/index.js';
import { COMMODITIES, getBuyPrice, getSellPrice } from '@data/commodities.js';
import { FACTIONS, FACTION_LABELS } from '@data/index.js';
import { registerContent } from '@data/dataRegistry.js';

export async function genericDock(ctx) {
  const { game, station, log, zoneId } = ctx;
  const zone = station.layout?.zones?.find(z => z.id === zoneId);
  const services = zone?.services ?? [];

  log.setNpcContext({
    mechanic: { name: 'Mechanic', color: 'var(--p-cyan)' },
    fuel:     { name: 'Fuel Tech', color: 'var(--p-cyan)' },
    engineer: { name: 'Engineer', color: 'var(--p-cyan)' },
  });

  while (true) {
    const options = [];
    const actions = [];

    for (const svc of services) {
      switch (svc) {
        case 'repair': {
          const needsArmor = _needsArmor(game.player);
          const needsHull = game.player.hullCurrent < game.player.hullMax;
          const fuelNeeded = game.fuelMax - game.fuel;

          if (needsArmor) {
            options.push({ text: '[Repair armor]' });
            actions.push('repairArmor');
          }
          if (needsHull) {
            options.push({ text: '[Repair hull]' });
            actions.push('repairHull');
          }
          if (fuelNeeded > 0.5) {
            options.push({ text: '[Refuel]' });
            actions.push('refuel');
          }
          if (!needsArmor && !needsHull && fuelNeeded <= 0.5) {
            log.narrate('Ship is in good shape. Fuel tanks full.', 'system');
          }
          break;
        }
        case 'trade': {
          options.push({ text: '[Browse trade goods]' });
          actions.push('trade');
          break;
        }
        case 'bounties': {
          const available = station.bounties ?? [];
          const mine = (game.activeBounties ?? []).filter(b => b.stationId === station.id);
          if (available.length > 0 || mine.length > 0) {
            options.push({ text: '[Check the bounty board]' });
            actions.push('bounties');
          }
          break;
        }
        case 'relations': {
          options.push({ text: '[Check faction standings]' });
          actions.push('relations');
          break;
        }
        case 'reactor': {
          if (station.canOverhaulReactor) {
            const fissionMods = (game.player.moduleSlots ?? []).filter(m => m?.isFissionReactor);
            if (fissionMods.length > 0) {
              options.push({ text: '[Reactor overhaul]' });
              actions.push('reactor');
            }
          }
          break;
        }
        case 'intel': {
          if (station.lore?.length > 0) {
            options.push({ text: '[Ask around]' });
            actions.push('intel');
          }
          break;
        }
      }
    }

    options.push({ text: '[Go back]' });
    actions.push('back');

    const pick = await log.choices(options);
    if (pick < 0) return;

    const action = actions[pick];

    switch (action) {
      case 'repairArmor': await _repairArmor(game, station, log); break;
      case 'repairHull':  await _repairHull(game, station, log); break;
      case 'refuel':      await _refuel(game, station, log); break;
      case 'trade':       await _trade(game, station, log); break;
      case 'bounties':    await _bounties(game, station, log); break;
      case 'relations':   _relations(game, log); break;
      case 'reactor':     await _reactor(game, station, log); break;
      case 'intel':       _intel(station, log); break;
      case 'back':        return;
    }
  }
}

// ── Service implementations ─────────────────────────────────────────────────

function _needsArmor(player) {
  const a = player.armorArcs;
  const am = player.armorArcsMax;
  return a && am && (
    a.front < am.front || a.port < am.port ||
    a.starboard < am.starboard || a.aft < am.aft
  );
}

function _getDiscount(game, station) {
  const isAllied = game.reputation?.isAllied(station.reputationFaction) ?? false;
  return isAllied ? (1 - REPUTATION.DISCOUNT_RATE) : 1;
}

async function _repairArmor(game, station, log) {
  const player = game.player;
  const a = player.armorArcs;
  const am = player.armorArcsMax;
  const discount = _getDiscount(game, station);
  const dmg = Math.ceil(
    (am.front - a.front) + (am.port - a.port) +
    (am.starboard - a.starboard) + (am.aft - a.aft)
  );
  const cost = Math.ceil(dmg * discount);

  if (game.scrap < cost) {
    log.dln(`That'll be ${cost} scrap. You don't have enough.`, 'mechanic');
    return;
  }

  log.dln(`Armor's banged up. ${cost} scrap to patch it all.`, 'mechanic');

  const pick = await log.choices([
    { text: `[Pay ${cost} scrap]`, disabled: game.scrap < cost },
    { text: '[Not now]' },
  ]);

  if (pick === 0) {
    game.scrap -= cost;
    player.armorArcs.front = am.front;
    player.armorArcs.port = am.port;
    player.armorArcs.starboard = am.starboard;
    player.armorArcs.aft = am.aft;
    log.result(`-${cost} scrap. Armor restored.`, 'green');
  }
}

async function _repairHull(game, station, log) {
  const player = game.player;
  const discount = _getDiscount(game, station);
  const cost = Math.ceil((player.hullMax - player.hullCurrent) * 2 * discount);

  if (game.scrap < cost) {
    log.dln(`Hull work's ${cost} scrap. Come back when you have it.`, 'mechanic');
    return;
  }

  log.dln(`Hull integrity's low. ${cost} scrap for a full restore.`, 'mechanic');

  const pick = await log.choices([
    { text: `[Pay ${cost} scrap]`, disabled: game.scrap < cost },
    { text: '[Not now]' },
  ]);

  if (pick === 0) {
    game.scrap -= cost;
    player.hullCurrent = player.hullMax;
    log.result(`-${cost} scrap. Hull integrity restored.`, 'green');
  }
}

async function _refuel(game, station, log) {
  const discount = _getDiscount(game, station);
  const fuelNeeded = game.fuelMax - game.fuel;
  const cost = Math.ceil(fuelNeeded * 0.5 * discount);

  if (game.scrap < cost) {
    log.dln(`Full tank's ${cost} scrap. You're short.`, 'fuel');
    return;
  }

  log.dln(`Tank's at ${Math.floor(game.fuel)} out of ${game.fuelMax}. Full fill: ${cost} scrap.`, 'fuel');

  const halfCost = Math.ceil((fuelNeeded / 2) * 0.5 * discount);
  /** @type {Array<{text: string, disabled?: boolean}>} */
  const options = [
    { text: `[Full tank — ${cost} scrap]`, disabled: game.scrap < cost },
  ];
  if (fuelNeeded > 2) {
    options.push({
      text: `[Half tank — ${halfCost} scrap]`,
      disabled: game.scrap < halfCost,
    });
  }
  options.push({ text: '[Not now]' });

  const pick = await log.choices(options);

  if (pick === 0) {
    game.scrap -= cost;
    game.fuel = game.fuelMax;
    log.result(`-${cost} scrap. Fuel tanks full.`, 'green');
  } else if (pick === 1 && fuelNeeded > 2) {
    game.scrap -= halfCost;
    game.fuel = Math.min(game.fuelMax, game.fuel + fuelNeeded / 2);
    log.result(`-${halfCost} scrap. Half tank loaded.`, 'amber');
  }
}

async function _trade(game, station, log) {
  const commodityIds = Object.keys(COMMODITIES).filter(id => {
    const supply = station.commodities?.[id] ?? 'none';
    const qty = game.cargo[id] ?? 0;
    return supply !== 'none' || qty > 0;
  });

  if (commodityIds.length === 0) {
    log.narrate('Nothing to trade here.', 'system');
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
        id,
        name: commodity.name,
        unit: 1,
        price: buyPrice,
        currency: 'scrap',
      });
    }
    if (sellPrice !== null && (game.cargo[id] ?? 0) > 0) {
      playerOffering.push({
        id,
        name: commodity.name,
        unit: 1,
        price: sellPrice,
        currency: 'scrap',
      });
    }
  }

  const result = await log.barter({
    title: `${station.name} — Trade Post`,
    npcOffering,
    playerOffering,
  }, game);

  if (result.confirmed) {
    let totalCost = 0;
    let totalEarn = 0;

    // Process buys
    for (const item of npcOffering) {
      const qty = result.quantities[item.id] || 0;
      if (qty > 0) {
        const cost = qty * item.price;
        game.scrap -= cost;
        game.cargo[item.id] = (game.cargo[item.id] || 0) + qty;
        totalCost += cost;
      }
    }

    // Process sells
    for (const item of playerOffering) {
      const qty = result.quantities[item.id] || 0;
      if (qty > 0) {
        const earn = qty * item.price;
        game.scrap += earn;
        game.cargo[item.id] = Math.max(0, (game.cargo[item.id] || 0) - qty);
        totalEarn += earn;
      }
    }

    if (totalCost > 0) log.result(`-${totalCost} scrap spent.`, 'amber');
    if (totalEarn > 0) log.result(`+${totalEarn} scrap earned.`, 'green');
    if (totalCost === 0 && totalEarn === 0) log.narrate('No trade made.', 'system');
  } else {
    log.narrate('Trade cancelled.', 'system');
  }
}

async function _bounties(game, station, log) {
  const available = station.bounties ?? [];
  const mine = (game.activeBounties ?? []).filter(b => b.stationId === station.id);

  // Show active bounties
  for (const bounty of mine) {
    if (bounty.status === 'completed') {
      log.result(`BOUNTY COMPLETE: ${bounty.contract.title} — reward collected on dock.`, 'green');
    } else if (bounty.status === 'expired') {
      log.result(`EXPIRED: ${bounty.contract.title}`, 'red');
    } else {
      const rem = Math.max(0, bounty.expiryTime - game.totalTime);
      const m = Math.floor(rem / 60);
      const s = Math.floor(rem % 60).toString().padStart(2, '0');
      log.narrate(`ACTIVE: ${bounty.contract.title} — ${m}:${s} remaining`, 'system');
    }
  }

  // Offer available bounties
  if (available.length === 0) {
    log.narrate('No new contracts posted.', 'system');
    return;
  }

  for (const contract of available) {
    log.narrate(`${contract.title}: Target "${contract.targetName}" — ${contract.reward} scrap reward`, 'system');
  }

  const options = available.map(c => ({
    text: `[Accept: ${c.title} — ${c.reward} scrap]`,
  }));
  options.push({ text: '[Leave the board]' });

  const pick = await log.choices(options);
  if (pick >= 0 && pick < available.length) {
    const contract = available[pick];
    const result = game.bounty.acceptBounty(station, contract, game.totalTime);
    if (result) {
      game.entities.push(result.targetEntity);
      game.ships.push(result.targetEntity);
      log.result(`Contract accepted: ${contract.title}. Target spawned.`, 'cyan');
    }
  }
}

function _relations(game, log) {
  log.divider('FACTION STANDINGS');
  for (const faction of FACTIONS) {
    const label = FACTION_LABELS[faction];
    const standing = game.reputation.getStanding(faction);
    const level = game.reputation.getLevel(faction);
    const sign = standing >= 0 ? '+' : '';
    // Use result color based on level
    let color = 'amber';
    if (level === 'Hostile' || level === 'Wary') color = 'red';
    else if (level === 'Trusted' || level === 'Allied') color = 'green';
    log.result(`${label}: ${level} [${sign}${standing}]`, color);
  }
}

async function _reactor(game, station, log) {
  const fissionMods = (game.player.moduleSlots ?? []).filter(m => m?.isFissionReactor);

  for (const mod of fissionMods) {
    const canAfford = game.scrap >= mod.overhaulCost;

    if (mod.isOverdue) {
      log.dln(`Your ${mod.displayName} is overdue. Badly. ${mod.overhaulCost} scrap for a full overhaul.`, 'engineer');
    } else {
      const remaining = mod.overhaulInterval - mod.timeSinceOverhaul;
      const h = Math.floor(remaining / 3600);
      const m = Math.floor((remaining % 3600) / 60);
      log.dln(`${mod.displayName} — next overhaul in ${h}h ${m}m. ${mod.overhaulCost} scrap if you want it done now.`, 'engineer');
    }

    const pick = await log.choices([
      { text: `[Overhaul — ${mod.overhaulCost} scrap]`, disabled: !canAfford, reason: canAfford ? undefined : 'Not enough scrap' },
      { text: '[Skip]' },
    ]);

    if (pick === 0) {
      game.scrap -= mod.overhaulCost;
      mod.resetOverhaul();
      log.result(`-${mod.overhaulCost} scrap. ${mod.displayName} overhauled.`, 'green');
    }
  }
}

function _intel(station, log) {
  const lore = station.lore;
  if (!lore?.length) {
    log.narrate('Nothing new to learn here.', 'system');
    return;
  }

  for (const line of lore) {
    if (line === '') continue;
    const isHeading = line.startsWith('[') ||
      (line === line.toUpperCase() && line.length > 2 && !line.includes("'"));
    log.narrate(line, isHeading ? 'system' : 'flavor');
  }
}

registerContent('conversations', 'genericDock', genericDock);
