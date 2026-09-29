// Lesson 01: What Is a Computer? (written for a complete beginner)
// Each entry in `sections` renders one of the 16 standard lesson sections.
// Words written as {{Word}} become tappable meanings from glossary.js.

import { h, html } from "../ui.js";
import { codeWalk } from "../widgets/codewalk.js";

const inr = (n) => "₹" + Math.round(n).toLocaleString("en-IN");

// ---------------------------------------------------------------------------
// Widget: the computer map (click parts, play data journeys)
// ---------------------------------------------------------------------------
const PARTS = {
  input: { x: 20, y: 70, w: 150, h: 70, t1: "Input", t2: "keyboard · mouse · touch",
    name: "Input devices", role: "Bring information <b>into</b> the computer.",
    analogy: "The <b>inbox tray</b> on the desk: where new work arrives.",
    examples: "Keyboard, mouse, touchpad, touchscreen, microphone, camera",
    feel: "If it breaks, you can't tell the computer what to do." },
  network: { x: 20, y: 260, w: 150, h: 70, t1: "Network", t2: "Wi-Fi · internet",
    name: "Network", role: "Sends and receives data to and from <b>other computers</b>.",
    analogy: "The <b>post office</b>: letters go out, replies come back. Far slower than anything inside the office.",
    examples: "Wi-Fi, Ethernet cable, mobile data",
    feel: "Slow or down → online things stop updating (like live stock prices), but offline work continues." },
  cpu: { x: 275, y: 20, w: 150, h: 80, t1: "CPU", t2: "the worker",
    name: "CPU (Central Processing Unit)", role: "Does <b>every</b> calculation and decision, one tiny step at a time, billions of steps per second.",
    analogy: "The <b>worker</b> sitting at the desk. Very fast, but can only work on papers that are <b>on the desk</b>.",
    examples: "Typical laptop: 4–16 cores, 2–5 GHz",
    feel: "Too slow → heavy work (huge spreadsheets, training AI) takes a long time; the fan gets loud." },
  ram: { x: 275, y: 160, w: 150, h: 80, t1: "RAM", t2: "the desk",
    name: "RAM (Random Access Memory)", role: "Holds everything that's <b>open right now</b>, so the CPU can reach it instantly.",
    analogy: "The <b>desk</b>. Fast to grab things from, limited space, and <b>cleared every night</b> (when the power goes off).",
    examples: "Typical laptop: 8–32 GB",
    feel: "Too small → the computer slows down badly when many apps or browser tabs are open." },
  storage: { x: 275, y: 300, w: 150, h: 80, t1: "Storage (SSD)", t2: "the filing cabinet",
    name: "Storage (SSD or hard disk)", role: "Keeps all your files and apps <b>permanently</b>, even with the power off.",
    analogy: "The <b>filing cabinet</b>. Holds everything you own, but you have to walk over to it, so it's slower than the desk.",
    examples: "Typical laptop: 256 GB – 2 TB",
    feel: "Full → you can't save files or install apps." },
  output: { x: 530, y: 160, w: 150, h: 80, t1: "Output", t2: "screen · speakers",
    name: "Output devices", role: "Send results <b>out</b> of the computer so you can see or hear them.",
    analogy: "The <b>outbox tray</b>: finished work leaves here.",
    examples: "Screen, speakers, headphones, printer",
    feel: "If it breaks, the computer may be working fine, but you can't see the result." },
};
const WIRES = {
  "input-ram": "M170,105 C225,105 225,200 275,200",
  "network-ram": "M170,295 C225,295 225,200 275,200",
  "cpu-ram": "M350,100 L350,160",
  "ram-storage": "M350,240 L350,300",
  "output-ram": "M425,200 L530,200",
};
const center = (id) => { const p = PARTS[id]; return [p.x + p.w / 2, p.y + p.h / 2]; };
const wireKey = (a, b) => [a, b].sort().join("-");

const JOURNEYS = {
  photo: { label: "📷 Open a photo", steps: [
    ["storage", "The photo is saved in the <b>filing cabinet</b> (storage) as a file of numbers."],
    ["ram", "You double-click it. The computer <b>copies</b> the photo from storage onto the <b>desk</b> (RAM). This copying is the little 'loading…' moment."],
    ["cpu", "The <b>worker</b> (CPU) reads those numbers and works out the colour of every tiny dot on the screen: millions of calculations."],
    ["ram", "The results are put back on the desk."],
    ["output", "The <b>screen</b> shows them. You see your photo."],
  ] },
  type: { label: "⌨️ Type and save a note", steps: [
    ["input", "You press the key <b>H</b>. The keyboard sends a tiny electrical signal."],
    ["ram", "The letter is placed on the <b>desk</b> (RAM), inside the note you're writing."],
    ["cpu", "The <b>worker</b> works out how 'H' should look and where on the page it goes."],
    ["ram", "The updated page sits on the desk."],
    ["output", "'H' appears on screen, all in less than 1/100th of a second."],
    ["ram", "⚠️ Right now your note exists <b>only on the desk</b>. If the power fails now, it's gone."],
    ["storage", "You press <b>Save</b>. A copy goes into the <b>filing cabinet</b>. Now it's safe even if the power goes off."],
  ] },
  nifty: { label: "📈 Check NIFTY in a trading app", steps: [
    ["input", "You tap the <b>NIFTY 50</b> chart in your trading app."],
    ["ram", "The tap goes onto the desk."],
    ["cpu", "The worker decides: 'I need fresh prices.' It prepares a request."],
    ["ram", "The request is placed on the desk, ready to send."],
    ["network", "The request travels over the internet to the broker's <b>server</b>: another computer, maybe hundreds of kilometres away. <i>This is the slowest part of the whole trip.</i>"],
    ["ram", "The latest prices come back and are placed on the desk."],
    ["cpu", "The worker calculates today's change: <code>(latest − yesterday's close) ÷ yesterday's close × 100</code> → <b>+0.8%</b>."],
    ["ram", "The result goes on the desk."],
    ["output", "The screen shows the chart with <b style='color:var(--good)'>+0.8%</b> in green."],
  ] },
};

