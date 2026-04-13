# ESAP-RAG Design System — Notion-inspired, Emerald Theme

> Arabic-native enterprise document intelligence RAG. Two surfaces: marketing landing (`/`) and workspace app (`/chat`, `/documents`, `/upload`). Visual language follows Notion's warm-neutral minimalism, recolored around an emerald accent. Bilingual (AR + EN) typography is co-equal, not fallback.

## 1. Visual Theme & Atmosphere

ESAP-RAG's surface embodies the product's job: get out of the way of the document. The design system is built on warm neutrals rather than cold grays, creating a distinctly approachable minimalism that feels like quality paper rather than sterile glass — fitting for a tool that reads invoices, contracts, and quotations all day. The design system is built on warm neutrals rather than cold grays, creating a distinctly approachable minimalism that feels like quality paper rather than sterile glass. The page canvas is pure white (`#ffffff`) but the text isn't pure black -- it's a warm near-black (`rgba(0,0,0,0.95)`) that softens the reading experience imperceptibly. The warm gray scale (`#f6f5f4`, `#31302e`, `#615d59`, `#a39e98`) carries subtle yellow-brown undertones, giving the interface a tactile, almost analog warmth.

The custom NotionInter font (a modified Inter) is the backbone of the system. At display sizes (64px), it uses aggressive negative letter-spacing (-2.125px), creating headlines that feel compressed and precise. The weight range is broader than typical systems: 400 for body, 500 for UI elements, 600 for semi-bold labels, and 700 for display headings. OpenType features `"lnum"` (lining numerals) and `"locl"` (localized forms) are enabled on larger text, adding typographic sophistication that rewards close reading.

What makes Notion's visual language distinctive is its border philosophy. Rather than heavy borders or shadows, Notion uses ultra-thin `1px solid rgba(0,0,0,0.1)` borders -- borders that exist as whispers, barely perceptible division lines that create structure without weight. The shadow system is equally restrained: multi-layer stacks with cumulative opacity never exceeding 0.05, creating depth that's felt rather than seen.

**Key Characteristics:**
- NotionInter (modified Inter) with negative letter-spacing at display sizes (-2.125px at 64px)
- Warm neutral palette: grays carry yellow-brown undertones (`#f6f5f4` warm white, `#31302e` warm dark)
- Near-black text via `rgba(0,0,0,0.95)` -- not pure black, creating micro-warmth
- Ultra-thin borders: `1px solid rgba(0,0,0,0.1)` throughout -- whisper-weight division
- Multi-layer shadow stacks with sub-0.05 opacity for barely-there depth
- ESAP Emerald (`#047857`) as the singular accent color for CTAs and interactive elements
- Pill badges (9999px radius) with tinted emerald backgrounds for status indicators (Indexed, Processing, Failed, Draft)
- 8px base spacing unit with an organic, non-rigid scale
- Bilingual co-equal typography: NotionInter for Latin, IBM Plex Sans Arabic for Arabic — same weight/size in mixed contexts
- Logical CSS properties (`inline-start`/`inline-end`, `margin-inline`) throughout — layout mirrors correctly for RTL

## 2. Color Palette & Roles

### Primary
- **Notion Black** (`rgba(0,0,0,0.95)` / `#000000f2`): Primary text, headings, body copy. The 95% opacity softens pure black without sacrificing readability.
- **Pure White** (`#ffffff`): Page background, card surfaces, button text on emerald.
- **ESAP Emerald** (`#047857`): Primary CTA, link color, interactive accent -- the only saturated color in the core UI chrome.

### Brand Secondary
- **Forest Green** (`#064e3b`): Secondary brand color, used sparingly for emphasis and dark feature sections.
- **Deep Emerald** (`#065f46`): Button active/pressed state -- darker variant of ESAP Emerald.

### Warm Neutral Scale
- **Warm White** (`#f6f5f4`): Background surface tint, section alternation, subtle card fill. The yellow undertone is key.
- **Warm Dark** (`#31302e`): Dark surface background, dark section text. Warmer than standard grays.
- **Warm Gray 500** (`#615d59`): Secondary text, descriptions, muted labels.
- **Warm Gray 300** (`#a39e98`): Placeholder text, disabled states, caption text.

