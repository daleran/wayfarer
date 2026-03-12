// The Coil — lawless hub station.
// Renderer (CoilStation) + data + layout + instantiate(), all in one place.

import { Station } from '../../../station.js';
import { WHITE } from '../../../../ui/colors.js';
import { Shape } from '../../../../rendering/draw.js';

// ── CoilStation renderer ────────────────────────────────────────────────────

const HULL_FILL = 'rgba(25,12,0,0.92)';
const HULL_SHAPE = Shape.chamferedRect(400, 200, 10);

class CoilStation extends Station {
  constructor(x, y, data) {
    super(x, y, data);
    this.dockingRadius = 200;
  }

  update(dt) {
    super.update(dt);
  }

  render(ctx, camera) {
    const screen = camera.worldToScreen(this.x, this.y);
    const cx = screen.x, cy = screen.y;

    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(camera.zoom, camera.zoom);

    // ── MAIN HULL ───────────────────────────────────────────────────────────
    const hull = HULL_SHAPE.at(0, 0);
    hull.fill(ctx, HULL_FILL);
    hull.stroke(ctx, WHITE, 1.6, 0.55);

    this._renderNameLabel(ctx, camera, 120, 'bold 11px monospace', 0.85);

    ctx.restore();
  }

  getBounds() {
    return { x: this.x, y: this.y, radius: 200 };
  }
}

// ── Layout ───────────────────────────────────────────────────────────────────

const LAYOUT = {
  zones: [
    {
      id:          'zone-dock',
      label:       'The Dock',
      description: 'Berths, fuel lines, docking fees. Ships crammed into every slot.',
      services:    ['repair'],
      flavor: [
        'Rust-stained gantries.',
        'Ships jammed into every berth.',
        '',
        "The fee collector doesn't look up.",
        '',
        'Hull work and refueling available.',
        'No questions asked.',
      ],
      requiredStanding: null,
    },
    {
      id:          'zone-salvage-yard',
      label:       'Salvage Yard',
      description: 'Hulk trade, salvaged modules, kill contracts.',
      services:    ['trade', 'bounties'],
      flavor: [
        'Hulks arrive in pieces.',
        'They leave the same way,',
        'or rebuilt — depending on',
        "who's paying.",
        '',
        'The welders ask no questions.',
        'Neither should you.',
      ],
      requiredStanding: null,
    },
    {
      id:          'zone-market',
      label:       'Central Market',
      description: 'Black-market goods, fenced salvage, archive contraband.',
      services:    ['trade', 'intel'],
      flavor: [
        'Black-market goods.',
        'Fenced salvage.',
        'Contraband ROM cartridges',
        'from pre-Exile archive runs.',
        '',
        'Prices are negotiable.',
        'Arguments are not.',
      ],
      requiredStanding: null,
    },
    {
      id:              'zone-palace',
      label:           'The Palace',
      description:     'Salvage Lord court. Elite trade and faction relations.',
      services:        ['trade', 'relations'],
      requiredStanding:'Trusted',
      requiredFaction: 'scavengers',
      flavor: [
        'Part arena, part court,',
        'part bazaar.',
        '',
        'The Salvage Lords hold court',
        'at the back, elevated above',
        'the floor where they watch',
        'everything that enters.',
        '',
        '[ TRUSTED STANDING REQUIRED ]',
      ],
    },
    {
      id:          'zone-slums',
      label:       'The Slums',
      description: 'The informal quarter. Rumors, gossip, and loose intelligence.',
      services:    ['intel'],
      flavor: [
        'The harbor interior.',
        'People without status',
        'and ships without berths.',
        '',
        'Word travels here first.',
      ],
      requiredStanding: null,
    },
  ],
};

// ── Entity descriptor + instantiate ─────────────────────────────────────────

export const TheCoil = {
  id: 'the_coil',
  name: 'The Coil',
  flavorText: "A salvage lord's court dressed in wreckage and rust. The only law here is the price of docking.",
  faction: 'salvage_lords',
  renderer: 'coil',
  services: ['repair', 'trade'],
  dockingRadius: 200,
  commodities: {
    weapons_cache: 'surplus',
    raw_ore: 'medium',
    hull_plating: 'low',
    contraband: 'surplus',
    alloys: 'high',
    void_crystals: 'low',
  },
  lore: [
    'SALVAGE LORDS TERRITORY — OPEN PORT',
    'Classification: Hostile Neutral',
    '',
    'Stripped from the Gravewake graveyard and bolted',
    'together over decades of desperation. Two arms,',
    'one massive rear block. It shouldn\'t float.',
    'It does.',
    '',
    '[ MARKET DECK — STARBOARD ARM ]',
    'Black-market goods, fenced salvage, contraband',
    'ROM cartridges from pre-Exile archive runs.',
    'Prices are negotiable. Arguments are not.',
    '',
    '[ SALVAGE YARD & SHIPYARD — PORT ARM ]',
    'Hulks arrive in pieces. They leave the same way,',
    'or rebuilt — depending on who\'s paying.',
    'The welders ask no questions. Neither should you.',
    '',
    '[ THE PIT — REAR BLOCK ]',
    'Part arena, part court, part bazaar. Salvage is',
    'auctioned, disputes are settled by combat or coin,',
    'and the unsanctioned business happens in the dark.',
    'The Salvage Lords hold court at the back,',
    'elevated above the floor where they watch',
    'everything that enters.',
  ],
  layout: LAYOUT,
  bountyContracts: [
    {
      id: 'coil_b1', type: 'kill',
      title: 'Rival Clan Hit',
      targetName: '"Hollow" Brekk',
      targetShipType: 'armed-hauler',
      targetPosition: { x: 10800, y: 3000 },
      reward: 100, expirySeconds: 300,
    },
    {
      id: 'coil_b2', type: 'kill',
      title: 'Purgation Contract',
      targetName: '"Crestfall" Orin',
      targetShipType: 'grave-clan-ambusher',
      targetPosition: { x: 10500, y: 5800 },
      reward: 75, expirySeconds: 300,
    },
  ],

  instantiate(x, y) {
    return new CoilStation(x, y, this);
  },
};
