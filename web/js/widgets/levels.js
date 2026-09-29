// "Beginner → Pro" ladder: the same topic explained at four depths.
// Every lesson uses it so you can always go one level deeper.
//
// levels(ctx, "key", [
//   { tier: "basics", title: "…", body: () => Node },
//   { tier: "under",  title: "…", body: () => Node },
//   { tier: "advanced", … }, { tier: "pro", … },
// ])

import { h } from "../ui.js";
import { linkTerms } from "../terms.js";

export const TIERS = {
  basics: "🟢 Basics",
  under: "🟡 Under the hood",
  advanced: "🟠 Advanced",
  pro: "🔴 Pro: in production",
};

export function levels(ctx, key, items) {
  let i = 0;
  const seen = new Set(ctx.exercise(key)?.seen || []);
  const body = h("div");
  const tabs = items.map((it, k) => h("button.btn.secondary.sm", { type: "button", role: "tab", onclick: () => show(k) }, TIERS[it.tier]));

  function show(k) {
    i = k;
    // Only save when this is a newly opened level (never on a plain page load).
    if (!seen.has(items[k].tier)) {
      seen.add(items[k].tier);
      if (k > 0) ctx.setExercise(key, { seen: [...seen] });
    }
    tabs.forEach((t, j) => {
      t.setAttribute("aria-selected", String(j === k));
      t.textContent = `${seen.has(items[j].tier) && j !== k ? "✓ " : ""}${TIERS[items[j].tier]}`;
    });
    const it = items[k];
    const next = items[k + 1];
    body.replaceChildren(h("div.level-body",
      h("h3", it.title),
      linkTerms(it.body()),
      h("div.level-foot",
        k > 0 ? h("button.btn.ghost.sm", { type: "button", onclick: () => show(k - 1) }, `← ${TIERS[items[k - 1].tier]}`) : h("span"),
        next ? h("button.btn.sm", { type: "button", onclick: () => { show(k + 1); body.scrollIntoView({ behavior: "smooth", block: "nearest" }); } }, `Go deeper: ${TIERS[next.tier]} →`)
          : h("span.badge.good", "You've reached the pro level of this topic"))));
  }
  show(0);
  return h("div", h("div.levels-tabs", { role: "tablist" }, tabs), body);
}
