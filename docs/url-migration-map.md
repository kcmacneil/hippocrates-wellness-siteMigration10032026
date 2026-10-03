# URL Migration Map

URL scheme: unchanged. WordPress used `/%postname%/`; all posts and custom
post types were flat `/<slug>/` URLs and pages were hierarchical. Both are
preserved exactly, verified against the live sitemap index
(`https://hippocrateswellness.org/sitemap_index.xml`).

## Rules

| Old URL | New URL | Status |
|---|---|---|
| `/` | `/` | Preserved (front page `home-2` rendered at root) |
| `/home`, `/home-2` | `/` | 301 redirect (was already an alias) |
| `/<slug>/` (post/podcast/recipe/magazine/resort/journey/expert/newsletter) | `/<slug>/` | Preserved |
| `/<parent>/<child>/` (hierarchical pages) | same | Preserved |
| `/blog/` | `/learning-centre/blog/` | 301 (matches live-site redirect) — post index appended to page content |
| `/podcast/` | `/learning-centre/podcast/` | 301 (matches live-site redirect) — podcast index appended |
| `/healing-our-world-magazine/` | `/learning-centre/healing-our-world-magazine/` | 301 (matches live-site redirect) |
| `/magazine/` | `/magazine/` | Rebuilt as archive index (was a CPT archive) |
| `/meal-plans-recipes/` | `/meal-plans-recipes/` | Rebuilt as archive index |
| `/wp-content/uploads/...` | `/wp-content/uploads/...` | Media URLs preserved (served from `public/`) |

## 301 redirects migrated from the Redirection plugin

| Old URL | New URL | Status |
|---|---|---|
| `/resilience` | `/integrative-health-education` | 301 |
| `/fortitude` | `/immune-health-education` | 301 |
| `/cadence` | `/cardiovascular-wellness-education` | 301 |
| `/renewal` | `/metabolic-wellness-education` | 301 |
| `/acuity` | `/cognitive-wellness-education` | 301 |
| `/restoration` | `/immune-resilience-education` | 301 |
| `/genesis` | `/reproductive-wellness-education` | 301 |
| `/root` | `/nervous-system-wellness-education` | 301 |

Off-site podcast redirects (153, `/<podcast-slug>/` → podbean) were added from a live audit — see
`docs/live-redirect-audit.md`.

## Exceptions

| Old URL | Status |
|---|---|
| `/wp-content/uploads/2025/04/2014809059.mp4` (117 MB) | Excluded — exceeds GitHub 100 MB file limit. Host on Vimeo/S3 or leave on the old origin and add a redirect once decided |
| `/wp-content/uploads/2025/04/1743951674.mp4` (138 MB) | Same as above |
| `/sample-page/` | Preserved (default WP page still in backup; can be deleted) |
| Comment threads (`wp_comments`) | Not migrated — comments were not part of the rendered pages |
| Author archives (`/author/…`), tag/date archives | Not rebuilt; Yoast listed them but they were thin archive pages |
| RSS feed (`/feed/`) | Not implemented; can be added with a route handler if needed |
