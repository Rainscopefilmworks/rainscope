# Design Tokens: Rainscope Site

Tokens live in `css/style.css` (extended in place — no new file, per decision). This documents what changed and why. Philosophy: **analog-cinematic** (see `DESIGN_BRIEF.md`).

## What already existed (unchanged)

- **Typography**: `--font-sans`/`--font-display` (Outfit), `--font-tech` (Space Grotesk) — confirmed correct, no changes.
- **3-palette color system**: Filmworks (spring green `#31e880` on dark evergreen), Rentals+Shop (ocean blue `#0094c6` on onyx), Live (bright lavender `#ba8fff` on black) via `:root` + `.theme-rentals`/`.theme-shop`/`.theme-live`. Confirmed correct per the brief — not touched.
- **`--transition-fast/normal/slow`**: kept as-is; still used throughout the file. New motion tokens sit alongside these, not in place of them.
- **Dark mode**: this site has no light mode and none was added. Each division's theme is its own dark palette by design — forcing a light mode would contradict the cinematic direction. Deviation from the design-tokens skill's default (documented, not an oversight).
- **Spacing**: left un-tokenized. Hundreds of hand-tuned rem values already exist across the file; retrofitting a numbered `--space-1..12` scale would mean touching nearly every rule for low return, and risks regressions on a live site. Not in scope for this pass.

## What was added

### Tactile motion tokens (`:root`, alongside existing `--transition-*`)
```css
--ease-tactile: cubic-bezier(0.65, 0, 0.35, 1);
--duration-shutter: 120ms;
--duration-tape-load: 700ms;
```
For physical/mechanical moments — a button that should feel like a shutter click, a hero/page transition that should feel like a tape loading — rather than the smooth, generic `ease-in-out` used everywhere by default. Not yet wired into any component; available for the build phase (Phase 6) to apply where a moment calls for it.

### Analog grain texture tokens (`:root`)
```css
--texture-grain: url("data:image/svg+xml,...");  /* neutral fractal-noise SVG */
--grain-opacity: 0.05;
--grain-opacity-strong: 0.09;
```
A single neutral (desaturated) noise texture, reused across all three theme palettes via `mix-blend-mode: overlay` rather than tinted per-theme — this is the piece the brief flagged as the key missing gap in the analog-cinematic direction.

### `.grain` utility class (new)
Apply to any container that should carry film-grain/VHS-noise texture — hero overlays, section bands, atmospheric backgrounds:
```html
<section class="container section-band grain">...</section>
```
Includes a subtle animated jitter (`grain-shift`, 0.6s stepped) to simulate old-film grain movement. This animation is automatically flattened by the existing `prefers-reduced-motion` media query (which already forces `animation-duration: 0.01ms !important` on all elements) — no extra reduced-motion handling needed. Use `.grain--strong` for a more visible texture where the moment calls for it (e.g. a hero over full-bleed video).

### `.glass-panel` updated (not just tokenized — applied now, per direction)
Added a grain overlay (`::after`, using the new texture tokens) on top of the existing blur/border/hover behavior — nothing existing was removed or changed, this is additive. This directly addresses the brief's concern that generic glassmorphism reads as "tech company": the panel keeps its blur and translucency, but now carries visible texture instead of looking like sterile glass. Also added `position: relative` and `overflow: hidden` to contain the overlay (verified this doesn't conflict with `.commerce-cart-panel`, which already sets its own `position: sticky` independently, or with `.close-modal-btn`'s absolute positioning, which resolves against that same dialog).

## What's deliberately deferred to the build phase (Phase 6)

- `.btn-primary`/`.btn-secondary` — not touched. Still uses the standard `translateY(-2px)` hover lift; whether this gets a more tactile treatment (using the new `--ease-tactile`/`--duration-shutter` tokens) is a build-time decision per component, not a blanket token change.
- Applying `.grain` to specific hero/section elements across Filmworks, Live, Rentals, and Shop — the tokens and utility class exist now; deciding exactly where and how strong per page is Phase 6 work, informed by the Component Inventory in the brief.
- Extending the cinematic hero/parallax treatment to Rentals/Shop — a structural/component decision, not a token.

## Accessibility note

Grain overlays use `opacity: 0.05–0.09` with `mix-blend-mode: overlay` and `pointer-events: none` — decorative only, doesn't sit between real text and its background in a way that would pull contrast below AA (per the brief's accessibility requirements: decorative texture is exempt from contrast rules but must never compromise real content legibility). Worth a visual spot-check during Phase 6 build on the lightest-text/darkest-background combinations, but the values chosen are conservative by design.

## Correction (found during Phase 6 build)

The codebase audit for this phase missed an existing `body.hero-cinematic::after` rule in `css/cinematic.css` — a single fixed grain layer already covering the *entire* page on any hero-cinematic division, predating this design pass. So the "key missing gap" framing above was only half right: grain infrastructure already existed at the page level; what was actually missing was extending `hero-cinematic` to Rentals/Shop (done in the Foundation build task) so that pre-existing layer would reach them too.

During build, `.glass-panel`'s grain overlay (described above) turned out to double up with that page-wide layer and cause visible seams wherever a glass panel sat near a section boundary. It was removed — `.glass-panel` no longer has its own `::after` grain; the page-wide layer covers it. The `.grain` utility class and `--texture-grain`/`--grain-opacity` tokens themselves are unaffected and still valid — they're just unused for now, kept as available infrastructure for a future deliberate, scoped accent (not for ambient page texture, which the existing global layer already owns).
