#!/usr/bin/env node
/**
 * Push a local .plain.html snapshot to DA source (BYOM).
 *
 *   export DA_IMS_TOKEN="your-ims-bearer-token"
 *   node scripts/push-da-page.mjs content-search
 *
 * @see https://docs.da.live/developers/api/source
 */

import { readFileSync } from 'node:fs';
import { basename, resolve } from 'node:path';

const org = 'ynaka-adobe';
const repo = 'americastire';
const page = process.argv[2];

if (!page) {
  console.error('Usage: node scripts/push-da-page.mjs <page-name>');
  process.exit(1);
}

const token = process.env.DA_IMS_TOKEN;
if (!token) {
  console.error('Set DA_IMS_TOKEN (IMS bearer token from da.live session).');
  process.exit(1);
}

const filePath = resolve(process.cwd(), `${page}.plain.html`);
const html = readFileSync(filePath, 'utf8');
const target = `https://admin.da.live/source/${org}/${repo}/${page}.html`;

const body = new FormData();
body.append('data', new Blob([html], { type: 'text/html' }), `${basename(page)}.html`);

const resp = await fetch(target, {
  method: 'POST',
  headers: { Authorization: `Bearer ${token}` },
  body,
});

if (!resp.ok) {
  console.error(`Upload failed (${resp.status}):`, await resp.text());
  process.exit(1);
}

console.log(`Uploaded ${filePath} -> ${target}`);
console.log('Preview: POST https://admin.hlx.page/preview/ynaka-adobe/americastire/main/' + page);
