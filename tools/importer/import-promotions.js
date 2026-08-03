/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import columnsSplitParser from './parsers/columns-split.js';
import cardsPromoParser from './parsers/cards-promo.js';

// TRANSFORMER IMPORTS
import cleanupTransformer from './transformers/discount-tire-cleanup.js';
import dmImagesTransformer from './transformers/discount-tire-dm-images.js';
import sectionsTransformer from './transformers/discount-tire-sections.js';

// PARSER REGISTRY
const parsers = {
  'columns-split': columnsSplitParser,
  'cards-promo': cardsPromoParser,
};

// TRANSFORMER REGISTRY
// Order matters: cleanup removes site chrome, DM images rewrites Scene7 URLs,
// then sections adds <hr> breaks + Section Metadata (afterTransform).
const transformers = [
  cleanupTransformer,
  dmImagesTransformer,
  sectionsTransformer,
];

// PAGE TEMPLATE CONFIGURATION
const PAGE_TEMPLATE = {
  name: 'promotions',
  description: 'Discount Tire promotions/deals page with hero, instant savings promo cards, credit card offers, low-price and financing sections, price reductions, and rebate cards',
  urls: ['https://www.discounttire.com/promotions'],
  blocks: [
    {
      name: 'columns-split',
      instances: [
        '.stacked-offer',
        '.greySection',
        '.hp-financing__container',
        '.stacked-credit',
      ],
    },
    {
      name: 'cards-promo',
      instances: [
        '.AEM-numbered-step',
        '.promoSpotlightContainer',
        '.low-price-experience',
        '.price-reduction-card',
        '.rebatePromoSpotlightBox',
        '.promoSpotlightContainerGrey.expiredPromos',
      ],
    },
  ],
  sections: [
    {
      id: 'section-1',
      name: 'Page intro (breadcrumbs + H1 + shop CTAs)',
      selector: '.toplevelpage',
      style: null,
      blocks: [],
      defaultContent: ['h1'],
    },
    {
      id: 'section-2',
      name: '$130 Instant Savings promo banner',
      selector: '.stacked-offer',
      style: 'grey',
      blocks: ['columns-split'],
      defaultContent: [],
    },
    {
      id: 'section-3',
      name: 'Sign In for Instant Savings — 3 numbered steps',
      selector: '.content__content___3VFmv > .AEM-content > .AEM-flex:has(.AEM-numbered-step)',
      style: null,
      blocks: ['cards-promo'],
      defaultContent: ['h2'],
    },
    {
      id: 'section-4',
      name: 'Two-up instant savings promo cards',
      selector: '.promoSpotlightContainer.containerXF',
      style: null,
      blocks: ['cards-promo'],
      defaultContent: [],
    },
    {
      id: 'section-5',
      name: 'Discount Tire credit card offers',
      selector: '.greySection',
      style: 'grey',
      blocks: ['columns-split'],
      defaultContent: [],
    },
    {
      id: 'section-6',
      name: 'Feature cards: Low Price / Confidence / Promise',
      selector: '.low-price-experience',
      style: null,
      blocks: ['cards-promo'],
      defaultContent: [],
    },
    {
      id: 'section-8',
      name: 'Easy, convenient financing',
      selector: '.hp-financing__container',
      style: null,
      blocks: ['columns-split'],
      defaultContent: [],
    },
    {
      id: 'section-9',
      name: 'Price Reductions — single card',
      selector: '.price-reduction-card',
      style: null,
      blocks: ['cards-promo'],
      defaultContent: ['h2'],
    },
    {
      id: 'section-10',
      name: 'Rebates by mail — 3 numbered steps',
      selector: '.cmp-experiencefragment--main-promotions-landing-page-content .AEM-flex',
      style: null,
      blocks: ['cards-promo'],
      defaultContent: ['h2'],
    },
    {
      id: 'section-11',
      name: 'Two-up rebate promo cards',
      selector: '.rebatePromoSpotlightBox',
      style: null,
      blocks: ['cards-promo'],
      defaultContent: [],
    },
    {
      id: 'section-12',
      name: 'Expired Rebates card grid',
      selector: '.promoSpotlightContainerGrey.expiredPromos',
      style: 'grey',
      blocks: ['cards-promo'],
      defaultContent: ['h3'],
    },
    {
      id: 'section-13',
      name: 'Credit card details + perks',
      selector: '.stacked-credit',
      style: 'grey',
      blocks: ['columns-split', 'cards-promo'],
      defaultContent: [],
    },
    {
      id: 'section-14',
      name: 'Legal disclosure',
      selector: '.disclaimer-text',
      style: null,
      blocks: [],
      defaultContent: ['p'],
    },
  ],
};

/**
 * Execute all page transformers for a specific hook
 */
function executeTransformers(hookName, element, payload) {
  const enhancedPayload = {
    ...payload,
    template: PAGE_TEMPLATE,
  };

  transformers.forEach((transformerFn) => {
    try {
      transformerFn.call(null, hookName, element, enhancedPayload);
    } catch (e) {
      console.error(`Transformer failed at ${hookName}:`, e);
    }
  });
}

/**
 * Find all blocks on the page based on the embedded template configuration
 */
function findBlocksOnPage(document, template) {
  const pageBlocks = [];

  template.blocks.forEach((blockDef) => {
    blockDef.instances.forEach((selector) => {
      const elements = document.querySelectorAll(selector);
      if (elements.length === 0) {
        console.warn(`Block "${blockDef.name}" selector not found: ${selector}`);
      }
      elements.forEach((element) => {
        pageBlocks.push({
          name: blockDef.name,
          selector,
          element,
          section: blockDef.section || null,
        });
      });
    });
  });

  console.log(`Found ${pageBlocks.length} block instances on page`);
  return pageBlocks;
}

export default {
  transform: (payload) => {
    const { document, url, params } = payload;

    const main = document.body;

    // 1. Execute beforeTransform transformers
    executeTransformers('beforeTransform', main, payload);

    // 2. Find blocks on page using embedded template
    const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);

    // 3. Parse each block using registered parsers.
    // Blocks are parsed in template order (containers before their nested
    // instances), so skip any element a prior parser already replaced/detached.
    pageBlocks.forEach((block) => {
      if (!block.element.parentNode) return; // already replaced by an earlier parser
      const parser = parsers[block.name];
      if (parser) {
        try {
          parser(block.element, { document, url, params });
        } catch (e) {
          console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
        }
      } else {
        console.warn(`No parser found for block: ${block.name}`);
      }
    });

    // 4. Execute afterTransform transformers (section breaks + metadata)
    executeTransformers('afterTransform', main, payload);

    // 5. Apply WebImporter built-in rules
    const hr = document.createElement('hr');
    main.appendChild(hr);
    WebImporter.rules.createMetadata(main, document);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    // 6. Generate sanitized path
    const path = WebImporter.FileUtils.sanitizePath(
      new URL(params.originalURL).pathname.replace(/\/$/, '').replace(/\.html$/, '') || '/index'
    );

    return [{
      element: main,
      path,
      report: {
        title: document.title,
        template: PAGE_TEMPLATE.name,
        blocks: pageBlocks.map((b) => b.name),
      },
    }];
  },
};
