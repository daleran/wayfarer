// Shared color palette — vector monitor / cassette futurism aesthetic
// See UI.md for full reference

// Primary palette
export const CYAN = '#00ffcc';
export const AMBER = '#ffaa00';
export const GREEN = '#00ff66';
export const RED = '#ff4444';
export const BLUE = '#4488ff';
export const CONCORD_BLUE = '#4488ff';
export const MAGENTA = '#ff00aa';
export const WHITE = '#ffffff';
export const TEAL = '#44aaff';
export const RAIL_WHITE      = '#ddeeff';
export const PLASMA_GREEN    = '#44ff88';
export const TORPEDO_AMBER   = '#cc8800';
export const AUTOCANNON_GLOW = '#ffe0a0';

// Core
export const BLACK = '#000000';

// Renderer / post-processing
export const STARFIELD_TINT_WHITE = '#cceeee';
export const BG_CLEAR = '#000005';
export const BEAM_GLOW_OUTER = '#00ffaa';
export const BEAM_GLOW_MID = '#88ffdd';

// Projectile glows
export const PROJ_GLOW_GREEN = '#ccffcc';   // player / gatling
export const PROJ_GLOW_RED   = '#ffcccc';   // enemy
export const PLASMA_CORE     = '#ccffee';   // plasma bolt center
export const TORPEDO_TRAIL   = '#996633';   // torpedo exhaust
export const TORPEDO_CORE    = '#ffcc66';   // torpedo head glow
export const CANNON_AMBER    = '#dd8800';   // cannon projectile

// Particle / FX
export const EXPLOSION_ORANGE = '#ff8844';
export const EXPLOSION_YELLOW = '#ffaa22';
export const EXPLOSION_GOLD   = '#ffcc66';
export const EXPLOSION_RED    = '#ff4400';
export const EXPLOSION_RING_OUTER = '#ffaa44';
export const EXPLOSION_RING_INNER = '#ff6622';
export const MAGENTA_DARK  = '#aa0077';
export const MAGENTA_LIGHT = '#ffaaff';
export const SPARK_YELLOW  = '#ffff66';
export const SPARK_WARM    = '#ffcc44';     // station sparks (The Coil)
export const SMOKE_DARK    = '#555555';
export const SMOKE_MID     = '#6a6a6a';
export const SMOKE_TINT    = '#3a3a44';

// Zone backgrounds
export const ZONE_BG_STROKE = '#334455';

// Minimap info text
export const MINIMAP_INFO_TEXT = '#88aacc';

// Panel / background
export const PANEL_BG = 'rgba(0,8,16,0.85)';
export const PANEL_BORDER = CYAN;
export const DIM_TEXT = '#556677';
export const DIM_OUTLINE = '#335566';
export const VERY_DIM = '#223344';
export const BAR_TRACK = 'rgba(0,16,32,0.5)';

// Faction accents (for stations/UI only, not ship hulls)
export const FACTION = {
  neutral:     CYAN,
  independent: '#88ff44',
  military:    '#ff8844',
  scavengers:   RED,
  monastic:     MAGENTA,
  communes:     GREEN,
  zealots:      AMBER,
  salvage_lords: '#ff6633',
  concord:      CONCORD_BLUE,
  player:       CYAN,
};

// Ship relation colors — color = relation to player, NOT faction/type
// Type is distinguished by size and shape (silhouette)
export const PLAYER_FILL = 'rgba(0,30,10,0.15)';
export const PLAYER_STROKE = GREEN;
export const ENEMY_FILL = 'rgba(30,5,5,0.15)';
export const ENEMY_STROKE = RED;
export const NEUTRAL_FILL = 'rgba(30,20,0,0.15)';
export const NEUTRAL_STROKE = AMBER;
export const FRIENDLY_FILL = 'rgba(5,10,30,0.15)';
export const FRIENDLY_STROKE = BLUE;

// Designer / preview fill — no relation context
export const DESIGNER_FILL = 'rgba(20,20,20,0.15)';

// Engine glow aliases (kept for any direct use)
export const ENGINE_GREEN = GREEN;
export const ENGINE_RED = RED;

