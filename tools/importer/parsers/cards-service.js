/* eslint-disable */
/* global WebImporter */

/**
 * Parser: cards-service
 * Base block: cards
 * Source: https://www.americastire.com
 * Generated: 2026-05-21
 *
 * Handles multiple card layout variations:
 * - .low-price-experience (3 info cards with icons + text + CTA)
 * - .AEM-hp-shopByCategory (category grid with circular images + labels)
 * - .service-card (service cards with photos + heading + description)
 * - .AEM-hp-shopByBrand (brand logo grid)
 * - .featured-content-grid__container (featured content items)
 *
 * Each card becomes one row: [image | text content (heading + description + CTA)]
 */
export default function parse(element, { document }) {
  const cells = [];

  // Determine which card items to process based on container structure
  let cardItems = [];

  // .low-price-experience: direct child divs are the cards
  if (element.classList.contains('low-price-experience')) {
    cardItems = Array.from(element.querySelectorAll(':scope > div'));
  }
  // .AEM-hp-shopByCategory: category items within the grid
  else if (element.classList.contains('AEM-hp-shopByCategory')) {
    cardItems = Array.from(element.querySelectorAll(':scope .category-item, :scope .shop-by-category-item, :scope a[class*="category"]'));
    // Fallback: direct children or links within
    if (cardItems.length === 0) {
      cardItems = Array.from(element.querySelectorAll(':scope > div > a, :scope > ul > li, :scope > div > div'));
    }
  }
  // .service-card: the container holds multiple service card items
  else if (element.classList.contains('service-card')) {
    cardItems = Array.from(element.querySelectorAll(':scope .service-card__item, :scope .service-card-item, :scope > div'));
    // Fallback: direct articles or list items
    if (cardItems.length === 0) {
      cardItems = Array.from(element.querySelectorAll(':scope article, :scope > a, :scope li'));
    }
  }
  // .AEM-hp-shopByBrand: brand logo items
  else if (element.classList.contains('AEM-hp-shopByBrand')) {
    cardItems = Array.from(element.querySelectorAll(':scope a[class*="brand"], :scope .brand-item, :scope > div > a'));
    if (cardItems.length === 0) {
      cardItems = Array.from(element.querySelectorAll(':scope > div > div, :scope li, :scope > div > a'));
    }
  }
  // .featured-content-grid__container: featured content items
  else if (element.classList.contains('featured-content-grid__container')) {
    cardItems = Array.from(element.querySelectorAll(':scope .featured-content-grid__item, :scope [class*="featured-content"] > div, :scope > div > div'));
    if (cardItems.length === 0) {
      cardItems = Array.from(element.querySelectorAll(':scope > div, :scope > a, :scope article'));
    }
  }
  // Generic fallback: direct child divs or list items
  else {
    cardItems = Array.from(element.querySelectorAll(':scope > div, :scope > li, :scope > a'));
  }

  cardItems.forEach((card) => {
    // Find the main image for this card
    // Skip decorative corner images (dot-corner-bg) and inline SVG data URIs
    const images = Array.from(card.querySelectorAll('img'));
    const mainImage = images.find((img) => {
      const src = img.getAttribute('src') || '';
      // Skip decorative corner backgrounds and small inline SVG icons
      if (src.includes('dot-corner-bg')) return false;
      if (src.startsWith('data:image/svg+xml')) return false;
      return true;
    }) || images.find((img) => {
      // If no non-SVG image found, accept the first icon-like SVG with meaningful content
      const src = img.getAttribute('src') || '';
      return src.startsWith('data:image/svg+xml');
    });

    // Build the text content cell
    const textContent = [];

    // Extract heading (h1-h6)
    const heading = card.querySelector('h1, h2, h3, h4, h5, h6');
    if (heading) {
      textContent.push(heading);
    }

    // Extract description text (p, span with text)
    const description = card.querySelector('p, :scope > div > span, :scope > span, [class*="content"] > span');
    if (description && description !== heading) {
      textContent.push(description);
    }

    // Extract CTA links (exclude overlay links and inline list item content)
    const ctaLinks = Array.from(card.querySelectorAll('a.card-text-link, a[class*="cta"], a.button:not(.card-overlay-link)'));
    if (ctaLinks.length > 0) {
      textContent.push(...ctaLinks);
    } else {
      // Fallback: look for any meaningful link that isn't the overlay
      const fallbackLink = card.querySelector('a:not(.card-overlay-link):not([class*="overlay"])');
      if (fallbackLink && !heading && textContent.length === 0) {
        // For simple link-only cards (like brand logos or category links)
        textContent.push(fallbackLink);
      }
    }

    // Only add the card row if we have some content
    if (mainImage || textContent.length > 0) {
      const imageCell = mainImage ? [mainImage] : [''];
      const textCell = textContent.length > 0 ? textContent : [''];
      cells.push([imageCell, textCell]);
    }
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-service', cells });
  element.replaceWith(block);
}