function computerMap() {
  const NS = "http://www.w3.org/2000/svg";
  const s = (tag, attrs = {}, ...kids) => { const el = document.createElementNS(NS, tag); for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v); kids.forEach((k) => el.append(k)); return el; };
  const svg = s("svg", { viewBox: "0 0 700 400", class: "cmap", role: "group", "aria-label": "Map of a computer's parts" });
  const wireEls = {};
  for (const [k, d] of Object.entries(WIRES)) { wireEls[k] = s("path", { d, class: "wire" }); svg.append(wireEls[k]); }
  const partEls = {};
  for (const [id, p] of Object.entries(PARTS)) {
    const g = s("g", { class: "part", tabindex: 0, role: "button", "aria-label": p.name },
      s("rect", { x: p.x, y: p.y, width: p.w, height: p.h, rx: 12 }),
      s("text", { class: "t1", x: p.x + p.w / 2, y: p.y + p.h / 2 - 3, "text-anchor": "middle" }, p.t1),
      s("text", { class: "t2", x: p.x + p.w / 2, y: p.y + p.h / 2 + 16, "text-anchor": "middle" }, p.t2));
    const pick = () => { stop(); showPart(id); };
    g.addEventListener("click", pick);
    g.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); pick(); } });
    partEls[id] = g;
    svg.append(g);
  }
  const dot = s("circle", { r: 9, class: "dot", cx: 0, cy: 0, style: "opacity:0" });
  svg.append(dot);

  const info = h("div.part-info");
  const counter = h("span.small.faint");
  let journey = null, idx = 0, timer = null;

  function light(ids, wire) {
    Object.entries(partEls).forEach(([id, g]) => g.classList.toggle("on", ids.includes(id)));
    Object.entries(wireEls).forEach(([k, w]) => w.classList.toggle("hot", k === wire));
  }
  function showPart(id) {
    const p = PARTS[id];
    light([id]);
    dot.style.opacity = 0;
    info.innerHTML = `<div class="eyebrow">Part</div><h3>${p.name}</h3><p>${p.role}</p>
      <div class="analogy">🏢 ${p.analogy}</div>
      <dl><dt>Examples</dt><dd>${p.examples}</dd><dt>You notice it when</dt><dd>${p.feel}</dd></dl>`;
    jBtns.forEach((b) => b.classList.remove("on"));
    counter.textContent = "";
  }
  function step(n) {
    const steps = JOURNEYS[journey].steps;
    idx = Math.max(0, Math.min(steps.length - 1, n));
    const [part, text] = steps[idx];
    const prev = idx > 0 ? steps[idx - 1][0] : null;
    light([part], prev && prev !== part ? wireKey(prev, part) : null);
    const [cx, cy] = center(part);
    dot.style.opacity = 1;
    dot.style.transform = `translate(${cx}px, ${cy - (PARTS[part].h / 2) - 2}px)`;
    info.innerHTML = `<div class="eyebrow">${JOURNEYS[journey].label} · step ${idx + 1} of ${steps.length}</div><p style="font-size:1rem">${text}</p>`;
    counter.textContent = `Step ${idx + 1} / ${steps.length}`;
    if (idx === steps.length - 1) stop();
  }
  function play(key) {
    stop();
    journey = key;
    jBtns.forEach((b) => b.classList.toggle("on", b.dataset.key === key));
    step(0);
    timer = setInterval(() => step(idx + 1), 3000);
    pauseBtn.textContent = "❚❚ Pause";
  }
  function stop() { clearInterval(timer); timer = null; pauseBtn.textContent = "▶ Resume"; }

  const jBtns = Object.entries(JOURNEYS).map(([key, j]) => { const b = h("button.btn.secondary.sm", { type: "button", onclick: () => play(key) }, j.label); b.dataset.key = key; return b; });
  const pauseBtn = h("button.btn.ghost.sm", { type: "button", onclick: () => journey && (timer ? stop() : (timer = setInterval(() => step(idx + 1), 3000), pauseBtn.textContent = "❚❚ Pause")) }, "▶ Resume");
  const backBtn = h("button.btn.ghost.sm", { type: "button", onclick: () => { if (journey) { stop(); step(idx - 1); } } }, "←");
  const nextBtn = h("button.btn.ghost.sm", { type: "button", onclick: () => { if (journey) { stop(); step(idx + 1); } } }, "→");

  info.innerHTML = `<h3>Tap any part</h3><p class="muted">…to see what it does, with an office analogy. Or press a journey button above to watch data travel through the computer.</p>`;
  return h("div",
    h("div.journey-btns", jBtns),
    h("div.cmap-wrap",
      h("div", svg, h("div.row", { style: { marginTop: "8px" } }, backBtn, pauseBtn, nextBtn, counter)),
      h("div.card", { style: { boxShadow: "none" } }, info)));
}

// ---------------------------------------------------------------------------
// Widget: eight bit switches = one byte
// ---------------------------------------------------------------------------
function bitSwitches(ctx) {
  const bits = Array(8).fill(0);
  const values = [128, 64, 32, 16, 8, 4, 2, 1];
  const num = h("div.big");
  const chr = h("div.big");
  const goalsDef = [
    [(n) => n === 1, "Make the number 1"],
    [(n) => n === 5, "Make 5 (hint: 4 + 1)"],
    [(n) => n === 65, "Make 65, then look at the letter"],
    [(n) => n === 255, "Make the biggest number possible"],
  ];
  const met = new Set(ctx.exercise("bits")?.met || []);
  const goals = h("div.goals");
  const btns = values.map((v, i) => {
    const b = h("button", { type: "button", "aria-pressed": "false", "aria-label": `Bit worth ${v}` }, "0");
    b.addEventListener("click", () => { bits[i] = 1 - bits[i]; paint(); });
    return h("div.bit", b, h("span", v));
  });
  function paint() {
    const n = bits.reduce((sum, b, i) => sum + b * values[i], 0);
    btns.forEach((wrap, i) => { const b = wrap.firstChild; b.textContent = bits[i]; b.setAttribute("aria-pressed", String(!!bits[i])); });
    num.textContent = n;
    chr.textContent = n >= 33 && n <= 126 ? String.fromCharCode(n) : "–";
    goalsDef.forEach(([test], i) => { if (test(n)) met.add(i); });
    goals.replaceChildren(...goalsDef.map(([, label], i) => h(`div.goal${met.has(i) ? ".met" : ""}`, label)));
    if (met.size && met.size !== (ctx.exercise("bits")?.met || []).length) ctx.setExercise("bits", { met: [...met] });
  }
  paint();
  return h("div",
    h("div.bits", btns),
    h("div.bit-result",
      h("div", h("div.eyebrow", "As a number"), num),
      h("div", h("div.eyebrow", "As a letter"), chr),
      h("div", h("div.eyebrow", "Size"), h("div.big", { style: { fontSize: "1.2rem", paddingTop: "8px" } }, "8 bits = 1 byte"))),
    goals);
}

