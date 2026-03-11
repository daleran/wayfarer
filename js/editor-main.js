import { GameManager } from './game.js';
import { startLoop } from './loop.js';
import { EditorOverlay } from './test/editor.js';

const param = new URLSearchParams(location.search).get('map') ?? 'arena';

let map;
if (param === 'blank') {
  const { MAP } = await import('./data/maps/blank.js');
  map = MAP;
} else if (param === 'tyr') {
  const { MAP } = await import('./data/maps/tyr.js');
  map = MAP;
} else if (param === 'arena') {
  const { MAP } = await import('./data/maps/arena.js');
  map = MAP;
} else {
  // fallback: arena
  const { MAP } = await import('./data/maps/arena.js');
  map = MAP;
}

const game = new GameManager({ map, testMode: true });
game.init();

const overlay = new EditorOverlay(game);

startLoop({
  update: (dt) => { game.update(dt); overlay.update(dt); },
  render: () => { game.render(); overlay.render(); },
});
