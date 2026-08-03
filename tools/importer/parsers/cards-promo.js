/* eslint-disable */
/* global WebImporter */

/**
 * Parser: cards-promo
 * Base block: cards
 * Source: https://www.discounttire.com/promotions
 * Generated: 2026-07-29
 *
 * cards-promo renders each table row as a card (<ul><li>): a cell whose only
 * child is a <picture> becomes the card image, other cells become the card body.
 * All rows in a single block use 2 columns: [imageCell, bodyCell].
 *
 * Handles the following promotions-page DOM patterns (each parser invocation
 * receives one matched element and produces its own cards-promo block):
 *  1. .AEM-numbered-step               – numbered "how it works" step (number + text)
 *  2. .promoSpotlightContainer         – container of one/more instant/rebate spotlight boxes
 *  3. .promoSpotlightContainerGrey.expiredPromos – grid of expired rebate boxes
 *  4. .price-reduction-card            – wraps a rebate spotlight box (may be empty)
 *  5. .rebatePromoSpotlightBox         – individual rebate box (backstop; usually nested)
 *  6. .low-price-experience            – feature cards (tires-as-low-as, why-choose)
 *
 * Selectors verified against migration-work/cleaned.html (under <main>).
 */
export default function parse(element, { document }) {
  const cells = [];

  const BOX_SELECTOR = '.instantPromoSpotlightBox, .rebatePromoSpotlightBox, .expiredPromoSpotlightBox';

  /**
   * Build a [imageCell, bodyCell] row from a spotlight box.
   * imageCell prefers a <picture> (product shot) so cards-promo treats it as the
   * card image; otherwise falls back to the brand logo <img>.
   */
  function extractCard(box) {
    const imageCell = [];
    const bodyCell = [];

    const picture = box.querySelector('picture');
    const logo = box.querySelector('img.spotlightLogo');
    if (picture) {
      imageCell.push(picture);
      if (logo) bodyCell.push(logo);
    } else if (logo) {
      imageCell.push(logo);
    }

    const heading = box.querySelector('h2, h3, h4');
    if (heading) bodyCell.push(heading);

    const dates = box.querySelector('.spotlightActiveDates');
    if (dates) bodyCell.push(dates);

    // Description text
    const expiredDesc = box.querySelector('.expiredPromoDescription');
    if (expiredDesc) {
      expiredDesc.querySelectorAll('p').forEach((p) => bodyCell.push(p));
    } else {
      box.querySelectorAll(':scope > p').forEach((p) => {
        if (p.classList.contains('spotlightActiveDates')) return;
        // skip empty disclaimer paragraphs
        if (!p.textContent.trim() && !p.querySelector('a, img')) return;
        bodyCell.push(p);
      });
    }

    // CTA / rebate-form links (buttons with no href are ignored)
    box.querySelectorAll('.spotlightCTA a, .spotlightLink a, .expiredPromoLinks a').forEach((a) => {
      bodyCell.push(a);
    });

    if (imageCell.length === 0 && bodyCell.length === 0) return null;
    return [imageCell, bodyCell];
  }

  // Pattern 1: numbered "how it works" step
  if (element.classList.contains('AEM-numbered-step')) {
    const stepLabel = document.createElement('h3');
    const num = element.textContent.trim();
    stepLabel.textContent = num ? `Step ${num}` : 'Step';

    const wrapper = element.closest('.AEM-third') || element.parentElement;
    const desc = wrapper ? wrapper.querySelector('p') : null;

    const bodyCell = [];
    if (desc) bodyCell.push(desc);
    cells.push([[stepLabel], bodyCell.length ? bodyCell : ['']]);
  }

  // Pattern 6: low-price feature cards
  else if (element.classList.contains('low-price-experience')) {
    element.querySelectorAll(':scope > div').forEach((feature) => {
      const imageCell = [];
      const bodyCell = [];

      const img = feature.querySelector('aside img, .why-choose-discount-tire__icon img');
      if (img) imageCell.push(img);

      const heading = feature.querySelector('h2, h3, h4');
      if (heading) {
        bodyCell.push(heading);
        // description text living beside the heading
        const wrap = heading.parentElement;
        if (wrap) {
          wrap.querySelectorAll(':scope > span, :scope > p').forEach((n) => {
            if (n.textContent.trim()) bodyCell.push(n);
          });
        }
      }

      // feature list (why-choose bullets)
      const list = feature.querySelector('.why-choose-discount-tire__content ul, ul');
      if (list) bodyCell.push(list);

      // Prefer the inline text link, fall back to the whole-card overlay link
      const cta = feature.querySelector('.card-text-link') || feature.querySelector('.card-overlay-link');
      if (cta) bodyCell.push(cta);

      if (imageCell.length || bodyCell.length) cells.push([imageCell, bodyCell]);
    });
  }

  // Patterns 2–5: spotlight-box containers or an individual box
  else {
    const isBox = element.matches
      && element.matches(BOX_SELECTOR);
    const boxes = isBox ? [element] : Array.from(element.querySelectorAll(BOX_SELECTOR));
    boxes.forEach((box) => {
      const card = extractCard(box);
      if (card) cells.push(card);
    });
  }

  // Empty-block guard: nothing extractable (e.g. empty .price-reduction-card, or
  // boxes already claimed by an enclosing container that parsed first)
  if (cells.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-promo', cells });
  element.replaceWith(block);
}
