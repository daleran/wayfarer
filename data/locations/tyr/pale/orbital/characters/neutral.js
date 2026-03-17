import { registerData, CHARACTERS, registerContent } from '@data/dataRegistry.js';

const CHARS = {
  'convoy-hauler': {
    name: 'Convoy Hauler',
    faction: 'settlements',

    behavior: 'trader',
    shipId: 'trader-convoy',
    flavorText:
      'A working hauler running the circuit between settlements. Not brave, ' +
      'not foolish — just persistent. They know the route, they know the risks, ' +
      'and they keep showing up because someone has to. The settlements would ' +
      'starve without them.',
  },
  'militia-officer': {
    name: 'Militia Officer',
    faction: 'settlements',

    behavior: 'militia',
    shipId: 'militia-patrol',
    flavorText:
      'A settlement security officer on permanent patrol rotation. Steady, ' +
      'professional, and territorial. They enforce order within their zone ' +
      'and ignore everything outside it. Not your ally, but not your enemy — ' +
      'unless you make them one.',
  },
};

registerData(CHARACTERS, CHARS);

for (const [id, data] of Object.entries(CHARS)) {
  registerContent('characters', id, data);
}
