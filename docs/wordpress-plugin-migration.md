# WordPress Plugin Migration

| WordPress Plugin | Original Purpose | Replacement | Notes |
|---|---|---|---|
| elementor + elementor-pro | Page builder | Rendered HTML from `post_content` + `styles/globals.css` | Elementor itself does not run on Vercel; layout approximated |
| wordpress-seo (Yoast) | SEO meta, sitemaps | Next.js `metadata` per page, `app/sitemap.js`, `app/robots.js` | Titles/descriptions/canonicals/OG migrated |
| redirection | 301 redirects | `next.config.mjs` `redirects()` from `content/redirects.json` | 8 rules migrated |
| contact-form-7 | Contact forms | `components/ContactForm.jsx` → `POST /api/contact` | Delivery via `FORM_WEBHOOK_URL` env |
| advanced-google-recaptcha | Form spam protection | Honeypot field + server-side validation | Add Turnstile later if needed |
| advanced-custom-fields (ACF) | Custom fields | Content flattened into `content/*.json` | ACF CPT definitions (podcast, recipes, magazine, journeys…) become collections |
| custom-post-type-ui / custom-post-type-permalinks | CPT registration & URLs | Catch-all route `app/[...slug]` | Flat `/<slug>/` URLs preserved |
| reading-time-wp | Reading time badge | Not migrated (low value) | |
| event-manager / events-handler | Events | `the-resort` + `journeys` posts as content | No booking backend; events rendered as pages |
| widget-google-reviews (grp tables) | Google reviews widget | Not migrated — external embed | Re-add via Elfsight/widget if wanted |
| ht-slider-for-elementor | Hero sliders | Static hero content from rendered HTML | |
| 3d-flipbook-dflip-lite | PDF flipbooks (magazines) | Magazine pages render extracted HTML; PDF links preserved | Interactive flipbook viewer not reproduced |
| svg-support | SVG uploads | Native `<img>` for `.svg` files | |
| page-links-to | Page → external redirect | Handled per-page where encountered | |
| permalink-manager | URL control | Not needed — URLs preserved in extraction | |
| post-types-order | Manual ordering | Ordering by `menu_order`/date in indexes | |
| duplicate-wp-page-post, wp-reset, health-check, wp-file-manager, wp-maximum-upload-file-size, child-theme-configurator | Admin utilities | N/A | Not needed |
| all-in-one-wp-migration, updraftplus, wp-migrate-db, wpe-site-migration | Backup/migration tools | N/A | The migration itself |
| wp-all-export / wp-import-export-lite / wpallimport | Content import/export | `tools/extract.py` pipeline instead | |
| wp-fastest-cache, advanced-cache, object-cache | Caching | Vercel static generation + CDN | Faster natively |
| insert-headers-and-footers / custom-css-js / wpcode | Code injection | Reviewed; analytics snippets not carried over (see migration-notes) | |
| official-facebook-pixel / pixelyoursite / amplitude / google-site-kit | Marketing/analytics pixels | Not migrated — re-add via env-configured snippet if desired | Privacy improvement |
| classic-editor, akismet, wordpress-importer, make-section-column-clickable-elementor | Editor/admin/spam | N/A or replaced by native flow | |
| Google recaptcha on CF7 | Spam | Honeypot (see above) | |
