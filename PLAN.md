# ESAP-RAG Frontend Redesign Plan

Full redesign of the ESAP-RAG frontend against the updated [DESIGN.md](./DESIGN.md). Notion-style minimalism, emerald accent, bilingual AR+EN co-equal, Radix primitives, dark mode retained.

## Scope Decisions (locked)

| Decision | Choice | Rationale |
|---|---|---|
| Primitive library | **Radix UI + custom visuals** | Headless a11y + RTL out of the box; bespoke styling matches DESIGN.md exactly |
| Bilingual | **Full AR + EN parity from Phase 0** | CLAUDE.md: "co-equal, not fallback" is non-negotiable |
| Dark mode | **Keep, add emerald dark variants** | Existing implementation preserved; dark tokens added to every primitive |
| Default language | **`Accept-Language` auto-detect** | AR for Arabic regions, EN otherwise; manual toggle always available |
| Locale routing | **Path-based (`/en/*`, `/ar/*`) via next-intl** | Clean SEO, `<html dir>` flips on route change, middleware handles `Accept-Language` redirect to locale prefix on first hit |
| Visual regression | **Playwright + pixelmatch in Phase 0** | 4-quadrant snapshots (light/dark × LTR/RTL) per surface, gate on every phase PR |
| Test infrastructure | **vitest + @testing-library/react + Playwright in Phase 0** | Per-phase test deliverables required; "well-tested code is non-negotiable" |

## Current State (inventory)

**Surfaces:** `app/page.tsx` (844 LOC marketing), `app/(app)/chat/page.tsx` (440), `app/(app)/documents/page.tsx` (265), `app/(app)/upload/page.tsx` (297), `app/(app)/layout.tsx` (16).
**Shared components:** `components/Sidebar.tsx` (247), `components/DocumentViewer.tsx` (356), `components/SourceCard.tsx` (72), `components/LatencyProvider.tsx` (39), `components/ThemeProvider.tsx` (44).
**Tokens:** `app/globals.css` (290 LOC) uses `--sand-*` (keep, warm scale), `--ember-*` (retire), `--ink-*` (migrate to warm), one emerald hint `#16a34a` on sidebar active.
**Gap:** No `components/ui/` primitives. All UI inline in pages.
**No i18n lib, no RTL wiring, no Arabic font loaded.**

## Phasing (one PR per phase, reviewed individually)

### Phase 0 — Foundations (no visual change)
**Pre-work (before PR):** grep `--ember-` across `app/`, `components/` to confirm retirement is safe; any hit gets mapped to `--warning-*` in this phase.

**Deliverables:**
- `app/globals.css`: add `--esap-emerald-{50..900}` scale, `--forest-*`, `--focus-emerald`. Alias `--lp-primary` → `--esap-emerald-700`. Retire `--ember-*` (migrate hits to semantic `--warning-*`).
- `next/font`: load `NotionInter` (or Inter with locl+lnum opentype feats) + `IBM Plex Sans Arabic`. Expose via CSS vars `--font-latin`, `--font-arabic`.
- **Locale routing (path-based):** restructure to `app/[locale]/...`. Add `middleware.ts` using `next-intl/middleware` — detects `Accept-Language` + cookie, redirects `/` → `/en` or `/ar`. Root layout reads `locale` from params, sets `<html lang={locale} dir={locale === 'ar' ? 'rtl' : 'ltr'}>`. Apply font family via CSS `:lang()` selectors.
- Install: `@radix-ui/react-*` (dialog, dropdown, toast, tabs, tooltip, toggle-group, slot), `next-intl`, `clsx`, `tailwind-variants`.
- **Test infra:** `vitest` + `@testing-library/react` + `@testing-library/jest-dom` + `jsdom`; `playwright` + `@playwright/test`; `pixelmatch` + `pngjs` for visual diffing. Wire `bun run test`, `bun run test:e2e`, `bun run test:visual`. Baseline snapshot dir `tests/visual/__snapshots__/{surface}-{theme}-{dir}.png`.
- **CI:** GitHub Action runs `bun run build`, `bun run test`, `bun run test:e2e`, `bun run test:visual` on every PR. Fails on any snapshot drift unless `UPDATE_SNAPSHOTS=1` label present.
- Set up `messages/en.json`, `messages/ar.json` with keyed strings. Namespace per route (`marketing`, `chat`, `documents`, `upload`, `shell`).
- Dark-theme emerald variants in DESIGN.md §6 (append).
- ESLint rule: forbid raw `--lp-*` in new code after Phase 1.

**Test deliverables:**
- Unit: `middleware.test.ts` — `Accept-Language: ar` → `/ar`, `en-US` → `/en`, cookie override wins.
- E2E: Playwright smoke on `/en` and `/ar` confirming `<html lang>` + `dir` flip.
- Visual: baseline snapshots for current `/`, `/chat`, `/documents`, `/upload` × light/dark × en/ar = 16 baselines. First Phase 0 PR sets them; later phases diff against them.

**Acceptance:** `bun run build` passes. `bun run test` green. `bun run test:visual` baseline established (no drift claim yet). `/en` serves LTR Inter, `/ar` serves RTL IBM Plex Sans Arabic. Layout containers unchanged (Phase 0 = infra only).

### Phase 1 — UI primitives (`components/ui/*`)
**Deliverables per DESIGN.md §4 + §12:**
- `Button` (primary emerald, secondary translucent, ghost) — Radix Slot
- `Card`, `CardHeader`, `CardBody` — whisper border, shadow stack
- `Input`, `Textarea`, `Select` — Radix Select
- `PillBadge`, `StatusPill` (Indexed/Processing/Failed/Draft) — animated pulse variant
- `CitationChip` — inline emerald pill with ring
- `LanguageToggle` — Radix ToggleGroup, "AR/EN" text-only
- `Dropzone` — react-dropzone + emerald active state
- `SourceViewer` — Radix Dialog slide-in, `inline-end` anchored
- `DocTypeIcon` — SVG glyph set (invoice/contract/PO/delivery-note/quote/form)
- `Nav`, `Sidebar`, `TopBar` — Radix Navigation Menu

**Preview route:** `app/[locale]/(dev)/primitives/page.tsx` — renders all primitives in both light+dark, both LTR+RTL (4 quadrants).

