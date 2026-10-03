#!/usr/bin/env python3
"""Scrape live Elementor markup for every doc that still lacks `content_live`.

Covers the custom post types (podcasts, recipes, magazines, resort, journeys,
experts, newsletters, flipbooks, ...) plus leftover pages/posts. For each URL
the content block is picked in this order:

1. an Elementor theme-builder/page block (single-post, single-page, single,
   wp-page, wp-post);
2. the hello-elementor theme's `<main id="content">` (non-Elementor pages);
3. whatever sits between the header and footer templates (elementor canvas
   pages, possibly empty);
4. for pages with no header/footer at all, the whole <body> (minus popups).

The block is cleaned exactly like tools/scrape_posts.py and written as
`content_live` + `css_live` (+ `template_id`, `live_id`) to every doc sharing
that URL. Newly referenced CSS (with its fonts) and missing upload media are
mirrored under public/. URLs that redirect off-site are recorded and skipped;
failures keep the backup fallback. Report: tools/scrape_cpts_failures.json.

Usage: python tools/scrape_cpts.py [path ...]
"""
import collections, concurrent.futures, json, os, re, sys, time, urllib.error, urllib.parse, urllib.request
from scrape_live import ROOT, SITE, UA, extract_div, clean, save_css, seen_css
from scrape_popups import rewrite_actions
from scrape_posts import GLOBAL_CSS, PUBLIC, WORKERS, minify, strip_forms, decode_cf_emails, mirror, mirror_css_assets

CONTENT = os.path.join(ROOT, 'content')
COLLECTIONS = ['pages', 'posts', 'podcasts', 'recipes', 'magazines', 'resort', 'journeys',
               'experts', 'learning-centre', 'newsletters', 'flipbooks', 'resort-cpt']
TEMPLATE_TYPES = ['single-post', 'single-page', 'single', 'wp-page', 'wp-post']
MEDIA_RE = re.compile(r'/wp-content/uploads/[^"\'\s<>()]+?\.(?:jpe?g|png|gif|webp|avif|svg|ico|mp4|webm)', re.I)
MAX_MEDIA = 50 * 1024 * 1024  # stay well under GitHub's 100 MB file limit

class _NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, *a, **k):
        return None

_opener = urllib.request.build_opener(_NoRedirect)

def get_page(url, retries=5, hops=3):
    """Fetch HTML without auto-following redirects. Returns (html, error, final_url)."""
    err = None
    for i in range(retries):
        try:
            with _opener.open(urllib.request.Request(url, headers=UA), timeout=40) as r:
                return r.read().decode('utf-8', 'replace'), None, url
        except urllib.error.HTTPError as e:
            if e.code in (301, 302, 303, 307, 308):
                loc = urllib.parse.urljoin(url, e.headers.get('Location', ''))
                if not loc.startswith(SITE + '/'):
                    return None, f'offsite redirect -> {loc}', loc
                if hops == 0:
                    return None, 'redirect loop', loc
                return get_page(loc, retries, hops - 1)
            err = f'HTTP {e.code}'
            if e.code != 404 and e.code < 500 and e.code != 429:
                break
        except Exception as e:  # timeouts, resets
            err = repr(e)
        time.sleep(2 * (i + 1))
    return None, err, url

def strip_popups(s):
    while True:
        div = extract_div(s, 'data-elementor-type="popup"')
        if not div:
            return s
        s = s.replace(div, '')

def extract_block(html):
    """Return (block_html, template_id, kind) or (None, None, reason)."""
    for t in TEMPLATE_TYPES:
        block = extract_div(html, f'data-elementor-type="{t}"')
        if block:
            return block, re.search(r'data-elementor-id="(\d+)"', block).group(1), t
    m = re.search(r'<main\b[^>]*id="content"[^>]*>.*?</main>', html, flags=re.S)
    if m:  # our layout already provides <main>; keep id/classes on a div
        block = re.sub(r'^<main\b', '<div', m.group(0))
        return re.sub(r'</main>$', '</div>', block), None, 'theme-main'
    header = extract_div(html, 'data-elementor-type="header"')
    foot = html.find('data-elementor-type="footer"')
    if header and foot > 0:
        seg = html[html.find(header) + len(header):html.rfind('<', 0, foot)].strip()
        return f'<div class="hw-bare-page">{seg}</div>', None, 'between-chrome'
    if not header and foot < 0:
        m = re.search(r'<body\b[^>]*>(.*)</body>', html, flags=re.S)
        if m:
            body = re.sub(r'<script\b[^>]*>.*?</script>', '', m.group(1), flags=re.S)
            return f'<div class="hw-no-chrome">{strip_popups(body).strip()}</div>', None, 'no-chrome'
    return None, None, 'no content block found'

