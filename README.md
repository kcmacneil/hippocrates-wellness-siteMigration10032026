# Hippocrates Wellness

Next.js rebuild of [hippocrateswellness.org](https://hippocrateswellness.org),
migrated from a WordPress (Elementor) backup. Content, URLs, media and SEO
metadata were preserved; the site is now a static site deployed on Vercel.

## Architecture

- **Next.js 15** (App Router, fully static export via `generateStaticParams`)
- Content lives in `content/` as JSON extracted from the WordPress database
  dump — ~1,900 documents across pages, posts, podcasts, recipes, magazines
  and other custom post types
- Media served from `public/wp-content/uploads/` (original paths preserved)
- Brand palette/fonts from the site's Elementor kit in `styles/globals.css`
- Contact form: `components/ContactForm.jsx` → `app/api/contact`
- Redirects: `next.config.mjs` reads `content/redirects.json` (former
  WordPress Redirection plugin rules)

See `docs/` for the backup inventory, plugin migration table, URL map,
migration notes and deployment guide.

## Development

```bash
npm install
npm run dev        # http://localhost:3000
```

## Production build

```bash
npm run build
npm start
```

## Deployment

Push to GitHub → Vercel builds automatically. Production deploys from `main`;
every other branch gets a preview deployment. Details in `docs/deployment.md`.

## Environment variables

| Variable | Purpose |
|---|---|
| `FORM_WEBHOOK_URL` | (optional) webhook receiving contact-form submissions |

## Content management

- **Edit a page/post**: edit its JSON file in `content/<collection>/` (the
  `content` field is HTML; `path` is its URL). Commit → push → deploy.
- **Add a post**: create a JSON file in `content/posts/` with the same shape
  as an existing entry and add it to `content/index-posts.json`.
- **Menus**: `content/menus.json` (Main Menu drives the header).
- **Redirects**: `content/redirects.json`, picked up by `next.config.mjs`.
- **Media**: drop files under `public/wp-content/uploads/` keeping the
  WordPress path.

## Migration information

- `docs/wordpress-backup-inventory.md` — what was in the backup
- `docs/wordpress-plugin-migration.md` — plugin → replacement table
- `docs/url-migration-map.md` — old → new URL mapping
- `docs/migration-notes.md` — decisions and known differences
- `docs/deployment.md` — Vercel config, env vars, rollback
