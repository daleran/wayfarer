import { registerData, CHARACTERS, registerContent } from '@data/dataRegistry.js';

const CHARS = {
  hollow_brekk: {
    name: '"Hollow" Brekk',
    faction: 'scavenger',
    behavior: 'kiter',
    bounty: {
      value: 100,
      reason: 'Rival Clan Hit',
    },
    flavorText: 'Runs an armed hauler out of the deep wreck lanes. Known for picking fights with Coil-aligned clans and leaving before they can return fire.',
  },
  crestfall_orin: {
    name: '"Crestfall" Orin',
    faction: 'scavenger',
    behavior: 'lurker',
    bounty: {
      value: 75,
      reason: 'Purgation Contract',
    },
    flavorText: 'A Grave Clan ambusher who works the gaps in the Wall. The Coil issued the purgation order after Orin burned two of their contract vessels.',
  },
  ironback_marel: {
    name: '"Ironback" Marel',
    faction: 'scavenger',
    behavior: 'lurker',
    bounty: {
      value: 90,
      reason: 'Wanted: Grave-Clan Lurker',
    },
    flavorText: "Lurks the debris fields west of Kell's Stop. Marel's crew has hit six convoys in the past two cycles. Nobody has seen them in open space.",
  },
  gutshot_drev: {
    name: '"Gutshot" Drev',
    faction: 'scavenger',
    behavior: 'stalker',
    bounty: {
      value: 60,
      reason: 'Clear the Approach',
    },
    flavorText: "Light fighter pilot, holds the western approach to Kell's Stop. Drev earned the name surviving three kills where they took hull damage bad enough to end most pilots.",
  },
  pale_widow: {
    name: '"Pale Widow"',
    faction: 'scavenger',
    behavior: 'standoff',
    bounty: {
      value: 140,
      reason: 'Silence the Mothership',
    },
    flavorText: 'Commands a Salvage Mothership running dark in the eastern zone. The Pale Widow has been operating near Ashveil for months, intercepting ships on final approach.',
  },
  runt_cassin: {
    name: '"Runt" Cassin',
    faction: 'scavenger',
    behavior: 'kiter',
    bounty: {
      value: 80,
      reason: 'Armed Hauler Ambush',
    },
    flavorText: 'Operates an armed hauler in the cluster between Ashveil and The Coil. Small ship, overgunned. Cassin avoids direct engagements and circles until an opening appears.',
  },
  six_wire_pol: {
    name: '"Six-Wire" Pol',
    faction: 'scavenger',
    behavior: 'stalker',
    bounty: {
      value: 55,
      reason: 'Eastern Stalker',
    },
    flavorText: 'Light fighter running the eastern edge of Gravewake. Six-Wire got the name from the six wire-guided kills confirmed against Ashveil-bound traders.',
  },
};

registerData(CHARACTERS, CHARS);

for (const [id, data] of Object.entries(CHARS)) {
  registerContent('characters', id, data);
}