// Relation → color lookup — the single source of truth for ship coloring.
// Ship._drawShape reads hullFill/hullStroke/engineColor getters derived from this.relation.
// Changing ship.relation is all you need to recolor a ship.
export const RELATION_COLORS = {
  none:     { fill: DESIGNER_FILL,        stroke: WHITE,           engine: WHITE },
  player:   { fill: PLAYER_FILL,          stroke: PLAYER_STROKE,   engine: GREEN },
  friendly: { fill: FRIENDLY_FILL,        stroke: FRIENDLY_STROKE, engine: BLUE },
  neutral:  { fill: NEUTRAL_FILL,         stroke: NEUTRAL_STROKE,  engine: AMBER },
  enemy:    { fill: ENEMY_FILL,           stroke: ENEMY_STROKE,    engine: RED },
  hostile:  { fill: ENEMY_FILL,           stroke: ENEMY_STROKE,    engine: RED },
  derelict: { fill: 'rgba(35,18,5,0.35)', stroke: '#886633',       engine: 'rgba(0,0,0,0)' },
};

// Pale — ice planet surface colors
export const PALE_ICE     = '#b8ccd8'; // icy blue-grey body
export const PALE_HAZE    = '#7090a8'; // limb atmospheric haze

// Thalassa — brine-sea moon colors
export const THALASSA_BRINE = '#4a9a6a'; // green-teal brine seas
export const THALASSA_LAND  = '#6a7a5a'; // muted olive landmasses
export const THALASSA_HAZE  = '#3a6a4a'; // thin green atmosphere

// World-space overlays
export const RANGE_CIRCLE = 'rgba(0,255,204,0.12)';

// Armor arc health color — shared by HUD and ShipScreen
export function armorArcColor(ratio) {
  if (ratio > 0.6) return GREEN;
  if (ratio > 0.3) return AMBER;
  if (ratio > 0)   return RED;
  return VERY_DIM;
}

// Module condition colors
export const CONDITION_FAULTY    = '#ff8800';   // orange — between amber and red
export const CONDITION_GOOD      = GREEN;
export const CONDITION_WORN      = AMBER;
export const CONDITION_DAMAGED   = RED;
export const CONDITION_DESTROYED = VERY_DIM;

// Derelict hull class colors
// unknown class uses MAGENTA (exotic) — import from above

export function conditionColor(condition) {
  const map = {
    good:      CONDITION_GOOD,
    worn:      CONDITION_WORN,
    faulty:    CONDITION_FAULTY,
    damaged:   CONDITION_DAMAGED,
    destroyed: CONDITION_DESTROYED,
  };
  return map[condition] ?? CONDITION_GOOD;
}

// Reputation standing level colors
export const STANDING_HOSTILE  = RED;           // '#ff4444'
export const STANDING_WARY     = '#ff8844';     // orange
export const STANDING_NEUTRAL  = DIM_TEXT;      // '#556677'
export const STANDING_TRUSTED  = GREEN;         // '#00ff66'
export const STANDING_ALLIED   = CYAN;          // '#00ffcc'

export function standingColor(level) {
  return {
    Hostile: STANDING_HOSTILE,
    Wary:    STANDING_WARY,
    Neutral: STANDING_NEUTRAL,
    Trusted: STANDING_TRUSTED,
    Allied:  STANDING_ALLIED,
  }[level] ?? DIM_TEXT;
}

// Map view
export const MAP_BG = 'rgba(0,4,8,0.92)';
export const MAP_ZONE_BORDER = 'rgba(0,255,204,0.15)';
export const NAV_WAYPOINT = AMBER;
export const NAV_COURSE_LINE = AMBER;
export const NAV_FUEL_RANGE = 'rgba(255,170,0,0.25)';

// Minimap
export const MINIMAP_BG = 'rgba(0,4,8,0.8)';
export const MINIMAP_BORDER = 'rgba(0,255,204,0.4)';
export const MINIMAP_PLANET = '#448844';
export const MINIMAP_STATION = WHITE;
export const MINIMAP_ENEMY = RED;
export const MINIMAP_FLEET = GREEN;
export const MINIMAP_PLAYER = GREEN;
export const MINIMAP_LOOT = AMBER;
export const MINIMAP_DERELICT = AMBER;

// Designer harness
export const DESIGNER_BG           = '#000810';
export const DESIGNER_CROSSHAIR    = '#0d1e2e';
export const DESIGNER_SCALE_RING   = '#091525';
export const DESIGNER_GRID         = '#0a1520';
export const DESIGNER_ORIGIN       = '#1a3a50';
