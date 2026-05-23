export default function decorate(block) {
  if (block.classList.contains('black-thin')) {
    return;
  }
  if (!block.querySelector(':scope > div:first-child picture')) {
    block.classList.add('no-image');
  }
}
