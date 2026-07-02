# Information Architecture: Rainscope Site

## Site Map

- Landing Gateway `/` — full-screen split-panel entry, 3 panels (Filmworks, Rentals, Live)
  - Filmworks `/filmworks/` — production studio (narrative, commercial, corporate)
    - Showreel (external, YouTube) — linked from hero
  - Rentals `/rentals/` — gear rental catalog + quote-cart flow
  - Live `/live/` — full AV production & event services
  - Shop `/shop/` — gear sales catalog + cart flow (nav/footer/cross-link only, no gateway panel)

No nested sub-pages exist today (each division is a single long-scroll page with in-page anchors, e.g. `/live/#request-production`, `/filmworks/#request-production`). This is a flat, 1-level-deep site — appropriate for the content volume and matches the "long-scroll cinematic page" pattern already established. Not proposing new page-level nesting in this pass.

## Navigation Model

- **Primary navigation** (`_includes/header.njk`, driven by `siteSettings.nav`): 4 items — Filmworks, Rentals, Live, Shop — same order and set on every division page. Fixed max: 4 items; do not add a 5th without revisiting this document. Logo links back to `/` (the gateway), not to any division — confirmed correct, since the gateway is the hub.
- **Secondary navigation**: None currently — each division page uses in-page anchor scrolling (e.g. `#request-production`, `#how-we-run`) rather than a sub-nav or tabs. Rentals/Shop use a **filter sidebar** (`.filter-sidebar`, category list) as their in-page secondary navigation — this is catalog-specific and stays as-is.
- **Utility navigation**: None (no account/login system). Footer serves this role instead — nav links, office/studio address + embedded map, Google rating + review links.
- **Cross-division navigation (gap identified, now in scope)**: Currently only Filmworks links out to siblings ("Need gear or an event crew? Explore our equipment rentals and audio visual services."). Per decision above, every division gets a reciprocal cross-link line:
  - Filmworks → Rentals, Live (already exists, keep as-is)
  - Live → Rentals ("need gear for your own team? →")
  - Rentals → Filmworks, Live ("need a full crew, not just gear? →")
  - Shop → Rentals ("need it for a shoot, not to keep? →")
  These are inline text links within existing copy sections (matching Filmworks' current pattern), not new nav elements — keeps nav item count at 4 and avoids adding structural weight.
- **Mobile navigation**: Not yet audited in this pass — `_includes/header.njk` renders the same `.nav-menu` markup at all breakpoints; CSS-level mobile nav behavior (hamburger vs. wrap) should be verified during build (flagged for frontend-design phase, not an IA-level change).

## Content Hierarchy

### Landing Gateway (`/`)
1. Rainscope logomark + name — establishes the brand before any division is chosen
2. Three panels (Filmworks, Rentals, Live) — the entire page's job is routing the visitor to the right division fast
3. Panel subtitle + one-line description per division — just enough to route correctly, not to sell
4. No footer/contact info competes here — this page has one job: route, not convert

### Filmworks (`/filmworks/`)
1. Hero (video, tagline, title, showreel CTA) — establish craft/credibility immediately
2. Intro (who we are, cross-link to Rentals/Live)
3. Services grid — what we offer
4. Commercial showcase (work gallery) — proof
5. Films (narrative work) — proof, secondary to commercial (this is a business, not just a portfolio)
6. Team — humanizes, builds trust before the ask
7. CTA / consultation form — the conversion point, placed last after credibility is built

### Live (`/live/`)
1. Hero (video/image, tagline, title, "Request Production" CTA) — same pattern as Filmworks
2. Intro (full AV framing, cross-link to Rentals — new)
3. Process steps ("Plan the Show" / "Build Before Doors Open" / "Run It Live") — de-risks booking a live event by showing process control
4. Recent productions showcase — proof
5. CTA / consultation form

### Rentals (`/rentals/`)
1. Search + category filter — utility-first, this audience knows what they want
2. Catalog grid — the core content, browsed not read
3. Cart/quote panel — always-available secondary panel, not a separate page
4. New: lightweight "need a full crew?" cross-link CTA — placed near catalog, not competing with cart flow
5. Footer — same as all pages

### Shop (`/shop/`)
Same structure as Rentals (search/filter/catalog/cart), plus the new cross-link CTA to Rentals ("need it for a shoot, not to keep?"). Shop deliberately does not get its own dedicated CTA form section — cart-driven quote/purchase flow is the only conversion path, consistent with staying "secondary" per the brief.

## User Flows

### Gateway routing
1. Visitor lands on `/`
2. Sees 3 panels: Filmworks / Rentals / Live
3. Picks based on subtitle + one-line description
   - If unsure / wants to buy gear outright → not served directly (Shop has no panel); visitor would need to pick Rentals then discover Shop via nav — accepted tradeoff per brief (Shop stays secondary)
4. Arrives at chosen division page

### Filmworks inquiry (quote request)
1. Visitor lands on `/filmworks/` (via gateway or direct/search)
2. Scrolls through services → work → films → team (credibility building)
3. Reaches consultation form, submits name/email
   - Form copy promises 24hr response — sets expectation
4. Arrives at confirmation state (form submission — not modified in this pass)

### Live booking inquiry
1. Visitor lands on `/live/` (via gateway, direct, or new cross-link from Rentals)
2. Sees process steps — reduces perceived risk of a live/real-time event
3. Views recent productions
4. Reaches `#request-production` form (also linked directly from hero CTA — a visitor who already knows they want to book can skip straight there)
5. Submits inquiry

### Rentals reservation
1. Visitor lands on `/rentals/` (via gateway, direct, or new cross-link from Filmworks/Live/Shop)
2. Searches/filters catalog
3. Adds items to cart (persistent side panel)
   - If visitor realizes they need a full crew, not just gear → new cross-link to Filmworks/Live
4. Opens cart panel, fills pickup/dropoff dates + contact info
5. Submits quote request (existing flow, not modified)

### Shop purchase
1. Visitor lands on `/shop/` (via nav or new cross-link from Rentals — no gateway panel)
2. Searches/filters catalog
3. Adds items to cart
   - If visitor realizes they need it temporarily, not to own → new cross-link to Rentals
4. Completes purchase flow (existing, not modified)

## Naming Conventions

| Concept | Label in UI | Notes |
|---|---|---|
| The 4 business units | "Filmworks" / "Rentals" / "Live" / "Shop" | Never "divisions" or "services" in UI copy — that's internal/brief language only |
| Root page | "Landing Gateway" (internal) — no user-facing label needed, it has no header/title of its own | Keep unlabeled; it's a routing screen, not a "home" a visitor returns to |
| Contact/lead forms | "Request Production" (Live), consultation form (Filmworks, untitled section heading varies by CMS copy), "Quote" (Rentals cart) | Keep each division's own verb — don't standardize to one generic "Contact Us" label, since the ask is different per division (book a shoot vs. reserve gear vs. book a crew) |
| Cart (Rentals/Shop) | "Cart" / "Quote Cart" (`cart-panel-count`, `commerce-cart-title`) | Rentals cart produces a *quote* (dates + contact info), Shop cart produces a *purchase* — same component, different downstream copy. Keep this distinction in any copy touched during the build phase. |

## Component Reuse Map

| Component | Used on | Behavior differences |
|---|---|---|
| `header.njk` / `.nav-menu` | All 5 pages (gateway has its own inline header, not the shared include) | Gateway uses a custom `.landing-header` (absolute-positioned, gradient fade), not the standard fixed `.site-header` — intentional, since the gateway has no scroll content to trigger the header's scroll-state transition |
| `footer.njk` | All 4 division pages | Not present on gateway (`/` has `layout: false`, full-screen, no footer) — correct, gateway's only job is routing |
| `.hero-reel--cinematic` | Filmworks, Live | Video/image hero with parallax; per IA decision in the brief, Rentals/Shop need an equivalent-craft (not necessarily identical) treatment — that's a build-phase decision, not an IA change |
| `.service-card` / `.glass-panel` | Filmworks (services), Live (services, process steps) | Same visual component, different content shape (service vs. process step) |
| `.catalog-grid` + `.filter-sidebar` + `.commerce-cart-panel` | Rentals, Shop | Identical structural pattern; only `--color-accent` theme and product data differ |
| CTA/consultation form section | Filmworks, Live | Rentals/Shop intentionally do NOT get this — their conversion path is cart-driven, not form-driven. New lightweight cross-link CTA (text link, not a form) is the Rentals/Shop equivalent |
| Cross-link line (new) | All 4 division pages | One inline text link near the intro or CTA area pointing to 1-2 sibling divisions; content varies per page (see Navigation Model above) |

## Content Growth Plan

- **Films/work reels (Filmworks)**, **projects (Live)**, **gear catalog (Rentals/Shop)**: all CMS-driven via Sanity (`_data/films.json`, `_data/workReels.json`, `_data/liveProjects.json`, gear catalog fetched at build time). Growth is handled by the existing grid/catalog patterns — no IA change needed as content volume increases; `.catalog-grid` already has a defined breakpoint scaling system for this.
- **Team members (Filmworks only)**: CMS-driven, low-frequency growth (hires are infrequent) — current grid pattern scales fine.
- **Testimonials**: shared `_includes/testimonials.njk` — check whether this is used on all 4 pages or Filmworks-only; if site-wide, it's another opportunity for the "connected" feeling the brief calls for (worth a build-phase check, not an IA change).
- No pagination or archive pattern exists yet for any catalog; not needed at current content volume. Flag for a future IA revision if Rentals/Shop catalog size grows significantly.

## URL Strategy

- Pattern: `/{division}/` — flat, one URL per division, no sub-paths. Confirmed correct for current content volume; do not introduce nested URLs (e.g. `/filmworks/films/[slug]`) without a clear content-volume trigger, since work items are currently presented as in-page modals (`.work-modal`), not separate pages.
- In-page anchors: `#request-production`, `#how-we-run` used for CTA deep-linking (e.g. hero button scrolls to form). Keep this convention for any new cross-link CTAs — link to `#request-production` on the target page where applicable, so a cross-link drops the visitor directly into the conversion point rather than the top of the page.
- Query parameters: none currently observed in catalog search/filter (client-side state, not URL-driven) — acceptable for current UX, not an IA gap worth flagging in this pass.
- No dynamic/parameterized routes exist (all content is CMS-driven into static templates at build time via 11ty + Sanity fetch) — consistent with the static-site architecture, not something this pass should change.
