#!/usr/bin/env python3
"""Scrape rendered Elementor HTML + CSS from the live site for non-post docs."""
import io, json, os, re, sys, time, urllib.request, concurrent.futures

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
ROOT = r'C:\Users\Administrator\repos\hippocrates-wellness'
SITE = 'https://hippocrateswellness.org'
UA = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'}

def fetch(url, binary=False, retries=3):
    for i in range(retries):
        try:
            req = urllib.request.Request(url, headers=UA)
            with urllib.request.urlopen(req, timeout=40) as r:
                data = r.read()
            return data if binary else data.decode('utf-8', 'replace')
        except Exception as e:
            if i == retries - 1:
                print('FAIL', url, e)
                return None
            time.sleep(2 * (i + 1))

def extract_div(html, marker):
    """Return the full <div ...marker...>...</div> block, tag-balanced."""
    i = html.find(marker)
    if i < 0:
        return None
    start = html.rfind('<div', 0, i)
    depth, j = 0, start
    for m in re.finditer(r'<div\b|</div\s*>', html[start:]):
        pass
    pos = start
    tag_re = re.compile(r'<div\b[^>]*>|</div\s*>')
    while True:
        m = tag_re.search(html, pos)
        if not m:
            return None
        tok = m.group(0)
        if tok.startswith('</'):
            depth -= 1
            if depth == 0:
                return html[start:m.end()]
        else:
            depth += 1
        pos = m.end()

def clean(s):
    s = s.replace('https://hippocrateswellness.org/', '/')
    s = s.replace('http://hippocrateswellness.org/', '/')
    s = s.replace('https://hippocrateswellness.org', '')
    # strip elementor editor/JS noise that needs the WP runtime
    s = re.sub(r'<script\b[^>]*>.*?</script>', '', s, flags=re.S)
    return s

CSS_DIR = os.path.join(ROOT, 'public')
seen_css = set()

def save_css(href):
    if not href or 'hippocrateswellness.org' not in href:
        return
    href = href.split('?')[0]
    if not href.endswith('.css'):
        return
    rel = href.replace(SITE, '').lstrip('/')
    if rel in seen_css or not rel:
        return
    seen_css.add(rel)
    dest = os.path.join(CSS_DIR, rel)
    if os.path.exists(dest):
        return
    os.makedirs(os.path.dirname(dest), exist_ok=True)
    data = fetch(href, binary=True)
    if data:
        # keep relative url()s; strip nothing else
        open(dest, 'wb').write(data)

def scrape(path, el_id=None):
    """Fetch live page, return (wp-page div html, header html, footer html, css hrefs)."""
    url = SITE + ('/' if path in ('home-2', '', '/') else '/' + path.strip('/') + '/')
    html = fetch(url)
    if not html:
        return None
    page = extract_div(html, 'data-elementor-type="wp-page"')
    header = extract_div(html, 'data-elementor-type="header"')
    footer = extract_div(html, 'data-elementor-type="footer"')
    css = re.findall(r"<link[^>]+rel='stylesheet'[^>]+href='([^']+)'", html) + \
          re.findall(r'<link[^>]+rel="stylesheet"[^>]+href="([^"]+)"', html)
    for c in css:
        save_css(c)
    return clean(page) if page else None, clean(header) if header else None, clean(footer) if footer else None

def main():
    docs = []
    for coll in ['pages', 'experts', 'flipbooks', 'journeys', 'learning-centre',
                 'magazines', 'newsletters', 'podcasts', 'recipes']:
        idx = os.path.join(ROOT, 'content', f'index-{coll}.json')
        if not os.path.exists(idx):
            continue
        for e in json.load(open(idx, encoding='utf-8')):
            p = e['path'].replace('/', '__') if coll == 'pages' else e['slug']
            f = os.path.join(ROOT, 'content', coll, p + '.json')
            if os.path.exists(f):
                docs.append((coll, f, e['path']))
    print('docs:', len(docs))

    header_html = footer_html = None
    def work(item):
        coll, f, path = item
        res = scrape(path)
        if not res or not res[0]:
            return coll, f, False
        page, header, footer = res[0], res[1], res[2]
        # remove CF7 forms (dead without WP); our rebuilt form handles contact
        page = re.sub(r'<div class="wpcf7[^"]*"[^>]*>.*?</div>\s*</div>', '', page, flags=re.S)
        page = re.sub(r'<form\b[^>]*>.*?</form>', '', page, flags=re.S)
        d = json.load(open(f, encoding='utf-8'))
        d['content_live'] = page
        json.dump(d, open(f, 'w', encoding='utf-8'), ensure_ascii=False)
        return coll, f, True, header, footer

    done = 0
    with concurrent.futures.ThreadPoolExecutor(max_workers=8) as ex:
        for res in ex.map(work, docs):
            if res[2] and res[3] and not header_html:
                header_html, footer_html = res[3], res[4]
            done += 1
            if done % 25 == 0:
                print(done)
    out = {'header': header_html, 'footer': footer_html}
    json.dump(out, open(os.path.join(ROOT, 'content', 'live-chrome.json'), 'w', encoding='utf-8'), ensure_ascii=False)
    print('css files:', len(seen_css), 'header:', bool(header_html), 'footer:', bool(footer_html))

if __name__ == '__main__':
    main()
