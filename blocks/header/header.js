import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

const isDesktop = window.matchMedia('(min-width: 900px)');

function closeOnEscape(e) {
  if (e.code === 'Escape') {
    const nav = document.getElementById('nav');
    const navSections = nav.querySelector('.nav-sections');
    const navSectionExpanded = navSections.querySelector('[aria-expanded="true"]');
    if (navSectionExpanded && isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleAllNavSections(navSections);
      navSectionExpanded.focus();
    } else if (!isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleMenu(nav, navSections);
      nav.querySelector('.nav-hamburger button').focus();
    }
  }
}

function closeOnFocusLost(e) {
  const nav = e.currentTarget;
  if (!nav.contains(e.relatedTarget)) {
    const navSections = nav.querySelector('.nav-sections');
    const navSectionExpanded = navSections.querySelector('[aria-expanded="true"]');
    if (navSectionExpanded && isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleAllNavSections(navSections, false);
    } else if (!isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleMenu(nav, navSections, false);
    }
  }
}

function openOnKeydown(e) {
  const focused = document.activeElement;
  const isNavDrop = focused.className === 'nav-drop';
  if (isNavDrop && (e.code === 'Enter' || e.code === 'Space')) {
    const dropExpanded = focused.getAttribute('aria-expanded') === 'true';
    // eslint-disable-next-line no-use-before-define
    toggleAllNavSections(focused.closest('.nav-sections'));
    focused.setAttribute('aria-expanded', dropExpanded ? 'false' : 'true');
  }
}

function focusNavSection() {
  document.activeElement.addEventListener('keydown', openOnKeydown);
}

function toggleAllNavSections(sections, expanded = false) {
  sections.querySelectorAll('.nav-sections .default-content-wrapper > ul > li').forEach((section) => {
    section.setAttribute('aria-expanded', expanded);
  });
}

function toggleMenu(nav, navSections, forceExpanded = null) {
  const expanded = forceExpanded !== null ? !forceExpanded : nav.getAttribute('aria-expanded') === 'true';
  const button = nav.querySelector('.nav-hamburger button');
  document.body.style.overflowY = (expanded || isDesktop.matches) ? '' : 'hidden';
  nav.setAttribute('aria-expanded', expanded ? 'false' : 'true');
  toggleAllNavSections(navSections, expanded || isDesktop.matches ? 'false' : 'true');
  button.setAttribute('aria-label', expanded ? 'Open navigation' : 'Close navigation');

  const navDrops = navSections.querySelectorAll('.nav-drop');
  if (isDesktop.matches) {
    navDrops.forEach((drop) => {
      if (!drop.hasAttribute('tabindex')) {
        drop.setAttribute('tabindex', 0);
        drop.addEventListener('focus', focusNavSection);
      }
    });
  } else {
    navDrops.forEach((drop) => {
      drop.removeAttribute('tabindex');
      drop.removeEventListener('focus', focusNavSection);
    });
  }

  if (!expanded || isDesktop.matches) {
    window.addEventListener('keydown', closeOnEscape);
    nav.addEventListener('focusout', closeOnFocusLost);
  } else {
    window.removeEventListener('keydown', closeOnEscape);
    nav.removeEventListener('focusout', closeOnFocusLost);
  }
}

