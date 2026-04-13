# CLAUDE.md — ESAP-RAG

Guidance for Claude Code when working in this repo.

## Product

Arabic-native enterprise document intelligence RAG. Ingests bilingual AR+EN business documents (invoices, quotations, contracts, POs, delivery notes, approvals, forms, quantity surveys) and makes them queryable via chat. Two surfaces: marketing landing (`/`) + app workspace (`/chat`, `/documents`, `/upload`).

## Stack

Next.js 16 + React 19 + Tailwind v4 + TypeScript. App Router. No backend in this repo (frontend only — API routes under `app/api/`).

## Design System

**Always read `DESIGN.md` before making any visual or UI decision.** All font choices, colors, spacing, aesthetic direction, component primitives, and accessibility rules are defined there.

Hard rules:
- Do not deviate from `DESIGN.md` without explicit user approval. If a new case isn't covered, propose the extension and update `DESIGN.md` in the same PR.
- Flag any code that violates the AI Slop Blacklist in `DESIGN.md` during review.
- New UI must use the component primitives listed in `DESIGN.md` → Components section. If a primitive doesn't exist yet, build it in `components/ui/` before using it inline.
- Bilingual typography is co-equal, not fallback. Arabic renders at the same weight and size as Latin in mixed contexts.
- Migration from current tokens (sand/ember/`--lp-*`) is phased per `DESIGN.md` → Migration section. Do not big-bang.

## Skill routing

When the user's request matches an available skill, ALWAYS invoke it using the Skill tool as your FIRST action. Do NOT answer directly, do NOT use other tools first. The skill has specialized workflows that produce better results than ad-hoc answers.

Key routing rules:
- Product ideas, "is this worth building", brainstorming → invoke office-hours
- Bugs, errors, "why is this broken", 500 errors → invoke investigate
- Ship, deploy, push, create PR → invoke ship
- QA, test the site, find bugs → invoke qa
- Code review, check my diff → invoke review
- Update docs after shipping → invoke document-release
- Weekly retro → invoke retro
- Design system, brand → invoke design-consultation
- Visual audit, design polish → invoke design-review
- Architecture review → invoke plan-eng-review
- Save progress, checkpoint, resume → invoke checkpoint
- Code quality, health check → invoke health
