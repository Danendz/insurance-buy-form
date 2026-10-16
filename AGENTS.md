<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Project architecture

Before adding or moving code, read [docs/architecture.md](docs/architecture.md): layers and import rules, where new code goes, state/API and styling conventions, what earns a test.

## Git

Never commit or push to `main`. Before starting work on `main`, pull it and check out a new branch.

Never commit, push or open a pull request on your own. When work is ready, propose the action (commit message, branch, PR title) and wait for an explicit yes; an approval covers only the action it was given for.

## Comments

Write a comment only when something critical is not obvious from the code: a constraint, a workaround, a non-obvious reason.

- State the constraint, not the history or the case that led to it.
- No mockup or Figma node references, no notes about one-off data quirks unless the code would look wrong without them.
- No JSDoc that restates the name or the signature; document units and formats (`EUR`, `E.164`, `YYYY-MM-DD`) where the type can't.
- Prefer a better name over a comment.
