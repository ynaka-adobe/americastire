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

  // tools/importer/import-promotions.js
  var import_promotions_exports = {};
  __export(import_promotions_exports, {
    default: () => import_promotions_default
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
    } else if (element.classList.contains("stacked-offer")) {
      const leftCol = [];
      const rightCol = [];
      const productEl = element.querySelector(".stacked-element");
      if (productEl) {
        const pImg = productEl.querySelector("img");
        if (pImg) leftCol.push(pImg);
        const pText = productEl.querySelector("span");
        if (pText) leftCol.push(pText);
      }
      const plusImg = element.querySelector(".stack-plus img");
      if (plusImg) leftCol.push(plusImg);
      const creditEl = element.querySelector(".stacked-credit");
      if (creditEl) {
        const cImg = creditEl.querySelector("img");
        if (cImg) rightCol.push(cImg);
        const cText = creditEl.querySelector("aside:last-child span, span");
        if (cText) rightCol.push(cText);
      }
      if (leftCol.length || rightCol.length) cells.push([leftCol, rightCol]);
    } else if (element.classList.contains("greySection")) {
      if (element.querySelector(".hp-financing__container")) {
        element.replaceWith(...element.childNodes);
        return;
      }
      const heading = element.querySelector(":scope > div > h2, :scope > div > h3, h2, h3");
      const flex = element.querySelector(".AEM-flex");
      const panels = flex ? Array.from(flex.children) : [];
      if (panels.length >= 2) {
        const leftCol = [];
        if (heading) leftCol.push(heading);
        leftCol.push(panels[0]);
        const rightCol = [panels[1]];
        cells.push([leftCol, rightCol]);
      } else {
        const col = [];
        if (heading) col.push(heading);
        panels.forEach((p) => col.push(p));
        if (col.length) cells.push([col]);
      }
    } else if (element.classList.contains("stacked-credit")) {
      const imageCol = [];
      const textCol = [];
      const img = element.querySelector("img");
      if (img) imageCol.push(img);
      const text = element.querySelector("aside:last-child span, span");
      if (text) textCol.push(text);
      if (imageCol.length || textCol.length) cells.push([imageCol, textCol]);
    } else {
      const children = Array.from(element.children);
      if (children.length >= 2) {
        const mid = Math.floor(children.length / 2);
        cells.push([children.slice(0, mid), children.slice(mid)]);
      } else {
        cells.push([children]);
      }
    }
    if (cells.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "columns-split", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-promo.js
  function parse2(element, { document }) {
    const cells = [];
    const BOX_SELECTOR = ".instantPromoSpotlightBox, .rebatePromoSpotlightBox, .expiredPromoSpotlightBox";
    function extractCard(box) {
      const imageCell = [];
      const bodyCell = [];
      const picture = box.querySelector("picture");
      const logo = box.querySelector("img.spotlightLogo");
      if (picture) {
        imageCell.push(picture);
        if (logo) bodyCell.push(logo);
      } else if (logo) {
        imageCell.push(logo);
      }
      const heading = box.querySelector("h2, h3, h4");
      if (heading) bodyCell.push(heading);
      const dates = box.querySelector(".spotlightActiveDates");
      if (dates) bodyCell.push(dates);
      const expiredDesc = box.querySelector(".expiredPromoDescription");
      if (expiredDesc) {
        expiredDesc.querySelectorAll("p").forEach((p) => bodyCell.push(p));
      } else {
        box.querySelectorAll(":scope > p").forEach((p) => {
          if (p.classList.contains("spotlightActiveDates")) return;
          if (!p.textContent.trim() && !p.querySelector("a, img")) return;
          bodyCell.push(p);
        });
      }
      box.querySelectorAll(".spotlightCTA a, .spotlightLink a, .expiredPromoLinks a").forEach((a) => {
        bodyCell.push(a);
      });
      if (imageCell.length === 0 && bodyCell.length === 0) return null;
      return [imageCell, bodyCell];
    }
    if (element.classList.contains("AEM-numbered-step")) {
      const stepLabel = document.createElement("h3");
      const num = element.textContent.trim();
      stepLabel.textContent = num ? `Step ${num}` : "Step";
      const wrapper = element.closest(".AEM-third") || element.parentElement;
      const desc = wrapper ? wrapper.querySelector("p") : null;
      const bodyCell = [];
      if (desc) bodyCell.push(desc);
      cells.push([[stepLabel], bodyCell.length ? bodyCell : [""]]);
    } else if (element.classList.contains("low-price-experience")) {
      element.querySelectorAll(":scope > div").forEach((feature) => {
        const imageCell = [];
        const bodyCell = [];
        const img = feature.querySelector("aside img, .why-choose-discount-tire__icon img");
        if (img) imageCell.push(img);
        const heading = feature.querySelector("h2, h3, h4");
        if (heading) {
          bodyCell.push(heading);
          const wrap = heading.parentElement;
          if (wrap) {
            wrap.querySelectorAll(":scope > span, :scope > p").forEach((n) => {
              if (n.textContent.trim()) bodyCell.push(n);
            });
          }
        }
        const list = feature.querySelector(".why-choose-discount-tire__content ul, ul");
        if (list) bodyCell.push(list);
        const cta = feature.querySelector(".card-text-link") || feature.querySelector(".card-overlay-link");
        if (cta) bodyCell.push(cta);
        if (imageCell.length || bodyCell.length) cells.push([imageCell, bodyCell]);
      });
    } else {
      const isBox = element.matches && element.matches(BOX_SELECTOR);
      const boxes = isBox ? [element] : Array.from(element.querySelectorAll(BOX_SELECTOR));
      boxes.forEach((box) => {
        const card = extractCard(box);
        if (card) cells.push(card);
      });
    }
    if (cells.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "cards-promo", cells });
    element.replaceWith(block);
  }

  // tools/importer/transformers/discount-tire-cleanup.js
  var H = { before: "beforeTransform", after: "afterTransform" };
  function transform(hookName, element, payload) {
    if (hookName === H.before) {
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
      WebImporter.DOMUtils.remove(element, [
        '[id^="LPMcontainer"]',
        ".LPMoverlay"
      ]);
    }
    if (hookName === H.after) {
      WebImporter.DOMUtils.remove(element, [
        "header#header"
      ]);
      WebImporter.DOMUtils.remove(element, [
        ".T387-banner-modified"
      ]);
      WebImporter.DOMUtils.remove(element, [
        ".breadcrumbs__container___3aE95"
      ]);
      WebImporter.DOMUtils.remove(element, [
        "footer.footer__wrapper___TuAIH"
      ]);
      WebImporter.DOMUtils.remove(element, [
        "#popover-root",
        "#tooltip-root",
        "#dnd-root"
      ]);
      const stickyLink = element.querySelector('a[href="/sticky-products"]');
      if (stickyLink) stickyLink.remove();
      WebImporter.DOMUtils.remove(element, [
        "iframe"
      ]);
      const trackingImgs = element.querySelectorAll('img[src*="googleadservices"], img[src*="demdex.net"]');
      trackingImgs.forEach((img) => img.remove());
    }
  }

  // tools/importer/transformers/discount-tire-dm-images.js
  function detectDynamicMediaUrl(urlStr) {
    let u;
    try {
      u = new URL(urlStr, "https://x/");
    } catch (e) {
      return false;
    }
    if (u.pathname.startsWith("/is/image/")) {
      return "scene7";
    }
    if (/^delivery-p\d+-e\d+\.adobeaemcloud\.com$/.test(u.hostname) && u.pathname.startsWith("/adobe/assets/urn:")) {
      return "dm-openapi";
    }
    return false;
  }
  var LINKED_DM_INLINE_WRAPPER_TAGS = /* @__PURE__ */ new Set(["PICTURE"]);
  var LINKED_DM_WRAPPER_SIBLING_TAGS = /* @__PURE__ */ new Set(["SOURCE"]);
  function findLinkedDmCarrier(img) {
    if (!img || !img.parentElement) return null;
    let node = img;
    let parent = img.parentElement;
    while (parent && LINKED_DM_INLINE_WRAPPER_TAGS.has(parent.tagName)) {
      let foundNode = false;
      for (const child of parent.children) {
        if (child === node) {
          foundNode = true;
        } else if (!LINKED_DM_WRAPPER_SIBLING_TAGS.has(child.tagName)) {
          return null;
        }
      }
      if (!foundNode) return null;
      node = parent;
      parent = parent.parentElement;
    }
    if (!parent || parent.tagName !== "A") return null;
    if (parent.children.length !== 1 || parent.children[0] !== node) return null;
    if (parent.textContent.trim() !== "") return null;
    return parent;
  }
  var EMPTY_ALT_SENTINEL = "Image without alt text";
  function altToLinkText(alt) {
    return alt || EMPTY_ALT_SENTINEL;
  }
  function transform2(hookName, element, payload) {
    if (hookName !== "afterTransform") return;
    const doc = element.ownerDocument;
    element.querySelectorAll("img").forEach((img) => {
      const src = img.getAttribute("src") || "";
      if (!detectDynamicMediaUrl(src)) return;
      const alt = img.getAttribute("alt") || "";
      const linkedAnchor = findLinkedDmCarrier(img);
      if (linkedAnchor) {
        linkedAnchor.setAttribute("title", src);
        linkedAnchor.textContent = altToLinkText(alt);
        return;
      }
      const parent = img.parentElement;
      if (parent && parent.tagName === "A") {
        console.warn("DM image inside mixed-content anchor, skipped:", src);
        return;
      }
      const a = doc.createElement("a");
      a.href = src;
      a.textContent = altToLinkText(alt);
      img.replaceWith(a);
    });
  }

  // tools/importer/transformers/discount-tire-sections.js
  var H2 = { before: "beforeTransform", after: "afterTransform" };
  function transform3(hookName, element, payload) {
    if (hookName !== H2.before) return;
    const { template } = payload || {};
    const sections = template && template.sections;
    if (!sections || sections.length < 2) return;
    const document = element.ownerDocument;
    const resolved = [];
    sections.forEach((section) => {
      if (!section.selector) return;
      let sectionEl;
      try {
        sectionEl = element.querySelector(section.selector);
      } catch (e) {
        return;
      }
      if (!sectionEl) return;
      resolved.push({ style: section.style, el: sectionEl });
    });
    if (resolved.length < 2) return;
    resolved.sort((a, b) => {
      if (a.el === b.el) return 0;
      const rel = a.el.compareDocumentPosition(b.el);
      return rel & 4 ? -1 : 1;
    });
    for (let i = resolved.length - 1; i >= 0; i -= 1) {
      const { style, el } = resolved[i];
      if (style) {
        const metaBlock = WebImporter.Blocks.createBlock(document, {
          name: "Section Metadata",
          cells: { style }
        });
        el.after(metaBlock);
      }
      if (i > 0) {
        const hr = document.createElement("hr");
        el.before(hr);
      }
    }
  }

  // tools/importer/import-promotions.js
  var parsers = {
    "columns-split": parse,
    "cards-promo": parse2
  };
  var transformers = [
    transform,
    transform2,
    transform3
  ];
  var PAGE_TEMPLATE = {
    name: "promotions",
    description: "Discount Tire promotions/deals page with hero, instant savings promo cards, credit card offers, low-price and financing sections, price reductions, and rebate cards",
    urls: ["https://www.discounttire.com/promotions"],
    blocks: [
      {
        name: "columns-split",
        instances: [
          ".stacked-offer",
          ".greySection",
          ".hp-financing__container",
          ".stacked-credit"
        ]
      },
      {
        name: "cards-promo",
        instances: [
          ".AEM-numbered-step",
          ".promoSpotlightContainer",
          ".low-price-experience",
          ".price-reduction-card",
          ".rebatePromoSpotlightBox",
          ".promoSpotlightContainerGrey.expiredPromos"
        ]
      }
    ],
    sections: [
      {
        id: "section-1",
        name: "Page intro (breadcrumbs + H1 + shop CTAs)",
        selector: ".toplevelpage",
        style: null,
        blocks: [],
        defaultContent: ["h1"]
      },
      {
        id: "section-2",
        name: "$130 Instant Savings promo banner",
        selector: ".stacked-offer",
        style: "grey",
        blocks: ["columns-split"],
        defaultContent: []
      },
      {
        id: "section-3",
        name: "Sign In for Instant Savings \u2014 3 numbered steps",
        selector: ".content__content___3VFmv > .AEM-content > .AEM-flex:has(.AEM-numbered-step)",
        style: null,
        blocks: ["cards-promo"],
        defaultContent: ["h2"]
      },
      {
        id: "section-4",
        name: "Two-up instant savings promo cards",
        selector: ".promoSpotlightContainer.containerXF",
        style: null,
        blocks: ["cards-promo"],
        defaultContent: []
      },
      {
        id: "section-5",
        name: "Discount Tire credit card offers",
        selector: ".greySection",
        style: "grey",
        blocks: ["columns-split"],
        defaultContent: []
      },
      {
        id: "section-6",
        name: "Feature cards: Low Price / Confidence / Promise",
        selector: ".low-price-experience",
        style: null,
        blocks: ["cards-promo"],
        defaultContent: []
      },
      {
        id: "section-8",
        name: "Easy, convenient financing",
        selector: ".hp-financing__container",
        style: null,
        blocks: ["columns-split"],
        defaultContent: []
      },
      {
        id: "section-9",
        name: "Price Reductions \u2014 single card",
        selector: ".price-reduction-card",
        style: null,
        blocks: ["cards-promo"],
        defaultContent: ["h2"]
      },
      {
        id: "section-10",
        name: "Rebates by mail \u2014 3 numbered steps",
        selector: ".cmp-experiencefragment--main-promotions-landing-page-content .AEM-flex",
        style: null,
        blocks: ["cards-promo"],
        defaultContent: ["h2"]
      },
      {
        id: "section-11",
        name: "Two-up rebate promo cards",
        selector: ".rebatePromoSpotlightBox",
        style: null,
        blocks: ["cards-promo"],
        defaultContent: []
      },
      {
        id: "section-12",
        name: "Expired Rebates card grid",
        selector: ".promoSpotlightContainerGrey.expiredPromos",
        style: "grey",
        blocks: ["cards-promo"],
        defaultContent: ["h3"]
      },
      {
        id: "section-13",
        name: "Credit card details + perks",
        selector: ".stacked-credit",
        style: "grey",
        blocks: ["columns-split", "cards-promo"],
        defaultContent: []
      },
      {
        id: "section-14",
        name: "Legal disclosure",
        selector: ".disclaimer-text",
        style: null,
        blocks: [],
        defaultContent: ["p"]
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
  var import_promotions_default = {
    transform: (payload) => {
      const { document, url, params } = payload;
      const main = document.body;
      executeTransformers("beforeTransform", main, payload);
      const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);
      pageBlocks.forEach((block) => {
        if (!block.element.parentNode) return;
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
  return __toCommonJS(import_promotions_exports);
})();
