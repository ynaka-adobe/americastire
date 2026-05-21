export default function decorate(block) {
  const cols = [...block.firstElementChild.children];
  block.classList.add(`columns-split-${cols.length}-cols`);

  // For each cell/column, restructure content into icon+text content area + CTA button
  [...block.children].forEach((row) => {
    [...row.children].forEach((col) => {
      const pic = col.querySelector('picture');
      const paragraphs = [...col.querySelectorAll('p')];

      if (pic && paragraphs.length > 0) {
        // Create content wrapper with icon and text
        const content = document.createElement('div');
        content.classList.add('columns-split-content');

        // Icon wrapper
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

        // Text wrapper
        const textWrapper = document.createElement('div');
        textWrapper.classList.add('columns-split-text');
        paragraphs.forEach((p) => {
          // Skip if this is the picture paragraph we already handled
          if (!p.querySelector('picture') && !p.classList.contains('button-container') && p.parentElement) {
            textWrapper.appendChild(p);
          }
        });
        content.appendChild(textWrapper);

        // Insert content at the beginning of the cell
        col.prepend(content);
      }
    });
  });

  // Add OR divider between columns (only for 2-col layout)
  if (cols.length === 2) {
    const row = block.firstElementChild;
    const divider = document.createElement('div');
    divider.classList.add('columns-split-divider');
    divider.setAttribute('aria-hidden', 'true');
    divider.textContent = 'OR';
    // Insert between the two cells
    row.insertBefore(divider, row.children[1]);
  }
}
