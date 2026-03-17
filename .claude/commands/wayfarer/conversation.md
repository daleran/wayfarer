# Conversation — Create or Edit Narrative Scripts

Create a new conversation script or edit an existing one. Conversations are async functions powering the Disco Elysium-style narrative panel. Every station needs ~5 conversation files (hub, dock, trade, bounties, intel, relations).

## Step 1 — Identify scope

**Creating new?** Ask the user for:
- **Type** — one of:
  - `hub` — arrival narration + section selection loop (entry point for a station)
  - `dock` — fuel/repair services with NPC mechanic
  - `trade` — commodity buying/selling via barter UI
  - `bounties` — bounty board contract acceptance
  - `intel` — lore/info from an NPC, branching dialogue tree
  - `relations` — faction standings display
  - `standalone` — non-station conversation (e.g. origin selection, events)
- **Station** — which station this belongs to (for station conversations)
- **NPC(s)** — named characters the player talks to (name + color)
- **Tone** — gruff, formal, wary, friendly, etc.
- **Key content** — what information/services/choices does this conversation offer?

**Editing existing?** Read the file first. Common edits:
- Add/remove dialogue branches
- Update NPC personality or tone
- Add story flag gates
- Modify service logic (costs, options)

## Step 2 — Read reference files

### Always read:
- `engine/ui/narrativeLog.js` — `NarrativeLog` class: the full Log API
- `engine/ui/narrativePanel.js` — `NarrativePanel`: how conversations are launched, `ctx` shape
- `engine/rendering/colors.js` — color constants for NPC context colors
- `LORE.md` — world tone, faction descriptions
- `UX.md` — visual conventions

### For the specific conversation type:
- **Hub**: `data/locations/tyr/pale/orbital/locations/kells-stop/conversations/hub.js`
- **Dock**: `data/locations/tyr/pale/orbital/locations/kells-stop/conversations/dock.js` (authored) or `data/conversations/genericDock.js` (generic fallback)
- **Trade**: `data/locations/tyr/pale/orbital/locations/kells-stop/conversations/trade.js`
- **Bounties**: `data/locations/tyr/pale/orbital/locations/kells-stop/conversations/bounties.js`
- **Intel**: `data/locations/tyr/pale/orbital/locations/kells-stop/conversations/intel.js`
- **Relations**: `data/locations/tyr/pale/orbital/locations/kells-stop/conversations/relations.js`
- **Standalone**: `data/conversations/originSelection.js`

## Step 3 — Understand the API

### Context object (`ctx`)

Conversations receive a single `ctx` object with:
```js
{
  game,      // GameManager — access player, scrap, fuel, storyFlags, reputation, entities, etc.
  station,   // Station data object (null for standalone conversations)
  log,       // NarrativeLog instance — all display methods
  signal,    // AbortSignal — for cancellation
  sectionId,    // string — zone ID if launched via runSection() (dock, trade, etc.)
  runSection,   // async function(sectionId) — launch a sub-conversation by zone ID
}
```

### NarrativeLog methods

**Display methods:**
- `log.narrate(text, style)` — narration text. Styles: `'flavor'` (default, italic), `'system'` (amber, uppercase-ish)
- `log.dialogue(speaker, text, color)` — named speaker dialogue line
- `log.dln(text, npcId)` — dialogue shorthand using NPC context (preferred)
- `log.action(text)` — player action text (`> text`)
- `log.result(text, color)` — outcome text. Colors: `'green'`, `'red'`, `'amber'`, `'cyan'`
- `log.divider(label)` — section divider with label
- `log.narrateHTML(html, style)` — narration with inline HTML (for tooltips)
- `log.tooltip(text, definition)` — returns HTML string for use in `narrateHTML`

**Interactive methods (async):**
- `await log.choices(options)` — present choices, returns index. Options: `[{ text, disabled?, reason? }]`
- `await log.barter(config, game)` — trade UI. Returns `{ confirmed, quantities }`
- `await log.contd(prompt)` — "Continue..." link, returns when clicked

**Context management:**
- `log.setNpcContext({ id: { name, color } })` — register NPC(s) for `dln()` shorthand
- `log.clearNpcContext()` — clear all NPC context
- `log.clear()` — clear all log entries

