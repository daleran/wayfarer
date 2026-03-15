// kellIntel — intel/lore conversation at Kell's Stop.

import { registerContent } from '@data/dataRegistry.js';

export async function kellIntel(ctx) {
  const { game, log } = ctx;

  log.setNpcContext({
    harlan: { name: 'Harlan', color: '#aa8866' },
  });

  log.narrate("A cramped alcove near the ops module. A yellowed CRT terminal flickers on the wall, scrolling station logs nobody reads. An old man sits on a crate, nursing something from a dented flask.", 'flavor');

  if (!game.storyFlags?.met_kell_barkeep) {
    log.dln("Sit down if you want. Stand if you don't. Makes no difference to me.", 'harlan');
    if (game.storyFlags) game.storyFlags.met_kell_barkeep = true;
  } else {
    log.dln("Back again. Must be bored out there.", 'harlan');
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
        log.seq([
          "harlan::Kell's been dead eleven years. Nobody's updated the sign. Station was a survey platform before that — fuel cache for deep-range prospectors. Kell bought it off a scrap lord. Turned it into what you see.",
          "harlan::It's not much. But fuel's cheap and nobody asks questions. That's worth something out here.",
        ]);
        break;

      case 1:
        log.seq([
          "harlan::The Gravewake's what's left of the old staging ground. When the fleet arrived, half the ships didn't make it past orbit. Broke apart, crashed, drifted. Three hundred years of metal, just floating.",
          "harlan::Rich pickings if you don't mind the company. The clans run most of it. Concord drones sweep through now and then — nobody knows why.",
        ]);
        break;

      case 2:
        log.seq([
          "harlan::Three big outfits. The Grave-Clan's the nastiest — ambush types. The Ironbacks run the outer perimeter. And there's always independents — hauler crews gone desperate.",
          "harlan::Don't trust any of them. But if you're hauling scrap and you meet a Grave-Clan patrol? Drop something expensive and run. They'll stop to pick it up. Always do.",
        ]);
        break;

      case 3:
        log.seq([
          "harlan::The Anchorage is what passes for civilized out here. Colony ship hull, bolted to itself six different ways. They've got a real trade post. Real mechanics. Real prices, too.",
          "harlan::If you need something this station can't do — reactor work, heavy repairs — that's your destination. East of here, past the Boneyards.",
        ]);
        break;

      default:
        return;
    }
  }
}

registerContent('conversations', 'kellIntel', kellIntel);
