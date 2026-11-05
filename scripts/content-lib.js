// Small helpers shared by the content scripts.
import { readdirSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

// fileURLToPath keeps folder names with spaces working (a plain .pathname would turn a space into %20)
export const PUBLIC_DIR = fileURLToPath(new URL('../public', import.meta.url));
export const CONTENT_DIR = join(PUBLIC_DIR, 'content');

// All content .json files. Files starting with "_" (templates) and the generated index.json are skipped.
export function walkContent(dir = CONTENT_DIR) {
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) return walkContent(full);
    return name.endsWith('.json') && !name.startsWith('_') && name !== 'index.json' ? [full] : [];
  });
}

// Path with forward slashes, relative to the public folder: "content/tamil/starter-vocab.json"
export function publicPath(fullPath) {
  return relative(PUBLIC_DIR, fullPath).split(sep).join('/');
}
