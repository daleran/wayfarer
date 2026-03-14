// Ashveil Anchorage — neutral repair/trade station (colony ship hull renderer).
// Data + layout + instantiate(), all in one place.

import { Station } from '@/world/station.js';
import { WHITE } from '@/rendering/colors.js';

// ── AshveilStation renderer ────────────────────────────────────────────────

const HULL_FILL = 'rgba(0,4,8,0.92)';

class AshveilStation extends Station {
  constructor(x, y, data) {
    super(x, y, data);
    this.dockingRadius = 180;
  }

  update(dt) { super.update(dt); }

  render(ctx, camera) {
    const screen = camera.worldToScreen(this.x, this.y);
    const cx = screen.x, cy = screen.y;
    const t = this._navPulse;

    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(camera.zoom, camera.zoom);

    const accent = this.accentColor;

    // ── AMBIENT GLOW ────────────────────────────────────────────────────────
    const glow = ctx.createRadialGradient(0, -10, 10, 0, -10, 140);
    glow.addColorStop(0, 'rgba(0,255,204,0.04)');
    glow.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = glow;
    ctx.fillRect(-160, -160, 320, 300);

    // ── MAIN COLONY SHIP SPINE — long horizontal hull ────────────────────────
    const sections = [
      // Main spine (colony ship hull — long, narrow)
      { x: -120, y: -18, w: 240, h: 36 },
      // Bow section (port side, thicker)
      { x: -140, y: -28, w: 42, h: 56 },
      // Stern engineering block (starboard-offset)
      { x:  98, y: -32, w: 48, h: 64 },
      // Upper habitation module (port-forward)
      { x: -82, y: -58, w: 60, h: 40 },
      // Upper habitation module (starboard-mid)
      { x:  18, y: -62, w: 52, h: 44 },
      // Lower repair gantry (extends below spine, port-mid)
      { x: -50, y:  18, w: 78, h: 30 },
      // Lower cargo module (starboard-aft)
      { x:  42, y:  18, w: 56, h: 26 },
      // Small ops tower (top-center)
      { x: -12, y: -78, w: 24, h: 20 },
      // Antenna mast (bow tip)
      { x: -156, y: -8, w: 16, h: 16 },
      // Docking collar (bottom, slightly port)
      { x: -22, y:  48, w: 44, h: 22 },
    ];

    ctx.strokeStyle = WHITE;
    ctx.lineWidth = 1.4;
    for (const s of sections) {
      ctx.beginPath();
      ctx.rect(s.x, s.y, s.w, s.h);
      ctx.fillStyle = HULL_FILL;
      ctx.fill();
      ctx.globalAlpha = 0.55;
      ctx.stroke();
      ctx.globalAlpha = 1;
    }

    // ── INTERIOR RIB LINES ─────────────────────────────────────────────────
    ctx.strokeStyle = WHITE;
    ctx.lineWidth = 0.5;
    ctx.globalAlpha = 0.14;
    // Spine ribs (vertical across main hull)
    for (const rx of [-90, -50, -10, 30, 70]) {
      ctx.beginPath();
      ctx.moveTo(rx, -18);
      ctx.lineTo(rx, 18);
      ctx.stroke();
    }
    // Habitation ribs
    ctx.beginPath(); ctx.moveTo(-82, -38); ctx.lineTo(-22, -38); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(18, -40); ctx.lineTo(70, -40); ctx.stroke();
    // Repair gantry ribs
    ctx.beginPath(); ctx.moveTo(-30, 18); ctx.lineTo(-30, 48); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(10, 18); ctx.lineTo(10, 48); ctx.stroke();
    ctx.globalAlpha = 1;

    // ── CONNECTING STRUTS ───────────────────────────────────────────────────
    const struts = [
      // Hab to spine connectors
      { x1: -62, y1: -18, x2: -62, y2: -58 },
      { x1: -42, y1: -18, x2: -42, y2: -58 },
      { x1:  38, y1: -18, x2:  38, y2: -62 },
      { x1:  58, y1: -18, x2:  58, y2: -62 },
      // Ops tower connector
      { x1:   0, y1: -58, x2:   0, y2: -78 },
    ];
    ctx.strokeStyle = WHITE;
    ctx.lineWidth = 2.5;
    ctx.globalAlpha = 0.3;
    for (const s of struts) {
      ctx.beginPath();
      ctx.moveTo(s.x1, s.y1);
      ctx.lineTo(s.x2, s.y2);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;

    // ── PATCHED PANELS ──────────────────────────────────────────────────────
    const patches = [
      { x: -100, y:   4, rot:  0.08, w: 20, h: 10 },
      { x:   60, y:  -8, rot: -0.12, w: 18, h: 8  },
      { x:  -70, y: -48, rot:  0.06, w: 22, h: 10 },
      { x:   32, y: -52, rot: -0.10, w: 16, h: 8  },
      { x:  110, y: -20, rot:  0.15, w: 20, h: 10 },
      { x:  -20, y:  32, rot: -0.05, w: 14, h: 8  },
    ];
    ctx.strokeStyle = WHITE;
    ctx.lineWidth = 0.8;
    for (const p of patches) {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.globalAlpha = 0.28;
      ctx.strokeRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx.beginPath();
      ctx.arc(0, 0, 1.2, 0, Math.PI * 2);
      ctx.fillStyle = WHITE;
      ctx.globalAlpha = 0.22;
      ctx.fill();
      ctx.restore();
    }
    ctx.globalAlpha = 1;

    // ── DOCKED SHIPS ─────────────────────────────────────────────────────────
    const drawShip = (x, y, rot, sc, alpha) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rot);
      ctx.scale(sc, sc);
      ctx.fillStyle = 'rgba(4,8,12,0.9)';
      ctx.strokeStyle = WHITE;
      ctx.lineWidth = 1.0 / sc;
      const part = (rx, ry, rw, rh) => {
        ctx.beginPath();
        ctx.rect(rx, ry, rw, rh);
        ctx.globalAlpha = alpha;
        ctx.fill();
        ctx.globalAlpha = alpha * 0.65;
        ctx.stroke();
      };
      part(-7, -6, 14, 16);
      part(-4, -12, 8, 8);
      part(-5, 10, 10, 5);
      ctx.globalAlpha = 1;
      ctx.restore();
    };

