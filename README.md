# At0micenergy blog

A Jekyll blog for cybersecurity writeups at https://saiprasad-cybsec.com/.

## Local development

Use Ruby 3.2 or 3.3 and Bundler. Jekyll is pinned to the 3.10 release used by GitHub Pages.

```sh
bundle install
bundle exec jekyll serve
```

Open the local address printed by Jekyll. The production domain in `_config.yml` is used for canonical links, sharing and the RSS feed.

## Verify a change

```sh
bundle exec jekyll build
python3 scripts/verify_site.py _site
node --check js/common.js
```

The site check verifies that every post appears in the archive and search index, the RSS feed parses, local images and scripts exist, tag links reach their sections, and the archive does not contain the old timestamp log or a blank image banner.

## Content and settings

- Writeups live in `_posts/`. Preserve their existing URLs when editing.
- `blog.md` generates the archive automatically from the posts, grouped by year.
- `tags.html` generates topic lists. Tag IDs preserve the existing CGI-encoded names; links encode those IDs for URL fragments, including tags with spaces or `&`.
- Pages can omit `image` to display without a banner. An optional author avatar must name an existing file in `img/`.
- The newsletter form is displayed only when `mailchimp` has a form endpoint in `_config.yml`. No newsletter service is configured by default.
- `feed.xml` publishes the latest 20 posts as RSS.
- Search and menu controls support keyboard focus, Escape and focus return. Images and article content remain visible without waiting for JavaScript or every image download.

## Publishing

Review and merge changes into the branch configured in the repository's GitHub Pages settings. A local build or a branch commit does not by itself update the live website. Keep `CNAME` and the production `url` setting aligned with the existing domain.