**Test deliverables:**
- Component tests (`tests/unit/ui/*.test.tsx`): one per primitive. Assert keyboard nav (Tab, Enter, Space, Esc, arrow keys on Select/ToggleGroup), focus visible, ARIA role, disabled state, RTL `dir="rtl"` logical-property mirror (`inline-start/end`).
- Visual regression: snapshot each primitive in the 4-quadrant preview route. 12 primitives × 4 quadrants = 48 snapshots. Baselined in this phase.

**Acceptance:** `bun run test` green with ≥80% line coverage on `components/ui/`. Preview route passes visual regression. Every primitive passes keyboard nav, focus visible, contrast AA+.

### Phase 2 — `/upload` (smallest surface, first real migration)
**Deliverables:**
- Rebuild `app/[locale]/(app)/upload/page.tsx` using primitives.
- Dropzone w/ bilingual placeholder, drag-active state, multi-file progress list.
- Empty/loading/error/success states per DESIGN.md (Pass 2 requirements).
- Copy keyed in `messages/{en,ar}.json` under `upload` namespace.
- Delete ember references on this surface.

**Test deliverables:**
- Unit: Dropzone accepts drag, rejects wrong MIME, emits progress events, announces via `aria-live`.
- E2E: upload 1 file → success toast; upload 3 files with 1 rejection → partial-success list; drag invalid file → error state.
- Visual: 4-quadrant snapshots (en/ar × light/dark) + empty + loading + error states.

**Acceptance:** Works in both languages, both themes, keyboard-only, screen reader announces upload progress. Visual diff gate passes against Phase 0 baseline on unchanged surfaces.

> **Reorder (post Phase 2):** Grok-inspired shell layout adopted in DESIGN.md §11 (see commit). Phase 5 (Shell) and Phase 4 (`/chat`) now run **before** Phase 3 (`/documents`), because the new sidebar/topbar/composer shapes what Documents renders inside. New execution order: **2 → 5 → 4 → 3 → 6 → 7**. Lane parallelization (§Worktree Parallelization Strategy) still applies after 5 lands.

### Phase 4 v2 — prompt-kit adoption (post-ship polish)

**Context:** Phase 4 shipped (commit `2bd09d2`) but empty state, composer, assistant messages, and streaming presence feel generic/flat. Adopt prompt-kit (ibelick) patterns as a visual/interaction reset. Decision confirmed: keep Radix + tailwind-variants primitive library; prompt-kit patterns get ported into `components/ui/*` + `chat/_components/*`, not added as a dependency. `/upload` stays as separate surface — composer paperclip remains nav link per DESIGN.md §11.

**Deltas over shipped Phase 4:**

