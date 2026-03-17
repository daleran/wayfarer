# UX & Aesthetic Guide

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
| Derelicts / scrap loot | Amber | `#ffaa00` |
| Module loot diamond | Cyan | `#00ffcc` |
| Weapon loot diamond | Magenta | `#ff00aa` |
| Ammo loot diamond | Green | `#00ff66` |
| Wormholes | Magenta | `#ff44ff` |
| Minimap border | Cyan, dim | `#00ffcc` at 40% alpha |
| Background | Black, translucent | `rgba(0, 4, 8, 0.8)` |

### Map View & Navigation

Full-screen canvas overlay opened with **M**. Own world→screen transform independent of game camera.

| Element | Color | Hex |
|---|---|---|
| Map background | Near-black | `rgba(0,4,8,0.92)` |
| Zone border circles | Dim cyan | `rgba(0,255,204,0.15)` |
| Waypoint marker | Amber | `#ffaa00` |
| Course line (dotted) | Amber | `#ffaa00` at 60% |
| Fuel range circle (dashed) | Amber | `rgba(255,170,0,0.25)` |
| Station icons | Faction-colored diamond | per `FACTION` map |
| Player marker | Green triangle | `#00ff66` |
| Bounty targets | Pulsing red diamond | `#ff4444` |

Nav indicator (in-flight, waypoint set): amber chevron at screen edge with distance text.

Below minimap: zone name (dim text), waypoint destination + distance + ETA (amber).

### Module Visuals on Hull
Modules render at defined mount points on the ship hull, drawn after `_drawShape` in ship-local coordinates. Each icon is 4–8px, stroked in `conditionColor(mod.condition)` with a dim fill. Destroyed modules show as dim outlines only (alpha 0.2). Empty slots render as a faint `DIM_OUTLINE` ring.

**Rule: No engine graphics in hull `_drawShape()`.** Ship hulls must NOT draw engine housings, bell nozzles, or exhaust plumes as part of their hull shape. Engine visuals are the responsibility of the engine module's `drawAtMount()` method, rendered at the mount point. This keeps engine appearance tied to the installed module and avoids doubling up visuals.

| Category | Shape | Notes |
|---|---|---|
| Engine | Trapezoid (wide top, narrow bottom) | Nozzle silhouette |
| Weapon:autocannon | Thin rectangle (2×8) | Barrel |
| Weapon:cannon | Stubby rectangle (3×6) | Block |
| Weapon:lance | Vertical line + dot | Emitter |
| Weapon:rocket | Rectangle (6×5) + 2 inner dots | Tube rack |
| Reactor | Chamfered square (7×7) + inner glow dot | Glow: cyan (fuel cell), amber (fission), magenta (fusion) |
| Sensor | Ring + antenna line + tip dot | Dish/antenna |

Source: `js/rendering/moduleVisuals.js`.

### Module Condition Colors
Used in Ship Screen slot badges, cargo pill badges, tooltip CONDITION/MULT rows, and hull mount point module icons. Helper: `conditionColor(condition)` from `colors.js`.

| Condition | Color | Hex | Mult |
|---|---|---|---|
| `'good'` | Green | `#00ff66` | ×1.00 |
| `'worn'` | Amber | `#ffaa00` | ×0.85 |
| `'faulty'` | Orange | `#ff8800` | ×0.65 |
| `'damaged'` | Red | `#ff4444` | ×0.35 |
| `'destroyed'` | Very dim | `#223344` | ×0.00 → drops as scrap |

### Derelict Hull Class Colors
Each class has a distinct hull stroke color. Used in `derelict.js`.

| Class | Color | Hex |
|---|---|---|
| `'hauler'` | Warm rust-brown | `#886633` |
| `'fighter'` | Muted green-grey | `#667744` |
| `'frigate'` | Muted blue-grey | `#556688` |
| `'unknown'` | Magenta | `#ff00aa` |

### Ship Relation Colors
Ship color is driven entirely by `ship.relation` — a single string property. Change it and the hull color updates instantly. No color is ever hardcoded in a ship class.

| `relation` | Color | Hex | Usage |
|---|---|---|---|
| `'player'` | Green | `#00ff66` | The player's own ship |
| `'neutral'` | Amber | `#ffaa00` | Ships with no strong alignment |
| `'enemy'` | Red | `#ff4444` | Actively hostile |
| `'friendly'` | Blue | `#4488ff` | Allied ships |
| `'none'` | White | `#ffffff` | Designer preview (no relation context) |

Engine trail color and engine glow match `relation` automatically via the same `RELATION_COLORS` lookup.

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

