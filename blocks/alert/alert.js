export default function decorate(block) {
  const row = block.firstElementChild;
  if (!row) return;
  const cols = [...row.children];
  block.classList.add(`alert-${cols.length}-cols`);
}
