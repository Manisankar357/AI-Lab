import { lessonById, REVISION_INTERVALS } from "../curriculum.js";
import { revisionQueue, completeRevision } from "../store.js";
import { h, toast } from "../ui.js";

export async function render(root) {
  const queue = revisionQueue();
  const due = queue.filter((r) => r.isDue);
  const later = queue.filter((r) => !r.isDue);

  root.append(h("div.page-head", h("div", h("div.eyebrow", "Spaced revision"), h("h1", "Bring it back before it fades"),
    h("p", `Each mastered lesson comes back after ${REVISION_INTERVALS.join(", ")} days as a short coding challenge. No multiple choice.`))));

  if (!queue.length) {
    root.append(h("div.empty", h("strong", "Nothing to revise yet"),
      "When a lesson is marked mastered after review, its first revision challenge is scheduled for the next day."));
    return;
  }

  const card = async (r) => {
    const meta = lessonById(r.lessonId);
    const mod = meta.module ? await import(`../lessons/${meta.module}`) : null;
    const challenge = mod?.lesson.revision?.[r.stage] || mod?.lesson.revision?.at(-1);
    return h("div.card",
      h("div.row.between", h("h3", { style: { margin: 0 } }, meta.title),
        h("span.badge" + (r.isDue ? ".warn" : ""), r.isDue ? "Due now" : `Due ${r.due}`)),
      h("p.small.faint", `Stage ${r.stage + 1} of ${REVISION_INTERVALS.length} (${REVISION_INTERVALS[r.stage]}-day interval)`),
      r.isDue && challenge ? h("div.task", h("h4", challenge.title), h("div", { html: challenge.body })) : null,
      r.isDue ? h("div.row",
        h("button.btn.good.sm", { type: "button", onclick: () => { completeRevision(r.lessonId, false); toast("Next revision scheduled"); location.reload(); } }, "I solved it from memory"),
        h("button.btn.secondary.sm", { type: "button", onclick: () => { completeRevision(r.lessonId, true); toast("Reset to a 1-day interval"); location.reload(); } }, "I struggled, reset")) : null);
  };

  if (due.length) root.append(h("h2", "Due now"), h("div.grid", await Promise.all(due.map(card))));
  if (later.length) root.append(h("h2", { style: { marginTop: "24px" } }, "Scheduled"), h("div.grid.g2", await Promise.all(later.map(card))));
}
