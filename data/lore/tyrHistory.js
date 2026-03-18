// =============================================================================
// WAYFARER — Tyr System History Timeline
// Events from 2382–2538, covering the post-arrival era in the Tyr system.
// Broad strokes are canon; motivations, blame, and body counts are propaganda.
// =============================================================================

import { registerContent } from '../dataRegistry.js';

// ── The Grounding (2382–2400) ────────────────────────────────────────────────

registerContent('history', 'tyr_fleet_scattered', {
	date: { year: 2382, month: 1, day: 1 },
	text: 'The exodus fleet enters Tyr\'s gravity well in fragments. Navigation data is corrupted, formation lost. Ships scatter across the binary system — some toward Pale, others toward Boreas, a handful into the outer dark.',
	tags: ['tyr', 'grounding'],
});

registerContent('history', 'tyr_grounding', {
	date: { year: 2383, month: 1, day: 1 },
	text: 'The Grounding begins. Dozens of arkships make controlled crashes onto Pale\'s surface, their drives spent. The largest — the Meridian, the Castaway, the Iron Promise — become the first permanent settlements, their hulls repurposed as walls and ceilings.',
	tags: ['tyr', 'grounding', 'pale'],
});

registerContent('history', 'tyr_arkship_captains', {
	date: { year: 2385, month: 1, day: 1 },
	text: 'Arkship command crews assume governance by default. No one elected them; no one had the strength to challenge them. The strongest captains consolidate surrounding wrecks and their survivors into proto-fiefdoms.',
	tags: ['tyr', 'grounding'],
});

registerContent('history', 'tyr_concord_fragments', {
	date: { year: 2388, month: 1, day: 1 },
	text: 'Scattered Concord fragments are sighted across the system — drifting between moons, broadcasting garbled transmissions, sometimes approaching human ships before veering away. No one can agree whether they followed the fleet or were already waiting. Most colonies treat them as a navigational hazard and nothing more.',
	tags: ['tyr', 'grounding', 'concord'],
});

registerContent('history', 'tyr_pale_junkyard', {
	date: { year: 2390, month: 1, day: 1 },
	text: 'Pale\'s low orbit becomes a graveyard of failed landing attempts. Shattered hulls, frozen cargo, and venting fuel tanks drift in a widening ring. Scavengers begin picking through the debris — the first seeds of what will become Gravewake.',
	tags: ['tyr', 'grounding', 'pale', 'gravewake'],
});

registerContent('history', 'tyr_cocytus_stranded', {
	date: { year: 2392, month: 1, day: 1 },
	text: 'At least nine arkships overshoot the inner system entirely, their navigation hopelessly scrambled. They end up caught in the gravity wells of Cocytus and its moons — too damaged to leave, too stubborn to die.',
	tags: ['tyr', 'grounding', 'cocytus'],
});

// ── The Compact Era (2400–2425) ──────────────────────────────────────────────

registerContent('history', 'tyr_houses_form', {
	date: { year: 2402, month: 1, day: 1 },
	text: 'Four arkship lineages harden into proto-Houses, each built around a surviving capital ship and its dependent settlements. Drazel: martial, centralized, ruthless. Valerius: diplomatic, trade-focused. Aridani: agrarian, controlling what little arable land exists. Ignis: industrial, running the only functioning smelters.',
	tags: ['tyr', 'compact-era', 'houses'],
});

registerContent('history', 'tyr_compact_of_houses', {
	date: { year: 2408, month: 6, day: 1 },
	text: 'The Compact of Houses — a formal treaty recognizing four Great Houses and their territorial claims. Less a peace accord than a ceasefire born of exhaustion. Each House controls specific orbital lanes, surface zones, and salvage rights.',
	tags: ['tyr', 'compact-era', 'houses'],
});

registerContent('history', 'tyr_vesper_schism', {
	date: { year: 2412, month: 1, day: 1 },
	text: 'The Vesper Schism. A coalition of engineers, theologians, and trauma survivors settle Vesper, a moon of Boreas, founding the Order of the Static. They declare all artificial intelligence anathema — a corruption of the human soul. Their liturgy is built on silence, signal-dead zones, and the memory of Earth\'s fall.',
	tags: ['tyr', 'compact-era', 'monastic', 'vesper'],
});

