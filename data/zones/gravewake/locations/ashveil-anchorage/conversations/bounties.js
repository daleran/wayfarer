// ashveilBounties — bounty board conversation at Ashveil Anchorage.

import { registerContent } from '@data/dataRegistry.js';

export async function ashveilBounties(ctx) {
  const { game, station, log } = ctx;

  log.setNpcContext({
    dara: { name: 'Dara', color: '#ff8844' },
  });

  log.narrate("The bounty board sits in a narrow corridor between the engineering block and the ops tower. Three screens, mounted in a row. The middle one flickers.", 'flavor');

  if (!game.storyFlags?.met_ashveil_fixer) {
    log.dln("You looking to earn? I post the contracts. I don't guarantee you come back.", 'dara');
    if (game.storyFlags) game.storyFlags.met_ashveil_fixer = true;
  } else {
    log.dln("Checking the board?", 'dara');
  }

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
    log.dln("Board's empty. Nobody's paying to kill anyone right now. Give it time.", 'dara');
    return;
  }

  if (available.length === 0) {
    log.dln("No new postings. You've got what you've got.", 'dara');
    return;
  }

  while (true) {
    if ((station.bounties ?? []).length === 0) {
      log.dln("That's the lot.", 'dara');
      return;
    }

    const options = [];
    for (const c of station.bounties) {
      options.push({ text: `[${c.title} — ${c.targetName} — ${c.reward} scrap]` });
    }
    options.push({ text: '[Walk away]' });

    const pick = await log.choices(options);
    if (pick < 0 || pick >= (station.bounties ?? []).length) return;

    const contract = station.bounties[pick];

    log.dln(`"${contract.targetName}." She pulls up a nav marker. "${contract.title}. ${contract.reward} scrap if you bring proof."`, 'dara');

    const confirm = await log.choices([
      { text: '[Take the contract]' },
      { text: '[Pass on this one]' },
    ]);

    if (confirm === 0) {
      const result = game.bounty.acceptBounty(station, contract, game.totalTime);
      if (result) {
        game.entities.push(result.targetEntity);
        game.ships.push(result.targetEntity);
        log.seq([
          "s::Contract accepted. Target marked on your nav.",
          "dara::Clock's ticking. Don't waste it.",
        ]);
      }
    }
  }
}

registerContent('conversations', 'ashveilBounties', ashveilBounties);
