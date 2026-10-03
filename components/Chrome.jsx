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

export function SitePopups() {
  const { popups = {} } = getChrome();
  return Object.entries(popups).map(([id, html]) => (
    <div key={id} id={`popup-${id}`} className="hw-popup" role="dialog" aria-modal="true" hidden>
      <link rel="stylesheet" href={`/wp-content/uploads/elementor/css/post-${id}.css`} />
      <button type="button" className="hw-popup-close" aria-label="Close menu">&times;</button>
      <div className="hw-popup-body" dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  ));
}
