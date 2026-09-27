# CHANGES.md - Redline Editorial feature log

One entry per feature: what was added, what was verified.

## 2026-09-27 - Feature 6: Cursor context states

**Added**
- `assets/js/cursor.js`: two new states. `is-copy` on `.copy-btn` (code copy
  buttons) - 64px red disc with a live "COPY" label; `is-type` on text inputs
  and textareas - hides the custom cursor and restores the native I-beam
  (previously the red dot overlapped the caret in the footer terminal and the
  palette search box). The label span is now set by JS per state.
- `_sass/_chrome.scss`: styles for both states; `html.has-cursor
  #cursor.is-type { display: none; }` and `cursor: text` on inputs.

**Fixed**
- The custom cursor was dead code: nothing ever added `has-cursor` to `<html>`,
  so no visitor had ever seen it. `cursor.js` now adds the class itself when
  `matchMedia('(pointer: fine)')` matches. Touch devices remain unaffected.

**Verified**
- Chromium QA (desktop-class pointer simulated, since headless reports
  `pointer: none`): post card -> `is-read` 76px "READ"; nav link -> `is-link`
  44px ring; injected `.copy-btn` -> `is-copy` 64px "COPY"; footer terminal
  input -> `is-type`, `#cursor` hidden; moving away restores the 10px dot.
  Touch emulation: no `has-cursor`, cursor inert. Zero page errors.
- Screenshots: `qa-shots/cursor-copy.png`, `qa-shots/cursor-read.png`.

## 2026-09-27 - Feature 5: View Transitions API (cross-document page wipes)

**Added**
- `_sass/_transitions.scss` (imported in `main.scss`): `@view-transition
  { navigation: auto; }` opts every same-origin navigation into a transition.
  Outgoing page lifts and fades in 0.3s; incoming page cuts in with a hard
  left-to-right clip-path wipe in 0.55s, both on the theme's ease-out curve.
  `::view-transition` background matches `--bg` so mid-transition is never white.
  Pure CSS progressive enhancement: unsupported browsers ignore the block.
- Reduced motion: `_base.scss`'s global kill-switch uses `*`, which does not
  match view-transition pseudo-elements, so they are neutralized explicitly in
  the same partial.

**Verified**
- libsass compiles the partial cleanly (including the reduced-motion override);
  CSS confirmed live in production (`vt-in 0.55s` present).
- Chromium 152 QA (same-document VT, same pseudo-element keyframes; the
  sandbox blocks the browser's direct network, so cross-document capture was
  done this way): mid-transition screenshot shows the hard left-to-right wipe
  with the outgoing page lifting away; `finished` resolved in 1537ms normal
  motion vs 333ms under emulated `prefers-reduced-motion` (keyframes
  neutralized); zero page errors.
- Screenshots: `qa-shots/vt-mid1.png`, `qa-shots/vt-mid2.png`.

## 2026-09-27 - Feature 3: Footer terminal easter egg

