// ashveilBounties — bounty board conversation at Ashveil Anchorage.

export async function ashveilBounties(ctx) {
  const { game, station, log } = ctx;

  log.narrate("The bounty board sits in a narrow corridor between the engineering block and the ops tower. Three screens, mounted in a row. The middle one flickers.", 'flavor');

  if (!game.storyFlags?.met_ashveil_fixer) {
    log.dialogue('Dara', "You looking to earn? I post the contracts. I don't guarantee you come back.", '#ff8844');
    if (game.storyFlags) game.storyFlags.met_ashveil_fixer = true;
  } else {
    log.dialogue('Dara', "Checking the board?", '#ff8844');
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
    log.dialogue('Dara', "Board's empty. Nobody's paying to kill anyone right now. Give it time.", '#ff8844');
    return;
  }

  if (available.length === 0) {
    log.dialogue('Dara', "No new postings. You've got what you've got.", '#ff8844');
    return;
  }

  while (true) {
    if ((station.bounties ?? []).length === 0) {
      log.dialogue('Dara', "That's the lot.", '#ff8844');
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

    log.dialogue('Dara', `"${contract.targetName}." She pulls up a nav marker. "${contract.title}. ${contract.reward} scrap if you bring proof."`, '#ff8844');

    const confirm = await log.choices([
      { text: '[Take the contract]' },
      { text: '[Pass on this one]' },
    ]);

    if (confirm === 0) {
      const result = game.bounty.acceptBounty(station, contract, game.totalTime);
      if (result) {
        game.entities.push(result.targetEntity);
        game.ships.push(result.targetEntity);
        log.result('Contract accepted. Target marked on your nav.', 'cyan');
        log.dialogue('Dara', "Clock's ticking. Don't waste it.", '#ff8844');
      }
    }
  }
}
