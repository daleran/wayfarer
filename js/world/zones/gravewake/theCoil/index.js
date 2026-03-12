// The Coil — lawless hub station.
// Renderer (CoilStation) + data + layout + instantiate(), all in one place.

import { Station } from '../../../station.js';
import { AMBER, WHITE } from '../../../../ui/colors.js';
import { Shape } from '../../../../rendering/draw.js';
import { HOLLOW_BREKK }   from '../../../../npcs/characters/hollowBrekk.js';
import { CRESTFALL_ORIN } from '../../../../npcs/characters/crestfallOrin.js';

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

// ── Layout (zone-map with SVG schematic) ────────────────────────────────────

const SVG = `
<svg viewBox="-230 -285 460 415" width="400" height="360" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <style>
      .coil-struct { stroke: rgba(255,140,0,0.28); stroke-width: 1.4; fill: rgba(10,5,0,0.7); }
      .coil-detail { stroke: rgba(255,140,0,0.12); stroke-width: 0.7; fill: none; }
      .zone-area   { fill: transparent; }
      .zone-border { fill: none; }
      .zone-label  { font: bold 8px monospace; text-anchor: middle; pointer-events: none; }
    </style>
  </defs>

  <!-- ── STRUCTURAL OUTLINE ─────────────────────────────────────── -->

  <!-- Left arm panels -->
  <rect class="coil-struct" x="-155" y="-108" width="67" height="52" />
  <rect class="coil-struct" x="-158" y="-57"  width="68" height="58" />
  <rect class="coil-struct" x="-153" y="-1"   width="65" height="88" />

  <!-- Back wall left -->
  <rect class="coil-struct" x="-88"  y="-200" width="52" height="140" />
  <!-- Back wall center hub -->
  <rect class="coil-struct" x="-36"  y="-210" width="74" height="150" />
  <!-- Back wall right -->
  <rect class="coil-struct" x="38"   y="-195" width="54" height="135" />

  <!-- Right arm panels -->
  <rect class="coil-struct" x="90"   y="-104" width="62" height="46" />
  <rect class="coil-struct" x="92"   y="-58"  width="58" height="56" />
  <rect class="coil-struct" x="88"   y="-3"   width="64" height="90" />

  <!-- Top jetty -->
  <rect class="coil-struct" x="-20"  y="-262" width="40" height="52" />

  <!-- Harbor entrance arms -->
  <line class="coil-detail" x1="-88" y1="87"  x2="-88" y2="115" />
  <line class="coil-detail" x1="88"  y1="87"  x2="88"  y2="115" />

  <!-- Interior rib lines -->
  <line class="coil-detail" x1="-158" y1="-88" x2="-88" y2="-88" />
  <line class="coil-detail" x1="-158" y1="-35" x2="-88" y2="-35" />
  <line class="coil-detail" x1="-158" y1="22"  x2="-88" y2="22"  />
  <line class="coil-detail" x1="88"   y1="-80" x2="152" y2="-80" />
  <line class="coil-detail" x1="88"   y1="-22" x2="152" y2="-22" />
  <line class="coil-detail" x1="88"   y1="32"  x2="152" y2="32"  />
  <line class="coil-detail" x1="-58"  y1="-210" x2="-58" y2="-60" />
  <line class="coil-detail" x1="-5"   y1="-210" x2="-5"  y2="-60" />
  <line class="coil-detail" x1="55"   y1="-195" x2="55"  y2="-60" />

  <!-- Harbor beacon dots -->
  <circle cx="-88" cy="103" r="3" fill="rgba(255,140,0,0.6)" />
  <circle cx="88"  cy="103" r="3" fill="rgba(255,140,0,0.6)" />

  <!-- ── ZONE HOTSPOTS ───────────────────────────────────────────── -->

  <!-- Zone: The Dock (harbor mouth, bottom-center) -->
  <g id="zone-dock" class="zone-hotspot">
    <rect class="zone-area"   x="-88" y="55" width="176" height="60" />
    <rect class="zone-border" x="-88" y="55" width="176" height="60" stroke="rgba(255,140,0,0.4)" stroke-width="1" />
    <text class="zone-label"  x="0"   y="88" fill="rgba(255,140,0,0.7)">THE DOCK</text>
  </g>

  <!-- Zone: Salvage Yard (left arm) -->
  <g id="zone-salvage-yard" class="zone-hotspot">
    <rect class="zone-area"   x="-160" y="-114" width="74" height="202" />
    <rect class="zone-border" x="-160" y="-114" width="74" height="202" stroke="rgba(0,255,204,0.4)" stroke-width="1" />
    <text class="zone-label"  x="-123" y="-52"  fill="rgba(0,255,204,0.7)">SALVAGE</text>
    <text class="zone-label"  x="-123" y="-40"  fill="rgba(0,255,204,0.7)">YARD</text>
  </g>

  <!-- Zone: Central Market (right arm) -->
  <g id="zone-market" class="zone-hotspot">
    <rect class="zone-area"   x="87"  y="-110" width="69" height="198" />
    <rect class="zone-border" x="87"  y="-110" width="69" height="198" stroke="rgba(0,255,204,0.4)" stroke-width="1" />
    <text class="zone-label"  x="122" y="-52"  fill="rgba(0,255,204,0.7)">CENTRAL</text>
    <text class="zone-label"  x="122" y="-40"  fill="rgba(0,255,204,0.7)">MARKET</text>
  </g>

  <!-- Zone: The Palace (rear hub — rep-gated) -->
  <g id="zone-palace" class="zone-hotspot">
    <rect class="zone-area"   x="-42" y="-218" width="84" height="162" />
    <rect class="zone-border" x="-42" y="-218" width="84" height="162" stroke="rgba(255,0,170,0.4)" stroke-width="1" />
    <text class="zone-label"  x="0"   y="-155" fill="rgba(255,0,170,0.7)">THE</text>
    <text class="zone-label"  x="0"   y="-143" fill="rgba(255,0,170,0.7)">PALACE</text>
  </g>

  <!-- Zone: The Slums (inner harbor, between arms) -->
  <g id="zone-slums" class="zone-hotspot">
    <rect class="zone-area"   x="-88" y="-5"  width="176" height="62" />
    <rect class="zone-border" x="-88" y="-5"  width="176" height="62" stroke="rgba(85,102,119,0.4)" stroke-width="1" />
    <text class="zone-label"  x="0"   y="30"  fill="rgba(85,102,119,0.7)">THE SLUMS</text>
  </g>
</svg>
`;

const LAYOUT = {
  type:  'zone-map',
  theme: 'coil',
  svg:   SVG,
  zones: [
    {
      id:          'zone-dock',
      svgId:       'zone-dock',
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
      svgId:       'zone-salvage-yard',
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
      svgId:       'zone-market',
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
      svgId:           'zone-palace',
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
      svgId:       'zone-slums',
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
  bountyBoard: [ HOLLOW_BREKK, CRESTFALL_ORIN ],
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
