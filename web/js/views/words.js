import { GLOSSARY } from "../glossary.js";
import { lessonById } from "../curriculum.js";
import { isLocked } from "../store.js";
import { h } from "../ui.js";

// Only words from lessons you've unlocked, so nothing here is ahead of you.
export function render(root) {
  const words = Object.entries(GLOSSARY)
    .filter(([, g]) => !isLocked(g.lesson))
    .sort(([a], [b]) => a.localeCompare(b));
  const list = h("div");
  const search = h("input", { type: "text", placeholder: "Search words or meanings…", "aria-label": "Search the word book" });

  const paint = () => {
    const q = search.value.trim().toLowerCase();
    const hits = words.filter(([w, g]) => !q || w.toLowerCase().includes(q) || g.def.toLowerCase().includes(q));
    list.replaceChildren(...(hits.length
      ? hits.map(([w, g]) => h("div.wordbook-item",
        h("div", h("strong", w), h("div.small.faint", `Lesson ${g.lesson.slice(1)} · ${lessonById(g.lesson)?.title || ""}`)),
        h("div", g.def)))
      : [h("div.empty", h("strong", "No matching words"), "Try a different search.")]));
  };
  search.addEventListener("input", paint);
  paint();

  root.append(
    h("div.page-head", h("div", h("div.eyebrow", "Word book"), h("h1", "Every technical word, in plain English"),
      h("p", `${words.length} words so far. New words are added as you unlock lessons. In lessons, words with a dotted underline show these meanings when you hover over or tap them.`))),
    h("div.card", search, h("div", { style: { marginTop: "8px" } }, list)),
  );
}
