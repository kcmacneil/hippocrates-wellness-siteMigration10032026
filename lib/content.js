import { readFileSync, readdirSync } from 'node:fs';
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
