import { getChrome } from '../lib/content';

// Renders the live site's scraped Elementor header/footer markup verbatim.
export function SiteChromeHeader() {
  const { header } = getChrome();
  if (!header) return null;
  // eslint-disable-next-line react/no-danger
  return <div className="site-chrome" dangerouslySetInnerHTML={{ __html: header }} />;
}

export function SiteChromeFooter() {
  const { footer } = getChrome();
  if (!footer) return null;
  // eslint-disable-next-line react/no-danger
  return <div className="site-chrome" dangerouslySetInnerHTML={{ __html: footer }} />;
}
