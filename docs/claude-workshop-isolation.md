# Claude Workshop Isolation Playbook

This playbook keeps Claude work clearly separated from Cursor work.

## Scope

- Do not rename shared repositories.
- Do not change production repository names used by teams.
- Isolate Claude work by using a dedicated folder, branch prefix, and Vercel sandbox naming.

## Required Naming

- Local folder: `tony-claude-workshop`
- Branch pattern: `tony-claude/*`
- Vercel project: `tony-claude-sandbox-vercel`
- Vercel domain: `tony-claude-*.vercel.app`

## Copy/Paste Prompt For Claude

Use this exact prompt at the start of every Claude session:

Work only in my Claude sandbox context.
Repository/folder name must be `tony-claude-workshop`.
Only create branches using `tony-claude/*`.
Never create or push plain `claude/*` branches.
Only deploy to Vercel project `tony-claude-sandbox-vercel` and domains `tony-claude-*.vercel.app`.
Do not access or modify `PLANETMOTORS/Planet-Ultra` or `PLANETMOTORS/Website` unless I explicitly authorize it in this task.

## First-Time Sandbox Setup Commands

Run in a dedicated location (not inside Planet-Ultra):

1. `mkdir -p ~/projects/tony-claude-workshop`
2. `cd ~/projects/tony-claude-workshop`
3. `git clone https://github.com/PLANETMOTORS/Website .`
4. `git checkout -b tony-claude/bootstrap`
5. `git push -u origin tony-claude/bootstrap`

## Per-Task Branch Workflow

1. `git fetch origin`
2. `git checkout planetmotors-website`
3. `git pull origin planetmotors-website`
4. `git checkout -b tony-claude/<task-name>`
5. `git push -u origin tony-claude/<task-name>`

## Safety Gate (run before every push)

1. `git remote -v`
2. `git branch --show-current`

Expected:

- Remote should be the Claude sandbox target repository for the task.
- Branch must start with `tony-claude/`.

If either check fails: stop and fix context before pushing.
