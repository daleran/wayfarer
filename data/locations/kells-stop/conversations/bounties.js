// kellBounties — bounty board conversation at Kell's Stop.

import { registerContent } from '@data/dataRegistry.js';

export async function kellBounties(ctx) {
  const { game, station, log } = ctx;

  log.narrate("A single screen, chipped at the corner, bolted to a bulkhead near the ops module. The contracts scroll in amber text.", 'flavor');

  const available = station.bounties ?? [];
  const mine = (game.activeBounties ?? []).filter(b => b.stationId === station.id);

  // Show active bounties
  for (const bounty of mine) {
    if (bounty.status === 'completed') {
      log.result(`COMPLETE: ${bounty.contract.title} — reward collected on dock.`, 'green');
    } else if (bounty.status === 'expired') {
      log.result(`EXPIRED: ${bounty.contract.title}`, 'red');
    } else {
      const rem = Math.max(0, bounty.expiryTime - game.totalTime);
      const m = Math.floor(rem / 60);
      const s = Math.floor(rem % 60).toString().padStart(2, '0');
      log.narrate(`ACTIVE: ${bounty.contract.title} — ${m}:${s} remaining`, 'system');
    }
  }

  if (available.length === 0 && mine.length === 0) {
    log.narrate('The board is empty. No new contracts posted.', 'flavor');
    return;
  }

  if (available.length === 0) {
    log.narrate("No new contracts. The board's been picked clean.", 'flavor');
    return;
  }

  while (true) {
    if ((station.bounties ?? []).length === 0) {
      log.narrate("That's the last of them.", 'flavor');
      return;
    }

    const options = [];
    for (const c of station.bounties) {
      options.push({ text: `[${c.title} — Target: ${c.targetName} — ${c.reward} scrap]` });
    }
    options.push({ text: '[Walk away]' });

    const pick = await log.choices(options);
    if (pick < 0 || pick >= (station.bounties ?? []).length) return;

    const contract = station.bounties[pick];
    log.narrate(`${contract.title}. Target: "${contract.targetName}". Reward: ${contract.reward} scrap.`, 'system');

    const confirm = await log.choices([
      { text: '[Accept the contract]' },
      { text: '[Pass]' },
    ]);

    if (confirm === 0) {
      const result = game.bounty.acceptBounty(station, contract, game.totalTime);
      if (result) {
        game.entities.push(result.targetEntity);
        game.ships.push(result.targetEntity);
        log.result(`Contract accepted. Target marked on your nav.`, 'cyan');
      }
    }
  }
}

registerContent('conversations', 'kellBounties', kellBounties);
