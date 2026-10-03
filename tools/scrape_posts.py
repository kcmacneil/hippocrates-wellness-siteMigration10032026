#!/usr/bin/env python3
"""Scrape the live Elementor single-post template for every blog post.

Stores the cleaned `data-elementor-type="single-post"` block as `content_live`
in content/posts/<slug>.json, plus `css_live` (per-post Elementor stylesheets
the page needs beyond the global kit/header/footer/popups). Mirrors any newly
referenced CSS (and the fonts/images its url()s point to) and missing upload
images under public/. Posts that fail keep their backup-extracted fallback.

Usage: python tools/scrape_posts.py [slug ...]
"""
import concurrent.futures, json, os, re, sys, time, urllib.error, urllib.parse, urllib.request
from scrape_live import ROOT, SITE, UA, extract_div, clean, save_css, seen_css
from scrape_popups import rewrite_actions

WORKERS = 6
PUBLIC = os.path.join(ROOT, 'public')
POSTS = os.path.join(ROOT, 'content', 'posts')
# Stylesheets already loaded site-wide (app/layout.jsx, components/Chrome.jsx)
GLOBAL_CSS = {'post-7.css', 'post-10859.css', 'post-10885.css', 'post-2520.css', 'post-3544.css'}

def get(url, binary=False, retries=5):
    """Fetch with retry on 404/5xx/network errors; returns (data, error)."""
    err = None
    for i in range(retries):
        try:
            with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=40) as r:
                data = r.read()
            return (data if binary else data.decode('utf-8', 'replace')), None
        except urllib.error.HTTPError as e:
            err = f'HTTP {e.code}'
            if e.code != 404 and e.code < 500 and e.code != 429:
                break
        except Exception as e:  # timeouts, resets
            err = repr(e)
        time.sleep(2 * (i + 1))
    return None, err

def minify(s):
    s = re.sub(r'<!--(?!\[).*?-->', '', s, flags=re.S)
    return re.sub(r'[ \t\r]*\n\s*', '\n', s).strip()

def strip_forms(s):
    s = re.sub(r'<div class="wpcf7[^"]*"[^>]*>.*?</div>\s*</div>', '', s, flags=re.S)
    return re.sub(r'<form\b[^>]*>.*?</form>', '', s, flags=re.S)

def mirror(rel):
    """Download a root-relative asset to public/ if missing. Returns ok."""
    rel = urllib.parse.unquote(rel.split('?')[0].split('#')[0])
    dest = os.path.join(PUBLIC, rel.lstrip('/'))
    if os.path.exists(dest):
        return True
    data, err = get(SITE + urllib.parse.quote(rel), binary=True, retries=3)
    if data is None:
        print('ASSET FAIL', rel, err)
        return False
    os.makedirs(os.path.dirname(dest), exist_ok=True)
    open(dest, 'wb').write(data)
    return True

def mirror_css_assets(rel):
    """Mirror fonts/images referenced by url() inside a mirrored stylesheet."""
    path = os.path.join(PUBLIC, rel.lstrip('/'))
    if not os.path.exists(path):
        return
    css = open(path, encoding='utf-8', errors='replace').read()
    base = SITE + rel
    for u in re.findall(r'url\(\s*["\']?([^"\')]+)["\']?\s*\)', css):
        if u.startswith('data:'):
            continue
        absu = urllib.parse.urljoin(base, u)
        if absu.startswith(SITE + '/'):
            mirror(absu[len(SITE):])

def scrape(slug):
    html, err = get(f'{SITE}/{slug}/')
    if not html:
        return slug, None, err
    block = extract_div(html, 'data-elementor-type="single-post"')
    tpl = None
    if block:
        tpl = re.search(r'data-elementor-id="(\d+)"', block).group(1)
    else:
        # A few posts are excluded from the template and render bare content
        # between the header and footer; mirror that as-is.
        header = extract_div(html, 'data-elementor-type="header"')
        foot = html.find('data-elementor-type="footer"')
        if header and foot > 0:
            seg = html[html.find(header) + len(header):html.rfind('<', 0, foot)].strip()
            if seg.startswith('<p') or seg.startswith('<h'):
                block = f'<div class="hw-bare-post">{seg}</div>'
        if not block:
            return slug, None, 'no single-post template'
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
    page = minify(rewrite_actions(strip_forms(clean(block))))
    return slug, {'content_live': page, 'template_id': tpl, 'css_live': css}, None

def main():
    slugs = sys.argv[1:] or [e['slug'] for e in json.load(open(os.path.join(ROOT, 'content', 'index-posts.json'), encoding='utf-8'))]
    print('posts:', len(slugs))
    ok, failed, done = 0, [], 0
    with concurrent.futures.ThreadPoolExecutor(max_workers=WORKERS) as ex:
        for slug, res, err in ex.map(scrape, slugs):
            done += 1
            if res:
                f = os.path.join(POSTS, slug + '.json')
                d = json.load(open(f, encoding='utf-8'))
                d.update(res)
                json.dump(d, open(f, 'w', encoding='utf-8'), ensure_ascii=False)
                ok += 1
            else:
                failed.append((slug, err))
                print('FAIL', f'{SITE}/{slug}/', err)
            if done % 50 == 0:
                print(done, 'ok', ok, 'failed', len(failed), flush=True)
    print('ok:', ok, 'failed:', len(failed), 'new css:', sorted(seen_css))
    json.dump([{'url': f'{SITE}/{s}/', 'error': e} for s, e in failed],
              open(os.path.join(ROOT, 'tools', 'scrape_posts_failures.json'), 'w'), indent=1)

if __name__ == '__main__':
    main()
