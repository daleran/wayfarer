# Playtest — Targeted Test Checklist Generator

Analyze specific code changes and produce a targeted playtest checklist with exact steps, coordinates, expected behaviors, and edge cases.

## How to Use

Run this skill after completing a feature or fix. It analyzes what changed and generates a checklist tailored to the specific changes.

## Step 1 — Analyze changes

Read the recent changes:
```bash
git diff HEAD --name-only   # Changed files
git diff HEAD               # Actual changes
```

Categorize changes by type:
- **Ship/hull changes** → combat testing
- **Station changes** → docking/conversation testing
- **Conversation changes** → narrative flow testing
- **Module/weapon changes** → equipment testing
- **AI changes** → behavior testing
- **UI/HUD changes** → visual verification
- **System changes** → integration testing
- **Terrain changes** → visual/collision testing
- **Faction changes** → reputation/relation testing

## Step 2 — Generate checklist

For each change category, produce specific test steps:

### Ship/hull changes
- [ ] Open `designer.html?category=ship-classes&id=<slug>` — verify shape renders
- [ ] Open `designer.html?category=named-ships&id=<slug>` — verify modules and stats
- [ ] Open `editor.html?map=arena` — spawn the ship (Z/X/C keys)
- [ ] Engage in combat — verify HP, armor, speed, turn rate feel right
- [ ] Check mount points align with weapon fire positions
- [ ] Zoom in/out — verify silhouette readable at all scales

### Station changes
- [ ] Open `editor.html?map=arena` or `?map=tyr` — fly to station at (X, Y)
- [ ] Dock (E key) — verify docking radius works
- [ ] Check each conversation zone (hub → dock → trade → bounties → intel → relations)
- [ ] Undock — verify clean exit
- [ ] Open `designer.html?category=stations&id=<slug>` — verify renderer

### Conversation changes
- [ ] Dock at the relevant station
- [ ] Navigate to the changed conversation zone
- [ ] Test first-visit path (clear storyFlags or use fresh save)
- [ ] Test return-visit path
- [ ] Test all choice branches
- [ ] Test disabled choices (insufficient scrap, etc.)
- [ ] Test story flag gates (visit prerequisite locations first)
- [ ] Undock and re-dock — verify state persists

### Module/weapon changes
- [ ] Open `designer.html?category=modules&id=<id>` — verify stats panel
- [ ] Open `designer.html?category=weapons&id=<slug>` — verify firing animation
- [ ] Install on player ship via editor
- [ ] Fire weapon in combat — verify damage, range, projectile speed
- [ ] Check power budget — does the ship brownout?
- [ ] Test ammo consumption and reload (if applicable)

### AI behavior changes
- [ ] Open `editor.html?map=arena`
- [ ] Observe NPC behavior at spawn: patrol, orbit, trade route
- [ ] Approach to trigger aggro — verify aggro range
- [ ] Retreat to verify deaggro range
- [ ] For lurkers: verify they hide at cover points
- [ ] For traders: verify they follow trade routes between stations
- [ ] For militia: verify they orbit patrol centers
- [ ] Test NPC-vs-NPC hostility (approach rival faction groups)

### Terrain changes
- [ ] Open `editor.html?map=arena` or `?map=tyr`
- [ ] Fly to terrain location
- [ ] Zoom in/out — verify rendering at all scales
- [ ] Check terrain doesn't obscure gameplay entities
- [ ] For planets: verify parallax background effect

### Faction/reputation changes
- [ ] Dock at any station → check faction standings (relations zone)
- [ ] Kill a hostile NPC → verify reputation change
- [ ] Kill a neutral NPC → verify provocation and reputation penalty
- [ ] Check NPC relation colors (cyan friendly, red hostile, amber neutral)

## Step 3 — Edge cases

Always include these for any change:
- [ ] `npm run validate` passes
- [ ] No console errors in browser dev tools
- [ ] Page loads cleanly (no missing imports)
- [ ] Performance: no visible frame drops at standard zoom

### Content-specific edge cases
- Empty states (no scrap, no fuel, no cargo, no bounties)
- Maximum states (full cargo, full fuel, all armor)
- Rapid actions (spam-click choices, rapid dock/undock)
- Browser refresh during docked state

## Report Format

```
=== PLAYTEST CHECKLIST ===

Changes detected in: <list of changed files>

── Ship: <name> ───────────────────────────────────────────
- [ ] designer.html?category=named-ships&id=<slug>
- [ ] editor.html?map=arena — spawn at mouse with Z key
- [ ] Combat engagement — verify DPS and survivability
- [ ] ...

── Station: <name> ────────────────────────────────────────
- [ ] editor.html?map=tyr — fly to (X, Y)
- [ ] Dock → test each zone
- [ ] ...

── Edge Cases ─────────────────────────────────────────────
- [ ] npm run validate
- [ ] No console errors
- [ ] ...
```
