"""Re-scrape the live header and the mobile-menu popup (Elementor popup 2520).

Popup triggers in the header become `#popup-<id>` (opened by NavScript) for the
mobile menu; other popups (e.g. 3544 consultation form) link to /contact-us/.
"""
import base64, json, os, re, urllib.parse
from scrape_live import ROOT, SITE, fetch, extract_div, clean, save_css

MENU_POPUPS = {'2520'}

def popup_id(href):
    q = urllib.parse.unquote(href.split('elementor-action', 1)[1])
    m = re.search(r'settings=([A-Za-z0-9+/=]+)', q)
    return json.loads(base64.b64decode(m.group(1)))['id'] if m else None

def rewrite_actions(s):
    def sub(m):
        pid = popup_id(m.group(1))
        return 'href="%s"' % (f'#popup-{pid}' if pid in MENU_POPUPS else '/contact-us/')
    return re.sub(r'href="(#elementor-action[^"]*)"', sub, s)

def main():
    html = fetch(SITE + '/')
    for c in re.findall(r"<link[^>]+rel='stylesheet'[^>]+href='([^']+)'", html):
        save_css(c)
    path = os.path.join(ROOT, 'content', 'live-chrome.json')
    chrome = json.load(open(path, encoding='utf-8'))
    chrome['header'] = rewrite_actions(clean(extract_div(html, 'data-elementor-type="header"')))
    chrome['popups'] = {}
    for pid in MENU_POPUPS:
        div = extract_div(html, f'data-elementor-id="{pid}"')
        if div:
            chrome['popups'][pid] = rewrite_actions(clean(div))
            save_css(f'{SITE}/wp-content/uploads/elementor/css/post-{pid}.css')
    json.dump(chrome, open(path, 'w', encoding='utf-8'), ensure_ascii=False)
    print('popups:', list(chrome['popups']), 'header triggers:',
          re.findall(r'href="(#popup-\d+)"', chrome['header']))

if __name__ == '__main__':
    main()
