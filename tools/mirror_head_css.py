#!/usr/bin/env python3
"""Mirror the live site's site-wide <head> CSS that isn't a WordPress file:
inline <style id=...> blocks (WP global styles, Customizer "Additional CSS")
and the slick-carousel CDN stylesheets the recipe template relies on."""
import os, re
from scrape_live import ROOT, SITE, fetch, clean

PUBLIC = os.path.join(ROOT, 'public')
INLINE_IDS = ['wp-img-auto-sizes-contain-inline-css', 'wp-emoji-styles-inline-css',
              'global-styles-inline-css', 'wp-custom-css']
SLICK_CDN = 'https://cdnjs.cloudflare.com/ajax/libs/slick-carousel/1.9.0/'
SLICK_FILES = ['slick.min.css', 'slick-theme.css', 'ajax-loader.gif', 'fonts/slick.eot',
               'fonts/slick.svg', 'fonts/slick.ttf', 'fonts/slick.woff']

def write(rel, data):
    dest = os.path.join(PUBLIC, rel)
    os.makedirs(os.path.dirname(dest), exist_ok=True)
    open(dest, 'wb').write(data if isinstance(data, bytes) else data.encode('utf-8'))
    print('wrote', rel)

def main():
    html = fetch(SITE + '/')
    for sid in INLINE_IDS:
        m = re.search(r'<style id=[\'"]%s[\'"][^>]*>(.*?)</style>' % re.escape(sid), html, re.S)
        if not m:
            print('MISSING', sid)
            continue
        write(f'wp-content/hw-inline/{sid}.css', clean(m.group(1)).strip() + '\n')
    for f in SLICK_FILES:
        write(f'vendor/slick-carousel/1.9.0/{f}', fetch(SLICK_CDN + f, binary=True))

if __name__ == '__main__':
    main()
