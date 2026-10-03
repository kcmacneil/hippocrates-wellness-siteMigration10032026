import Link from 'next/link';
import { getMenus } from '../lib/content';

function tree(items) {
  const byParent = new Map();
  for (const it of items) {
    const p = it.parent || 0;
    if (!byParent.has(p)) byParent.set(p, []);
    byParent.get(p).push(it);
  }
  const build = (pid) => (byParent.get(pid) || []).map((it) => ({ ...it, children: build(it.id) }));
  return build(0);
}

export default function Header() {
  const menus = getMenus();
  const nav = tree(menus['main-menu'] || []);
  return (
    <header className="site-header">
      <div className="header-inner">
        <Link href="/" className="site-logo" aria-label="Hippocrates Wellness home">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/wp-content/uploads/2025/04/we-are-the-original.svg" alt="Hippocrates Wellness" />
          <span className="site-name">Hippocrates Wellness</span>
        </Link>
        <nav className="main-nav" aria-label="Main navigation">
          <ul>
            {nav.map((item) => (
              <li key={item.id} className={item.children.length ? 'has-children' : ''}>
                <Link href={item.url || '#'}>{item.title}</Link>
                {item.children.length > 0 && (
                  <ul className="sub-menu">
                    {item.children.map((ch) => (
                      <li key={ch.id}><Link href={ch.url || '#'}>{ch.title}</Link></li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}
