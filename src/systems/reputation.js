import { REPUTATION } from '@data/index.js';

export const FACTIONS = ['settlements', 'scavengers', 'concord', 'monastic', 'communes', 'zealots', 'casimir'];

export const FACTION_LABELS = {
  settlements: 'Settlements',
  scavengers:  'Scavenger Clans',
  concord:     'Concord Remnants',
  monastic:    'Monastic Orders',
  communes:    'Communes',
  zealots:     'Zealots',
  casimir:     'House Casimir',
};

// Maps station/ship .faction string → reputation faction key
export const FACTION_MAP = {
  neutral:      'settlements',
  independent:  'settlements',
  salvage_lords:'scavengers',
  scavengers:   'scavengers',
  military:     'concord',
  monastic:     'monastic',
  communes:     'communes',
  zealots:      'zealots',
  casimir:      'casimir',
};

// Rival bonuses: kill faction X → rival faction gains bonus
const RIVALS = {
  scavengers: 'settlements',
  concord:    'settlements',
};

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
