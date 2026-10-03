import { notFound } from 'next/navigation';
import Link from 'next/link';
import WpHtml from '../../components/WpHtml';
import ContactForm from '../../components/ContactForm';
import { allPaths, getDoc, getIndex, postCssPath } from '../../lib/content';

export const dynamicParams = false;

// CPT archive slugs that had no standalone page in WordPress
const ARCHIVES = {
  magazine: { collection: 'magazines', title: 'Healing Our World Magazine' },
  'meal-plans-recipes': { collection: 'recipes', title: 'Meal Plans & Recipes' },
};

// Widget stylesheets the live single-post template (Elementor 10424) needs
// beyond the site-wide set in app/layout.jsx.
const POST_WIDGET_CSS = ['/wp-content/plugins/elementor-pro/assets/css/widget-author-box.min.css'];

// Pages whose archive listing gets appended after their content
const LIST_AFTER = {
  'learning-centre/blog': 'posts',
  'learning-centre/podcast': 'podcasts',
};

export function generateStaticParams() {
  return allPaths().map((p) => ({ slug: p.split('/') }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const path = slug.join('/');
  const doc = getDoc(path);
  if (!doc) {
    const arch = ARCHIVES[path];
    if (arch) return { title: arch.title };
    return {};
  }
  return {
    title: doc.seoTitle || doc.title,
    description: doc.seoDesc || doc.excerpt || undefined,
    alternates: doc.canonical ? { canonical: doc.canonical } : undefined,
    openGraph: {
      title: doc.ogTitle || doc.seoTitle || doc.title,
      description: doc.ogDesc || doc.seoDesc || undefined,
      images: doc.image ? [{ url: doc.image }] : undefined,
    },
  };
}

function PostIndex({ collection }) {
  const posts = getIndex(collection).sort((a, b) => (a.date < b.date ? 1 : -1));
  return (
    <div className="post-index">
      {posts.map((p) => (
        <article key={p.id} className="post-card">
          {p.image && (
            // eslint-disable-next-line @next/next/no-img-element
            <a href={`/${p.path}/`}><img src={p.image} alt="" loading="lazy" /></a>
          )}
          <h2><Link href={`/${p.path}/`}>{p.title}</Link></h2>
          {p.date && <time dateTime={p.date}>{new Date(p.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</time>}
          {p.excerpt && <p>{p.excerpt.slice(0, 220)}</p>}
        </article>
      ))}
    </div>
  );
}

export default async function CmsPage({ params }) {
  const { slug } = await params;
  const path = slug.join('/');
  const doc = getDoc(path);
  if (!doc) {
    const arch = ARCHIVES[path];
    if (!arch) notFound();
    return (
      <article>
        <header className="page-header"><h1>{arch.title}</h1></header>
        <PostIndex collection={arch.collection} />
      </article>
    );
  }
  // Pages rebuilt from the live site's rendered Elementor markup ship their
  // own full layout (headings, hero, sections) — render verbatim + its CSS.
  if (doc.content_live) {
    const css = [
      ...(doc.type === 'post' ? POST_WIDGET_CSS : []),
      ...(doc.css_live || []),
      postCssPath(doc.id),
    ].filter((href, i, all) => href && all.indexOf(href) === i);
    return (
      <article className={`cms-${doc.type} live`}>
        {css.map((href) => <link key={href} rel="stylesheet" href={href} />)}
        <WpHtml html={doc.content_live} />
        {path === 'contact-us' && <ContactForm />}
        {LIST_AFTER[path] && <PostIndex collection={LIST_AFTER[path]} />}
      </article>
    );
  }
  const cats = doc.terms?.category || [];
  return (
    <article className={`cms-${doc.type}`}>
      <header className="page-header">
        <h1>{doc.title}</h1>
        {doc.type !== 'page' && (
          <p className="post-meta">
            {doc.date && (
              <time dateTime={doc.date}>
                {new Date(doc.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </time>
            )}
            {cats.length > 0 && <> &middot; {cats.map((cat) => cat.name).join(', ')}</>}
          </p>
        )}
      </header>
      {doc.image && doc.type !== 'page' && (
        // eslint-disable-next-line @next/next/no-img-element
        <img className="featured-image" src={doc.image} alt={doc.title} />
      )}
      <WpHtml html={doc.content || ''} />
      {path === 'contact-us' && <ContactForm />}
      {LIST_AFTER[path] && <PostIndex collection={LIST_AFTER[path]} />}
    </article>
  );
}
