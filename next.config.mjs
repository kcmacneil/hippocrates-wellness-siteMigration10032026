import { readFileSync } from 'node:fs';
import { join } from 'node:path';

/** Redirects imported from the WordPress Redirection plugin (wp_redirection_items). */
const wpRedirects = JSON.parse(
  readFileSync(join(process.cwd(), 'content', 'redirects.json'), 'utf8')
);

/** Same-site targets get the WordPress trailing slash so each redirect is a single hop. */
const withSlash = (to) =>
  /^https?:|[?#]|\.[a-z0-9]+$|\/$/i.test(to) ? to : `${to}/`;

const legacyAliases = [
  // Front page used to be reachable at /home and /home-2 in old templates
  { source: '/home', destination: '/', permanent: true },
  { source: '/home-2', destination: '/', permanent: true },
  // Old flat archive URLs redirect to the Learning Centre hierarchy (as on the live site)
  { source: '/blog', destination: '/learning-centre/blog/', permanent: true },
  { source: '/podcast', destination: '/learning-centre/podcast/', permanent: true },
  { source: '/healing-our-world-magazine', destination: '/learning-centre/healing-our-world-magazine/', permanent: true },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  trailingSlash: true,
  async redirects() {
    return [
      ...legacyAliases,
      ...wpRedirects.map((r) => ({
        source: r.from,
        destination: withSlash(r.to),
        permanent: r.code === '301',
        statusCode: Number(r.code) || 301,
      })),
    ];
  },
  async headers() {
    return [
      {
        source: '/wp-content/uploads/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
    ];
  },
};

export default nextConfig;
