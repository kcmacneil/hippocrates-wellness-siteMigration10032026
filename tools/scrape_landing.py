"""Mirror standalone (non-WordPress-theme) landing pages from the live site.

The live /the-life-transformation-program/ is a self-contained Webflow-style
document (own <head>, CSS, GSAP/Lenis scripts, no site header/footer). Rendering
it inside the Next layout pulls in the Elementor kit CSS and site chrome, which
overrides its colours and drops its scroll animations, so it is served verbatim
from public/hw-landing/<slug>.html via a beforeFiles rewrite in next.config.mjs.

Usage: python tools/scrape_landing.py [slug ...]
"""
import os
import re
import sys
import urllib.request

sys.path.insert(0, os.path.dirname(__file__))
from scrape_posts import decode_cf_emails  # noqa: E402

SITE = 'https://hippocrateswellness.org'
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PUBLIC = os.path.join(ROOT, 'public')
UA = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 '
                    '(KHTML, like Gecko) Chrome/126 Safari/537.36'}
LANDINGS = ['the-life-transformation-program']
ASSET_RE = re.compile(r'https://hippocrateswellness\.org(/wp-content/[^"\'\s)<>?#]+)')


def get(url):
    return urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=120).read()


def mirror(rel, refresh=False):
    dest = os.path.join(PUBLIC, rel.lstrip('/'))
    if os.path.exists(dest) and not refresh:
        return
    os.makedirs(os.path.dirname(dest), exist_ok=True)
    data = get(SITE + rel)
    if rel.endswith('.css'):
        text = data.decode('utf8')
        for asset in set(ASSET_RE.findall(text)):
            mirror(asset)
        data = text.replace(SITE + '/', '/').encode('utf8')
    with open(dest, 'wb') as f:
        f.write(data)
    print('mirrored', rel)


def localize(html):
    # Cloudflare's bot-challenge loader only works on the live origin.
    html = re.sub(r'<script>\(function\(\)\{function c\(\).*?__CF\$cv\$params.*?</script>', '', html, flags=re.S)
    for rel in set(ASSET_RE.findall(html)):
        mirror(rel, refresh=rel.endswith(('.css', '.js')))
    return decode_cf_emails(html.replace(SITE + '/', '/').replace(SITE + '"', '/"'))


def main(slugs):
    out_dir = os.path.join(PUBLIC, 'hw-landing')
    os.makedirs(out_dir, exist_ok=True)
    for slug in slugs:
        html = localize(get(f'{SITE}/{slug}/').decode('utf8'))
        with open(os.path.join(out_dir, f'{slug}.html'), 'w', encoding='utf8', newline='\n') as f:
            f.write(html)
        print('wrote', f'public/hw-landing/{slug}.html', len(html))


if __name__ == '__main__':
    main(sys.argv[1:] or LANDINGS)
