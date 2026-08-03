/**
 * "Shop Tires Your Way" dual-panel layout (or author `columns-split (shop-your-way)`).
 * @param {Element} block
 */
function applyShopYourWayVariant(block) {
  if (block.classList.contains('shop-your-way')) return;
  const wrapper = block.parentElement;
  const prev = wrapper?.previousElementSibling;
  if (!prev) return;
  let heading = null;
  if (prev.classList?.contains('default-content-wrapper')) {
    heading = prev.querySelector('h1, h2, h3, h4, h5, h6');
  } else if (/^H[1-6]$/i.test(prev.tagName)) {
    heading = prev;
  }
  if (!heading) return;
  if (/shop\s+tires\s+your\s+way/i.test(heading.textContent.trim())) {
    block.classList.add('shop-your-way');
  }
}

export default function decorate(block) {
  applyShopYourWayVariant(block);
  const cols = [...block.firstElementChild.children];
  block.classList.add(`columns-split-${cols.length}-cols`);

  if (cols.length === 1) return;

  [...block.children].forEach((row) => {
    [...row.children].forEach((col) => {
      const pic = col.querySelector('picture');
      const paragraphs = [...col.querySelectorAll('p')];

      if (pic && paragraphs.length > 0) {
        const content = document.createElement('div');
        content.classList.add('columns-split-content');

        const iconWrapper = document.createElement('div');
        iconWrapper.classList.add('columns-split-icon');
        const picParent = pic.closest('p') || pic.parentElement;
        if (picParent && picParent.tagName === 'P') {
          iconWrapper.appendChild(pic);
          picParent.remove();
        } else {
          iconWrapper.appendChild(pic);
        }
        content.appendChild(iconWrapper);

        const textWrapper = document.createElement('div');
        textWrapper.classList.add('columns-split-text');
        paragraphs.forEach((p) => {
          if (!p.querySelector('picture') && !p.classList.contains('button-container') && p.parentElement) {
            textWrapper.appendChild(p);
          }
        });
        content.appendChild(textWrapper);

        col.prepend(content);
      }
    });
  });

  if (cols.length === 2 && !block.classList.contains('shop-your-way')) {
    const row = block.firstElementChild;
    const divider = document.createElement('div');
    divider.classList.add('columns-split-divider');
    divider.setAttribute('aria-hidden', 'true');
    divider.textContent = 'OR';
    row.insertBefore(divider, row.children[1]);
  }

  if (block.classList.contains('shop-your-way')) {
    const treadwellList = block.querySelector(':scope > div > div:first-child ul:first-of-type');
    treadwellList?.querySelectorAll(':scope > li').forEach((li) => {
      const next = li.textContent.replace(/^\s*\d+/, '').trim();
      if (next) li.textContent = next;
    });
    ensureShopYourWayLeftHero(block);
  }
}

/**
 * Left "Treadwell" card: show hero cutout (repo image or `window.hlx.shopYourWayHeroImage`)
 * and wrap remaining nodes so copy sits beside the figure.
 * @param {Element} block
 */
function ensureShopYourWayLeftHero(block) {
  const leftCol = block.querySelector(':scope > div > div:first-child');
  if (!leftCol || leftCol.querySelector(':scope > .columns-split-hero')) return;

  const hero = document.createElement('div');
  hero.className = 'columns-split-hero';
  const img = document.createElement('img');
  const prefix = window.hlx?.codeBasePath || '';
  img.src = window.hlx?.shopYourWayHeroImage || `${prefix}/images/shop-your-way-treadwell-hero.png`;
  img.alt = '';
  img.loading = 'lazy';
  hero.append(img);
  leftCol.prepend(hero);

  const stack = document.createElement('div');
  stack.className = 'columns-split-left-stack';
  while (hero.nextSibling) {
    stack.append(hero.nextSibling);
  }
  leftCol.append(stack);
}
