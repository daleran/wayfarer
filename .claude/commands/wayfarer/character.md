# Character — Create or Edit

Create a new character or edit an existing one. Characters are **people** (or roles) who inhabit ships. They have names, backstories, factions, and combat behavior. A character boards a specific named ship instance — not an abstract ship class.

**Design rule:** Every human NPC is a pre-authored individual with their own story and motivations. No procedurally generated bullet sponges. Only Concord machines are spawned generically.

## Step 1 — Identify scope

**Creating new?** Ask the user for:
- **Name** — the character's actual name, e.g. "Kael Dorn", "Dread Lord Thule"
- **Faction** — `'scavenger'`, `'concord'`, `'settlements'`, `'monastic'`, `'communes'`, `'zealots'`
- **Relation** — `'hostile'`, `'neutral'`, or `'player'`
- **Behavior** — AI combat style: `stalker`, `kiter`, `standoff`, `lurker`, `flee`, `trader`, `militia`
- **Backstory** — who they are, what they want, how they earned their reputation
- **Ship** — which named ship they pilot (create with `/named-ship` if it doesn't exist yet)

**Editing existing?** Read the NPC file first. Ask what to change. Common edits:
- Update backstory / flavor text
- Change faction or behavior
- Rename the character
- Move them to a different ship

## Step 2 — Read reference files

- `src/entities/character.js` — `Character` class, `boardShip()`/`leaveShip()`
- The NPC file where the character is currently defined (e.g. `data/actors/scavenger/lightFighter.js`)
- `src/entities/registry.js` — `CHARACTER_REGISTRY` entries (auto-generated from `CONTENT.actors`)
- `LORE.md` — faction descriptions and world tone

## Step 3 — Create or edit the character

Characters are defined inline in their actor file under `data/actors/<faction>/`. The `createActor()` factory reads the character data and creates a `Character` instance automatically. Content self-registers at import time via `registerContent()` from `data/dataRegistry.js`.

```js
// In data/actors/<faction>/<actorName>.js — character data is embedded in the actor entry
import { CONTENT, registerContent } from '@data/dataRegistry.js';

registerContent(CONTENT.actors, '<slug>', {
  label: '<Ship Name>',
  shipClass: '<hull-class>',
  // ... ship fields ...
  character: {
    id: '<character-id>',
    name: '<Display Name>',
    faction: '<faction>',
    relation: '<hostile|neutral|player>',
    behavior: '<stalker|kiter|standoff|lurker|flee|trader|militia>',
    flavorText: '<Backstory. Who they are, their reputation, what drives them.>',
  },
});
```

For named NPCs with bounties and backstories, add an entry to `data/actors/scavenger/characters.js`:
```js
registerContent(CONTENT.actors, '<character_id>', {
  name: '<Display Name>',
  faction: '<faction>',
  behavior: '<behavior>',
  bounty: { value: 100, reason: '<Bounty Title>' },
  flavorText: '<Backstory.>',
});
```

**Key fields:**
- `name` — the character's real name (e.g. "Gutshot Drev"), NOT a role title
- `flavorText` — the character's personal backstory (separate from `ship.flavorText` which describes the vehicle)
- `faction`/`relation`/`behavior` — synced onto the ship via `boardShip()`

**Concord exception:** Concord machines (drones, frigates) are unmanned — no Character instance. Set `faction`/`relation`/`ai` directly on the ship instead.

## Step 4 — Verify registry

`CHARACTER_REGISTRY` in `src/entities/registry.js` is auto-generated from `CONTENT.actors`. No manual registry editing needed — content self-registers at import time. Just verify the actor file exists under `data/actors/<faction>/`.

## Step 5 — Validate & verify

1. Run `npm run validate` — fix any errors
2. Tell the user to open:
   - `designer.html?category=characters&id=char-<ship-slug>` — verify name, faction, backstory
   - `designer.html?category=named-ships&id=<ship-slug>` — verify ship renders correctly
   - `editor.html?map=arena` — verify the character behaves correctly in game

## Step 6 — Update docs

- Characters with lore significance → `LORE.md`
- New faction member → `LORE.md` faction section
- New enemy archetype → `MECHANICS.md` (behavior only, not stats)
