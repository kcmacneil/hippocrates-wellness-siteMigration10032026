import { allPaths, redirectedPaths } from '../lib/content';

const BASE = 'https://hippocrateswellness.org';

export default function sitemap() {
  const redirected = redirectedPaths();
  const urls = allPaths().filter((p) => !redirected.has(p)).map((p) => ({
    url: `${BASE}/${p}/`,
    lastModified: new Date(),
  }));
  return [{ url: `${BASE}/`, lastModified: new Date() }, ...urls];
}
