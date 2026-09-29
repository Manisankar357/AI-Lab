import { PHASES, GRAPH_EDGES, LESSONS, PROJECTS, RESOURCES, phaseByKey } from "../curriculum.js";
import { phaseProgress, isMastered, lessonState, isLocked } from "../store.js";
import { h, progressBar, statusBadge } from "../ui.js";

const SVG = "http://www.w3.org/2000/svg";
const s = (tag, attrs = {}, ...kids) => {
  const el = document.createElementNS(SVG, tag);
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
  kids.forEach((k) => el.append(k));
  return el;
};

const NODE_W = 150, NODE_H = 46, ROW_H = 78, WIDTH = 540;

// Layer = longest path from a root, so every edge points downward.
function layout() {
  const keys = PHASES.map((p) => p.key);
  const parents = Object.fromEntries(keys.map((k) => [k, GRAPH_EDGES.filter(([, to]) => to === k).map(([f]) => f)]));
  const depth = {};
  const d = (k) => depth[k] ?? (depth[k] = parents[k].length ? 1 + Math.max(...parents[k].map(d)) : 0);
  keys.forEach(d);

  const rows = [];
  keys.forEach((k) => (rows[depth[k]] ||= []).push(k));
  const pos = {};
  rows.forEach((row, r) => {
    // Order each row by the average x of its parents to reduce crossing lines.
    row.sort((a, b) => avgX(a) - avgX(b));
    const gap = WIDTH / (row.length + 1);
    row.forEach((k, i) => { pos[k] = { x: gap * (i + 1), y: 40 + r * ROW_H }; });
  });
  function avgX(k) {
    const ps = parents[k].filter((p) => pos[p]);
    return ps.length ? ps.reduce((a, p) => a + pos[p].x, 0) / ps.length : 0;
  }
  return { pos, height: 40 + rows.length * ROW_H - 20 };
}

const related = (key, dir) => {
  const out = new Set();
  const walk = (k) => GRAPH_EDGES.forEach(([f, t]) => {
    const [a, b] = dir === "up" ? [t, f] : [f, t];
    if (a === k && !out.has(b)) { out.add(b); walk(b); }
  });
  walk(key);
  return out;
};

export function render(root, initial) {
  const { pos, height } = layout();
  let selected = initial || null;
  const panel = h("div.card");
  const svg = s("svg", { viewBox: `0 0 ${WIDTH} ${height}`, class: "graph-svg", role: "group", "aria-label": "Topic dependency graph" });
  const edgeEls = GRAPH_EDGES.map(([f, t]) => {
    const a = pos[f], b = pos[t];
    const y1 = a.y + NODE_H / 2, y2 = b.y - NODE_H / 2, my = (y1 + y2) / 2;
    const el = s("path", { class: "edge", d: `M${a.x},${y1} C${a.x},${my} ${b.x},${my} ${b.x},${y2}` });
    el.dataset.from = f; el.dataset.to = t;
    svg.append(el);
    return el;
  });
  const nodeEls = PHASES.map((p) => {
    const { x, y } = pos[p.key];
    const pct = phaseProgress(p.key);
    const g = s("g", { class: "node", tabindex: 0, role: "button", "aria-label": `${p.title}, ${pct}% mastered` },
      s("rect", { x: x - NODE_W / 2, y: y - NODE_H / 2, width: NODE_W, height: NODE_H, rx: 10 }),
      s("rect", { class: "fill", x: x - NODE_W / 2, y: y - NODE_H / 2, width: (NODE_W * pct) / 100, height: NODE_H, rx: 10 }),
      s("text", { x, y: y - 3, "text-anchor": "middle" }, p.short),
      s("text", { class: "pct", x, y: y + 13, "text-anchor": "middle" }, `${pct}%`));
    g.dataset.key = p.key;
    const pick = () => { selected = p.key; history.replaceState(null, "", `#/graph/${p.key}`); paint(); };
    g.addEventListener("click", pick);
    g.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); pick(); } });
    svg.append(g);
    return g;
  });

  function paint() {
    const up = selected ? related(selected, "up") : new Set();
    const down = selected ? related(selected, "down") : new Set();
    const lit = new Set([selected, ...up, ...down]);
    nodeEls.forEach((g) => {
      g.classList.toggle("sel", g.dataset.key === selected);
      g.classList.toggle("dim", !!selected && !lit.has(g.dataset.key));
    });
    edgeEls.forEach((e) => e.classList.toggle("hot", !!selected && lit.has(e.dataset.from) && lit.has(e.dataset.to)));
    panel.replaceChildren(...(selected ? details(selected, up, down) : [
      h("h3", "Click a topic"),
      h("p.muted.small", "You'll see its prerequisites, what you already know, what's left to learn, and the projects and resources linked to it. Highlighted lines show everything upstream and downstream."),
    ]));
  }

  root.append(
    h("div.page-head", h("div", h("div.eyebrow", "Knowledge graph"), h("h1", "How everything connects"),
      h("p", "Arrows point from a prerequisite to what it unlocks. The fill shows how much of each topic you've mastered."))),
    h("div.graph-wrap", h("div.card", svg), panel),
  );
  paint();
}

