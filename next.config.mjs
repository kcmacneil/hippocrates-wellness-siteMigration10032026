import { readFileSync } from 'node:fs';
import { join } from 'node:path';

/** Redirects imported from the WordPress Redirection plugin (wp_redirection_items). */
const wpRedirects = JSON.parse(
  readFileSync(join(process.cwd(), 'content', 'redirects.json'), 'utf8')
);

const legacyAliases = [
  // Front page used to be reachable at /home and /home-2 in old templates
  { source: '/home', destination: '/', permanent: true },
  { source: '/home-2', destination: '/', permanent: true },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      ...legacyAliases,
      ...wpRedirects.map((r) => ({
        source: r.from,
        destination: r.to,
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
