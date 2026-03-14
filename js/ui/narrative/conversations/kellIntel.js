// kellIntel — intel/lore conversation at Kell's Stop.

export async function kellIntel(ctx) {
  const { game, log } = ctx;

  log.narrate("A cramped alcove near the ops module. A yellowed CRT terminal flickers on the wall, scrolling station logs nobody reads. An old man sits on a crate, nursing something from a dented flask.", 'flavor');

  if (!game.storyFlags?.met_kell_barkeep) {
    log.dialogue('Harlan', "Sit down if you want. Stand if you don't. Makes no difference to me.", '#aa8866');
    if (game.storyFlags) game.storyFlags.met_kell_barkeep = true;
  } else {
    log.dialogue('Harlan', "Back again. Must be bored out there.", '#aa8866');
  }

  while (true) {
    const options = [
      { text: '[Ask about this station]' },
      { text: '[Ask about the Gravewake]' },
      { text: '[Ask about the scavenger clans]' },
    ];

    if (game.storyFlags?.visited_ashveil) {
      options.push({ text: '[Ask about Ashveil Anchorage]' });
    }

    options.push({ text: '[Head back]' });

    const pick = await log.choices(options);

    switch (pick) {
      case 0:
        log.dialogue('Harlan', "Kell's been dead eleven years. Nobody's updated the sign. Station was a survey platform before that — fuel cache for deep-range prospectors. Kell bought it off a scrap lord. Turned it into what you see.", '#aa8866');
        log.dialogue('Harlan', "It's not much. But fuel's cheap and nobody asks questions. That's worth something out here.", '#aa8866');
        break;

      case 1:
        log.dialogue('Harlan', "The Gravewake's what's left of the old staging ground. When the fleet arrived, half the ships didn't make it past orbit. Broke apart, crashed, drifted. Three hundred years of metal, just floating.", '#aa8866');
        log.dialogue('Harlan', "Rich pickings if you don't mind the company. The clans run most of it. Concord drones sweep through now and then — nobody knows why.", '#aa8866');
        break;

      case 2:
        log.dialogue('Harlan', "Three big outfits. The Grave-Clan's the nastiest — ambush types. The Ironbacks run the outer perimeter. And there's always independents — hauler crews gone desperate.", '#aa8866');
        log.dialogue('Harlan', "Don't trust any of them. But if you're hauling scrap and you meet a Grave-Clan patrol? Drop something expensive and run. They'll stop to pick it up. Always do.", '#aa8866');
        break;

      case 3:
        log.dialogue('Harlan', "The Anchorage is what passes for civilized out here. Colony ship hull, bolted to itself six different ways. They've got a real trade post. Real mechanics. Real prices, too.", '#aa8866');
        log.dialogue('Harlan', "If you need something this station can't do — reactor work, heavy repairs — that's your destination. East of here, past the Boneyards.", '#aa8866');
        break;

      default:
        return;
    }
  }
}
