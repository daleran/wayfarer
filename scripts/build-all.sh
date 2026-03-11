#!/usr/bin/env bash
# Concatenates core project docs into all.md at the repo root.
# Run directly or via the pre-commit hook.

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
OUT="$REPO_ROOT/all.md"

FILES=(
  "CLAUDE.md"
  "DEVLOG.md"
  "IDEA.md"
  "LORE.md"
  "MECHANICS.md"
  "NEXT.md"
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

echo "Generated $OUT"
