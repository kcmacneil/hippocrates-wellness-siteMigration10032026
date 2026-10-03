import sqlite3, json, os, re, html

DB = r'C:\Users\Administrator\wp-migration\work\wp.sqlite'
OUT = r'C:\Users\Administrator\repos\hippocrates-wellness\content'
SITE = 'https://hippocrateswellness.org'
os.makedirs(OUT, exist_ok=True)

con = sqlite3.connect(DB); con.row_factory = sqlite3.Row
c = con.cursor()

meta_cache = {}
def meta(pid, key):
    if pid not in meta_cache:
        meta_cache[pid] = {r['meta_key']: r['meta_value'] for r in c.execute(
            "SELECT meta_key,meta_value FROM wp_postmeta WHERE post_id=?", (pid,))}
    return meta_cache[pid].get(key)

# attachment id -> url
attach = {r['ID']: r['guid'] for r in c.execute("SELECT ID,guid FROM wp_posts WHERE post_type='attachment'")}
def img_url(att_id):
    u = attach.get(str(att_id) or attach.get(att_id, ''))
    return rel(u) if u else None

def rel(url):
    if not url: return url
    url = url.replace(SITE, '')
    return url

def clean_html(s):
    if not s: return ''
    s = s.replace(SITE + '/wp-content/', '/wp-content/')
    s = s.replace('https://hippocrateswellness.org/', '/')
    s = s.replace('http://hippocrateswellness.org/', '/')
    return s

# taxonomy terms per post
def terms(pid):
    rows = c.execute("""SELECT t.name,t.slug,tt.taxonomy FROM wp_term_relationships tr
        JOIN wp_term_taxonomy tt ON tr.term_taxonomy_id=tt.term_taxonomy_id
        JOIN wp_terms t ON tt.term_id=t.term_id WHERE tr.object_id=?""",(pid,))
    out={}
    for r in rows: out.setdefault(r['taxonomy'],[]).append({'name':r['name'],'slug':r['slug']})
    return out

# page path map (hierarchy)
pages = {r['ID']: r for r in c.execute("SELECT * FROM wp_posts WHERE post_type='page' AND post_status='publish'")}
def page_path(pid, seen=()):
    r = pages.get(str(pid))
    if not r: return None
    parent = str(r['post_parent'] or '0')
    if parent != '0' and parent not in seen:
        p = page_path(parent, seen+(str(pid),))
        if p: return p + '/' + r['post_name']
    return r['post_name']

TYPES = {
 'page':'pages','post':'posts','podcast':'podcasts','meal-plans-recipe':'recipes',
 'magazine':'magazines','the-resort':'resort','journeys':'journeys',
 'wellness_experts':'experts','learning-centre':'learning-centre',
 'social-media-newslet':'newsletters','dflip':'flipbooks','resort':'resort-cpt',
}
index = {k:[] for k in TYPES.values()}

rows = c.execute("""SELECT * FROM wp_posts WHERE post_status='publish' AND post_type IN (%s)
    ORDER BY post_type,post_date""" % ','.join('?'*len(TYPES)), list(TYPES)).fetchall()

