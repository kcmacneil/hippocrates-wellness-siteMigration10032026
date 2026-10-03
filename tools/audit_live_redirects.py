"""Audit live hippocrateswellness.org URLs for redirects (no-follow). Writes live-redirect-audit.json in cwd."""
import json, os, sys, time, urllib.request, urllib.error, urllib.parse
from concurrent.futures import ThreadPoolExecutor
REPO = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'content')
BASE = 'https://hippocrateswellness.org'
UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
COLS = ['pages','posts','podcasts','recipes','magazines','resort','journeys','experts','learning-centre','newsletters','flipbooks','resort-cpt']
docs = {}
for c in COLS:
    d = os.path.join(REPO, c)
    if not os.path.isdir(d): continue
    for f in os.listdir(d):
        doc = json.load(open(os.path.join(d, f), encoding='utf8'))
        docs.setdefault(doc['path'], c)
paths = [''] + sorted(docs)
for r in json.load(open(os.path.join(REPO, 'redirects.json'))):
    p = r['from'].strip('/')
    if p not in docs: paths.append(p); docs[p] = 'redirects.json'

class NoRedir(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, *a, **k): return None
opener = urllib.request.build_opener(NoRedir)

def fetch(p):
    url = BASE + '/' + (urllib.parse.quote(p) + '/' if p else '')
    last = None
    for attempt in range(5):
        req = urllib.request.Request(url, headers={'User-Agent': UA, 'Accept': 'text/html,*/*'}, method='GET')
        try:
            with opener.open(req, timeout=30) as resp:
                return dict(path=p, url=url, status=resp.status, location=None)
        except urllib.error.HTTPError as e:
            loc = e.headers.get('Location')
            if e.code >= 500:
                last = e.code; time.sleep(2 * (attempt + 1)); continue
            return dict(path=p, url=url, status=e.code, location=loc)
        except Exception as e:
            last = repr(e); time.sleep(2 * (attempt + 1))
    return dict(path=p, url=url, status=last, location=None, error=True)

out = []
with ThreadPoolExecutor(6) as ex:
    for i, r in enumerate(ex.map(fetch, paths)):
        r['collection'] = docs.get(r['path'], 'root')
        out.append(r)
        if i % 100 == 0: print(i, len(paths), flush=True)
json.dump(out, open('live-redirect-audit.json', 'w'), indent=1)
from collections import Counter
print(Counter(str(r['status']) for r in out))
