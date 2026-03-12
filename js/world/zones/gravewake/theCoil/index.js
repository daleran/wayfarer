// The Coil — lawless hub station.
// Renderer (CoilStation) + data + layout + instantiate(), all in one place.

import { Station } from '../../../station.js';
import { AMBER, WHITE } from '../../../../ui/colors.js';
import { HOLLOW_BREKK }   from '../../../../npcs/characters/hollowBrekk.js';
import { CRESTFALL_ORIN } from '../../../../npcs/characters/crestfallOrin.js';

// ── CoilStation renderer ────────────────────────────────────────────────────

const HULL_FILL = 'rgba(25,12,0,0.92)';

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
    const t = this._navPulse;

    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(camera.zoom, camera.zoom);

    const accent = this.accentColor;

    // ── BOXY SHIP SILHOUETTE HELPER ───────────────────────────────────────────
    const drawShip = (x, y, rot, sc, alpha) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rot);
      ctx.scale(sc, sc);
      ctx.fillStyle = 'rgba(12,9,0,0.9)';
      ctx.strokeStyle = WHITE;
      ctx.lineWidth = 1.1 / sc;
      const part = (rx, ry, rw, rh) => {
        ctx.beginPath();
        ctx.rect(rx, ry, rw, rh);
        ctx.globalAlpha = alpha;
        ctx.fill();
        ctx.globalAlpha = alpha * 0.72;
        ctx.stroke();
      };
      part(-9, -8, 18, 20);    // main hull body
      part(-5, -16, 10, 10);   // cockpit block
      part(-7, 12, 14,  6);    // engine block
      part(-16, -3,  7,  9);   // port wing stub
      part(  9, -3,  7,  9);   // starboard wing stub
      ctx.beginPath();
      ctx.arc(0, 18, 2.8, 0, Math.PI * 2);
      ctx.fillStyle = accent;
      ctx.globalAlpha = alpha * 0.4;
      ctx.fill();
      ctx.globalAlpha = 1;
      ctx.restore();
    };

    // ── HARBOR AMBIENT GLOW ──────────────────────────────────────────────────
    const hg = ctx.createRadialGradient(0, 10, 5, 0, 10, 110);
    hg.addColorStop(0, 'rgba(255,170,0,0.05)');
    hg.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = hg;
    ctx.fillRect(-90, -65, 182, 158);

    // ── HULL SECTIONS — 15 rects forming the U ───────────────────────────────
    const sections = [
      // Left arm
      { x: -155, y: -108, w: 67, h: 52 },
      { x: -158, y:  -57, w: 68, h: 58 },
      { x: -153, y:   -1, w: 65, h: 94 },
      // Back wall
      { x:  -88, y: -200, w: 52, h: 140 },
      { x:  -36, y: -210, w: 74, h: 150 },
      { x:   38, y: -195, w: 54, h: 135 },
      // Right arm
      { x:   90, y: -104, w: 62, h: 46 },
      { x:   92, y:  -58, w: 58, h: 56 },
      { x:   88, y:   -3, w: 64, h: 90 },
      // Left outer jettys
      { x: -208, y:  -84, w: 50, h: 22 },
      { x: -200, y:  -18, w: 42, h: 17 },
      { x: -196, y:   40, w: 38, h: 15 },
      // Right outer jettys
      { x:  152, y:  -78, w: 55, h: 20 },
      { x:  152, y:   18, w: 46, h: 16 },
      // Back top jetty
      { x:  -20, y: -262, w: 40, h: 52 },
    ];

    ctx.strokeStyle = WHITE;
    ctx.lineWidth = 1.6;
    for (const s of sections) {
      ctx.beginPath();
      ctx.rect(s.x, s.y, s.w, s.h);
      ctx.fillStyle = 'rgba(18,13,0,0.95)';
      ctx.fill();
      ctx.globalAlpha = 0.55;
      ctx.stroke();
      ctx.globalAlpha = 1;
    }

    // ── INTERIOR RIB LINES ───────────────────────────────────────────────────
    ctx.strokeStyle = WHITE;
    ctx.lineWidth = 0.6;
    ctx.globalAlpha = 0.18;
    for (const y of [-88, -35, 22, 65]) {
      ctx.beginPath(); ctx.moveTo(-158, y); ctx.lineTo(-88, y); ctx.stroke();
    }
    for (const y of [-80, -22, 32, 72]) {
      ctx.beginPath(); ctx.moveTo(88, y); ctx.lineTo(152, y); ctx.stroke();
    }
    for (const x of [-58, -5, 55]) {
      ctx.beginPath(); ctx.moveTo(x, -210); ctx.lineTo(x, -60); ctx.stroke();
    }
    ctx.globalAlpha = 1;

    // ── HARBOR INNER DOCKING PIERS ──────────────────────────────────────────
    const harborArms = [
      { x: -88, y: -30, dir:  1, len: 45, w: 10 },
      { x: -88, y:  38, dir:  1, len: 30, w:  8 },
      { x:  88, y: -22, dir: -1, len: 40, w:  9 },
      { x:  88, y:  42, dir: -1, len: 50, w: 11 },
    ];
    for (const arm of harborArms) {
      const aw = arm.dir * arm.len;
      ctx.beginPath();
      ctx.rect(arm.x, arm.y - arm.w / 2, aw, arm.w);
      ctx.fillStyle = 'rgba(10,7,0,0.92)';
      ctx.fill();
      ctx.strokeStyle = WHITE;
      ctx.lineWidth = 1.1;
      ctx.globalAlpha = 0.35;
      ctx.stroke();
      const tipX = arm.x + aw;
      const pulse = 0.45 + 0.4 * Math.sin(t * 3.2 + arm.y * 0.15);
      ctx.beginPath();
      ctx.arc(tipX, arm.y, 3.5, 0, Math.PI * 2);
      ctx.fillStyle = accent;
      ctx.globalAlpha = pulse;
      ctx.fill();
      ctx.globalAlpha = 1;
    }

    // ── DOCKED / DISASSEMBLED SHIPS ─────────────────────────────────────────
    drawShip(-208,      -73, -Math.PI * 0.5,  1.4, 0.52);
    drawShip(-200,       -9,  Math.PI * 0.45, 1.6, 0.48);
    drawShip(-196,       47, -Math.PI * 0.5,  1.3, 0.44);
    drawShip(152 + 55,  -68,  Math.PI * 0.5,  1.5, 0.50);
    drawShip(152 + 46,   26,  Math.PI * 1.5,  1.4, 0.46);
    drawShip(0,         -262, 0,              1.3, 0.45);
    drawShip(-88 + 40,  -30, -Math.PI * 0.5,  1.2, 0.50);
    drawShip( 88 - 42,   42,  Math.PI * 0.5,  1.3, 0.48);

    // ── PATCHED PANELS ──────────────────────────────────────────────────────
    const patches = [
      { x: -132, y:  44, rot:  0.15, w: 28, h: 15 },
      { x: -128, y: -48, rot: -0.10, w: 22, h: 12 },
      { x:  118, y: -28, rot:  0.20, w: 24, h: 12 },
      { x:  122, y:  50, rot: -0.12, w: 20, h: 10 },
      { x:   -8, y: -95, rot:  0.06, w: 32, h:  9 },
      { x:  -55, y: -82, rot: -0.08, w: 18, h:  8 },
    ];
    ctx.strokeStyle = WHITE;
    ctx.lineWidth = 0.9;
    for (const p of patches) {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.globalAlpha = 0.32;
      ctx.strokeRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx.beginPath();
      ctx.arc(0, 0, 1.5, 0, Math.PI * 2);
      ctx.fillStyle = WHITE;
      ctx.globalAlpha = 0.26;
      ctx.fill();
      ctx.restore();
    }
    ctx.globalAlpha = 1;

    // ── RUNNING LIGHTS ──────────────────────────────────────────────────────
    const litPhase = (t * 2.5) % 1;
    const leftLY  = [-82, -30, 30, 72];
    const rightLY = [-72, -15, 62];
    for (let i = 0; i < leftLY.length; i++) {
      ctx.beginPath();
      ctx.arc(-158, leftLY[i], 2.5, 0, Math.PI * 2);
      ctx.fillStyle = accent;
      ctx.globalAlpha = ((litPhase + i * 0.25) % 1) < 0.3 ? 0.85 : 0.15;
      ctx.fill();
    }
    for (let i = 0; i < rightLY.length; i++) {
      ctx.beginPath();
      ctx.arc(152, rightLY[i], 2.5, 0, Math.PI * 2);
      ctx.fillStyle = accent;
      ctx.globalAlpha = ((litPhase + i * 0.33 + 0.5) % 1) < 0.3 ? 0.85 : 0.15;
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    // ── HARBOR ENTRANCE BEACONS ─────────────────────────────────────────────
    const beaconPulse = 0.5 + 0.5 * Math.sin(t * Math.PI * 1.5);
    const rel = this.relation;
    const beaconGlowColor = rel === 'friendly' ? 'rgba(0,255,204,0.06)' : rel === 'enemy' ? 'rgba(255,68,68,0.06)' : 'rgba(255,170,0,0.06)';
    const beaconGlowStop0  = rel === 'friendly' ? 'rgba(0,255,204,0.09)' : rel === 'enemy' ? 'rgba(255,68,68,0.09)' : 'rgba(255,170,0,0.09)';
    const beaconGlowStop1  = rel === 'friendly' ? 'rgba(0,255,204,0)'    : rel === 'enemy' ? 'rgba(255,68,68,0)'    : 'rgba(255,170,0,0)';
    for (const bx of [-88, 88]) {
      ctx.beginPath();
      ctx.arc(bx, 93, 12, 0, Math.PI * 2);
      ctx.fillStyle = beaconGlowColor;
      ctx.globalAlpha = beaconPulse;
      ctx.fill();
      ctx.beginPath();
      ctx.arc(bx, 93, 5, 0, Math.PI * 2);
      ctx.fillStyle = accent;
      ctx.globalAlpha = beaconPulse * 0.9;
      ctx.fill();
      ctx.globalAlpha = 1;
    }

    // ── APPROACH BEAM ───────────────────────────────────────────────────────
    const beam = ctx.createLinearGradient(0, 93, 0, 178);
    beam.addColorStop(0, beaconGlowStop0);
    beam.addColorStop(1, beaconGlowStop1);
    ctx.fillStyle = beam;
    ctx.beginPath();
    ctx.moveTo(-88, 93);
    ctx.lineTo(88, 93);
    ctx.lineTo(112, 178);
    ctx.lineTo(-112, 178);
    ctx.closePath();
    ctx.fill();

    this._renderNameLabel(ctx, camera, 110, 'bold 11px monospace', 0.85);

    ctx.restore();
  }

  getBounds() {
    return { x: this.x, y: this.y, radius: 150 };
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
