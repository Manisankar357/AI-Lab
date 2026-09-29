// App shell: hash router, navigation, theme, save indicator.
import { loadProgress, subscribe, saveStatus, revisionQueue, getState, hasUnsavedChanges } from "./store.js";
import { h } from "./ui.js";
import * as home from "./views/home.js";
import * as roadmap from "./views/roadmap.js";
import * as graph from "./views/graph.js";
import * as projects from "./views/projects.js";
import * as lessons from "./views/lessons.js";
import * as lesson from "./views/lesson.js";
import * as revision from "./views/revision.js";
import * as tutor from "./views/tutor.js";
import * as words from "./views/words.js";
import * as plan from "./views/plan.js";

const ROUTES = {
  home: { view: home, label: "Home" },
  roadmap: { view: roadmap, label: "Roadmap" },
  graph: { view: graph, label: "Knowledge Graph" },
  lessons: { view: lessons, label: "Lessons" },
  plan: { view: plan, label: "Study plan" },
  projects: { view: projects, label: "Projects" },
  words: { view: words, label: "Word book" },
  revision: { view: revision, label: "Revision" },
  tutor: { view: tutor, label: "Tutor" },
  lesson: { view: lesson, hidden: true },
};

const main = document.getElementById("main");
let currentKey = null;
let cleanup = null;

function parseRoute() {
  const [key = "home", ...params] = location.hash.replace(/^#\/?/, "").split("/");
  return { key: ROUTES[key] ? key : "home", params };
}

function renderNav(activeKey) {
  const due = revisionQueue().filter((r) => r.isDue).length;
  const nav = document.getElementById("nav");
  nav.replaceChildren(...Object.entries(ROUTES).filter(([, r]) => !r.hidden).map(([key, r]) =>
    h("a", { href: `#/${key}`, "aria-current": key === activeKey || (activeKey === "lesson" && key === "lessons") ? "page" : null },
      r.label, key === "revision" && due ? h("span.count", due) : null)));
}

async function route() {
  const { key, params } = parseRoute();
  if (typeof cleanup === "function") cleanup();
  currentKey = key;
  renderNav(key);
  const page = h("div.page");
  main.replaceChildren(page);
  try {
    cleanup = await ROUTES[key].view.render(page, ...params);
  } catch (err) {
    console.error(err);
    page.replaceChildren(h("div.callout.bad", h("strong", "This page failed to load. "), String(err.message || err)));
  }
  if (key !== "lesson") window.scrollTo(0, 0);
  main.focus({ preventScroll: true });
}

function renderSaveStatus() {
  const el = document.getElementById("save-status");
  el.textContent = { idle: "", saving: "Saving…", saved: "✓ Saved to data/progress.json", offline: "⚠ Server offline: saved in browser only" }[saveStatus];
}

document.getElementById("theme-toggle").addEventListener("click", () => {
  const root = document.documentElement;
  const isDark = root.dataset.theme ? root.dataset.theme === "dark" : matchMedia("(prefers-color-scheme: dark)").matches;
  root.dataset.theme = isDark ? "light" : "dark";
  try { localStorage.setItem("ai-lab-theme", root.dataset.theme); } catch { /* ignore */ }
});

// If the tutor records a review (data/reviews.json) while the tab is open,
// pick it up when you come back to the tab.
window.addEventListener("focus", async () => {
  if (hasUnsavedChanges()) return;
  const before = JSON.stringify(getState().reviews);
  await loadProgress();
  if (JSON.stringify(getState().reviews) !== before) route();
});

await loadProgress();
subscribe(() => { renderSaveStatus(); renderNav(currentKey); });
window.addEventListener("hashchange", route);
renderSaveStatus();
route();
