// Data-flow map: boxes you can tap to learn about, plus "journeys" that
// animate a dot carrying data from box to box with a narration per step.
//
// flowMap({
//   width: 700, height: 400,
//   nodes: { ram: { x, y, w, h, t1: "RAM", t2: "the desk", name, role, analogy, examples, feel }, … },
//   edges: [["input", "ram"], ["cpu", "ram", "M… custom SVG path"]],
//   journeys: { key: { label: "📷 Open a photo", steps: [["storage", "html…"], …] } },
//   intro: "html shown before anything is tapped",
//   ariaLabel: "Map of …",
// })

import { h } from "../ui.js";

const NS = "http://www.w3.org/2000/svg";
const s = (tag, attrs = {}, ...kids) => {
  const el = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
  kids.forEach((k) => el.append(k));
  return el;
};
const edgeKey = (a, b) => [a, b].sort().join("~");

// A smooth curve from the side of box A that faces B, to the facing side of B.
function autoPath(A, B) {
  const ax = A.x + A.w / 2, ay = A.y + A.h / 2, bx = B.x + B.w / 2, by = B.y + B.h / 2;
  if (Math.abs(bx - ax) >= Math.abs(by - ay)) {
    const x1 = bx > ax ? A.x + A.w : A.x, x2 = bx > ax ? B.x : B.x + B.w, mx = (x1 + x2) / 2;
    return `M${x1},${ay} C${mx},${ay} ${mx},${by} ${x2},${by}`;
  }
  const y1 = by > ay ? A.y + A.h : A.y, y2 = by > ay ? B.y : B.y + B.h, my = (y1 + y2) / 2;
  return `M${ax},${y1} C${ax},${my} ${bx},${my} ${bx},${y2}`;
}

export function flowMap({ width = 700, height = 400, nodes, edges, journeys = {}, intro = "", ariaLabel = "Data-flow map", stepMs = 3000 }) {
  const svg = s("svg", { viewBox: `0 0 ${width} ${height}`, class: "fmap", role: "group", "aria-label": ariaLabel });
  const wireEls = {};
  for (const [a, b, d] of edges) {
    const el = s("path", { d: d || autoPath(nodes[a], nodes[b]), class: "wire" });
    wireEls[edgeKey(a, b)] = el;
    svg.append(el);
  }
  const nodeEls = {};
  for (const [id, n] of Object.entries(nodes)) {
    const g = s("g", { class: "part", tabindex: 0, role: "button", "aria-label": n.name || n.t1 },
      s("rect", { x: n.x, y: n.y, width: n.w, height: n.h, rx: 12 }),
      s("text", { class: "t1", x: n.x + n.w / 2, y: n.y + n.h / 2 + (n.t2 ? -3 : 5), "text-anchor": "middle" }, n.t1),
      n.t2 ? s("text", { class: "t2", x: n.x + n.w / 2, y: n.y + n.h / 2 + 16, "text-anchor": "middle" }, n.t2) : "");
    const pick = () => { stop(); showNode(id); };
    g.addEventListener("click", pick);
    g.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); pick(); } });
    nodeEls[id] = g;
    svg.append(g);
  }
  const dot = s("circle", { r: 9, class: "dot", cx: 0, cy: 0, style: "opacity:0" });
  svg.append(dot);

  const info = h("div.part-info");
  const counter = h("span.small.faint");
  let journey = null, idx = 0, timer = null;

  function light(ids, wire) {
    Object.entries(nodeEls).forEach(([id, g]) => g.classList.toggle("on", ids.includes(id)));
    Object.entries(wireEls).forEach(([k, w]) => w.classList.toggle("hot", k === wire));
  }
  function showNode(id) {
    const n = nodes[id];
    light([id]);
    dot.style.opacity = 0;
    info.innerHTML = `<div class="eyebrow">Part</div><h3>${n.name || n.t1}</h3>${n.role ? `<p>${n.role}</p>` : ""}
      ${n.analogy ? `<div class="analogy">💡 ${n.analogy}</div>` : ""}
      ${n.examples || n.feel ? `<dl>${n.examples ? `<dt>Examples</dt><dd>${n.examples}</dd>` : ""}${n.feel ? `<dt>You notice it when</dt><dd>${n.feel}</dd>` : ""}</dl>` : ""}`;
    jBtns.forEach((b) => b.classList.remove("on"));
    counter.textContent = "";
  }
  function step(k) {
    const steps = journeys[journey].steps;
    idx = Math.max(0, Math.min(steps.length - 1, k));
    const [id, text] = steps[idx];
    const prev = idx > 0 ? steps[idx - 1][0] : null;
    light([id], prev && prev !== id ? edgeKey(prev, id) : null);
    const n = nodes[id];
    dot.style.opacity = 1;
    dot.style.transform = `translate(${n.x + n.w / 2}px, ${n.y - 2}px)`;
    info.innerHTML = `<div class="eyebrow">${journeys[journey].label} · step ${idx + 1} of ${steps.length}</div><p style="font-size:1rem">${text}</p>`;
    counter.textContent = `Step ${idx + 1} / ${steps.length}`;
    if (idx === steps.length - 1) stop();
  }
  function play(key) {
    stop();
    journey = key;
    jBtns.forEach((b) => b.classList.toggle("on", b.dataset.key === key));
    step(0);
    resume();
  }
  function resume() { if (!journey) return; clearInterval(timer); timer = setInterval(() => step(idx + 1), stepMs); pauseBtn.textContent = "❚❚ Pause"; }
  function stop() { clearInterval(timer); timer = null; pauseBtn.textContent = "▶ Resume"; }

  const jBtns = Object.entries(journeys).map(([key, j]) => {
    const b = h("button.btn.secondary.sm", { type: "button", onclick: () => play(key) }, j.label);
    b.dataset.key = key;
    return b;
  });
  const pauseBtn = h("button.btn.ghost.sm", { type: "button", onclick: () => (timer ? stop() : resume()) }, "▶ Resume");
  const backBtn = h("button.btn.ghost.sm", { type: "button", "aria-label": "Previous step", onclick: () => { if (journey) { stop(); step(idx - 1); } } }, "←");
  const nextBtn = h("button.btn.ghost.sm", { type: "button", "aria-label": "Next step", onclick: () => { if (journey) { stop(); step(idx + 1); } } }, "→");

  info.innerHTML = intro || `<h3>Tap any box</h3><p class="muted">…to learn what it does${jBtns.length ? ", or press a journey button to watch data flow through the system" : ""}.</p>`;
  return h("div",
    jBtns.length ? h("div.journey-btns", jBtns) : null,
    h("div.fmap-wrap",
      h("div", svg, jBtns.length ? h("div.row", { style: { marginTop: "8px", justifyContent: "center" } }, backBtn, pauseBtn, nextBtn, counter) : null),
      h("div.card", { style: { boxShadow: "none" } }, info)));
}
