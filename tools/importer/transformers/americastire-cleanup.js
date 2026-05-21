/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: americastire cleanup
 * Removes non-authorable content (header, footer, modals, widgets, tracking)
 * and unwraps nested CMS containers so block parsers see clean content.
 * All selectors verified against migration-work/cleaned.html.
 */
const H = { before: 'beforeTransform', after: 'afterTransform' };

export default function transform(hookName, element, payload) {
  if (hookName === H.before) {
    // Remove React modal overlay that blocks page parsing (line 798-823)
    WebImporter.DOMUtils.remove(element, [
      '.ReactModalPortal',
      '.ReactModal__Overlay',
    ]);

    // Remove accessibility skip-to-content button (line 5-11)
    WebImporter.DOMUtils.remove(element, [
      '.accessibility-button__container___34DGl',
    ]);

    // Remove mobile store view overlay (line 109)
    WebImporter.DOMUtils.remove(element, [
      '.mobile-header-store-view__container___1_Xra',
    ]);

    // Remove feedback widget (line 833-844)
    WebImporter.DOMUtils.remove(element, [
      '[class*="cf-prompt-container"]',
      '[class*="cf_invite_"]',
    ]);
  }

  if (hookName === H.after) {
    // Remove header navigation (line 13-100)
    WebImporter.DOMUtils.remove(element, [
      'header#header',
    ]);

    // Remove footer (line 514+)
    WebImporter.DOMUtils.remove(element, [
      'footer.footer__wrapper___TuAIH',
    ]);

    // Remove iframes - tracking/analytics (lines 827, 830, 846)
    WebImporter.DOMUtils.remove(element, [
      'iframe',
    ]);

    // Remove portal roots used by React overlays (lines 791-796)
    WebImporter.DOMUtils.remove(element, [
      '#popover-root',
      '#tooltip-root',
      '#dnd-root',
    ]);

    // Remove sticky products link (line 797)
    const stickyLink = element.querySelector('a[href="/sticky-products"]');
    if (stickyLink) stickyLink.remove();

    // Remove tracking images (line 829 - googleadservices pixel)
    const trackingImgs = element.querySelectorAll('img[src*="googleadservices"], img[src*="demdex.net"]');
    trackingImgs.forEach((img) => img.remove());

    // Remove SourceDefense reporter iframe container and leftover empty divs at end
    // Remove empty sections that contain only a <br> (line 503-509)
    const sections = element.querySelectorAll('section.section__container___gceoT');
    sections.forEach((section) => {
      const content = section.querySelector('.section__content___l3N2-');
      if (content) {
        const textContent = content.textContent.trim();
        const hasOnlyBr = textContent === '' && content.querySelectorAll('*').length <= 2;
        const hasMeaningfulChildren = content.querySelector('img, a, h1, h2, h3, h4, h5, h6, p:not(:empty), [class*="container"]');
        if (hasOnlyBr && !hasMeaningfulChildren) {
          section.remove();
        }
      }
    });

    // Remove T387 banner elements in header area (lines 97-100)
    WebImporter.DOMUtils.remove(element, [
      '.T387-banner-modified',
    ]);
  }
}
