// Progress state: load, save, and derived metrics (streak, hours, phase %, revision).
// The server persists to data/progress.json; localStorage is only a fallback
// for when the server is unreachable.

import { PHASES, LESSONS, REVISION_INTERVALS } from "./curriculum.js";

const LOCAL_KEY = "ai-lab-progress-fallback";
const listeners = new Set();
let state = null;
let saveTimer = null;
let pending = []; // changes not yet confirmed by the server (replayed on conflict)
export let saveStatus = "idle"; // idle | saving | saved | offline

const emptyProgress = () => ({
  version: 1,
  rev: 0,           // save counter: the server rejects saves based on an older copy
  startedAt: new Date().toISOString(),
  activity: {},     // { "YYYY-MM-DD": minutes }
  activeDays: [],   // days with any learning interaction
  lessons: {},      // { L01: { status, sectionsDone, answers, exercises, hints, ... } }
  reviews: [],      // tutor reviews of your work: [{ lessonId, date, verdict, notes }]
  revision: {},     // { L01: { stage, due } }
  timer: { runningSince: null },
});

export const today = (d = new Date()) => {
  const z = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${z(d.getMonth() + 1)}-${z(d.getDate())}`;
};
const addDays = (iso, n) => {
  const d = new Date(iso + "T00:00:00");
  d.setDate(d.getDate() + n);
  return today(d);
};

export async function loadProgress() {
  try {
    const res = await fetch("/api/progress");
    if (!res.ok) throw new Error(res.statusText);
    const data = await res.json();
    state = { ...emptyProgress(), ...data };
  } catch {
    saveStatus = "offline";
    let local = null;
    try { local = JSON.parse(localStorage.getItem(LOCAL_KEY)); } catch { /* ignore */ }
    state = { ...emptyProgress(), ...(local || {}) };
  }
  applyReviews();
  return state;
}

// Reviews (data/reviews.json) are the source of truth for mastery. Apply each
// lesson's latest review to its status, and start revision on mastery.
function applyReviews() {
  const latest = {};
  for (const r of state.reviews) if (r.verdict === "mastered" || r.verdict === "revise") latest[r.lessonId] = r;
  for (const [id, r] of Object.entries(latest)) {
    const l = state.lessons[id] || (state.lessons[id] = { status: "in_progress", sectionsDone: [], answers: {}, exercises: {}, hints: {} });
    if (r.verdict === "mastered") {
      if (l.status !== "mastered" && l.status !== "needs_revision") { l.status = "mastered"; l.masteredAt = r.date; }
      if (!state.revision[id]) state.revision[id] = { stage: 0, due: addDays(r.date, REVISION_INTERVALS[0]), history: [] };
    } else if (l.status === "awaiting_review" && Date.parse(r.at) > Date.parse(l.submittedAt)) {
      l.status = "in_progress"; // sent back: revise and resubmit
    }
  }
}

export const getState = () => state;
export const subscribe = (fn) => { listeners.add(fn); return () => listeners.delete(fn); };
const notify = () => listeners.forEach((fn) => fn(state));

// Mutate through update() so every change is saved and the UI re-renders.
// Mutators must be safe to re-apply: if another tab saved first, we reload the
// latest progress and replay our unsaved changes on top of it.
export function update(mutator, { markActive = true } = {}) {
  const change = (s) => {
    mutator(s);
    if (markActive && !s.activeDays.includes(today())) s.activeDays.push(today());
  };
  change(state);
  pending.push(change);
  notify();
  scheduleSave();
}

function scheduleSave() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(save, 400);
}

export const hasUnsavedChanges = () => saveTimer !== null || saveStatus === "saving";

async function save() {
  saveTimer = null;
  saveStatus = "saving";
  notify();
  try {
    for (let attempt = 0; attempt < 3; attempt++) {
      const sent = pending.length;
      const res = await fetch("/api/progress", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(state),
      });
      if (res.status === 409) {
        // Another tab saved first: take its copy, then re-apply our changes.
        const fresh = await (await fetch("/api/progress")).json();
        state = { ...emptyProgress(), ...fresh };
        applyReviews();
        pending.forEach((change) => change(state));
        continue;
      }
      if (!res.ok) throw new Error(res.statusText);
      state.rev = (await res.json()).rev;
      pending = pending.slice(sent);
      saveStatus = "saved";
      notify();
      return;
    }
    throw new Error("could not save after retries");
  } catch {
    saveStatus = "offline";
    try { localStorage.setItem(LOCAL_KEY, JSON.stringify(state)); } catch { /* ignore */ }
  }
  notify();
}

// ---- Lessons ---------------------------------------------------------------

export function lessonState(id) {
  return state.lessons[id] || { status: "not_started", sectionsDone: [], answers: {}, exercises: {}, hints: {} };
}

export function updateLesson(id, mutator) {
  update((s) => {
    const l = s.lessons[id] || (s.lessons[id] = lessonState(id));
    if (l.status === "not_started") { l.status = "in_progress"; l.startedAt = new Date().toISOString(); }
    mutator(l);
  });
}

// Mastery is set only by a recorded tutor review (see applyReviews above).
export const isMastered = (id) => lessonState(id).status === "mastered";

export const isLocked = (id) => LESSONS.slice(0, LESSONS.findIndex((l) => l.id === id)).some((l) => !isMastered(l.id));

// ---- Derived metrics ------------------------------------------------------

export function phaseProgress(phaseKey) {
  const phase = PHASES.find((p) => p.key === phaseKey);
  const mastered = new Set();
  for (const l of LESSONS) {
    if (l.phase === phaseKey && isMastered(l.id)) (l.covers || []).forEach((t) => mastered.add(t));
  }
  return Math.round((mastered.size / phase.topics.length) * 100);
}

export function overallProgress() {
  const total = PHASES.reduce((n, p) => n + p.topics.length, 0);
  const done = PHASES.reduce((n, p) => n + (phaseProgress(p.key) / 100) * p.topics.length, 0);
  return Math.round((done / total) * 100);
}

export function streak() {
  const days = new Set([...state.activeDays, ...Object.keys(state.activity)]);
  let count = 0;
  let cursor = today();
  if (!days.has(cursor)) cursor = addDays(cursor, -1); // today not started yet: streak still alive
  while (days.has(cursor)) { count++; cursor = addDays(cursor, -1); }
  return count;
}

export function codingMinutes() {
  const logged = Object.values(state.activity).reduce((a, b) => a + b, 0);
  const running = state.timer.runningSince ? (Date.now() - state.timer.runningSince) / 60000 : 0;
  return Math.floor(logged + running);
}

// The first lesson that isn't mastered yet.
export const currentLessonId = () => (LESSONS.find((l) => lessonState(l.id).status !== "mastered") || LESSONS.at(-1)).id;

// Study time is logged per day (for the streak) and per lesson (for deadlines).
export function toggleTimer() {
  const stopping = !!state.timer.runningSince;
  const startedAt = state.timer.runningSince;
  const startLesson = currentLessonId();
  update((s) => {
    if (stopping) {
      if (!s.timer.runningSince) return; // already stopped elsewhere
      const mins = Math.round((Date.now() - startedAt) / 60000);
      s.activity[today()] = (s.activity[today()] || 0) + mins;
      const id = s.timer.lessonId || currentLessonId();
      const l = s.lessons[id] || (s.lessons[id] = lessonState(id));
      l.minutes = (l.minutes || 0) + mins;
      s.timer.runningSince = null;
      s.timer.lessonId = null;
    } else if (!s.timer.runningSince) {
      s.timer.runningSince = Date.now();
      s.timer.lessonId = startLesson;
    }
  });
}

export function lessonMinutes(id) {
  const running = state.timer.runningSince && (state.timer.lessonId || currentLessonId()) === id
    ? (Date.now() - state.timer.runningSince) / 60000 : 0;
  return Math.floor((lessonState(id).minutes || 0) + running);
}

// ---- Spaced revision --------------------------------------------------------

export function revisionQueue() {
  return Object.entries(state.revision)
    .map(([lessonId, r]) => ({ lessonId, ...r, isDue: r.due <= today() }))
    .sort((a, b) => a.due.localeCompare(b.due));
}

export function completeRevision(lessonId, struggled) {
  update((s) => {
    const r = s.revision[lessonId];
    r.stage = struggled ? 0 : Math.min(r.stage + 1, REVISION_INTERVALS.length - 1);
    r.due = addDays(today(), REVISION_INTERVALS[r.stage]);
    r.history = [...(r.history || []), { date: today(), struggled }];
    if (struggled) s.lessons[lessonId].status = "needs_revision";
  });
}

export function conceptsSummary() {
  const mastered = LESSONS.filter((l) => isMastered(l.id));
  const needsRevision = LESSONS.filter((l) => lessonState(l.id).status === "needs_revision"
    || revisionQueue().some((r) => r.lessonId === l.id && r.isDue));
  return { mastered, needsRevision };
}
