# CHANGES.md - Redline Editorial feature log

One entry per feature: what was added, what was verified.

## 2026-09-27 - Post H2/H3 chapter treatment

**Added**
- `_sass/_post.scss`: every article H2 is now a "chapter" block - a kicker
  (`01`, `02`, ...) in 13px JetBrains Mono, red, letter-spaced, with a 24px
  hairline rule trailing it, rendered by a CSS `::before` using
  `counter(chapter, decimal-leading-zero)`. The counter is reset on
  `.post-article` and incremented per H2, so numbering is automatic and always
  matches document order. The heading itself moved from Inter 600 to
  Space Grotesk 600 at `cl(1.7rem, 3vw, 1.95rem)` with 60px top / 16px bottom
  margins (40px top at 390px). The old `border-top` divider is gone.
- H3s: Space Grotesk 500 at 1.3rem with a 16px red tick (`::before`) before
  the text. H4+ untouched.
- `assets/js/toc.js`: removed the JS-injected `.h2-no` `§NN` spans - numbering
  is now pure CSS, so kickers render even without JS. The script still assigns
  heading ids (unchanged slugs), builds the TOC, strips author hand-numbering
  ("1. ..."), and runs scrollspy. Pseudo-element kickers never enter
  `textContent`, so no TOC-text stripping is needed anymore.
- `_layouts/post.html`: post-foot tag links now point at the `/tags/<slug>/`
  archive pages instead of the removed `#slug` anchors on `/tags/`.

**Verified**
- Rendered the real `/ai-agent-architecture-basics/` post (14 H2s, 38 H3s)
  through the actual post layout: kickers render `01`-`14` in order; CSS
  counter order exactly matches TOC H2 order; all 14 heading ids unique and
  unchanged in form; author "N." prefixes stripped with no doubling.
