/* eslint-disable */
/* global WebImporter */

/**
 * Parser for accordion-faq
 * Base block: accordion
 * Source: https://www.americastire.com
 * Selector: .faq.parbase .FAQ-content
 * Generated: 2026-05-21
 *
 * Extracts FAQ accordion items from source HTML.
 * Each FAQ item has a question (h3 inside label.lbl-toggle-FAQs)
 * and an answer (content inside div.content-inner-FAQs > div).
 * Produces one row per Q&A pair with two cells: [question, answer].
 */
export default function parse(element, { document }) {
  // Extract all FAQ item containers
  const faqItems = element.querySelectorAll('.wrap-collabsible-FAQs');

  const cells = [];

  faqItems.forEach((item) => {
    // Extract question - h3 inside the label toggle
    const questionEl = item.querySelector('label.lbl-toggle-FAQs h3, label.lbl-toggle-FAQs h4, label.lbl-toggle-FAQs');
    // Extract answer - the content div inside collapsible content
    const answerEl = item.querySelector('.content-inner-FAQs > div, .content-inner-FAQs p, .collapsible-content-FAQs .content-inner-FAQs');

    if (questionEl && answerEl) {
      cells.push([questionEl, answerEl]);
    }
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'accordion-faq', cells });
  element.replaceWith(block);
}
