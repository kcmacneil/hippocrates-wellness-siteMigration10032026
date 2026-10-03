# Deployment

## How it works

`git push` → Vercel builds `next build` → static site on Vercel's CDN.

- **Production** deploys from `main`.
- **Preview deployments** are created automatically for every other branch
  (work happens on `develop` or `feature/*`).

## Vercel project settings

| Setting | Value |
|---|---|
| Framework | Next.js (auto-detected) |
| Build command | `next build` (default) |
| Install command | `npm install` (default) |
| Production branch | `main` |

## Environment variables

| Variable | Required | Purpose |
|---|---|---|
| `FORM_WEBHOOK_URL` | No | Endpoint that receives contact-form JSON submissions (Zapier/Make/Formspree/Resend webhook). Without it, submissions are validated and logged only. |

No other env vars are needed — content is baked into the repo.

## Deploying

1. Commit work on `develop`/`feature/*` and push → open the preview URL Vercel generates.
2. Verify the preview.
3. Merge into `main` → production deploy.

With the Vercel CLI (what this migration used):

```bash
vercel login
vercel link          # inside the repo, link to the project
vercel --prod        # manual production deploy (optional; Git push also deploys)
```

## Rollback

Every deploy is tied to a Git commit. Options:

- **Vercel dashboard** → Deployments → "..." on any earlier deployment →
  "Instant Rollback" (promotes that build to production).
- **Git**: `git revert <sha>` or `git reset --hard <tag>` then push `main`.
- Production milestones are tagged (`v1.0.0`, `wordpress-original-migration`).

## Domains

Add `hippocrateswellness.org` (+ `www`) in Vercel → Project → Settings →
Domains when ready to cut DNS over. Until then the site lives at
`<project>.vercel.app`.