**Added**
- `assets/js/terminal.js`: a working fake shell in the footer (`visitor@saiprasad:~$`).
  Commands: `help`, `whoami`, `ls`, `sudo` ("nice try."), `rm*` ("this is a static
  site. there is nothing to delete."), `paranoid` ("always."), `hello`, `clear`,
  `exit`/`quit`, `vim`/`emacs`/`nano` ("no."), plus `command not found` fallback.
  Up/down arrows cycle history; output capped at 24 lines; `aria-live="polite"`;
  all output built with textContent (XSS-safe).
- `_includes/footer.html`: terminal block between the link grid and the colophon.
  Without JS a static `visitor@saiprasad:~$ stay paranoid` line shows instead.
- `_sass/_chrome.scss`: theme-token terminal styles; 16px input (no iOS zoom);
  prompt turns accent on focus-within as the focus indicator.

**Verified**
- Chromium mirror QA: help/sudo/rm/whoami/unknown/clear all respond correctly;
  history recall works; `<img onerror>` payload rendered as inert text (zero
  `img` elements); no-JS shows the static fallback; 390px has no horizontal
  scroll with a 16px input; zero page errors.
- Screenshots: `qa-shots/foot-terminal.png`, `qa-shots/foot-terminal-390.png`.

## 2026-09-27 - Fix: post numbering runs oldest-first

**Changed**
- `_includes/post-card.html`: card numerals were `forloop.index` over the
  newest-first `site.posts`, so the newest post was №1 and the oldest №38.
  Now `№{{ site.posts | size | minus: forloop.index | plus: 1 }}` - the oldest
  post is №1 and the newest is №38. Computed against the full post count so the
  homepage (limit 6) and `/posts/` agree.

**Verified**
- Chromium mirror QA: `/posts/` shows №38 down to №1, strictly sequential across
  all 38 cards; homepage shows №38 to №33. Screenshot
  `qa-shots/post-numbering.png`.

## 2026-09-27 - Feature 2: Series reading progress

**Added**
- `assets/js/series.js`: localStorage-backed reading progress (`redline.series.read.v1`
  holds completed part numbers; no network, no cookies). Marks `.series-step`
  cards read (filled accent marker + "· read" status suffix), updates every
  `[data-series-read-count]` and the read-progress bar. Toggle control on series
  post pages (`_layouts/post.html`, `[data-series-check]`, `hidden` until JS runs):
  "Mark part N complete" <-> "Part N complete - tap to undo", `aria-pressed`,
  persists across reloads. Published count now computed in Liquid
  (`site.data.series | where: "status", "published" | size`) - the old
  `site.series_done` key never existed, so the live site showed an empty count.
- `_includes/series-tracker.html`: `data-part` on each step, `.step-read` marker,
  "X / 7 read" line + read bar under the published progress.
- `_layouts/home.html`: hero meta now shows "N/7 published" and "N/7 read"
  (both live counts).
- `_sass/_home.scss` / `_sass/_post.scss`: read markers, read bar (ink-colored,
  distinct from the red published bar), and the dashed `.series-check` control -
  strictly theme tokens; bar animation covered by the global reduced-motion
  kill-switch.

**Verified**
- Chromium mirror QA: fresh load shows "1 / 7 published" (fix confirmed) and
  "0 / 7 read"; with `[1]` in storage shows "1 / 7 read", filled red marker on
  step 01, "published · read" status, 14.3% read bar; control toggles, untoggles,
  and persists across reload; zero page errors.
- 390px: no horizontal scroll; hero meta wraps to 4 clean items.
- Ink + paper themes legible; reduced-motion emulation clean.
- Screenshots: `qa-shots/series-tracker-read.png`, `qa-shots/series-check-done.png`,
  `qa-shots/series-390.png`.
- Local-mirror LCP median 328ms over three runs vs 276ms pre-feature - within
  run-to-run noise, no meaningful regression (deferred 2.7KB script).

## 2026-09-27 - Diagram recolor (final): cream/red per user decision

**Changed**
- Re-applied the cream/red diagram recolor (supersedes the 2026-09-27 revert that
  had restored terminal green). Diagrams now use strictly the site palette:
  near-black `#0E0B0B` panels, 1px cream `#EFE8DC` strokes/labels, red `#FF4D2E`
  entry nodes and danger boundaries, red dashed gates, amber kept only on
  warn-level trust markers. `table.spec-table` headers back to site red.
- Green `#4ADE80` is no longer used anywhere on the site (verified: zero matches
  in `_sass/`, `_includes/`, `_data/`).

**Verified**
- Diagram SCSS compiles clean (libsass); zero `4ade80` references in output CSS.
- Rendered the `agent-loop` diagram in Chromium: red entry node, cream edges and
  labels, amber-free in this diagram; screenshot `qa-shots/diagram-recolor.png`.

## 2026-09-27 - Feature 1: Terminal command palette

**Added**
- `search.json` (repo root): build-time Liquid index of all posts - title, url,
  tags, excerpt, body (stripped/truncated). No Jekyll plugins. `sitemap: false`.
- `search.md` (`/search/`): no-JS fallback page - static full post index with a
  plain GET form; client-side filtering + `?q=` support when JS is present.
- `_includes/palette.html`: terminal-styled `role="dialog"` palette (accent `>`
  prompt, mono input, `esc` kbd hint, `aria-activedescendant` results).
- `assets/js/palette.js`: lazy index fetch (first open only); ranking
  title(10) > tags(6) > excerpt(3) > body(1) with title word-prefix bonus;
  `↑/↓/↵/esc` keyboard nav; `Cmd/Ctrl+K` toggle; backdrop-click close; focus
  restore; body scroll lock while open. XSS-safe DOM construction (textContent).
- `_sass/_palette.scss`: strictly theme tokens (`--bg-raise`, `--line`,
  `--ink`, `--accent`, `--font-mono`, `--radius`); legible in ink and paper;
  no palette-specific animation (covered by the global reduced-motion kill-switch).
- Header: `>_` search trigger (plain link to `/search/` without JS; opens the
  palette with JS). Mobile ≤640px: trigger collapses to `>_` and nav gap
  20px -> 16px so the 5th nav item fits at 390px.

**Verified**
- Ranking unit tests (Node, 7 cases): title match outranks body-only 15:1;
  tag/excerpt/body matches; multi-token; prefix; empty query. All pass.
- `search.json` Liquid renders valid JSON (python-liquid mock render, incl.
  quoted titles, null tags, truncated bodies).
- Full `main.scss` compiles (libsass); palette styles present in output.
- Chromium mirror QA (file://, live HTML + real fonts): palette opens via
  click and `Cmd+K`; query `agent` returns ranked results; `Enter` navigates;
  `esc`/backdrop/`Cmd+K` close; focus restored; `aria-activedescendant`
  follows arrow keys; zero console/page errors.
- Screenshots: header trigger, results (ink), results (paper), mobile 390px
  (no horizontal page scroll; palette usable).
- LCP before/after (local mirror, 1440px, 3 runs each): 208ms / 208ms median.
  No regression - the index is lazy-fetched and the script is deferred.
- Regression: preloader/cursor/ticker/series-scroll includes untouched;
  mobile header overflow caused by the 5th nav item found and fixed.
- Not verifiable locally: `bundle exec jekyll serve` (apt locked, no Ruby) -
  will confirm via the GitHub Pages build after push.

## 2026-09-27 - Feature 1 follow-up: palette device-compatibility pass

**Fixed**
- The palette's input row was hidden under the fixed header on phones and
  short landscape viewports. Backdrop top padding now always clears the
  header: `max(12vh, 96px)` desktop, `max(8vh, 160px)` under 640px.
- Mobile search trigger was a 17x26px tap target. Now 45x42px via padding
  with compensating negative margin - no nav layout shift at 320px.
- `Escape` now closes the palette document-wide (previously only when the
  input had focus).
- Touch devices: decorative `esc` pill hidden; kbd hint swapped for
  "tap a result to open - tap outside to dismiss" via
  `(hover: none) and (pointer: coarse)`.

**Verified**
- 9-device Chromium sweep (320/360/390/428px phones, 844x390 landscape,
  768/834px tablets, 1024px laptop, 1440px desktop): no horizontal page
  scroll; trigger visible; palette opens (tap / Cmd+K); dialog fits;
  input 16px (no iOS auto-zoom); query `agent` returns 5 ranked results;
  tap result opens link; `esc`/backdrop close; ink + paper themes legible.
- `/search/` page at 390px and 1440px: 38 items, live filter
  ("5 of 38 posts"), no horizontal scroll, 16px input.
- Screenshots: palette open with results at 390px (input row visible,
  touch hint shown), `/search/` at 390px.
- LCP (local mirror, 1440px, 5 runs): 276ms median post-fix vs 436ms
  pre-fix median - no regression (high run-to-run variance both ways).
- Zero console/page errors attributable to the palette on any device.
- Pushed via Git Data API as remote `fdd43c2b`; verified live in production
  CSS/JS/HTML.
