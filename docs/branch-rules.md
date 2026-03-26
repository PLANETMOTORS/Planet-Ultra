# Branch Rules

This file defines branch safety rules to prevent cross-project mistakes.

## 1) Planet-Ultra (this repository)

- Repository: `PLANETMOTORS/Planet-Ultra`
- Allowed working branch prefix: `cursor/*`
- Do not create or push `claude/*` or `tony-claude/*` branches in this repository.

## 2) Claude sandbox workspace (separate repository + folder)

- Local folder name must be: `tony-claude-workshop`
- Branch prefix must be: `tony-claude/*`
- Never use plain `claude/*`.

## 3) Required pre-push check

Run this before every push:

1. `git remote -v`
2. `git branch --show-current`

Do not push if:

- The remote is not the expected repository for your current task.
- The branch prefix does not match the rules above.