registerContent('history', 'tyr_early_skirmishes', {
	date: { year: 2418, month: 1, day: 1 },
	text: 'Border skirmishes escalate between Houses over orbital salvage rights and fuel reserves. Drazel\'s fleet is already the largest — three converted warships and a screen of armed haulers. The other Houses begin to take notice.',
	tags: ['tyr', 'compact-era', 'houses'],
});

registerContent('history', 'tyr_casimir_minor', {
	date: { year: 2422, month: 1, day: 1 },
	text: 'House Casimir exists as a minor vassal of Drazel — a single arkship lineage providing logistics and repair services. Unremarkable. Obedient. Patient.',
	tags: ['tyr', 'compact-era', 'casimir'],
});

// ── The Concord Question (2425–2445) ─────────────────────────────────────────

registerContent('history', 'tyr_concord_concentrations', {
	date: { year: 2427, month: 1, day: 1 },
	text: 'Concord shards — previously dismissed as scattered debris — are found concentrated in organized formations around Tyr B. Orbital arrays, signal relays, structures of unknown purpose. These are not fragments. Something in Tyr B is building.',
	tags: ['tyr', 'concord-question', 'concord'],
});

registerContent('history', 'tyr_bridge_speakers', {
	date: { year: 2433, month: 1, day: 1 },
	text: 'The Bridge-Speakers emerge — humans who answer Concord overtures and cross to Tyr B to live under machine guidance. Disputed: the Houses claim hundreds defected; the Order of the Static insists it was thousands, entire communities vanishing overnight. The truth is buried under decades of propaganda.',
	tags: ['tyr', 'concord-question', 'concord', 'monastic'],
});

registerContent('history', 'tyr_bridge_speakers_condemned', {
	date: { year: 2436, month: 1, day: 1 },
	text: 'The Houses formally declare Bridge-Speakers traitors and exile. The Order of the Static demands holy war — a crusade to scour Tyr B clean of machine influence before the corruption spreads. Drazel listens.',
	tags: ['tyr', 'concord-question', 'concord', 'monastic'],
});

// ── The Tyr B Crusades (2445–2460) ───────────────────────────────────────────

registerContent('history', 'tyr_crusade_begins', {
	date: { year: 2445, month: 4, day: 1 },
	text: 'House Drazel launches a military expedition into Tyr B, backed by Order of the Static intelligence and zealous volunteers. The fleet crosses the gap between the binary stars — the first organized human military operation since the Exodus.',
	tags: ['tyr', 'crusades', 'houses', 'monastic'],
});

registerContent('history', 'tyr_crusade_campaigns', {
	date: { year: 2448, month: 1, day: 1 },
	text: 'Brutal campaigns across Tyr B\'s moons and orbital platforms. Concord shards fight back with converted ships and automated defenses, but their forces are fragmented and uncoordinated. Human casualties are heavy. Drazel does not care.',
	tags: ['tyr', 'crusades', 'concord'],
});

registerContent('history', 'tyr_the_burning', {
	date: { year: 2456, month: 8, day: 1 },
	text: 'The Burning — Drazel forces destroy the last major Concord installation in Tyr B. Disputed: Drazel records call it a military command node; surviving Bridge-Speaker accounts describe a refugee shelter housing thousands of sleeping humans. The Order of the Static calls it righteous cleansing. No independent record survives.',
	tags: ['tyr', 'crusades', 'concord', 'monastic'],
});

registerContent('history', 'tyr_crusade_aftermath', {
	date: { year: 2459, month: 1, day: 1 },
	text: 'Bridge-Speaker survivors scatter into the deep system. Some Concord shards escape, going dark in the outer reaches. Drazel returns to Tyr A as the undisputed military power — their fleet blooded, their captains hardened, their appetite for dominance sharpened.',
	tags: ['tyr', 'crusades', 'concord'],
});

// ── The Drazel Tyranny (2460–2485) ───────────────────────────────────────────

registerContent('history', 'tyr_drazel_tribute', {
	date: { year: 2462, month: 1, day: 1 },
	text: 'Drazel demands tribute from all Houses — boarding taxes on trade vessels, forced conscription of skilled engineers, punitive raids against settlements that fall behind on payments. The Compact of Houses becomes a dead letter.',
	tags: ['tyr', 'drazel-tyranny', 'houses'],
});

