// Turn {{word}} / {{shown text|Key}} in lesson text into a tappable meaning
// from the word book. Used by lesson pages and any widget that renders later
// (e.g. the Beginner → Pro levels), so every word gets linked.

import { lookup } from "./glossary.js";
import { h } from "./ui.js";

const TERM_RE = /\{\{([^}|]+)(?:\|([^}]+))?\}\}/g;

export function linkTerms(node) {
  const walker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT);
  const hits = [];
  while (walker.nextNode()) if (walker.currentNode.nodeValue.includes("{{")) hits.push(walker.currentNode);
  for (const text of hits) {
    const frag = document.createDocumentFragment();
    let last = 0;
    text.nodeValue.replace(TERM_RE, (m, shown, key, at) => {
      frag.append(text.nodeValue.slice(last, at));
      const entry = lookup(key || shown);
      if (entry) {
        const tip = h("span.tip", { role: "tooltip" }, h("b", entry.word), entry.def);
        const btn = h("button.term", { type: "button" }, shown, tip);
        // Keep the bubble on screen when the word is near an edge.
        const place = () => requestAnimationFrame(() => {
          tip.style.marginLeft = "0px";
          const r = tip.getBoundingClientRect();
          const shift = r.right > innerWidth - 8 ? innerWidth - 8 - r.right : r.left < 8 ? 8 - r.left : 0;
          tip.style.marginLeft = `${shift}px`;
        });
        btn.addEventListener("mouseenter", place);
        btn.addEventListener("focus", place);
        frag.append(btn);
      } else frag.append(shown);
      last = at + m.length;
    });
    frag.append(text.nodeValue.slice(last));
    text.replaceWith(frag);
  }
  return node;
}
