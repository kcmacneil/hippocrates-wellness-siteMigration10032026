# Migration Notes — WordPress → Next.js

## Architecture decision

The backup is a marketing/content site (80 pages, ~1,900 published documents).
A headless WordPress CMS is not warranted, so the site was converted to a
standalone static Next.js app (see `docs/wordpress-plugin-migration.md`).

```
WordPress backup
  → parse mysql.sql into SQLite (tools/dump2sqlite.py)
  → extract pages/posts/CPTs/menus/SEO/redirects to content/*.json (tools/extract.py)
  → Next.js App Router, catch-all [...slug] route preserves WP URLs
  → Git → Vercel
```

All rendering is static (`generateStaticParams`, `dynamicParams = false`), so
every former WordPress URL is a pre-built HTML file behind Vercel's CDN.

## How content was recovered

Page bodies in `post_content` already contained the rendered HTML (the text,
headings, images, Vimeo URLs and internal links), which made it possible to
migrate without re-implementing Elementor's widget engine. The Elementor kit's
global palette and fonts were reused in `styles/globals.css`.

## Intentional differences from the original

- **Visual fidelity**: layout/typography is approximated, not pixel-identical.
  Elementor's responsive breakpoints, animations, sliders and popup templates
  are not reproduced 1:1.
- **Blog/Podcast/Archive indexes**: WordPress used Elementor "posts" widgets;
  here the indexes are generated lists appended after the page content.
- **Contact form**: rebuilt as a React form + API route. Set
  `FORM_WEBHOOK_URL` in Vercel env to deliver submissions (Zapier/Make/
  Formspree/Resend webhook). Without it, submissions validate and log only.
- **Elementor forms** (booking, newsletter signups in popups): not reproduced —
  they were popup widgets whose submissions went to an internal table. Add a
  form provider per form as needed.
- **Analytics/tracking**: Facebook Pixel, PixelYourSite, Google Site Kit and
  Amplitude snippets were not carried over. Re-add intentionally via env vars.
- **Comments**: not migrated (they were not rendered on the site).
- **Two videos >100 MB** could not be committed (GitHub limit) — see
  `docs/url-migration-map.md` exceptions.
- **WooCommerce/Store**: menu had a "Store" link pointing off-site; unchanged.
- **HTML entities**: some legacy `&amp;`-style entities remain inside extracted
  HTML exactly as stored in WordPress.
- **Admin-only plugins**: file managers, importers, caches, backups dropped.

## Re-running the extraction

`tools/` contains the pipeline used once for this migration; keep the original
backup zip unchanged. To regenerate `content/`, point the two scripts'
`SRC`/`OUT` constants at the extracted backup and run them with Python 3.10+.