4. **Flicker (implemented):** A black fullscreen rect with `globalAlpha = 0.03 * Math.random()` drawn after vignette, before crosshair. Dims the frame 0–3% randomly each tick — subliminal brightness variation matching the "0.97–1.0 globalAlpha at ~30Hz" spec.

**Performance:** Scanlines and vignette are pre-rendered to offscreen canvases (rebuilt on resize via `_ensureCaches()`), then composited with a single `drawImage()` call each frame. Starfield layers also use per-layer offscreen canvases with parallax tiling (3–12 `drawImage` calls vs ~350 `fillRect` calls). Edge warning gradients (flank speed amber, hull critical red) are cached as `CanvasGradient` objects and reused each frame with `globalAlpha` for pulsing — eliminates 4–8 `createLinearGradient()` + 8–16 `addColorStop()` per frame.

---

## Typography

- **Font:** `'Fira Mono', monospace` (exported as `FONT` from `js/rendering/draw.js`). All canvas and DOM text uses this font family.
- **All caps** for all canvas world-space text (station names, zone labels, prompts, flavor text). Mixed case only for DOM body text and descriptions.
- **Spacing:** Generous. Instruments are meant to be read at a glance in tense situations. Don't cram text together.

### Canvas Text Style System

Standardized text styles are defined in `js/rendering/draw.js` as named constants. Each exports `{ font, alpha, size, weight }`. **Always use these constants** — never hardcode font strings in canvas rendering code. Color is always per-call.

| Style | Size | Weight | Alpha | Usage |
|---|---|---|---|---|
| `TITLE` | 48px | normal | 0.7 | Major world landmarks — station names, planet/moon names |
| `SUBTITLE` | 24px | normal | 0.5 | Zone labels, sub-areas, smaller station names |
| `PROMPT` | 12px | bold | 1.0 | HUD prompts, progress bars, status indicators, action text |
| `FLAVOR` | 12px | normal | 0.6 | On-map flavor text, derelict lore, ambient descriptions |
| `LABEL` | 10px | normal | 0.65 | Weapon panels, throttle readout, ammo counts, dev controls |
| `MINIMAP` | 10px | normal | 1.0 | Minimap station/entity names |

**Usage with `text()` helper:** `text(ctx, 'THE COIL', x, y, color, { style: TITLE })` — the style preset provides size/weight/alpha defaults; individual opts can still override.

**Usage with raw ctx:** `ctx.font = PROMPT.font; ctx.globalAlpha = PROMPT.alpha;` — use `.font` for pre-built font string, `.alpha` for the standard opacity.

### DOM Text (CSS Utility System)

DOM panels use a shared CSS utility system defined in `css/panel.css`. Three typography tiers via CSS custom properties:

| Variable | Size | Usage |
|---|---|---|
| `--p-text` | 13px | Body text, stat values, choices, dialogue |
| `--p-title` | 16px | Panel/section titles, station names |
| `--p-small` | 11px | Tooltips, cargo filters, barter labels, jettison buttons |

**Typography utility classes** (defined in `panel.css`):
- `.p-heading` — 16px bold uppercase, 0.12em spacing (panel titles)
- `.p-subheading` — 13px bold uppercase, 0.08em spacing (section headers)
- `.p-text` — 13px body text
- `.p-label` — 13px uppercase, 0.08em spacing
- `.p-hint` — 13px, very-dim color
- `.p-small` — 11px compact text
- `.p-bold`, `.p-upper`, `.p-italic`, `.p-wide` — modifiers

**Color utility classes**: `.t-cyan`, `.t-amber`, `.t-green`, `.t-red`, `.t-magenta`, `.t-white`, `.t-dim`, `.t-very-dim`

**Rule:** Never hardcode `px` font sizes in panel CSS. Use `var(--p-text)`, `var(--p-title)`, or `var(--p-small)`. Dev-only tool panels (designer, editor) may use `10px` for compact labels below the standard tiers.

Panel-specific CSS files (`css/ship.css`, `css/narrative.css`, `css/designer.css`, `css/editor.css`) inherit variables and utilities from `panel.css`.

---

## Specific UI Components

