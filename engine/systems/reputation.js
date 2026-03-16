import { REPUTATION, FACTIONS, FACTION_LABELS, FACTION_MAP, RIVALS } from '@data/index.js';
export { FACTIONS, FACTION_LABELS, FACTION_MAP };

export class ReputationSystem {
  constructor() {
    this.standings = Object.fromEntries(FACTIONS.map(f => [f, 0]));
  }

  change(faction, delta) {
    if (!(faction in this.standings)) return;
    this.standings[faction] = Math.max(-100, Math.min(100, this.standings[faction] + delta));
  }

  onKill(faction) {
    const key = FACTION_MAP[faction] ?? faction;
    if (!(key in this.standings)) return;
    this.change(key, REPUTATION.KILL_PENALTY);
    const rival = RIVALS[key];
    if (rival) this.change(rival, REPUTATION.RIVAL_BONUS);
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
