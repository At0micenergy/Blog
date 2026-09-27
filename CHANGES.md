# CHANGES.md - Redline Editorial feature log

One entry per feature: what was added, what was verified.

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
