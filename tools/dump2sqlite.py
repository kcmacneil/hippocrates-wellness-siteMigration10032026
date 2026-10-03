import sqlite3, re, sys, os

SRC = r"C:\Users\Administrator\wp-migration\backup-src\wp-content\mysql.sql"
DST = r"C:\Users\Administrator\wp-migration\work\wp.sqlite"

if os.path.exists(DST):
    os.remove(DST)
con = sqlite3.connect(DST)
cur = con.cursor()

# Tables we care about (columns taken from CREATE TABLE)
WANT = {
    "wp_posts","wp_postmeta","wp_terms","wp_term_taxonomy","wp_term_relationships",
    "wp_options","wp_users","wp_usermeta","wp_comments","wp_commentmeta",
    "wp_redirection_items","wp_e_submissions","wp_e_submissions_values",
    "wp_yoast_indexable","wp_grp_google_review_text",
}

cols = {}      # table -> [col,...]
created = set()
buf = []
def flush():
    global buf
    if buf:
        cur.executemany(stmt, buf)
        buf = []

def parse_values(s):
    # s is everything after VALUES ; rows like (...),(...),...
    rows = []
    i = 0
    n = len(s)
    while i < n:
        if s[i] == '(':
            i += 1
            row = []
            cur_tok = []
            in_str = False
            while i < n:
                c = s[i]
                if in_str:
                    if c == '\\':
                        nxt = s[i+1] if i+1 < n else ''
                        mp = {'n':'\n','r':'\r','t':'\t','0':'\0','b':'\b','Z':'\x1a'}
                        cur_tok.append(mp.get(nxt, nxt))
                        i += 2
                        continue
                    if c == "'":
                        if i+1 < n and s[i+1] == "'":
                            cur_tok.append("'"); i += 2; continue
                        in_str = False; i += 1; continue
                    cur_tok.append(c); i += 1; continue
                else:
                    if c == "'":
                        in_str = True; i += 1; continue
                    if c == ',':
                        row.append(''.join(cur_tok)); cur_tok = []; i += 1; continue
                    if c == ')':
                        row.append(''.join(cur_tok)); i += 1
                        break
                    cur_tok.append(c); i += 1
            rows.append([v if v != 'NULL' else None for v in row])
        else:
            i += 1
        # skip , and whitespace between tuples
    return rows

table = None
with open(SRC, 'r', encoding='utf-8', errors='replace') as f:
    for line in f:
        if line.startswith('CREATE TABLE `'):
            t = line.split('`')[1]
            table = t if t in WANT else None
            continue
        if table and line.lstrip().startswith('`'):
            cols.setdefault(table, []).append(line.split('`')[1])
            continue
        if line.startswith('INSERT INTO `'):
            t = line.split('`')[1]
            if t in WANT:
                if t not in created:
                    flush()
                    c = cols.get(t)
                    if not c:
                        continue
                    d = ' TEXT, '.join('"%s"' % x for x in c)
                    cur.execute('CREATE TABLE "%s" (%s TEXT)' % (t, d))
                    created.add(t)
                    stmt = 'INSERT INTO "%s" VALUES (%s)' % (t, ','.join('?'*len(c)))
                vals = line[line.index('VALUES')+6:].strip().rstrip(';')
                ncol = len(cols[t])
                for row in parse_values(vals):
                    if len(row) != ncol:
                        if len(row) > ncol:
                            row = row[:ncol-1] + ['\x01'.join(row[ncol-1:])]
                        else:
                            row = row + [None]*(ncol-len(row))
                    buf.append(row)
                if len(buf) > 5000:
                    cur.executemany(stmt, buf); buf = []
            continue
        if line.strip() == '' or line.startswith('--') or line.startswith('/*') or line.startswith('LOCK') or line.startswith('UNLOCK') or line.startswith('DROP'):
            table = None
            continue
flush()
con.commit()

for t in sorted(created):
    print(t, cur.execute('SELECT COUNT(*) FROM "%s"' % t).fetchone()[0])
con.close()
print("DONE")