### Semantic Accent Colors
- **Teal** (`#2a9d99`): Success states, positive indicators.
- **Green** (`#1aae39`): Confirmation, completion badges.
- **Orange** (`#dd5b00`): Warning states, attention indicators.
- **Pink** (`#ff64c8`): Decorative accent, feature highlights.
- **Purple** (`#391c57`): Premium features, deep accents.
- **Brown** (`#523410`): Earthy accent, warm feature sections.

### Interactive
- **Link Emerald** (`#047857`): Primary link color with underline-on-hover.
- **Link Light Emerald** (`#6ee7b7`): Lighter link variant for dark backgrounds.
- **Focus Emerald** (`#059669`): Focus ring on interactive elements.
- **Badge Emerald Bg** (`#ecfdf5`): Pill badge background, tinted emerald surface.
- **Badge Emerald Text** (`#059669`): Pill badge text, darker emerald for readability.

### Shadows & Depth
- **Card Shadow** (`rgba(0,0,0,0.04) 0px 4px 18px, rgba(0,0,0,0.027) 0px 2.025px 7.84688px, rgba(0,0,0,0.02) 0px 0.8px 2.925px, rgba(0,0,0,0.01) 0px 0.175px 1.04062px`): Multi-layer card elevation.
- **Deep Shadow** (`rgba(0,0,0,0.01) 0px 1px 3px, rgba(0,0,0,0.02) 0px 3px 7px, rgba(0,0,0,0.02) 0px 7px 15px, rgba(0,0,0,0.04) 0px 14px 28px, rgba(0,0,0,0.05) 0px 23px 52px`): Five-layer deep elevation for modals and featured content.
- **Whisper Border** (`1px solid rgba(0,0,0,0.1)`): Standard division border -- cards, dividers, sections.

## 3. Typography Rules

### Font Family
- **Primary**: `NotionInter`, with fallbacks: `Inter, -apple-system, system-ui, Segoe UI, Helvetica, Apple Color Emoji, Arial, Segoe UI Emoji, Segoe UI Symbol`
- **OpenType Features**: `"lnum"` (lining numerals) and `"locl"` (localized forms) enabled on display and heading text.

### Hierarchy

| Role | Font | Size | Weight | Line Height | Letter Spacing | Notes |
|------|------|------|--------|-------------|----------------|-------|
| Display Hero | NotionInter | 64px (4.00rem) | 700 | 1.00 (tight) | -2.125px | Maximum compression, billboard headlines |
| Display Secondary | NotionInter | 54px (3.38rem) | 700 | 1.04 (tight) | -1.875px | Secondary hero, feature headlines |
| Section Heading | NotionInter | 48px (3.00rem) | 700 | 1.00 (tight) | -1.5px | Feature section titles, with `"lnum"` |
| Sub-heading Large | NotionInter | 40px (2.50rem) | 700 | 1.50 | normal | Card headings, feature sub-sections |
| Sub-heading | NotionInter | 26px (1.63rem) | 700 | 1.23 (tight) | -0.625px | Section sub-titles, content headers |
| Card Title | NotionInter | 22px (1.38rem) | 700 | 1.27 (tight) | -0.25px | Feature cards, list titles |
| Body Large | NotionInter | 20px (1.25rem) | 600 | 1.40 | -0.125px | Introductions, feature descriptions |
| Body | NotionInter | 16px (1.00rem) | 400 | 1.50 | normal | Standard reading text |
| Body Medium | NotionInter | 16px (1.00rem) | 500 | 1.50 | normal | Navigation, emphasized UI text |
| Body Semibold | NotionInter | 16px (1.00rem) | 600 | 1.50 | normal | Strong labels, active states |
| Body Bold | NotionInter | 16px (1.00rem) | 700 | 1.50 | normal | Headlines at body size |
| Nav / Button | NotionInter | 15px (0.94rem) | 600 | 1.33 | normal | Navigation links, button text |
| Caption | NotionInter | 14px (0.88rem) | 500 | 1.43 | normal | Metadata, secondary labels |
| Caption Light | NotionInter | 14px (0.88rem) | 400 | 1.43 | normal | Body captions, descriptions |
| Badge | NotionInter | 12px (0.75rem) | 600 | 1.33 | 0.125px | Pill badges, tags, status labels |
| Micro Label | NotionInter | 12px (0.75rem) | 400 | 1.33 | 0.125px | Small metadata, timestamps |

