# Design Brief: Rainscope Site — Coherence & Analog-Cinematic Pass

## Problem

Rainscope has four divisions — Filmworks, Rentals, Shop, Live — each built division-by-division over time. The bones are solid (a working theme-variable system, cinematic hero treatment, commerce cart flows), but the site was assembled incrementally, not designed as one whole. A visitor moving between divisions doesn't yet feel a deliberate, considered hand behind the choices. And the current direction, if left to default instincts, risks drifting toward a generic "polished tech company" look — the opposite of what this business actually is: people who make things by hand, in real time, through a lens, with real light and real mistakes.

The human friction: a prospective client — a marketing lead evaluating a production partner, a working DP checking gear availability, an event planner vetting an AV crew — should feel like they've found a real studio with real people and real craft, not a template. Right now the site doesn't yet earn that feeling consistently across all four divisions.

## Solution

A site where each division has its own visual identity — its own accent color, its own mood — while clearly belonging to one analog, tactile, cinematic family. The visual language draws from physical media and the imperfection of capturing life through a lens: film grain, VHS tracking noise, the tactile ritual of vinyl and cassette, imperfect composition that's nonetheless deliberate. Nothing here should read as SaaS-clean or optically perfect. The site should feel like it was made by someone who loves the physical texture of the medium, and every division should still funnel visitors toward one thing: reaching out — a quote request, a booking, a reservation.

## Experience Principles

1. **Deliberate imperfection over polish** — Compositions are intentional (good framing, considered hierarchy), but textures, transitions, and details should carry grain, noise, and asymmetry rather than airbrushed SaaS gloss. If a layout choice could belong to any generic tech product, it's wrong for this site.
2. **Distinct identity, shared family** — Filmworks, Rentals+Shop, and Live each get their own accent color and mood, but never diverge in typography, structural grid, logomark, or navigation pattern. A visitor should always know they're still on Rainscope.
3. **Every page earns the inquiry** — This is a lead-generation site across three service lines, not a portfolio for its own sake. Every division page should build enough confidence and clarity that the visitor reaches for the contact/quote/booking action.

## Aesthetic Direction

- **Philosophy**: Analog-cinematic. Physical media nostalgia (VHS, vinyl) translated into digital craft — grain, tracking noise, tactile transitions, the warmth of a lens capturing imperfect life — layered onto disciplined, considered composition. Think "a working filmmaker built this site themselves," not "a marketing agency built this for a filmmaker."
- **Tone**: Warm, human, unhurried, a little raw. Confident but not slick. Moody without being cold or corporate-dark.
- **Reference points**: The cinematic hero/parallax direction already shipped on Filmworks and Live (dark backgrounds, atmospheric gradients, full-bleed video) is the right foundation — extend it, and extend it with more analog texture (grain, noise, imperfect transitions) rather than flattening it into clean gradients. Physical media rituals (VHS insertion, vinyl warmth) are a direct inspiration for interaction/transition feel, not literal skeuomorphism.
- **Anti-references**: Generic SaaS landing pages (symmetrical hero + 3-icon feature grid + centered CTA formula), stock-photo gloss, sterile glassmorphism used as decoration rather than texture, perfectly optically-balanced spacing that reads as template-generated, anything that could be mistaken for a corporate tech product.

## Existing Patterns

- **Typography**: `Outfit` (sans/display) + `Space Grotesk` (`--font-tech`, used for technical/commerce UI like search, filters, cart). Headings use `font-weight: 700`, `letter-spacing: -0.02em`. This pairing stays constant across all divisions.
- **Colors**: Theme-variable system already exists and already encodes the 3-palette split:
  - Filmworks (default `:root`): dark evergreen `#071816` bg, spring green `#31e880` accent.
  - Rentals + Shop (`.theme-rentals`, `.theme-shop`): onyx `#0f1013` bg, ocean blue `#0094c6` accent.
  - Live (`.theme-live`): black `#000000` bg, bright lavender `#ba8fff` accent.
  This structure is correct and should be preserved/extended, not rebuilt — the work is applying it more richly and consistently (see Component Inventory), not inventing new palettes.
- **Spacing/Layout**: `.container` (max-width 1200px), `section-band` rhythm, `catalog-grid` responsive column system (2/3/4+ cols by breakpoint), `.reveal` scroll-entrance utility.
- **Components already in use**: `.btn-primary`/`.btn-secondary`, `.glass-panel`, `.service-card`, `.hero-reel--cinematic` (parallax hero with scroll-driven `--hero-scroll` custom property, unmute control), `.film-card`/`.team-card`/`.work-overlay-card`, `.gear-card` (commerce catalog), `.commerce-cart-panel` (native `<dialog>`-based cart), forms with native `:user-invalid`/`:user-valid` styling, `.catalog-skeleton-*` loading states.
- **Motion**: `js/cinematic-hero.js` drives scroll-linked hero parallax and header transition; respects `prefers-reduced-motion`. `.reveal` class handles scroll-triggered entrance animation site-wide.

## Component Inventory

