import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div className="footer-col">
          <p className="footer-brand">Hippocrates Wellness</p>
          <p>
            For nearly 70 years, Hippocrates Wellness in West Palm Beach, Florida,
            has helped people transform their health through nutritional
            counseling, therapies, lectures, and organic cuisine.
          </p>
        </div>
        <div className="footer-col">
          <p className="footer-heading">Contact</p>
          <p>
            1443 Palmdale Court<br />
            West Palm Beach, FL 33411<br />
            <a href="tel:+15614711002">(561) 471-8876</a><br />
            <a href="mailto:info@hippocrateswellness.org">info@hippocrateswellness.org</a>
          </p>
        </div>
        <div className="footer-col">
          <p className="footer-heading">Explore</p>
          <ul>
            <li><Link href="/programs/resort-programs/">Resort Programs</Link></li>
            <li><Link href="/blog/">Blog</Link></li>
            <li><Link href="/podcast/">Podcast</Link></li>
            <li><Link href="/healing-our-world-magazine/">Magazine</Link></li>
            <li><Link href="/contact-us/">Contact Us</Link></li>
          </ul>
        </div>
        <div className="footer-col">
          <p className="footer-heading">Legal</p>
          <ul>
            <li><Link href="/privacy-policy/">Privacy Policy</Link></li>
            <li><Link href="/terms-and-conditions/">Terms and Conditions</Link></li>
            <li><Link href="/cookie-policy/">Cookie Policy</Link></li>
            <li><Link href="/hipaa-statement/">HIPAA Statement</Link></li>
            <li><Link href="/returns-policy/">Returns Policy</Link></li>
          </ul>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} Hippocrates Wellness. All rights reserved.</p>
      </div>
    </footer>
  );
}
