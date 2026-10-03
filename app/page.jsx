import WpHtml from '../components/WpHtml';
import { getDoc, postCssPath } from '../lib/content';

export const metadata = {
  title: { absolute: 'Wellness Retreat in Florida | Hippocrates Wellness' },
  description:
    'Discover Hippocrates Wellness in Florida: immersive wellness programs, living-food nutrition, holistic education, events and ongoing support for lasting lifestyle change.',
  alternates: { canonical: '/' },
  openGraph: {
    title: 'Wellness Retreat in Florida | Hippocrates Wellness',
    description:
      'Discover Hippocrates Wellness in Florida: immersive wellness programs, living-food nutrition, holistic education, events and ongoing support for lasting lifestyle change.',
  },
};

export default function HomePage() {
  const doc = getDoc('home-2') || getDoc('home');
  if (!doc) return null;
  const html = doc.content_live || doc.content || '';
  const css = doc.content_live ? postCssPath(doc.id) : null;
  return (
    <>
      <h1 className="visually-hidden">{doc.title}</h1>
      {css && <link rel="stylesheet" href={css} />}
      <WpHtml html={html} />
    </>
  );
}
