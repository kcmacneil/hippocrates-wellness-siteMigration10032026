import Link from 'next/link';

export const metadata = { title: 'Page not found' };

export default function NotFound() {
  return (
    <div className="not-found">
      <h1>Page not found</h1>
      <p>The page you were looking for does not exist or may have moved.</p>
      <p>
        <Link href="/">Return to the homepage</Link> or{' '}
        <Link href="/contact-us/">contact us</Link>.
      </p>
    </div>
  );
}
