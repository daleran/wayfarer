# UI & Aesthetic Guide

This document defines the visual aesthetic for all Wayfarer UI elements and serves as a running log of UI/aesthetic decisions.

---

## Core Aesthetic: Vector Monitor / Cassette Futurism

The entire game screen should feel like a **vector monitor mounted in a 1970s-80s spaceship cockpit**. Think original *Star Wars* (1977) targeting computers, *Alien* (1979) ship interfaces, *Battlezone* (1980), early Atari vector arcade cabinets, and the general cassette futurism aesthetic: high-tech as imagined before the personal computer revolution.

### Guiding Principles

1. **Neon lines on black.** The display is a dark CRT. All UI elements are drawn as bright vector lines, outlines, and text against near-black backgrounds. Minimal fills — prefer strokes, outlines, and wireframes over solid filled rectangles.

2. **Limited neon palette.** A small set of vivid, phosphor-style colors:
   - **Cyan/teal** (`#00ffcc`, `#4af`) — Primary UI color. Borders, labels, general readouts.
   - **Amber/gold** (`#ffaa00`, `#fd8`) — Credits, prices, warnings. Warm instrument tone.
   - **Green** (`#00ff66`, `#4fa`) — Positive states: full health, docking prompts, player-owned ships.
   - **Red/orange** (`#ff4444`, `#f64`) — Damage, enemies, hostile contacts, critical warnings.
   - **Blue** (`#4488ff`) — Friendly/allied contacts.
   - **Magenta/violet** (`#ff44ff`, `#a8f`) — Rare items, Concord-related, exotic/unusual.
   - **White** (`#ffffff`) — Sparingly. Bright accents, highlighted text, crosshair.

   **Color-by-relation rule for ships:** Ship color conveys the entity's **relation to the player**, not its type or faction. Green = player-owned, amber = neutral/cautious, red = hostile, blue = friendly. Ship **type** (gunship vs hauler vs frigate) is distinguished by **size and shape** (silhouette). Non-ship world entities (planets, asteroids, nebulae, stations) are exempt and may use any color that serves the aesthetic.

3. **Monospace everything.** All text uses monospace fonts. No proportional fonts anywhere. Text should feel like terminal output or a dot-matrix printout.

4. **Scanline / CRT feel.** Subtle effects that suggest a phosphor display:
   - Faint scanline overlay (horizontal lines at low opacity).
   - Slight glow/bloom on bright elements (draw the element, then draw it again slightly larger at low opacity).
   - Text and lines should feel crisp but with a slight luminous haze.

5. **Angular, geometric shapes.** UI panels use sharp corners or 45-degree chamfered/clipped corners — not rounded. Think military HUD brackets, targeting reticles, and technical schematics. Decorative corner marks (e.g., small `L`-shaped brackets at panel corners) reinforce the cockpit instrument feel.

6. **No photorealism.** Everything is abstracted. Ships are wireframe or flat-polygon silhouettes. Planets are simple circles with minimal gradient. The beauty is in the clean geometry and color, not in detail or realism.

7. **Minimal fills, maximum line work.** Backgrounds should be transparent or near-black. Bars (health, throttle) can use dim fills, but the emphasis is on the bright outline and the colored fill portion. Buttons are outlined, not filled solid.

---

## Color Reference

### UI Chrome
| Element | Color | Hex |
|---|---|---|
| Panel borders, brackets | Cyan | `#00ffcc` |
| Panel background | Near-black, high transparency | `rgba(0, 8, 16, 0.85)` |
| Divider lines | Cyan, low opacity | `#00ffcc` at 20-30% alpha |
| Inactive/disabled text | Dim grey-blue | `#445566` |

### Data & Readouts
| Element | Color | Hex |
|---|---|---|
| Primary labels & text | Cyan | `#00ffcc` |
| Credits / prices | Amber | `#ffaa00` |
| Cargo / quantities | Teal | `#44aaff` |
| Positive status (full, OK) | Green | `#00ff66` |
| Negative status (damage, critical) | Red | `#ff4444` |
| Exotic / rare / Concord | Magenta | `#ff44ff` |

### Minimap
| Element | Color | Hex |
|---|---|---|
| Player fleet | Cyan | `#00ffcc` |
| Settlements | White | `#ffffff` |
| Enemies | Red | `#ff4444` |
| Moons | Dim green | `#448844` |
| Derelicts / loot | Amber | `#ffaa00` |
| Wormholes | Magenta | `#ff44ff` |
| Minimap border | Cyan, dim | `#00ffcc` at 40% alpha |
| Background | Black, translucent | `rgba(0, 4, 8, 0.8)` |

