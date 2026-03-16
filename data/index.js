// =============================================================================
// WAYFARER — Data Boot Loader
// Imports content files (triggering registration), then re-exports everything.
// =============================================================================

// ── Explicit imports (order matters — base tables before content) ────────────
import './factions.js';
import './modules/engines.js';
import './modules/reactors.js';
import './modules/sensors.js';
import './modules/weapons.js';
import './modules/utilities.js';
import './shipClasses.js';
import './aiBehaviors.js';
import './ammo.js';

// ── Auto-discover all content files (self-register via side effects) ─────────
// { eager: true } = synchronous, executes during module evaluation.
// Zone manifests are excluded — they don't self-register; maps import them.
import.meta.glob([
  './hulls/**/hull.js',
  './ships/player/*.js',
  './characters/player.js',
  './conversations/*.js',
  './zones/**/!(manifest).js',
], { eager: true });

// Re-export everything consumers need
export * from './tuning.js';
export { FACTIONS, FACTION_LABELS, FACTION_MAP, RIVALS } from './factions.js';
export { ENTITY, RELATION, CONDITION, LOOT_TYPE, ARC, MOUNT_SIZE, MOUNT_SLOT } from './enums.js';
export {
  SHIP_CLASSES,
  ENGINES,
  REACTORS,
  SENSORS,
  WEAPONS,
  UTILITIES,
  AI_TEMPLATES,
  AMMO,
  CHARACTERS,
  CONTENT,
  registerData,
  registerContent,
} from './dataRegistry.js';