### Seq prefix syntax

`log.seq(lines)` processes an array of strings with `prefix::text` format:
- `npcId::text` — dialogue from registered NPC (most common)
- `i::text` — narration (flavor)
- `s::text` — success result (green)
- `f::text` — failure result (red)
- `r::text` — neutral result (amber)
- `a::text` — action text
- `--::text` — divider
- No prefix — narration (flavor)

### Story flags

Session-only NPC memory via `game.storyFlags`:
```js
// Set a flag
if (game.storyFlags) game.storyFlags.visited_kells = true;

// Check a flag
if (!game.storyFlags?.visited_kells) { /* first visit */ }
```

Convention: `snake_case`, prefixed by context (e.g. `visited_kells`, `met_kell_mechanic`).

### Reputation helpers

```js
const isAllied = game.reputation?.isAllied(station.reputationFaction) ?? false;
const discount = isAllied ? (1 - REPUTATION.DISCOUNT_RATE) : 1;
```

## Step 4 — Create or edit the conversation

### File location

- **Station conversations**: `data/locations/<system>/<body>/<node>/locations/<station-slug>/conversations/<name>.js`
- **Generic fallbacks**: `data/conversations/<name>.js`
- **Standalone**: `data/conversations/<name>.js`

Content self-registers at import time via `registerContent()`. New files under `data/locations/` or `data/conversations/` are auto-discovered by `import.meta.glob` — no `data/index.js` edit needed.

### Hub conversation template

```js
// <stationId>Hub — arrival narration + section selection loop.

import { registerContent } from '@data/dataRegistry.js';

export async function <stationId>Hub(ctx) {
  const { game, log } = ctx;

  log.setNpcContext({
    <npcId>: { name: '<NPC Name>', color: '<color-from-colors.js>' },
  });

  // First visit narration
  if (!game.storyFlags?.visited_<station>) {
    log.seq([
      "Arrival description paragraph 1.",
      "Arrival description paragraph 2.",
    ]);
    if (game.storyFlags) game.storyFlags.visited_<station> = true;
  } else {
    log.narrate("Return visit flavor.", 'flavor');
  }

  log.dln("Greeting dialogue.", '<npcId>');

  // Hub loop
  while (true) {
    const options = [
      { text: '[Section option 1]' },
      { text: '[Section option 2]' },
      { text: '[Undock]' },
    ];

    const pick = await log.choices(options);

    switch (pick) {
      case 0:
        log.divider('SECTION LABEL');
        await ctx.runSection('sectionId');
        break;
      case 1:
        log.divider('SECTION LABEL');
        await ctx.runSection('sectionId');
        break;
      default:
        log.narrate("Departure flavor text.", 'flavor');
        return;
    }
  }
}

registerContent('conversations', '<stationId>Hub', <stationId>Hub);
```

### Dock/service conversation template

```js
import { REPUTATION } from '@data/index.js';
import { registerContent } from '@data/dataRegistry.js';

export async function <stationId>Dock(ctx) {
  const { game, station, log } = ctx;
  const player = game.player;
  const isAllied = game.reputation?.isAllied(station.reputationFaction) ?? false;
  const discount = isAllied ? (1 - REPUTATION.DISCOUNT_RATE) : 1;

  log.setNpcContext({
    <npcId>: { name: '<Name>', color: '<color>' },
  });

  log.narrate("Location description.", 'flavor');
  log.dln("NPC greeting.", '<npcId>');

  while (true) {
    const options = [];
    const actions = [];

    // Build dynamic options based on player state...
    // (check armor, hull, fuel, etc.)

    options.push({ text: '[Head back]' });
    actions.push({ type: 'back' });

    const pick = await log.choices(options);
    if (pick < 0) return;

    const action = actions[pick];
    switch (action.type) {
      // Handle each service...
      case 'back': return;
    }
  }
}

registerContent('conversations', '<stationId>Dock', <stationId>Dock);
```

### Intel/lore conversation template

