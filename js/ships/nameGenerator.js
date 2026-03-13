// Ship name generator — lore-appropriate vessel names for the Tyr system.
// Scavenger ships get rough, industrial names.
// Concord ships get cold serial designations.
// Neutral ships get practical trade/duty names.

const SCAVENGER_PREFIX = [
  'Iron', 'Rust', 'Ash', 'Bone', 'Scrap', 'Salt', 'Black', 'Blind',
  'Dead', 'Cold', 'Grim', 'Pale', 'Hollow', 'Broken', 'Bitter', 'Red',
  'Drift', 'Slag', 'Torn', 'Grey', 'Burnt', 'Last', 'Worn', 'Dark',
  'Scar', 'Bleak', 'Dim', 'Gaunt', 'Lean', 'Thin',
];

const SCAVENGER_SUFFIX = [
  'Fang', 'Wake', 'Spite', 'Nail', 'Tooth', 'Claw', 'Edge', 'Mark',
  'Burn', 'Cut', 'Spit', 'Haul', 'Grip', 'Drag', 'Hook', 'Scar',
  'Maw', 'Grit', 'Nerve', 'Rig', 'Shiv', 'Rend', 'Bolt', 'Weld',
  'Knot', 'Rust', 'Wrack', 'Thorn', 'Vow', 'Debt',
];

const NEUTRAL_PREFIX = [
  'Far', 'Long', 'Steady', 'Old', 'True', 'Swift', 'Safe', 'Sure',
  'Wide', 'Good', 'Clear', 'Fair', 'Hard', 'Strong', 'Bright', 'Still',
];

const NEUTRAL_SUFFIX = [
  'Haul', 'Run', 'Reach', 'Passage', 'Course', 'Berth', 'Keel', 'Mast',
  'Tow', 'Line', 'Anchor', 'Watch', 'Guard', 'Hold', 'Helm', 'Road',
];

const _used = new Set();

function _pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function _generateScavengerName() {
  for (let i = 0; i < 50; i++) {
    const name = _pick(SCAVENGER_PREFIX) + ' ' + _pick(SCAVENGER_SUFFIX);
    if (!_used.has(name)) { _used.add(name); return name; }
  }
  // Fallback with numeric suffix
  const name = _pick(SCAVENGER_PREFIX) + ' ' + _pick(SCAVENGER_SUFFIX) + '-' + Math.floor(Math.random() * 99);
  _used.add(name);
  return name;
}

function _generateConcordDesignation() {
  const serial = String(Math.floor(Math.random() * 900) + 100);
  const name = 'CNCRD-' + serial;
  if (_used.has(name)) return _generateConcordDesignation();
  _used.add(name);
  return name;
}

function _generateNeutralName() {
  for (let i = 0; i < 50; i++) {
    const name = _pick(NEUTRAL_PREFIX) + ' ' + _pick(NEUTRAL_SUFFIX);
    if (!_used.has(name)) { _used.add(name); return name; }
  }
  const name = _pick(NEUTRAL_PREFIX) + ' ' + _pick(NEUTRAL_SUFFIX) + '-' + Math.floor(Math.random() * 99);
  _used.add(name);
  return name;
}

/**
 * Generate a unique ship name based on faction.
 * @param {string} faction
 * @returns {string}
 */
export function generateShipName(faction) {
  if (faction === 'concord')  return _generateConcordDesignation();
  if (faction === 'neutral')  return _generateNeutralName();
  return _generateScavengerName();
}