for r in rows:
    pid = r['ID']; pt = r['post_type']
    tx = terms(pid)
    m = {r2['meta_key']: r2['meta_value'] for r2 in c.execute(
        "SELECT meta_key,meta_value FROM wp_postmeta WHERE post_id=? AND meta_key IN ("
        "'_yoast_wpseo_title','_yoast_wpseo_metadesc','_yoast_wpseo_canonical',"
        "'_yoast_wpseo_opengraph-title','_yoast_wpseo_opengraph-description',"
        "'_thumbnail_id','_elementor_edit_mode','reading_time')",(pid,))}
    if pt == 'page':
        path = page_path(pid)
    else:
        # Confirmed against live sitemaps: posts and all CPTs are flat /<slug>/ URLs
        path = r['post_name']
    thumb = img_url(m.get('_thumbnail_id'))
    doc = {
        'id': pid,'type': pt,'slug': r['post_name'],'path': path,
        'title': r['post_title'],
        'date': r['post_date'],'modified': r['post_modified'],
        'excerpt': clean_html(r['post_excerpt'] or ''),
        'content': clean_html(r['post_content'] or ''),
        'seoTitle': m.get('_yoast_wpseo_title') or None,
        'seoDesc': m.get('_yoast_wpseo_metadesc') or None,
        'canonical': m.get('_yoast_wpseo_canonical') or None,
        'ogTitle': m.get('_yoast_wpseo_opengraph-title') or None,
        'ogDesc': m.get('_yoast_wpseo_opengraph-description') or None,
        'image': thumb,'terms': tx,
        'elementor': m.get('_elementor_edit_mode')=='builder',
    }
    d = os.path.join(OUT, TYPES[pt]); os.makedirs(d, exist_ok=True)
    fn = (path or r['post_name']).replace('/','__') + '.json'
    with open(os.path.join(d, fn),'w',encoding='utf-8') as f:
        json.dump(doc,f,ensure_ascii=False)
    index[TYPES[pt]].append({'id':pid,'slug':r['post_name'],'path':path,
        'title':r['post_title'],'date':r['post_date'],'image':thumb,
        'terms':{k:[t['slug'] for t in v] for k,v in tx.items()},
        'excerpt':re.sub('<[^>]+>',' ',doc['excerpt'] or re.sub('<[^>]+>',' ',doc['content'])[:300]).strip()})

for k,v in index.items():
    with open(os.path.join(OUT,'index-%s.json'%k),'w',encoding='utf-8') as f:
        json.dump(v,f,ensure_ascii=False)
    print(k,len(v))

# menus
menus={}
nav_menus = c.execute("""SELECT t.term_id,t.name,t.slug,tt.term_taxonomy_id FROM wp_terms t
    JOIN wp_term_taxonomy tt ON t.term_id=tt.term_id WHERE tt.taxonomy='nav_menu'""").fetchall()
for mn in nav_menus:
    items=[]
    for r in c.execute("""SELECT p.ID,p.post_title,p.post_name,p.menu_order FROM wp_term_relationships tr
        JOIN wp_posts p ON tr.object_id=p.ID WHERE tr.term_taxonomy_id=? AND p.post_status='publish'
        ORDER BY p.menu_order""",(mn['term_taxonomy_id'],)).fetchall():
        m = {x['meta_key']:x['meta_value'] for x in c.execute(
            "SELECT meta_key,meta_value FROM wp_postmeta WHERE post_id=? AND meta_key IN ('_menu_item_url','_menu_item_object','_menu_item_object_id','_menu_item_menu_item_parent','_menu_item_type')",(r['ID'],))}
        url = m.get('_menu_item_url') or ''
        if m.get('_menu_item_object')=='page':
            url = '/'+ (page_path(int(m.get('_menu_item_object_id') or 0)) or '')
        elif m.get('_menu_item_object') in ('post','podcast','meal-plans-recipe','magazine'):
            url = '/'+ r['post_name'] +'/'
        items.append({'id':r['ID'],'title':r['post_title'],'url':rel(url) or '/',
                      'parent':int(m.get('_menu_item_menu_item_parent') or 0)})
    menus[mn['slug']]=items
with open(os.path.join(OUT,'menus.json'),'w',encoding='utf-8') as f: json.dump(menus,f,ensure_ascii=False)
print({k:len(v) for k,v in menus.items()})

# redirects
reds=[{'from':r['url'],'to':r['action_data'],'code':r['action_code']} for r in c.execute(
    "SELECT url,action_data,action_code FROM wp_redirection_items WHERE status='enabled' AND action_code IN ('301','302','307','308')")]
with open(os.path.join(OUT,'redirects.json'),'w',encoding='utf-8') as f: json.dump(reds,f,ensure_ascii=False)
print('redirects',len(reds),reds)

# categories list
cats=[{'name':r['name'],'slug':r['slug']} for r in c.execute(
    "SELECT t.name,t.slug FROM wp_terms t JOIN wp_term_taxonomy tt ON t.term_id=tt.term_id WHERE tt.taxonomy='category'")]
with open(os.path.join(OUT,'categories.json'),'w',encoding='utf-8') as f: json.dump(cats,f,ensure_ascii=False)
print('done')
