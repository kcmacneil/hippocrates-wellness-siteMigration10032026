#!/usr/bin/env python3
"""Scrape the live taxonomy archive pages (/category/<slug>/, /resort-category/<slug>/,
/recipes-tag/<slug>/, /event-category/<slug>/) into content/archives/*.json.

WordPress generates these from the taxonomy terms, so the backup has no page for
them. Each live archive is cleaned like tools/scrape_cpts.py (Elementor archive
template, or the theme's <main> when there is none) and stored as a doc with
`content_live`, `css_live` and SEO fields from the live <head>. Pagination links
(/page/N/) found in the block are scraped too. Terms come from the backup's
categories plus every term used by an exported doc.

Usage: python tools/scrape_archives.py [path ...]
"""
import concurrent.futures, html as htmlmod, json, os, re, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from scrape_live import ROOT, SITE, extract_div, clean, save_css, seen_css
from scrape_popups import rewrite_actions
from scrape_posts import GLOBAL_CSS, WORKERS, minify, decode_cf_emails, mirror_css_assets
from scrape_cpts import COLLECTIONS, get_page, extract_block, mirror_media, strip_forms_keep_elementor
from scrape_new_pages import meta

CONTENT = os.path.join(ROOT, 'content')
OUT = os.path.join(CONTENT, 'archives')
# WordPress taxonomy -> public URL base
BASES = {'category': 'category', 'resort-category': 'resort-category',
         'recipes-tag': 'recipes-tag', 'event_category': 'event-category'}
SITE_SUFFIX = re.compile(r'\s+([-|\u2013])\s+Hippocrates Wellness$')

def term_paths():
    paths = {f'category/{c["slug"]}' for c in json.load(open(os.path.join(CONTENT, 'categories.json'), encoding='utf-8'))}
    for col in COLLECTIONS:
        d = os.path.join(CONTENT, col)
        for f in os.listdir(d):
            for tax, terms in (json.load(open(os.path.join(d, f), encoding='utf-8')).get('terms') or {}).items():
                if tax in BASES:
                    for t in terms if isinstance(terms, list) else [terms]:
                        slug = t.get('slug') if isinstance(t, dict) else t
                        if slug:
                            paths.add(f'{BASES[tax]}/{slug}')
    return sorted(paths)

def scrape(path):
    url = f'{SITE}/{path}/'
    html, err, final = get_page(url)
    if not html:
        return path, None, err
    if final.rstrip('/') != url.rstrip('/'):
        return path, None, f'redirects -> {final}'
    block = extract_div(html, 'data-elementor-type="archive"')
    tpl = re.search(r'data-elementor-id="(\d+)"', block).group(1) if block else None
    if not block:
        block, tpl, kind = extract_block(html)
        if not block:
            return path, None, kind
    css = []
    for href in re.findall(r"<link[^>]+rel=['\"]stylesheet['\"][^>]+href=['\"]([^'\"]+)['\"]", html):
        before = set(seen_css)
        save_css(href)
        for rel in set(seen_css) - before:
            mirror_css_assets('/' + rel)
        m = re.search(r'/wp-content/uploads/elementor/css/(post-\d+\.css)', href)
        if m and m.group(1) not in GLOBAL_CSS:
            css.append('/wp-content/uploads/elementor/css/' + m.group(1))
    dyn = re.search(r'<style\b[^>]*id="elementor-frontend-inline-css"[^>]*>(.*?)</style>', html, flags=re.S)
    if dyn and dyn.group(1).strip():
        block = f'<style>{dyn.group(1).strip()}</style>{block}'
    page = minify(decode_cf_emails(rewrite_actions(strip_forms_keep_elementor(clean(block)))))
    mirror_media(page)
    title = re.search(r'<title>(.*?)</title>', html, re.S)
    title = htmlmod.unescape(title.group(1)).strip() if title else path
    sep = SITE_SUFFIX.search(title)
    canonical = re.search(r'<link[^>]+rel=["\']canonical["\'][^>]+href=["\']([^"\']+)', html)
    term = re.search(r'<body[^>]*class="[^"]*\b(?:term|category)-(\d+)\b', html)
    doc = {
        'id': term.group(1) if term else path, 'type': 'archive', 'slug': path.split('/')[-1], 'path': path,
        'title': SITE_SUFFIX.sub('', title),
        # live titles that use "|" are kept verbatim; "-" matches the site template
        'seoTitleAbsolute': title if sep and sep.group(1) != '-' else None,
        'seoTitle': SITE_SUFFIX.sub('', title), 'seoDesc': meta(html, 'name', 'description'),
        'canonical': canonical.group(1).replace(SITE, '') if canonical else None,
        'ogTitle': meta(html, 'property', 'og:title'), 'ogDesc': meta(html, 'property', 'og:description'),
        'terms': {}, 'content_live': page, 'template_id': tpl, 'live_id': tpl,
        'css_live': list(dict.fromkeys(css)),
    }
    # the pager only links a window of pages (1 2 3 … 55): queue every page up to the last
    base = re.sub(r'/page/\d+$', '', path)
    nums = [int(n) for n in re.findall(r'href="/%s/page/(\d+)/"' % re.escape(base), page)]
    more = [f'{base}/page/{n}' for n in range(2, max(nums) + 1)] if nums else []
    return path, doc, more

def main():
    os.makedirs(OUT, exist_ok=True)
    todo, seen, failures = list(sys.argv[1:] or term_paths()), set(), []
    while todo:
        batch = [p for p in dict.fromkeys(todo) if p not in seen]
        seen.update(batch)
        todo = []
        with concurrent.futures.ThreadPoolExecutor(max_workers=WORKERS) as ex:
            for path, doc, extra in ex.map(scrape, batch):
                if not doc:
                    print('FAIL', path, extra, flush=True)
                    failures.append({'path': path, 'error': extra})
                    continue
                json.dump(doc, open(os.path.join(OUT, path.replace('/', '__') + '.json'), 'w', encoding='utf-8'),
                          ensure_ascii=False)
                print('ok', path, len(doc['content_live']), doc['css_live'], doc['seoTitleAbsolute'] or doc['seoTitle'], flush=True)
                todo += extra
    print('failures:', failures)
    print('new css:', sorted(seen_css))

if __name__ == '__main__':
    main()