// ---------------------------------------------------------------------------
// Widget: put the instruction cards in order (the learner's first "program")
// ---------------------------------------------------------------------------
const CARDS = {
  A: { tag: "INPUT", text: "Read the share price (₹2,500) from the keyboard and put it on the desk" },
  B: { tag: "INPUT", text: "Read the quantity (4 shares) from the keyboard and put it on the desk" },
  C: { tag: "CPU", text: "Multiply price × quantity. Write the answer on the desk as 'total'" },
  D: { tag: "CPU", text: "Add the ₹20 brokerage to 'total'" },
  E: { tag: "OUTPUT", text: "Show 'total' on the screen" },
  F: { tag: "STORAGE", text: "Save 'total' to storage, so it survives a power cut" },
  X: { tag: "CPU", text: "Add the ₹20 brokerage to the price" },
};
const SCRAMBLED = ["D", "A", "F", "X", "C", "E", "B"];

// Runs one card. Returns an error message, or null if it worked.
export function runCard(id, st) {
  const d = st.desk;
  const missing = (name) => `The worker tried to use '${name}', but it isn't on the desk yet. The CPU can only use what's already on the desk!`;
  switch (id) {
    case "A": d.price = 2500; return null;
    case "B": d.qty = 4; return null;
    case "C": if (d.price == null) return missing("price"); if (d.qty == null) return missing("quantity"); d.total = d.price * d.qty; return null;
    case "D": if (d.total == null) return missing("total"); d.total += 20; return null;
    case "X": if (d.price == null) return missing("price"); d.price += 20; return null;
    case "E": if (d.total == null) return missing("total"); st.screen.push(d.total); return null;
    case "F": if (d.total == null) return missing("total"); st.storage = d.total; return null;
  }
  return "Unknown card";
}

export function judgeProgram(program) {
  const st = { desk: {}, screen: [], storage: null };
  for (let i = 0; i < program.length; i++) {
    const err = runCard(program[i], st);
    if (err) return { ok: false, failedAt: i, msg: `Step ${i + 1} failed. ${err}`, st };
  }
  const shown = st.screen.at(-1);
  if (!program.length) return { ok: false, msg: "Your program is empty. Tap cards on the left to add them.", st };
  if (shown == null) return { ok: false, msg: "The program ran, but nothing was ever shown on the screen. The user sees nothing!", st };
  if (shown !== 10020) {
    if (program.includes("X")) return { ok: false, msg: `The screen shows ${inr(shown)}. The brokerage got added to the price of <i>each</i> share (₹20 × 4 = ₹80). But brokerage is charged <b>once per order</b>. One card is a trap.`, st };
    if (shown === 10000) return { ok: false, msg: `The screen shows ${inr(shown)}. The total was shown <b>before</b> the brokerage was added. In a program, <b>order matters</b>.`, st };
    return { ok: false, msg: `The screen shows ${inr(shown)}, but the correct bill is ₹10,020.`, st };
  }
  if (st.storage == null) return { ok: false, msg: "The screen shows the correct ₹10,020, but nothing was saved. After a power cut this trade is forgotten. Which card fixes that?", st };
  if (st.storage !== 10020) return { ok: false, msg: `Storage saved ${inr(st.storage)}. It was saved before the brokerage was added.`, st };
  if (program.length > 6) return { ok: false, msg: "It works, but it has extra steps that aren't needed. Can you remove them?", st };
  return { ok: true, msg: "", st };
}

function cardProgram(ctx) {
  const saved = ctx.exercise("cards");
  let program = [...(saved?.program || [])];
  let running = false;
  const pool = h("div.card-slot");
  const prog = h("div.card-slot");
  const desk = h("div"), screen = h("div"), storage = h("div");
  const result = h("div", { style: { marginTop: "12px" } });

  const save = (extra = {}) => ctx.setExercise("cards", { ...(ctx.exercise("cards") || {}), program, ...extra });
  const cardEl = (id, extra = []) => h("div.icard", h("span.tag", CARDS[id].tag), h("span.txt", CARDS[id].text), ...extra);

  function paintSim(st) {
    const entries = Object.entries(st?.desk || {});
    desk.replaceChildren(h("div.eyebrow", "Desk (RAM)"), entries.length ? h("div.topic-chips", entries.map(([k, v]) => h("span.chip", `${k} = ${k === "qty" ? v : inr(v)}`))) : h("span.small.faint", "empty"));
    screen.replaceChildren(h("div.eyebrow", "Screen (output)"), st?.screen.length ? h("div.mono", st.screen.map(inr).join("  →  ")) : h("span.small.faint", "nothing shown"));
    storage.replaceChildren(h("div.eyebrow", "Storage (saved)"), st?.storage != null ? h("div.mono", inr(st.storage)) : h("span.small.faint", "nothing saved"));
  }
  function paint() {
    pool.replaceChildren(h("div.eyebrow", "Instruction cards: tap to add"),
      ...SCRAMBLED.filter((id) => !program.includes(id)).map((id) => {
        const el = h("button.icard.pick", { type: "button", disabled: running }, h("span.tag", CARDS[id].tag), h("span.txt", CARDS[id].text), h("span.small.faint", "+"));
        el.addEventListener("click", () => { program.push(id); save({ passed: false }); result.replaceChildren(); paint(); });
        return el;
      }));
    prog.replaceChildren(h("div.eyebrow", "Your program: runs top to bottom"),
      ...(program.length ? program.map((id, i) => cardEl(id, [
        h("button.btn.ghost.mini", { type: "button", "aria-label": "Move up", disabled: i === 0 || running, onclick: () => { [program[i - 1], program[i]] = [program[i], program[i - 1]]; save({ passed: false }); paint(); } }, "↑"),
        h("button.btn.ghost.mini", { type: "button", "aria-label": "Move down", disabled: i === program.length - 1 || running, onclick: () => { [program[i + 1], program[i]] = [program[i], program[i + 1]]; save({ passed: false }); paint(); } }, "↓"),
        h("button.btn.ghost.mini", { type: "button", "aria-label": "Remove", disabled: running, onclick: () => { program.splice(i, 1); save({ passed: false }); paint(); } }, "✕"),
      ])).map((el, i) => { el.prepend(h("span.n", i + 1)); return el; })
        : [h("p.small.faint", { style: { margin: 0 } }, "Empty. Add cards from the left.")]));
  }
  async function run() {
    if (running) return;
    running = true; paint();
    const verdict = judgeProgram(program);
    const st = { desk: {}, screen: [], storage: null };
    paintSim(st);
    const rows = [...prog.querySelectorAll(".icard")];
    for (let i = 0; i < program.length; i++) {
      rows.forEach((r) => r.classList.remove("running"));
      rows[i].classList.add("running");
      const err = runCard(program[i], st);
      paintSim(st);
      await new Promise((r) => setTimeout(r, 750));
      if (err) { rows[i].classList.add("failed"); break; }
    }
    rows.forEach((r) => r.classList.remove("running"));
    running = false;
    // Record every run (not just the final one) so the review can see how you got there.
    save({ passed: verdict.ok, lastResult: verdict.ok ? "passed" : verdict.msg.replace(/<[^>]+>/g, ""), runs: (ctx.exercise("cards")?.runs || 0) + 1 });
    result.innerHTML = verdict.ok
      ? `<div class="callout good"><b>🎉 Your first program works!</b> ₹10,020 on screen and saved to storage. You just did what every programmer does: broke a job into <b>exact steps</b>, put them in the <b>right order</b>, and made sure each step only uses things that are <b>already available</b>. Scroll to section 16 to see this same program written in real Python.</div>`
      : `<div class="callout warn"><b>Not yet.</b> ${verdict.msg}</div>`;
    paint();
    const rowsAfter = [...prog.querySelectorAll(".icard")];
    if (verdict.failedAt != null) rowsAfter[verdict.failedAt]?.classList.add("failed");
  }

  paint(); paintSim(null);
  return h("div",
    h("div.cards-wrap", pool, prog),
    h("div.row", { style: { marginTop: "10px" } },
      h("button.btn", { type: "button", onclick: run }, "▶ Run my program"),
      h("button.btn.ghost.sm", { type: "button", onclick: () => { if (!running) { program = []; save({ passed: false }); result.replaceChildren(); paintSim(null); paint(); } } }, "Clear"),
      saved?.passed ? h("span.badge.good", "✓ Solved before") : null),
    h("div.sim", desk, screen, storage),
    result);
}