export default async function decorate(block) {
  const navMeta = getMetadata('nav');
  const navPath = navMeta ? new URL(navMeta, window.location).pathname : '/nav';
  const fragment = await loadFragment(navPath);

  block.textContent = '';
  const nav = document.createElement('nav');
  nav.id = 'nav';
  while (fragment.firstElementChild) nav.append(fragment.firstElementChild);

  const classes = ['brand', 'sections', 'tools'];
  classes.forEach((c, i) => {
    const section = nav.children[i];
    if (section) section.classList.add(`nav-${c}`);
  });

  // Strip button classes from brand
  const navBrand = nav.querySelector('.nav-brand');
  const brandLink = navBrand.querySelector('.button');
  if (brandLink) {
    brandLink.className = '';
    brandLink.closest('.button-container').className = '';
  }

  // Strip button classes from tools
  const navTools = nav.querySelector('.nav-tools');
  if (navTools) {
    navTools.querySelectorAll('.button').forEach((btn) => {
      btn.className = '';
      const container = btn.closest('.button-container');
      if (container) container.className = '';
    });
  }

  // Decorate nav sections (dropdowns)
  const navSections = nav.querySelector('.nav-sections');
  if (navSections) {
    navSections.querySelectorAll('.button').forEach((btn) => {
      btn.className = '';
      const container = btn.closest('.button-container');
      if (container) container.className = '';
    });

    navSections.querySelectorAll(':scope .default-content-wrapper > ul > li').forEach((navSection) => {
      if (navSection.querySelector('ul')) navSection.classList.add('nav-drop');
      navSection.addEventListener('click', () => {
        if (isDesktop.matches) {
          const expanded = navSection.getAttribute('aria-expanded') === 'true';
          toggleAllNavSections(navSections);
          navSection.setAttribute('aria-expanded', expanded ? 'false' : 'true');
        }
      });
    });
  }

  // Build two-row layout: top-bar (brand + utility) and bottom-bar (sections + search)
  const topBar = document.createElement('div');
  topBar.className = 'nav-top-bar';

  const bottomBar = document.createElement('div');
  bottomBar.className = 'nav-bottom-bar';

  // Top bar: brand left, utility center, tools right
  topBar.append(navBrand);
  if (navTools) {
    // Split tools: "My Store" and "Need help?" go to center utility area
    const utilityItems = [];
    const toolItems = [];
    const toolsList = navTools.querySelector('ul');
    if (toolsList) {
      toolsList.querySelectorAll(':scope > li').forEach((li) => {
        const text = li.textContent.trim().toLowerCase();
        if (text.startsWith('my store') || text.startsWith('need help')) {
          utilityItems.push(li);
        } else {
          toolItems.push(li);
        }
      });
    }

    if (utilityItems.length > 0) {
      const utilityBar = document.createElement('div');
      utilityBar.className = 'nav-utility';
      const utilityList = document.createElement('ul');
      utilityItems.forEach((li) => utilityList.append(li));
      utilityBar.append(utilityList);
      topBar.append(utilityBar);
    }

    // Remaining tools (Join/Sign In, Vehicle, Cart) stay in tools
    if (toolItems.length > 0 && toolsList) {
      toolsList.replaceChildren(...toolItems);
    }
    topBar.append(navTools);
  }

  // Bottom bar: sections + search
  if (navSections) bottomBar.append(navSections);

  // Move search from tools to bottom bar
  if (navTools) {
    const searchItem = navTools.querySelector('a[href*="search"]');
    if (searchItem) {
      const searchContainer = document.createElement('div');
      searchContainer.className = 'nav-search';
      searchContainer.innerHTML = '<span class="nav-search-placeholder">What can we help you find?</span>';
      const searchIcon = document.createElement('span');
      searchIcon.className = 'nav-search-icon';
      searchContainer.append(searchIcon);
      searchItem.closest('li')?.remove();
      bottomBar.append(searchContainer);
    }
  }

  // Hamburger for mobile
  const hamburger = document.createElement('div');
  hamburger.classList.add('nav-hamburger');
  hamburger.innerHTML = `<button type="button" aria-controls="nav" aria-label="Open navigation">
      <span class="nav-hamburger-icon"></span>
    </button>`;
  hamburger.addEventListener('click', () => toggleMenu(nav, navSections));
  topBar.prepend(hamburger);

  nav.replaceChildren(topBar, bottomBar);
  nav.setAttribute('aria-expanded', 'false');

  toggleMenu(nav, navSections, isDesktop.matches);
  isDesktop.addEventListener('change', () => toggleMenu(nav, navSections, isDesktop.matches));

  const navWrapper = document.createElement('div');
  navWrapper.className = 'nav-wrapper';
  navWrapper.append(nav);
  block.append(navWrapper);
}
