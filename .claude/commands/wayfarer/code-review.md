# Code Review — Architecture & Quality Audit

Review the specified files (or recent changes) for code quality, architecture consistency, and convention adherence. Report findings grouped by severity. Do not automatically fix — report first, then ask which to address.

If the user specifies files or a scope, review only those. If no scope is given, review all uncommitted changes (`git diff` + `git diff --cached` + untracked files from `git status`).

## What to Check

### 1. Convention violations
- **Hardcoded stats** — any numeric stat not using the `BASE_X * MULT` pattern (see stat-audit)
- **Inline hex colors** — any `#xxx` string outside `src/rendering/colors.js`
- **Missing registry entries** — new ship/NPC/module/station without corresponding registry entry
- **Missing doc updates** — code changes mechanics/UI/lore but corresponding .md file not updated

### 2. Architecture issues
- **Wrong file location** — code placed in the wrong directory per project conventions
- **Circular dependencies** — module A imports B imports A
- **God objects** — functions or classes doing too much; should be delegated to subsystems
- **Dead code** — unused imports, unreachable branches, commented-out blocks
- **State ownership** — AI state not on `ship.ai.*`, inventory state not on `PlayerInventory`, etc.

### 3. Code quality
- **Duplicated logic** — same pattern repeated 3+ times without extraction
- **Magic numbers** — unexplained numeric literals in logic (not tuning constants)
- **Missing cleanup** — entities/listeners/timers created but never removed
- **Mutation hazards** — shared objects mutated without spreading (e.g. `AI_TEMPLATES.X` used directly instead of `{ ...AI_TEMPLATES.X }`)
- **Performance** — per-frame allocations, unnecessary iterations, missing early exits

### 4. Naming & readability
- **Inconsistent naming** — mixing camelCase and snake_case within the same scope; mismatched file name vs export name
- **Unclear intent** — variable or function names that don't convey purpose

## Report Format

Group findings by severity:

```
=== CODE REVIEW ===

[CRITICAL] — Must fix, will cause bugs or break conventions
  file.js:42 — description of issue
  file.js:88 — description of issue

[WARNING] — Should fix, convention drift or maintainability concern
  file.js:15 — description of issue

[NOTE] — Minor, optional improvement
  file.js:100 — description of issue

SUMMARY: X critical, Y warnings, Z notes
```

If no issues found, say so clearly.

## After Reporting

Ask: "Which issues would you like me to fix?" Then fix only the confirmed ones.
