import { allPaths } from '../lib/content';

const BASE = 'https://hippocrateswellness.org';

export default function sitemap() {
  const urls = allPaths().map((p) => ({
    url: `${BASE}/${p}/`,
    lastModified: new Date(),
  }));
  return [{ url: `${BASE}/`, lastModified: new Date() }, ...urls];
}