def mirror_media(block):
    missing = 0
    for rel in sorted(set(MEDIA_RE.findall(block))):
        dest = os.path.join(PUBLIC, urllib.parse.unquote(rel).lstrip('/'))
        if os.path.exists(dest):
            continue
        if rel.lower().endswith(('.mp4', '.webm')):
            try:
                req = urllib.request.Request(SITE + rel, headers=UA, method='HEAD')
                size = int(urllib.request.urlopen(req, timeout=40).headers.get('Content-Length') or 0)
            except Exception:
                size = MAX_MEDIA + 1
            if size > MAX_MEDIA:
                print('SKIP LARGE MEDIA', rel, size, flush=True)
                continue
        if not mirror(rel):
            missing += 1
    return missing

def scrape(path):
    url = f'{SITE}/{path}/'
    html, err, final = get_page(url)
    if not html:
        return path, None, err
    block, tpl, kind = extract_block(html)
    if not block:
        return path, None, kind
    links = re.findall(r"<link[^>]+rel=['\"]stylesheet['\"][^>]+href=['\"]([^'\"]+)['\"]", html)
    css = []
    for href in links:
        before = set(seen_css)
        save_css(href)
        for rel in set(seen_css) - before:
            mirror_css_assets('/' + rel)
        m = re.search(r'/wp-content/uploads/elementor/css/(post-\d+\.css)', href)
        if m and m.group(1) not in GLOBAL_CSS:
            css.append('/wp-content/uploads/elementor/css/' + m.group(1))
        elif kind == 'no-chrome':
            # standalone landing page: none of the site-wide CSS applies, so
            # carry over every stylesheet it links (off-site ones stay absolute)
            css.append(href.split('?')[0].replace(SITE, '') if SITE in href else href)
    page = minify(decode_cf_emails(rewrite_actions(strip_forms(clean(block)))))
    mirror_media(page)
    body = re.search(r'<body[^>]*class="[^"]*\b(?:postid|page-id)-(\d+)', html)
    res = {'content_live': page, 'template_id': tpl, 'css_live': list(dict.fromkeys(css)),
           'live_id': body.group(1) if body else None, 'live_kind': kind}
    if final != url:
        res['live_redirect'] = final.replace(SITE, '')
    return path, res, None

def missing_docs(only=None):
    by_path = collections.defaultdict(list)
    for col in COLLECTIONS:
        d = os.path.join(CONTENT, col)
        for f in sorted(os.listdir(d)):
            fp = os.path.join(d, f)
            doc = json.load(open(fp, encoding='utf-8'))
            if not doc.get('content_live') and (not only or doc['path'] in only):
                by_path[doc['path']].append((col, fp))
    return by_path

def main():
    by_path = missing_docs(set(sys.argv[1:]))
    print('urls:', len(by_path), 'docs:', sum(map(len, by_path.values())), flush=True)
    stats = collections.defaultdict(lambda: {'ok': 0, 'failed': 0})
    failures, done = [], 0
    with concurrent.futures.ThreadPoolExecutor(max_workers=WORKERS) as ex:
        for path, res, err in ex.map(scrape, list(by_path)):
            done += 1
            for col, fp in by_path[path]:
                if res:
                    d = json.load(open(fp, encoding='utf-8'))
                    d.update(res)
                    json.dump(d, open(fp, 'w', encoding='utf-8'), ensure_ascii=False)
                    stats[col]['ok'] += 1
                else:
                    stats[col]['failed'] += 1
                    failures.append({'collection': col, 'url': f'{SITE}/{path}/', 'error': err})
            if not res:
                print('FAIL', f'{SITE}/{path}/', err, flush=True)
            if done % 25 == 0:
                print(done, '/', len(by_path), flush=True)
    for col, s in sorted(stats.items()):
        print(f'{col:16} ok {s["ok"]:4}  failed {s["failed"]:4}')
    print('new css:', sorted(seen_css))
    json.dump({'stats': stats, 'failures': failures},
              open(os.path.join(ROOT, 'tools', 'scrape_cpts_failures.json'), 'w'), indent=1)

if __name__ == '__main__':
    main()
