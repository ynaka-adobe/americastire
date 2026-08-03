/**
 * brand-split: copy + optional watermark | hero image, diagonal split (e.g. brand tire promos).
 * @param {HTMLElement} block
 */
function decorateBrandSplit(block) {
  const row = block.firstElementChild;
  if (!row || row.children.length < 2) return;

  const content = row.children[0];
  const media = row.children[1];
  content.classList.add('hero-promo-brand-split-content');
  media.classList.add('hero-promo-brand-split-media');

  const contentPictures = [...content.querySelectorAll(':scope > picture')];
  const hasHeading = content.querySelector(':scope > :is(h1, h2, h3, h4)');
  if (contentPictures.length > 0 && hasHeading) {
    const [watermark, ...rest] = contentPictures;
    if (rest.length === 0) {
      watermark.classList.add('hero-promo-brand-split-watermark');
    } else {
      watermark.classList.add('hero-promo-brand-split-watermark');
      rest.forEach((pic) => pic.classList.remove('hero-promo-brand-split-watermark'));
    }
  }

  content.querySelectorAll(':scope > p.button-container a.button').forEach((a) => {
    a.classList.add('primary');
  });

  content.querySelectorAll(':scope > p').forEach((p) => {
    if (p.classList.contains('button-container')) return;
    const link = p.querySelector(':scope > a[href]');
    if (link && !link.classList.contains('button')) {
      link.classList.add('hero-promo-brand-split-secondary');
    }
  });
}

export default function decorate(block) {
  if (block.classList.contains('black-thin')) {
    return;
  }
  if (block.classList.contains('brand-split')) {
    decorateBrandSplit(block);
    return;
  }
  if (!block.querySelector(':scope > div:first-child picture')) {
    block.classList.add('no-image');
  }
}
