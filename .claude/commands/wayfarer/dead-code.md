# Dead Code Scan — Find & Eliminate Unused Code

Scan the codebase for dead code: unused exports, orphaned files, unreachable branches, and stale references. Report every finding, then ask which to remove.

## What to Scan

### 1. Unused exports

**The rule:** Every `export` from a JS file should be imported somewhere. Orphaned exports are dead weight.

**How to check:**
- For each `src/**/*.js` file, find all named exports (`export const`, `export class`, `export function`, `export default`, `export {`)
- For each export name, grep the rest of the codebase for imports of that name
- Exception: entry points (`src/main.js`, `src/editor-main.js`, `src/designer-main.js`) — these are consumed by HTML, not other JS files
- Exception: registry objects (`CONTENT`, `CHARACTERS`) — these are lookup tables consumed dynamically

**Report format:**
```
FILE: src/some/module.js
EXPORT: someFunction (line 42)
IMPORTED BY: (none)
```

### 2. Orphaned files

**The rule:** Every JS file under `src/` should be imported by at least one other file or referenced in HTML.

**How to check:**
- For each `src/**/*.js` file, check if any other file imports from its path
- Exception: entry points loaded by HTML (`src/main.js`, `src/editor-main.js`, `src/designer-main.js`)
- Exception: map files in `data/maps/` (loaded dynamically via URL param)

**Report format:**
```
ORPHAN: src/old/unusedHelper.js
  Not imported by any file
```

### 3. Unused imports

**The rule:** Every imported symbol should be referenced in the file that imports it.

**How to check:**
- For each `import { X, Y } from '...'` statement, verify X and Y appear elsewhere in the file
- For each `import Z from '...'` (default), verify Z appears elsewhere in the file

**Report format:**
```
FILE: src/some/module.js
LINE: 3
UNUSED IMPORT: AMBER from '../../rendering/colors.js'
```

### 4. Stale data references

**The rule:** Layout/data objects should not contain fields that nothing reads.

**How to check:**
- For station/location data objects, check if every field key is read by consumer code (e.g. `narrativePanel.js`, `game.js`)
- Common culprits: `svg`, `svgId`, `type` fields left over from refactors
- Check `layout` objects on stations for dead keys

**Report format:**
```
FILE: data/locations/the-coil/station.js
OBJECT: LAYOUT
FIELD: svg (line 55)
READ BY: (none)
```

### 5. Unreferenced CSS classes/IDs

**How to check:**
- For each class and ID in `css/**/*.css`, check if it's referenced in JS (`querySelector`, `className`, `classList`, `getElementById`) or HTML files
- Exception: classes generated dynamically (e.g. `loc-zone-${id}`)

**Report format:**
```
FILE: css/locationOverlay.css
SELECTOR: .zone-hotspot (line 42)
REFERENCED BY: (none)
```

## Scan Strategy

**Start with tooling, then do manual passes for what the tools can't catch.**

### Phase 0 — Automated tooling (run first, in parallel)

Run both commands and capture their output:

```bash
npm run lint 2>&1    # ESLint — catches unused vars, unused imports (no-unused-vars)
npm run check 2>&1   # TypeScript — catches unreachable code, implicit any on dead paths
```

Parse the output:
- **ESLint `no-unused-vars` warnings** → these are unused imports and dead local variables. Collect them all.
- **TypeScript errors** → look for unreachable code, unused labels, or type errors on dead paths.

These two tools handle the bulk of **unused imports** (section 3) and many **unused local variables** automatically. Do not manually grep for unused imports — let ESLint do it.

### Phase 1 — Unused exports (manual)

ESLint and TypeScript do **not** catch unused exports (an export is "used" from ESLint's perspective even if nothing imports it). This requires manual grepping — see section 1 above.

### Phase 2 — Orphaned files (manual)

Neither tool catches files that exist but are never imported. See section 2 above.

### Phase 3 — Stale data fields (manual)

Spot-check station/zone/layout data objects against their consumers. See section 4 above.

### Phase 4 — CSS (manual)

Scan stylesheets for unreferenced selectors. See section 5 above.

Use parallel agents for independent checks where possible.

## Audit Output Format

Group findings by category:

```
=== DEAD CODE SCAN RESULTS ===

[Unused Imports]
  src/foo.js:3 — AMBER from '../../rendering/colors.js'

[Unused Exports]
  src/bar.js:42 — export function helperFn()

[Orphaned Files]
  src/old/legacy.js — not imported anywhere

[Stale Data Fields]
  data/locations/the-coil/station.js — LAYOUT.svg never read

[Unreferenced CSS]
  css/station.css — .zone-hotspot never referenced

TOTAL: X unused imports, Y unused exports, Z orphaned files, W stale fields, V dead CSS
```

## After Reporting

Ask the user: "Which dead code would you like me to remove?" Then remove only what they confirm.

When removing:
1. Delete the dead import/export/field/file
2. If removing a file, check that no other file tries to import it
3. If removing an export that was the file's only export, the file itself may be orphaned — flag it
4. Run `npm run validate` (ESLint + TypeScript) after all removals to confirm nothing broke and no new warnings were introduced
