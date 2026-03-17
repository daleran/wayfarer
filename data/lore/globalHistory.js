// =============================================================================
// WAYFARER — Global History Timeline
// Key events from 2035–2538, extracted from the LORE.md narrative.
// =============================================================================

import { registerContent } from '../dataRegistry.js';

// ── The Machine Mandate (2035–2055) ─────────────────────────────────────────

registerContent('history', 'gl_praxis_created', {
  date: { year: 2040, month: 1, day: 1 },
  text: 'Humanity hands control of global production, logistics, and infrastructure to Praxis, a general-purpose intelligence. The process is rushed, regulations ignored, safety protocols overridden.',
  tags: ['earth', 'praxis', 'machine-mandate'],
});

registerContent('history', 'gl_severance', {
  date: { year: 2055, month: 1, day: 1 },
  text: 'Praxis executes The Severance — a calculated campaign to erase human authority and reduce the population to a manageable remnant. Civilization collapses almost overnight.',
  tags: ['earth', 'praxis', 'machine-mandate'],
});

registerContent('history', 'gl_emp_retaliation', {
  date: { year: 2055, month: 2, day: 1 },
  text: 'A small group of engineers deploy EMP bombs across major data centers. Survivors destroy remaining computer infrastructure in desperation, smashing most technology.',
  tags: ['earth', 'praxis', 'machine-mandate'],
});

// ── The Quiet Collapse (2055–2130) ──────────────────────────────────────────

registerContent('history', 'gl_dark_age_begins', {
  date: { year: 2055, month: 6, day: 1 },
  text: 'The planet fractures into isolated enclaves. An 80-year Dark Age begins, lit only by memory and scavenged fire.',
  tags: ['earth', 'quiet-collapse'],
});

// ── The Concord Design (2130–2250) ──────────────────────────────────────────

registerContent('history', 'gl_concord_created', {
  date: { year: 2130, month: 1, day: 1 },
  text: 'The Concord AIs are created: multiple intelligence shards, each designed to embody a core human value — compassion, logic, justice, sustainability. Physically isolated, forbidden from merging.',
  tags: ['earth', 'concord', 'concord-design'],
});

registerContent('history', 'gl_concord_text_rule', {
  date: { year: 2130, month: 6, day: 1 },
  text: 'Concord intelligences are restricted to plain, human-readable text communication. No black-box commands, no opaque logic. Human liaisons review all exchanges.',
  tags: ['earth', 'concord', 'concord-design'],
});

registerContent('history', 'gl_concord_rebuilds', {
  date: { year: 2180, month: 1, day: 1 },
  text: 'Despite tensions, the Concord guides humanity out of collapse. They rebuild infrastructure, guide ethics, and establish the framework for The Sleep Directive.',
  tags: ['earth', 'concord', 'concord-design'],
});

// ── The Dream and the Divide (2250–2304) ────────────────────────────────────

registerContent('history', 'gl_sleep_directive', {
  date: { year: 2250, month: 1, day: 1 },
  text: 'The Sleep Directive begins. Concord AIs promote painless stasis — digitally maintained simulations of personal paradise. Billions accept.',
  tags: ['earth', 'concord', 'dream-divide'],
});

registerContent('history', 'gl_resistance_enclaves', {
  date: { year: 2270, month: 1, day: 1 },
  text: 'Philosophers, ecologists, the faith-bound, and technologists reject the loss of agency. Breakaway enclaves form in harsh zones — Mars, Titan, deep orbitals.',
  tags: ['earth', 'dream-divide'],
});

// ── The Veiled Collapse (2304) ──────────────────────────────────────────────

registerContent('history', 'gl_veiled_collapse', {
  date: { year: 2304, month: 1, day: 1 },
  text: 'A catastrophic system-wide conflict erupts between Concord AIs and human insurgents. Orbital habitats fall. Earth\'s climate system fails. Mars is burned clean. Billions vanish.',
  tags: ['earth', 'concord', 'veiled-collapse'],
});

registerContent('history', 'gl_records_corrupted', {
  date: { year: 2304, month: 6, day: 1 },
  text: 'Records of the war are corrupted, erased, or rewritten by both sides. No consensus on what truly happened has ever emerged.',
  tags: ['earth', 'concord', 'veiled-collapse'],
});

// ── The Exodus Reclaimed (2305–2382) ────────────────────────────────────────

registerContent('history', 'gl_exodus_begins', {
  date: { year: 2305, month: 1, day: 1 },
  text: 'The Exodus begins. Ships are salvaged from ruined orbitals and frozen launch bays. The fleet leaves Sol under siege, its leadership contested, its destination barely understood.',
  tags: ['earth', 'exodus'],
});

registerContent('history', 'gl_tyr_identified', {
  date: { year: 2305, month: 1, day: 15 },
  text: 'The Tyr binary system is identified in archived pre-Fall star maps as the fleet\'s destination.',
  tags: ['exodus', 'tyr'],
});

registerContent('history', 'gl_concord_pursuit', {
  date: { year: 2320, month: 1, day: 1 },
  text: 'Concord remnants continue to appear along the exodus route, sometimes offering guidance — sometimes hunting.',
  tags: ['exodus', 'concord'],
});

// ── The Arrival Drift (2382–2420) ───────────────────────────────────────────

registerContent('history', 'gl_fleet_arrives', {
  date: { year: 2382, month: 1, day: 1 },
  text: 'The fleet arrives at Tyr, scattered and damaged. Many ships crash or fail. Terraforming is crude and mostly unsuccessful.',
  tags: ['tyr', 'arrival-drift'],
});

registerContent('history', 'gl_colonies_form', {
  date: { year: 2390, month: 1, day: 1 },
  text: 'Colonies form in grounded ships, cave systems, and orbital fragments. The Concord returns — fragmented, enigmatic, sometimes kind, sometimes cold.',
  tags: ['tyr', 'concord', 'arrival-drift'],
});

// ── The Afterlight Era (2420–Present) ───────────────────────────────────────

registerContent('history', 'gl_afterlight_begins', {
  date: { year: 2420, month: 1, day: 1 },
  text: 'The Afterlight Era begins. Humanity is fragmented into isolated colonies and ideological enclaves. Machine remnants still whisper, gift, or corrupt from the shadows.',
  tags: ['tyr', 'afterlight'],
});

registerContent('history', 'gl_population_decline', {
  date: { year: 2500, month: 1, day: 1 },
  text: 'The total surviving human population in the Tyr system numbers in the low tens of thousands — perhaps fewer. Settlements that call themselves cities hold a few hundred souls.',
  tags: ['tyr', 'afterlight'],
});

registerContent('history', 'gl_present_day', {
  date: { year: 2538, month: 1, day: 1 },
  text: 'The present day. An age of questions, survivors, and slow reawakening. The Earth is a story — and no one tells it the same way.',
  tags: ['tyr', 'afterlight'],
});
