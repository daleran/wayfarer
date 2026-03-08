// Shared color palette — vector monitor / cassette futurism aesthetic
// See UI.md for full reference

// Primary palette
export const CYAN = '#00ffcc';
export const AMBER = '#ffaa00';
export const GREEN = '#00ff66';
export const RED = '#ff4444';
export const BLUE = '#4488ff';
export const MAGENTA = '#ff00aa';
export const WHITE = '#ffffff';
export const TEAL = '#44aaff';
export const RAIL_WHITE   = '#ddeeff';
export const PLASMA_GREEN = '#44ff88';
export const TORPEDO_AMBER = '#cc8800';

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
  none:     { fill: DESIGNER_FILL,  stroke: WHITE,           engine: WHITE },
  player:   { fill: PLAYER_FILL,    stroke: PLAYER_STROKE,   engine: GREEN },
  friendly: { fill: FRIENDLY_FILL,  stroke: FRIENDLY_STROKE, engine: BLUE },
  neutral:  { fill: NEUTRAL_FILL,   stroke: NEUTRAL_STROKE,  engine: AMBER },
  enemy:    { fill: ENEMY_FILL,     stroke: ENEMY_STROKE,    engine: RED },
};

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
