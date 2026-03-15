import { Designer } from './test/designer.js';
import { startLoop } from './loop.js';

const harness = new Designer();
harness.init();
startLoop(harness);
