// kellRelations — faction standings at Kell's Stop.

import { FACTIONS, FACTION_LABELS } from '@data/index.js';
import { registerContent } from '@data/dataRegistry.js';

export async function kellRelations(ctx) {
  const { game, log } = ctx;

  log.narrate('You check the local net terminal. Faction standings scroll in dim text.', 'flavor');

  for (const faction of FACTIONS) {
    const label = FACTION_LABELS[faction];
    const standing = game.reputation.getStanding(faction);
    const level = game.reputation.getLevel(faction);
    const sign = standing >= 0 ? '+' : '';
    let color = 'amber';
    if (level === 'Hostile' || level === 'Wary') color = 'red';
    else if (level === 'Trusted' || level === 'Allied') color = 'green';
    log.result(`${label}: ${level} [${sign}${standing}]`, color);
  }
}

registerContent('conversations', 'kellRelations', kellRelations);
