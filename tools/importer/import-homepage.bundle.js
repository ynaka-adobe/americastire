/* eslint-disable */
var CustomImportScript = (() => {
  var __defProp = Object.defineProperty;
  var __defProps = Object.defineProperties;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __spreadValues = (a, b) => {
    for (var prop in b || (b = {}))
      if (__hasOwnProp.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    if (__getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(b)) {
        if (__propIsEnum.call(b, prop))
          __defNormalProp(a, prop, b[prop]);
      }
    return a;
  };
  var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // tools/importer/import-homepage.js
  var import_homepage_exports = {};
  __export(import_homepage_exports, {
    default: () => import_homepage_default
  });

  // tools/importer/parsers/columns-split.js
  function parse(element, { document }) {
    const cells = [];
    if (element.classList.contains("home-dtcc-promo-container-class")) {
      const imageCol = [];
      const textCol = [];
      const img = element.querySelector(".home-dtcc-promo-text-class__images img");
      if (img) imageCol.push(img);
      const promoText = element.querySelector(".home-dtcc-promo-text-class");
      if (promoText) textCol.push(promoText);
      const link = element.querySelector(".home-dtcc-promo-text-class__link a");
      if (link) textCol.push(link);
      cells.push([imageCol, textCol]);
    } else if (element.classList.contains("split-entry")) {
      const leftCol = [];
      const rightCol = [];
      const leftImg = element.querySelector(".split-entry__body__left__image img");
      if (leftImg) leftCol.push(leftImg);
      const leftDesc = element.querySelector(".split-entry__body__left .split-entry__body__description");
      if (leftDesc) leftCol.push(leftDesc);
      const leftCta = element.querySelector(".split-entry__body__left > a, .split-entry__body__left a.button");
      if (leftCta) leftCol.push(leftCta);
      const rightImg = element.querySelector(".split-entry__body__right__image img");
      if (rightImg) rightCol.push(rightImg);
      const rightDesc = element.querySelector(".split-entry__body__right .split-entry__body__description");
      if (rightDesc) rightCol.push(rightDesc);
      const rightCta = element.querySelector(".split-entry__body__right > a, .split-entry__body__right a.button");
      if (rightCta) rightCol.push(rightCta);
      cells.push([leftCol, rightCol]);
    } else if (element.classList.contains("treadwell-layout")) {
      const leftCol = [];
      const rightCol = [];
      const treadwellCard = element.querySelector(".treadwell-card");
      if (treadwellCard) {
        const treadImg = treadwellCard.querySelector(":scope > img");
        if (treadImg) leftCol.push(treadImg);
        const treadTitle = treadwellCard.querySelector(".treadwell-card__title");
        if (treadTitle) leftCol.push(treadTitle);
        const treadDesc = treadwellCard.querySelector(".treadwell-card__description");
        if (treadDesc) leftCol.push(treadDesc);
        const treadSteps = treadwellCard.querySelector(".treadwell-card__steps");
        if (treadSteps) leftCol.push(treadSteps);
        const treadTime = treadwellCard.querySelector(".treadwell-card__time");
        if (treadTime) leftCol.push(treadTime);
        const treadCta = treadwellCard.querySelector(".treadwell-card__cta");
        if (treadCta) leftCol.push(treadCta);
        const treadFootnote = treadwellCard.querySelector(".treadwell-card__footnote");
        if (treadFootnote) leftCol.push(treadFootnote);
      }
      const sizeCard = element.querySelector(".size-card");
      if (sizeCard) {
        const sizeTitle = sizeCard.querySelector(".size-card__title");
        if (sizeTitle) rightCol.push(sizeTitle);
        const sizeDesc = sizeCard.querySelector(".size-card__description");
        if (sizeDesc) rightCol.push(sizeDesc);
        const sizeCta = sizeCard.querySelector(".size-card__cta");
        if (sizeCta) rightCol.push(sizeCta);
        const sizeImg = sizeCard.querySelector(".size-card__figure img");
        if (sizeImg) rightCol.push(sizeImg);
        const popularSizes = sizeCard.querySelector(".popular-sizes");
        if (popularSizes) rightCol.push(popularSizes);
      }
      cells.push([leftCol, rightCol]);
    } else if (element.classList.contains("hp-financing__container")) {
      const cards = element.querySelectorAll(".hp-financing__card");
      const leftCol = [];
      const rightCol = [];
      if (cards.length >= 1) {
        const card1 = cards[0];
        const copy1 = card1.querySelector(".hp-financing__card__copy");
        if (copy1) leftCol.push(copy1);
        const img1 = card1.querySelector(".hp-financing__card__img img");
        if (img1) leftCol.push(img1);
        const cta1 = card1.querySelector(".hp-financing__card__img a");
        if (cta1) leftCol.push(cta1);
      }
      if (cards.length >= 2) {
        const card2 = cards[1];
        const copy2 = card2.querySelector(".hp-financing__card__copy");
        if (copy2) rightCol.push(copy2);
        const img2 = card2.querySelector(".hp-financing__card__img img");
        if (img2) rightCol.push(img2);
      }
      cells.push([leftCol, rightCol]);
    } else {
      const children = Array.from(element.children);
      if (children.length >= 2) {
        const mid = Math.floor(children.length / 2);
        cells.push([children.slice(0, mid), children.slice(mid)]);
      } else {
        cells.push([children]);
      }
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "columns-split", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/hero-promo.js
  function parse2(element, { document }) {
    const link = element.querySelector("a[href], a.home-page__hero-image");
    const picture = element.querySelector("picture");
    const img = element.querySelector("img");
    const cells = [];
    if (link && (picture || img)) {
      cells.push([link]);
    } else if (picture || img) {
      cells.push([picture || img]);
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "hero-promo", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-service.js
  function parse3(element, { document }) {
    const cells = [];
    let cardItems = [];
    if (element.classList.contains("low-price-experience")) {
      cardItems = Array.from(element.querySelectorAll(":scope > div"));
    } else if (element.classList.contains("AEM-hp-shopByCategory")) {
      cardItems = Array.from(element.querySelectorAll(':scope .category-item, :scope .shop-by-category-item, :scope a[class*="category"]'));
      if (cardItems.length === 0) {
        cardItems = Array.from(element.querySelectorAll(":scope > div > a, :scope > ul > li, :scope > div > div"));
      }
    } else if (element.classList.contains("service-card")) {
      cardItems = Array.from(element.querySelectorAll(":scope .service-card__item, :scope .service-card-item, :scope > div"));
      if (cardItems.length === 0) {
        cardItems = Array.from(element.querySelectorAll(":scope article, :scope > a, :scope li"));
      }
    } else if (element.classList.contains("AEM-hp-shopByBrand")) {
      cardItems = Array.from(element.querySelectorAll(':scope a[class*="brand"], :scope .brand-item, :scope > div > a'));
      if (cardItems.length === 0) {
        cardItems = Array.from(element.querySelectorAll(":scope > div > div, :scope li, :scope > div > a"));
      }
    } else if (element.classList.contains("featured-content-grid__container")) {
      cardItems = Array.from(element.querySelectorAll(':scope .featured-content-grid__item, :scope [class*="featured-content"] > div, :scope > div > div'));
      if (cardItems.length === 0) {
        cardItems = Array.from(element.querySelectorAll(":scope > div, :scope > a, :scope article"));
      }
    } else {
      cardItems = Array.from(element.querySelectorAll(":scope > div, :scope > li, :scope > a"));
    }
    cardItems.forEach((card) => {
      const images = Array.from(card.querySelectorAll("img"));
      const mainImage = images.find((img) => {
        const src = img.getAttribute("src") || "";
        if (src.includes("dot-corner-bg")) return false;
        if (src.startsWith("data:image/svg+xml")) return false;
        return true;
      }) || images.find((img) => {
        const src = img.getAttribute("src") || "";
        return src.startsWith("data:image/svg+xml");
      });
      const textContent = [];
      const heading = card.querySelector("h1, h2, h3, h4, h5, h6");
      if (heading) {
        textContent.push(heading);
      }
      const description = card.querySelector('p, :scope > div > span, :scope > span, [class*="content"] > span');
      if (description && description !== heading) {
        textContent.push(description);
      }
      const ctaLinks = Array.from(card.querySelectorAll('a.card-text-link, a[class*="cta"], a.button:not(.card-overlay-link)'));
      if (ctaLinks.length > 0) {
        textContent.push(...ctaLinks);
      } else {
        const fallbackLink = card.querySelector('a:not(.card-overlay-link):not([class*="overlay"])');
        if (fallbackLink && !heading && textContent.length === 0) {
          textContent.push(fallbackLink);
        }
      }
      if (mainImage || textContent.length > 0) {
        const imageCell = mainImage ? [mainImage] : [""];
        const textCell = textContent.length > 0 ? textContent : [""];
        cells.push([imageCell, textCell]);
      }
    });
    const block = WebImporter.Blocks.createBlock(document, { name: "cards-service", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/carousel-deals.js
  function parse4(element, { document }) {
    const slides = element.querySelectorAll('[class*="cms-promotion-carousel__slide"]');
    const cells = [];
    slides.forEach((slide) => {
      const promoLink = slide.querySelector('a[class*="promo-link"]');
      const img = slide.querySelector('img[class*="image__img"]');
      const contentDiv = slide.querySelector('[class*="carousel-content"]');
      const contentCell = [];
      if (contentDiv) {
        const descriptionEl = contentDiv.querySelector('p[class*="offer-description"]');
        if (descriptionEl) {
          const descClone = descriptionEl.cloneNode(true);
          const expirationSpan = descClone.querySelector('[class*="offer-expiration"]');
          let descText = "";
          if (expirationSpan) {
            descText = descClone.textContent.replace(expirationSpan.textContent, "").trim();
            const descP = document.createElement("p");
            descP.textContent = descText;
            contentCell.push(descP);
            const expP = document.createElement("em");
            expP.textContent = expirationSpan.textContent.trim();
            contentCell.push(expP);
          } else {
            contentCell.push(descriptionEl);
          }
        }
        const primaryCta = contentDiv.querySelector('a[class*="see-products-button"]');
        const secondaryCta = contentDiv.querySelector('a[class*="see-details-button"]');
        if (primaryCta) contentCell.push(primaryCta);
        if (secondaryCta) contentCell.push(secondaryCta);
      }
      const imageCell = [];
      if (promoLink && img) {
        const link = document.createElement("a");
        link.href = promoLink.href;
        link.appendChild(img.cloneNode(true));
        imageCell.push(link);
      } else if (img) {
        imageCell.push(img);
      }
      if (imageCell.length > 0 || contentCell.length > 0) {
        cells.push([imageCell, contentCell]);
      }
    });
    const block = WebImporter.Blocks.createBlock(document, { name: "carousel-deals", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/accordion-faq.js
  function parse5(element, { document }) {
    const faqItems = element.querySelectorAll(".wrap-collabsible-FAQs");
    const cells = [];
    faqItems.forEach((item) => {
      const questionEl = item.querySelector("label.lbl-toggle-FAQs h3, label.lbl-toggle-FAQs h4, label.lbl-toggle-FAQs");
      const answerEl = item.querySelector(".content-inner-FAQs > div, .content-inner-FAQs p, .collapsible-content-FAQs .content-inner-FAQs");
      if (questionEl && answerEl) {
        cells.push([questionEl, answerEl]);
      }
    });
    const block = WebImporter.Blocks.createBlock(document, { name: "accordion-faq", cells });
    element.replaceWith(block);
  }

  // tools/importer/transformers/americastire-cleanup.js
  var H = { before: "beforeTransform", after: "afterTransform" };
  function transform(hookName, element, payload) {
    if (hookName === H.before) {
      WebImporter.DOMUtils.remove(element, [
        ".ReactModalPortal",
        ".ReactModal__Overlay"
      ]);
      WebImporter.DOMUtils.remove(element, [
        ".accessibility-button__container___34DGl"
      ]);
      WebImporter.DOMUtils.remove(element, [
        ".mobile-header-store-view__container___1_Xra"
      ]);
      WebImporter.DOMUtils.remove(element, [
        '[class*="cf-prompt-container"]',
        '[class*="cf_invite_"]'
      ]);
    }
    if (hookName === H.after) {
      WebImporter.DOMUtils.remove(element, [
        "header#header"
      ]);
      WebImporter.DOMUtils.remove(element, [
        "footer.footer__wrapper___TuAIH"
      ]);
      WebImporter.DOMUtils.remove(element, [
        "iframe"
      ]);
      WebImporter.DOMUtils.remove(element, [
        "#popover-root",
        "#tooltip-root",
        "#dnd-root"
      ]);
      const stickyLink = element.querySelector('a[href="/sticky-products"]');
      if (stickyLink) stickyLink.remove();
      const trackingImgs = element.querySelectorAll('img[src*="googleadservices"], img[src*="demdex.net"]');
      trackingImgs.forEach((img) => img.remove());
      const sections = element.querySelectorAll("section.section__container___gceoT");
      sections.forEach((section) => {
        const content = section.querySelector(".section__content___l3N2-");
        if (content) {
          const textContent = content.textContent.trim();
          const hasOnlyBr = textContent === "" && content.querySelectorAll("*").length <= 2;
          const hasMeaningfulChildren = content.querySelector('img, a, h1, h2, h3, h4, h5, h6, p:not(:empty), [class*="container"]');
          if (hasOnlyBr && !hasMeaningfulChildren) {
            section.remove();
          }
        }
      });
      WebImporter.DOMUtils.remove(element, [
        ".T387-banner-modified"
      ]);
    }
  }

  // tools/importer/transformers/americastire-sections.js
  var H2 = { before: "beforeTransform", after: "afterTransform" };
  function transform2(hookName, element, payload) {
    if (hookName === H2.after) {
      const { template } = payload || {};
      const sections = template && template.sections;
      if (!sections || sections.length < 2) return;
      const document = element.ownerDocument;
      for (let i = sections.length - 1; i >= 0; i--) {
        const section = sections[i];
        if (!section.selector) continue;
        const sectionEl = element.querySelector(section.selector);
        if (!sectionEl) continue;
        if (section.style) {
          const metaBlock = WebImporter.Blocks.createBlock(document, {
            name: "Section Metadata",
            cells: { style: section.style }
          });
          sectionEl.append(metaBlock);
        }
        if (i > 0) {
          const hr = document.createElement("hr");
          sectionEl.before(hr);
        }
      }
    }
  }

  // tools/importer/import-homepage.js
  var parsers = {
    "columns-split": parse,
    "hero-promo": parse2,
    "cards-service": parse3,
    "carousel-deals": parse4,
    "accordion-faq": parse5
  };
  var transformers = [
    transform,
    transform2
  ];
  var PAGE_TEMPLATE = {
    name: "homepage",
    description: "America's Tire homepage with hero, tire search, promotions, and brand content",
    urls: ["https://www.americastire.com"],
    blocks: [
      {
        name: "columns-split",
        instances: [
          "#synchrony_banner .home-dtcc-promo-container-class",
          "#split_entry .split-entry",
          ".hp-financing__container",
          ".treadwell-layout"
        ]
      },
      {
        name: "hero-promo",
        instances: [".home-page__home-hero-container"]
      },
      {
        name: "cards-service",
        instances: [
          ".low-price-experience",
          ".AEM-hp-shopByCategory",
          ".service-card",
          ".AEM-hp-shopByBrand",
          ".featured-content-grid__container"
        ]
      },
      {
        name: "carousel-deals",
        instances: [".cms-promotion-carousel__container___3srXI"]
      },
      {
        name: "accordion-faq",
        instances: [".faq.parbase .FAQ-content"]
      }
    ],
    sections: [
      {
        id: "section-1",
        name: "Hero Section",
        selector: "section.Section1E:first-of-type",
        style: null,
        blocks: ["columns-split", "hero-promo", "columns-split"],
        defaultContent: []
      },
      {
        id: "section-2",
        name: "Deals Section",
        selector: "section.PromoCarouselSection",
        style: null,
        blocks: ["cards-service", "carousel-deals"],
        defaultContent: [".heading h1"]
      },
      {
        id: "section-3",
        name: "Shop by Category",
        selector: "section.Section1E:nth-of-type(2)",
        style: null,
        blocks: ["cards-service"],
        defaultContent: []
      },
      {
        id: "section-4",
        name: "Services Heading",
        selector: "section.hp_subheader:first-of-type",
        style: null,
        blocks: [],
        defaultContent: ["section.hp_subheader:first-of-type h2"]
      },
      {
        id: "section-5",
        name: "Service Cards",
        selector: "section.service-card-container:first-of-type",
        style: null,
        blocks: ["cards-service"],
        defaultContent: []
      },
      {
        id: "section-6",
        name: "Service CTAs",
        selector: "section.hp_generic:nth-of-type(1)",
        style: null,
        blocks: [],
        defaultContent: ["section.hp_generic:nth-of-type(1) a"]
      },
      {
        id: "section-7",
        name: "Shop Tires Your Way",
        selector: "section.hp_generic:nth-of-type(2)",
        style: null,
        blocks: ["columns-split"],
        defaultContent: []
      },
      {
        id: "section-8",
        name: "Shop by Brand",
        selector: "section.hp_generic:nth-of-type(3)",
        style: null,
        blocks: ["cards-service"],
        defaultContent: []
      },
      {
        id: "section-9",
        name: "Financing",
        selector: "section.Section1E:nth-of-type(3)",
        style: "grey",
        blocks: ["columns-split"],
        defaultContent: []
      },
      {
        id: "section-10",
        name: "Featured Content",
        selector: "section.hp_generic:nth-of-type(4)",
        style: null,
        blocks: ["cards-service"],
        defaultContent: []
      },
      {
        id: "section-11",
        name: "Learn Heading",
        selector: "section.hp_subheader:nth-of-type(2)",
        style: null,
        blocks: [],
        defaultContent: ["section.hp_subheader:nth-of-type(2) h2"]
      },
      {
        id: "section-12",
        name: "Article Cards",
        selector: "section.service-card-container:nth-of-type(2)",
        style: null,
        blocks: ["cards-service"],
        defaultContent: []
      },
      {
        id: "section-13",
        name: "FAQ Section",
        selector: "section.Section1E:nth-of-type(4)",
        style: null,
        blocks: ["accordion-faq"],
        defaultContent: []
      }
    ]
  };
  function executeTransformers(hookName, element, payload) {
    const enhancedPayload = __spreadProps(__spreadValues({}, payload), {
      template: PAGE_TEMPLATE
    });
    transformers.forEach((transformerFn) => {
      try {
        transformerFn.call(null, hookName, element, enhancedPayload);
      } catch (e) {
        console.error(`Transformer failed at ${hookName}:`, e);
      }
    });
  }
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
            section: blockDef.section || null
          });
        });
      });
    });
    console.log(`Found ${pageBlocks.length} block instances on page`);
    return pageBlocks;
  }
  var import_homepage_default = {
    transform: (payload) => {
      const { document, url, params } = payload;
      const main = document.body;
      executeTransformers("beforeTransform", main, payload);
      const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);
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
      executeTransformers("afterTransform", main, payload);
      const hr = document.createElement("hr");
      main.appendChild(hr);
      WebImporter.rules.createMetadata(main, document);
      WebImporter.rules.transformBackgroundImages(main, document);
      WebImporter.rules.adjustImageUrls(main, url, params.originalURL);
      const path = WebImporter.FileUtils.sanitizePath(
        new URL(params.originalURL).pathname.replace(/\/$/, "").replace(/\.html$/, "") || "/index"
      );
      return [{
        element: main,
        path,
        report: {
          title: document.title,
          template: PAGE_TEMPLATE.name,
          blocks: pageBlocks.map((b) => b.name)
        }
      }];
    }
  };
  return __toCommonJS(import_homepage_exports);
})();
