#!/usr/bin/env bash
# Concatenates core project docs into all.md at the repo root.
# Run directly or via the pre-commit hook.

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
OUT="$REPO_ROOT/all.md"

FILES=(
  "CLAUDE.md"
  "DEVLOG.md"
  "PLAN.md"
  "LORE.md"
  "MECHANICS.md"
  "FIXES.md"
  "UX.md"
)

> "$OUT"

for FILE in "${FILES[@]}"; do
  PATH_TO="$REPO_ROOT/$FILE"
  if [ -f "$PATH_TO" ]; then
    echo "# === $FILE ===" >> "$OUT"
    echo "" >> "$OUT"
    cat "$PATH_TO" >> "$OUT"
    echo "" >> "$OUT"
    echo "" >> "$OUT"
  else
    echo "WARNING: $FILE not found, skipping." >&2
  fi
done

# Append CSV data files
echo "# === DATA (CSV) ===" >> "$OUT"
echo "" >> "$OUT"

for CSV in "$REPO_ROOT"/data/*.csv; do
  if [ -f "$CSV" ]; then
    BASENAME="$(basename "$CSV")"
    echo "## $BASENAME" >> "$OUT"
    echo "" >> "$OUT"
    echo '```csv' >> "$OUT"
    cat "$CSV" >> "$OUT"
    echo '```' >> "$OUT"
    echo "" >> "$OUT"
  fi
done

echo "Generated $OUT"
