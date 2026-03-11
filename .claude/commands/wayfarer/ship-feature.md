# Ship Feature — Shipping Workflow

Use this skill when a feature is ready to ship. It covers: picking up the feature from NEXT.md, implementing it, updating docs, and recording it in DEVLOG.md.

Do NOT create a git commit unless the user explicitly asks.

## Step 1 — Identify the feature

Read `NEXT.md`. Find the feature in the "UP NEXT" section (coded items) or the minor fixes list (no code).

Confirm with the user which feature to implement if not already clear.

## Step 2 — Read the relevant code before touching anything

Before writing a single line of code:
- Read every file you intend to modify
- Read `js/data/tuning/shipTuning.js` (and sibling files: `weaponTuning.js`, `aiTuning.js`, `moduleTuning.js`) if the feature involves any numeric stats
- Read `js/ui/colors.js` if the feature involves any colors or UI
- Read `MECHANICS.md` to understand the current system you're extending

Do not propose changes based on assumptions. Understand existing patterns first.

## Step 3 — Implement the feature

Follow all project conventions:
- **Stats**: multiplier pattern only — `BASE_X * MULT * FACTOR`. Never hardcode raw numbers.
- **Colors**: always import from `js/ui/colors.js`. Never use inline hex strings anywhere.
- **New files**: add imports and registry entries wherever needed (ship registry, station registry, raider registry, designer.js as applicable)
- **Minimal scope**: only change what's needed. Don't refactor surrounding code, add extra error handling, or "improve" things you weren't asked to touch.

## Step 4 — Update NEXT.md

Remove the shipped feature from NEXT.md:
- If it was a coded item in "UP NEXT": delete the entire entry
- If it was a minor fix: delete the bullet point

## Step 5 — Update docs (conditional — only update what changed)

| What changed | Update this file |
|---|---|
| Mechanic added, removed, or changed | `MECHANICS.md` |
| UI component, color, layout, or visual convention changed | `UX.md` |
| Faction name, location name, lore, or world tone changed | `LORE.md` |

Do not update files that weren't affected. Do not add boilerplate or padding — keep entries tight.

## Step 6 — Append to DEVLOG.md

**Only for major features (coded items from NEXT.md).** Skip for minor fixes and tuning passes.

Format (strictly):
```
CODE. YYYY-MMM-DD-HHMM: Feature name (one-line description)
```

Example:
```
AN. 2026-Mar-10-1430: Power plant system (4 reactor types with fuel drain, overhaul timers, and HUD warnings)
```

Rules:
- `CODE` = the two-letter feature code from NEXT.md (e.g. `AN`, `AO`, `AP`)
- Date/time = current date and approximate time in `YYYY-MMM-DD-HHMM` format
- Description = one line, present-tense summary of what was built, not how
- Append at the end of DEVLOG.md — do not edit existing entries
- Major features only — do not log tuning passes, bug fixes, or minor tweaks

## Step 7 — Update arena map

If the feature involves a new entity, spawn point, or mechanic that needs in-game verification:
- Add the entity/spawn to `js/data/maps/arena.js`

## Step 8 — Done

Tell the user:
1. The feature is shipped and docs are updated
2. Which docs were updated (list them)
3. To open `editor.html?map=arena` to verify in-game, or `?designer` for visual verification (if applicable)
4. The DEVLOG entry that was appended (if applicable)
