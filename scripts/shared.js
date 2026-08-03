/**
 * Create a DOM element with attributes and optional child nodes or text.
 * @param {string} tag
 * @param {Record<string, string>} [attributes]
 * @param {Node|string|Array<Node|string>} [children]
 * @returns {HTMLElement}
 */
export function createTag(tag, attributes = {}, children) {
  const el = document.createElement(tag);
  Object.entries(attributes).forEach(([key, value]) => {
    el.setAttribute(key, value);
  });

  if (children == null) return el;

  const list = Array.isArray(children) ? children : [children];
  list.forEach((child) => {
    if (child == null) return;
    el.append(typeof child === 'string' ? document.createTextNode(child) : child);
  });

  return el;
}
