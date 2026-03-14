// ashveilIntel — intel/lore conversation at Ashveil Anchorage.

export async function ashveilIntel(ctx) {
  const { game, log } = ctx;

  log.narrate("The upper hab module has been converted into a reading room of sorts — a handful of CRT terminals, a shelf of ROM cartridges, and a woman cataloguing data plates with a magnifying glass.", 'flavor');

  if (!game.storyFlags?.met_ashveil_archivist) {
    log.dialogue('Sable', "If you're here to read, sit down. If you're here to steal data cores, the door behind me is welded shut and rigged.", '#cc88ff');
    if (game.storyFlags) game.storyFlags.met_ashveil_archivist = true;
  } else {
    log.dialogue('Sable', "Back for more? Good. Most people don't care enough to ask.", '#cc88ff');
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
        log.dialogue('Sable', "This station was the colony ship Resolute. One of the seven that made it to Tyr. She crash-landed on an asteroid that's long since been mined to nothing. What's left is what you see — the hull, repurposed.", '#cc88ff');
        log.dialogue('Sable', "The Anchorage is neutral ground by tradition. Respected by necessity. Break the peace here and you'll find out how fast a community can turn on an outsider.", '#cc88ff');
        break;

      case 1:
        log.dialogue('Sable', "The Ashveil was a terraforming accident. Atmospheric processors dumped irradiated particulate for six years before anyone realized the target moon was already dead. The cloud never dispersed.", '#cc88ff');
        log.dialogue('Sable', "It's a navigation hazard. Sensors go blind in there. Void fauna thrive in the radiation. And something else lives in the deep cloud — something the Concord seems to be guarding.", '#cc88ff');
        break;

      case 2:
        log.dialogue('Sable', "The Concord AIs were built to disagree. Each one was a value shard — Compassion, Justice, Logic, Sustainability. Separate minds, separate goals, forbidden from merging.", '#cc88ff');
        log.dialogue('Sable', "Something went wrong. The Veiled Collapse destroyed most of them. The remnants that followed us to Tyr are... fragmentary. They still act on their directives, but the context is gone. A Justice Shard that hunts 'war criminals' doesn't know the war ended centuries ago.", '#cc88ff');
        log.dialogue('Sable', "Their ships are geometric. Silent. Perfect in ways that make human ships look like they were assembled by children. Which, in a sense, they were.", '#cc88ff');
        break;

      case 3:
        log.dialogue('Sable', "Seven arkships made it to Tyr. The Resolute — that's us. The Perseverance crashed on Thalassa. The Anvil landed intact and became Crucible Station. The rest broke apart, burned up, or drifted.", '#cc88ff');
        log.dialogue('Sable', "The Gravewake is where most of the wreckage ended up. The Boneyards too. Three hundred years of metal, just floating. We've been picking through it ever since.", '#cc88ff');
        break;

      case 4:
        log.dialogue('Sable', "Kell's Stop. Named after a woman who bought a survey platform off a scrap lord and turned it into a fuel cache. She's been dead eleven years. Nobody's renamed it.", '#cc88ff');
        log.dialogue('Sable', "It's useful — cheap fuel, no questions. Not a place to linger, though. The Gravewake patrols get thicker the closer you get.", '#cc88ff');
        break;

      default:
        return;
    }
  }
}
