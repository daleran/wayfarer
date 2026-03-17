# Sync Skills — Validate Skill Files Against Codebase

Scan all skill files in `.claude/commands/wayfarer/*.md` and verify that every reference to the codebase is still valid. Skills go stale when registries change, files move, classes are renamed, or enum values are updated.

## What to Check

### 1. File path references

**Rule:** Every file path mentioned in a skill must exist on disk.

**How to check:**
- Extract all paths matching patterns like `data/...`, `engine/...`, `css/...`, `scripts/...`
- Verify each path exists using glob/file checks
- Flag paths that no longer exist with a suggested replacement (search for the filename in the codebase)

### 2. Class and function names

**Rule:** Every class, function, or export name referenced in a skill must exist in the file it claims to be in.

**How to check:**
- Extract references like `createNPC()`, `registerContent()`, `NarrativeLog`, etc.
- For each, verify the name is exported from the referenced file
- Flag mismatches (renamed, moved, or deleted)

### 3. Enum values

**Rule:** Enum values listed in skills (faction names, behavior types, entity types, mount sizes) must match `data/enums.js` and `data/lore/factions/`.

**How to check:**
- Extract quoted string values from skill files that look like enum values
- Cross-reference against:
  - `data/enums.js` — `ENTITY`, `RELATION`, `CONDITION`, `LOOT_TYPE`, `ARC`, `MOUNT_SIZE`, `MOUNT_SLOT`
  - `CONTENT.factions` — faction IDs
  - `AI_TEMPLATES` — behavior types
- Flag any stale values (e.g. `'scavenger'` should be `'scavengers'`, `'enemy'` should be `'hostile'`)

### 4. Registry format

**Rule:** Template code in skills must match current registration patterns.

**How to check:**
- Compare `registerContent()` call patterns in skills against actual usage in `data/` files
- Compare `registerData()` patterns
- Verify import paths use current aliases (`@/`, `@data/`)

### 5. Designer deep-link IDs

**Rule:** Designer deep-links (`designer.html?category=X&id=Y`) must use valid category and ID values.

**How to check:**
- Extract all designer URLs from skill files
- Read `engine/test/designer.js` to get current `CATEGORIES` array
- Verify each `category` param matches a category ID
- For `id` params, verify the ID exists in the corresponding `CONTENT.*` table

### 6. CLAUDE.md consistency

**Rule:** Skill descriptions in CLAUDE.md must match actual skill file content.

**How to check:**
- Read the skill table in CLAUDE.md
- Verify each listed skill has a corresponding `.md` file
- Verify each `.md` file is listed in the CLAUDE.md table
- Flag mismatches in scope descriptions

## How to Run

1. Glob all `.claude/commands/wayfarer/*.md` files
2. For each skill file:
   - Extract all file path references
   - Extract all class/function/export references
   - Extract all enum-like string values
   - Extract all designer URLs
3. Cross-reference against the codebase
4. Report findings

Use parallel agents for independent checks.

## Report Format

```
=== SKILL SYNC RESULTS ===

[Stale File Paths]
  /character.md:26 — 'data/locations/tyr/pale/orbital/characters/scavenger.js' — file not found
    Suggestion: 'data/locations/tyr/pale/orbital/characters/scavengers.js'

[Stale Names]
  /station.md:42 — 'LocationRegistry' — not exported from 'data/locations/locationRegistry.js'
    Note: file 'data/locations/locationRegistry.js' no longer exists

[Stale Enum Values]
  /character.md:11 — faction 'scavenger' — should be 'scavengers' (per CONTENT.factions)
  /named-ship.md:18 — faction 'scavenger' — should be 'scavengers'

[Registry Pattern Drift]
  /station.md:78 — registerContent() call uses old 3-arg pattern, current uses 3-arg (OK)

[Designer Links]
  /station.md:153 — category 'stations' — valid
  /module.md:235 — category 'modules' id 'flak-cannon' — not found in CONTENT.modules

[CLAUDE.md Drift]
  Skill '/terrain' exists as file but not listed in CLAUDE.md skill table
  CLAUDE.md lists '/location' but no file found

TOTAL: X stale paths, Y stale names, Z stale enums, W designer issues
```

## After Reporting

Ask the user: "Which stale references should I fix?" Then update only the confirmed files.

**When fixing:**
1. Update file paths to current locations
2. Update class/function names to current exports
3. Update enum values to current valid values
4. Update designer deep-links to current IDs
5. Update CLAUDE.md skill table
6. Run `npm run validate` after changes
