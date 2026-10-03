#!/usr/bin/env python3
"""Create docs for live pages that were renamed/moved after the backup.

For each (old doc, new live path) pair, scrape the live page at its new URL into
a NEW doc (content_live/css_live, SEO from the live <head>), keeping the old
doc's metadata. The old path is then redirected in content/redirects.json.
Existing docs are never rewritten.

Usage: python tools/scrape_new_pages.py
"""
import html as htmlmod, json, os, re, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from scrape_live import ROOT, SITE, extract_div, clean, save_css, seen_css
from scrape_popups import rewrite_actions
from scrape_posts import GLOBAL_CSS, get, minify, strip_forms, decode_cf_emails, mirror, mirror_css_assets

CONTENT = os.path.join(ROOT, 'content')
# (collection, old doc file stem, new live path)
MOVES = [
    ('pages', 'the-resort-2', 'the-resort'),
    ('pages', 'accommodation-categories', 'the-resort/accommodation-categories'),
    ('pages', 'accommodation-categories__economy', 'the-resort/accommodation-categories/economy'),
    ('pages', 'accommodation-categories__executive-suites', 'the-resort/accommodation-categories/executive-suites'),
    ('pages', 'accommodation-categories__royal-palm-villas', 'the-resort/accommodation-categories/royal-palm-villas'),
    ('pages', 'subscription-thank-you-page', 'thank-you'),
    ('pages', 'health-challenges__weight-loss-2', 'health-challenges/weight-loss'),
    ('resort', 'building-multigenerational-generational-health-2', 'building-multigenerational-generational-health-october-4'),
]
SITE_SUFFIX = re.compile(r'\s+[-|\u2013]\s+Hippocrates Wellness$')

def meta(html, attr, name):
    for tag in re.findall(r'<meta\b[^>]*>', html):
        if re.search(r'%s=["\']%s["\']' % (attr, re.escape(name)), tag):
            m = re.search(r'content=["\']([^"\']*)["\']', tag)
            if m:
                return htmlmod.unescape(m.group(1)).strip() or None
    return None

def mirror_uploads(page):
    for u in set(re.findall(r'(/wp-content/uploads/[^"\'\s,)]+)', page)):
        mirror(u)

def scrape(path, marker):
    html, err = get(f'{SITE}/{path}/')
    if not html:
        raise SystemExit(f'FAIL {path}: {err}')
    block = extract_div(html, marker)
    if not block:
        raise SystemExit(f'FAIL {path}: no {marker}')
    css = []
    for href in re.findall(r"<link[^>]+rel=['\"]stylesheet['\"][^>]+href=['\"]([^'\"]+)['\"]", html):
        before = set(seen_css)
        save_css(href)
        for rel in set(seen_css) - before:
            mirror_css_assets('/' + rel)
        m = re.search(r'/wp-content/uploads/elementor/css/(post-\d+\.css)', href)
        if m and m.group(1) not in GLOBAL_CSS:
            css.append('/wp-content/uploads/elementor/css/' + m.group(1))
    page = minify(decode_cf_emails(rewrite_actions(strip_forms(clean(block)))))
    mirror_uploads(page)
    title = re.search(r'<title>(.*?)</title>', html, re.S)
    title = SITE_SUFFIX.sub('', htmlmod.unescape(title.group(1)).strip()) if title else None
    canonical = re.search(r'<link[^>]+rel=["\']canonical["\'][^>]+href=["\']([^"\']+)', html)
    seo = {
        'seoTitle': title,
        'seoDesc': meta(html, 'name', 'description'),
        'canonical': canonical.group(1) if canonical else None,
        'ogTitle': meta(html, 'property', 'og:title'),
        'ogDesc': meta(html, 'property', 'og:description'),
    }
    tpl = re.search(r'data-elementor-id="(\d+)"', block).group(1)
    return page, list(dict.fromkeys(css)), seo, tpl

def main():
    indexes = {}
    for coll, stem, path in MOVES:
        dest = os.path.join(CONTENT, coll, path.replace('/', '__') + '.json')
        if os.path.exists(dest):
            print('exists, skipped', dest)
            continue
        doc = json.load(open(os.path.join(CONTENT, coll, stem + '.json'), encoding='utf-8'))
        marker = 'data-elementor-type="wp-page"' if coll == 'pages' else 'data-elementor-type="single-post"'
        page, css, seo, tpl = scrape(path, marker)
        doc.update(slug=path.split('/')[-1], path=path, **seo)
        doc['content_live'] = page
        doc['css_live'] = css
        if coll != 'pages':
            doc['template_id'] = tpl
        json.dump(doc, open(dest, 'w', encoding='utf-8'), ensure_ascii=False)
        idx = indexes.setdefault(coll, json.load(open(os.path.join(CONTENT, f'index-{coll}.json'), encoding='utf-8')))
        old = next((e for e in idx if e['path'] == doc['path']), None)
        if not old:
            src = next(e for e in idx if e['slug'] == stem.split('__')[-1] and e['id'] == doc['id'])
            idx.append({**src, 'slug': doc['slug'], 'path': path})
        print('ok', path, len(page), css, seo['seoTitle'])
    for coll, idx in indexes.items():
        json.dump(idx, open(os.path.join(CONTENT, f'index-{coll}.json'), 'w', encoding='utf-8'), ensure_ascii=False)
    print('new css:', sorted(seen_css))

if __name__ == '__main__':
    main()
