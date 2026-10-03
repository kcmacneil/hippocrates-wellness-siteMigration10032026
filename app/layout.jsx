import '../styles/globals.css';
import { SiteChromeHeader, SiteChromeFooter, SitePopups } from '../components/Chrome';
import NavScript from '../components/NavScript';
import { Hanken_Grotesk, Newsreader } from 'next/font/google';

const sans = Hanken_Grotesk({ subsets: ['latin'], style: ['normal', 'italic'], variable: '--font-sans' });
const serif = Newsreader({ subsets: ['latin'], style: ['normal', 'italic'], variable: '--font-serif' });

export const metadata = {
  metadataBase: new URL('https://hippocrateswellness.org'),
  title: {
    default: 'Hippocrates Wellness',
    template: '%s - Hippocrates Wellness',
  },
  description:
    'The world-leading wellness retreat for optimal health and longevity. Nearly 70 years of groundbreaking expertise at our 55-acre Florida oasis.',
};

// Stylesheets mirrored from the live WordPress/Elementor site (served from
// /wp-content/... exactly as upstream so their relative url()s keep working).
const WP_CSS = [
  '/wp-content/hw-inline/wp-img-auto-sizes-contain-inline-css.css',
  '/wp-content/hw-inline/wp-emoji-styles-inline-css.css',
  '/wp-includes/css/dist/block-library/style.min.css',
  '/wp-content/hw-inline/global-styles-inline-css.css',
  '/wp-content/plugins/bulk-post-status-update/public/css/wp-bulk-post-status-update-public.css',
  '/wp-content/plugins/contact-form-7/includes/css/styles.css',
  '/wp-content/plugins/ht-slider-for-elementor/assets/css/ht-slider-widgets.css',
  '/wp-content/plugins/widget-google-reviews/assets/7.0/css/public-main.css',
  '/wp-content/themes/hello-elementor/assets/css/reset.css',
  '/wp-content/themes/hello-elementor/assets/css/theme.css',
  '/wp-content/themes/hello-elementor/assets/css/header-footer.css',
  '/wp-content/themes/hello-elementor-child/style.css',
  '/wp-content/themes/hello-elementor-child/fonts/font.css',
  '/wp-content/uploads/elementor/css/custom-frontend.min.css',
  '/wp-content/uploads/elementor/css/post-7.css',          // Elementor kit
  '/wp-content/plugins/3d-flipbook-dflip-lite/assets/css/dflip.min.css',
  '/wp-content/plugins/elementor-pro/assets/css/modules/sticky.min.css',
  '/wp-content/plugins/elementor/assets/css/widget-image.min.css',
  '/wp-content/uploads/elementor/css/custom-pro-widget-nav-menu.min.css',
  '/wp-content/plugins/elementor/assets/css/widget-heading.min.css',
  '/wp-content/uploads/elementor/css/custom-widget-icon-box.min.css',
  '/wp-content/uploads/elementor/css/custom-pro-widget-mega-menu.min.css',
  '/wp-content/plugins/elementor/assets/css/widget-social-icons.min.css',
  '/wp-content/uploads/elementor/css/custom-apple-webkit.min.css',
  '/wp-content/plugins/elementor/assets/css/widget-divider.min.css',
  '/wp-content/plugins/elementor-pro/assets/css/widget-post-info.min.css',
  '/wp-content/uploads/elementor/css/custom-widget-icon-list.min.css',
  '/wp-content/plugins/elementor-pro/assets/css/widget-loop-common.min.css',
  '/wp-content/uploads/elementor/css/custom-pro-widget-loop-grid.min.css',
  // Not in the live post <head>, but used by other mirrored pages.
  '/wp-content/plugins/elementor/assets/css/widget-spacer.min.css',
  '/wp-content/plugins/elementor/assets/css/widget-video.min.css',
  '/wp-content/plugins/elementor/assets/css/widget-image-carousel.min.css',
  '/wp-content/plugins/elementor/assets/lib/swiper/v8/css/swiper.min.css',
  '/wp-content/plugins/elementor-pro/assets/css/widget-posts.min.css',
  '/wp-content/plugins/elementor-pro/assets/css/widget-form.min.css',
  '/wp-content/plugins/elementor-pro/assets/css/widget-breadcrumbs.min.css',
  '/wp-content/plugins/elementor-pro/assets/css/widget-share-buttons.min.css',
  '/wp-content/plugins/elementor-pro/assets/css/widget-search.min.css',
  '/wp-content/uploads/elementor/css/custom-widget-image-box.min.css',
  '/wp-content/uploads/elementor/css/custom-widget-image-gallery.min.css',
  '/wp-content/uploads/elementor/css/custom-widget-tabs.min.css',
  '/wp-content/plugins/elementor/assets/lib/animations/styles/fadeInLeft.min.css',
  '/wp-content/plugins/elementor/assets/lib/animations/styles/fadeIn.min.css',
  '/wp-content/plugins/elementor-pro/assets/css/conditionals/popup.min.css',
  '/wp-content/uploads/elementor/css/post-10859.css',      // header template
  '/wp-content/uploads/elementor/css/post-10885.css',      // footer template
  '/vendor/slick-carousel/1.9.0/slick.min.css',
  '/vendor/slick-carousel/1.9.0/slick-theme.css',
  '/wp-content/hw-inline/wp-custom-css.css',               // Customizer "Additional CSS"
];

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${sans.variable} ${serif.variable}`}>
      <head>
        {WP_CSS.map((href) => (
          <link key={href} rel="stylesheet" href={href} />
        ))}
      </head>
      <body className="elementor-default elementor-kit-7">
        <SiteChromeHeader />
        <main>{children}</main>
        <SiteChromeFooter />
        <SitePopups />
        <NavScript />
      </body>
    </html>
  );
}
