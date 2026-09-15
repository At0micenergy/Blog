---
layout: page
title: My Blog
description: Cybersecurity writeups covering incident response, digital forensics, and hands-on labs.
permalink: /blog/
---

<p class="archive-intro">Browse all {{ site.posts.size }} writeups, from incident response investigations to hands-on security labs. <a href="{{ '/tags/' | relative_url }}">Explore by topic</a> or <a href="{{ '/feed.xml' | relative_url }}">follow the RSS feed</a>.</p>

{% assign posts_by_year = site.posts | group_by_exp: 'post', 'post.date | date: "%Y"' %}
{% for year in posts_by_year %}
<section class="archive-year" aria-labelledby="year-{{ year.name }}">
  <h2 id="year-{{ year.name }}">{{ year.name }} <span class="archive-count">{{ year.items.size }} writeups</span></h2>
  <ul class="archive-list">
    {% for post in year.items %}
    <li class="archive-item">
      <time datetime="{{ post.date | date_to_xmlschema }}">{{ post.date | date: "%b %-d" }}</time>
      <div>
        <h3><a href="{{ post.url | relative_url }}">{{ post.title | escape }}</a></h3>
        <p>{{ post.description | default: post.excerpt | strip_html | normalize_whitespace | truncate: 180 | escape }}</p>
        {% if post.tags.size > 0 %}
        <ul class="archive-tags" aria-label="Topics">
          {% for tag in post.tags %}
          <li><a href="{{ '/tags/' | relative_url }}#{{ tag | cgi_escape | cgi_escape }}">{{ tag | escape }}</a></li>
          {% endfor %}
        </ul>
        {% endif %}
      </div>
    </li>
    {% endfor %}
  </ul>
</section>
{% endfor %}