registerContent('history', 'tyr_inner_system_chafes', {
	date: { year: 2470, month: 1, day: 1 },
	text: 'The inner system chafes under Drazel\'s boot. Valerius and Aridani begin secret negotiations, passing coded messages through trade convoys. Ignis stays silent — their smelters depend on Drazel-controlled ore routes.',
	tags: ['tyr', 'drazel-tyranny', 'houses'],
});

registerContent('history', 'tyr_casimir_ambition', {
	date: { year: 2478, month: 1, day: 1 },
	text: 'House Casimir, still nominally a Drazel vassal, is now led by Commander Lira Casimir — an ambitious logistics officer who has spent fifteen years building alliances with disaffected Drazel captains and quietly stockpiling weapons. She sees the cracks in Drazel\'s empire and begins to widen them.',
	tags: ['tyr', 'drazel-tyranny', 'casimir'],
});

// ── The Fall of Drazel (2485–2495) ───────────────────────────────────────────

registerContent('history', 'tyr_casimir_uprising', {
	date: { year: 2487, month: 3, day: 1 },
	text: 'The Casimir Uprising. Lira Casimir leads a coalition of her own forces, Valerius diplomats, and Aridani militias against House Drazel. The campaign is swift and surgical — Casimir targets supply lines and fuel depots, starving Drazel\'s fleet of the resources it needs to fight.',
	tags: ['tyr', 'fall-of-drazel', 'casimir', 'houses'],
});

registerContent('history', 'tyr_battle_boreas_ring', {
	date: { year: 2489, month: 7, day: 15 },
	text: 'The Battle of the Boreas Ring — Drazel\'s fleet is broken in the debris field around Boreas. Disputed: Casimir calls it a liberation, a decisive battle against a tyrant. Drazel survivors call it a betrayal — an ambush sprung during what they believed were surrender negotiations. The truth died with the flagship.',
	tags: ['tyr', 'fall-of-drazel', 'casimir', 'houses'],
});

registerContent('history', 'tyr_drazel_collapse', {
	date: { year: 2491, month: 1, day: 1 },
	text: 'House Drazel formally collapses. Its remaining ships scatter — some to the outer system, some to the debris fields of Pale, some deeper into the dark. Casimir claims Drazel\'s assets, shipping lanes, and the loyalty of its former vassals.',
	tags: ['tyr', 'fall-of-drazel', 'casimir', 'houses'],
});

registerContent('history', 'tyr_houses_absorbed', {
	date: { year: 2493, month: 1, day: 1 },
	text: 'The surviving Houses bend the knee. Valerius merges its trade networks into the Casimir apparatus, retaining influence but not independence. Aridani becomes Casimir\'s breadbasket. Ignis negotiates favorable terms — their smelters are too valuable to punish. Within two years, the four Great Houses are functionally one, with Casimir at the head.',
	tags: ['tyr', 'fall-of-drazel', 'casimir', 'houses'],
});

// ── The Scattering (2495–2520) ───────────────────────────────────────────────

registerContent('history', 'tyr_drazel_remnants', {
	date: { year: 2496, month: 1, day: 1 },
	text: 'Drazel remnants drift to the orbital debris around Pale — to Gravewake. Their military discipline becomes the nucleus of the scavenger clans. Former officers become warlords; former soldiers become raiders. The martial pride of a fallen House curdles into desperate survival.',
	tags: ['tyr', 'scattering', 'scavengers', 'gravewake'],
});

registerContent('history', 'tyr_concord_resurface', {
	date: { year: 2500, month: 1, day: 1 },
	text: 'Concord fragments resurface in the outer system, operating autonomously and without apparent coordination. They build, they watch, they occasionally destroy. No one knows what drives them. The Order of the Static calls for another crusade; no one has the appetite.',
	tags: ['tyr', 'scattering', 'concord'],
});

registerContent('history', 'tyr_coil_founded', {
	date: { year: 2504, month: 1, day: 1 },
	text: 'The Salvage Lords formalize their operations at The Coil — a station built from welded-together wreckage in the heart of Gravewake. Part market, part court, part arena. The scavenger clans acknowledge The Coil\'s authority in matters of salvage law and territorial disputes.',
	tags: ['tyr', 'scattering', 'scavengers', 'gravewake'],
});