### Ship Panel (`js/ui/shipScreen.js`, `css/ship.css`)
- **DOM-based left 30% panel** (`#ship-panel`), `height: calc(100vh - 48px)` to sit above the bottom HUD bar. Near-black background with scanline overlay, left border in cyan.
- Opens with `I`, closes with `I` or `Esc`. Pauses simulation while open. Camera zooms to 4× on the player ship. World remains visible in the remaining viewport.
- **Header:** Ship name (HULLBREAKER), class description, `[I] / [Esc]` hint.
- **Stats section:** 2-column grid of stat rows (HULL, ARM-F/P/S/A, SPEED, FUEL, SCRAP). Values colored by status (green=good, amber=normal, red=critical).
- **Module mount UI (canvas, to the right of the DOM panel):** Replaces the old DOM module list. Stat boxes are drawn on canvas between the panel edge and the ship hull, connected by cyan lines to the actual mount points on the hull.
  - **Installed slots:** One box per mount point, stacked vertically. Each box shows: `[E]`/`[N]` slot label, abbreviated module name, power (`+/-W`), condition dot. Empty slots show dashed cyan border with "EMPTY" label.
  - **Cargo modules:** Below a divider line, uninstalled modules from inventory are listed in smaller boxes.
  - **Connection lines:** Dashed CYAN lines (alpha 0.3) from right edge of each stat box to its hull mount point. Hovered: solid, alpha 0.9, lineWidth 1.5.
  - **Hover:** Box or mount point → box expands to show full stats (condition, power, thrust, weight, fuel drain, etc.). Corresponding mount point gets a cyan ring highlight.
  - **Click installed box:** Uninstalls module to cargo section.
  - **Click empty slot box:** When a cargo module is selected in the DOM cargo list, clicking a compatible empty slot starts the 1.5s install. Engine modules → engine slots; non-engines → non-engine slots.
  - **Inventory mode:** While ship screen is open, `ship._inventoryMode = true`. Mount point outlines render in CYAN with higher alpha. Installed module icons get a subtle cyan ring.
- **Cargo bay (DOM):** Header with used/capacity count. Filter buttons (ALL | MODULES | COMMODITIES | AMMO). Scrollable list: scrap always first, then commodities, modules (clickable to select for install), weapons, ammo reserves. Selected module highlighted in green; click a compatible empty canvas slot to install.
- **When docked with station open:** ship panel (left 30%) + station panel (right 30%) + world (middle 40%).
- Input gating: `stopPropagation` on panel mousedown/click prevents canvas weapon fire.

