import { PROJECTS, phaseByKey } from "../curriculum.js";
import { getState } from "../store.js";
import { h, stagger } from "../ui.js";

export function render(root) {
  const done = getState().completedProjects || [];
  const next = PROJECTS.find((p) => !done.includes(p.id));

  root.append(
    h("div.page-head", h("div", h("div.eyebrow", "Project ladder"), h("h1", "Every project reuses the last one"),
      h("p", "You build these yourself. Each one is marked complete only after a code review."))),
    h("div.ladder", PROJECTS.map((p) => {
      const isDone = done.includes(p.id);
      const isNext = p === next;
      return h("div.card.rung", { style: isNext ? { borderColor: "var(--accent)" } : null },
        h("span.num", p.id),
        h("div", h("strong", p.title), h("div.small.muted", p.builds), h("div.small.faint", `Phase: ${phaseByKey(p.phase).title}`)),
        isDone ? h("span.badge.good", "✓ Complete") : isNext ? h("span.badge.accent", "Up next") : h("span.badge", "Locked"));
    })),
  );
  stagger([...root.querySelectorAll(".card")], 30);
}