### Principles
- **Compression at scale**: NotionInter at display sizes uses -2.125px letter-spacing at 64px, progressively relaxing to -0.625px at 26px and normal at 16px. The compression creates density at headlines while maintaining readability at body sizes.
- **Four-weight system**: 400 (body/reading), 500 (UI/interactive), 600 (emphasis/navigation), 700 (headings/display). The broader weight range compared to most systems allows nuanced hierarchy.
- **Warm scaling**: Line height tightens as size increases -- 1.50 at body (16px), 1.23-1.27 at sub-headings, 1.00-1.04 at display. This creates denser, more impactful headlines.
- **Badge micro-tracking**: The 12px badge text uses positive letter-spacing (0.125px) -- the only positive tracking in the system, creating wider, more legible small text.

## 4. Component Stylings

### Buttons

**Primary Emerald**
- Background: `#047857` (ESAP Emerald)
- Text: `#ffffff`
- Padding: 8px 16px
- Radius: 4px (subtle)
- Border: `1px solid transparent`
- Hover: background darkens to `#065f46`
- Active: scale(0.9) transform
- Focus: `2px solid` focus outline, `var(--shadow-level-200)` shadow
- Use: Primary CTA ("Get Notion free", "Try it")

**Secondary / Tertiary**
- Background: `rgba(0,0,0,0.05)` (translucent warm gray)
- Text: `#000000` (near-black)
- Padding: 8px 16px
- Radius: 4px
- Hover: text color shifts, scale(1.05)
- Active: scale(0.9) transform
- Use: Secondary actions, form submissions

**Ghost / Link Button**
- Background: transparent
- Text: `rgba(0,0,0,0.95)`
- Decoration: underline on hover
- Use: Tertiary actions, inline links

**Pill Badge Button**
- Background: `#ecfdf5` (tinted emerald)
- Text: `#059669`
- Padding: 4px 8px
- Radius: 9999px (full pill)
- Font: 12px weight 600
- Use: Status badges, feature labels, "New" tags

### Cards & Containers
- Background: `#ffffff`
- Border: `1px solid rgba(0,0,0,0.1)` (whisper border)
- Radius: 12px (standard cards), 16px (featured/hero cards)
- Shadow: `rgba(0,0,0,0.04) 0px 4px 18px, rgba(0,0,0,0.027) 0px 2.025px 7.84688px, rgba(0,0,0,0.02) 0px 0.8px 2.925px, rgba(0,0,0,0.01) 0px 0.175px 1.04062px`
- Hover: subtle shadow intensification
- Image cards: 12px top radius, image fills top half

### Inputs & Forms
- Background: `#ffffff`
- Text: `rgba(0,0,0,0.9)`
- Border: `1px solid #dddddd`
- Padding: 6px
- Radius: 4px
- Focus: emerald outline ring
- Placeholder: warm gray `#a39e98`

### Navigation
- Clean horizontal nav on white, not sticky
- Brand logo left-aligned (33x34px icon + wordmark)
- Links: NotionInter 15px weight 500-600, near-black text
- Hover: color shift to `var(--color-link-primary-text-hover)`
- CTA: emerald pill button ("Try ESAP free") right-aligned
- Mobile: hamburger menu collapse
- Product dropdowns with multi-level categorized menus

### Image Treatment
- Product screenshots with `1px solid rgba(0,0,0,0.1)` border
- Top-rounded images: `12px 12px 0px 0px` radius
- Dashboard/workspace preview screenshots dominate feature sections
- Warm gradient backgrounds behind hero illustrations (decorative character illustrations)

### Distinctive Components