### Narrative Panel (`js/ui/narrativePanel.js`, `css/narrative.css`)
- **DOM-based right 30% panel** (`#narrative-panel`), `height: calc(100vh - 48px)`, left border in cyan. World visible in remaining viewport. Camera centers on docked station.
- **Disco Elysium-style scrolling narrative log** — every interaction is a conversation. No tabs, no generic service panels. Navigation is narrative: zone choices are dialogue options.
- **Header:** Station name, faction badge, standing, scrap count, `[Esc]` hint.
- **Log area** (`.np-log`): Scrollable log of entries. Types: `narration` (flavor/title/system), `dialogue` (speaker + text), `action` (player's chosen action in green italic), `result` (outcome in amber/green/red). Entries fade in with 200ms animation.
- **Choice buttons** (`.np-choices`): Pinned to bottom. Ephemeral — when picked, they become an `action` entry + whatever follows. Disabled choices shown greyed with reason text.
- **Zone dividers** (`.np-divider`): Thin cyan line + zone label centered. Inserted on zone transitions — log is NOT cleared, entire docking session scrollable.
- **Barter screen** (`.np-barter`): Renders inline in the log as a special entry. Item rows with +/- quantity controls, confirm/cancel buttons. Greyed out after completion.
- **Conversation scripts**: Async functions in `js/ui/narrative/conversations/`. Each `await log.choices(...)` to pause for player input. Hub conversations loop zone choices + `[Undock]`.
- **Esc** closes the panel (and undocks).
- **Story flags**: `game.storyFlags` (session-only key→value map). First-visit narration, NPC memory, gated dialogue branches.

### Controls Panel (`engine/ui/controlsPanel.js`, `css/controls.css`)
- **DOM-based right panel** (`#controls-panel`), `panel-base` frame, 280px wide. Toggled by **F1**.
- **Header:** "CONTROLS" title + `[F1] close` hint.
- **Sections:** MOVEMENT, COMBAT, SYSTEMS, MAP CONTROLS, GENERAL — each with key/description rows.
- **Key labels** in amber, descriptions in dim. Section titles in cyan small-caps.
- Available at any time (docked, in-flight, map open). Non-blocking — does not pause the game.

### HUD (In-Flight)

The HUD has three zones: **ship-anchored UI** (canvas, follows ship), **bottom strip** (DOM, fixed bar), and **minimap** (canvas, top-right).

**Ship-anchored UI (canvas, centered on the ship):**
- **Weapon readout** — directly above the ship. Two rows: `PRI` (cyan) and `SEC` (magenta). Name + cooldown/reload bar + ammo count. Anchored ~85px above ship center in screen space.
- **Throttle pips** — directly below the ship. Six labeled pips (`Stop/1/4/1/2/3/4/Full/Flank`), active pip filled cyan. Speed and throttle label above the pips. System integrity symbols `[R][E][S]` below the pips in dim text (red if low).

**Bottom strip (DOM, `#hud-bottom`, `css/hudBottom.css`):**
- Fixed 48px bar at bottom of viewport, z-index 20. Near-black background with top cyan border. `pointer-events: none`.
- Single row with centered segments: ARMOR pips | HULL bar | FUEL bar | PWR readout | CARGO bar | SCRAP count.
- **ARMOR pips:** 4 small boxes labeled `F/P/S/A`, each with colored fill bar by arc health (green→amber→red via `armorArcColor`). `current/max` text to the right.
- **HULL bar:** 110px wide bar, green fill, border turns red below 25%. `current/max` text.
- **FUEL bar:** Amber bar, border turns red below 25%. `current/max` text.
- **POWER readout:** `PWR +300W [+50W]` — green gross output, net in green/red. Flashing `! OVERHAUL` warning when fission reactor is overdue.
- **CARGO bar:** Blue bar, turns red when full. `used/capacity` text.
- **SCRAP count:** `⚙ 123` in bold amber.
- All bars and values updated via DOM manipulation in `HUD._updateBottomStrip()` each frame — no canvas rendering.

**Minimap:** Top-right corner. 225×225, bracket-corner border. Stations (faction-colored squares), derelicts (amber squares), loot (amber dots), enemies (red dots) when sensor capability is installed. Player dot (green triangle, rotation-aware).

**Kill log:** DOM-based (`#hud-kill-log`), positioned below the minimap via CSS. Entries are `<div class="hud-kill-entry">` elements with a CSS `kill-fade` animation (3s linear fade-out). Removed from canvas on `animationend`.

**Pickup text:** DOM-based (`#hud-pickup-container`), positioned over the ship via JS `transform: translate()` each frame. Entries are `<div class="hud-pickup-entry">` with color-hint CSS classes (`.pickup-breach`, `.pickup-repair`, `.pickup-hostile`, `.pickup-module`, `.pickup-cargo`, `.pickup-default`). 2s fade-out animation. Removed from canvas on `animationend`.

**Contextual prompts:** Centered horizontally at ~62% screen height. Dock/salvage/repair prompts appear here, pulsing slightly.

**Crosshair cursor:** Custom canvas crosshair replaces the OS cursor (`cursor: none` on canvas). Two modes based on combat state:
- **Standard mode** (default): Cyan hollow circle (r=6, stroke 1.5px, 75% alpha). No range feedback.
- **Combat mode** (F key toggle): Four short arms with a center dot. Green when within weapon range; red with "OUT OF RANGE" label when beyond range.

**Combat mode border:** When combat mode is active, a solid 2px red frame is drawn inset 8px from the screen edges. Thicker 3px L-shaped corner brackets (40px arms) overlay the corners. `[COMBAT MODE]` text centered at the top.

**Ship health via ship rendering:** The player ship's hull fill color indicates overall hull health — green (>75%), yellow-green (>50%), orange (>25%), red (critical). The hull outline is split into 4 arc segments (front, starboard, aft, port) each colored by that arc's armor health via `armorArcColor(ratio)`. This applies to **all ships when `relation === 'player'`** — directional damage is readable by looking at the ship itself.

### Game World Elements
- **Ships:** Wireframe polygons with minimal fill. Ship types are distinguished by **size and shape** (silhouette), not color. Color indicates **relation to the player**: green = player-owned, amber = neutral/cautious, red = hostile, blue = friendly. Non-faction entities (planets, asteroids, nebulae) may use any color that serves the aesthetic. Engine glow is pulsing outline circles at exhaust points; engine trails are long fading lines behind moving ships.
- **Stations:** See station design philosophy below.

### Derelict World-Space Labels

Derelicts render two types of text directly in world-space (anchored to the hull's screen position), not in the HUD:

Both are proximity-triggered — only rendered when `derelict.isNearby = true` (player within interaction range). No derelict name label; the lore text replaces it.

1. **Lore paragraph** — Rendered to the **right** of the hull. `FLAVOR` style (12px normal, `DIM_TEXT`, 0.6 alpha scaled by distance). No blinking. Multiple lines from `derelict.loreText[]` spaced 16px apart, vertically centered on the hull. Story unfolds as the player approaches — not in a HUD box.

2. **`[ E ] SALVAGE` prompt** — Rendered **below** the hull. `PROMPT` style (12px bold), AMBER, blinking (sinusoidal alpha 0.55–0.90).

Set `isNearby` on the derelict entity from `game._checkDerelictInteraction()`; clear it when no longer nearby.

**Principle:** Contextual prompts and lore belong to the world, not the HUD. The HUD is for combat-critical readouts. Discovery text should feel like it's written on the object itself.

### Station Design Philosophy

Stations are **not** sleek, symmetric, corporate structures. This is a broken universe. Stations look like they were assembled over decades by whoever had the parts. Design principles:

1. **Built from rectangles, not polygons.** Each station is a collection of distinct rectangular hull plates and modules of different sizes — stacked, offset, and bolted together. No hexagons. No perfect symmetry. The irregularity of the rect arrangement IS the character.

2. **Asymmetric by design.** Left and right sides should differ. One arm is wider than the other. Panels extend at slightly different lengths. A section may jut out or step in unexpectedly. This should feel like it grew organically over time, not like it was CAD-designed.

3. **Cobbled construction language.** Visual detail should reinforce the "scrapped together" feel:
   - Thin seam lines between hull sections (at low alpha)
   - Small overlapping patch panels at slight rotations (`strokeRect` at 5–20° offset)
   - Rivet-dot at patch center
   - Inner-surface ribs (faint horizontal lines across arms/modules)

4. **Relation color signals station attitude — not faction.** Structure (hull plates, rects, brackets) is always WHITE at partial alpha. Accent elements — nav lights, pier lights, beacons, labels — use the `accentColor` getter driven by `station.relation`: AMBER = neutral (default for all factions), CYAN = friendly, RED = enemy. Fuel tanks are always AMBER regardless of relation (hazard marking, not faction). Stations expose `outlineColor` (bright accent for canvas labels and UI borders) and `fillColor` (dimmed 15% alpha version for UI panel backgrounds) — both derived from `accentColor`.

5. **Docked ships add life.** Use small boxy ship silhouettes (rectangular hull + cockpit block + wing stubs) parked at jetty tips and inner piers. Vary rotation and scale. They should read as "in various states of disassembly/assembly" — not all perfectly aligned.

6. **Animated docking lights at every pier tip.** Pulsing sinusoid, slightly offset per pier so they don't all pulse in sync. Pier light color = `accentColor`.

7. **Approach beacon at the harbor mouth.** Two beacons at the harbor entrance corners, pulsing together. A faint trapezoidal gradient beam pointing away from the mouth. Beacon color = `accentColor`.

8. **Label below the structure** in `outlineColor`, SUBTITLE style (24px, uppercase).

9. **Section flavor text proximity fade.** Each station section's first flavor line fades in when the player flies near that area, using `FLAVOR` style (12px, accent color). Distance threshold: 400 world units from the section's label position (`worldOffset + labelOffset`). Smooth lerp at 1.2/sec. Same principle as derelict lore text — discovery is gradual. Rendered by `Station.renderSectionLabels()` in the entity pass. Per-section alphas stored in `station._sectionFadeAlphas`.

10. **Section labels are data-driven and always visible.** Station area labels (e.g. "MARKETPLACE", "SLUMS") are rendered by `Station.renderSectionLabels()` in the entity render pass, using `SUBTITLE` style in the station's `accentColor`, left-aligned. Each layout section has `labelOffset: { x, y }` (world-space offset from `worldOffset`) that positions the label near the corresponding structure. No separate inline labels in station renderers — section names come from layout data only. The station title (e.g. "THE COIL") remains hardcoded in the renderer using `TITLE` style.

**Anti-patterns to avoid:**
- No hexagons
- No symmetric 4-arm or 6-arm radial designs
- No solid fills on hull (dark near-black fill with bright outline only)
- No rounded corners
- Don't draw stations as single closed polygon paths — individual rects are preferred

### Celestial Body Rendering

Planet and moon visuals follow the **CRT surface-scanner aesthetic** — line work only, no gradients, no filled areas. The look is a topographic instrument readout, not a painting.

**Rendering style by planet type:**

- **Ice / rocky worlds (surface visible from space):** Topographic contour polygons clipped to the disk. Draw 3–6 closed irregular polygon paths at decreasing scales — nested, offset, not centered — to suggest terrain elevation layers. Jagged straight-line segments between vertices (no bezier smoothing). The visual reference is the Nostromo descent computer in *Alien* (1979): a CRT scanner reading back surface topology as jagged closed curves. Pale (`#b8ccd8`) is the reference implementation in `data/locations/tyr/pale/orbital/terrain/planet-pale/index.js`.

- **Gas giants:** Horizontal band striations — thin lines or arcs at different y-offsets across the disk, clipped. Bands should vary in spacing and opacity. Optional: planetary rings as thin ellipses angled across the limb. No solid fills.

- **Habitable worlds (brine seas, landmasses):** Continental landmass contours — filled faintly with coastline strokes. Same jagged polygon style as ice worlds, but with filled landmasses at very low alpha and distinct coastline outlines. Thalassa (`#4a9a6a`) — reference implementation pending relocation.

- **Thick-atmosphere worlds (shrouded):** Geometric cloud swirls — angular spiral or arc segments that suggest cloud bands without being smooth curves. Straight-line approximations of spiral paths, or stacked arc segments offset from center, clipped to disk.

**Common rules for all planet types:**
- Very faint body fill (0.05–0.08 alpha) — just enough to read as a disk, not a ring
- All surface detail clipped to the disk
- Thin outer atmosphere haze ring (single stroke, very low alpha) where appropriate
- Bright limb outline (1–2px stroke)
- Parallax applied at ~0.7× camera speed — planets are always background, never on the ship plane
- Name label fades in only when the player is near the surface

- **Projectiles:** Color and shape convey weapon type:
  - **Autocannon rounds (kinetic):** Amber streaks (`#ffaa00` glow, `#ffe0a0` core). Slightly longer lines, slower travel speed. The most common projectile in the game — weighty and impactful.
  - **Laser bolts:** Cyan streaks (`#00ffcc` glow, `#ccffff` core). Thin, fast, short lines. Rare — only seen on well-equipped ships.
  - **Missiles/Rockets:** No particle effect. A **pulsing amber circle** (`#ffaa00`) at the head — outer glow ring + inner bright ring + white core dot, fast pulse (~18Hz). A long **amber engine trail** behind it (position-history polyline, same technique as ship engine trails: fades in alpha and width toward the oldest point). Evokes the Homeworld-style missile aesthetic: a glowing ball of propulsion leaving a bright smear across the void.
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

### 2026-03-11: CONCORD_BLUE — Faction Stroke Override for Concord Enemies
- **Decision:** Added `CONCORD_BLUE = '#4488ff'` to `colors.js`. Concord enemies use `ENEMY_FILL` (relation-based fill, red tint) but their stroke is overridden to `CONCORD_BLUE` instead of `ENEMY_STROKE` (`RED`).
- **Entities:** DroneControlFrigate and SnatcHerDrone both import and hardcode `CONCORD_BLUE` as stroke in their `_drawShape()` implementations.
- **Rationale:** The color-by-relation rule governs **fill** (a combat readout — red tint = hostile). Stroke color is secondary detail that communicates faction origin — machine-cold blue distinguishes Concord constructs from human-piloted scavenger ships at a glance. The drone core dot is also `CONCORD_BLUE`, reinforcing the machine identity. This is a deliberate exception: fill = relation, stroke = faction (Concord only).
- **`FACTION.concord`:** Added to the FACTION map in `colors.js` for station/UI badge use.

### 2026-03-08: Dynamic Relation Color System
- **Decision:** `ship.relation` is the single property that drives all hull color (fill, stroke, engine glow, engine trail). Colors are looked up from `RELATION_COLORS` in `colors.js` via getters on the `Ship` base class. No color is ever hardcoded in a ship class or subclass.
- **Designer:** Ships displayed in the designer always have `relation = 'none'` → white silhouette (no relation context in preview).
- **Dynamic flipping:** Changing `ship.relation` at any time (e.g., from `'enemy'` to `'neutral'` when a pirate stands down) instantly recolors the ship with no other changes needed.
- **Subclasses:** Enemy ships set `this.relation = 'enemy'` in their constructor. Player ship sets `this.relation = 'player'`. No ship class ever imports or references color constants directly.

### 2026-03-07: Weapon Projectile Colors
- **Decision:** Projectile color conveys **weapon type**, not ship relation. Autocannon rounds are amber (`#ffaa00`), laser bolts are cyan (`#00ffcc`). This is an exception to the color-by-relation rule — projectiles follow weapon-type coloring.
- **Rationale:** Kinetic weapons are the universal standard; their amber streaks should dominate the battlefield. Laser bolts in cyan immediately read as "something different/rare." Players can identify weapon types at a glance, which matters for threat assessment (lasers strip armor fast).

### 2026-03-07: Rocket/Missile Visual — Homeworld Style
- **Decision:** Rockets use a **pulsing amber circle** at the head + a **long amber position-history trail** — no particles. Same trail technique as ship engines (polyline that fades in alpha and width). The head pulses at ~18Hz: outer glow ring, inner bright ring (`#ffe0a0`), white core dot.
- **Rationale:** User preference. Evokes the Homeworld missile aesthetic — a bright propulsion ball leaving a smear across space. Visually distinct from cannon streaks and laser bolts. More dramatic and readable at range than a small triangle.

### 2026-03-07: Ship Shape Philosophy
- **Decision:** All ships should feel **blocky, industrial, and utilitarian** — built from rectangular hull modules, not sculpted from smooth curves. No aerodynamic shaping. No organic silhouettes. Think offshore oil platform or containerized cargo vessel, not fighter jet.
- **Core rule — no curves in hull outlines.** Ship silhouettes are built entirely from straight lines and hard corners. Curves are only permitted for engine glow/trail effects, not hull geometry.
- **Stepped H/I-beam profiles are preferred.** A ship that changes width via a hard step — narrow bow tower, wide mid-section, narrow stern block — reads immediately as a modular, assembled vessel. This is the Garrison-class model.
- **Player scrap ship (flagship):** Repurposed space tug — wide flat bumper at the nose (for pushing debris), narrow elongated body section, single large engine bay extending out on the starboard side. One big engine. Reads as an asymmetric working vessel, not a warship.
- **Brawler (gunship):** Stout, wide, flat-fronted box. Reads as a tank.
- **Garrison Class Frigate:** H/I-beam profile — narrow rectangular bow tower, wide rectangular mid-hull, narrow rectangular stern block. Twin rectangular nacelle pods on short pylons. Structural detail seams (cross-bracing, keel, bow ribs) reinforce the assembled-from-modules aesthetic.
- **Hauler:** Semi-truck: small cockpit pulling rectangular cargo containers that snake behind via position history.
- **Anti-patterns to avoid in ship design:**
  - No smooth tapered bows (pointed like a fighter)
  - No swept or angled wings
  - No curved hull outlines
  - No teardrop or organic silhouettes
  - Nacelles and engine pods should be rectangular or chamfered-rectangular, not pointed
- **Rationale:** Shape is the primary way to identify ship type. Industrial/blocky shapes reinforce the salvage-tech lore (these ships were built to work, not to look fast), contrast cleanly with the vector rendering style, and are immediately distinguishable in combat at a glance.

### 2026-03-08: Station Design — No More Hexagons
- **Decision:** Stations must not use hexagonal or other regular polygon forms. All stations are built from collections of rectangles of varying sizes, deliberately misaligned, to feel cobbled-together rather than manufactured. Asymmetry is required.
- **Key rules:** Structure WHITE at partial alpha. `accentColor` (AMBER=neutral, CYAN=friendly, RED=enemy) drives lights and labels. Dark near-black fills only. Docked ship silhouettes (boxy rectangular) at jetty tips add life. Harbor mouth with approach beacon + gradient beam for docking stations. Fuel tanks always AMBER (hazard marking).
- **Anti-patterns banned:** hexagons, radial symmetry, single closed polygon paths, solid hull fills, rounded corners.
- **Rationale:** This universe is broken and improvised. Stations should look like they grew over decades from salvage and desperation, not like they were engineered by a functioning civilization.

### 2026-03-10: HUD Redesign — Ship-Anchored UI
- **Decision:** Removed the left-side circular armor ring panel. Replaced with two-zone HUD: ship-anchored UI (weapons above ship, throttle/speed below ship on screen) and a fixed bottom strip (armor pips + hull bar, fuel bar, power readout, cargo bar, scrap count). Minimap moved from bottom-left to top-right.
- **Ship rendering:** All ships now use directional armor arc rendering when `relation === 'player'`. Hull fill color reflects overall hull health (green→yellow→orange→red). Hull outline is split into 4 arc-colored segments (front/starboard/aft/port) each reflecting that arc's armor health. Helpers `_playerHullFill()`, `_drawHullArcs()`, `_strokeArcCurrent()` on `Ship` base class. All 4 ship base classes updated.
- **Bottom strip:** Row 1 = ARMOR 4-pip bar (same width as hull bar, labeled F/P/S/A) + PWR text. Row 2 = HULL bar + FUEL bar (centered) + CARGO bar + SCRAP count. 32px edge margins for comfortable screen breathing room.
- **Rationale:** The old HUD required constant glancing to the top-left corner. Anchoring throttle and weapons near the ship keeps eyes on the action. The bottom strip consolidates critical secondary readouts in one sweep-readable band. Directional health on the ship itself makes hull/armor state immediately obvious in combat without consulting a panel.

### 2026-03-11: UI Overhaul — Panels Replace Overlays (CA/CB/CC)
- **Decision:** Three-part UI overhaul: (1) Station screen from full-screen overlay to 30% right-side DOM panel, (2) Ship screen from canvas overlay to 30% left-side DOM panel, (3) Bottom HUD strip from canvas to DOM fixed bar.
- **Station panel (CB):** `#location-overlay` positioned `right:0; width:30%; height:calc(100vh-48px)`. Camera centers on station. Zone sidebar stacks below SVG. Service buttons become horizontal tab row. World remains visible in the remaining 70%.
- **Ship panel (CA):** `#ship-panel` positioned `left:0; width:30%; height:calc(100vh-48px)`. DOM sections: header, 2-column stat grid, **MASS & THRUST** section, scrollable cargo (with modules). **Canvas module mount UI** renders installed module stat boxes to the right of the DOM panel, connected by cyan lines to hull mount points. Click canvas box to uninstall; select module in DOM cargo, then click empty canvas slot to install. Hover for expanded stats. `stopPropagation` on mouse events prevents canvas weapon fire. T/W percentage color-coded: green ≥100%, default ≥80%, amber ≥60%, red <60%.
- **Bottom HUD (CA):** `#hud-bottom` fixed 48px bar at bottom. Single row: ARMOR pips, HULL bar, FUEL bar, PWR readout, CARGO bar, SCRAP count. DOM elements updated each frame via `_updateBottomStrip()`.
- **Docked with ship screen:** Left 30% (ship) + right 30% (station) + middle 40% (world).
- **Station renderers (CC):** AshveilStation custom renderer (~200px colony ship hull, 10 rectangular sections, docked ships, running lights, approach beam). Kell's Stop unchanged (~120px). The Coil unchanged (~300px).
- **Rationale:** Full-screen overlays broke immersion. Side panels keep the world visible, reinforce spatial context while docked. DOM-based UI is more maintainable than canvas text rendering and supports proper hover/click interactions. Bottom HUD bar clears the center viewport for combat readability.

### 2026-03-14: Narrative Log Panel — Replaces Station UI (CM)
- **Decision:** Replaced `LocationOverlay` (tabbed service panels) with `NarrativePanel` — a Disco Elysium-style scrolling conversation log where every station interaction is a conversation.
- **Architecture:** `NarrativePanel` (`js/ui/narrativePanel.js`) orchestrates; `NarrativeLog` (`js/ui/narrativeLog.js`) renders entries/choices/barter; conversation scripts in `js/ui/narrative/conversations/` are async functions.
- **Entry types:** `narration` (flavor/title/system styles), `dialogue` (speaker + text with character color), `action` (player's chosen action, green italic), `result` (outcome in amber/green/red/cyan). All entries fade in with 200ms animation.
- **Zone navigation is narrative:** No tab buttons. Hub conversation presents zones as dialogue choices (`[Walk to the fuel bay]`). Zone dividers insert a cyan line + label but DO NOT clear the log — entire docking session is scrollable.
- **Barter screen:** Inline in the log as a special entry. Item rows with +/- quantity controls, confirm/cancel. Replaces serviceTrade/serviceRepair.
- **Authored conversations:** Kell's Stop (kellHub, kellDock, kellIntel, kellBounties, kellTrade, kellRelations) and Ashveil Anchorage (ashveilHub, ashveilDock, ashveilTrade, ashveilBounties, ashveilIntel, ashveilRelations). Generic fallbacks for unscripted stations.
- **Station NPCs:** Each zone has named NPCs with personality — Ansa (Kell's mechanic), Harlan (barkeep), Venn (Ashveil trader), Chief Maro (repair chief), Dara (fixer), Sable (archivist). Speaker colors match faction/personality.
- **Story flags:** `game.storyFlags = {}` enables first-visit narration, NPC memory, cross-station references. Session-only until save system ships.
- **Deleted:** `locationOverlay.js`, all 6 `station/service*.js` files, `css/location.css`. Created `css/narrative.css`.
- **Rationale:** Generic service panels made every station feel identical. Narrative conversations give each station a unique authored voice, support story progression, and create the Disco Elysium-style interaction depth the game targets.
