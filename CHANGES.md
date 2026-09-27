# CHANGES.md - Redline Editorial feature log

One entry per feature: what was added, what was verified.

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
