export default function WpHtml({ html }) {
  // Content was extracted from the WordPress backup with URLs already rewritten
  // to root-relative paths (see tools/extract.py).
  return <div className="wp-content" dangerouslySetInnerHTML={{ __html: html }} />;
}
