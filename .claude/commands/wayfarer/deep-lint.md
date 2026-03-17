# Deep Lint — Extended Cross-Reference Validation

Run deep cross-reference checks that go beyond `scripts/lint-data.js`. The existing linter validates one level of references (ship→hull, char→ship, etc.). This skill checks multi-level consistency, orphaned content, and semantic correctness.

## What to Check

### 1. Faction ID validation

**Rule:** Every faction ID used in characters, stations, and ships must exist in `CONTENT.factions`.

**How to check:**
- Scan all `data/locations/**/characters/*.js` and `data/characters/player.js` for `faction:` fields
- Scan all `data/locations/**/locations/*/station.js` for `faction:` fields
- Scan all `data/locations/**/ships/*.js` and `data/ships/player/*.js` for `faction:` fields (unmanned ships)
- Verify each faction ID exists as a key in `CONTENT.factions`
- Check that child faction IDs (`kells-stop`, `ashveil`, `the-coil`, `grave-clan`) resolve to valid parents

**Valid root factions:** `settlements`, `scavengers`, `concord`, `monastic`, `communes`, `zealots`, `casimir`
**Valid child factions:** check `data/lore/factions/children.js` for current list

### 2. Station conversation section resolution

**Rule:** Every section ID referenced in a station's `conversations.sections` map must match a section `id` in that station's `layout.sections[]`.

**How to check:**
- For each station in `CONTENT.locations` (where `locationType === LOCATION_TYPE.STATION`):
  - Get `entity.conversations.sections` keys
  - Get `entity.layout.sections[].id` values
  - Flag any conversation section key that has no matching layout section
  - Flag any layout section that has no conversation section mapping (warning, not error — it falls back to genericDock)

### 3. Hub conversation section dispatch

**Rule:** Every `ctx.runSection('xxx')` call in a hub conversation must have a corresponding entry in the station's `conversations.sections` or `layout.sections`.

**How to check:**
- For each station, find its hub conversation file
- Grep for `ctx.runSection('` or `ctx.runSection("` calls
- Extract section IDs and verify they exist in the station's layout

### 4. Story flag consistency

**Rule:** Every story flag that is read should be written somewhere, and vice versa.

**How to check:**
- Scan all `data/conversations/*.js` and `data/locations/**/conversations/*.js` for:
  - **Reads**: `game.storyFlags?.xxx`, `game.storyFlags.xxx`, `storyFlags?.xxx`
  - **Writes**: `game.storyFlags.xxx = `, `storyFlags.xxx = `
- Build read/write maps
- Flag reads with no corresponding write (orphaned reads)
- Flag writes with no corresponding read (dead flags — warning only)

### 5. Commodity ID validation

**Rule:** Every commodity ID referenced in station `commodities` maps must exist in `COMMODITIES`.

**How to check:**
- For each station, get `entity.commodities` keys
- Verify each key exists in `COMMODITIES` from `data/commodities.js`

### 6. Bounty contract target validation

**Rule:** Every bounty contract's `targetCharacterId` and `targetShipType` must reference valid content.

**How to check:**
- Already partially covered by `lint-data.js`, but also verify:
  - `targetName` is not empty
  - `reward` is a positive number
  - Character's `shipId` chain resolves (character → ship → hull)

### 7. Module loadout validation

**Rule:** Ship module loadouts must fit the hull's mount points.

**How to check:**
- For each ship in `CONTENT.ships`:
  - Count modules in the `modules` array
  - Compare against the hull's `MOUNT_POINTS.length`
  - Flag if module count exceeds mount point count
  - Check mount size compatibility (if detectable from data)

### 8. Derelict lore completeness

**Rule:** Every derelict should have non-empty `lore` text.

**How to check:**
- For each derelict in `CONTENT.derelicts`:
  - Verify `lore` or `loreText` exists and is not empty

## How to Run

Use Vite SSR (same as `scripts/lint-data.js`) to load all content:

```bash
node --experimental-vm-modules scripts/lint-data.js  # Run existing lint first
```

Then perform additional checks by reading the source files and grepping for patterns. Use parallel agents for independent checks where possible.

## Report Format

```
=== DEEP LINT RESULTS ===

[Faction IDs]
  data/locations/.../characters/scavenger.js — faction 'scavenger' should be 'scavengers'

[Conversation Sections]
  kells-stop — section 'market' in conversations.sections but not in layout.sections

[Story Flags]
  ORPHAN READ: game.storyFlags?.completed_mission — never written
  DEAD WRITE: game.storyFlags.talked_to_ghost — never read

[Commodities]
  ashveil-anchorage — commodity 'rare-metals' not in COMMODITIES

[Bounty Targets]
  kells-stop bounty[0] — targetCharacterId 'ghost-rider' not in CONTENT.characters

[Module Loadouts]
  ship 'heavy-patrol' — 6 modules but hull 'garrison-frigate' has 5 mount points

[Derelict Lore]
  derelict 'empty-hull' — missing lore text

TOTAL: X errors, Y warnings
```

## After Reporting

Ask the user: "Which issues would you like me to fix?" Then fix only the confirmed ones.
