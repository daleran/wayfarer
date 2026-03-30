import { registerContent } from '@data/dataRegistry.js';

export async function originSelection(ctx) {
  const { log, game } = ctx;

  // ── Atmospheric opening ──────────────────────────────────────────────────
  log.seq([
    'Khem fills the viewport. Bone-white rock under a bruised sky. Crater domes glint in the unforgiving sunlight.',
    'Your cockpit hums. The orbital station is a bright point above the terminator line. Ice haulers crawl toward it from the outer dark.',
    'The Kesra Belt is a smear of grey behind you — asteroids, mining claims, and people who don\'t want to be found.',
    'Three people arrived at Khem this week. Each running from something. Each carrying a weight they can\'t put down.',
  ]);

  await log.contd();

  // ── The Combat Pilot ───────────────────────────────────────────────────
  log.seq([
    '--::The Combat Pilot',
    'The Corra Family raised her. Not out of kindness — out of investment. ' +
      'A belt kid, parents dead before she could remember, taken in by ' +
      'the family because orphans are cheap and loyal.',
    'They gave her a ship at sixteen. An old scout — rusty, barely armed, fast enough ' +
      'to run. Her first real job. A simple raid on a salvage craft in the Kesra Belt.',
    'A father and his son. Working an ore claim. The family wanted what was in the hold.',
  ]);

  await log.contd();

  log.seq([
    'The father tried to protect the boy. She was supposed to fire a warning shot. ' +
      'The gun kicked harder than she expected.',
    'The boy was left alive. She sat in the cockpit and listened to him crying over ' +
      'the comm while the others stripped the ship.',
    'In every story she\'d loved as a kid — the old tales of the Compact knights — ' +
      'she was the hero. The protector. Sitting in that cockpit, she realized she was the bandit.',
    'She didn\'t go back to the family.',
    'r::The Swift Exit. Stolen twice now.',
  ]);

  await log.contd();

  // ── The Salvage Kid ────────────────────────────────────────────────────
  log.seq([
    '--::The Salvage Kid',
    'The Kesra Belt was home. His father ran a small salvage operation — just the two ' +
      'of them, working ore claims and derelict hauls between Khem and the inner system.',
    'The Hullbreaker was ugly and stubborn, like him. An Onyx Class Tug held together ' +
      'by habit and welding flux. His father taught him to read hull stress patterns, to find ' +
      'the salvage that others missed.',
    'He was good at this life. Not rich, not safe, but good.',
  ]);

  await log.contd();

  log.seq([
    'The raiders came at shift change. Three ships, organized, professional. ' +
      'Not random belt pirates — they knew exactly where he\'d be.',
    'His father tried to run. The Onyx isn\'t fast. They caught them in an asteroid channel.',
    'He told the boy to hide in the cargo bay. The boots on the deck plates. Then the shot.',
    'They stripped the ship. Took the weapons, the good sensors, most of the fuel. ' +
      'Left the hull because it wasn\'t worth dragging.',
    'r::The Hullbreaker. Still breaking.',
  ]);

  await log.contd();

  // ── The Investigator ───────────────────────────────────────────────────
  log.seq([
    '--::The Investigator',
    'A private investigator. Small-time, inner system, mostly Aethelgard work — ' +
      'missing persons, insurance fraud, the occasional spousal tail. Enough to pay dock fees ' +
      'and keep the Grey Veil flying.',
    'The Corra Family found him through a mutual contact. A clean job, they said. ' +
      'Find a kid who ran away from the family. Sixteen years old, stole a ship, ' +
      'disappeared into the Kesra Belt a few weeks ago.',
    'The family pays well. He didn\'t ask why a crime syndicate needs a PI to find ' +
      'a runaway teenager.',
  ]);

  await log.contd();

  log.seq([
    'The trail led to Khem. Last known transponder ping near the orbital station. ' +
      'After that — nothing. The kid knows how to disappear, or someone taught her.',
    'The Corras gave him a name, a ship description, and a photo that might be three ' +
      'years old. They want the kid found. They didn\'t say what happens after.',
    'He\'s smart enough to know what happens after.',
    'The question is whether he\'s smart enough to care.',
    'r::The Grey Veil. Quiet, fast, forgettable.',
  ]);

  await log.contd();

  // ── Character selection (with back) ────────────────────────────────────
  log.seq([
    '--::Choose Your Path',
    'Three people. Three ships. One system full of secrets.',
  ]);

  let committed = false;
  while (!committed) {
    log.narrate('Who are you?', 'system');

    const originPick = await log.choices([
      { text: 'The Combat Pilot — a kid who pulled a trigger and couldn\'t live with it' },
      { text: 'The Salvage Kid — a hauler\'s child with a dead father and an empty hold' },
      { text: 'The Investigator — a private eye on a payroll they shouldn\'t have taken' },
    ]);

    if (originPick === 0) {
      committed = await _confirmCombatPilot(log, game);
    } else if (originPick === 1) {
      committed = await _confirmSalvageKid(log, game);
    } else {
      committed = await _confirmInvestigator(log, game);
    }
  }
}

