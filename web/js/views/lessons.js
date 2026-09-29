import { LESSONS, DIFFICULTY, phaseByKey } from "../curriculum.js";
import { lessonState, isLocked } from "../store.js";
import { h, statusBadge, stagger } from "../ui.js";

export function render(root) {
  root.append(
    h("div.page-head", h("div", h("div.eyebrow", "Lessons"), h("h1", "One small step at a time"),
      h("p", "Each lesson only assumes the ones before it. New lessons unlock after your work is reviewed."))),
    h("div.grid", LESSONS.map((l) => {
      const st = lessonState(l.id);
      const d = DIFFICULTY[l.difficulty];
      const locked = isLocked(l.id);
      const badge = !l.module ? h("span.badge", "Written when you get here")
        : locked ? h("span.badge", "🔒 Locked") : statusBadge(st.status);
      const body = [
        h("div", h("div.eyebrow", `Lesson ${l.id.slice(1)} · ${phaseByKey(l.phase).title}`), h("h3", { style: { margin: 0 } }, l.title),
          h("div.small.muted", `${d.dot} ${d.label} · ~${l.minutes} min`)),
        badge,
      ];
      return l.module && !locked
        ? h("a.card.row.between", { href: `#/lesson/${l.id}`, style: { textDecoration: "none", color: "inherit" } }, body)
        : h("div.card.row.between", { style: { opacity: .65 } }, body);
    })),
  );
  stagger([...root.querySelectorAll(".card")]);
}
