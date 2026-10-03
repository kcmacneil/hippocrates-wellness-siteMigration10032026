# WordPress Backup Inventory

Source backup: full filesystem + database backup of `hippocrateswellness.org`
(WP Engine install name `hippocratewp`, cluster pod 405237, MySQL 8.4 / dump
from MySQL 5.7-format client). ~4.5 GB zip, 37,054 files.

## Top-level layout

| Item | Notes |
|---|---|
| `wp-admin/`, `wp-includes/` | Stock WordPress core — not migrated |
| `wp-config.php` | WP Engine config. **Contains live credentials** — see Security notes |
| `wp-content/mysql.sql` | 249 MB mysqldump, `wp_` table prefix |
| `wp-content/uploads/` | ~2.2 GB media (2017–2026), plus plugin working dirs |
| `wp-content/temp/` | 2 GB of abandoned temp files (`elfzdl-*`) — excluded |
| `wp-content/themes/` | `astra`, `hello-elementor`, `hello-elementor-child` (active), `genesis-block-theme`, `twentytwentyfive` |
| `.tmb/` | File-manager thumbnail cache — excluded |

## Content (from `wp_posts`, published)

| Type | Count | Old URL pattern |
|---|---|---|
| Pages | 80 | hierarchical `/<parent>/<slug>/` |
| Blog posts | 1,437 | `/<slug>/` (`/%postname%/`) |
| `podcast` | 153 | `/<slug>/` |
| `meal-plans-recipe` | 60 | `/<slug>/` (archive `/meal-plans-recipes/`) |
| `magazine` | 30 | `/<slug>/` (archive `/magazine/`) |
| `the-resort` | 19 | `/<slug>/` |
| `journeys` | 7 | `/<slug>/` |
| `wellness_experts` | 6 | `/<slug>/` |
| `social-media-newslet` | 8 | `/<slug>/` |
| `learning-centre` | 2 | `/<slug>/` |
| `dflip` flipbooks | 14 | embedded in pages |
| `elementor_library` | 69 | theme builder templates — replaced by `components/` |
| `nav_menu_item` | 65 | 3 menus: Main Menu (39), Redesign Menu (23), Thank-you (3) |
| attachments | 1,482 | under `/wp-content/uploads/` |

Page/post bodies already contain rendered HTML (Elementor fallback content),
so text, headings, images, links and embeds (Vimeo etc.) were extracted
directly. Elementor layout/CSS is approximated by `styles/globals.css`
using the Elementor kit palette (primary `#C08A4A`, secondary `#4A7360`,
fonts Hanken Grotesk / Newsreader).

## SEO

- Yoast SEO (wordpress-seo): `_yoast_wpseo_title`, `_yoast_wpseo_metadesc`,
  `_yoast_wpseo_canonical`, OG title/description migrated per document.
- `wp_redirection_items`: 8 enabled 301 rules → `next.config.mjs`.
- Yoast indexables, robots.txt, sitemap regenerated natively.

## Forms

- Contact Form 7 — 2 identical forms (`name/email/subject/message`) →
  `components/ContactForm.jsx` + `app/api/contact/route.js`.
- Elementor forms (`wp_e_submissions*`, 866 rows) — form widgets on Elementor
  pages are not reproduced; documented in plugin-migration.

## Security notes — credentials found in backup

`wp-config.php` contains a live DB password and a WPE API key.
**None of these were copied into the repository.** The backup file itself is
retained out-of-tree; rotate the WP Engine DB password and `WPE_APIKEY` on the
old host if it is still active.

## Not migrated

- `wp-content/temp/` (2 GB temp), `.tmb/` thumbnails, cache dirs
  (`updraft`, `object-cache.php`, `advanced-cache.php`, `wp-fastest-cache` data),
  file-manager/plugin working dirs (`wp-file-manager-pro`,
  `wp-import-export-lite`, `wpallexport`, `wpallimport`, `wp-migrate-db`,
  `wpcf7_uploads`, `wpcode`).
- `uploads/2025/04/2014809059.mp4` (117 MB) and `1743951674.mp4` (138 MB) —
  exceed GitHub's 100 MB file limit; see `docs/url-migration-map.md`.
- WordPress core (`wp-admin`, `wp-includes`), inactive themes.
