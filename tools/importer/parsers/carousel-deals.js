/* eslint-disable */
/* global WebImporter */

/**
 * Parser for carousel-deals
 * Base block: carousel
 * Source: https://www.americastire.com
 * Description: Carousel of promotional deal slides with images, descriptions,
 *   expiration dates, and CTA buttons (See Products / See Details).
 * Generated: 2026-05-21
 * Selectors validated against cached source.html
 */
export default function parse(element, { document }) {
  // Find all slides within the carousel container
  const slides = element.querySelectorAll('[class*="cms-promotion-carousel__slide"]');

  const cells = [];

  slides.forEach((slide) => {
    // Extract the promo image (wrapped in a link)
    const promoLink = slide.querySelector('a[class*="promo-link"]');
    const img = slide.querySelector('img[class*="image__img"]');

    // Extract the content section
    const contentDiv = slide.querySelector('[class*="carousel-content"]');

    // Build the content cell with description, expiration, and CTAs
    const contentCell = [];

    if (contentDiv) {
      // Get the offer description paragraph (contains description + expiration span)
      const descriptionEl = contentDiv.querySelector('p[class*="offer-description"]');
      if (descriptionEl) {
        // Clone description to separate text from expiration span
        const descClone = descriptionEl.cloneNode(true);
        const expirationSpan = descClone.querySelector('[class*="offer-expiration"]');
        let descText = '';
        if (expirationSpan) {
          descText = descClone.textContent.replace(expirationSpan.textContent, '').trim();
          // Create description paragraph
          const descP = document.createElement('p');
          descP.textContent = descText;
          contentCell.push(descP);
          // Create expiration paragraph
          const expP = document.createElement('em');
          expP.textContent = expirationSpan.textContent.trim();
          contentCell.push(expP);
        } else {
          contentCell.push(descriptionEl);
        }
      }

      // Get CTA buttons - primary (See Products / Get Details) and secondary (See Details / Subject to Credit Approval)
      const primaryCta = contentDiv.querySelector('a[class*="see-products-button"]');
      const secondaryCta = contentDiv.querySelector('a[class*="see-details-button"]');

      if (primaryCta) contentCell.push(primaryCta);
      if (secondaryCta) contentCell.push(secondaryCta);
    }

    // Build image cell - use the image element, wrapped in its link if available
    const imageCell = [];
    if (promoLink && img) {
      const link = document.createElement('a');
      link.href = promoLink.href;
      link.appendChild(img.cloneNode(true));
      imageCell.push(link);
    } else if (img) {
      imageCell.push(img);
    }

    // Each row = one slide: [image column, content column]
    if (imageCell.length > 0 || contentCell.length > 0) {
      cells.push([imageCell, contentCell]);
    }
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'carousel-deals', cells });
  element.replaceWith(block);
}
