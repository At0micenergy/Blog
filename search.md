---
layout: page
title: Search
permalink: /search/
eyebrow: find
standfirst: Every post, indexed at build time. Type below to filter - or browse the full list.
sitemap: false
---

<form class="search-page-form" role="search" action="{{ '/search/' | relative_url }}" method="get">
  <label class="search-page-label" for="search-page-input"><span aria-hidden="true">&gt;</span> search posts<span class="search-page-cursor" aria-hidden="true">_</span></label>
  <input class="search-page-input" id="search-page-input" name="q" type="search" autocomplete="off" spellcheck="false">
  <button class="search-page-run" type="submit">run</button>
</form>
<p class="search-page-count" id="search-page-count" aria-live="polite"></p>
<ul class="search-page-list" id="search-page-results">
{% for post in site.posts %}
  <li class="search-page-item" data-url="{{ post.url | relative_url }}">
    <a class="search-page-title" href="{{ post.url | relative_url }}">{{ post.title }}</a>
    {% if post.tags %}<p class="search-page-tags">{{ post.tags | join: ", " }}</p>{% endif %}
    <p class="search-page-excerpt">{{ post.excerpt | strip_html | strip_newlines | truncate: 160 }}</p>
  </li>
{% endfor %}
</ul>
<noscript>
  <p class="search-page-note">JavaScript is off, so this page lists every post - use your browser's find-in-page to jump to one.</p>
</noscript>