// ---------------------------------------------------------------------------
// Widget: power cut (RAM forgets, storage remembers)
// ---------------------------------------------------------------------------
function powerCut(ctx) {
  const box = h("div");
  const ta = h("textarea", { rows: 4, "aria-label": "Notepad (in RAM)", placeholder: "Type anything, e.g. your watchlist: RELIANCE, TCS, HDFCBANK…" });
  let stored = null, storedAt = null;
  const ramView = h("pre.mono"), diskView = h("pre.mono"), msg = h("div", { style: { marginTop: "10px" } });
  const paint = () => {
    ramView.textContent = ta.value || "(empty)";
    diskView.textContent = stored == null ? "(nothing saved yet)" : `${stored || "(empty)"}\n\n— saved at ${storedAt}`;
  };
  ta.addEventListener("input", paint);
  const saveBtn = h("button.btn.secondary.sm", { type: "button", onclick: () => { stored = ta.value; storedAt = new Date().toLocaleTimeString(); paint(); msg.innerHTML = `<div class="callout small">💾 Copied from the desk (RAM) into the filing cabinet (storage).</div>`; } }, "💾 Save");
  const cutBtn = h("button.btn.sm", { type: "button", style: { background: "var(--bad)" }, onclick: () => {
    const before = ta.value;
    box.classList.remove("blackout"); void box.offsetWidth; box.classList.add("blackout");
    ta.value = ""; paint();
    setTimeout(() => {
      ta.value = stored ?? "";
      paint();
      const lost = before.length - (stored ?? "").length;
      ctx.setExercise("powercut", { tried: true });
      msg.innerHTML = before === (stored ?? "")
        ? `<div class="callout good small"><b>Power back on.</b> Nothing lost: everything on the desk had been saved first.</div>`
        : `<div class="callout bad small"><b>Power back on.</b> The desk (RAM) was wiped. The computer reopened your file from storage, but everything you typed after your last save is <b>gone</b>${lost > 0 ? ` (${lost} characters)` : ""}.</div>`;
    }, 1100);
  } }, "⚡ Power cut");
  paint();
  box.append(
    h("div.row", saveBtn, cutBtn),
    h("div", { style: { margin: "10px 0" } }, ta),
    h("div.pc-panels",
      h("div.box", h("div.eyebrow", "RAM (desk): what you're working on"), ramView),
      h("div.box", h("div.eyebrow", "Storage (cabinet): what is saved"), diskView)),
    msg);
  return box;
}