**Feature Cards with Illustrations**
- Large illustrative headers (The Great Wave, product UI screenshots)
- 12px radius card with whisper border
- Title at 22px weight 700, description at 16px weight 400
- Warm white (`#f6f5f4`) background variant for alternating sections

**Trust Bar / Logo Grid**
- Company logos (trusted teams section) in their brand colors
- Horizontal scroll or grid layout with team counts
- Metric display: large number + description pattern

**Metric Cards**
- Large number display (e.g., "$4,200 ROI")
- NotionInter 40px+ weight 700 for the metric
- Description below in warm gray body text
- Whisper-bordered card container

## 5. Layout Principles

### Spacing System
- Base unit: 8px
- Scale: 2px, 3px, 4px, 5px, 6px, 7px, 8px, 11px, 12px, 14px, 16px, 24px, 32px
- Non-rigid organic scale with fractional values (5.6px, 6.4px) for micro-adjustments

### Grid & Container
- Max content width: approximately 1200px
- Hero: centered single-column with generous top padding (80-120px)
- Feature sections: 2-3 column grids for cards
- Full-width warm white (`#f6f5f4`) section backgrounds for alternation
- Code/dashboard screenshots as contained with whisper border

### Whitespace Philosophy
- **Generous vertical rhythm**: 64-120px between major sections. Notion lets content breathe with vast vertical padding.
- **Warm alternation**: White sections alternate with warm white (`#f6f5f4`) sections, creating gentle visual rhythm without harsh color breaks.
- **Content-first density**: Body text blocks are compact (line-height 1.50) but surrounded by ample margin, creating islands of readable content in a sea of white space.

### Border Radius Scale
- Micro (4px): Buttons, inputs, functional interactive elements
- Subtle (5px): Links, list items, menu items
- Standard (8px): Small cards, containers, inline elements
- Comfortable (12px): Standard cards, feature containers, image tops
- Large (16px): Hero cards, featured content, promotional blocks
- Full Pill (9999px): Badges, pills, status indicators
- Circle (100%): Tab indicators, avatars

## 6. Depth & Elevation

| Level | Treatment | Use |
|-------|-----------|-----|
| Flat (Level 0) | No shadow, no border | Page background, text blocks |
| Whisper (Level 1) | `1px solid rgba(0,0,0,0.1)` | Standard borders, card outlines, dividers |
| Soft Card (Level 2) | 4-layer shadow stack (max opacity 0.04) | Content cards, feature blocks |
| Deep Card (Level 3) | 5-layer shadow stack (max opacity 0.05, 52px blur) | Modals, featured panels, hero elements |
| Focus (Accessibility) | `2px solid var(--focus-color)` outline | Keyboard focus on all interactive elements |

**Shadow Philosophy**: Notion's shadow system uses multiple layers with extremely low individual opacity (0.01 to 0.05) that accumulate into soft, natural-looking elevation. The 4-layer card shadow spans from 1.04px to 18px blur, creating a gradient of depth rather than a single hard shadow. The 5-layer deep shadow extends to 52px blur at 0.05 opacity, producing ambient occlusion that feels like natural light rather than computer-generated depth. This layered approach makes elements feel embedded in the page rather than floating above it.

### Decorative Depth
- Hero section: decorative character illustrations (playful, hand-drawn style)
- Section alternation: white to warm white (`#f6f5f4`) background shifts
- No hard section borders -- separation comes from background color changes and spacing

## 7. Responsive Behavior

### Breakpoints
| Name | Width | Key Changes |
|------|-------|-------------|
| Mobile Small | <400px | Tight single column, minimal padding |
| Mobile | 400-600px | Standard mobile, stacked layout |
| Tablet Small | 600-768px | 2-column grids begin |
| Tablet | 768-1080px | Full card grids, expanded padding |
| Desktop Small | 1080-1200px | Standard desktop layout |
| Desktop | 1200-1440px | Full layout, maximum content width |
| Large Desktop | >1440px | Centered, generous margins |

### Touch Targets
- Buttons use comfortable padding (8px-16px vertical)
- Navigation links at 15px with adequate spacing
- Pill badges have 8px horizontal padding for tap targets
- Mobile menu toggle uses standard hamburger button

