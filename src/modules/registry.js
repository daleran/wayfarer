// Module registry — resolves module ID strings via CONTENT.modules.
// Used by entities/registry.js and editor.js.

import { CONTENT } from '@data/index.js';

export function createModuleById(id) {
  // Support colon-delimited args (e.g. 'rocket-l:ht' → id='rocket-l', arg='ht')
  const colonIdx = id.indexOf(':');
  const baseId = colonIdx >= 0 ? id.slice(0, colonIdx) : id;
  const arg = colonIdx >= 0 ? id.slice(colonIdx + 1) : undefined;

  const entry = CONTENT.modules[baseId];
  if (!entry) throw new Error(`Unknown module: ${id}`);
  return arg ? entry.create(arg) : entry.create();
}
