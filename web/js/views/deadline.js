import { deadlineInfo, fmtDate, fmtMinutes, STATUS_CLASS } from "../plan.js";
import { getState, toggleTimer } from "../store.js";
import { h, progressBar } from "../ui.js";

// "Deadline Thu 2 Oct · 2 days left · 1h 10m of 4h · [Start studying]"
export function deadlineStrip(lessonId, { timer = true } = {}) {
  const info = deadlineInfo(lessonId);
  const running = !!getState().timer.runningSince;
  const pct = Math.min(100, Math.round((info.logged / info.planned) * 100));
  return h("div.deadline-strip",
    h("span", "📅 ", h("strong", info.deadline ? `Deadline ${fmtDate(info.deadline)}` : "No deadline yet")),
    h(`span.badge${STATUS_CLASS[info.status] ? "." + STATUS_CLASS[info.status] : ""}`, info.label),
    h("span", { style: { display: "inline-flex", alignItems: "center", gap: "8px" } }, "⏱ ",
      h("span", `${fmtMinutes(info.logged)} of ${info.planned / 60}h`), h("span", { style: { width: "80px" } }, progressBar(pct))),
    timer ? h("button.btn.sm" + (running ? ".good" : ".secondary"), { type: "button", onclick: toggleTimer }, running ? "● Stop timer" : "▶ Start study timer") : null,
    h("a.small", { href: "#/plan" }, "Study plan →"));
}