### Collapsing Strategy
- Hero: 64px display -> scales to 40px -> 26px on mobile, maintains proportional letter-spacing
- Navigation: horizontal links + emerald CTA -> hamburger menu
- Feature cards: 3-column -> 2-column -> single column stacked
- Product screenshots: maintain aspect ratio with responsive images
- Trust bar logos: grid -> horizontal scroll on mobile
- Footer: multi-column -> stacked single column
- Section spacing: 80px+ -> 48px on mobile

### Image Behavior
- Workspace screenshots maintain whisper border at all sizes
- Hero illustrations scale proportionally
- Product screenshots use responsive images with consistent border radius
- Full-width warm white sections maintain edge-to-edge treatment

## 8. Accessibility & States

### Focus System
- All interactive elements receive visible focus indicators
- Focus outline: `2px solid` with focus color + shadow level 200
- Tab navigation supported throughout all interactive components
- High contrast text: near-black on white exceeds WCAG AAA (>14:1 ratio)

### Interactive States
- **Default**: Standard appearance with whisper borders
- **Hover**: Color shift on text, scale(1.05) on buttons, underline on links
- **Active/Pressed**: scale(0.9) transform, darker background variant
- **Focus**: Emerald outline ring with shadow reinforcement
- **Disabled**: Warm gray (`#a39e98`) text, reduced opacity

