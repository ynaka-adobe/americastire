/* eslint-disable */
/* global WebImporter */

/**
 * Parser: columns-split
 * Base block: columns
 * Source: https://www.americastire.com
 * Generated: 2026-05-21
 *
 * Handles four instance patterns:
 * 1. Credit card promo banner (.home-dtcc-promo-container-class) - image left, text+link right
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

    cells.push([imageCol, textCol]);
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

  const block = WebImporter.Blocks.createBlock(document, { name: 'columns-split', cells });
  element.replaceWith(block);
}
