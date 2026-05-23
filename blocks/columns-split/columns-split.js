export default function decorate(block) {
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

  if (cols.length === 2) {
    const row = block.firstElementChild;
    const divider = document.createElement('div');
    divider.classList.add('columns-split-divider');
    divider.setAttribute('aria-hidden', 'true');
    divider.textContent = 'OR';
    row.insertBefore(divider, row.children[1]);
  }
}
