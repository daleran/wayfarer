import { registerData, CHARACTERS, registerContent } from '@data/dataRegistry.js';

const CHARS = {
  'scavenger-pilot': {
    name: 'Scavenger Pilot',
    faction: 'scavenger',
    relation: 'hostile',
    behavior: 'stalker',
    shipId: 'light-fighter',
    flavorText:
      'One of hundreds who scrape a living raiding trade lanes in the Gravewake. ' +
      'No rank, no name worth remembering. They come in packs and they stay moving — ' +
      'the ones who stop moving are the ones you find drifting.',
  },
  'scavenger-gunner': {
    name: 'Scavenger Gunner',
    faction: 'scavenger',
    relation: 'hostile',
    behavior: 'kiter',
    shipId: 'armed-hauler',
    flavorText:
      'A veteran scavenger who graduated from courier raids to a proper gun platform. ' +
      'Patient, methodical, and hard to rattle. Prefers to keep distance and let ' +
      'the lance do the talking. Has survived longer than most — which in the ' +
      'Gravewake means they know when to run.',
  },
  'salvage-lord': {
    name: 'Salvage Lord',
    faction: 'scavenger',
    relation: 'hostile',
    behavior: 'standoff',
    shipId: 'salvage-mothership',
    flavorText:
      'A clan boss who commands from the back. They earned their ship the old way — ' +
      'took it from someone who had it first. Now they sit behind armor and missiles ' +
      'while the fighters do the dying. Every piece of scrap in this sector ' +
      'passes through their hands eventually.',
  },
  'grave-clan-hunter': {
    name: 'Grave-Clan Hunter',
    faction: 'scavenger',
    relation: 'hostile',
    behavior: 'lurker',
    shipId: 'grave-clan-ambusher',
    flavorText:
      'The most patient killers in the Gravewake. Grave-Clan hunters know the ' +
      'trade lanes the way scavengers know wreckage — intimately and by feel. ' +
      'They commit fully when they attack. No fallback plan. The ones who ' +
      'hesitated are already dead.',
  },

  // Bounty characters
  hollow_brekk: {
    name: '"Hollow" Brekk',
    faction: 'scavenger',
    relation: 'hostile',
    behavior: 'kiter',
    shipId: 'armed-hauler',
    bounty: {
      value: 100,
      reason: 'Rival Clan Hit',
    },
    flavorText: 'Runs an armed hauler out of the deep wreck lanes. Known for picking fights with Coil-aligned clans and leaving before they can return fire.',
  },
  crestfall_orin: {
    name: '"Crestfall" Orin',
    faction: 'scavenger',
    relation: 'hostile',
    behavior: 'lurker',
    shipId: 'grave-clan-ambusher',
    bounty: {
      value: 75,
      reason: 'Purgation Contract',
    },
    flavorText: 'A Grave Clan ambusher who works the gaps in the Wall. The Coil issued the purgation order after Orin burned two of their contract vessels.',
  },
  ironback_marel: {
    name: '"Ironback" Marel',
    faction: 'scavenger',
    relation: 'hostile',
    behavior: 'lurker',
    shipId: 'grave-clan-ambusher',
    bounty: {
      value: 90,
      reason: 'Wanted: Grave-Clan Lurker',
    },
    flavorText: "Lurks the debris fields west of Kell's Stop. Marel's crew has hit six convoys in the past two cycles. Nobody has seen them in open space.",
  },
  gutshot_drev: {
    name: '"Gutshot" Drev',
    faction: 'scavenger',
    relation: 'hostile',
    behavior: 'stalker',
    shipId: 'light-fighter',
    bounty: {
      value: 60,
      reason: 'Clear the Approach',
    },
    flavorText: "Light fighter pilot, holds the western approach to Kell's Stop. Drev earned the name surviving three kills where they took hull damage bad enough to end most pilots.",
  },
  pale_widow: {
    name: '"Pale Widow"',
    faction: 'scavenger',
    relation: 'hostile',
    behavior: 'standoff',
    shipId: 'salvage-mothership',
    bounty: {
      value: 140,
      reason: 'Silence the Mothership',
    },
    flavorText: 'Commands a Salvage Mothership running dark in the eastern zone. The Pale Widow has been operating near Ashveil for months, intercepting ships on final approach.',
  },
  runt_cassin: {
    name: '"Runt" Cassin',
    faction: 'scavenger',
    relation: 'hostile',
    behavior: 'kiter',
    shipId: 'armed-hauler',
    bounty: {
      value: 80,
      reason: 'Armed Hauler Ambush',
    },
    flavorText: 'Operates an armed hauler in the cluster between Ashveil and The Coil. Small ship, overgunned. Cassin avoids direct engagements and circles until an opening appears.',
  },
  six_wire_pol: {
    name: '"Six-Wire" Pol',
    faction: 'scavenger',
    relation: 'hostile',
    behavior: 'stalker',
    shipId: 'light-fighter',
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
