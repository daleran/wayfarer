# Character — Create or Edit

Create a new character or edit an existing one. Characters are **people** (or roles) who inhabit ships. They have names, backstories, factions, and combat behavior. A character boards a specific named ship instance — not an abstract ship class.

**Design rule:** Every human NPC is a pre-authored individual with their own story and motivations. No procedurally generated bullet sponges. Only Concord machines are spawned generically.

## Step 1 — Identify scope

**Creating new?** Ask the user for:
- **Name** — the character's actual name, e.g. "Kael Dorn", "Dread Lord Thule"
- **Faction** — `'scavengers'`, `'concord'`, `'settlements'`, `'monastic'`, `'communes'`, `'zealots'`, `'casimir'`, or a child faction (`'kells-stop'`, `'ashveil'`, `'the-coil'`, `'grave-clan'`)
- **Behavior** — AI combat style: `stalker`, `kiter`, `standoff`, `lurker`, `flee`, `trader`, `militia`
- **Backstory** — who they are, what they want, how they earned their reputation
- **Ship** — which named ship they pilot (create with `/named-ship` if it doesn't exist yet)

**Editing existing?** Read the NPC file first. Ask what to change. Common edits:
- Update backstory / flavor text
- Change faction or behavior
- Rename the character
- Move them to a different ship

## Step 2 — Read reference files

- `engine/entities/character.js` — `Character` class, `boardShip()`/`leaveShip()`
- The character file where the character is currently defined (e.g. `data/locations/tyr/pale/orbital/characters/scavenger.js`)
- `engine/entities/registry.js` — `getCharacterRegistry()` (reads from `CONTENT.characters`), `createNPC()`
- `LORE.md` — faction descriptions and world tone

## Step 3 — Create or edit the character

Characters are defined in `data/locations/<system>/<body>/<node>/characters/*.js` (zone-specific) or `data/characters/player.js` (player) as standalone entries, separate from ship configs. Each character has a `shipId` field referencing a ship config in `CONTENT.ships`. Characters self-register at import time via `registerData(CHARACTERS, ...)` + `registerContent('characters', ...)`. New files under `data/locations/` are auto-discovered by `import.meta.glob` — no `data/index.js` edit needed.

```js
// In data/locations/<system>/<body>/<node>/characters/<filename>.js
import { CHARACTERS, registerContent, registerData } from '@data/dataRegistry.js';

registerData(CHARACTERS, {
  '<character-id>': {
    name: '<Display Name>',
    faction: '<faction>',
    behavior: '<stalker|kiter|standoff|lurker|flee|trader|militia>',
    shipId: '<ship-config-id>',
    flavorText: '<Backstory. Who they are, their reputation, what drives them.>',
  },
});

registerContent('characters', '<character-id>', CHARACTERS['<character-id>']);
```

**Note:** NPC `relation` is derived at runtime from faction reputation — do NOT hardcode `relation` in NPC character data. Only player characters set `relation: 'player'`.

For named NPCs with bounties:
```js
registerData(CHARACTERS, {
  '<character-id>': {
    name: '<Display Name>',
    faction: '<faction>',
    behavior: '<behavior>',
    shipId: '<ship-config-id>',
    flavorText: '<Backstory.>',
    bounty: { value: 100, reason: '<Bounty Title>' },
  },
});

registerContent('characters', '<character-id>', CHARACTERS['<character-id>']);
```

**Key fields:**
- `name` — the character's real name (e.g. "Gutshot Drev"), NOT a role title
- `flavorText` — the character's personal backstory (separate from `ship.flavorText` which describes the vehicle)
- `faction`/`relation`/`behavior` — synced onto the ship via `boardShip()`

**Concord exception:** Concord machines (drones, frigates) are unmanned — no Character instance. Set `faction`/`relation`/`ai` directly on the ship instead.

## Step 4 — Verify registry

`getCharacterRegistry()` in `engine/entities/registry.js` reads from `CONTENT.characters`. No manual registry editing needed — content self-registers at import time. Just verify the character entry exists in `data/locations/<system>/<body>/<node>/characters/*.js` or `data/characters/player.js`.

## Step 5 — Validate & verify

1. Run `npm run validate` — fix any errors
2. Tell the user to open:
   - `designer.html?category=characters&id=char-<ship-slug>` — verify name, faction, backstory
   - `designer.html?category=named-ships&id=<ship-slug>` — verify ship renders correctly
   - `editor.html?map=arena` — verify the character behaves correctly in game

## Step 6 — Update docs

- Characters with lore significance → `LORE.md`
- New faction member → `LORE.md` faction section
