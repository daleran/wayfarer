import { REPUTATION } from '@data/index.js';
import { getRootFactions, getRootFaction, areFactionsHostile } from '@data/factionHelpers.js';
import { CONTENT } from '@data/dataRegistry.js';

export class ReputationSystem {
  constructor() {
    // Init standings from root factions with their default reputation
    this.standings = {};
    for (const id of getRootFactions()) {
      const faction = CONTENT.factions[id];
      this.standings[id] = faction?.defaultReputation ?? 0;
    }
  }

  change(faction, delta) {
    if (!(faction in this.standings)) return;
    this.standings[faction] = Math.max(-100, Math.min(100, this.standings[faction] + delta));
  }

  onKill(faction) {
    const key = getRootFaction(faction);
    if (!(key in this.standings)) return;
    this.change(key, REPUTATION.KILL_PENALTY);
    // Rival bonus: factions hostile to the killed faction's root get a bonus
    for (const otherId of getRootFactions()) {
      if (otherId === key) continue;
      if (areFactionsHostile(key, otherId)) {
        this.change(otherId, REPUTATION.RIVAL_BONUS);
      }
    }
  }

  getStanding(faction) { return this.standings[faction] ?? 0; }

  getLevel(faction) {
    const s = this.getStanding(faction);
    if (s <= -50) return 'Hostile';
    if (s <= -10) return 'Wary';
    if (s <   10) return 'Neutral';
    if (s <   50) return 'Trusted';
    return 'Allied';
  }

  isHostile(faction) { return this.getStanding(faction) <= REPUTATION.HOSTILE_THRESHOLD; }
  isAllied(faction)  { return this.getStanding(faction) >= REPUTATION.ALLIED_THRESHOLD; }
}
