// Code walkthrough: step through code one line at a time.
// Shows (1) which line is running, (2) what it means in plain words,
// (3) what the computer is remembering, (4) what appears on screen.
//
// codeWalk({
//   title: "trade.py",
//   code: ["price = 2500", "print(price)"],
//   steps: [
//     { line: 1, say: "Plain-English explanation…", memory: { price: 2500 } },
//     { line: 2, say: "…", memory: { price: 2500 }, output: "2500" },
//   ],
// })
// `memory` is the full picture after that step. `output` lines accumulate.

import { h } from "../ui.js";

const fmt = (v) => (typeof v === "string" ? `"${v}"` : typeof v === "number" ? v.toLocaleString("en-IN") : String(v));

export function codeWalk({ title = "program.py", code, steps, memoryLabel = "What the computer remembers (RAM)" }) {
  let i = -1;
  let timer = null;

  const lines = code.map((txt, n) => h("div.cw-line", h("span.cw-num", n + 1), h("span.cw-code", txt || " ")));
  const say = h("div.cw-say", { "aria-live": "polite" });
  const mem = h("div.cw-mem");
  const out = h("div.mini-term.cw-out");
  const counter = h("span.small.faint");
  const back = h("button.btn.secondary.sm", { type: "button", onclick: () => go(i - 1) }, "← Back");
  const next = h("button.btn.sm", { type: "button", onclick: () => go(i + 1) }, "Next line →");
  const play = h("button.btn.ghost.sm", { type: "button", onclick: () => (timer ? stop() : start()) }, "▶ Auto-play");
  const reset = h("button.btn.ghost.sm", { type: "button", onclick: () => { stop(); go(-1); } }, "↺ Restart");

  function go(n) {
    const prevMem = i >= 0 ? steps[i].memory || {} : {};
    i = Math.max(-1, Math.min(steps.length - 1, n));
    const s = steps[i];
    lines.forEach((el, k) => {
      el.classList.toggle("now", !!s && s.line === k + 1);
      el.classList.toggle("ran", !!s && steps.slice(0, i + 1).some((x) => x.line === k + 1) && s.line !== k + 1);
    });
    if (!s) {
      say.innerHTML = "<b>Before running:</b> the computer hasn't read any line yet. Its memory is empty. Press <b>Next line</b>.";
      mem.replaceChildren(h("div.small.faint", "(empty)"));
      out.replaceChildren(h("span.faint", "(nothing on screen yet)"));
    } else {
      say.innerHTML = `<b>Line ${s.line}:</b> ${s.say}`;
      const entries = Object.entries(s.memory || {});
      mem.replaceChildren(...(entries.length
        ? entries.map(([k, v]) => h(`div.cw-box${prevMem[k] !== v ? ".changed" : ""}`, h("span.cw-name", k), h("span.cw-val", fmt(v))))
        : [h("div.small.faint", "(empty)")]));
      const printed = steps.slice(0, i + 1).filter((x) => x.output != null).map((x) => x.output);
      out.replaceChildren(...(printed.length ? printed.map((o, k) => h(`div.out${k === printed.length - 1 && s.output != null ? ".cw-new" : ""}`, o)) : [h("span.faint", "(nothing on screen yet)")]));
    }
    counter.textContent = `Step ${i + 1} of ${steps.length}`;
    back.disabled = i < 0;
    next.disabled = i >= steps.length - 1;
    if (i >= steps.length - 1) stop();
  }
  function start() {
    if (i >= steps.length - 1) go(-1);
    play.textContent = "❚❚ Pause";
    timer = setInterval(() => go(i + 1), 3200);
  }
  function stop() { clearInterval(timer); timer = null; play.textContent = "▶ Auto-play"; }

  go(-1);
  return h("div.cw",
    h("div.cw-grid",
      h("div", h("div.cw-file", title), h("div.cw-code-box", lines)),
      h("div.cw-side",
        say,
        h("div.eyebrow", { style: { marginTop: "12px" } }, memoryLabel), mem,
        h("div.eyebrow", { style: { marginTop: "12px" } }, "Screen"), out)),
    h("div.stepper", back, counter, h("span", { style: { flex: 1 } }), reset, play, next));
}
