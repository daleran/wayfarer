// ashveilRelations — faction standings at Ashveil Anchorage.

import { getRootFactions, getFactionName } from '@data/factionHelpers.js';
import { registerContent } from '@data/dataRegistry.js';

export async function ashveilRelations(ctx) {
  const { game, log } = ctx;

  log.narrate('A public terminal near the ops tower shows current faction standings.', 'flavor');

  for (const faction of getRootFactions()) {
    const label = getFactionName(faction);
    const standing = game.reputation.getStanding(faction);
    const level = game.reputation.getLevel(faction);
    const sign = standing >= 0 ? '+' : '';
    let color = 'amber';
    if (level === 'Hostile' || level === 'Wary') color = 'red';
    else if (level === 'Trusted' || level === 'Allied') color = 'green';
    log.result(`${label}: ${level} [${sign}${standing}]`, color);
  }
}

registerContent('conversations', 'ashveilRelations', ashveilRelations);
