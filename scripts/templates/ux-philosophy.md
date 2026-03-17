## Design Philosophy

### Core Aesthetic: Vector Monitor / Cassette Futurism

The entire game screen should feel like a **vector monitor mounted in a 1970s-80s spaceship cockpit**. Think original *Star Wars* (1977) targeting computers, *Alien* (1979) ship interfaces, *Battlezone* (1980), early Atari vector arcade cabinets, and the general cassette futurism aesthetic: high-tech as imagined before the personal computer revolution.

### Guiding Principles

1. **Neon lines on black.** The display is a dark CRT. All UI elements are drawn as bright vector lines, outlines, and text against near-black backgrounds. Minimal fills — prefer strokes, outlines, and wireframes over solid filled rectangles.

2. **Limited neon palette.** A small set of vivid, phosphor-style colors:
   - **Cyan/teal** — Primary UI color. Borders, labels, general readouts.
   - **Amber/gold** — Credits, prices, warnings. Warm instrument tone.
   - **Green** — Positive states: full health, docking prompts, player-owned ships.
   - **Red/orange** — Damage, enemies, hostile contacts, critical warnings.
   - **Blue** — Friendly/allied contacts.
   - **Magenta/violet** — Rare items, Concord-related, exotic/unusual.
   - **White** — Sparingly. Bright accents, highlighted text, crosshair.

3. **Monospace everything.** All text uses monospace fonts. No proportional fonts anywhere. Text should feel like terminal output or a dot-matrix printout.

4. **Scanline / CRT feel.** Subtle effects that suggest a phosphor display: faint scanline overlay, slight glow/bloom on bright elements, text and lines with a luminous haze.

5. **Angular, geometric shapes.** UI panels use sharp corners or 45-degree chamfered/clipped corners — not rounded. Think military HUD brackets, targeting reticles, and technical schematics.

6. **No photorealism.** Everything is abstracted. Ships are wireframe or flat-polygon silhouettes. Planets are simple circles with minimal gradient. The beauty is in the clean geometry and color.

7. **Minimal fills, maximum line work.** Backgrounds transparent or near-black. Bars can use dim fills, but emphasis is on the bright outline and colored fill portion. Buttons are outlined, not filled solid.

### UI Element Patterns

- **Panels:** Chamfered corners or right angles with decorative bracket marks. No drop shadows, rounded corners, or gradients on borders.
- **Buttons:** Outlined rectangles with text centered inside. No solid fills when idle. Hover: accent color at ~15% opacity.
- **Health/Status Bars:** Very dark background track, bright color fill, 1px stroke outline. Segmented bar style preferred for digital/instrument feel.
- **Throttle Display:** Row of discrete pips/segments, active segment filled cyan, inactive dim outline only.
- **Crosshair:** Thin vector lines. Brackets style. White or cyan; shifts to red over enemies.

### CRT / Scanline Effect

1. **Scanlines:** Horizontal lines every 2-4px at very low opacity. Barely perceptible — felt more than seen.
2. **Vignette:** Slight darkening at screen edges. Simulates CRT curvature and phosphor falloff.
3. **Glow / Bloom:** Bright elements drawn twice — once sharp, once slightly larger at low opacity. Keep subtle; heavy bloom looks modern, not retro.
4. **Flicker:** Subliminal brightness variation (0–3% random dimming per frame).

### Typography

- **Font:** `'Fira Mono', monospace` for all canvas and DOM text.
- **All caps** for canvas world-space text. Mixed case only for DOM body text and descriptions.
- **Spacing:** Generous. Instruments are meant to be read at a glance in tense situations.

### Station Design Philosophy

Stations are **not** sleek, symmetric, corporate structures. This is a broken universe. Design principles:

1. **Built from rectangles, not polygons.** Each station is a collection of distinct rectangular hull plates and modules of different sizes.
2. **Asymmetric by design.** Left and right sides should differ. Should feel like it grew organically over time.
3. **Cobbled construction language.** Seam lines, overlapping patch panels, rivet-dots, inner-surface ribs.
4. **Relation color signals station attitude — not faction.** Structure is WHITE at partial alpha. Accent elements use `accentColor` driven by `station.relation`.
5. **Docked ships add life.** Small boxy ship silhouettes at jetty tips and inner piers.
6. **Animated docking lights at every pier tip.** Pulsing sinusoid, offset per pier.
7. **Approach beacon at the harbor mouth.** Two beacons, faint trapezoidal gradient beam.
8. **Label below the structure** in SUBTITLE style.

**Anti-patterns:** No hexagons, no radial symmetry, no single closed polygon paths, no solid hull fills, no rounded corners.

### Celestial Body Rendering

Planet and moon visuals follow the **CRT surface-scanner aesthetic** — line work only, no gradients, no filled areas. The look is a topographic instrument readout.

- **Ice/rocky worlds:** Topographic contour polygons clipped to the disk. 3–6 nested irregular polygon paths. Jagged straight-line segments.
- **Gas giants:** Horizontal band striations. Optional planetary rings as thin ellipses.
- **Habitable worlds:** Continental landmass contours with faint fills and coastline strokes.
- **Thick-atmosphere worlds:** Geometric cloud swirls — angular spiral or arc segments.

**Common rules:** Very faint body fill, all detail clipped to disk, thin atmosphere haze ring, bright limb outline, parallax at ~0.7× camera speed.

### Ship Shape Philosophy

All ships should feel **blocky, industrial, and utilitarian** — built from rectangular hull modules, not sculpted from smooth curves. No aerodynamic shaping. No organic silhouettes. Think offshore oil platform or containerized cargo vessel, not fighter jet.

- **No curves in hull outlines.** Silhouettes built entirely from straight lines and hard corners.
- **Stepped H/I-beam profiles preferred.** Modular, assembled vessels.
- **Anti-patterns:** No smooth tapered bows, no swept wings, no curved hull outlines, no teardrop or organic silhouettes.