```js
import { registerContent } from '@data/dataRegistry.js';

export async function <stationId>Intel(ctx) {
  const { game, log } = ctx;

  log.setNpcContext({
    <npcId>: { name: '<Name>', color: '<color>' },
  });

  log.narrate("Location description.", 'flavor');

  while (true) {
    const options = [
      { text: '[Ask about topic 1]' },
      { text: '[Ask about topic 2]' },
    ];

    // Conditionally add gated topics
    if (game.storyFlags?.some_flag) {
      options.push({ text: '[Ask about gated topic]' });
    }

    options.push({ text: '[Head back]' });

    const pick = await log.choices(options);

    switch (pick) {
      case 0:
        log.seq([
          "<npcId>::Dialogue line 1.",
          "<npcId>::Dialogue line 2.",
        ]);
        break;
      // ... more cases ...
      default:
        return;
    }
  }
}

registerContent('conversations', '<stationId>Intel', <stationId>Intel);
```

### Trade conversation template

```js
import { COMMODITIES, getBuyPrice, getSellPrice } from '@data/commodities.js';
import { registerContent } from '@data/dataRegistry.js';

export async function <stationId>Trade(ctx) {
  const { game, station, log } = ctx;

  log.setNpcContext({
    trader: { name: '<Name>', color: '<color>' },
  });

  log.narrate("Location description.", 'flavor');
  log.dln("NPC greeting.", 'trader');

  // Build buy/sell arrays from station.commodities
  const npcOffering = [];
  const playerOffering = [];

  for (const id of Object.keys(COMMODITIES)) {
    const supply = station.commodities?.[id] ?? 'none';
    const buyPrice = getBuyPrice(id, supply);
    const sellPrice = getSellPrice(id, supply);
    if (buyPrice !== null) {
      npcOffering.push({ id, name: COMMODITIES[id].name, unit: 1, price: buyPrice, currency: 'scrap' });
    }
    if (sellPrice !== null && (game.cargo[id] ?? 0) > 0) {
      playerOffering.push({ id, name: COMMODITIES[id].name, unit: 1, price: sellPrice, currency: 'scrap' });
    }
  }

  const result = await log.barter({
    title: `${station.name} — Trade Post`,
    npcOffering,
    playerOffering,
  }, game);

  // Process result.confirmed / result.quantities...
}

registerContent('conversations', '<stationId>Trade', <stationId>Trade);
```

### Relations conversation template

```js
import { getRootFactions, getFactionName } from '@data/factionHelpers.js';
import { registerContent } from '@data/dataRegistry.js';

export async function <stationId>Relations(ctx) {
  const { game, log } = ctx;

  log.narrate('Flavor text for checking standings.', 'flavor');

  for (const faction of getRootFactions()) {
    const label = getFactionName(faction);
    const standing = game.reputation.getStanding(faction);
    const level = game.reputation.getLevel(faction);
    const sign = standing >= 0 ? '+' : '';
    let color = 'amber';
    if (level === 'Hostile' || level === 'Wary') color = 'red';
    else if (level === 'Trusted' || level === 'Allied') color = 'green';
    log.result(`${label}: ${level} [${sign}${standing}]`, color);
  }
}

registerContent('conversations', '<stationId>Relations', <stationId>Relations);
```

## Step 5 — Wire into station

For station conversations, update the station data file to reference the conversation IDs:

```js
// In the station data file
conversations: {
  hub: '<stationId>Hub',
  sections: {
    dock: '<stationId>Dock',
    trade: '<stationId>Trade',
    bounties: '<stationId>Bounties',
    intel: '<stationId>Intel',
    relations: '<stationId>Relations',
  },
},
```

Section IDs in `conversations.sections` must match the `sectionId` strings used in the hub's `ctx.runSection()` calls, which must also match section `id` fields in `station.layout.sections[]`.

## Step 6 — Validate & verify

1. Run `npm run validate` — fix any errors
2. Tell the user to open `editor.html?map=arena` or `editor.html?map=tyr`, dock at the station, and test:
   - Hub loads on dock
   - Each section conversation runs correctly
   - Story flags gate content on second visit
   - Services work (costs deducted, stats updated)
   - Undock returns to gameplay

## Step 7 — Update docs

- New NPC characters → `LORE.md`
- New station zones → `LORE.md` station section
- New visual patterns (if any) → `UX.md`
