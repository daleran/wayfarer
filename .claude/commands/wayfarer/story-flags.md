# Story Flags — Narrative Flag Inventory

Scan all conversation scripts for `game.storyFlags` reads and writes. Find orphaned flags, missing flags, and map dependencies between conversations.

## What to Scan

### 1. Flag writes

Grep all conversation files for patterns:
- `game.storyFlags.XXX = `
- `game.storyFlags[XXX] = `
- `storyFlags.XXX = `

Record: flag name, file, line number, value assigned.

### 2. Flag reads

Grep all conversation files for patterns:
- `game.storyFlags?.XXX`
- `game.storyFlags.XXX` (without assignment)
- `storyFlags?.XXX`
- `storyFlags.XXX` (without assignment)

Record: flag name, file, line number, context (condition or value access).

### 3. Files to scan

- `data/conversations/*.js` — generic conversations
- `data/locations/**/conversations/*.js` — station-specific conversations
- `engine/**/*.js` — engine code that might read/write flags

## Analysis

### Orphaned reads
Flags that are checked but never set anywhere. The condition will always be false (or undefined).

### Dead writes
Flags that are set but never checked anywhere. The write has no effect on game state.

### Dependency map
Which conversations depend on flags set by other conversations? This shows the narrative flow:

```
kellDock writes: met_kell_mechanic
  → read by: kellDock (return visit greeting)

kellHub writes: visited_kells
  → read by: kellHub (return visit shortcut)

kellIntel writes: met_kell_barkeep
  → read by: kellIntel (return greeting)

kellIntel reads: visited_ashveil
  → written by: ashveilHub (first visit)
```

### Flag naming conventions
Check that all flags follow `snake_case` convention and use consistent prefixes:
- `visited_<location>` — player has docked at location
- `met_<npc>` — player has met an NPC
- `completed_<quest>` — quest completion
- `learned_<topic>` — lore unlocked

Flag any that deviate from convention.

## Report Format

```
=== STORY FLAG INVENTORY ===

── All Flags ──────────────────────────────────────────────
| Flag                  | Written By           | Read By              |
|-----------------------|----------------------|----------------------|
| visited_kells         | kellHub:17           | kellHub:13           |
| met_kell_mechanic     | kellDock:19          | kellDock:18          |
| met_kell_barkeep      | kellIntel:15         | kellIntel:14         |
| visited_ashveil       | ashveilHub:XX        | kellIntel:28         |

── Orphaned Reads (checked but never set) ─────────────────
  ⚠ game.storyFlags?.completed_mission — kellIntel:42 — never written

── Dead Writes (set but never checked) ────────────────────
  ⚠ game.storyFlags.talked_to_ghost = true — ghostConv:8 — never read

── Naming Violations ──────────────────────────────────────
  ⚠ game.storyFlags.kellVisited — should be 'visited_kells' (convention: visited_<location>)

── Dependency Graph ───────────────────────────────────────
  kellHub → visited_kells → kellHub (self-gating)
  ashveilHub → visited_ashveil → kellIntel (cross-station gate)

TOTAL: X flags, Y orphaned reads, Z dead writes, W naming violations
```

## After Reporting

Ask the user which issues to address:
- **Orphaned reads:** Either add the missing write, or remove the dead check
- **Dead writes:** Either add a corresponding read, or remove the unnecessary write
- **Naming violations:** Rename flags consistently (requires updating all reads and writes)
