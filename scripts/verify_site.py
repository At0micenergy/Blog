#!/usr/bin/env python3
"""Check the rendered Jekyll site: search, feeds, images and tag links.

Run after building: python3 scripts/verify_site.py _site
"""
import json
import re
import sys
import xml.etree.ElementTree as ET
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlsplit


class Page(HTMLParser):
    def __init__(self, source):
        super().__init__(convert_charrefs=True)
        self.ids = set()
        self.links = []
        self.assets = []
        self.classes = set()
        self.h1s = []
        self.in_h1 = False
        self.feed(source)

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if attrs.get('id'):
            self.ids.add(attrs['id'])
        self.classes.update(attrs.get('class', '').split())
        if tag == 'a' and 'href' in attrs:
            self.links.append(attrs['href'])
        if tag in ('img', 'script') and 'src' in attrs:
            self.assets.append(attrs['src'])
        self.assets.extend(re.findall(r'url\([\'"]?([^\)\'"\s]+)', attrs.get('style', '')))
        if tag == 'h1':
            self.h1s.append('')
            self.in_h1 = True

    def handle_endtag(self, tag):
        if tag == 'h1':
            self.in_h1 = False

    def handle_data(self, data):
        if self.in_h1:
            self.h1s[-1] += data


def verify(root):
    errors = []
    pages = {path.relative_to(root).as_posix(): Page(path.read_text())
             for path in root.rglob('*.html')}
    for required in ('index.html', 'about/index.html', 'tags/index.html', '404.html'):
        if required not in pages:
            errors.append(f'Missing page: {required}')
    if (root / 'blog').exists():
        errors.append('The /blog/ endpoint must not be generated')
    search = json.loads((root / 'search.json').read_text())
    if not search:
        errors.append('Search index is empty')
    search_urls = [post['url'] for post in search]
    if len(set(search_urls)) != len(search_urls):
        errors.append('Duplicate post URLs in the search index')
    for post in search:
        if not (root / unquote(post['url']).lstrip('/') / 'index.html').is_file():
            errors.append(f'Post URL does not exist: {post["url"]}')
    feed = ET.parse(root / 'feed.xml')
    items = feed.findall('./channel/item')
    if len(items) != min(20, len(search)):
        errors.append('RSS feed does not contain the latest posts')
    for item in items:
        if not item.findtext('link', '').startswith('https://saiprasad-cybsec.com/'):
            errors.append('RSS item has an incorrect absolute URL')
    tags = pages.get('tags/index.html')
    checked_images = checked_tags = 0
    for name, page in pages.items():
        if 'preloader' in page.classes:
            errors.append(f'Blocking preloader remains: {name}')
        for asset in page.assets:
            parsed = urlsplit(asset)
            if parsed.scheme or parsed.netloc:
                continue
            path = unquote(parsed.path)
            target = root / path.lstrip('/') if path.startswith('/') else root / Path(name).parent / path
            checked_images += 1
            if not path or not target.is_file():
                errors.append(f'Missing local asset: {name} -> {asset}')
        for link in page.links:
            parsed = urlsplit(link)
            if parsed.netloc or parsed.scheme or not parsed.fragment:
                continue
            if parsed.path.rstrip('/') == '/tags' or (name == 'tags/index.html' and not parsed.path):
                checked_tags += 1
                if tags and unquote(parsed.fragment) not in tags.ids:
                    errors.append(f'Broken tag anchor: {name} -> {link}')
    if errors:
        for error in sorted(set(errors)):
            print('FAIL:', error)
        return 1
    print(f'PASS: {len(pages)} pages, {len(search)} posts, {checked_images} local asset references, '
          f'{checked_tags} tag links, and {len(items)} RSS entries.')
    return 0


if __name__ == '__main__':
    sys.exit(verify(Path(sys.argv[1] if len(sys.argv) > 1 else '_site').resolve()))
