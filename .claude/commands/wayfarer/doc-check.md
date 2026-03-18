# Doc Check — Documentation Drift Detector

Compare recent code changes against documentation files to find likely gaps where docs should have been updated but weren't.

## What to Check

### 1. Setting template drift

**Triggers that require `scripts/templates/setting.md` update:**
- New station added to `CONTENT.locations`
- New faction added to `CONTENT.factions`
- New named character added to `CONTENT.characters`
- Station/faction/location renamed
- New zone or location tree node created
- New derelict with lore significance

**How to check:**
- Run `git diff HEAD~5 --name-only` (or compare against last documented state)
- Look for new/changed files in:
  - `data/locations/**/locations/*/station.js` — new stations
  - `data/lore/factions/*.js` — new factions
  - `data/locations/**/characters/*.js` — new named characters
  - `data/locations/**/derelicts/*.js` — new derelicts
- Cross-reference against `SPEC.md` (Setting section) content
- Flag entities present in code but missing from `scripts/templates/setting.md`

### 2. UX template drift

**Triggers that require `scripts/templates/ux-philosophy.md` update:**
- New color constant in `engine/rendering/colors.js`
- New CSS custom property in `css/panel.css`
- New UI component or panel
- Changed layout patterns
- New renderer visual patterns

**How to check:**
- Look for new/changed files in:
  - `engine/rendering/colors.js` — new color exports
  - `css/*.css` — new custom properties or component classes
  - `engine/ui/*.js` — new UI classes
  - `engine/hud/*.js` — HUD changes
- Cross-reference against `SPEC.md` (UX section) content

### 3. DEVLOG.md completeness

**Trigger:** Major features completed without DEVLOG entry.

**How to check:**
- Look at recent git commits for feature-sized changes
- Check if corresponding DEVLOG entries exist
- Flag features without entries

### 4. PLAN.md stale items

**Trigger:** Items in PLAN.md that have already been implemented.

**How to check:**
- For each PLAN.md item with a code (e.g. `AN`):
  - Check if a corresponding DEVLOG entry exists
  - Check if the feature is already implemented in code
- Flag items that should be moved to DEVLOG

### 5. FIXES.md stale items

**Trigger:** Fixes listed in FIXES.md that have already been applied.

**How to check:**
- For each FIXES.md item, check if the described issue still exists
- Flag items that appear to be resolved

### 6. CLAUDE.md accuracy

**Trigger:** Architecture changes not reflected in CLAUDE.md.

**How to check:**
- Verify file paths in CLAUDE.md exist
- Verify system descriptions match current code
- Check skill table matches actual `.claude/commands/wayfarer/*.md` files
- Verify dev harness descriptions match current entry points

## How to Run

1. Read `git diff` output (staged + unstaged) or specify a commit range
2. Categorize changed files by documentation trigger
3. Read each documentation file and check for coverage
4. Report gaps

Use parallel agents: one for setting template, one for UX template, one for DEVLOG/PLAN/FIXES, one for CLAUDE.md.

## Report Format

```
=== DOCUMENTATION DRIFT REPORT ===

[Setting Gaps]
  NEW: Station 'ironveil-outpost' added in data/locations/... but not in scripts/templates/setting.md
  RENAMED: Faction 'salvage_lords' → 'scavengers' but scripts/templates/setting.md still uses old name

[UX Gaps]
  NEW: Color 'PALE_HAZE' added to colors.js but not documented in scripts/templates/ux-philosophy.md
  NEW: CSS property '--p-module-bg' added to panel.css but not in scripts/templates/ux-philosophy.md

[DEVLOG.md Gaps]
  MISSING: Faction system refactor (2026-03-17) — no DEVLOG entry

[PLAN.md Stale]
  COMPLETED: AN. Thrust-to-weight system — already in DEVLOG as AN

[FIXES.md Stale]
  RESOLVED: "Fix HUD flicker on dock" — no longer reproducible

[CLAUDE.md Drift]
  STALE: '/location' skill listed but file doesn't exist
  MISSING: '/conversation' skill exists but not in CLAUDE.md skill table

TOTAL: X setting gaps, Y ux gaps, Z devlog gaps, W stale plan items, V claude.md issues
```

## After Reporting

Ask the user: "Which documentation gaps would you like me to fill?" Then update only the confirmed files.

**Priority order:**
1. CLAUDE.md — keeps the AI assistant accurate
2. `scripts/templates/setting.md` — prevents worldbuilding drift
3. `scripts/templates/ux-philosophy.md` — prevents visual inconsistency
4. DEVLOG.md — historical record
5. PLAN.md/FIXES.md — cleanup
