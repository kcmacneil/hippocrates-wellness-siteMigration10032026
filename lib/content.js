import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const CONTENT = join(process.cwd(), 'content');
const COLLECTIONS = [
  'pages', 'posts', 'podcasts', 'recipes', 'magazines', 'resort',
  'journeys', 'experts', 'learning-centre', 'newsletters', 'flipbooks', 'resort-cpt',
];

let byPath;
export function getByPath() {
  if (byPath) return byPath;
  byPath = new Map();
  for (const col of COLLECTIONS) {
    const dir = join(CONTENT, col);
    let files = [];
    try { files = readdirSync(dir); } catch { continue; }
    for (const f of files) {
      const doc = JSON.parse(readFileSync(join(dir, f), 'utf8'));
      // Same URL in two collections (e.g. a post and a recipe CPT): the later
      // collection wins, but keeps the live markup scraped for that URL.
      const prev = byPath.get(doc.path);
      if (prev?.content_live && !doc.content_live) {
        doc.content_live = prev.content_live;
        doc.css_live = prev.css_live;
      }
      byPath.set(doc.path, doc);
    }
  }
  return byPath;
}

export function getDoc(path) {
  return getByPath().get(path) || null;
}

export function allPaths() {
  return [...getByPath().keys()];
}

export function getIndex(collection) {
  try {
    return JSON.parse(readFileSync(join(CONTENT, `index-${collection}.json`), 'utf8'));
  } catch {
    return [];
  }
}

export function getMenus() {
  return JSON.parse(readFileSync(join(CONTENT, 'menus.json'), 'utf8'));
}

export function getCategories() {
  try { return JSON.parse(readFileSync(join(CONTENT, 'categories.json'), 'utf8')); }
  catch { return []; }
}

// Header/footer markup scraped from the live site's Elementor templates
let chrome;
export function getChrome() {
  if (!chrome) chrome = JSON.parse(readFileSync(join(CONTENT, 'live-chrome.json'), 'utf8'));
  return chrome;
}

// Does an Elementor per-post stylesheet exist for this WP post id?
export function postCssPath(id) {
  const rel = `/wp-content/uploads/elementor/css/post-${id}.css`;
  return existsSync(join(process.cwd(), 'public', rel)) ? rel : null;
}
