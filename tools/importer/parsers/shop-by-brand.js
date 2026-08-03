/* eslint-disable */
/* global WebImporter */

/**
 * Parser: shop-by-brand
 * Source: https://www.discounttire.com — .AEM-hp-shopByBrand
 *
 * Row 0 (optional): heading
 * Row 1..n: [logo image or inline SVG | brand link]
 */
export default function parse(element, { document }) {
  const cells = [];

  const heading = element.querySelector(':scope > h1, :scope > h2, :scope > h3');
  if (heading) {
    cells.push([[heading.cloneNode(true)], ['']]);
  }

  const links = element.querySelectorAll(':scope ul > li > a, :scope a[class*="brand"], :scope > div > a');
  links.forEach((link) => {
    const href = link.getAttribute('href') || '#';
    const slug = href.split('/').filter(Boolean).pop()?.toLowerCase() || '';
    const label = link.querySelector('title')?.textContent
      || link.getAttribute('aria-label')
      || link.className.split(' ').find((c) => /^[A-Z]/.test(c))
      || link.textContent.trim();

    const logo = document.createElement('img');
    logo.src = `/icons/shop-by-brand/${slug}.svg`;
    logo.alt = label || slug;

    const anchor = document.createElement('a');
    anchor.href = href;
    if (label) {
      anchor.textContent = label;
      anchor.setAttribute('aria-label', label);
    }

    cells.push([[logo], [anchor]]);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'shop-by-brand', cells });
  element.replaceWith(block);
}
