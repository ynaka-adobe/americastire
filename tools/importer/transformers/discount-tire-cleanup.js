/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: discount-tire cleanup
 * Removes non-authorable site chrome (header, footer, breadcrumbs, store views,
 * overlays, chat/feedback widgets, tracking pixels/iframes) from the Discount
 * Tire (discounttire.com) site shell so block parsers only see authorable
 * page content inside <main>.
 *
 * All selectors verified against migration-work/cleaned.html
 * (https://www.discounttire.com/promotions). Line references below point to
 * that file. discounttire.com and americastire.com share the same
 * Reinalt-Thomas React/AEM platform, so several chrome selectors match those
 * in americastire-cleanup.js; this file is a separate site set per the
 * {sitename}-{purpose}.js convention and does not affect the homepage template.
 */
const H = { before: 'beforeTransform', after: 'afterTransform' };

export default function transform(hookName, element, payload) {
  if (hookName === H.before) {
    // Accessibility "Enable Accessibility Mode" launcher (line 3)
    WebImporter.DOMUtils.remove(element, [
      '.accessibility-button__container___34DGl',
    ]);

    // Mobile store-view banner at top of <main> (line 108) - non-authorable
    WebImporter.DOMUtils.remove(element, [
      '.mobile-header-store-view__container___1_Xra',
    ]);

    // Feedback invite widget (line 817)
    WebImporter.DOMUtils.remove(element, [
      '[class*="cf-prompt-container"]',
      '[class*="cf_invite_"]',
    ]);

    // LivePerson chat overlay button (line 832) - dynamic id suffix
    WebImporter.DOMUtils.remove(element, [
      '[id^="LPMcontainer"]',
      '.LPMoverlay',
    ]);
  }

  if (hookName === H.after) {
    // Header navigation (line 11)
    WebImporter.DOMUtils.remove(element, [
      'header#header',
    ]);

    // T387 need-help banner between header and content (line 95)
    WebImporter.DOMUtils.remove(element, [
      '.T387-banner-modified',
    ]);

    // Breadcrumbs (line 132) - non-authorable navigation
    WebImporter.DOMUtils.remove(element, [
      '.breadcrumbs__container___3aE95',
    ]);

    // Global footer, incl. its footer_callout email band and link groups
    // (line 442) - non-authorable site chrome
    WebImporter.DOMUtils.remove(element, [
      'footer.footer__wrapper___TuAIH',
    ]);

    // React portal roots for overlays (lines 732, 806, 808)
    WebImporter.DOMUtils.remove(element, [
      '#popover-root',
      '#tooltip-root',
      '#dnd-root',
    ]);

    // Off-screen sticky products link (line 810)
    const stickyLink = element.querySelector('a[href="/sticky-products"]');
    if (stickyLink) stickyLink.remove();

    // Tracking / analytics iframes (lines 811, 814, 830)
    WebImporter.DOMUtils.remove(element, [
      'iframe',
    ]);

    // Tracking pixels (line 813 - googleadservices; demdex sync)
    const trackingImgs = element.querySelectorAll('img[src*="googleadservices"], img[src*="demdex.net"]');
    trackingImgs.forEach((img) => img.remove());
  }
}
