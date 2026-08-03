/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: discount-tire sections
 * Inserts section breaks (<hr>) and Section Metadata blocks based on
 * payload.template.sections from page-templates.json.
 *
 * IMPORTANT — runs in `beforeTransform` (not afterTransform).
 * On the promotions template the section boundary selectors (e.g.
 * `.stacked-offer`, `.greySection`, `.low-price-experience`) point at the very
 * elements the block parsers replace via `element.replaceWith(block)`. If we
 * waited until `afterTransform`, those elements would already be detached and
 * every `querySelector` would miss — producing zero breaks/metadata (the bug
 * this replaces). By running before parsing, the boundary elements still exist.
 *
 * To survive the subsequent `replaceWith`, markers are inserted as SIBLINGS of
 * the section element, never as children:
 *   - <hr> is inserted immediately BEFORE the section element (marks the start
 *     of the section; skipped for the first section).
 *   - the Section Metadata block is inserted immediately AFTER the section
 *     element (stays within the same section, before the next section's <hr>).
 * A child appended inside the section element would be destroyed when the
 * parser replaces that element; siblings are not.
 *
 * Logic is template-agnostic: selectors and styles come from
 * payload.template.sections at runtime. Sections are processed in reverse
 * DOM order so earlier insertions don't shift the positions of not-yet-handled
 * sections. Missing selectors are skipped safely.
 *
 * Note on nesting: where one section's selector is contained within another
 * section that gets replaced by a parser (e.g. a nested boundary), the inner
 * markers are consumed with the outer element and that inner section merges
 * into its parent — the expected outcome when the parser also consumes the
 * inner content.
 */
const H = { before: 'beforeTransform', after: 'afterTransform' };

export default function transform(hookName, element, payload) {
  if (hookName !== H.before) return;

  const { template } = payload || {};
  const sections = template && template.sections;
  if (!sections || sections.length < 2) return;

  const document = element.ownerDocument;

  // Resolve each section to its first matching element, then order the
  // resolved sections by document position so <hr> placement is correct even
  // when the sections[] array order differs from DOM order.
  const resolved = [];
  sections.forEach((section) => {
    if (!section.selector) return;
    let sectionEl;
    try {
      sectionEl = element.querySelector(section.selector);
    } catch (e) {
      return; // invalid selector — skip safely
    }
    if (!sectionEl) return;
    resolved.push({ style: section.style, el: sectionEl });
  });

  if (resolved.length < 2) return;

  // Sort by DOM order using compareDocumentPosition.
  resolved.sort((a, b) => {
    if (a.el === b.el) return 0;
    const rel = a.el.compareDocumentPosition(b.el);
    // DOCUMENT_POSITION_FOLLOWING (4) => b comes after a
    return (rel & 4) ? -1 : 1;
  });

  // Insert in reverse DOM order so earlier insertions don't shift positions.
  for (let i = resolved.length - 1; i >= 0; i -= 1) {
    const { style, el } = resolved[i];

    // Section Metadata (style) goes AFTER the element, within this section.
    if (style) {
      const metaBlock = WebImporter.Blocks.createBlock(document, {
        name: 'Section Metadata',
        cells: { style },
      });
      el.after(metaBlock);
    }

    // <hr> before every section except the first marks the section boundary.
    if (i > 0) {
      const hr = document.createElement('hr');
      el.before(hr);
    }
  }
}
