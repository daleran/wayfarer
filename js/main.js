import { GameManager } from './game.js';
import { startLoop } from './loop.js';

const game = new GameManager();
game.init();
startLoop(game);