### Ship Relation Colors
| Relation | Color | Hex | Usage |
|---|---|---|---|
| Player-owned | Green | `#00ff66` | Player flagship and fleet ships |
| Neutral / Cautious | Amber | `#ffaa00` | Ships with no strong alignment |
| Hostile | Red | `#ff4444` | Enemies actively attacking |
| Friendly / Allied | Blue | `#4488ff` | Allied ships, escort targets |

### Faction Accents (UI / Stations only)
Faction accents are used for **station UI**, **minimap labels**, and **faction insignia** — not for ship hull color (which follows the relation table above).

| Faction | Accent Color | Hex |
|---|---|---|
| Settlements | Cyan | `#00ffcc` |
| Scavenger Clans | Orange/rust | `#ff8844` |
| Concord Remnants | Violet/white | `#cc88ff` |
| Void Fauna | Bioluminescent green | `#44ff88` |
| Monastic Orders | Deep blue | `#4488ff` |
| Zealots | Magenta/red | `#ff44aa` |
| Communes | Warm yellow-green | `#aaff44` |

---

## UI Element Patterns

### Panel / Window Frame

```
  +---------+       Outer border: 1-2px cyan stroke
  |         |       Background: near-black, ~85% opacity
  |         |       Corner brackets (optional): small L-shapes
  +---------+       at each corner for a targeting-reticle feel
```

- Panels should have **chamfered corners** (45-degree cuts) or simple right angles with decorative bracket marks.
- No drop shadows. No rounded corners. No gradients on borders.
- Dividers inside panels: thin horizontal lines in the accent color at low opacity.

### Buttons

- **Outlined rectangles** with text centered inside. No solid fills when idle.
- Idle: dim outline (`#335566`), dim text.
- Enabled/available: bright outline (cyan or accent color), bright text.
- Hover (if implemented): fill with accent color at ~15% opacity, text brightens to white.
- Disabled: very dim outline and text (`#223344`).

### Health / Status Bars

- Background track: very dark, barely visible (`rgba(0, 16, 32, 0.5)`).
- Fill: bright color corresponding to the stat (cyan for armor, amber for hull).
- Outline: 1px stroke in the same color as the fill, slightly dimmer.
- Critical state: bar color shifts to red, pulses/flashes.
- Consider a segmented bar style (discrete blocks rather than smooth fill) for a more digital/instrument feel.

### Throttle Display

- Row of discrete pips/segments, outlined.
- Active segment: filled with cyan, bright text.
- Inactive segments: dim outline only.
- Speed readout below in monospace, amber or cyan.

### Crosshair / Targeting Reticle

- Thin vector lines. A simple cross or brackets `[ + ]` style.
- Subtle rotation or pulse animation.
- Color: white or cyan. Shifts to red when over an enemy.

---

## CRT / Scanline Effect

A subtle fullscreen post-processing pass (or overlay) to sell the vector monitor look:

1. **Scanlines:** Horizontal lines every 2-4 pixels at very low opacity (`rgba(0, 0, 0, 0.06-0.1)`). Should be barely perceptible — felt more than seen.

2. **Vignette:** Slight darkening at screen edges. Simulates CRT curvature and phosphor falloff. Can be done with a radial gradient overlay.

3. **Glow / Bloom:** Bright UI elements (text, lines, bars) can be drawn twice — once sharp, once slightly larger/blurred at low opacity — to simulate phosphor glow. Keep this subtle; heavy bloom looks modern, not retro.

4. **Flicker (very subtle):** Occasional, barely-perceptible global brightness variation (e.g., `globalAlpha` oscillating between 0.97 and 1.0 at ~30Hz). Optional and should be almost subliminal.

These effects are **cosmetic polish**, not critical-path. Implement the clean vector look first; add CRT effects as a final pass.

---

## Typography

- **Font:** `monospace` (system default). If a custom font is ever added, it should be a clean pixel/terminal font (e.g., something like IBM VGA, Terminus, or a bitmap-style web font).
- **Sizes:**
  - Panel headers: 16-18px
  - Labels and readouts: 12-14px
  - Small/secondary text: 10-11px
  - All caps for headers and labels. Mixed case for body text and descriptions.
- **Spacing:** Generous. Instruments are meant to be read at a glance in tense situations. Don't cram text together.

---

## Specific UI Components

### Station Screen
- Dark backdrop overlay (near-black, 85% opacity — the game world should barely ghost through).
- Central panel with cyan border and corner brackets.
- Station name in large monospace text, centered, cyan.
- Tab bar: text-only tabs with an underline indicator on the active tab. No tab "boxes."
- Content area: clean rows of data. Commodity lists, ship stats, etc. in aligned monospace columns.
- Buttons: outlined rectangles. Buy/Sell in green/amber.
- Close prompt at bottom: dim text, "[Esc] Close".

