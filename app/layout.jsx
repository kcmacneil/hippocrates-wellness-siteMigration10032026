import '../styles/globals.css';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Hanken_Grotesk, Newsreader } from 'next/font/google';

const sans = Hanken_Grotesk({ subsets: ['latin'], variable: '--font-sans' });
const serif = Newsreader({ subsets: ['latin'], variable: '--font-serif' });

export const metadata = {
  metadataBase: new URL('https://hippocrateswellness.org'),
  title: {
    default: 'Hippocrates Wellness',
    template: '%s | Hippocrates Wellness',
  },
  description:
    'The world-leading wellness retreat for optimal health and longevity. Nearly 70 years of groundbreaking expertise at our 55-acre Florida oasis.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${sans.variable} ${serif.variable}`}>
      <body>
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
