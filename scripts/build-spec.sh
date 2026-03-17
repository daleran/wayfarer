#!/usr/bin/env bash
# Builds SPEC.md from templates, Claude headless prompts, and extracted data.
# 7 stages: Vision → Setting → Mechanics → UX → Devlog → Plan → Data

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
OUT="$REPO_ROOT/SPEC.md"
SECONDS=0

echo "═══ build-spec: assembling $OUT ═══"
echo ""

# ── 1/7: Vision ──────────────────────────────────────────────────────────────
echo "[1/7] Vision (from template)..."
> "$OUT"
cat "$REPO_ROOT/scripts/templates/vision.md" >> "$OUT"
echo "" >> "$OUT"
echo "" >> "$OUT"
echo "[1/7] Done (${SECONDS}s elapsed)"
echo ""

# ── 2/7: Setting ─────────────────────────────────────────────────────────────
echo "[2/7] Setting (from template)..."
echo "# === SETTING ===" >> "$OUT"
echo "" >> "$OUT"
cat "$REPO_ROOT/scripts/templates/setting.md" >> "$OUT"
echo "" >> "$OUT"
echo "" >> "$OUT"
echo "[2/7] Done (${SECONDS}s elapsed)"
echo ""

# ── 3/7: Mechanics (Claude headless) ─────────────────────────────────────────
echo "[3/7] Generating mechanics documentation (sonnet, \$0.50 budget)..."
echo "      Reads engine/ and data/ directories to infer all game mechanics."
echo "      It typically takes 1–3 minutes."
echo "# === MECHANICS ===" >> "$OUT"
echo "" >> "$OUT"
claude -p "You are documenting the game mechanics of Wayfarer, a 2D top-down space game. Explore the engine/ and data/ directories to discover every gameplay system, then write a comprehensive behavioral mechanics document.

What to look for:
- Player controls: movement, throttle, rotation, combat mode toggles
- Weapons: how they fire, ammo types, projectile behaviors, weapon categories/families
- Damage model: armor arcs, hull integrity, how damage is applied and distributed
- Ship configuration: modules, mount points, engine thrust-to-weight, power budgets
- Economy: currencies, trading, fuel, cargo
- Stations: docking, services, conversations
- Bounties and reputation: how they are earned, tracked, and affect NPC behavior
- Salvage: derelict detection, salvage process, loot
- AI behaviors: combat styles, passive behaviors (traders, militia, patrols)
- Navigation: map system, waypoints, zones
- HUD and UI: what information is displayed and how
- Any other gameplay systems you discover

For each system use a ## heading. Describe HOW each system works from a player/designer perspective — behaviors, interactions, and flow. Do NOT list specific item names, stat values, tuning numbers, or implementation details like variable names. Write as if documenting game design for a designer who needs to understand how systems interact.

Start by listing the files in engine/ (recursively) and data/tuning.js and data/enums.js to discover what systems exist, then read the relevant files.

Output markdown only, no preamble." \
  --allowedTools "Read,Glob" --model sonnet >> "$OUT"
echo "" >> "$OUT"
echo "[3/7] Done (${SECONDS}s elapsed)"
echo ""

# ── 4/7: UX (template + Claude headless) ─────────────────────────────────────
echo "[4/7] UX documentation (template + sonnet, \$0.50 budget)..."
echo "      Template provides design philosophy; Claude infers visual style from source."
echo "# === UX ===" >> "$OUT"
echo "" >> "$OUT"
cat "$REPO_ROOT/scripts/templates/ux-philosophy.md" >> "$OUT"
echo "" >> "$OUT"
echo "## Visual Reference (Auto-Generated)" >> "$OUT"
echo "" >> "$OUT"
claude -p "You are documenting the visual style and UX implementation of Wayfarer, a 2D top-down space game with a vector-monitor / cassette-futurism aesthetic. Explore the source directories listed below to understand the game's visual language, then write a reference document.

Directories to explore:
- engine/rendering/ — color palette, drawing primitives, shape factories, visual effects
- engine/ui/ — DOM-based UI panels and overlays
- engine/hud/ — HUD sub-renderers (canvas)
- css/ — stylesheets, CSS custom properties, utility classes
- data/ — look for any rendering functions, terrain renderers, station renderers in location data

What to document:
1. **Color Palette** — one table of all named color constants with their hex values and a brief note on typical usage (e.g. 'cyan — primary UI, friendly indicators'). Include relation colors, faction colors, and condition colors in the same table or as sub-sections.
2. **Visual Aesthetic** — describe the overall look: what shapes are used (geometric, organic?), line styles, glow/transparency effects, how the cassette-futurism theme manifests in the rendering code. Reference specific patterns you find (e.g. Shape factories, DrawBatch usage, particle effects).
3. **Typography & CSS** — summarize the CSS custom properties, font choices, and utility classes. No need to list every class — describe the system and conventions.
4. **UI Layout** — describe how panels, HUD elements, and overlays are structured and positioned. DOM vs canvas split.
5. **World-Space Rendering** — how entities, terrain, planets, and stations are drawn. Common patterns in renderers.

Use ## headings for each section. Write descriptively — this should help a designer or developer understand the visual language without reading every file. The color table should be comprehensive; everything else should be a narrative summary, not exhaustive lists.

Start by listing files in each directory to discover what exists, then read the relevant ones.

Output markdown only, no preamble." \
  --allowedTools "Read,Glob" --model sonnet >> "$OUT"
echo "" >> "$OUT"
echo "[4/7] Done (${SECONDS}s elapsed)"
echo ""

# ── 5/7: DEVLOG ──────────────────────────────────────────────────────────────
echo "[5/7] Appending DEVLOG.md..."
echo "# === DEVLOG ===" >> "$OUT"
echo "" >> "$OUT"
if [ -f "$REPO_ROOT/DEVLOG.md" ]; then
  cat "$REPO_ROOT/DEVLOG.md" >> "$OUT"
else
  echo "WARNING: DEVLOG.md not found, skipping." >&2
fi
echo "" >> "$OUT"
echo "[5/7] Done (${SECONDS}s elapsed)"
echo ""

# ── 6/7: PLAN ────────────────────────────────────────────────────────────────
echo "[6/7] Appending PLAN.md..."
echo "# === PLAN ===" >> "$OUT"
echo "" >> "$OUT"
if [ -f "$REPO_ROOT/PLAN.md" ]; then
  cat "$REPO_ROOT/PLAN.md" >> "$OUT"
else
  echo "WARNING: PLAN.md not found, skipping." >&2
fi
echo "" >> "$OUT"
echo "[6/7] Done (${SECONDS}s elapsed)"
echo ""

# ── 7/7: Data Tables ─────────────────────────────────────────────────────────
echo "[7/7] Extracting game data from JS modules..."
echo "# === GAME DATA ===" >> "$OUT"
echo "" >> "$OUT"
node "$REPO_ROOT/scripts/extract-data.js" >> "$OUT"
echo "" >> "$OUT"
echo "[7/7] Done (${SECONDS}s elapsed)"
echo ""

echo "═══ build-spec: complete (${SECONDS}s total) ═══"
echo "Output: $OUT"