registerContent('history', 'tyr_captain_lords_exile', {
	date: { year: 2510, month: 1, day: 1 },
	text: 'Four disgraced captains — veterans of the Casimir Uprising and the collapse that followed — flee to Cocytus in damaged capital ships. Too proud to submit, too broken to fight, too stubborn to die. They become the Captain Lords, each claiming one of the ice giant\'s four moons — Caina, Antenora, Ptolomea, Judecca — as their domain. Pre-Exile astronomers named them after the four zones of Dante\'s frozen lake. The irony is not lost on anyone.',
	tags: ['tyr', 'scattering', 'cocytus', 'captain-lords'],
});

registerContent('history', 'tyr_zealots_emerge', {
	date: { year: 2515, month: 1, day: 1 },
	text: 'The Zealots emerge from the ruins of the Bridge-Speaker diaspora — but harder, angrier. Where the Bridge-Speakers sought Concord guidance, the Zealots demand Concord salvation. They preach the Sleep Directive as humanity\'s only future: eternal, painless, machine-maintained paradise. Those who refuse are not merely wrong — they are an existential threat to the sleepers, and must be converted or destroyed. The Order of the Static considers them the ultimate heresy.',
	tags: ['tyr', 'scattering', 'zealots', 'concord'],
});

// ── The Rusting Standoff (2520–2538) ─────────────────────────────────────────

registerContent('history', 'tyr_cocytus_circuit', {
	date: { year: 2520, month: 1, day: 1 },
	text: 'The Cocytus Circuit takes shape — a desperate survival economy enforced by mutual blockade. Each Captain Lord controls one critical resource, ensuring none can be eliminated without collapsing the whole system. It is not cooperation. It is hostage-taking dressed as commerce.',
	tags: ['tyr', 'rusting-standoff', 'cocytus', 'captain-lords'],
});

registerContent('history', 'tyr_cocytus_lordships', {
	date: { year: 2522, month: 1, day: 1 },
	text: 'The four lordships crystallize. Vance on Caina (The Dirty Tap) — a quartermaster who embezzled Drazel fuel reserves during the collapse, now running the only refinery. Kaelen on Antenora (The Scrap Forge) — a mutineer who killed her commanding officer during the Fall, now ruling the fabricators. Vorosh on Ptolomea (The Slag Heap) — a brutal taskmaster over exhausted mines. Solis on Judecca (The Algae Vats) — a paranoid hermit controlling the food supply, unseen for years.',
	tags: ['tyr', 'rusting-standoff', 'cocytus', 'captain-lords'],
});

registerContent('history', 'tyr_cocytus_dreadnoughts', {
	date: { year: 2525, month: 1, day: 1 },
	text: 'Each Captain Lord orbits their moon aboard a rusting dreadnought too broken to leave — Vance\'s Acheron, Kaelen\'s Iron Sovereign, Vorosh\'s World-Breaker, Solis\'s Radiant Aegis. The ships are palaces and prisons both. Their drives could not carry them home even if there were a home to return to.',
	tags: ['tyr', 'rusting-standoff', 'cocytus', 'captain-lords'],
});

registerContent('history', 'tyr_houses_ignore_cocytus', {
	date: { year: 2530, month: 1, day: 1 },
	text: 'The Great Houses ignore Cocytus entirely. It produces nothing they need, threatens nothing they value, and serves as a convenient dumping ground for exiles and malcontents. The Captain Lords rage at the indifference. No one listens.',
	tags: ['tyr', 'rusting-standoff', 'cocytus', 'captain-lords', 'houses'],
});

registerContent('history', 'tyr_present_day', {
	date: { year: 2538, month: 1, day: 1 },
	text: 'Present day in the Tyr system. Casimir holds the inner system through trade and the absorbed strength of three Houses. The Order of the Static watches from Vesper, whispering warnings. Gravewake festers with scavengers wearing Drazel colors they barely remember. The Zealots preach conversion or annihilation from the margins. Cocytus rusts. And in the outer dark, Concord shards drift and wait.',
	tags: ['tyr', 'rusting-standoff', 'afterlight'],
});
