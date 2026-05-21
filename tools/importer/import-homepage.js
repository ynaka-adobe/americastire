/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import columnsSplitParser from './parsers/columns-split.js';
import heroPromoParser from './parsers/hero-promo.js';
import cardsServiceParser from './parsers/cards-service.js';
import carouselDealsParser from './parsers/carousel-deals.js';
import accordionFaqParser from './parsers/accordion-faq.js';

// TRANSFORMER IMPORTS
import cleanupTransformer from './transformers/americastire-cleanup.js';
import sectionsTransformer from './transformers/americastire-sections.js';

// PARSER REGISTRY
const parsers = {
  'columns-split': columnsSplitParser,
  'hero-promo': heroPromoParser,
  'cards-service': cardsServiceParser,
  'carousel-deals': carouselDealsParser,
  'accordion-faq': accordionFaqParser,
};

// TRANSFORMER REGISTRY
const transformers = [
  cleanupTransformer,
  sectionsTransformer,
];

// PAGE TEMPLATE CONFIGURATION
const PAGE_TEMPLATE = {
  name: 'homepage',
  description: 'America\'s Tire homepage with hero, tire search, promotions, and brand content',
  urls: ['https://www.americastire.com'],
  blocks: [
    {
      name: 'columns-split',
      instances: [
        '#synchrony_banner .home-dtcc-promo-container-class',
        '#split_entry .split-entry',
        '.hp-financing__container',
        '.treadwell-layout',
      ],
    },
    {
      name: 'hero-promo',
      instances: ['.home-page__home-hero-container'],
    },
    {
      name: 'cards-service',
      instances: [
        '.low-price-experience',
        '.AEM-hp-shopByCategory',
        '.service-card',
        '.AEM-hp-shopByBrand',
        '.featured-content-grid__container',
      ],
    },
    {
      name: 'carousel-deals',
      instances: ['.cms-promotion-carousel__container___3srXI'],
    },
    {
      name: 'accordion-faq',
      instances: ['.faq.parbase .FAQ-content'],
    },
  ],
  sections: [
    {
      id: 'section-1',
      name: 'Hero Section',
      selector: 'section.Section1E:first-of-type',
      style: null,
      blocks: ['columns-split', 'hero-promo', 'columns-split'],
      defaultContent: [],
    },
    {
      id: 'section-2',
      name: 'Deals Section',
      selector: 'section.PromoCarouselSection',
      style: null,
      blocks: ['cards-service', 'carousel-deals'],
      defaultContent: ['.heading h1'],
    },
    {
      id: 'section-3',
      name: 'Shop by Category',
      selector: 'section.Section1E:nth-of-type(2)',
      style: null,
      blocks: ['cards-service'],
      defaultContent: [],
    },
    {
      id: 'section-4',
      name: 'Services Heading',
      selector: 'section.hp_subheader:first-of-type',
      style: null,
      blocks: [],
      defaultContent: ['section.hp_subheader:first-of-type h2'],
    },
    {
      id: 'section-5',
      name: 'Service Cards',
      selector: 'section.service-card-container:first-of-type',
      style: null,
      blocks: ['cards-service'],
      defaultContent: [],
    },
    {
      id: 'section-6',
      name: 'Service CTAs',
      selector: 'section.hp_generic:nth-of-type(1)',
      style: null,
      blocks: [],
      defaultContent: ['section.hp_generic:nth-of-type(1) a'],
    },
    {
      id: 'section-7',
      name: 'Shop Tires Your Way',
      selector: 'section.hp_generic:nth-of-type(2)',
      style: null,
      blocks: ['columns-split'],
      defaultContent: [],
    },
    {
      id: 'section-8',
      name: 'Shop by Brand',
      selector: 'section.hp_generic:nth-of-type(3)',
      style: null,
      blocks: ['cards-service'],
      defaultContent: [],
    },
    {
      id: 'section-9',
      name: 'Financing',
      selector: 'section.Section1E:nth-of-type(3)',
      style: 'grey',
      blocks: ['columns-split'],
      defaultContent: [],
    },
    {
      id: 'section-10',
      name: 'Featured Content',
      selector: 'section.hp_generic:nth-of-type(4)',
      style: null,
      blocks: ['cards-service'],
      defaultContent: [],
    },
    {
      id: 'section-11',
      name: 'Learn Heading',
      selector: 'section.hp_subheader:nth-of-type(2)',
      style: null,
      blocks: [],
      defaultContent: ['section.hp_subheader:nth-of-type(2) h2'],
    },
    {
      id: 'section-12',
      name: 'Article Cards',
      selector: 'section.service-card-container:nth-of-type(2)',
      style: null,
      blocks: ['cards-service'],
      defaultContent: [],
    },
    {
      id: 'section-13',
      name: 'FAQ Section',
      selector: 'section.Section1E:nth-of-type(4)',
      style: null,
      blocks: ['accordion-faq'],
      defaultContent: [],
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

    // 3. Parse each block using registered parsers
    pageBlocks.forEach((block) => {
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
