import { PROJECTS, PRODUCTION_CHECKLIST, phaseByKey } from "../curriculum.js";
import { getState } from "../store.js";
import { h, stagger } from "../ui.js";

export function render(root) {
  const done = getState().completedProjects || [];
  const next = PROJECTS.find((p) => !done.includes(p.id));

  root.append(
    h("div.page-head", h("div", h("div.eyebrow", "Project ladder"), h("h1", "From your first script to production AI"),
      h("p", "Each project reuses the last one, and the bar rises every time. From project P06 on, projects are deployed on the internet. Each one is marked complete only after a code review."))),
    h("details.card", { style: { marginBottom: "16px" } },
      h("summary", h("strong", "What does \"production-grade\" mean? (the 16-point checklist)")),
      h("ol.small", { style: { marginTop: "10px" } }, Object.values(PRODUCTION_CHECKLIST).map((t) => h("li", t))),
      h("p.small.muted", { style: { margin: 0 } }, "Early projects need only a few items. By the capstone, you meet all 16, which is what professional teams expect.")),
    h("div.ladder", PROJECTS.map((p) => {
      const isDone = done.includes(p.id);
      const isNext = p === next;
      const deployed = p.ship.includes("deployed");
      return h("div.card.rung", { style: isNext ? { borderColor: "var(--accent)" } : null },
        h("span.num", p.id),
        h("div",
          h("strong", p.title, deployed ? " 🚀" : ""),
          h("div.small.muted", p.builds),
          h("div.small.faint", `Phase: ${phaseByKey(p.phase).title} · production bar: ${p.ship.length}/16`),
          h("div.topic-chips", p.ship.map((k) => h(`span.chip${isDone ? ".done" : ""}`, { title: PRODUCTION_CHECKLIST[k] }, k)))),
        isDone ? h("span.badge.good", "✓ Complete") : isNext ? h("span.badge.accent", "Up next") : h("span.badge", "Locked"));
    })),
  );
  stagger([...root.querySelectorAll(".card")], 30);
}
