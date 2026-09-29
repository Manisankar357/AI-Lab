import { LESSONS, DIFFICULTY } from "../curriculum.js";
import { phaseProgress, lessonState, today } from "../store.js";
import { getPlan, savePlan, lessonDeadlines, phaseTargets, totalHours, fmtDate, fmtMinutes, deadlineInfo, STATUS_CLASS, replanFromToday, daysBetween } from "../plan.js";
import { h, progressBar, stagger, toast } from "../ui.js";

export function render(root) {
  const draw = () => {
    const plan = getPlan();
    const phases = phaseTargets(plan);
    const deadlines = lessonDeadlines(plan);
    const proDate = phases.at(-1).target;
    const weekly = plan.hoursPerDay * plan.daysPerWeek;
    const maxH = Math.max(...phases.map((p) => p.hours));

    const hoursSel = h("select", { "aria-label": "Hours per study day" },
      [0.5, 1, 1.5, 2, 3, 4, 5, 6, 8].map((v) => h("option", { value: v, selected: v === plan.hoursPerDay }, `${v} hour${v === 1 ? "" : "s"} per day`)));
    const daysSel = h("select", { "aria-label": "Study days per week" },
      [3, 4, 5, 6, 7].map((v) => h("option", { value: v, selected: v === plan.daysPerWeek }, `${v} days a week${v === 6 ? " (Sunday off)" : v === 5 ? " (weekends off)" : ""}`)));
    const startIn = h("input", { type: "date", value: plan.startDate, "aria-label": "Plan start date", style: { width: "100%" } });
    hoursSel.addEventListener("change", () => { savePlan({ hoursPerDay: +hoursSel.value }); draw(); });
    daysSel.addEventListener("change", () => { savePlan({ daysPerWeek: +daysSel.value }); draw(); });
    startIn.addEventListener("change", () => { if (startIn.value) { savePlan({ startDate: startIn.value }); draw(); } });

    const behind = LESSONS.some((l) => deadlineInfo(l.id).status === "overdue");

    root.replaceChildren(...[
      h("div.page-head", h("div", h("div.eyebrow", "Study plan"), h("h1", "Your road to Pro, with deadlines"),
        h("p", "Every lesson and phase has planned hours. Your plan turns them into real dates. Adjust it to fit your life: consistency beats intensity."))),

      h("div.grid.g3", { style: { marginBottom: "16px" } },
        h("div.card", h("h3", "Your plan"),
          h("div.stack", hoursSel, daysSel, h("label.small.muted", "Plan starts on", startIn)),
          h("p.small.muted", { style: { margin: "10px 0 0" } }, `= ${weekly} hours of study per week`)),
        h("div.card.stat", h("div.label", "Total path to Pro"), h("div.value", `${totalHours()} h`),
          h("div.sub", `${phases.length} phases · computing basics → production AI systems`)),
        h("div.card.stat", h("div.label", "At this pace you reach Pro level on"), h("div.value", { style: { fontSize: "1.3rem" } }, fmtDate(proDate)),
          h("div.sub", `about ${Math.round(daysBetween(plan.startDate, proDate) / 30.4)} months from your start date`))),

      behind ? h("div.callout.warn", h("strong", "You're behind schedule, and that's normal. "),
        "Learning properly matters more than a date. You can re-plan the remaining lessons to start from today. ",
        h("button.btn.sm", { type: "button", style: { marginLeft: "6px" }, onclick: () => { replanFromToday(); toast("Plan updated from today"); draw(); } }, "Re-plan from today")) : null,

      h("div.card", { style: { marginBottom: "16px" } },
        h("h3", "Lesson deadlines"),
        h("p.small.muted", "Lessons are written one at a time, so this list grows as you go. Time is logged with the coding-session timer on Home or on a lesson page."),
        h("div", LESSONS.map((l) => {
          const info = deadlineInfo(l.id);
          const st = lessonState(l.id);
          const pct = Math.min(100, Math.round((info.logged / info.planned) * 100));
          return h("div.plan-row",
            h("div", h("strong", `${l.id} · ${l.title}`), h("div.small.faint", `${DIFFICULTY[l.difficulty].dot} ${l.hours} h planned${l.module ? "" : " · written when you get here"}`)),
            h("div", h("div.small", `${fmtMinutes(info.logged)} of ${l.hours}h logged`), progressBar(pct, st.status === "mastered" ? "good" : "")),
            h("div.plan-date", deadlines[l.id] ? fmtDate(deadlines[l.id]) : "—",
              h(`span.badge${STATUS_CLASS[info.status] ? "." + STATUS_CLASS[info.status] : ""}`, info.label)));
        }))),

      h("div.card",
        h("h3", "Phase timeline"),
        h("p.small.muted", "Bar length = planned hours. The date is when you'd finish that phase at your current pace."),
        h("div", phases.map((p) => {
          const pct = phaseProgress(p.key);
          const past = p.target < today() && pct < 100;
          return h("div.gantt-row",
            h("div", h("div", h("strong", `${p.num}. ${p.title}`)), h("div.small.faint", `${DIFFICULTY[p.difficulty].dot} ${p.hours} h · ${pct}% mastered`)),
            h("div.gantt-track", h("span", { style: { width: `${(p.hours / maxH) * 100}%` }, class: p.difficulty })),
            h("div.plan-date", fmtDate(p.target), past ? h("span.badge.bad", "past target") : null));
        }))),
    ].filter(Boolean));
    stagger([...root.querySelectorAll(".card")]);
  };
  draw();
}
