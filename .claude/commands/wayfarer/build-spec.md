# Build Spec — Spec Pipeline Validator

Pre-flight validation for `scripts/build-spec.sh`. Checks that `scripts/templates/` source files are consistent with the codebase before regenerating SPEC.md.

## What to Check

### 1. Template file existence

**Rule:** Every template referenced by `scripts/build-spec.sh` must exist.

**How to check:**
- Read `scripts/build-spec.sh`
- Extract all template file paths (typically in `scripts/templates/`)
- Verify each file exists on disk

### 2. Template → code consistency

For each template section, verify the content matches current codebase:

#### Vision template
- Project description matches current state
- No references to removed features

#### Setting template
- Faction names match `CONTENT.factions` keys and names
- Location names match `CONTENT.locations` entries
- History eras match `CONTENT.history` tags

#### Mechanics template
- Controls match current keybindings in `engine/input.js`
- System descriptions match current implementations
- No references to removed mechanics (crew, fleet, credits)

#### UX template
- Color names match `engine/rendering/colors.js` exports
- CSS properties match `css/panel.css` custom properties
- Component descriptions match current UI classes

#### Data template
- Equipment table columns match `data/*.js` field names
- Content type descriptions match `CONTENT.*` table shapes
- Registry function names match current exports

### 3. Auto-generated section sources

Some SPEC.md sections pull data directly from code. Verify the extraction still works:

- `scripts/extract-data.js` — runs without errors
- Output format hasn't changed in breaking ways

### 4. SPEC.md freshness

**Check:** Is `SPEC.md` older than any of its template sources?

```bash
# Compare modification times
stat -c %Y SPEC.md
stat -c %Y scripts/templates/*.md
```

If any template is newer than SPEC.md, flag that SPEC.md needs regeneration.

## How to Run

1. Read `scripts/build-spec.sh` to understand the pipeline
2. Read all files in `scripts/templates/`
3. Cross-reference template content against codebase
4. Run `scripts/extract-data.js` to verify data extraction
5. Report findings

## Report Format

```
=== BUILD-SPEC VALIDATION ===

[Template Files]
  ✓ scripts/templates/01-vision.md — exists
  ✓ scripts/templates/02-setting.md — exists
  ✗ scripts/templates/03-mechanics.md — MISSING

[Content Drift]
  scripts/templates/02-setting.md:15 — faction 'salvage_lords' not in CONTENT.factions
  scripts/templates/04-ux.md:42 — color 'SCAN_LINE' not in colors.js exports

[Data Extraction]
  ✓ scripts/extract-data.js — runs clean
  ⚠ scripts/extract-data.js — 2 warnings (see output)

[Freshness]
  ⚠ SPEC.md is older than scripts/templates/04-ux.md — regenerate with:
    bash scripts/build-spec.sh

TOTAL: X missing templates, Y content drift issues, Z extraction warnings
```

## After Reporting

If issues are found:
1. Fix template content to match codebase
2. Fix extraction script if needed
3. Regenerate: `bash scripts/build-spec.sh`
4. Verify the new SPEC.md looks correct
