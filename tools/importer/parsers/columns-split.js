/* eslint-disable */
/* global WebImporter */

/**
 * Parser: columns-split
 * Base block: columns
 * Source: https://www.americastire.com (homepage) + https://www.discounttire.com/promotions
 * Generated: 2026-05-21 | Extended: 2026-07-29
 *
 * Handles four instance patterns:
 * 1. Credit card promo banner (.home-dtcc-promo-container-class) - single row (1 col) for dark banner styling
 * 2. Split entry (.split-entry) - two panels with image/description/CTA separated by OR
 * 3. Treadwell layout (.treadwell-layout) - tire guide card left, size search card right
 * 4. Financing container (.hp-financing__container) - two financing option cards side by side
 */
export default function parse(element, { document }) {
  const cells = [];

  // Pattern 1: Credit card promo banner
  if (element.classList.contains('home-dtcc-promo-container-class')) {
    const imageCol = [];
    const textCol = [];

    const img = element.querySelector('.home-dtcc-promo-text-class__images img');
    if (img) imageCol.push(img);

    const promoText = element.querySelector('.home-dtcc-promo-text-class');
    if (promoText) textCol.push(promoText);

    const link = element.querySelector('.home-dtcc-promo-text-class__link a');
    if (link) textCol.push(link);

    const singleCol = [...imageCol, ...textCol];
    cells.push([singleCol]);
  }

  // Pattern 2: Split entry (Shop Products OR Schedule Service)
  else if (element.classList.contains('split-entry')) {
    const leftCol = [];
    const rightCol = [];

    // Left panel
    const leftImg = element.querySelector('.split-entry__body__left__image img');
    if (leftImg) leftCol.push(leftImg);

    const leftDesc = element.querySelector('.split-entry__body__left .split-entry__body__description');
    if (leftDesc) leftCol.push(leftDesc);

    const leftCta = element.querySelector('.split-entry__body__left > a, .split-entry__body__left a.button');
    if (leftCta) leftCol.push(leftCta);

    // Right panel
    const rightImg = element.querySelector('.split-entry__body__right__image img');
    if (rightImg) rightCol.push(rightImg);

    const rightDesc = element.querySelector('.split-entry__body__right .split-entry__body__description');
    if (rightDesc) rightCol.push(rightDesc);

    const rightCta = element.querySelector('.split-entry__body__right > a, .split-entry__body__right a.button');
    if (rightCta) rightCol.push(rightCta);

    cells.push([leftCol, rightCol]);
  }

  // Pattern 3: Treadwell layout (tire guide + size search)
  else if (element.classList.contains('treadwell-layout')) {
    const leftCol = [];
    const rightCol = [];

    // Left: Treadwell card
    const treadwellCard = element.querySelector('.treadwell-card');
    if (treadwellCard) {
      const treadImg = treadwellCard.querySelector(':scope > img');
      if (treadImg) leftCol.push(treadImg);

      const treadTitle = treadwellCard.querySelector('.treadwell-card__title');
      if (treadTitle) leftCol.push(treadTitle);

      const treadDesc = treadwellCard.querySelector('.treadwell-card__description');
      if (treadDesc) leftCol.push(treadDesc);

      const treadSteps = treadwellCard.querySelector('.treadwell-card__steps');
      if (treadSteps) leftCol.push(treadSteps);

      const treadTime = treadwellCard.querySelector('.treadwell-card__time');
      if (treadTime) leftCol.push(treadTime);

      const treadCta = treadwellCard.querySelector('.treadwell-card__cta');
      if (treadCta) leftCol.push(treadCta);

      const treadFootnote = treadwellCard.querySelector('.treadwell-card__footnote');
      if (treadFootnote) leftCol.push(treadFootnote);
    }

    // Right: Size card
    const sizeCard = element.querySelector('.size-card');
    if (sizeCard) {
      const sizeTitle = sizeCard.querySelector('.size-card__title');
      if (sizeTitle) rightCol.push(sizeTitle);

      const sizeDesc = sizeCard.querySelector('.size-card__description');
      if (sizeDesc) rightCol.push(sizeDesc);

      const sizeCta = sizeCard.querySelector('.size-card__cta');
      if (sizeCta) rightCol.push(sizeCta);

      const sizeImg = sizeCard.querySelector('.size-card__figure img');
      if (sizeImg) rightCol.push(sizeImg);

      const popularSizes = sizeCard.querySelector('.popular-sizes');
      if (popularSizes) rightCol.push(popularSizes);
    }

    cells.push([leftCol, rightCol]);
  }

  // Pattern 4: Financing container (credit card vs Affirm)
  else if (element.classList.contains('hp-financing__container')) {
    const cards = element.querySelectorAll('.hp-financing__card');

    const leftCol = [];
    const rightCol = [];

    if (cards.length >= 1) {
      const card1 = cards[0];
      const copy1 = card1.querySelector('.hp-financing__card__copy');
      if (copy1) leftCol.push(copy1);

      const img1 = card1.querySelector('.hp-financing__card__img img');
      if (img1) leftCol.push(img1);

      const cta1 = card1.querySelector('.hp-financing__card__img a');
      if (cta1) leftCol.push(cta1);
    }

    if (cards.length >= 2) {
      const card2 = cards[1];
      const copy2 = card2.querySelector('.hp-financing__card__copy');
      if (copy2) rightCol.push(copy2);

      const img2 = card2.querySelector('.hp-financing__card__img img');
      if (img2) rightCol.push(img2);
    }

    cells.push([leftCol, rightCol]);
  }

  // Pattern 5: Stacked offer (product offer column + credit-card offer column)
  // NOTE: .stacked-credit is nested inside .stacked-offer and is also a separate
  // instance. We move its leaf nodes (img/text) into this block's right column so
  // the redundant standalone .stacked-credit pass finds nothing and unwraps.
  else if (element.classList.contains('stacked-offer')) {
    const leftCol = [];
    const rightCol = [];

    const productEl = element.querySelector('.stacked-element');
    if (productEl) {
      const pImg = productEl.querySelector('img');
      if (pImg) leftCol.push(pImg);
      const pText = productEl.querySelector('span');
      if (pText) leftCol.push(pText);
    }

    const plusImg = element.querySelector('.stack-plus img');
    if (plusImg) leftCol.push(plusImg);

    const creditEl = element.querySelector('.stacked-credit');
    if (creditEl) {
      const cImg = creditEl.querySelector('img');
      if (cImg) rightCol.push(cImg);
      const cText = creditEl.querySelector('aside:last-child span, span');
      if (cText) rightCol.push(cText);
    }

    if (leftCol.length || rightCol.length) cells.push([leftCol, rightCol]);
  }

  // Pattern 6: Grey section (promotions credit-card detail bands)
  else if (element.classList.contains('greySection')) {
    // If it wraps a financing container, let the dedicated .hp-financing__container
    // instance own the columns; just unwrap so we don't emit a duplicate block.
    if (element.querySelector('.hp-financing__container')) {
      element.replaceWith(...element.childNodes);
      return;
    }

    const heading = element.querySelector(':scope > div > h2, :scope > div > h3, h2, h3');
    const flex = element.querySelector('.AEM-flex');
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
  }

  // Pattern 7: Stacked credit (credit-card image column + savings text column)
  // Standalone context only; when nested in .stacked-offer this element is emptied
  // by that branch and falls through to the empty-block guard below.
  else if (element.classList.contains('stacked-credit')) {
    const imageCol = [];
    const textCol = [];

    const img = element.querySelector('img');
    if (img) imageCol.push(img);

    const text = element.querySelector('aside:last-child span, span');
    if (text) textCol.push(text);

    if (imageCol.length || textCol.length) cells.push([imageCol, textCol]);
  }

  // Fallback: attempt generic two-column split on direct children
  else {
    const children = Array.from(element.children);
    if (children.length >= 2) {
      const mid = Math.floor(children.length / 2);
      cells.push([children.slice(0, mid), children.slice(mid)]);
    } else {
      cells.push([children]);
    }
  }

  // Empty-block guard: nothing extractable (e.g. a .stacked-credit already
  // consumed by an enclosing .stacked-offer). Unwrap rather than emit an empty block.
  if (cells.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'columns-split', cells });
  element.replaceWith(block);
}
