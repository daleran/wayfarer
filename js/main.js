import { GameManager } from './game.js';
import { startLoop } from './loop.js';
import { TEST_MAP, TEST_STEPS } from './data/testMap.js';

const isTestMode = new URLSearchParams(window.location.search).has('test');

const options = isTestMode
  ? { map: TEST_MAP, testMode: true, testSteps: TEST_STEPS, startScrap: TEST_MAP.startScrap }
  : {};

const game = new GameManager(options);
game.init();
startLoop(game);
