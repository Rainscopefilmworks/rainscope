# Design Review: Rainscope Site — Coherence & Analog-Cinematic Pass

Reviewed against: `DESIGN_BRIEF.md`
Philosophy: Analog-cinematic (physical media nostalgia — grain, tracking noise, tactile transitions — over disciplined composition)
Date: 2026-07-02

## Screenshots Captured

| Screenshot | Breakpoint | Description |
| --- | --- | --- |
| `review-landing-desktop-1280.png` / `-tablet-768` / `-mobile-375` | 1280 / 768 / 375 | 3-panel division gateway |
| `review-filmworks-desktop-1280.png` / `-tablet-768` / `-mobile-375` | 1280 / 768 / 375 | Full Filmworks page, all sections revealed |
| `review-live-desktop-1280.png` / `-tablet-768` / `-mobile-375` | 1280 / 768 / 375 | Full Live page, all sections revealed |
| `review-rentals-desktop-1280.png` / `-tablet-768` / `-mobile-375` | 1280 / 768 / 375 | Full Rentals catalog |
| `review-shop-desktop-1280.png` / `-tablet-768` / `-mobile-375` | 1280 / 768 / 375 | Full Shop catalog |
| `review-shop-hero-closeup3.png` | 1280×800 viewport | Shop commerce-hero at true scroll position |
| `review-rentals-hero-closeup.png` | 1280×800 viewport | Rentals commerce-hero at true scroll position |
| `review-filmworks-work-modal-open-desktop.png` | 1280×800 viewport | Film work modal (Showstorm) open state |
| `review-rentals-cart-panel-desktop.png` | 1280×800, full page | Persistent desktop cart sidebar with item |
| `review-rentals-cart-panel-mobile.png` | 375×812 viewport | Mobile cart bottom sheet, open |
| `review-live-focus-ring-nav.png` | 1280×800 viewport | Keyboard focus ring on nav link |

> All screenshots are in `.design/rainscope-site/screenshots/`.

## Summary

The analog-cinematic direction is genuinely well executed and consistent across all four divisions — the single page-wide grain layer, the three distinct-but-related hero moods (Filmworks warm/green, Live moody red/purple, Rentals+Shop understated teal), and the tactile shutter/tape-load transitions all read as intentional rather than templated. The standout piece is the Filmworks work modal — poster art, clean metadata layout, backdrop blur. The one real defect found is Live's "Recent Productions" portfolio section, which renders as an unlabeled blank box because its only content is a CMS placeholder ("COMING SOON") paired with a hover-only caption — a visible gap on the page most responsible for building booking confidence.

Note on process: several early screenshots in this review session initially looked broken (huge blank sections, "missing" heroes) — these turned out to be artifacts of headless scroll-state handling during capture (scroll-triggered reveal animations not firing, stale scroll position carried between navigations), not real site bugs. They were re-verified against live DOM state before being ruled out; only the finding below survived verification against actual computed styles.

## Must Fix

1. **Live's "Recent Productions" portfolio section has no visible content or empty-state messaging**: `_data/liveProjects.json` contains a single placeholder item (`{"title": "COMING SOON"}`) with no image/video/preview. The card's caption (`​.live-project-overlay`, containing the category, title, and "View project" text) is `opacity: 0` by default and only reveals on `:hover`/`:focus` — there is no base CSS for `.live-project-item`/`.live-projects-grid` beyond entrance-animation delays in `cinematic.css`. Result: on desktop this renders as a plain black rectangle with a barely-visible thin purple border and zero readable text unless a visitor happens to hover it; on mobile (no hover) the section collapses to near-zero visible height between "How We Run Your Event" and "Request Production" — see `review-live-mobile-375.png`. This is the trust-building section for Live specifically (event planners vetting a crew want proof of past work), so a broken-looking empty state here works against the brief's "every page earns the inquiry" principle. _Fix: give the placeholder state its own visible treatment — a static "Recent work coming soon" caption that doesn't depend on hover, or hide the section entirely until real project content exists rather than rendering an empty card grid._

## Should Fix

_None found that clear the bar for this category — the components audited (cards, forms, cart, modal, focus states) are consistent and match the brief._

## Could Improve

1. **Landing gateway is the site's closest approach to the brief's own anti-reference**: three symmetric cards, centered logo, centered CTA per panel is structurally close to the "symmetrical hero + 3-icon feature grid + centered CTA formula" the brief explicitly calls out as the thing to avoid. Grain and per-division imagery are present and it isn't literally that pattern, but of all five pages it's the one where "someone made a deliberate, asymmetric choice" is least visible at a glance — worth a light pass (unequal panel treatment, an off-center accent) if there's appetite, though the brief lists this page as "polish," not "redesign." See `review-landing-desktop-1280.png`.
2. **Service icons on Filmworks/Live use plain Unicode emoji** (🎬 📺 🏢 🎵) inside circular badges — a recognizable "SaaS feature grid" shape, even though grain/hover treatment keeps it from reading as generic. This is CMS-driven content (`service.icon` from Sanity), out of scope for a visual/front-end pass, but worth flagging for whoever next touches that content — hand-drawn or photographic icon treatment would fit the "someone who loves physical texture" tone better than default emoji glyphs.

## What Works Well

- **Grain/texture system**: the single page-wide `body.hero-cinematic::after` layer (documented in `DESIGN_TOKENS.md` as a correction from earlier per-element duplicates) reads as one consistent analog layer with zero seams across Filmworks, Live, Rentals, and Shop.
- **Per-division hero identity**: Filmworks (warm, green, bonfire imagery), Live (moody red/purple, event footage), and Rentals/Shop (understated teal atmospheric glow, left-aligned) each have a distinct mood while sharing the same typographic and structural DNA — exactly the "distinct identity, shared family" principle from the brief.
- **Filmworks work modal**: poster art, backdrop blur, clean cast/director/DOP metadata layout, tactile open/close — the strongest single component on the site (`review-filmworks-work-modal-open-desktop.png`).
- **Cross-link copy** between divisions (Filmworks↔Rentals/Live, Rentals↔Filmworks+Live, Shop↔Rentals) reads as a natural sentence, not a bolted-on banner.
- **Cart UX**: both the persistent desktop sidebar and the mobile bottom sheet are clearly organized, on-theme, and show real pricing state.
- **Focus rings**: clearly visible, theme-colored, consistent across pages (`review-live-focus-ring-nav.png`).
- **Responsive stacking**: landing, Filmworks, and Live all reflow cleanly at 375/768/1280 with no overlap regressions — the landing page's prior mobile-overlap history (commit `156bdbc`) does not recur.
