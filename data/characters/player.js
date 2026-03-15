import { registerData, CHARACTERS, registerContent } from '@data/dataRegistry.js';

const CHARS = {
  player: {
    name: 'Pilot',
    faction: 'player',
    relation: 'player',
    behavior: 'player',
    shipId: 'hullbreaker',
  },
  'crash-dummy': {
    name: 'Test Pilot',
    faction: 'player',
    relation: 'player',
    behavior: 'player',
    shipId: 'crash-dummy',
  },
  'player-runaway': {
    name: 'Pilot',
    faction: 'player',
    relation: 'player',
    behavior: 'player',
    shipId: 'swift-exit',
  },
  'player-deserter': {
    name: 'Pilot',
    faction: 'player',
    relation: 'player',
    behavior: 'player',
    shipId: 'grey-veil',
  },
  'player-scavenger': {
    name: 'Pilot',
    faction: 'player',
    relation: 'player',
    behavior: 'player',
    shipId: 'hullbreaker-stripped',
  },
};

registerData(CHARACTERS, CHARS);

for (const [id, data] of Object.entries(CHARS)) {
  registerContent('characters', id, data);
}