// ---------------------------------------------------------------------------
// Widget: RAM meter (what happens when the desk fills up)
// ---------------------------------------------------------------------------
const APPS = [
  { id: "win", name: "Windows itself", gb: 3, fixed: true, color: "#6b7489" },
  { id: "tabs10", name: "Browser, 10 tabs", gb: 2, color: "#2f6fe4" },
  { id: "tabs30", name: "+30 more tabs", gb: 4.5, color: "#5b9bff" },
  { id: "code", name: "VS Code", gb: 1, color: "#1f9d6c" },
  { id: "excel", name: "Excel, big file", gb: 1.5, color: "#3fbf8a" },
  { id: "zoom", name: "Video call", gb: 1, color: "#b7791f" },
  { id: "trade", name: "Trading app", gb: 0.8, color: "#e2ad4b" },
  { id: "ai", name: "Small AI model", gb: 5, color: "#d23f45" },
];
function ramMeter() {
  let ram = 8;
  const on = new Set(["win", "tabs10"]);
  const meter = h("div.ram-meter", { role: "img" });
  const note = h("div", { style: { marginTop: "10px" } });
  const sizeSel = h("select", { "aria-label": "RAM size", style: { width: "auto" } }, [8, 16, 32].map((g) => h("option", { value: g }, `${g} GB RAM`)));
  sizeSel.addEventListener("change", () => { ram = +sizeSel.value; paint(); });
  const toggles = APPS.filter((a) => !a.fixed).map((a) => {
    const b = h("button.btn.secondary.sm", { type: "button", "aria-pressed": String(on.has(a.id)) }, `${a.name} · ${a.gb} GB`);
    b.addEventListener("click", () => { on.has(a.id) ? on.delete(a.id) : on.add(a.id); b.setAttribute("aria-pressed", String(on.has(a.id))); paint(); });
    return b;
  });
  function paint() {
    const used = APPS.filter((a) => on.has(a.id));
    const total = used.reduce((s, a) => s + a.gb, 0);
    const scale = Math.max(ram, total);
    meter.replaceChildren(...used.map((a) => h("span", { style: { width: `${(a.gb / scale) * 100}%`, background: a.color }, title: a.name }, a.gb >= 1.5 ? a.name : "")));
    meter.setAttribute("aria-label", `${total.toFixed(1)} of ${ram} GB used`);
    const over = total - ram;
    note.innerHTML = over > 0
      ? `<div class="callout bad small"><b>${total.toFixed(1)} GB needed, only ${ram} GB of RAM.</b> The desk is full by ${over.toFixed(1)} GB. Windows starts moving things to the <b>page file</b> on the SSD, which is roughly <b>500× slower</b> than RAM. Everything starts to lag. <i>This is the most common reason a computer feels slow.</i></div>`
      : `<div class="callout good small"><b>${total.toFixed(1)} GB used of ${ram} GB.</b> ${(ram - total).toFixed(1)} GB free on the desk. Everything runs smoothly.</div>`;
  }
  paint();
  return h("div",
    h("div.row.between", h("strong", "What's open right now?"), sizeSel),
    h("div.app-toggles", toggles),
    meter, note,
    h("p.small.faint", { style: { marginTop: "6px" } }, "App sizes are rough, typical numbers. Yours will differ."));
}

// ---------------------------------------------------------------------------
// Widget: how big is market data?
// ---------------------------------------------------------------------------
function dataSize() {
  const stocks = h("input", { type: "range", min: 1, max: 2000, value: 50, "aria-label": "Number of stocks" });
  const years = h("input", { type: "range", min: 1, max: 20, value: 5, "aria-label": "Years of history" });
  const freq = h("select", { "aria-label": "How often", style: { width: "auto" } }, h("option", { value: 1 }, "One row per day (daily candles)"), h("option", { value: 375 }, "One row per minute (1-minute candles)"));
  const ram = h("select", { "aria-label": "Your RAM", style: { width: "auto" } }, [8, 16, 32].map((g) => h("option", { value: g }, `My laptop: ${g} GB RAM`)));
  const out = h("div", { style: { marginTop: "12px" } });
  const sL = h("strong"), yL = h("strong");
  const BYTES_PER_ROW = 48; // date + open, high, low, close, volume: 6 numbers × 8 bytes
  function paint() {
    const rows = +stocks.value * +years.value * 250 * +freq.value;
    const bytes = rows * BYTES_PER_ROW;
    const gb = bytes / 1e9;
    sL.textContent = (+stocks.value).toLocaleString("en-IN");
    yL.textContent = years.value;
    const size = gb >= 1 ? `${gb.toFixed(1)} GB` : bytes >= 1e6 ? `${(bytes / 1e6).toFixed(1)} MB` : `${(bytes / 1e3).toFixed(0)} KB`;
    const r = +ram.value;
    const verdict = gb < r * 0.25 ? ["good", "Fits easily on the desk (RAM). Your analysis will be fast."]
      : gb < r * 0.6 ? ["warn", "Fits, but it takes a big part of your RAM. Close other apps."]
        : ["bad", "Too big for your desk (RAM). You'd need to load it in pieces, or keep it in a database. You'll learn both later."];
    out.innerHTML = `<div class="callout ${verdict[0]}"><b>${rows.toLocaleString("en-IN")} rows ≈ ${size}</b><br>${verdict[1]}</div>`;
  }
  [stocks, years].forEach((el) => el.addEventListener("input", paint));
  [freq, ram].forEach((el) => el.addEventListener("change", paint));
  paint();
  return h("div",
    h("div.two-col",
      h("div", h("label.small", "Stocks: ", sL), stocks),
      h("div", h("label.small", "Years of history: ", yL), years)),
    h("div.row", { style: { marginTop: "10px" } }, freq, ram),
    out,
    h("p.small.faint", "Each row is one OHLCV candle: date, open, high, low, close and volume (about 48 bytes). A year has about 250 trading days, and the NSE session is 375 minutes long."));
}

