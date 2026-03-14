// =============================================================================
// WAYFARER — Data Boot Loader
// Imports content files (triggering registration), then re-exports everything.
// =============================================================================

// Boot — import content files to trigger registration
import './engines.js';
import './reactors.js';
import './sensors.js';
import './weapons.js';
import './utilities.js';
import './shipClasses.js';
import './namedShips.js';
import './aiBehaviors.js';
import './ammo.js';

// Re-export everything consumers need
export * from './tuning.js';
export {
  SHIP_CLASSES,
  NPC_SHIPS,
  ENGINES,
  REACTORS,
  SENSORS,
  WEAPONS,
  UTILITIES,
  AI_TEMPLATES,
  AMMO,
  registerData,
} from './dataRegistry.js';
