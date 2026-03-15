import { registerContent } from '@data/dataRegistry.js';

export async function originSelection(ctx) {
  const { log, game } = ctx;

  // ── Atmospheric opening ──────────────────────────────────────────────────
  log.seq([
    'The void is still. Gravewake stretches in every direction — dead ships, frozen wreckage, silence.',
    'Your cockpit hums. Life support ticks. The scanner shows nothing alive for a hundred kilometers.',
    'You are at the edge of everything. Behind you, the inner system. Ahead, the graveyard.',
    'You didn\'t come here by accident.',
  ]);

  await log.contd();

  // ── Origin choice ────────────────────────────────────────────────────────
  log.narrate('Who are you?', 'system');

  const originPick = await log.choices([
    { text: 'The Runaway — a teenager who stole a ship and fled' },
    { text: 'The Deserter — a House Casimir scout who walked away' },
    { text: 'The Scavenger — a Gravewake native with nothing left' },
  ]);

  if (originPick === 0) {
    await _runRunaway(log, game);
  } else if (originPick === 1) {
    await _runDeserter(log, game);
  } else {
    await _runScavenger(log, game);
  }
}

// ── The Runaway ──────────────────────────────────────────────────────────────

async function _runRunaway(log, game) {
  log.seq([
    'You were sixteen when the foreman hit your father for the last time.',
    'Keelbreak\'s lower docks. Recycler shift change. Your father worked the smelters — ' +
      'twelve-hour shifts feeding scrap into the furnace. The foreman ran the crew like ' +
      'property. Quotas, docked rations, public beatings for slowness.',
    'That night your father didn\'t come home. They said it was a reactor leak. ' +
      'You saw the bruises before they sealed the bag.',
  ]);

  await log.contd();

  log.seq([
    'The foreman kept a courier docked at berth nine. A Maverick — fast, clean, too good ' +
      'for a man like him. You\'d watched the dock codes for weeks. You knew the shift gaps.',
    'You waited until the station dimmed for sleep cycle. Walked past the guard post with ' +
      'your father\'s tool bag. Punched the code. The docking clamps released without a sound.',
    'The Maverick\'s engines caught on the first try. You pointed the nose at the darkest ' +
      'part of the sky and pushed the throttle to full.',
    'You didn\'t look back.',
  ]);

  await log.contd();

  log.narrate('In the rush, you grabbed one thing from the berth locker—', 'system');

  const subPick = await log.choices([
    { text: 'A toolkit and spare parts — something to keep the ship running' },
    { text: 'A fuel canister — enough to keep flying a little longer' },
  ]);

  game.applyOrigin('player-runaway', subPick === 0 ? 'scrap' : 'fuel');

  log.seq([
    'Three days out. The fuel gauge dropping. Keelbreak\'s signal fading behind you.',
    'Gravewake opens ahead like a mouth. Dead ships in every direction.',
    'You renamed the ship. The foreman\'s name is gone from the registry.',
    'r::The Swift Exit. Yours now.',
  ]);

  await log.contd('Begin...');
}

// ── The Deserter ─────────────────────────────────────────────────────────────

async function _runDeserter(log, game) {
  log.seq([
    'House Casimir runs the tightest fleet in the inner system. You were part of it — ' +
      'a scout pilot, Cutter class, running the shipping lanes between Thalassa and the Shear.',
    'Paired patrols. Six-month rotations. Every burn logged, every contact filed, every ' +
      'gram of fuel accounted for. Casimir doesn\'t tolerate waste or initiative.',
    'Your patrol partner was Ren Alcazar. Thirty years in. Steady hands, quiet voice. ' +
      'He taught you to read engine signatures and to sleep with one eye on the scanner.',
  ]);

  await log.contd();

  log.seq([
    'The ambush came at the edge of the Boneyards. Three scavenger hulls, running dark. ' +
      'Ren saw them first — called the contact, turned to bracket. Textbook.',
    'Fleet command ordered you to hold position and wait for the frigate wing. ' +
      'Ren was already burning toward the contacts. You followed.',
    'The scavengers scattered. Ren chased the lead ship into a debris field. ' +
      'You lost his signal twelve seconds later.',
    'Command blamed you. Unauthorized pursuit. Failure to hold formation. ' +
      'They stripped your rank and scheduled a tribunal.',
  ]);

  await log.contd();

  log.narrate('The night before the hearing, you made a decision. You took one thing from the armory—', 'system');

  const subPick = await log.choices([
    { text: 'The service sidearm — extra ammunition for the autocannon' },
    { text: 'Encrypted comm logs — proof of what really happened' },
  ]);

  game.applyOrigin('player-deserter', subPick === 0 ? 'ammo' : 'rep');

  log.seq([
    'You repainted the hull in salvage grey. Ripped the fleet transponder. ' +
      'Sold one of the wing guns for fuel money at a border station.',
    'Casimir will be looking. They always look. Desertion is a capital offense — ' +
      'not because they fear losing pilots, but because they fear the precedent.',
    'Gravewake. The one place they won\'t follow. Too far, too lawless, too empty.',
    'r::The Grey Veil. A ghost ship for a ghost pilot.',
  ]);

  await log.contd('Begin...');
}

// ── The Scavenger ────────────────────────────────────────────────────────────

async function _runScavenger(log, game) {
  log.seq([
    'Gravewake is the only home you\'ve ever known. Born on a salvage barge, raised ' +
      'in the wreckage of dead ships. Your father ran the Hullbreaker — an Onyx Class Tug, ' +
      'old and stubborn, like him.',
    'He taught you to read hull stress patterns, to find the salvage that others missed, ' +
      'to strip a derelict clean in half the time. The Hullbreaker was always coming apart, ' +
      'and he was always putting it back together.',
    'You were good at this life. Not rich, not safe, but good.',
  ]);

  await log.contd();

  log.seq([
    'The scavenger clan hit at dawn cycle. Three ships, armed and organized. ' +
      'They wanted the Hullbreaker\'s fuel and whatever salvage was in the hold.',
    'Your father tried to run. The Onyx isn\'t fast. They caught you in a debris channel.',
    'He told you to hide in the cargo bay. You heard the docking clamps. ' +
      'The boots on the deck plates. Then the shot.',
    'They stripped the ship. Took the weapons, the good sensors, most of the fuel. ' +
      'Left the hull because it wasn\'t worth dragging.',
  ]);

  await log.contd();

  log.narrate('They missed one thing. You\'d hidden it before they boarded—', 'system');

  const subPick = await log.choices([
    { text: 'A spare reactor coil — trade goods worth real scrap' },
    { text: 'Your father\'s emergency stash — every scrap he\'d saved' },
  ]);

  game.applyOrigin('player-scavenger', subPick === 0 ? 'module' : 'scrap');

  log.seq([
    'You sat in the cockpit for a long time after they left. The scanner dark, ' +
      'the fuel gauge on empty, the ship groaning around you.',
    'The salvage scanner still works. The hull still holds pressure. ' +
      'The engine will turn over if you ask nicely.',
    'Your father\'s ship. Your ship now. Every system damaged, nothing in the tank, ' +
      'but the Gravewake is full of dead ships and you know how to take them apart.',
    'r::The Hullbreaker. Still breaking.',
  ]);

  await log.contd('Begin...');
}

registerContent('conversations', 'originSelection', originSelection);
