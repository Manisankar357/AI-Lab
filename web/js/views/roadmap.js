import { PHASES, LESSONS, DIFFICULTY } from "../curriculum.js";
import { phaseProgress, isMastered, lessonState, isLocked } from "../store.js";
import { h, progressBar, statusBadge, stagger } from "../ui.js";
import { currentLesson } from "./home.js";

export function render(root) {
  const curPhase = currentLesson().phase;
  const masteredTopics = new Set(LESSONS.filter((l) => isMastered(l.id)).flatMap((l) => l.covers || []));

  root.append(
    h("div.page-head",
      h("div", h("div.eyebrow", "Roadmap"), h("h1", "From computing fundamentals to a market research AI"),
        h("p", "Each phase unlocks the next. Topics turn green only after your coding work is reviewed."))),
    h("div.timeline", PHASES.map((p) => {
      const pct = phaseProgress(p.key);
      const lessons = LESSONS.filter((l) => l.phase === p.key);
      const d = DIFFICULTY[p.difficulty];
      return h(`div.tl-item${pct === 100 ? ".done" : p.key === curPhase ? ".current" : ""}`,
        h("div.tl-dot", pct === 100 ? "✓" : p.num),
        h("div.card",
          h("div.row.between",
            h("h3", { style: { margin: 0 } }, p.title),
            h("div.row", h("span.badge", `${d.dot} ${d.label}`), p.key === curPhase ? h("span.badge.accent", "You are here") : null)),
          h("p.muted.small", { style: { margin: "6px 0 10px" } }, p.why),
          h("div.row", { style: { gap: "12px" } }, h("div", { style: { flex: 1 } }, progressBar(pct, pct === 100 ? "good" : "")), h("span.small.muted", `${pct}%`)),
          h("div.topic-chips", p.topics.map((t) => h(`span.chip${masteredTopics.has(t) ? ".done" : ""}`, t))),
          lessons.length
            ? h("div", { style: { marginTop: "14px" } }, lessons.map((l) =>
              h("div.row.between", { style: { padding: "6px 0", borderTop: "1px solid var(--border)" } },
                l.module && !isLocked(l.id) ? h("a", { href: `#/lesson/${l.id}` }, `${l.id} · ${l.title}`) : h("span.muted", `${l.id} · ${l.title}`),
                !l.module ? h("span.badge", "Written when you reach it") : isLocked(l.id) ? h("span.badge", "🔒 Locked") : statusBadge(lessonState(l.id).status))))
            : null,
          h("p.small", { style: { margin: "12px 0 0" } }, h("span.faint", "Project → "), h("strong", p.project))));
    })),
  );
  stagger([...root.querySelectorAll(".card")], 30);
}
