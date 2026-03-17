// ashveilIntel — intel/lore conversation at Ashveil Anchorage.

import { registerContent } from '@data/dataRegistry.js';

export async function ashveilIntel(ctx) {
  const { game, log } = ctx;

  log.setNpcContext({
    sable: { name: 'Sable', color: '#cc88ff' },
  });

  log.narrate("The upper hab module has been converted into a reading room of sorts — a handful of CRT terminals, a shelf of ROM cartridges, and a woman cataloguing data plates with a magnifying glass.", 'flavor');

  if (!game.storyFlags?.met_ashveil_archivist) {
    log.dln("If you're here to read, sit down. If you're here to steal data cores, the door behind me is welded shut and rigged.", 'sable');
    if (game.storyFlags) game.storyFlags.met_ashveil_archivist = true;
  } else {
    log.dln("Back for more? Good. Most people don't care enough to ask.", 'sable');
  }

  while (true) {
    const options = [
      { text: '[Ask about the Anchorage]' },
      { text: '[Ask about the Ashveil nebula]' },
      { text: '[Ask about the Concord remnants]' },
      { text: '[Ask about the colony ships]' },
    ];

    if (game.storyFlags?.visited_kells) {
      options.push({ text: "[Ask about Kell's Stop]" });
    }

    options.push({ text: '[Head back]' });

    const pick = await log.choices(options);

    switch (pick) {
      case 0:
        log.seq([
          "sable::This station was the colony ship Resolute. One of the seven that made it to Tyr. She crash-landed on an asteroid that's long since been mined to nothing. What's left is what you see — the hull, repurposed.",
          "sable::The Anchorage is neutral ground by tradition. Respected by necessity. Break the peace here and you'll find out how fast a community can turn on an outsider.",
        ]);
        break;

      case 1:
        log.seq([
          "sable::The Ashveil was a terraforming accident. Atmospheric processors dumped irradiated particulate for six years before anyone realized the target moon was already dead. The cloud never dispersed.",
          "sable::It's a navigation hazard. Sensors go blind in there. Void fauna thrive in the radiation. And something else lives in the deep cloud — something the Concord seems to be guarding.",
        ]);
        break;

      case 2:
        log.seq([
          "sable::The Concord AIs were built to disagree. Each one was a value shard — Compassion, Justice, Logic, Sustainability. Separate minds, separate goals, forbidden from merging.",
          "sable::Something went wrong. The Veiled Collapse destroyed most of them. The remnants that followed us to Tyr are... fragmentary. They still act on their directives, but the context is gone. A Justice Shard that hunts 'war criminals' doesn't know the war ended centuries ago.",
          "sable::Their ships are geometric. Silent. Perfect in ways that make human ships look like they were assembled by children. Which, in a sense, they were.",
        ]);
        break;

      case 3:
        log.seq([
          "sable::Seven arkships made it to Tyr. The Resolute — that's us. The Perseverance crashed on Thalassa. The Anvil landed intact and became Crucible Station. The rest broke apart, burned up, or drifted.",
          "sable::The Gravewake is where most of the wreckage ended up. The Boneyards too. Three hundred years of metal, just floating. We've been picking through it ever since.",
        ]);
        break;

      case 4:
        log.seq([
          "sable::Kell's Stop. Named after a woman who bought a survey platform off a scrap lord and turned it into a fuel cache. She's been dead eleven years. Nobody's renamed it.",
          "sable::It's useful — cheap fuel, no questions. Not a place to linger, though. The Gravewake patrols get thicker the closer you get.",
        ]);
        break;

      default:
        return;
    }
  }
}

registerContent('conversations', 'ashveilIntel', ashveilIntel);
