#!/usr/bin/env node
/**
 * Extract tire product data from discounttire.com search (GraphQL).
 *
 *   node scripts/extract-dt-products.mjs michelin
 *   node scripts/extract-dt-products.mjs --query=":bestSeller-asc:brands:brand-BRI" --sort=BEST_SELLER
 *   node scripts/extract-dt-products.mjs michelin --store=2259 --pages=3 --out=fragments/tire-index.json
 *
 * Uses the same StandardSearchQuery API as https://www.discounttire.com/search?text=michelin
 * @see https://www.discounttire.com/webapi/discounttire.graph?op=StandardSearchQuery
 */

import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const GRAPHQL = `query StandardSearchQuery($search: ProductSearchInput!, $vehicleInfo: VehicleInput, $storeCode: String!) {
  productSearch {
    standardSearchQuery(search: $search, vehicleInfo: $vehicleInfo, storeCode: $storeCode) {
      pagination { currentPage numberOfPages totalNumberOfResults pageSize }
      results {
        name
        brand
        averageRating
        priceRange { minPrice { value formattedValue } maxPrice { value formattedValue } }
        images { url altText }
        url
        reviewSummaryData { totalCount }
        productType
        aggregates { itemType }
      }
    }
  }
}`;

const HOST = 'https://www.discounttire.com';
const API = `${HOST}/webapi/discounttire.graph?op=StandardSearchQuery`;

/**
 * @param {object} opts
 */
async function fetchSearchPage(opts) {
  const {
    text,
    catalogQuery,
    sort,
    storeCode,
    pageNumber,
    pageSize,
  } = opts;

  const body = {
    operationName: 'StandardSearchQuery',
    query: GRAPHQL,
    variables: {
      search: {
        applyFallBack: true,
        freeText: text || '',
        initialFacets: [],
        initialFilters: [],
        nearByStoreCodes: [],
        page: { pageNumber, pageSize, sort: sort || 'RELEVANCE' },
        productType: 'ALL',
        query: catalogQuery || '',
        queryType: 'BRAND_SEARCH',
      },
      vehicleInfo: null,
      storeCode,
    },
  };

  const referer = catalogQuery
    ? `${HOST}/search?q=${encodeURIComponent(catalogQuery)}&sort=bestSeller-asc&page=${pageNumber}&storeCode=${storeCode}`
    : `${HOST}/search?text=${encodeURIComponent(text)}&storeCode=${storeCode}`;

  const resp = await fetch(API, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Origin: HOST,
      Referer: referer,
      'User-Agent': 'Mozilla/5.0 (compatible; americastire-extract/1.0)',
    },
    body: JSON.stringify(body),
  });

  if (!resp.ok) {
    throw new Error(`API HTTP ${resp.status}`);
  }

  const json = await resp.json();
  if (json.errors?.length) {
    throw new Error(json.errors.map((e) => e.message).join('; '));
  }

  return json.data?.productSearch?.standardSearchQuery;
}

/**
 * @param {Record<string, unknown>} product
 * @param {number} rank
 */
function mapToIndexRow(product, rank) {
  const min = product.priceRange?.minPrice?.value;
  const slug = String(product.url || '').split('?')[0];
  const path = slug.startsWith('http') ? slug : `${HOST}${slug}`;
  const reviews = product.reviewSummaryData?.totalCount;
  const itemType = product.aggregates?.itemType || product.productType;

  return {
    sku: slug.split('/').pop() || `dt-${rank}`,
    brand: product.brand || '',
    name: product.name || '',
    category: /truck|suv|lt/i.test(String(itemType)) ? 'Truck / SUV' : 'Passenger',
    type: String(itemType || 'Tire').replace(/^aggregate$/i, 'All Season'),
    size: '',
    price: min != null ? Number(min) : null,
    rating: product.averageRating != null ? Number(product.averageRating) : null,
    reviews: reviews != null ? Number(reviews) : null,
    rank: 100 - rank,
    image: product.images?.[0]?.url || '',
    path,
    keywords: [product.brand, product.name, itemType].filter(Boolean).join(' ').toLowerCase(),
  };
}

function parseArgs(argv) {
  const positional = argv[2] && !argv[2].startsWith('--') ? argv[2] : '';
  const opts = {
    text: positional,
    catalogQuery: '',
    sort: 'RELEVANCE',
    storeCode: '2259',
    pages: 1,
    pageSize: 12,
    out: '',
  };
  argv.slice(positional ? 3 : 2).forEach((arg) => {
    if (arg.startsWith('--store=')) opts.storeCode = arg.slice(8);
    else if (arg.startsWith('--pages=')) opts.pages = Number(arg.slice(8));
    else if (arg.startsWith('--size=')) opts.pageSize = Number(arg.slice(7));
    else if (arg.startsWith('--out=')) opts.out = arg.slice(6);
    else if (arg.startsWith('--query=')) opts.catalogQuery = arg.slice(8);
    else if (arg.startsWith('--sort=')) opts.sort = arg.slice(7);
  });
  if (!opts.text && !opts.catalogQuery) {
    console.error('Usage: node scripts/extract-dt-products.mjs <search-text> [options]');
    console.error('   or: node scripts/extract-dt-products.mjs --query=":bestSeller-asc:brands:brand-BRI" --sort=BEST_SELLER');
    process.exit(1);
  }
  return opts;
}

async function main() {
  const opts = parseArgs(process.argv);
  const all = [];
  let total = 0;

  for (let page = 0; page < opts.pages; page += 1) {
    const result = await fetchSearchPage({
      text: opts.text,
      catalogQuery: opts.catalogQuery,
      sort: opts.sort,
      storeCode: opts.storeCode,
      pageNumber: page,
      pageSize: opts.pageSize,
    });
    if (!result?.results?.length) break;
    total = result.pagination?.totalNumberOfResults || total;
    result.results.forEach((p) => all.push(mapToIndexRow(p, all.length)));
    if (page + 1 >= (result.pagination?.numberOfPages || 1)) break;
  }

  const sheet = {
    total: all.length,
    offset: 0,
    limit: all.length,
    data: all,
    ':type': 'sheet',
    meta: {
      source: opts.catalogQuery
        ? `${HOST}/search?q=${encodeURIComponent(opts.catalogQuery)}`
        : `${HOST}/search?text=${encodeURIComponent(opts.text)}`,
      storeCode: opts.storeCode,
      extractedAt: new Date().toISOString(),
      upstreamTotal: total,
    },
  };

  const json = `${JSON.stringify(sheet, null, 2)}\n`;
  if (opts.out) {
    const outPath = resolve(process.cwd(), opts.out);
    writeFileSync(outPath, json);
    console.log(`Wrote ${all.length} products (${total} upstream) -> ${outPath}`);
  } else {
    process.stdout.write(json);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