- **Markdown rendering in assistant messages.** Adopt `react-markdown` + `remark-gfm` + `rehype-sanitize`. Table rendering is first-class (warm-neutral zebra rows, emerald header underline, RTL-mirrored). Inline code = warm-neutral bg + NotionInter Mono 14px, no copy button. Fenced code blocks: same minimal style, no language pill, no stock gray GitHub look. Links: `--esap-emerald-700`, underline-on-hover, no purple. Per-paragraph `dir="auto"` preserved through a custom renderer override.
- **Three-dot loader** (prompt-kit `Loader` pattern). Assistant slot appears within 100ms of send with animated three-dot loader in `--esap-emerald-500`. First streamed token replaces the loader. Wrap in `aria-live="polite"` announcing "Thinking…" / "يفكر…".
- **Stop button.** Send circle swaps to Stop (square icon, `--bg-surface-subtle` fill) while streaming. Click aborts SSE, keeps partial tokens, re-enables composer, announces "Generation stopped" via `aria-live`. Extends D5: RetryBanner handles both network-disconnect and user-stop; composer input preserved in both cases.
- **ScrollButton.** Ghost text button ("Jump to latest" / "انتقل إلى الأحدث") + down chevron, positioned `bottom: 80px; inline-end: 16px`, appears only when user is >120px above bottom of message list. Not a floating circle (slop rule #3 cousin).
- **PromptSuggestion chips (empty state).** 4 document-type-aware ghost pills under composer in empty state. Source: user's indexed doc inventory (`/api/documents` count by type). Fallback to generic set if library empty. Bilingual content authored in `messages/{en,ar}.json` under `chat.suggestions.*`. Not "Tell me a joke" generics. `role="button"`, arrow-key nav between chips, Enter activates + populates composer + focuses input.
- **ResponseStream presence.** Keep caret pulse on last assistant line during streaming (DESIGN.md §11). Combined with the loader→tokens→caret pulse→done sequence gives streaming a full arc instead of a single flat beat.
- **Empty→docked transition.** DESIGN.md §11 spec: empty state has composer vertically centered ~50% viewport, brand mark ~96px above. On first send, composer animates to bottom dock and message list fades in. Phase 4 shipped 150ms ease-out — **retune in v2 to 220–280ms cubic-bezier(0.22, 1, 0.36, 1)** (slight overshoot easing) for a "smooth" feel that earns the moment rather than snapping. Message list fade-in staggered +80ms after composer lands. Reduced-motion branch: instant swap preserved. E2E must assert: composer `translateY` transition completes, first assistant slot (three-dot loader) visible after animation ends, no layout shift during animation.

**prompt-kit-to-DESIGN.md token map** (reference for implementation):

| prompt-kit primitive | ESAP token / DESIGN.md ref |
|---|---|
| PromptInput bg | `--bg-surface`, whisper border, 16px radius, 56px min-h |
| PromptInput focus | `--focus-emerald` ring 2px |
| Send (idle) | `--text-tertiary` circle |
| Send (ready) | `--esap-emerald-700` solid circle |
| Stop | `--bg-surface-subtle` square icon |
| Message.user bg | `--bg-surface-subtle`, 12px radius |
| Message.assistant | transparent, 16px body, no bubble |
| Markdown.code inline | `--bg-surface-subtle`, NotionInter Mono 14px |
| Markdown.table | zebra warm-neutral rows, emerald header underline |
| Markdown.link | `--esap-emerald-700`, underline on hover |
| Loader (three-dot) | `--esap-emerald-500`, 1s cycle |
| Caret pulse | `--esap-emerald-500`, 0.8s cycle |
| ScrollButton | ghost text, `--text-secondary`, emerald on hover |
| PromptSuggestion | ghost pill, whisper border, `--text-primary`, emerald border hover |

**Assistant message hierarchy policy** (anti-slop guard rails):

- h2 allowed, h3 discouraged (answers rarely need that depth), h4+ banned (reads like a doc).
- Bold for key figures/identifiers only. No bold runs >4 words.
- Bulleted lists preferred over numbered unless order matters (line items).
- Tables: always when comparing ≥2 invoices/POs/quotes. Never for single values.
- Max one code-block per answer. If answer has >1 code block, reformat into a table or list.

**Test deliverables (additive to Phase 4):**

- Unit: markdown sanitizer rejects `<script>` + `javascript:` URLs; table renders with RTL mirror when locale=ar; three-dot loader announces via `aria-live`; stop button swap test (aria-label "Send" ↔ "Stop generating"); ScrollButton appears at 121px scroll-offset, disappears at 119px; PromptSuggestion click populates composer + focuses input.
- E2E: send question → loader appears within 100ms → first token replaces loader → caret pulse visible → user clicks stop → partial tokens retained + composer re-enabled. Click suggestion chip → composer populated + focused. Scroll up >120px → ScrollButton appears → click → scrolls to bottom smoothly.
- Visual: regenerate 4-quadrant baselines for empty (with suggestions), loading (three-dot), mid-stream (caret pulse), stopped (partial + retry banner), markdown-rich (table + inline code + link), scroll-button-visible.
- A11y: axe-core zero violations on populated chat with markdown answer containing table + code + link + citation chip.

**Acceptance:**
- All Phase 4 acceptance criteria still pass.
- New: prompt-kit-to-DESIGN.md token map implemented zero-exception — no raw hex, no prompt-kit default colors leaking through.
- New: markdown answer with table renders correctly in AR RTL (header cells right-aligned, zebra rows mirrored).
- New: stop → partial retained → retry flow works end-to-end without losing composer input.
- Visual baselines re-baselined with `UPDATE_SNAPSHOTS=1` label; one-time migration committed separately.

**Failure modes (additive):**

| Codepath | Realistic prod failure | Covered? |
|---|---|---|
| Markdown renderer | Malicious `<img onerror>` in streamed content | YES — rehype-sanitize |
| Markdown renderer | AR paragraph with LTR code block nested inside | partial — dir="auto" per block, verify in E2E |
| Stop button | User clicks stop twice rapidly | YES — debounced abort, idempotent |
| Stop button | Stop fires before any token → empty assistant bubble | YES — collapse bubble if zero tokens received |
| Suggestions load | `/api/documents` count endpoint times out | YES — fallback to generic set after 500ms |
| ScrollButton | Message list shorter than viewport | YES — hidden when `scrollHeight <= clientHeight` |

**Parallelization:** Phase 4 v2 is a single worktree — touches `chat/_components/*`, adds `lib/markdown/` helper, adds `messages/*.json` suggestion keys. No conflict with other lanes.

### Phase 3 — `/documents`

**Deliverables:**
- Rebuild `app/[locale]/(app)/documents/page.tsx` against DESIGN.md §11 `/documents` spec.
- New route: `app/[locale]/(app)/documents/[id]/page.tsx` — dedicated source viewer route (replaces slide-in panel model). Reads `?page=N` to deep-link from chat citations; reads `?back` to honor return-to-filtered-state on close.
- Toolbar component `documents/_components/Toolbar.tsx`: search input + chip rail + "More filters" Radix Popover + view toggle (Grid / Table) Radix ToggleGroup, persisted in `localStorage` under `documents.view`.
- Card grid using `Card` + `DocTypeIcon` + `StatusPill` primitives — anatomy per DESIGN.md (header row icon + status pill, 2-line title clamp, leading-ellipsis filename, top-bordered footer meta row, hover shadow lift, focus ring, no transform).
- Action menu on each card/row: Radix DropdownMenu — Open in new tab, Copy link, Re-index, Delete. Reachable without hover via keyboard.
- Table view alternative: zebra rows, sticky header, sortable columns (one active sort at a time via chevron indicator).
- Infinite scroll via IntersectionObserver sentinel: 24 items per page, sentinel triggers fetch within 600px of viewport. Append 6 skeleton cards / 4 skeleton rows during fetch. End-of-list "No more documents" caption. Inline retry on fetch error.
- Filter reducer in `documents/_state/filters.ts`: typed actions for `setSearch`, `toggleType`, `toggleStatus`, `setLanguage`, `setDateRange`, `setIssuer`, `setCurrency`, `setPageRange`, `clearAll`. Filter state mirrored to URL search params so filtered views are shareable and survive reload.
- Empty state (no docs ever): bilingual headline + subtitle + emerald CTA → `/upload`. No illustration.
- Empty state (filtered, zero matches): bilingual "No matches" headline + "Clear all filters" ghost button.
- Error state: top-of-grid inline banner (warm-neutral bg, whisper border) + retry ghost. No harsh red wash.
- Status pills carry partial state (Processing pulses; failed docs still openable to surface error detail rail).
- Bilingual copy keyed in `messages/{en,ar}.json` under `documents` namespace (toolbar labels, chip labels, popover labels, empty/error copy, action menu items, sr-only status text).
- Delete legacy `--ink-*` / `--sand-*` consumers on this surface (DocumentViewer migration handled in Phase 5; `/documents/[id]` route imports the Phase-5-cleaned viewer).

**Card anatomy spec** (implementation reference):
- Container: `Card` primitive, 12px radius, `--bg-surface`, whisper border, no shadow at rest.
- Header row: 32x32 `DocTypeIcon` (`inline-start`) · `StatusPill` (`inline-end`) · 12px padding-block-start, 12px padding-inline.
- Title: NotionInter 16px weight 600, line-height 1.4, 2-line `-webkit-line-clamp`, `dir="auto"`. Bilingual docs render AR over EN at parity weight per DESIGN.md §10.
- Filename: 14px `--text-secondary`, 1-line truncate with leading ellipsis preserving extension (custom CSS class `truncate-leading`).
- Footer meta row: 8px padding-block, top-bordered `--border-subtle`, 12px Caption Light — page count · document date (locale-formatted) · language chip (text-only "AR" / "EN" / "AR · EN").
- Hover: `--shadow-card`, 150ms ease-out. Focus: `--shadow-focus` ring on the card link wrapper. No `transform`.
- Action menu trigger (`⋯`): ghost icon button, focus-visible always, hover-visible on pointer devices.

**Filter bar spec:**
- Search input: 320px max-width on `≥1080px`, full-width on `<600px`. Debounce 200ms. Leading magnifier glyph. `dir="auto"`.
- Chip rail (always visible): Type (Radix DropdownMenu with checkbox items), Status (single-select: Indexed / Processing / Failed / Draft / Any), Language (AR / EN / Both / Any). Active chip = `--badge-emerald-bg` + `--badge-emerald-text`; inactive = ghost pill, whisper border. Click active chip → reset that axis.
- "More filters" Radix Popover: Date range (issued / indexed, two `Input type=date`), Issuer (Combobox sourced from indexed-doc issuer list), Currency (Select), Page-count range (dual `Input type=number`). Apply button writes results into chip rail (e.g., chip "Issued: Mar 2024 ×"), Clear button resets popover-only filters.
- All filter state ↔ URL search params (e.g., `?type=invoice&status=indexed&lang=ar`); deep-links restore exact filtered view.

**State matrix** (covered):

| State | Behaviour |
|---|---|
| Loading (initial) | 12 skeleton cards / 8 skeleton rows; toolbar visible but inert (search disabled). |
| Loading (more) | 6 skeleton cards / 4 skeleton rows appended below current set. |
| Empty (no docs) | Centered bilingual headline + subtitle + emerald CTA → `/upload`. |
| Empty (filtered) | Centered bilingual "No matches" + "Clear all filters" ghost. |
| Error (initial) | Top-of-grid banner + retry ghost button. Partial results from cache shown if available. |
| Error (paginated) | Inline "Couldn't load more. Retry" below last successful row. |
| Partial (mixed statuses) | Status pills carry the load — Processing pulses, Indexed calm, Failed muted; failed cards remain openable. |

**Keyboard grid navigation:**
- `/` focuses search input (global on `/documents`, with `aria-keyshortcuts="/"` hint in tooltip).
- Grid is a single tabstop. Inside the grid, arrow keys navigate as a 2D matrix:
  - Up/Down across rows; Left/Right within row (mirrored under RTL).
  - `Home` → first card; `End` → last card.
  - `PageUp`/`PageDown` → first/last visible row.
- `Enter` on focused card → navigates to `/documents/[id]`.
- `Space` on focused card → opens action menu (Radix DropdownMenu).
- Shift+Tab from inside the grid → returns focus to toolbar (search → chips → "More filters" → view toggle).
- Roving `tabindex` on cards (`-1` on non-focused, `0` on focused) per ARIA grid pattern.
- Table view: same `/` shortcut; Up/Down moves rows, `Enter` opens, `Space` opens action menu, header cells respond to `Enter`/`Space` to toggle sort.

**Responsive breakpoints:**

| Viewport | Layout |
|---|---|
| `<600px` | 1-col grid; toolbar = search row 1 (full-width) + chip rail row 2 (horizontal-scroll, no wrap); table view hidden. Mobile cards keep header + title + status pill, footer meta row collapses to single line. |
| `600–1080px` | 2-col grid; chip rail wraps to 2 rows if needed; table view permitted, defaults to grid. |
| `1080–1440px` | 3-col grid; single-row toolbar; sidebar visible. |
| `>1440px` | 3-col grid centered in 1200px content max; outer margins absorb extra width (no 4-col — cards stay readable). |

**Accessibility landmarks:**
- `<main aria-labelledby="documents-heading">` wraps the surface; visually-hidden `<h1 id="documents-heading">{t('documents.title')}</h1>`.
- `<search role="search">` wraps search + chip rail + popover trigger.
- `<section aria-label={t('documents.gridLabel')}>` (or `tableLabel`) wraps results.
- Grid uses `role="grid"` with `aria-rowcount` / `aria-colcount`; cards = `role="gridcell"` containing the focusable link.
- Table uses semantic `<table>` with `<caption class="sr-only">` describing applied filters.
- Status pills include visually-hidden bilingual "Status: <state>" text.
- `aria-live="polite"` region announces "Loaded N more documents" on each pagination tick (suppressed under `prefers-reduced-motion` page mode? — keep on; SR users still benefit).
- Filter chips include `aria-pressed` toggles; the popover uses Radix `Popover` (already correct ARIA).

**Test deliverables:**
- Unit:
  - Title truncation at 47 chars (Arabic width-aware via measured ch units).
  - Status-pill animation class transitions (Processing pulse on, Indexed pulse off).
  - Filter reducer: each action maps to state correctly; URL serializer round-trips state ↔ search params (no lost axes, no spurious axes).
  - Card action menu: keyboard reachability without hover; Esc closes; arrow keys cycle items.
  - Infinite scroll: IntersectionObserver fires sentinel callback exactly once per intersection; suppressed during in-flight fetch (no dup pages).
  - Grid keyboard nav: arrow keys move focus per matrix model; RTL mirrors Left/Right; Home/End/PageUp/PageDown correct; `Enter` triggers navigation; `Space` opens menu.
  - Empty-filtered "Clear all filters" resets reducer + URL.
- E2E:
  - Empty (no docs) → click CTA → `/upload` → back → upload one → poll until Processing pill appears → poll until Indexed pill appears → click card → `/documents/[id]` opens with metadata rail visible.
  - Filter chip interaction: select Type=Invoice → grid filters → URL updates → reload → state restored → click "Clear all" → grid restores.
  - "More filters" popover: set date range → Apply → chip "Issued: Mar 2024 ×" appears → click chip → axis cleared.
  - Infinite scroll: seed 60 docs → scroll to bottom → 24 → 48 → 60 → "No more documents" caption.
  - Grid view ↔ Table view toggle persists across reload via `localStorage`.
  - Deep link `/documents/abc?page=3` lands on page 3 of source viewer; close → returns to `/documents` with previous filter state.
  - RTL: keyboard arrow Left/Right swap behaviour confirmed; toolbar mirrors; chip rail flows `inline-start` → `inline-end`.
- Visual: 4-quadrant snapshots (en/ar × light/dark) for: initial loading, empty (no docs), empty (filtered), 6-card populated grid, populated table, filter-active chip rail, "More filters" popover open, error banner.
- A11y: axe-core gate on populated grid + populated table. Verify `role="grid"` semantics, `aria-rowcount` accuracy, status-pill SR text present, search landmark wraps controls.

**Acceptance:**
- Status pills animate correctly; Processing pulse honors `prefers-reduced-motion`.
- Empty states are bilingual and never read "No items found".
- Filter state survives reload via URL params.
- Infinite scroll never double-fetches; "No more documents" appears exactly once.
- Grid view and table view toggle works keyboard-only and persists via `localStorage`.
- Click card → `/documents/[id]` route opens (NOT a slide-in panel) with shareable URL.
- All tests green; visual gate passes; axe-core zero violations on populated states.

### Phase 4 — `/chat` — **runs after Phase 5**
**Deliverables (per DESIGN.md §11 Grok-inspired `/chat`):**
- Message list with per-paragraph `dir="auto"`; user messages in warm bubbles (`--bg-surface-subtle`, 12px radius, `inline-end` aligned), assistant messages full-width no bubble.
- Inline `CitationChip` wired to open `SourceViewer` at cited page.
- **Composer** (shared empty + docked): 760px max-width, 56px min-height, 16px radius. Leading = attachment; trailing cluster = model picker ghost chip + mic + send (emerald solid circle on non-empty input, neutral when empty). Mirrored send icon in RTL.
- **Empty state**: composer vertically centered (~50% viewport), brand mark ~96px above; one-line ambient hint below. On first send, composer animates to bottom dock (150ms ease-out) and message list fades in. Reduced-motion: instant swap.
- Streaming state: subtle caret pulse on assistant message while tokens arrive.
- Copy/regenerate/feedback icons on hover per message.

**Test deliverables:**
- Unit: `dir="auto"` on mixed AR+EN paragraph, CitationChip click handler dispatches correct `(docId, page)`, composer min-height enforced, keyboard shortcut (Enter=send, Shift+Enter=newline).
- E2E: send question → stream tokens → caret pulse visible → answer with chip → click chip → SourceViewer opens at correct page with highlight.
- Eval: mark `app/api/chat/route.ts` interaction; if prompt/template changes ride along, add eval suite per CLAUDE.md prompt-change rules.
- Visual: 4-quadrant snapshots for empty, mid-stream, multi-turn with citations.

**Acceptance:** Mixed AR+EN message renders correctly. Citation chip click opens right pane w/ highlighted span. Works in dark mode. All tests green. Visual gate passes.

### Phase 5 — Shell (Sidebar, TopBar, layout) — **runs next, before Phase 4**
**Deliverables (per DESIGN.md §11 Grok-inspired reference):**
- Rebuild `components/Sidebar.tsx` using primitives: 260px default, collapsible to 56px rail (persist state in `localStorage`), mobile drawer preserved.
- Sidebar sections in order: brand row (logo + collapse chevron, RTL-mirrored), Primary nav (Search, Chat, Documents, Upload) with emerald trailing-edge dot for active, Projects section (collapsible + "New project" ghost), History section (collapsible, truncated titles, scrollable), Footer (user avatar + optional Upgrade card).
- `TopBar` (48px) with breadcrumb `inline-start`; `inline-end` cluster = Private toggle (reserved, hide if unshipped), `LanguageToggle`, theme toggle, user menu. Drop dead UI — do not ship buttons for features not yet built.
- Kill `--lp-*` tokens everywhere on the shell (marketing keeps its landing overrides until Phase 6).
- Update `components/DocumentViewer.tsx` + `components/SourceCard.tsx` to use primitives.

**Test deliverables:**
- Unit: LanguageToggle navigates to mirror route (`/en/chat` ↔ `/ar/chat`) preserving query string, Sidebar active state uses token (assert computed color equals `--esap-emerald-700`).
- E2E: toggle AR → full doc `dir` flips → sidebar mirrors → breadcrumb flips. Theme toggle persists across navigation.
- Visual: 3 viewports (320/768/1200) × 4 quadrants for shell.

**Acceptance:** Sidebar active state uses emerald token, zero `#16a34a` raw hex in tree (`grep` gate in CI). Shell works at 320px, 768px, 1200px. All tests green.

### Phase 6 — `/` marketing landing
**Deliverables:**
- Rebuild `app/[locale]/page.tsx` from scratch per DESIGN.md §11 Marketing section.
- Hero: emerald CTA "Try ESAP free" + ghost "See how it works", full-bleed background, one supporting sentence, bilingual headline.
- Trust bar: bilingual company logos.
- Feature sections alternating white / warm-white, one job each, document-intelligence demo section with static AR+EN chat screenshot.
- 2-3 intentional motions (entrance fade, scroll-linked, hover reveal). No decorative blobs.
- Footer with bilingual links.

**Test deliverables:**
- Unit: hero CTA link targets (`/en/chat` / `/ar/chat`), trust-bar render from content file, motion respects `prefers-reduced-motion`.
- E2E: hit `/` → middleware redirects to `/en` or `/ar` per `Accept-Language`; "See how it works" anchor scrolls to demo section.
- Visual: 4-quadrant snapshots for viewports 375/768/1200/1440.
- Lighthouse (CI): perf ≥90, a11y ≥95, best-practices ≥95.

**Acceptance:** Passes all AI Slop Blacklist checks in DESIGN.md §13. First viewport reads as one composition. Zero card grids in hero. All tests green. Lighthouse gates pass.

### Phase 7 — Cleanup + QA
**Deliverables:**
- Delete `--ember-*`, `--lp-*`, legacy `--ink-*` aliases, unused components.
- Audit every surface against DESIGN.md §13 AI Slop Blacklist.
- Run `/design-review` on each surface.
- Lighthouse a11y >= 95 on all 4 surfaces.
- Contrast audit: all text AA+, primary text AAA.
- QA both directions in both themes + screenshots.

**Test deliverables:**
- Full regression run: `bun run test && bun run test:e2e && bun run test:visual` across all 4 surfaces × 4 quadrants.
- Coverage gate: ≥80% lines on `components/` and `components/ui/`.
- A11y suite: axe-core integration via Playwright, zero violations gate.

**Acceptance:** Green light from `/review`, `/design-review`, Lighthouse, and full test suite. PR closes out the redesign.

## Interaction State Coverage (per DESIGN.md §4 + Plan-Design-Review Pass 2)

| Feature | Loading | Empty | Error | Success | Partial |
|---|---|---|---|---|---|
| Upload | progress bar per file | "Drop files or click to browse" | "Upload failed. Retry?" | toast + redirect | mixed success list |
| Documents grid | 6 skeleton cards | "No documents yet. Upload one to start asking." + CTA | "Couldn't load. Retry." | N/A | indexed + processing mix (status pills) |
| Chat | streaming caret pulse | "Ask about your documents" placeholder | "Couldn't get an answer. Retry?" | N/A | answer + citations still loading |
| Source viewer | page-skeleton | N/A (only opens with source) | "Couldn't load source page." | N/A | partial highlight if span approximate |

## Per-Surface Visual Hierarchy

| Surface | 1st (5sec) | 2nd (5sec) | 3rd (5sec) |
|---|---|---|---|
| `/` landing | Bilingual headline + emerald CTA | Trust bar | One demo screenshot |
| `/chat` | Active conversation + composer | Citation chips inline | Sidebar (collapsed on <1080) |
| `/documents` | Doc grid w/ status pills | Filter + search bar | Sidebar |
| `/upload` | Dropzone full-width | Progress list | Sidebar |
| `/documents/[id]` | Source viewer pane | Page nav + highlight | Metadata rail |

Each surface has one primary action visible above fold at every viewport. Secondary actions live in TopBar or on-hover. Tertiary (settings, profile) collapses into menu.

## User Journey (5-sec / 5-min / 5-year)

- **5-sec (visceral):** Land on `/` in AR, see emerald CTA + bilingual product name. Feels: enterprise, Arabic-native, trustworthy.
- **5-min (behavioral):** Upload first invoice, see status pill shift Processing → Indexed, ask a question in AR, get answer with citation chip linking to exact page. Feels: it works.
- **5-year (reflective):** Daily workspace for doc questions, muscle memory for sidebar, no visual fatigue thanks to warm neutrals + calm surface. Feels: part of the workflow.

## Storyboard (emotional arc, first-time user)

| Step | User does | User feels | Plan supports via |
|---|---|---|---|
| 1 | Lands on `/ar` from marketing link | "Is this Arabic-native or translated?" | Bilingual headline, IBM Plex Sans Arabic at parity weight, RTL immediately |
| 2 | Clicks "Try ESAP free" → `/ar/upload` | mild friction expected | Dropzone centered, one sentence, emerald CTA |
| 3 | Drops 3 invoice PDFs | "Will it accept my Arabic scans?" | Drag-active emerald state, bilingual placeholder, file-type icons surface AR filenames |
| 4 | Sees Processing → Indexed | curiosity + mild wait anxiety | Per-file status pill animates Processing pulse; indexed pill goes calm-green within seconds |
| 5 | Navigates to `/ar/chat`, asks in AR | "Does it understand dialect?" | Composer `dir="auto"`, AR placeholder, streaming caret confirms work |
| 5.5 | Waits for response | "Is it working?" | Three-dot loader appears in empty assistant slot within 100ms of send (Phase 4 v2); announces "يفكر…" via `aria-live` |
| 6 | Sees answer with citation chip | trust-building moment | CitationChip click opens SourceViewer at exact page, highlighted span; markdown table renders if answer compares multiple docs |
| 7 | SSE disconnect mid-answer (edge) | frustration if unhandled | Retry banner in message; composer preserves input (D5 decision) |
| 8 | Returns next day | calm familiarity | Theme + locale persist via cookie; sidebar + recent-docs visible |

**Mood rule:** every surface either sustains calm (docs, chat, shell) or earns delight (landing hero, indexed-confirmation toast). No anxious states beyond the 1.5s indexing window.

## Responsive (per viewport)

| Viewport | Layout shift |
|---|---|
| <600px | Sidebar → drawer, doc grid 1-col, chat composer full-width, hero stacked |
| 600–1080px | Sidebar collapsible, doc grid 2-col, chat full-width |
| 1080–1440px | Full sidebar, doc grid 3-col, chat + source viewer side-by-side |
| >1440px | Centered 1200px content max, extra margin |

All touch targets 44px min. Keyboard nav end-to-end. Screen reader landmarks on every surface.

## Accessibility Matrix (per surface)

| Surface | Landmarks | Keyboard | Screen reader | Focus order |
|---|---|---|---|---|
| Shell (all) | `<header>`, `<nav>` (sidebar + TopBar), `<main>`, `<aside>` (source pane), `<footer>` | Tab through TopBar → sidebar → main → aside. `Esc` closes mobile drawer. `/` focuses composer on `/chat`. | SR announces locale + theme on landmark change | logo → locale toggle → theme → nav → main |
| Mobile nav (<600px) | Slide-in drawer via Radix Dialog, hamburger top-left, `aria-expanded` on toggle, `role="dialog"` + `aria-modal="true"` when open, `Esc` + overlay-click close, focus trap inside | Tab cycles drawer only when open; first Tab lands on first nav item | SR announces "Navigation drawer, dialog" on open | hamburger → drawer nav items → close button |
| `/upload` | `<form>` wraps dropzone, `<output aria-live="polite">` for progress | Enter/Space on dropzone opens picker; Tab moves through file list | SR announces "Drop files here, or press Enter to browse" + progress % live | dropzone → browse link → file list |
| `/documents` | `<section aria-label="Documents">`, `<search>` for filter | Arrow keys navigate grid; Enter opens card; `/` focuses search | SR announces status pill ("Indexed", "Processing", "Failed") | search → filter chips → grid → pagination |
| `/chat` | `<section role="log" aria-live="polite" aria-atomic="false">` for messages; `<form>` around composer; three-dot loader wrapped in `aria-live="polite"` | Enter sends; Shift+Enter newline; Up arrow recalls last message; arrow keys between PromptSuggestion chips; Enter on ScrollButton jumps to latest | SR announces "Thinking…" on loader, streaming caret as "Generating response", final answer, "Generation stopped" on stop, "Jump to latest" on ScrollButton focus; CitationChip announces "Citation, document name, page N"; markdown table announces as `<table>` with header row | composer → PromptSuggestion chips (empty state only) → message actions (on focus) → citation chips → ScrollButton |
| `/documents/[id]` (source viewer) | `<aside aria-label="Source document">` | `Esc` closes pane; arrows page through document | SR announces "Source pane open, page N of M" | close → page nav → content |

Color contrast: body text 7:1 (AAA), secondary text 4.5:1 (AA), emerald on white 4.5:1 verified, emerald on dark verified in Phase 0. Dark mode re-validates same ratios.
`prefers-reduced-motion`: disables entrance fade, scroll-linked motion, caret pulse. Replace with instant-appear + static underline on active streaming.

## NOT in scope

- Backend/API work (this repo is frontend-only per CLAUDE.md).
- Auth/session UI (not in DESIGN.md, defer).
- Admin panel / settings pages (out of `/chat`, `/documents`, `/upload` scope).
- Onboarding flow (first-time experience defer to post-redesign).
- Notifications/toasts system beyond basic success/error.
- Animations/motion library (use CSS + Radix transitions only, no Framer Motion this sprint).

## What already exists (reuse)

- `components/ThemeProvider.tsx` — dark-theme toggle plumbing, keep as-is.
- `components/LatencyProvider.tsx` — keep for chat streaming.
- `app/globals.css` sand palette — keep (warm neutral scale per DESIGN.md §2).
- `app/api/chat/route.ts` — unchanged, consumed by new UI.
- Sidebar active green `#16a34a` — replace with token `--esap-emerald-700`.

## Unresolved decisions (will surface during phases)

- **D1:** Exact NotionInter license/source. Fallback: Inter with `"lnum"` + `"locl"` OpenType features enabled. Decide in Phase 0.
- **D2:** IBM Plex Sans Arabic vs Noto Sans Arabic — side-by-side visual test in Phase 1 primitives preview.
- **D3:** Numerals policy (Arabic-Indic vs Western) per context — decide in Phase 4 chat work.
- **D4:** Chat streaming protocol (SSE vs chunked) — depends on API route, resolve in Phase 4.

## Review chain (per-phase gate)

Each phase PR runs `/plan-eng-review` before merge. Phases 2, 3, 4, 6 additionally run `/plan-design-review` (UI-heavy). Phase 7 runs `/design-review` live-site audit. No big-bang merge.

## AI Slop Audit Checklist (per-phase PR sign-off)

Each PR (Phase 1-6) requires explicit sign-off against the relevant items from DESIGN.md §13. Phase 7 re-audits the full set.

| Item | Phase 1 primitives | Phase 2 upload | Phase 3 docs | Phase 4 chat | Phase 5 shell | Phase 6 landing |
|---|---|---|---|---|---|---|
| 1. No purple/indigo gradient backgrounds | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ |
| 2. No 3-column feature grid (icon+title+desc ×3) | N/A | N/A | ☐ grid density ok | N/A | N/A | ☐ |
| 3. No icons-in-colored-circles as decoration | ☐ | ☐ | ☐ DocTypeIcon earns | ☐ | ☐ | ☐ |
| 4. Not centered-everything | ☐ | ☐ dropzone OK | ☐ | ☐ | N/A | ☐ |
| 5. No uniform bubbly radius on every element | ☐ radius scale per §5 | ☐ | ☐ | ☐ | ☐ | ☐ |
| 6. No decorative blobs/floating circles | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ |
| 7. No emoji as design elements | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ |
| 8. No colored-left-border on cards | N/A | N/A | ☐ | N/A | N/A | ☐ |
| 9. No generic hero copy ("Unlock the power of...") | N/A | N/A | N/A | N/A | N/A | ☐ |
| 10. No cookie-cutter section rhythm | N/A | N/A | N/A | N/A | N/A | ☐ |
| First viewport one composition (not dashboard) | N/A | N/A | N/A | N/A | N/A | ☐ |
| Cards earn existence (not decorative) | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ |

## Failure Modes (per new codepath)

| Codepath | Realistic prod failure | Test covers? | Error handled? | User-visible? |
|---|---|---|---|---|
| `middleware.ts` locale redirect | `Accept-Language` absent or malformed → infinite redirect | YES (Phase 0 unit) | YES (default to `en`) | silent fallback — OK |
| `next-intl` message load | Missing key in `ar.json` | partial (unit) | YES (fallback to `en` key) | shows `en` string — acceptable |
| Radix Dialog (SourceViewer) | Portal target missing on SSR mount | YES (E2E) | YES (`Portal` default) | empty overlay — flagged |
| Upload dropzone | File rejected mid-drag, UI stuck in drag-active | YES (E2E Phase 2) | YES (cleanup on leave) | visible error toast |
| Chat stream | SSE disconnect mid-response | partial (Phase 4 E2E) | **GAP** — plan doesn't spec retry UI | **CRITICAL GAP** flagged |
| LanguageToggle | Route mirror fails (no `/ar/...` counterpart) | YES (Phase 5 unit) | YES (fallback to root) | fallback navigation |
| Visual regression CI | Pixel drift from font-rendering diff across OS | N/A | YES (`UPDATE_SNAPSHOTS=1` escape hatch) | CI red until reviewed |

**Critical gaps:** 1 — Chat SSE disconnect UX. Phase 4 must add retry banner + queue composer input.

## Worktree Parallelization Strategy

Sequential by default (each phase builds on previous). Parallel lanes possible after Phase 1:

| Lane | Phases | Shared modules | Blocks on |
|---|---|---|---|
| A (app surfaces) | 2 → 3 → 4 | `app/[locale]/(app)/*`, `components/ui/*` | Phase 1 |
| B (shell) | 5 | `components/Sidebar.tsx`, `components/DocumentViewer.tsx` | Phase 1 |
| C (marketing) | 6 | `app/[locale]/page.tsx` | Phase 1 |

Lanes A and B share `components/ui/*` (read-only consumers) — no write conflicts. Lane C is isolated.

**Conflict flags:** Phase 4 chat + Phase 5 DocumentViewer both touch SourceViewer consumer sites. Sequence 4 → 5 or coordinate carefully.

**Recommended execution:** Phase 0 → 1 (serial). Then A (2→3→4) sequential in main worktree; B and C spin up as Claude Code `isolation: "worktree"` agents after Phase 1 merges. Merge B and C back before Phase 7 cleanup.

## NOT in scope (updated)

(additions — see original section for full list)

- LLM eval harness beyond chat route (only required if Phase 4 touches prompts).
- Storybook (preview route in Phase 1 serves the visual-catalog role).
- i18n admin / translation-management UI.
- Per-locale image variants.
- RTL-aware chart library (no charts in current surfaces).

## Unresolved decisions (post-eng-review)

| # | Decision | Owner | When |
|---|---|---|---|
| D1 | NotionInter license vs Inter+features | @riaz | Phase 0 |
| D2 | IBM Plex Sans Arabic vs Noto Sans Arabic | @riaz | Phase 1 primitives preview |
| D3 | Numerals policy (Arabic-Indic vs Western) | @riaz | **RESOLVED Phase 4 kickoff:** per-context split — Arabic-Indic (٠١٢٣) in AR message content, Western (0123) in UI chrome (timestamps, page refs, counts) |
| D4 | Chat streaming protocol (SSE vs chunked) | @riaz | **RESOLVED Phase 4 kickoff:** SSE — already implemented in `app/api/chat/route.ts` as forward-proxy |
| D5 | SSE disconnect retry UX copy | @riaz | **RESOLVED Phase 4 kickoff:** inline retry banner on assistant message ("Connection lost. Retry"), partial tokens retained, composer preserves last input |
| D6 | Numerals policy: per-context (AR content = Arabic-Indic, UI chrome = Western) or single consistent system | @riaz | Merged into D3 resolution above |
| D7 | Landing hero visual: full-bleed gradient, illustration (§4 "character illustrations"), or product-shot | @riaz | Phase 6 — run /design-shotgun before build |
| D8 | Empty-chat placeholder copy AR + EN | @riaz | **RESOLVED Phase 4 kickoff:** ambient/neutral — EN "Ask about your documents." / AR "اسأل عن مستنداتك." |
| D9 | Trust-bar logos: which companies, in AR brand-forms where available | @riaz | Phase 6 |
| D10 | PromptSuggestion chip copy — exact 4 strings per doc-type (invoice, contract, PO, quote) in EN + AR | @riaz | Phase 4 v2 implementation |
| D11 | ScrollButton visibility threshold (currently 120px) — tune after live testing | @riaz | Phase 4 v2 implementation |
| D12 | Three-dot loader appearance timing (currently 100ms) vs immediate — tune on real SSE latency | @riaz | Phase 4 v2 implementation |
| D13 | Empty→docked transition duration + easing — retune from shipped 150ms to 220–280ms cubic-bezier slight-overshoot; validate on device | @riaz | Phase 4 v2 implementation |

## Eng Review — Completion Summary

- Step 0 Scope Challenge: **scope accepted as-is** (redesign intent per CLAUDE.md); 7 clarifying decisions added to Scope Decisions table.
- Architecture Review: **5 issues** (A1 locale routing → resolved path-based; A2 RTL toggle → resolved via route nav; A3 phase ordering → keep Phase 6 last; A4 visual regression → Playwright+pixelmatch adopted; A5 ember audit → pre-work step added to Phase 0).
- Code Quality Review: **2 issues** (Q1 pill primitive consolidation → deferred as implementation detail; Q2 no tests → resolved via test-infra in Phase 0).
- Test Review: coverage diagram impossible pre-plan (zero existing infra); full test-infra deliverables added to Phase 0 + per-phase test sections; 1 critical gap flagged (Chat SSE disconnect UX, D5).
- Performance Review: **2 minor issues** (P1 font bundle audit in Phase 0, P2 message namespace splitting) — logged, non-blocking.
- Failure Modes: 7 codepaths mapped, 1 critical gap (Chat SSE disconnect).
- Parallelization: 3 lanes after Phase 1 (A app-surfaces, B shell, C marketing), 1 conflict flag noted.
- Lake Score: 4/4 real decisions chose complete option (path-based routing, visual regression on, test infra full, keep phase order).

## Design Plan Review — Completion Summary

| Pass | Initial | Final | Notes |
|---|---|---|---|
| 1. Information Architecture | 7/10 | 9/10 | Added per-surface visual hierarchy table |
| 2. Interaction States | 8/10 | 9/10 | Existing table strong; SSE disconnect added via D5 |
| 3. User Journey | 7/10 | 9/10 | Added 8-step storyboard with emotional arc |
| 4. AI Slop Risk | 6/10 | 9/10 | Added per-phase audit checklist against DESIGN.md §13 |
| 5. Design System | 9/10 | 9/10 | Already tightly bound to DESIGN.md |
| 6. Responsive + A11y | 7/10 | 10/10 | Added a11y matrix, mobile-nav locked to hamburger drawer |
| 7. Unresolved Decisions | 7/10 | 9/10 | Added D6–D9 (numerals, hero visual, empty-chat copy, trust-bar) |

**Overall: 7/10 → 9.1/10.**

Decisions made: 2 (AI slop audit = per-phase checklist; mobile nav = slide-in drawer).
Decisions deferred: 4 (D6 numerals, D7 hero visual, D8 empty-chat copy, D9 trust-bar logos) — all have phase owners.

## Backend Reference

- API docs: https://u758-aba7-ff5504c2.singapore-a.gpuhub.com:8443/docs

## GSTACK REVIEW REPORT

| Review | Trigger | Why | Runs | Status | Findings |
|--------|---------|-----|------|--------|----------|
| CEO Review | `/plan-ceo-review` | Scope & strategy | 0 | — | — |
| Codex Review | `/codex review` | Independent 2nd opinion | 0 | — | — |
| Eng Review | `/plan-eng-review` | Architecture & tests (required) | 1 | CLEAR (PLAN) | 7 issues, 1 critical gap (D5); path-based locale, visual regression + full test infra adopted |
| Design Review | `/plan-design-review` | UI/UX gaps | 3 | CLEAR (FULL) | Run 3 (prompt-kit adoption): score 5.8/10 → 9/10, 6 decisions locked (stop button, three-dot loader, doc-type suggestions, table-first markdown, react-markdown+sanitize, Phase 4 v2 addendum), 3 deferred (D10–D12) |
| DX Review | `/plan-devex-review` | Developer experience gaps | 0 | — | — |

**UNRESOLVED:** 12 decisions (D1–D12) logged with phase owners. D10–D12 are Phase 4 v2 implementation-time tuning knobs.
**VERDICT:** ENG + DESIGN CLEARED — Phase 0 unblocked; Phase 4 v2 rebuild plan ready. Recommend `/plan-eng-review` on Phase 4 v2 addendum before implementation (architecture for markdown renderer + stop-button abort flow + suggestion fetch). `/design-shotgun` still needed before Phase 6 for D7 hero visual. `/plan-ceo-review` optional.