// ---------------------------------------------------------------------------
// Sections
// ---------------------------------------------------------------------------
export const lesson = {
  requiredAnswers: ["spec_cpu", "spec_ram", "spec_storage", "ram_predict", "ram_actual", "proj", "kc1", "kc2", "kc3", "kc4", "kc5"],
  requiredExercises: ["cards"],

  sections: [
    // 1 What
    () => html(`
      <p>Welcome! You don't need to know anything about computers to start. We begin at the very bottom.</p>
      <p>A {{computer}} is a machine that <b>follows instructions very, very fast</b>. That's it. Everything it does, from showing a stock chart to running an AI, is made of four simple jobs:</p>
      <pre>  INPUT  →  PROCESS  →  STORE  →  OUTPUT
  (take in)  (work on it)  (remember)  (show result)</pre>
      <p>In this lesson you'll learn the <b>six main parts</b> of a computer, what each one does, and how data travels between them.</p>
      <div class="callout"><b>Tip:</b> words with a <span style="border-bottom:1.5px dotted var(--accent)">dotted underline</span> are tappable, like {{RAM}}. Hover over or tap one to see its meaning. They're all collected in the <a href="#/words">Word book</a>.</div>`),

    // 2 Why
    () => html(`
      <p>You want to build AI systems for market research. Every one of those systems runs on the same parts you'll meet today. Knowing them helps you understand things like:</p>
      <ul>
        <li>Why the laptop becomes slow when many things are open.</li>
        <li>Why unsaved work disappears when the power goes off.</li>
        <li>Why downloading prices from the internet is much slower than reading them from a file.</li>
        <li>Why some market datasets are "too big" for your laptop, and what to do about it.</li>
      </ul>
      <p>Programmers use these ideas every day. When code is slow or crashes, the first question is often <i>"which part is struggling?"</i></p>`),

    // 3 Mental model
    () => html(`
      <p>Imagine a small office. This picture will stay with you for the whole course:</p>
      <div class="grid g3" style="margin-bottom:14px">
        <div class="card" style="box-shadow:none"><h3>🧑‍💼 The worker</h3><p class="small" style="margin:0">= the {{CPU}}. Does all the work. Extremely fast, but can only work on papers that are <b>on the desk</b>.</p></div>
        <div class="card" style="box-shadow:none"><h3>🗂️ The desk</h3><p class="small" style="margin:0">= {{RAM}}. Holds today's papers. Quick to reach, limited space, <b>cleared every night</b>.</p></div>
        <div class="card" style="box-shadow:none"><h3>🗄️ The filing cabinet</h3><p class="small" style="margin:0">= {{storage}}. Keeps everything forever, but it's across the room, so it's <b>slower to reach</b>.</p></div>
        <div class="card" style="box-shadow:none"><h3>📥 Inbox</h3><p class="small" style="margin:0">= {{input}}: keyboard, mouse, touch.</p></div>
        <div class="card" style="box-shadow:none"><h3>📤 Outbox</h3><p class="small" style="margin:0">= {{output}}: screen, speakers.</p></div>
        <div class="card" style="box-shadow:none"><h3>📮 Post office</h3><p class="small" style="margin:0">= the {{network}}: talks to other offices (computers). Much slower still.</p></div>
      </div>
      <p><b>The golden rule:</b> to work on anything, it must first be brought from the cabinet (storage) to the desk (RAM). The worker never works directly from the cabinet.</p>
      <div class="callout warn small"><b>Where the analogy isn't perfect:</b> a real CPU does billions of tiny steps per second, and there's also a manager (the {{operating system}}, like Windows) who decides which app gets the worker's time. You'll meet the manager in Lesson 4.</div>`),

    // 4 Visual
    () => h("div",
      html(`<p>Here is a real computer drawn as a map. <b>Tap each part</b> to learn about it. Then press a <b>journey</b> and watch the yellow dot carry data between the parts, step by step.</p>`),
      computerMap(),
      html(`<p class="small muted" style="margin-top:12px">Notice: <b>everything passes through RAM (the desk)</b>. Photos, key presses and internet data all go onto the desk before the CPU can touch them.</p>`)),

    // 5 Internals
    (ctx) => h("div",
      html(`
        <h3>1. To a computer, everything is numbers</h3>
        <p>Inside the computer there are billions of tiny switches. Each switch is either <b>off (0)</b> or <b>on (1)</b>. One switch is called a {{bit}}. Group 8 bits together and you get a {{byte}}. Each switch is worth a different amount, so their sum makes a number.</p>
        <p><b>Try it:</b> tap the switches below and complete the four goals.</p>`),
      bitSwitches(ctx),
      html(`
        <p style="margin-top:14px">One byte can make any number from 0 to 255. Letters are just numbers with an agreed meaning: <b>65 means "A"</b>, 66 means "B", and so on. A photo is millions of numbers (one per colour dot). A stock price is a number too. <b>Everything is {{data}}, and data is bits.</b></p>
        <h3>2. How big is data?</h3>
        <pre>1 byte        = one letter                       "A"
1 KB  (kilo)  ≈ 1,000 bytes      a short message
1 MB  (mega)  ≈ 1,000,000        a photo is 2–5 MB
1 GB  (giga)  ≈ 1,000,000,000    a movie; your RAM is 8–32 GB
1 TB  (tera)  ≈ 1,000 GB         a big storage drive</pre>
        <h3>3. The worker's rhythm</h3>
        <p>The CPU repeats three steps forever: <b>get the next instruction → do it → repeat</b>. A clock inside ticks to keep time. <b>3 {{GHz}}</b> means 3 billion ticks every second. Most CPUs also have several {{cores|Core}}: several workers sharing the same desk.</p>`),
      (() => {
        const el = h("div.callout");
        const t0 = performance.now();
        const tick = () => {
          if (!el.isConnected) return;
          const secs = (performance.now() - t0) / 1000;
          el.innerHTML = `⏱️ Since this section loaded, a 3 GHz CPU core could have ticked <b>${Math.floor(secs * 3e9).toLocaleString("en-IN")}</b> times.`;
          requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
        return el;
      })(),
      html(`
        <h3>4. Why the desk matters: speed</h3>
        <p>If grabbing a number from the <b>desk (RAM)</b> took <b>1 second</b>, then (roughly):</p>
        <pre>Desk  (RAM)             →  1 second
Cabinet (SSD storage)   →  about 8 minutes
Post office (internet)  →  about 3–4 days</pre>
        <p>That's why the computer copies things to the desk before working on them, and why programs that fetch data from the internet one piece at a time are slow.</p>`)),

    // 6 Simple example
    () => html(`
      <p><b>You type 12 + 30 on the Calculator app and press =.</b> Follow the parts:</p>
      <div class="topic-chips" style="margin-bottom:12px">
        <span class="chip">⌨️ Input: keys 1, 2, +, 3, 0, =</span><span class="chip">→</span>
        <span class="chip">🗂️ RAM: stores 12 and 30</span><span class="chip">→</span>
        <span class="chip">🧑‍💼 CPU: adds them → 42</span><span class="chip">→</span>
        <span class="chip">🗂️ RAM: stores 42</span><span class="chip">→</span>
        <span class="chip">🖥️ Output: shows 42</span>
      </div>
      <p>Close the calculator, and the 12, 30 and 42 are wiped from the desk. Nothing was saved to storage, because nobody asked it to.</p>
      <p>Every app, however complex, is this same pattern repeated millions of times.</p>`),

    // 7 Build it yourself (the learner's first program, STOP and attempt)
    (ctx) => h("div",
      html(`
        <p>Now <b>you</b> are the programmer. A {{program}} is just a list of exact instructions, in order. The computer does exactly what the list says, nothing more, nothing less, even when it's wrong.</p>
        <div class="gate"><b>⏸ Your task:</b> you buy <b>4 shares at ₹2,500 each</b>, and the broker charges <b>₹20 brokerage per order</b>. Build a program that shows the correct total on screen <b>and</b> saves it, so it's not lost in a power cut.<br><br>
        Tap cards to add them, use ↑ ↓ to reorder, then press <b>Run</b> and watch the desk, screen and storage. <b>Careful: one card is a trap.</b> Try on your own before opening the hints. Getting it wrong and fixing it is how programmers learn.</div>`),
      h("div", { style: { marginTop: "14px" } }, cardProgram(ctx)),
      h("div", { style: { marginTop: "14px" } }, h("div.eyebrow", "Stuck? Hints unlock one at a time"),
        ctx.hintLadder("cards", [
          "The worker can only multiply numbers that are <b>already on the desk</b>. Which cards put numbers on the desk? Those must come first.",
          "Brokerage is charged <b>once per order</b>, not once per share. One of the two brokerage cards would charge it 4 times. Which one?",
          "You need exactly 6 cards. The first two bring numbers in. The last two show and save the result. What goes in the middle, and in which order?",
        ]))),

    // 8 Experiment
    (ctx) => h("div",
      html(`<h3>Experiment 1: the power cut</h3>
        <p><b>Predict first:</b> if you type something, save, type more, and then the power goes off, what will you see when the power comes back? Now try it: type, press Save, type some more, then press ⚡ Power cut.</p>`),
      powerCut(ctx),
      html(`<h3 style="margin-top:22px">Experiment 2: filling up the desk</h3>
        <p>Every open app takes space on the desk (RAM). Turn apps on and off. What happens when you go over the limit? Then switch between 8, 16 and 32 GB.</p>`),
      ramMeter()),

    // 9 Real world
    () => html(`
      <p><b>Your phone is a computer too</b>, with the very same parts:</p>
      <pre>Phone advert says:  "8 GB RAM + 128 GB storage"
                           ↑ the desk      ↑ the filing cabinet
Processor: "octa-core, 3.2 GHz"
                ↑ 8 workers   ↑ 3.2 billion ticks per second</pre>
      <p>Many adverts say "128 GB memory" when they mean <b>storage</b>. Now you know the difference, and that the 8 GB of RAM decides how many apps can stay open smoothly.</p>
      <p>A <b>{{server}}</b> (like the computers at your broker, or at the company running an AI chatbot) is also the same thing, just much bigger: hundreds of GB of RAM, dozens of cores, and no screen.</p>`),

    // 10 Financial
    () => h("div",
      html(`
        <p>Replay the <b>📈 Check NIFTY</b> journey on the map in section 4. Notice how many parts one tap touches, and that the <b>network</b> step is the slowest.</p>
        <p>Later in this course you'll download historical market data: {{OHLCV}} candles (open, high, low, close, volume) for many stocks. Before that, a very practical question: <b>will it even fit on your desk (RAM)?</b> Move the sliders.</p>`),
      dataSize(),
      html(`<p style="margin-top:12px"><b>Things to try:</b> 50 stocks × 5 years of daily data. Then change it to 1-minute data. How many times bigger does it get? What about all ~2,000 NSE stocks?</p>`)),

    // 11 Mistakes
    () => h("div", [
      ["\"Memory\" and \"storage\" mean the same thing.", "RAM (memory) is the desk: fast, and wiped when power goes off. Storage is the cabinet: slower, and permanent. Adverts often mix the words up."],
      ["Deleting files makes the computer faster.", "Deleting files frees <i>storage</i> space. Speed problems usually come from a full <i>RAM</i>. Closing apps and tabs helps far more."],
      ["The computer is smart and knows what I meant.", "It follows instructions <b>exactly</b>, in order. You saw that with the brokerage trap card. Most bugs are instructions that say something slightly different from what we meant."],
      ["More storage makes the computer faster.", "Storage size is how much you can <i>keep</i>. Speed mostly depends on the CPU and on having enough RAM."],
      ["Once I've typed it, it's saved.", "Until you save, it lives only on the desk (RAM). The power-cut experiment showed this."],
    ].map(([m, fix]) => h("div.mistake", h("div", h("strong", m), h("div.small.muted", { html: fix }))))),

    // 12 Debugging
    (ctx) => h("div",
      html(`<p>Real-life computer problems. For each one, which part is the cause? Think it through with the office picture before you tap.</p>`),
      ctx.choiceQuiz("fix", [
        { q: "Your laptop becomes very slow when you have 40 browser tabs open, but it's fine with 3.", answer: "ram",
          why: "Each tab takes space on the desk. With 40 tabs the desk overflows, and Windows starts using the slow SSD as extra RAM (the page file)." },
        { q: "You were writing a report, the power went off, and the last hour of writing is gone.", answer: "ram",
          why: "That hour of work was only ever on the desk (RAM), which is volatile. It had never been saved to storage." },
        { q: "Windows says: <i>\"Not enough disk space. Can't save this file.\"</i>", answer: "storage",
          why: "The filing cabinet is full. Delete or move old files to make room." },
        { q: "A spreadsheet takes 30 seconds to recalculate a million formulas, even with nothing else open and plenty of free RAM.", answer: "cpu",
          why: "Lots of calculating with plenty of desk space: the worker is simply busy. A faster CPU (or smarter formulas) helps." },
        { q: "Stock prices in your trading app stopped updating, but everything else on the laptop works.", answer: "network",
          why: "The app can't reach the broker's server. Check your Wi-Fi or internet connection." },
        { q: "You press keys but no letters appear, and the mouse still moves the pointer normally.", answer: "input",
          why: "The computer is working (the mouse works), so it's the keyboard: an input device." },
      ], [["cpu", "CPU"], ["ram", "RAM"], ["storage", "Storage"], ["input", "Input"], ["output", "Output"], ["network", "Network"]],
      { nudge: "Not quite. Ask yourself: is something <i>full</i>, <i>busy</i>, <i>disconnected</i> or <i>broken</i>? Which part of the office would that be?" })),

    // 13 Exercise (STOP: the learner does this on their own computer)
    (ctx) => h("div",
      html(`
        <div class="gate"><b>⏸ Your turn: investigate your own computer.</b> No coding yet. You're doing what engineers do first: find out what machine you're working with. Write your answers below. They're saved automatically, and I'll read them when I review your work.</div>
        <div class="task"><h4>Step 1 · CPU and RAM</h4>
          <ol><li>Press the <kbd>Windows</kbd> key + <kbd>I</kbd> to open Settings.</li>
          <li>Click <b>System</b>, then scroll down and click <b>About</b>.</li>
          <li>Find <b>Processor</b> (your CPU) and <b>Installed RAM</b>.</li></ol></div>`),
      ctx.answerBox("spec_cpu", "What is your processor (CPU)? Copy its name. What is its speed in GHz?", { rows: 2, placeholder: "e.g. Intel Core i5-1235U, 1.30 GHz" }),
      ctx.answerBox("spec_ram", "How much RAM does your computer have?", { rows: 1, placeholder: "e.g. 8.00 GB" }),
      html(`<div class="task"><h4>Step 2 · Storage</h4>
          <p class="small" style="margin:0">Open <b>File Explorer</b> (<kbd>Windows</kbd> + <kbd>E</kbd>) and click <b>This PC</b>. Look at the <b>Local Disk (C:)</b> bar.</p></div>`),
      ctx.answerBox("spec_storage", "How big is your storage (C:), and how much is free?", { rows: 1, placeholder: "e.g. 120 GB free of 475 GB" }),
      html(`<div class="task"><h4>Step 3 · Watch the desk fill up (predict first!)</h4>
          <ol><li>Press <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>Esc</kbd> to open <b>Task Manager</b>, then click <b>Performance</b> (the graph icon), then <b>Memory</b>.</li>
          <li>Note how much memory is <b>in use</b> right now.</li>
          <li><b>Before doing anything else, predict:</b> how much will it go up if you open 15 new browser tabs (for example 15 different stock pages)?</li>
          <li>Now open the 15 tabs, wait 20 seconds, and look again. Then close them and watch what happens.</li></ol></div>`),
      ctx.answerBox("ram_predict", "Memory in use before, and your prediction (write this BEFORE opening the tabs):", { rows: 2 }),
      ctx.answerBox("ram_actual", "What actually happened? Was your prediction close? What happened when you closed the tabs?", { rows: 3 })),

    // 14 Mini project
    (ctx) => h("div",
      html(`
        <p><b>Mini project: write a data journey.</b> Pick <b>one</b> everyday action:</p>
        <ul><li>Watching a YouTube video</li><li>Sending a photo on WhatsApp</li><li>Placing a buy order in a trading app</li></ul>
        <p>Write its journey step by step through the parts, like the journeys on the map in section 4. Use <b>at least 5 parts</b>. Then answer:</p>
        <ul><li>At which step is data <b>at risk of being lost</b> (only in RAM)?</li><li>Which step is probably the <b>slowest</b>, and why?</li></ul>
        <p class="small muted">Try it without replaying the map journeys first. You can use arrows like <code>Input → RAM → CPU</code>. Drawing it on paper first is a great idea too.</p>`),
      ctx.answerBox("proj", "My data journey:", { rows: 10, placeholder: "Action: …\n1. Input: …\n2. RAM: …\n3. …\n\nAt risk of being lost at step …, because …\nSlowest step: …, because …" })),

    // 15 Knowledge check
    (ctx) => h("div",
      html(`<p>Answer in your own words, <b>without scrolling up</b>. Short answers are fine. There are no trick questions, and it's fine to be unsure. Just say so.</p>`),
      ctx.answerBox("kc1", "1. What's the difference between RAM and storage? Use the office analogy."),
      ctx.answerBox("kc2", "2. What does the CPU do? Why can't it work directly on files in storage?"),
      ctx.answerBox("kc3", "3. In the power cut, why was the saved text still there but the unsaved text lost?"),
      ctx.answerBox("kc4", "4. What is a byte? What's the biggest number one byte can hold, and why?"),
      ctx.answerBox("kc5", "5. Your market data is 12 GB and your laptop has 8 GB of RAM. What problem will you hit? Any idea how you might deal with it? (A guess is fine.)")),

    // 16 Next + sneak peek at real code
    () => h("div",
      html(`
        <p><b>Next: Lesson 2, What Is a Program?</b> You already built one with cards! Next you'll see how programs are written as text, saved as files, and why programming languages exist.</p>
        <h3>👀 Sneak peek: your card program in real Python</h3>
        <p>Below is the <b>same program you built in section 7</b>, written in the Python language. You don't need to understand it yet. Just press <b>Next line</b> and watch what the computer remembers after each line. (Saving to a file is left out for now. That comes in a later lesson.)</p>`),
      codeWalk({
        title: "buy_order.py",
        code: ["price = 2500", "quantity = 4", "total = price * quantity", "total = total + 20", "print(total)"],
        steps: [
          { line: 1, say: "Put the number <b>2500</b> on the desk (RAM) and stick a label on it called <code>price</code>. Just like card A.", memory: { price: 2500 } },
          { line: 2, say: "Put <b>4</b> on the desk with the label <code>quantity</code>. Card B.", memory: { price: 2500, quantity: 4 } },
          { line: 3, say: "The CPU looks up <code>price</code> (2500) and <code>quantity</code> (4), multiplies them (<code>*</code> means ×), and puts the answer <b>10000</b> on the desk labelled <code>total</code>. Card C.", memory: { price: 2500, quantity: 4, total: 10000 } },
          { line: 4, say: "Take the current <code>total</code> (10000), add 20, and put the new value <b>10020</b> back under the same label. The old 10000 is replaced. Card D.", memory: { price: 2500, quantity: 4, total: 10020 } },
          { line: 5, say: "<code>print</code> sends the value of <code>total</code> to the <b>screen</b> (output). Card E.", memory: { price: 2500, quantity: 4, total: 10020 }, output: "10020" },
        ],
      }),
      html(`<div class="callout" style="margin-top:14px">See? <b>Code is just your cards, written as text.</b> Every line is one exact instruction, run top to bottom, using things on the desk. You already understand the most important idea in programming.</div>`)),
  ],

  // Spaced-revision challenges, one per interval (1, 3, 7, 14, 30 days).
  revision: [
    { title: "The six parts, from memory", body: "<p>Without looking, write the 6 parts of the computer map and one line about what each does. Then open Lesson 1 and check.</p>" },
    { title: "A sell order", body: "<p>Write the instruction steps (like the cards) for: <b>sell 10 shares at ₹1,800, brokerage ₹20 is subtracted</b>. Show and save the result. What's the final amount?</p>" },
    { title: "Explain it to a friend", body: "<p>Write 4–5 sentences explaining to a friend why their 8 GB laptop is slow with many tabs open. Use the desk analogy.</p>" },
    { title: "Bits on paper", body: "<p>On paper, work out which of the 8 switches to turn on to make 7, 100 and 200. Then check with the switches in Lesson 1.</p>" },
    { title: "Data size estimate", body: "<p>Estimate by hand the size of 10 years of 1-minute data for 100 stocks (48 bytes per row). Then check with the calculator in Lesson 1, section 10.</p>" },
  ],
};
