// Study plan: turns planned hours into real deadlines.
// Pure date maths lives here. Views only display the results.

import { LESSONS, PHASES } from "./curriculum.js";
import { getState, update, today, lessonState, currentLessonId, lessonMinutes } from "./store.js";

export const DEFAULT_PLAN = { hoursPerDay: 2, daysPerWeek: 6 };
const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function getPlan() {
  const s = getState();
  return {
    ...DEFAULT_PLAN,
    startDate: (s.startedAt || new Date().toISOString()).slice(0, 10),
    fromLesson: LESSONS[0].id,
    ...(s.plan || {}),
  };
}

export function savePlan(changes) {
  update((s) => { s.plan = { ...getPlan(), ...changes }; });
}

// Study days are the first N days of the week (Mon..Sun); 6 means Sunday off.
const isStudyDay = (d, perWeek) => ((d.getDay() + 6) % 7) < perWeek;
const toDate = (iso) => new Date(iso + "T00:00:00");

// The date on which the n-th study day (1-based) falls, counting from `startIso`.
export function nthStudyDay(startIso, n, perWeek) {
  const d = toDate(startIso);
  let count = 0;
  for (let guard = 0; guard < 5000; guard++) {
    if (isStudyDay(d, perWeek) && ++count >= n) return today(d);
    d.setDate(d.getDate() + 1);
  }
  return today(d);
}

// Deadline for each lesson from `fromLesson` onward, stacking planned hours.
export function lessonDeadlines(plan = getPlan()) {
  const out = {};
  const start = Math.max(0, LESSONS.findIndex((l) => l.id === plan.fromLesson));
  let cum = 0;
  for (const l of LESSONS.slice(start)) {
    cum += l.hours;
    out[l.id] = nthStudyDay(plan.startDate, Math.max(1, Math.ceil(cum / plan.hoursPerDay - 1e-9)), plan.daysPerWeek);
  }
  return out;
}

// Target finish date for each phase, from its hour estimate.
export function phaseTargets(plan = getPlan()) {
  let cum = 0;
  return PHASES.map((p) => {
    cum += p.hours;
    return { ...p, cumHours: cum, target: nthStudyDay(plan.startDate, Math.ceil(cum / plan.hoursPerDay), plan.daysPerWeek) };
  });
}

export const totalHours = () => PHASES.reduce((a, p) => a + p.hours, 0);

export function daysBetween(fromIso, toIso) {
  return Math.round((toDate(toIso) - toDate(fromIso)) / 86400000);
}

export const fmtDate = (iso) => {
  const d = toDate(iso);
  return `${WEEKDAYS[(d.getDay() + 6) % 7]} ${d.getDate()} ${d.toLocaleString("en-IN", { month: "short" })} ${d.getFullYear()}`;
};

export const fmtMinutes = (m) => (m < 60 ? `${m}m` : `${Math.floor(m / 60)}h ${String(m % 60).padStart(2, "0")}m`);

// Everything a view needs to show a lesson's deadline.
export function deadlineInfo(id) {
  const lesson = LESSONS.find((l) => l.id === id);
  const deadline = lessonDeadlines()[id];
  const st = lessonState(id);
  const logged = lessonMinutes(id);
  const planned = lesson.hours * 60;
  if (st.status === "mastered") return { deadline, logged, planned, status: "done", label: "✓ Done" };
  if (!deadline) return { deadline: null, logged, planned, status: "none", label: "Not scheduled" };
  const left = daysBetween(today(), deadline);
  const status = left < 0 ? "overdue" : left === 0 ? "today" : left <= 1 ? "soon" : "ok";
  const label = left < 0 ? `Overdue by ${-left} day${left === -1 ? "" : "s"}`
    : left === 0 ? "Due today" : left === 1 ? "Due tomorrow" : `${left} days left`;
  return { deadline, logged, planned, status, label };
}

export const STATUS_CLASS = { done: "good", ok: "accent", soon: "warn", today: "warn", overdue: "bad", none: "" };

// Behind schedule? Re-plan the remaining lessons starting today.
export function replanFromToday() {
  savePlan({ startDate: today(), fromLesson: currentLessonId() });
}
