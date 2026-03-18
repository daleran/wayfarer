# Lore — Create or Edit Lore & Factions

Create new lore content (history events, faction definitions) or edit existing entries. Handles both the data files and setting template synchronization.

## Step 1 — Identify scope

**Creating new?** Ask the user for:
- **Content type** — one of:
  - `faction` — a new faction (root or child)
  - `history` — a timeline event
  - `zone-history` — zone-specific history events
- **Details:**
  - **Faction:** name, ID (kebab-case), parent (if child faction), default reputation, relationships (hostile/allied with other factions)
  - **History:** date (year/month/day), text description, tags (era, location, faction)
  - **Zone history:** same as history but associated with a specific zone

**Editing existing?** Read the file first. Common edits:
- Rename a faction
- Change faction relationships
- Update history event text
- Reorder timeline
- Add/remove tags

## Step 2 — Read reference files

- `data/lore/factions/root.js` — 7 root faction definitions
- `data/lore/factions/children.js` — child faction definitions
- `data/lore/globalHistory.js` — global timeline events
- `data/factionHelpers.js` — helper functions (`getFaction()`, `getRootFaction()`, `areFactionsHostile()`, etc.)
- `data/dataRegistry.js` — `registerContent()` API
- `SPEC.md` (Setting section) — full worldbuilding reference (auto-generated from templates)

## Step 3 — Create or edit the data

### Root faction

Location: `data/lore/factions/root.js`

```js
registerContent('factions', '<faction-id>', {
  name: '<Display Name>',
  defaultReputation: 0,       // Starting reputation with player (-100 to 100)
  relationships: [
    { target: '<other-faction-id>', type: 'hostile' },  // or 'allied'
  ],
});
```

**Current root factions:** `settlements`, `scavengers`, `concord`, `monastic`, `communes`, `zealots`, `casimir`

### Child faction

Location: `data/lore/factions/children.js`

```js
registerContent('factions', '<child-id>', {
  name: '<Display Name>',
  parent: '<root-faction-id>',  // Inherits parent's reputation
  relationships: [],
});
```

**Current child factions:** `kells-stop`, `ashveil` (→ settlements), `the-coil`, `grave-clan` (→ scavengers)

### History event

Location: `data/lore/globalHistory.js` (global) or `data/lore/<zone>.js` (zone-specific)

```js
registerContent('history', '<event-id>', {
  date: { year: YYYY, month: MM, day: DD },
  text: '<Event description. One to three sentences.>',
  tags: ['<era>', '<location>', '<faction>'],
});
```

**Event ID convention:** `gl_<short_name>` for global, `<zone>_<short_name>` for zone-specific.

**Era tags:** `machine-mandate`, `quiet-collapse`, `concord-design`, `dream-divide`, `veiled-collapse`, `exodus`, `arrival-drift`, `afterlight`

**Chronological order:** Add events in date order within the file. Use section comments for eras.

## Step 4 — Update factionHelpers.js (if needed)

If adding a new root faction:
- `data/factionHelpers.js` — `getRootFactions()` auto-discovers from `CONTENT.factions` (no edit needed if the new faction has no `parent` field)

If adding faction relationships:
- Relationships are defined in the faction data, consumed by `areFactionsHostile()` and `areFactionsAllied()`
- Verify the relationship is bidirectional if needed (add to both factions)

## Step 5 — Update reputation system (if needed)

If the new faction should be reputation-tracked (root faction):
- `engine/systems/reputation.js` — auto-discovers root factions from `CONTENT.factions`
- No manual edit needed for new root factions

If adjusting default reputation:
- Change `defaultReputation` in the faction data
- This affects initial player standing

## Step 6 — Validate & verify

1. Run `npm run validate` — fix any errors
2. Run `node --experimental-vm-modules scripts/lint-data.js` — verify no broken references
3. Tell the user to check `editor.html?map=tyr`:
   - Press M for map — verify faction territories
   - Dock at a station — check faction standings display
   - Verify NPC relations reflect faction hostilities

## Step 7 — Update setting template

**MANDATORY:** Update `scripts/templates/setting.md` to reflect changes:
- New faction → add to faction section with description, territory, relationships
- New history event → add to timeline section in chronological order
- Changed relationships → update both factions' entries
- Renamed faction → search-and-replace throughout `scripts/templates/setting.md`

Read `SPEC.md` (Setting section) for current worldbuilding context, then edit `scripts/templates/setting.md` to maintain consistency with existing tone and structure.
