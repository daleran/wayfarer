# git:save — Commit and Push

Stage all changes, write good commit messages, and push to main.

## Step 1 — Understand what changed

Run these in parallel:
- `git status` — list all modified, deleted, and untracked files
- `git diff` — full diff of unstaged changes
- `git diff --cached` — full diff of already-staged changes
- `git log --oneline -5` — recent commits for style reference

Read the diffs carefully. Group the changes by concern — you'll write one commit per logical group if the changes are clearly separable, or a single commit if they form one coherent unit.

## Step 2 — Update DEVLOG.md and PLAN.md

Before committing, ensure documentation is current:

### DEVLOG.md
Read `DEVLOG.md`. If the changes include a major feature (new system, new module type, new mechanic — anything that would get a code in PLAN.md), check whether a DEVLOG entry already exists for it. If not, append one line per major feature in the format:

```
CODE. YYYY-MMM-DD-HHMM: Feature Name — one-line description of what shipped.
```

Use the current date/time. Use the feature's PLAN.md code if it has one. Minor fixes, refactors, and tweaks do NOT get DEVLOG entries.

### PLAN.md
Read `PLAN.md`. If any features being committed were listed in PLAN.md:
- Remove the completed feature's section from the plan body
- Remove its row from the Code Index table
- Do NOT change the "Next available code" — that only increments when a new idea is added

Also check: if PLAN.md references features that are clearly already implemented (present in codebase, have DEVLOG entries), clean those up too.

## Step 3 — Write commit messages

Follow the project's DEVLOG format as a style guide but use conventional git commit format:

```
<type>(<scope>): <short summary>

<body if needed — what changed and why, not how>
```

Types: `feat`, `fix`, `refactor`, `docs`, `chore`

Rules:
- Summary line ≤ 72 characters
- Present tense ("add arena map", not "added arena map")
- Do NOT commit files that look like secrets (`.env`, credentials)
- Warn the user if anything suspicious is staged

## Step 4 — Stage and commit

Stage files by name (never `git add -A` or `git add .` blindly — review the list first).

If the changes split naturally into multiple logical commits, make them in sequence. If they form one unit, make one commit.

Use a HEREDOC for each commit message:

```bash
git commit -m "$(cat <<'EOF'
feat(maps): move tyr and arena to js/data/maps/

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
EOF
)"
```

## Step 5 — Push

```bash
git push origin main
```

If the push is rejected (non-fast-forward), stop and report to the user — do NOT force push without explicit instruction.

## Step 6 — Confirm

Run `git log --oneline -5` and report the resulting commits to the user.