function details(key, up, down) {
  const p = phaseByKey(key);
  const pct = phaseProgress(key);
  const known = new Set(LESSONS.filter((l) => l.phase === key && isMastered(l.id)).flatMap((l) => l.covers || []));
  const direct = GRAPH_EDGES.filter(([, t]) => t === key).map(([f]) => phaseByKey(f));
  const unlocks = GRAPH_EDGES.filter(([f]) => f === key).map(([, t]) => phaseByKey(t));
  const lessons = LESSONS.filter((l) => l.phase === key);
  const projects = PROJECTS.filter((pr) => pr.phase === key);
  const link = (ph) => h("a", { href: `#/graph/${ph.key}` }, ph.title);
  const list = (items) => items.length ? h("div.topic-chips", items) : h("p.small.faint", { style: { margin: 0 } }, "None");
  const sec = (title, ...body) => h("div", { style: { marginTop: "14px" } }, h("div.eyebrow", title), ...body);

  return [
    h("div.eyebrow", `Phase ${p.num}`), h("h3", p.title),
    h("div.row", { style: { gap: "10px" } }, h("div", { style: { flex: 1 } }, progressBar(pct, pct === 100 ? "good" : "")), h("span.small", `${pct}%`)),
    h("p.small.muted", { style: { marginTop: "10px" } }, p.why),
    sec("Prerequisites", direct.length ? h("div.small", direct.map((d, i) => [i ? ", " : "", link(d)])) : h("p.small.faint", { style: { margin: 0 } }, "None. This is a starting point."),
      up.size > direct.length ? h("div.small.faint", `(${up.size} topics upstream in total)`) : null),
    sec("What you know", list([...known].map((t) => h("span.chip.done", t)))),
    sec("What you need to learn", list(p.topics.filter((t) => !known.has(t)).map((t) => h("span.chip", t)))),
    sec("Lessons & exercises", lessons.length
      ? lessons.map((l) => h("div.row.between.small", { style: { padding: "3px 0" } },
        l.module && !isLocked(l.id) ? h("a", { href: `#/lesson/${l.id}` }, l.title) : h("span.muted", l.title),
        !l.module ? null : isLocked(l.id) ? h("span.badge", "🔒") : statusBadge(lessonState(l.id).status)))
      : h("p.small.faint", { style: { margin: 0 } }, "Written when you reach this phase.")),
    sec("Projects", projects.map((pr) => h("div.small", h("strong", pr.id), " ", pr.title))),
    sec("Resources", (RESOURCES[key] || []).map(([t, u]) => h("div.small", h("a", { href: u, target: "_blank", rel: "noopener" }, t)))),
    sec("Unlocks", unlocks.length ? h("div.small", unlocks.map((d, i) => [i ? ", " : "", link(d)])) : h("p.small.faint", { style: { margin: 0 } }, "The final system"),
      down.size > unlocks.length ? h("div.small.faint", `(${down.size} topics downstream in total)`) : null),
  ];
}
