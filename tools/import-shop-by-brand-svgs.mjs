#!/usr/bin/env node
/**
 * Re-import shop-by-brand SVG logos from discounttire.com.
 * Requires a JSON export of `.AEM-hp-shopByBrand` SVG markup (see README in icons/shop-by-brand).
 *
 * Usage:
 *   node tools/import-shop-by-brand-svgs.mjs /path/to/brands-export.json
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.resolve(__dirname, '../icons/shop-by-brand');

/**
 * @param {string} slug
 * @param {string} svg
 */
function cleanSvg(slug, svg) {
  let s = svg
    .replace(/\s*ncwce="[^"]*"/g, '')
    .replace(/\s+class="color-change"/g, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
  s = s.replace(/id="([^"]+)"/g, (_m, id) => `id="${slug}-${id}"`);
  s = s.replace(/url\(#([^)]+)\)/g, (_m, id) => `url(#${slug}-${id})`);
  if (!s.startsWith('<?xml')) {
    s = `<?xml version="1.0" encoding="UTF-8"?>\n${s}`;
  }
  return `${s}\n`;
}

const input = process.argv[2];
if (!input) {
  console.error('Usage: node tools/import-shop-by-brand-svgs.mjs <brands-export.json>');
  process.exit(1);
}

const brands = JSON.parse(fs.readFileSync(input, 'utf8'));
fs.mkdirSync(outDir, { recursive: true });

const meta = Object.entries(brands).map(([slug, svg]) => {
  const file = `${slug}.svg`;
  const content = cleanSvg(slug, svg);
  fs.writeFileSync(path.join(outDir, file), content);
  return { slug, file, bytes: content.length };
});

fs.writeFileSync(path.join(outDir, 'brands.json'), `${JSON.stringify(meta, null, 2)}\n`);
console.log(`Wrote ${meta.length} brand SVGs to ${outDir}`);
