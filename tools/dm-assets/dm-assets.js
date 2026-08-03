// eslint-disable-next-line import/no-unresolved
import DA_SDK from 'https://da.live/nx/utils/sdk.js';

/**
 * DM Assets — a DA Library plugin that owns the Adobe Asset Selector callback.
 *
 * The native DA asset picker inserts a publish <picture> (…/content/dam/…) and does not
 * construct a Dynamic Media delivery URL from an OpenAPI selection. This plugin runs the same
 * Adobe Asset Selector but intercepts `handleSelection`: it builds the DM delivery URL from the
 * selected asset's URN and inserts it as a LINK (not an image). scripts/utils/dynamic-media.js
 * then renders that link as a responsive <picture> on the page.
 */

const ASSET_SELECTOR_SRC = 'https://experience.adobe.com/solutions/CQ-assets-selectors/static-assets/resources/assets-selectors.js';

/* Same values the native DA picker used for this site (observed in the selector network call). */
const REPOSITORY_ID = 'author-p154856-e1944736.adobeaemcloud.com';
const IMS_CLIENT_ID = 'darkalley';
const API_KEY = 'exc_app';

/** Delivery host is the author repo id with the prefix swapped. */
function deliveryHost(repoId) {
  return repoId.replace(/^author-/, 'delivery-');
}

/** Asset selector payloads use a few different key spellings depending on version. */
function assetIdOf(asset) {
  return asset.assetId || asset['repo:assetId'] || asset.id || '';
}
function nameOf(asset) {
  return asset.name || asset['repo:name'] || '';
}

/**
 * Build the base DM OpenAPI delivery URL. Width/format params are appended at render time by
 * decorateDynamicMedia, so the authored link stays clean.
 * @returns {string|null}
 */
function buildDeliveryUrl(asset) {
  const id = assetIdOf(asset);
  const name = nameOf(asset);
  if (!id || !name) return null;
  return `https://${deliveryHost(REPOSITORY_ID)}/adobe/assets/${id}/as/${encodeURIComponent(name)}`;
}

function loadSelectorScript() {
  return new Promise((resolve, reject) => {
    if (window.PureJSSelectors) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.src = ASSET_SELECTOR_SRC;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load the Adobe Asset Selector.'));
    document.head.appendChild(script);
  });
}

function fail(message) {
  const el = document.getElementById('asset-selector');
  if (el) el.innerHTML = `<p class="dm-error">${message}</p>`;
}

async function init() {
  const { context, token, actions } = await DA_SDK;
  await loadSelectorScript();

  const container = document.getElementById('asset-selector');

  const handleSelection = (assets) => {
    const list = Array.isArray(assets) ? assets : [assets];
    const links = list
      .map((asset) => {
        const url = buildDeliveryUrl(asset);
        return url ? `<a href="${url}">${nameOf(asset) || url}</a>` : '';
      })
      .filter(Boolean);

    if (!links.length) {
      fail('Selected asset had no asset id — cannot build a Dynamic Media URL.');
      return;
    }
    // Insert as a LINK. decorateDynamicMedia renders it as a <picture> on the page.
    actions.sendHTML(links.join(' '));
    actions.closeLibrary();
  };

  const props = {
    imsToken: token,
    imsClientId: IMS_CLIENT_ID,
    apiKey: API_KEY,
    repositoryId: REPOSITORY_ID,
    aemTierType: ['author'],
    selectionType: 'single',
    handleSelection,
    onClose: () => actions.closeLibrary(),
  };
  // Some tenants require the IMS org explicitly; pass it through when DA provides it.
  if (context.imsOrg) props.imsOrg = context.imsOrg;

  window.PureJSSelectors.renderAssetSelector(container, props);
}

init().catch((err) => fail(err.message));