- Chromium QA: scrollspy highlights the correct TOC link for H2s 1, 7 and 14;
  ink theme (cream Space Grotesk on #0E0B0B) and paper theme (ink on #EFE8DC)
  both legible, kicker stays #FF4D2E; 390px has zero horizontal overflow;
  zero page JS errors. Before/after screenshots at
  `~/workspace/blog-redesign/qa-shots/chapter-{before,after}-{ink,paper,390}.png`.
- Genuine `bundle exec jekyll serve` unavailable in this environment (no
  ruby); full `main.scss` compiles clean via libsass and `toc.js` passes
  `node --check`.

## 2026-09-27 - Feature 9: Tag archive pages

**Added**
- `_layouts/tag.html`: `/tags/<slug>/` archive pages - page-hero with `#tag`
  headline, post count, the shared post-card grid, and a back-to-all-tags link.
- `post-card.html` now accepts an optional `card_no` include param; the tag
  layout resolves each post's global number (oldest = №1) so archive cards show
  the exact № they carry on `/posts/`.
- `tags.html` is now an index: the tag cloud links out to the archive pages
  (the old inline per-tag anchor blocks were removed as redundant).
- `_sass/_pages.scss`: `.tag-block` styles replaced with `.back-link`.
- `~/workspace/blog-redesign/gen_tag_pages.py` (author-time generator, since
  GitHub Pages safe mode forbids custom plugins): normalizes post front-matter
  tags (strips stray whitespace, merges the `php File Upload`/`PHP File Upload`
  case duplicate), asserts zero slug collisions, and writes 70 `tags/*.md`
  files. Re-run after adding or removing tags.
- Tag hygiene fixed as a side effect: 32 posts had tags with leading/trailing
  spaces that created near-duplicate tag keys (`LFI` vs `LFI `).

**Verified**
- Genuine Jekyll unavailable in this environment (no ruby), so verified with the
  extended QA Liquid renderer: all 96 tag cards across 70 pages carry the exact
  № from `/posts/`; `/tags/` exposes 70 archive links.
- Chromium QA: `/tags/lfi/` renders the hero, 7 cards, back link; ink and paper
  themes legible; 390px shows no page-level horizontal overflow; zero page
  errors.

## 2026-09-27 - Feature 7: Scroll-velocity ticker

**Added**
- `assets/js/ticker.js`: takes over the tag marquee with a rAF loop. The strip
  drifts at its resting speed (~36s loop parity), accelerates up to 5x with
  scroll speed, and skews up to 10deg into the motion. Pauses on hover (now
  container-level, matching the original CSS `:hover` rule). The loop runs only
  while the ticker intersects the viewport (IntersectionObserver) and re-measures
  on resize; wrap-around is seamless because the tag list is rendered twice.
- `_sass/_chrome.scss`: `.ticker-track.is-live { animation: none; }` hands
  control to JS. Without JS the original CSS marquee runs unchanged.
- Reduced motion: the script bails before touching the DOM, so the existing
  CSS kill-switch governs.

**Verified**
- Chromium QA: rest drift ~80px/500ms; oscillating scroll burst (ticker kept in
  view) moved 185px/600ms = 1.9x speedup with skew up to 2.07deg reacting live;
  hover froze the strip at 0.00px/600ms; `is-live` present normally and absent
  under emulated `prefers-reduced-motion`; 390px shows no page-level horizontal
  overflow; zero page errors.
- Note: scroll *speed* (magnitude) drives the boost while signed velocity drives
  the skew, so rapid direction changes still accelerate the strip instead of
  cancelling out.

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

## QA audit fixes (2026-09-27)

Five issues from the 2026-09-27 site QA audit, fixed together.

**Fixed**
- DevGuru code fence (#1, high): added the missing blank line between
  `# Nmap` and the opening fence in `_posts/2021-04-14-DevGuru.md` -
  the raw nmap dump no longer renders inside the "Why read this" hook,
  no more 3899px horizontal overflow, meta description clean.
- Post images (#2, medium): all 150 markdown images across 31 posts now
  carry kramdown IALs with real pixel dimensions and `loading="lazy"`
  (e.g. `{: width="1282" height="601" loading="lazy"}`), injected by
  `~/workspace/blog-redesign/inject_img_dims.py` (idempotent; merges into
  existing IALs like `{: .normal}`; skips fenced code blocks). The four
  690KB+ PNGs were recompressed in place as 256-color palettes
  (MEDIANCUT, no dither): Wp-Scan.png 935->350KB, Creds.png 894->385KB,
  Venom/domain.png 704->288KB, alfa.png 691->264KB. Dimensions unchanged,
  so injected width/height stay valid. Spot-checked quantized output
  against the original - visually indistinguishable on screenshots.
- Hero scribble (#3, medium): path `stroke-width` 5 -> 2.5 with
  `vector-effect="non-scaling-stroke"` (uniform 2.5px under the
  non-uniform `preserveAspectRatio="none"` scale), `bottom` -0.12em ->
  -0.02em so the line hugs "advisories" instead of floating below it.
- Series nav (#4, low): `_layouts/post.html` now captures the prev/next
  links and only renders `<nav class="series-nav">` when non-empty -
  no more empty navigation landmark on part 1 of 7.
- Tag typos (#5, low): `SMPT LogFile Posining` -> `SMTP LogFile
  Poisoning`, `SSHLog file Posioning` -> `SSHLog file Poisoning`,
  `SSH/SOCAT PortForwording` -> `PortForwarding` (5 posts); regenerated
  tag archives (4 stale pages removed, 69 pages total; typo tags merged
  into the pre-existing correct `SSH PortForwarding`). Note: the audit's
  other two items (`SeImpersonatePrivilege`, `Deobfuscate`) are already
  spelled correctly in front matter - no change made. Body-text
  `PortForwording` headings left as author prose.

**Verified**
- QA renders (real layouts): nmap dump inside `<pre>` on DevGuru;
  `series-nav` absent from the architecture post; all 150 post images
  render with `width`/`height`/`loading="lazy"`; zero leaked `{:` literals;
  full SCSS compiles (compressed).
- Hero scribble at 390px: computed stroke 2.5px, `vector-effect`
  present, svg sits 1.3px below the word - thin underline hugging
  "advisories". Screenshot: `qa-shots/scribble-after-390.png`.
  (QA note: full-page screenshots taken after `scrollIntoView` showed a
  spurious "betore" - the hero scrolling under the fixed blurred header
  in headless Chromium. DOM, element screenshots, and unscrolled
  full-page shots all render "before" correctly; not a site bug.)
- `bundle exec jekyll serve` not run (Ruby/Jekyll unavailable in this
  environment); substituted libsass compile + real-layout renders.