    drawShip(-156, -1, Math.PI * 0.5, 1.0, 0.45);
    drawShip(-22, 58, 0, 1.2, 0.50);
    drawShip(22, 58, Math.PI * 0.1, 1.1, 0.42);
    drawShip(146, -2, -Math.PI * 0.5, 1.3, 0.48);

    // ── RUNNING LIGHTS ────────────────────────────────────────────────────
    const litPhase = (t * 2.2) % 1;
    const lightPositions = [
      [-140, -28], [-140, 28], [146, -32], [146, 32],
      [-82, -58], [-22, -58], [18, -62], [70, -62],
      [-50, 48], [28, 44], [-12, -78],
    ];
    for (let i = 0; i < lightPositions.length; i++) {
      const [lx, ly] = lightPositions[i];
      const on = ((litPhase + i * 0.09) % 1) < 0.25;
      ctx.beginPath();
      ctx.arc(lx, ly, 2.2, 0, Math.PI * 2);
      ctx.fillStyle = accent;
      ctx.globalAlpha = on ? 0.82 : 0.12;
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    // ── DOCKING BEACON ────────────────────────────────────────────────────
    const beaconPulse = 0.45 + 0.45 * Math.sin(t * Math.PI * 1.4);
    for (const bx of [-30, 30]) {
      ctx.beginPath();
      ctx.arc(bx, 70, 10, 0, Math.PI * 2);
      ctx.fillStyle = accent;
      ctx.globalAlpha = beaconPulse * 0.12;
      ctx.fill();
      ctx.beginPath();
      ctx.arc(bx, 70, 4, 0, Math.PI * 2);
      ctx.fillStyle = accent;
      ctx.globalAlpha = beaconPulse * 0.85;
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    // ── APPROACH BEAM ─────────────────────────────────────────────────────
    const rel = this.relation;
    const beaconGlowStop0 = rel === 'friendly' ? 'rgba(0,255,204,0.07)' : rel === 'enemy' ? 'rgba(255,68,68,0.07)' : 'rgba(255,170,0,0.07)';
    const beaconGlowStop1 = rel === 'friendly' ? 'rgba(0,255,204,0)'    : rel === 'enemy' ? 'rgba(255,68,68,0)'    : 'rgba(255,170,0,0)';
    const beam = ctx.createLinearGradient(0, 70, 0, 140);
    beam.addColorStop(0, beaconGlowStop0);
    beam.addColorStop(1, beaconGlowStop1);
    ctx.fillStyle = beam;
    ctx.beginPath();
    ctx.moveTo(-30, 70);
    ctx.lineTo(30, 70);
    ctx.lineTo(50, 140);
    ctx.lineTo(-50, 140);
    ctx.closePath();
    ctx.fill();

    // Docking lights — red/green pair at the docking collar
    this._renderDockingLights(ctx, 0, 70, 18);

    this._renderNameLabel(ctx, camera, 90);

    ctx.restore();
  }

  getBounds() {
    return { x: this.x, y: this.y, radius: 100 };
  }
}

// ── Layout (simple) ─────────────────────────────────────────────────────────

const LAYOUT = {
  zones: [
    {
      id:          'repair-bay',
      label:       'Repair Bay',
      description: 'Structural and armor work. Engine overhauls available.',
      services:    ['repair', 'reactor'],
      worldOffset: { x: -50, y: 33 },
      flavor: [
        'ASHVEIL ANCHORAGE — OPEN PORT',
        '',
        'Eastern terminus of the Gravewake trade lanes. Built from the hull of a decommissioned colony ship. Repairs are expensive. Being stranded is worse.',
        '',
        '[ REPAIR BAY ]',
        'Structural and armor work only. Engine overhauls require advance booking.',
      ],
      requiredStanding: null,
    },
    {
      id:          'trade-post',
      label:       'Trade Post',
      description: 'Outbound cargo accepted. Inbound prices reflect the run.',
      services:    ['trade'],
      worldOffset: { x: 70, y: 22 },
      flavor: [
        '[ TRADE POST ]',
        '',
        'Outbound cargo accepted. Inbound prices reflect the difficulty of the run.',
      ],
      requiredStanding: null,
    },
    {
      id:          'bounties',
      label:       'Bounty Board',
      description: 'Posted contracts from Anchorage operators.',
      services:    ['bounties'],
      worldOffset: { x: 120, y: -16 },
      flavor: [],
      requiredStanding: null,
    },
    {
      id:          'intel',
      label:       'Intel',
      description: 'Station intelligence and local knowledge.',
      services:    ['intel'],
      worldOffset: { x: -120, y: -10 },
      flavor: [],
      requiredStanding: null,
    },
    {
      id:          'relations',
      label:       'Relations',
      description: 'Faction standings.',
      services:    ['relations'],
      worldOffset: { x: -50, y: -50 },
      flavor: [],
      requiredStanding: null,
    },
  ],
};

// ── Entity descriptor + instantiate ─────────────────────────────────────────

export const AshveilAnchorage = {
  id: 'ashveil_anchorage',
  name: 'Ashveil Anchorage',
  flavorText: 'Neutral ground by tradition, respected by necessity. The nebula keeps most trouble at bay.',
  faction: 'neutral',
  renderer: null,
  services: ['repair', 'trade'],
  canOverhaulReactor: true,
  dockingRadius: 150,
  commodities: {
    ration_packs: 'medium',
    machine_parts: 'medium',
    electronics: 'medium',
    medical_supplies: 'medium',
    data_cores: 'low',
    nav_charts: 'low',
    bio_cultures: 'high',
  },
  lore: [
    'ASHVEIL ANCHORAGE — OPEN PORT',
    'Classification: Neutral',
    '',
    'Eastern terminus of the Gravewake trade lanes.',
    'Built from the hull of a decommissioned colony ship.',
    'Repairs are expensive. Being stranded is worse.',
    '',
    '[ REPAIR BAY ]',
    'Structural and armor work only.',
    'Engine overhauls require advance booking.',
    '',
    '[ TRADE POST ]',
    'Outbound cargo accepted. Inbound prices',
    'reflect the difficulty of the run.',
  ],
  layout: LAYOUT,
  conversations: {
    hub: 'ashveilHub',
    zones: {
      'repair-bay':  'ashveilDock',
      'trade-post':  'ashveilTrade',
      bounties:      'ashveilBounties',
      intel:         'ashveilIntel',
      relations:     'ashveilRelations',
    },
  },
  bountyContracts: [
    {
      id: 'ashveil_b1', type: 'kill',
      title: 'Silence the Mothership',
      targetName: '"Pale Widow"',
      targetShipType: 'salvage-mothership',
      targetPosition: { x: 14800, y: 6200 },
      reward: 140, expirySeconds: 360,
    },
    {
      id: 'ashveil_b2', type: 'kill',
      title: 'Armed Hauler Ambush',
      targetName: '"Runt" Cassin',
      targetShipType: 'armed-hauler',
      targetPosition: { x: 15500, y: 4200 },
      reward: 80, expirySeconds: 300,
    },
    {
      id: 'ashveil_b3', type: 'kill',
      title: 'Eastern Stalker',
      targetName: '"Six-Wire" Pol',
      targetShipType: 'light-fighter',
      targetPosition: { x: 16200, y: 6500 },
      reward: 55, expirySeconds: 240,
    },
  ],

  instantiate(x, y) {
    return new AshveilStation(x, y, this);
  },
};
