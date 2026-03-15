#!/usr/bin/env bash
# Concatenates core project docs into all.md at the repo root.
# Run directly or via the pre-commit hook.

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
OUT="$REPO_ROOT/all.md"
SECONDS=0

FILES=(
  "CLAUDE.md"
  "DEVLOG.md"
  "PLAN.md"
  "LORE.md"
  "MECHANICS.md"
  "FIXES.md"
  "UX.md"
)

echo "═══ build-all: assembling $OUT ═══"
echo ""

# ── 1/3: Markdown docs ──
echo "[1/3] Concatenating markdown docs..."
> "$OUT"

for FILE in "${FILES[@]}"; do
  PATH_TO="$REPO_ROOT/$FILE"
  if [ -f "$PATH_TO" ]; then
    echo "  $FILE"
    echo "# === $FILE ===" >> "$OUT"
    echo "" >> "$OUT"
    cat "$PATH_TO" >> "$OUT"
    echo "" >> "$OUT"
    echo "" >> "$OUT"
  else
    echo "  WARNING: $FILE not found, skipping." >&2
  fi
done
echo "[1/3] Done (${SECONDS}s elapsed)"
echo ""

# ── 2/3: Game Data (from JS modules) ──
echo "[2/3] Extracting game data from JS modules..."
echo "# === GAME DATA ===" >> "$OUT"
echo "" >> "$OUT"
node "$REPO_ROOT/scripts/extract-data.js" >> "$OUT"
echo "" >> "$OUT"
echo "[2/3] Done (${SECONDS}s elapsed)"
echo ""

# ── 3/3: System Analysis (Claude headless) ──
echo "[3/3] Running Claude system analysis (sonnet, \$0.50 budget)..."
echo "      This step reads ~15 source files and generates summaries."
echo "      It typically takes 1–3 minutes."
echo "# === SYSTEM ANALYSIS ===" >> "$OUT"
echo "" >> "$OUT"
claude -p "Read the following source files and write a concise system-by-system summary of the Wayfarer codebase. For each system, output a ## heading and one paragraph describing what it does, its key responsibilities, and how it connects to other systems.

Systems to summarize:
- Core: src/game.js, src/loop.js, src/camera.js, src/input.js, src/renderer.js, src/hud.js
- Systems: src/systems/bountySystem.js, src/systems/collisionSystem.js, src/systems/interactionSystem.js, src/systems/navigationSystem.js, src/systems/particlePool.js, src/systems/playerInventory.js, src/systems/repairSystem.js, src/systems/reputation.js, src/systems/salvageSystem.js, src/systems/weaponSystem.js
- AI: src/ai/shipAI.js
- Entities: src/entities/ship.js, src/entities/entity.js, src/entities/character.js

Output markdown only, no preamble." \
  --allowedTools "Read" --model sonnet --max-budget-usd 0.50 >> "$OUT"
echo "" >> "$OUT"
echo "[3/3] Done (${SECONDS}s elapsed)"
echo ""

echo "═══ build-all: complete (${SECONDS}s total) ═══"
echo "Output: $OUT"
