/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: americastire sections
 * Inserts section breaks (<hr>) and Section Metadata blocks based on
 * payload.template.sections from page-templates.json.
 * Only runs in afterTransform hook.
 *
 * Section selectors (from page-templates.json, verified in cleaned.html):
 *   - section.Section1E:first-of-type (Hero Section)
 *   - section.PromoCarouselSection (Deals Section)
 *   - section.Section1E:nth-of-type(2) (Shop by Category)
 *   - section.hp_subheader:first-of-type (Services Heading)
 *   - section.service-card-container:first-of-type (Service Cards)
 *   - section.hp_generic:nth-of-type(1) (Service CTAs)
 *   - section.hp_generic:nth-of-type(2) (Shop Tires Your Way)
 *   - section.hp_generic:nth-of-type(3) (Shop by Brand)
 *   - section.Section1E:nth-of-type(3) (Financing) - style: "grey"
 *   - section.hp_generic:nth-of-type(4) (Featured Content)
 *   - section.hp_subheader:nth-of-type(2) (Learn Heading)
 *   - section.service-card-container:nth-of-type(2) (Article Cards)
 *   - section.Section1E:nth-of-type(4) (FAQ Section)
 */
const H = { before: 'beforeTransform', after: 'afterTransform' };

export default function transform(hookName, element, payload) {
  if (hookName === H.after) {
    const { template } = payload || {};
    const sections = template && template.sections;
    if (!sections || sections.length < 2) return;

    const document = element.ownerDocument;

    // Process sections in reverse order to preserve DOM positions
    for (let i = sections.length - 1; i >= 0; i--) {
      const section = sections[i];
      if (!section.selector) continue;

      const sectionEl = element.querySelector(section.selector);
      if (!sectionEl) continue;

      // Add Section Metadata block if section has a style
      if (section.style) {
        const metaBlock = WebImporter.Blocks.createBlock(document, {
          name: 'Section Metadata',
          cells: { style: section.style },
        });
        sectionEl.append(metaBlock);
      }

      // Insert <hr> before every section except the first
      if (i > 0) {
        const hr = document.createElement('hr');
        sectionEl.before(hr);
      }
    }
  }
}