### HUD (In-Flight)
- Health bars: top-left. Segmented or smooth, outlined. Label to the left in small caps.
- Credits: top-right. Amber text, no background panel.
- Cargo: below credits. Teal text.
- Throttle: bottom-center. Segmented pips.
- Minimap: bottom-right. Circular or rectangular with vector border. Dark background. Dots for contacts.
- Dock prompt: bottom-center, above throttle. Green text, pulsing slightly.
- All HUD elements should feel like they're **projected onto a transparent display** — no heavy panel backgrounds, just floating text and indicators over the game world.

### Game World Elements
- **Ships:** Wireframe polygons with minimal fill. Ship types are distinguished by **size and shape** (silhouette), not color. Color indicates **relation to the player**: green = player-owned, amber = neutral/cautious, red = hostile, blue = friendly. Non-faction entities (planets, asteroids, nebulae) may use any color that serves the aesthetic. Engine glow is pulsing outline circles at exhaust points; engine trails are long fading lines behind moving ships.
- **Settlements:** Geometric wireframe-style structures. Bright outline with minimal fill. Docking lights blink in cyan or amber.
- **Projectiles:** Color and shape convey weapon type:
  - **Autocannon rounds (kinetic):** Amber streaks (`#ffaa00` glow, `#ffe0a0` core). Slightly longer lines, slower travel speed. The most common projectile in the game — weighty and impactful.
  - **Laser bolts:** Cyan streaks (`#00ffcc` glow, `#ccffff` core). Thin, fast, short lines. Rare — only seen on well-equipped ships.
  - **Missiles:** Small triangle with a bright exhaust point.
- **Explosions:** Expanding rings/circles (vector style) with scattered particle sparks. Not filled bursts — concentric rings that expand and fade.

---

## Decision Log

### 2026-03-07: Establish Vector Monitor Aesthetic
- **Decision:** All UI should look like a vector monitor display from a 1970s-80s spaceship. Cassette futurism / original Star Wars targeting computer style.
- **Key points:** Neon on black, monospace text, outlined elements over filled, scanline/CRT effects as polish layer.
- **Palette:** Cyan primary, amber for values, green for positive, red for negative, magenta for rare/exotic.
- **Rationale:** Fits the retrofuturist lore (CRT terminals, analog instruments, deliberately primitive computing) and gives the game a distinctive visual identity with procedural vector graphics.

### 2026-03-07: Color-by-Relation Rule
- **Decision:** Ship color indicates **relation to player** (green = owned, amber = neutral, red = hostile, blue = friendly), NOT ship type or faction. Ship types are distinguished by **size and shape** (silhouette).
- **Exception:** Non-faction entities (planets, asteroids, nebulae, stations) can use whatever color serves the aesthetic.
- **Rationale:** At a glance in combat, the player needs to instantly know friend from foe. Shape + size differentiates ship class. Color overloading both faction and relation is confusing — relation is the critical combat readout.

### 2026-03-07: Weapon Projectile Colors
- **Decision:** Projectile color conveys **weapon type**, not ship relation. Autocannon rounds are amber (`#ffaa00`), laser bolts are cyan (`#00ffcc`). This is an exception to the color-by-relation rule — projectiles follow weapon-type coloring.
- **Rationale:** Kinetic weapons are the universal standard; their amber streaks should dominate the battlefield. Laser bolts in cyan immediately read as "something different/rare." Players can identify weapon types at a glance, which matters for threat assessment (lasers strip armor fast).

### 2026-03-07: Ship Shape Philosophy
- **Decision:** Player ships should feel **chunky and utilitarian**, not sleek or angular. They are salvage-tech workhorses, not fighter jets. Prefer rectangular, boxy silhouettes with visible functional elements (engine bays, bumpers, cargo containers) over pointed/aerodynamic shapes.
- **Player scrap ship (flagship):** Repurposed space tug — wide rounded bumper at the nose (for pushing debris), narrow elongated body section, single large engine bay extending out on the starboard side. One big engine. Reads as an asymmetric working vessel, not a warship.
- **Brawler (gunship):** Stout, wide, flat-fronted box. Reads as a tank.
- **Frigate:** Swept-wing and angular — the exception that proves the rule. Speed-oriented silhouette.
- **Hauler:** Semi-truck: small cockpit pulling 3 rectangular cargo containers that snake behind via position history.
- **Rationale:** Shape is the primary way to identify ship type. Chunky/utilitarian shapes reinforce the salvage-tech lore and contrast with the clean vector rendering style.
