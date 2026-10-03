// Elementor's image carousel gets its slide spacing from Swiper's JS
// (spaceBetween = data-settings image_spacing_custom), which we don't ship.
// Expose it as CSS custom properties so styles/globals.css can lay the
// uninitialized carousel out the same way.
const CAROUSEL_RE = /<div class="[^"]*\belementor-widget-image-carousel\b[^"]*"[^>]*?data-settings="([^"]*)"[^>]*>/g;
const GAP_VARS = { image_spacing_custom: '--hw-swiper-gap', image_spacing_custom_tablet: '--hw-swiper-gap-tablet', image_spacing_custom_mobile: '--hw-swiper-gap-mobile' };

function carouselGaps(html) {
  return html.replace(CAROUSEL_RE, (tag, settings) => {
    if (/\sstyle="/.test(tag)) return tag;
    let parsed;
    try {
      parsed = JSON.parse(settings.replace(/&quot;/g, '"'));
    } catch {
      return tag;
    }
    const vars = Object.entries(GAP_VARS)
      .filter(([key]) => parsed[key] && parsed[key].size !== '' && parsed[key].size != null)
      .map(([key, prop]) => `${prop}:${Number(parsed[key].size)}${parsed[key].unit || 'px'}`);
    return vars.length ? tag.replace(/>$/, ` style="${vars.join(';')}">`) : tag;
  });
}

export default function WpHtml({ html }) {
  // Content was extracted from the WordPress backup with URLs already rewritten
  // to root-relative paths (see tools/extract.py).
  return <div className="wp-content" dangerouslySetInnerHTML={{ __html: carouselGaps(html) }} />;
}