### Color Contrast
- Primary text (rgba(0,0,0,0.95)) on white: ~18:1 ratio
- Secondary text (#615d59) on white: ~5.5:1 ratio (WCAG AA)
- Emerald CTA (#047857) on white: ~5.1:1 ratio (WCAG AA normal, AAA large)
- Badge text (#059669) on badge bg (#ecfdf5): ~4.6:1 ratio (WCAG AA for large text)

## 9. Agent Prompt Guide

### Quick Color Reference
- Primary CTA: ESAP Emerald (`#047857`)
- Background: Pure White (`#ffffff`)
- Alt Background: Warm White (`#f6f5f4`)
- Heading text: Near-Black (`rgba(0,0,0,0.95)`)
- Body text: Near-Black (`rgba(0,0,0,0.95)`)
- Secondary text: Warm Gray 500 (`#615d59`)
- Muted text: Warm Gray 300 (`#a39e98`)
- Border: `1px solid rgba(0,0,0,0.1)`
- Link: ESAP Emerald (`#047857`)
- Focus ring: Focus Emerald (`#059669`)

### Example Component Prompts
- "Create a hero section on white background. Headline at 64px NotionInter weight 700, line-height 1.00, letter-spacing -2.125px, color rgba(0,0,0,0.95). Subtitle at 20px weight 600, line-height 1.40, color #615d59. Emerald CTA button (#047857, 4px radius, 8px 16px padding, white text) and ghost button (transparent bg, near-black text, underline on hover)."
- "Design a card: white background, 1px solid rgba(0,0,0,0.1) border, 12px radius. Use shadow stack: rgba(0,0,0,0.04) 0px 4px 18px, rgba(0,0,0,0.027) 0px 2.025px 7.85px, rgba(0,0,0,0.02) 0px 0.8px 2.93px, rgba(0,0,0,0.01) 0px 0.175px 1.04px. Title at 22px NotionInter weight 700, letter-spacing -0.25px. Body at 16px weight 400, color #615d59."
- "Build a pill badge: #ecfdf5 background, #059669 text, 9999px radius, 4px 8px padding, 12px NotionInter weight 600, letter-spacing 0.125px."
- "Create navigation: white header. NotionInter 15px weight 600 for links, near-black text. Emerald pill CTA 'Try ESAP free' right-aligned (#047857 bg, white text, 4px radius)."
- "Design an alternating section layout: white sections alternate with warm white (#f6f5f4) sections. Each section has 64-80px vertical padding, max-width 1200px centered. Section heading at 48px weight 700, line-height 1.00, letter-spacing -1.5px."

### Iteration Guide
1. Always use warm neutrals -- Notion's grays have yellow-brown undertones (#f6f5f4, #31302e, #615d59, #a39e98), never blue-gray
2. Letter-spacing scales with font size: -2.125px at 64px, -1.875px at 54px, -0.625px at 26px, normal at 16px
3. Four weights: 400 (read), 500 (interact), 600 (emphasize), 700 (announce)
4. Borders are whispers: 1px solid rgba(0,0,0,0.1) -- never heavier
5. Shadows use 4-5 layers with individual opacity never exceeding 0.05
6. The warm white (#f6f5f4) section background is essential for visual rhythm
7. Pill badges (9999px) for status/tags, 4px radius for buttons and inputs
8. ESAP Emerald (#047857) is the only saturated color in core UI chrome -- use it sparingly for CTAs and links. Semantic greens/teals reserved for status, not decoration.

## 10. Bilingual Typography (AR + EN)

Arabic is co-equal with Latin, not a fallback. A contract shown half in Arabic and half in English must render both scripts at the same visual weight so a bilingual reader feels neither side was treated as secondary.

### Font Stack
- **Latin**: `NotionInter, Inter, -apple-system, system-ui, Segoe UI, Helvetica, Arial`
- **Arabic**: `"IBM Plex Sans Arabic", "Noto Sans Arabic", "Geeza Pro", Tahoma, sans-serif`
- Apply Arabic font via `:lang(ar)` and `[dir="rtl"]` selectors; never rely on browser fallback.

### Size & Weight Parity
- At every hierarchy level in Section 3's table, Arabic renders at the **same pixel size and weight** as Latin. No reducing Arabic to 90% "for balance" — the two scripts share the rhythm.
- Arabic line-height adds +0.1 vs. Latin (e.g., body Latin 1.50 → Arabic 1.60) to accommodate tashkeel and descenders without crowding.
- Letter-spacing: reset to `normal` for Arabic at all sizes. The negative tracking that sharpens NotionInter display sizes produces unreadable Arabic.

### Direction & Layout
- Default `dir="ltr"` on Latin-dominant pages; `dir="rtl"` on Arabic-dominant pages.
- Mixed-script blocks (chat answers, document excerpts) use per-paragraph `dir="auto"` so each paragraph flows naturally.
- All layout CSS uses logical properties: `padding-inline-start`, `margin-inline-end`, `border-inline-start`. Never `padding-left`/`padding-right` on flow-dependent elements.
- Numerals: Arabic-Indic (`٠١٢٣`) in Arabic-dominant contexts, Western (`0123`) in Latin-dominant. Currency and invoice totals default to Western for audit clarity.
- Icons with directional meaning (arrows, chevrons, send icon) mirror under RTL via `transform: scaleX(-1)` or `[dir="rtl"]` variants.

### Mixed-Script Example
> Invoice **INV-2024-0341** (فاتورة رقم ٠٣٤١) from **شركة النقل المتحد** dated 15 March 2024.

Both scripts must read at the same optical weight. If Arabic looks smaller, the pairing is wrong.

## 11. Platform Surfaces

### Marketing Landing (`/`)
- Hero: emerald CTA "Try ESAP free" + ghost "See how it works".
- Trust bar: bilingual logos (Arabic company names use Arabic font, Latin use NotionInter).
- Feature sections alternate white / warm white (`#f6f5f4`). Each section = one job (Section 4 card pattern).
- Document intelligence demo: static screenshot of chat answering a question citing a real invoice excerpt (AR + EN side by side).

### Workspace Shell (app) — Grok-inspired reference

Reference: Grok AI workspace (dark-first, sidebar + centered composer). Adopt the structure, keep the ESAP brand (emerald accent, warm neutrals for light mode, no neon).

**Left sidebar** (260px default, collapsible to 56px rail, `inline-start`):
1. **Brand row**: ESAP mark + collapse chevron (`«` / `»`, mirrors in RTL).
2. **Primary nav** (icon + label, 15px weight 500): Search, Chat, Documents, Upload. Active item: emerald dot on trailing edge (`inline-end`) + subtle tinted background (`--sidebar-active-bg`). No pill outline, no heavy chip.
3. **Projects section** (collapsible): section label "Projects" with disclosure chevron, "+ New project" ghost action. Empty-state allowed (no placeholder cards).
4. **History section** (collapsible): scrollable, truncated titles (max ~28 chars, ellipsis). Hover reveals trailing overflow `⋯`. No icons per item.
5. **Footer**: user avatar (32px, bottom-start) + optional upgrade card (bottom-end, dismissable, emerald CTA). Mobile collapses all to slide-in drawer per existing behavior.

**Main canvas**:
- Background: `--bg-page` (near-black in dark, warm white in light). Ambient micro-dots overlay allowed at ≤3% opacity (`radial-gradient` noise, not floating blobs).
- Top bar (48px): breadcrumb `inline-start`; `inline-end` cluster = Private toggle, Language toggle, theme toggle, user menu. No persistent back button — sidebar is the nav.

**Empty state (chat/search landing)**:
- Centered brand mark (96×96 logo + wordmark, ~14% of viewport height from top). One line of ambient copy ONLY if localized and meaningful — otherwise the logo stands alone.
- Below logo: composer (see `/chat`), then one micro-hint line ("New · Hold Ctrl+D to dictate" equivalent — skip if feature absent).

### `/chat`

**Populated state** (conversation active):
- Message list: user messages in warm bubbles (`--bg-surface-subtle`, 12px radius), `inline-end` aligned; assistant messages full-width no bubble, 16px body. Citation chips inline per §12.
- Composer docks to bottom center (max-width 760px), whisper border, emerald send icon mirrored in RTL.

**Empty state** (no messages yet): composer is vertically centered in the canvas (~50% viewport height), not docked. Brand mark sits ~96px above it. On first send, composer animates to the bottom dock position (150ms ease-out) and message list fades in above. Reduced-motion: instant swap.

**Composer anatomy** (same in empty + docked):
- Rounded 16px (larger than buttons — owns the canvas), 56px min height.
- Leading slot: attachment (paperclip, opens `/upload` quick-action).
- Input: placeholder "How can I help you today?" / "كيف يمكنني مساعدتك اليوم؟", `dir="auto"`.
- Trailing cluster: model picker ghost chip (label + chevron, e.g. "Auto"), mic icon (dictation), send button (solid circle, emerald bg on populated input; neutral when empty).
- Below composer (empty state only): one-line hint in `--text-tertiary`.

**Top-right actions on `/chat`**: "Private" toggle (disables history persistence), "Imagine" reserved for future image-gen; hide the button if feature not shipped — do not ship dead UI.

### `/documents`
- Document card grid (3-col desktop, 2-col tablet, 1-col mobile): 12px radius, whisper border, soft card shadow.
- Card contents: 48x48 document-type icon (invoice, contract, PO, etc.), title in NotionInter 16px weight 600 (bilingual if doc has both), filename in Warm Gray 500 caption, status pill badge (Indexed = emerald, Processing = amber `#b45309` tint, Failed = error red `#b91c1c` tint).
- Metadata row: page count + indexed date + language flag chips, 12px Caption Light.

### `/upload`
- Dropzone: 16px radius, dashed whisper border (`1px dashed rgba(0,0,0,0.15)`), warm white `#f6f5f4` bg, 200px min height, centered icon + "Drop files or click to browse" in both languages.
- Active drag state: border upgrades to `2px dashed #047857`, bg tints to `#ecfdf5`.
- Upload progress row: filename + progress bar (emerald fill on warm gray track, 4px height, 9999px radius) + cancel ghost button.

## 12. Platform-Specific Components

### Status Pill Badges
- **Indexed**: `#ecfdf5` bg, `#065f46` text, "Indexed" / "مفهرس"
- **Processing**: `#fef3c7` bg, `#92400e` text, "Processing" / "قيد المعالجة" — animated 1.5s pulse opacity 1 → 0.7 → 1
- **Failed**: `#fee2e2` bg, `#991b1b` text, "Failed" / "فشل"
- **Draft**: `rgba(0,0,0,0.05)` bg, Warm Gray 500 text, "Draft" / "مسودة"

All use: 9999px radius, 4px 8px padding, 12px NotionInter/Plex Sans Arabic weight 600, letter-spacing 0.125px (Latin only).

### Citation Chip
- Inline chip used within chat answers. `#ecfdf5` bg, `#065f46` text, `1px solid rgba(4,120,87,0.15)` border, 4px radius, 2px 6px padding, 12px weight 600. Format: `INV-2024-0341 · p.3` or `فاتورة ٠٣٤١ · ص.٣`.

### Document Type Icon
- 48x48 tile on card, 8px radius, warm white bg, document-type glyph in Warm Dark `#31302e` 24px. No colored icon circles — the glyph alone carries meaning.

### Language Toggle
- Ghost pill in top bar. "AR / EN" text only, no flags (flags conflate language with nationality). Active language in near-black weight 600, inactive in Warm Gray 500. Clicking swaps `dir` + `lang` on `<html>` and remounts for RTL/LTR.

### Source Viewer Pane
- Right-side slide-in panel (480px wide, `inline-end`), whisper border on inline-start, deep shadow on open. Header: document filename + close ghost. Body: paginated document preview with cited span highlighted in `#ecfdf5` with `#065f46` left-border (mirrors in RTL).

## 13. AI Slop Blacklist

Patterns that scream "AI-generated" — reject on sight in code review:
1. **Purple/violet/indigo gradients** — emerald is the only brand color; do not reintroduce blue or purple decoration.
2. **3-column feature grid** (icon-in-colored-circle + bold title + 2-line description × 3). The single most recognizable AI layout.
3. **Icons in colored circles** as section decoration.
4. **Centered-everything** layouts (`text-align: center` on all headings).
5. **Uniform bubbly border-radius** — use the scale in Section 5 (4, 8, 12, 16, 9999), never the same large radius on everything.
6. **Decorative blobs, floating circles, wavy SVG dividers** — if a section feels empty, content is the fix, not ornament.
7. **Emoji as design elements** — especially rockets, sparkles, fire. None in headings or as bullet points.
8. **Colored left-border on cards** (`border-left: 3px solid <accent>`) outside of the citation highlight.
9. **Generic hero copy** — "Welcome to ESAP", "Unlock the power of…", "Your all-in-one solution for…". Write product language.
10. **Cookie-cutter section rhythm** (hero → 3 features → testimonials → pricing → CTA with same height).
11. **Fake Arabic** — lorem-ipsum-style placeholder Arabic or English strings inside Arabic contexts. Real translations or nothing.
12. **Emerald everywhere** — emerald is an accent, not a wash. Emerald backgrounds, emerald borders on unrelated cards, emerald gradients = slop.

## 14. Migration

Current codebase uses legacy tokens: `sand`, `ember`, and `--lp-*` CSS variables. Migrate incrementally, not big-bang.

| Legacy | Target | Notes |
|--------|--------|-------|
| `sand-*` warm tints | Keep — already warm neutral scale. Audit hex values against `#f6f5f4`/`#31302e`/`#615d59`/`#a39e98` and consolidate. |
| `ember-*` (orange accents) | Retire. Replace with ESAP Emerald for CTAs/links; keep orange only inside the semantic **Warning** role. |
| `--lp-primary` | `#047857` (ESAP Emerald) |
| `--lp-primary-hover` | `#065f46` (Deep Emerald) |
| `--lp-focus` | `#059669` (Focus Emerald) |
| `--lp-accent-bg` | `#ecfdf5` (Badge Emerald Bg) |
| `--lp-text` / `--lp-text-muted` | `rgba(0,0,0,0.95)` / `#615d59` |

### Phasing
1. Introduce new CSS variables alongside `--lp-*` (both resolve to same emerald values).
2. Migrate components one surface at a time — start with `/upload` (smallest), then `/documents`, then `/chat`, then marketing.
3. Each PR migrates one surface; reviewer checks AI Slop Blacklist + bilingual behavior.
4. Delete `--lp-*` once all surfaces migrated. Do not batch-rename in one commit.
