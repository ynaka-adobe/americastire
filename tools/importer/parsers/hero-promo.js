/* eslint-disable */
/* global WebImporter */

/**
 * Parser: hero-promo
 * Base block: hero
 * Source: https://www.americastire.com
 * Selector: .home-page__home-hero-container
 * Generated: 2026-05-21
 *
 * Handles a full-width promotional hero banner that is a clickable image.
 * The source HTML is a single <a> wrapping a <picture>/<img> element.
 * The image itself contains all promotional text (baked into the image).
 * Extracts the image and wraps it with the link to preserve click-through behavior.
 */
export default function parse(element, { document }) {
  // Extract the link wrapping the hero image
  const link = element.querySelector('a[href], a.home-page__hero-image');

  // Extract the image (try picture element first, fall back to img)
  const picture = element.querySelector('picture');
  const img = element.querySelector('img');

  const cells = [];

  // Row 1: The hero image wrapped in its link for click-through
  // The image contains all promotional content (heading, description, CTA baked into the image)
  if (link && (picture || img)) {
    // The link already wraps the picture/img in source - use it directly
    cells.push([link]);
  } else if (picture || img) {
    // Fallback: image without link
    cells.push([picture || img]);
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'hero-promo', cells });
  element.replaceWith(block);
}
