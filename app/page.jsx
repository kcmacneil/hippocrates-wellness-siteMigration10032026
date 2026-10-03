import WpHtml from '../components/WpHtml';
import { getDoc } from '../lib/content';

export const metadata = {
  title: 'Hippocrates Wellness | Your path to optimal health',
  description:
    'Discover the secret to optimal health and wellness with the original pioneers of longevity. Stay with us at our 55-acre Florida oasis.',
};

export default function HomePage() {
  const doc = getDoc('home-2') || getDoc('home');
  if (!doc) return null;
  return (
    <>
      <h1 className="visually-hidden">{doc.title}</h1>
      <WpHtml html={doc.content} />
    </>
  );
}