| Component | Status | Notes |
| --- | --- | --- |
| Hero (cinematic parallax) | Exists — extend | Currently only on Filmworks/Live (`hero-cinematic` body class). Bring equivalent depth treatment to Rentals/Shop with their own accent mood — doesn't need to be identical video-hero, but needs the same craft level. |
| Theme accent system (3 palettes) | Exists — extend | Variables already correct; audit that every component (buttons, focus rings, cards, form states, cart) actually pulls from `--color-accent` consistently rather than hardcoded colors, so each division's identity is fully expressed, not just in the hero. |
| Grain/noise texture layer | New | No existing grain/noise treatment in CSS. Needs a reusable texture approach (CSS/SVG noise overlay or similar) applied consistently across dark backgrounds site-wide — this is the key missing piece of the analog direction. |
| Transitions (page/section) | Modify | Current transitions use standard `cubic-bezier` eases (`--transition-fast/normal/slow`). Consider whether key moments (hero load, gallery open, cart open) can get a more tactile/mechanical feel without breaking usability or `prefers-reduced-motion` compliance. |
| `.glass-panel` | Exists — reconsider | Currently generic glassmorphism (blur + translucent bg). Risk of reading as "tech company." Should be re-evaluated for whether it fits the analog direction as-is or needs texture/grain added to avoid the sterile-glass look. |
| `.service-card`, `.film-card`, `.gear-card`, `.team-card` | Exists — polish | Solid structural pattern; needs the analog/texture treatment applied consistently rather than a redesign. |
| Landing gateway (3-panel) | Exists — polish | Root `index.html` split-panel gateway (Filmworks/Rentals/Live). Shop intentionally stays off this page. Apply the coherence pass here too — this is the first impression for all divisions. |
| Footer (map, Google rating, reviews) | Exists — keep | Recently added (`_includes/footer.njk`), functionally complete. Only needs visual alignment with the analog direction, not restructuring. |
| Nav/header | Exists — keep structure | Shared `_includes/header.njk` across all divisions; structure stays constant, only accent coloring shifts per theme class. |
| Cart/checkout flow | Exists — do not redesign | `.commerce-cart-panel`, `js/rentals.js`, `js/shop.js`, `js/commerce-cart-shell.js`. Out of scope for this pass — see below. |

## Key Interactions

- **Hero scroll parallax**: Already implemented via `--hero-scroll` custom property in `cinematic-hero.js`. Extend this pattern (or an equivalent tactile equivalent) to Rentals/Shop rather than leaving them static.
- **Card hover states**: Existing `.service-card:hover .service-icon` and similar patterns should get texture/grain-aware treatment rather than generic lift-and-shadow.
- **Video unmute control**: Existing pattern on Filmworks/Live heroes (`hero-unmute-btn`) — keep as-is, it's already a nice human touch (visitor chooses to hear the work).
- **Scroll-reveal (`.reveal`)**: Site-wide entrance animation utility — keep, but review timing/easing against the "tactile, not slick" principle.
- **Out of scope for interaction changes**: cart open/close, quantity steppers, quote form submission flow — these work today and aren't being redesigned in this pass.

## Responsive Behavior

- Existing breakpoint system is granular and already handles catalog grids well (2 col mobile → 3 col tablet → 3-4+ col desktop → fluid ultra-wide). Preserve this system.
- A recent commit (`156bdbc Fix landing page mobile layout overlap`) indicates mobile layout has been a recurring pain point on the landing gateway specifically — any changes to the landing page in this pass must be checked carefully on mobile (375px) before considering it done.
- Grain/texture treatments must not degrade mobile performance — prefer lightweight CSS/SVG approaches over heavy image textures, especially given `hero-reel-video` autoplay already exists on mobile heroes.
- Hero parallax and other scroll-driven effects must continue to respect `prefers-reduced-motion` (already handled in `cinematic-hero.js` and `css/style.css`), including on any newly extended treatments for Rentals/Shop.

## Accessibility Requirements

- WCAG AA contrast (4.5:1 body text, 3:1 UI components) as the floor for all real content — copy, CTAs, form labels, nav links. This applies per-theme: verify AA holds for spring-green-on-evergreen, ocean-blue-on-onyx, and lavender-on-black in both text and focus-ring use.
- Decorative texture (grain, noise, atmospheric gradients) is exempt from contrast requirements since it's not conveying information — but must never be layered in a way that pulls real text below AA.
- Keep existing `:focus-visible` outline pattern (2px solid `--color-focus-ring`, 3px offset) — already correctly wired per-theme.
- Any new tactile/mechanical transitions must have a `prefers-reduced-motion` fallback, consistent with the existing hero pattern.
- Native form validation (`:user-invalid`/`:user-valid`) and `aria-live`/`aria-busy` catalog-loading patterns already in place — preserve, don't regress.

## Out of Scope

- Cart, checkout, and quote-submission interaction logic (`js/rentals.js`, `js/shop.js`, `js/commerce-cart-shell.js`, Square integration) — visual polish only where the new palette/texture touches these surfaces; no flow or logic changes.
- Sanity CMS schema/content structure and the fetch pipeline (`scripts/fetch-sanity.js`) — this pass is visual/front-end only.
- Adding Shop to the landing gateway — explicitly decided against; Shop stays reached via Rentals/nav.
- SEO, redirects, deploy/hosting configuration — recently handled in a prior commit, not part of this pass.
- New divisions, pages, or business lines beyond the existing four.
- A hard deadline — this is open-ended, iterative work; no fixed launch date to design against.