// ── The Combat Pilot ────────────────────────────────────────────────────────

async function _confirmCombatPilot(log, game) {
  log.seq([
    'Khem. The nearest planet. The Corras don\'t operate here openly — too many Aridani patrols.',
    'But they know your face. They know you know names and routes. ' +
      'A liability is not something the family tolerates for long.',
    'The son is out there somewhere. That thought sits in your chest like a stone.',
  ]);

  log.narrate('When you fled, you took one thing from the ship\'s locker—', 'system');

  const subPick = await log.choices([
    { text: 'Extra ammunition — rounds the family won\'t miss' },
    { text: 'A data chip — Corra shipping routes and contact names' },
    { text: 'Go back' },
  ]);

  if (subPick === 2) return false;

  game.applyOrigin('player-combat-pilot', subPick === 0 ? 'ammo' : 'intel');

  log.seq([
    'r::The Swift Exit. Stolen twice now.',
  ]);

  await log.contd('Begin...');
  return true;
}

// ── The Salvage Kid ─────────────────────────────────────────────────────────

async function _confirmSalvageKid(log, game) {
  log.seq([
    'You limped to Khem on fumes. The orbital station took you in — dock fees ' +
      'waived, a mechanic who didn\'t ask questions.',
    'You don\'t know who sent those raiders. Just that they were organized. ' +
      'Professional. Someone paid for that hit.',
    'The Kesra Belt is full of answers. You just need a ship that flies and ' +
      'enough fuel to go looking.',
  ]);

  log.narrate('They missed one thing. You\'d hidden it before they boarded—', 'system');

  const subPick = await log.choices([
    { text: 'Spare parts — something to keep the ship running' },
    { text: 'Your father\'s emergency stash — every scrap he\'d saved' },
    { text: 'Go back' },
  ]);

  if (subPick === 2) return false;

  game.applyOrigin('player-salvage-kid', subPick === 0 ? 'parts' : 'scrap');

  log.seq([
    'r::The Hullbreaker. Still breaking.',
  ]);

  await log.contd('Begin...');
  return true;
}

// ── The Investigator ────────────────────────────────────────────────────────

async function _confirmInvestigator(log, game) {
  log.seq([
    'Khem Orbital. The docking queue is long — ice haulers have priority. ' +
      'You slot in behind a battered G100 and wait.',
    'The Corra Family knows your face now. That\'s a leash, not a relationship. ' +
      'Complete the job and walk away clean. Fail, and they\'ll find someone else. ' +
      'For both of you.',
    'Somewhere on this planet or in the belt beyond it, a scared kid is hiding. ' +
      'Your job is to find them.',
  ]);

  log.narrate('Before you left, the Corra contact offered you a choice—', 'system');

  const subPick = await log.choices([
    { text: 'An advance payment — scrap up front, the rest on delivery' },
    { text: 'A contact name — someone on Khem who owes the family a favor' },
    { text: 'Go back' },
  ]);

  if (subPick === 2) return false;

  game.applyOrigin('player-investigator', subPick === 0 ? 'scrap' : 'contact');

  log.seq([
    'r::The Grey Veil. Quiet, fast, forgettable.',
  ]);

  await log.contd('Begin...');
  return true;
}

registerContent('conversations', 'originSelection', originSelection);
