import { GameManager } from './game.js';
import { startLoop } from './loop.js';
import { TEST_MAP, TEST_STEPS } from './data/testMap.js';
import { TEST_CONFIG } from './data/testConfig.js';
import { ShipDesigner } from './test/shipDesigner.js';
import { PoiDesigner } from './test/poiDesigner.js';

const params = new URLSearchParams(window.location.search);

if (params.has('test-ships')) {
  const harness = new ShipDesigner();
  harness.init();
  startLoop(harness);

} else if (params.has('test-poi')) {
  const harness = new PoiDesigner();
  harness.init();
  startLoop(harness);

} else {
  const isTestMode = params.has('test');
  const options = isTestMode
    ? { map: TEST_MAP, testMode: true, testSteps: TEST_STEPS, ...TEST_CONFIG }
    : {};
  const game = new GameManager(options);
  game.init();
  startLoop(game);
}
