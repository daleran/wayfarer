import { GameManager } from './game.js';
import { startLoop } from './loop.js';
import { TEST_MAP, TEST_STEPS } from './data/testMap.js';
import { TEST_CONFIG } from './data/testConfig.js';

const params = new URLSearchParams(window.location.search);

const isTestMode = params.has('test');
const options = isTestMode
  ? { map: TEST_MAP, testMode: true, testSteps: TEST_STEPS, ...TEST_CONFIG }
  : {};
const game = new GameManager(options);
game.init();
startLoop(game);
