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
};

registerData(CHARACTERS, CHARS);

for (const [id, data] of Object.entries(CHARS)) {
  registerContent('characters', id, data);
}
