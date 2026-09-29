import { PHASES, LESSONS, PROJECTS, phaseByKey } from "../curriculum.js";
import {
  getState, lessonState, phaseProgress, overallProgress, streak, codingMinutes,
  toggleTimer, conceptsSummary, revisionQueue, subscribe,
} from "../store.js";
import { h, progressBar, statusBadge, stagger } from "../ui.js";

// The current lesson is the first one not yet mastered.
export const currentLesson = () => LESSONS.find((l) => lessonState(l.id).status !== "mastered") || LESSONS.at(-1);

const fmtHours = (m) => (m < 60 ? `${m}m` : `${(m / 60).toFixed(1)}h`);

export function render(root) {
  const draw = () => {
    const s = getState();
    const cur = currentLesson();
    const curPhase = phaseByKey(cur.phase);
    const curState = lessonState(cur.id);
    const { mastered, needsRevision } = conceptsSummary();
    const due = revisionQueue().filter((r) => r.isDue);
    const doneProjects = s.completedProjects || [];
    const nextProject = PROJECTS.find((p) => !doneProjects.includes(p.id));
    const running = !!s.timer.runningSince;

    const stats = [
      h("div.card.stat", h("div.label", "Overall progress"), h("div.value", `${overallProgress()}%`), h("div.sub", "topics mastered through reviewed work")),
      h("div.card.stat", h("div.label", "Current streak"), h("div.value", `${streak()} day${streak() === 1 ? "" : "s"}`), h("div.sub", "consecutive days of learning")),
      h("div.card.stat", h("div.label", "Coding time"), h("div.value", fmtHours(codingMinutes())),
        h("div.row", { style: { marginTop: "6px" } },
          h("button.btn.sm" + (running ? ".good" : ".secondary"), { type: "button", onclick: toggleTimer },
            running ? "● Stop session" : "Start coding session"))),
      h("div.card.stat", h("div.label", "Projects completed"), h("div.value", `${doneProjects.length} / ${PROJECTS.length}`), h("div.sub", nextProject ? `Next: ${nextProject.title}` : "All done")),
    ];

    root.replaceChildren(
      h("div.page-head",
        h("div", h("div.eyebrow", `Phase ${curPhase.num} · ${curPhase.title}`), h("h1", "AI Engineering Lab"),
          h("p", "Learn a concept → visualize it → build it yourself → break it → fix it → connect it to markets.")),
      ),
      h("div.card.mission", { style: { marginBottom: "16px" } },
        h("div.row.between",
          h("div",
            h("div.eyebrow", "Current mission"),
            h("h2", cur.title),
            h("p.muted", { style: { margin: 0 } }, `Lesson ${cur.id.slice(1)} · about ${cur.minutes} min · `, statusBadge(curState.status))),
          h("a.btn", { href: `#/lesson/${cur.id}` }, curState.status === "not_started" ? "Start lesson →" : "Continue →")),
        curState.status === "awaiting_review"
          ? h("div.callout.warn", { style: { marginTop: "14px", marginBottom: 0 } },
            "Your work is waiting for review. In Claude Code, say: ", h("code", `review my ${cur.id} work`))
          : null),
      h("div.grid.g4", { style: { marginBottom: "16px" } }, stats),
      h("div.grid.g3",
        h("div.card.span2",
          h("h3", "Progress by phase"),
          h("div.phase-bars", PHASES.map((p) => {
            const pct = phaseProgress(p.key);
            return h("div.phase-bar", h("span", p.short), progressBar(pct, pct === 100 ? "good" : ""), h("span.pct", `${pct}%`));
          }))),
        h("div.grid", { style: { alignContent: "start" } },
          h("div.card",
            h("h3", "Upcoming challenge"),
            due.length
              ? h("div", h("p", `${due.length} revision challenge${due.length > 1 ? "s" : ""} due.`), h("a.btn.sm", { href: "#/revision" }, "Open revision"))
              : h("p.muted.small", { style: { margin: 0 } }, `The ${cur.title} coding task. Revision challenges show up here 1, 3, 7, 14 and 30 days after you master a lesson.`)),
          h("div.card",
            h("h3", "Concepts"),
            h("div.small", h("strong", mastered.length), " mastered"),
            mastered.length ? h("div.topic-chips", mastered.map((l) => h("span.chip.done", l.title))) : null,
            h("div.small", { style: { marginTop: "10px" } }, h("strong", needsRevision.length), " need revision"),
            needsRevision.length ? h("div.topic-chips", needsRevision.map((l) => h("span.chip", l.title))) : null),
          h("div.card",
            h("h3", "Current project"),
            h("div", h("strong", nextProject?.title)),
            h("p.small.muted", { style: { margin: "4px 0 0" } }, nextProject?.builds)))),
    );
    stagger([...root.querySelectorAll(".card")]);
  };
  draw();
  const unsub = subscribe(draw);
  const tick = setInterval(() => getState().timer.runningSince && draw(), 30000);
  return () => { unsub(); clearInterval(tick); };
}
