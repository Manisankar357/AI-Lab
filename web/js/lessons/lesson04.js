// Lesson 04: How Python Runs Your Code (the software stack, traced).
// Each entry in `sections` renders one of the 16 standard lesson sections.

import { h, html } from "../ui.js";
import { levels } from "../widgets/levels.js";

// ---------------------------------------------------------------------------
// Real data: `python -m dis trade.py` on CPython 3.14.2 (this machine).
// ---------------------------------------------------------------------------
const PROGRAM = ["price = 100", "qty = 3", "total = price * qty", "print(total)"];
const BYTECODE = [
  { line: 0, op: "RESUME", arg: "0" },
  { line: 1, op: "LOAD_SMALL_INT", arg: "100", stack: ["100"] },
  { line: 1, op: "STORE_NAME", arg: "0 (price)", stack: [] },
  { line: 2, op: "LOAD_SMALL_INT", arg: "3", stack: ["3"] },
  { line: 2, op: "STORE_NAME", arg: "1 (qty)", stack: [] },
  { line: 3, op: "LOAD_NAME", arg: "0 (price)", stack: ["100"] },
  { line: 3, op: "LOAD_NAME", arg: "1 (qty)", stack: ["100", "3"] },
  { line: 3, op: "BINARY_OP", arg: "5 (*)", stack: ["300"] },
  { line: 3, op: "STORE_NAME", arg: "2 (total)", stack: [] },
  { line: 4, op: "LOAD_NAME", arg: "3 (print)", stack: ["<function print>"] },
  { line: 4, op: "PUSH_NULL", arg: "", stack: ["<function print>", "NULL"] },
  { line: 4, op: "LOAD_NAME", arg: "2 (total)", stack: ["<function print>", "NULL", "300"] },
  { line: 4, op: "CALL", arg: "1", stack: ["None"], prints: "300" },
  { line: 4, op: "POP_TOP", arg: "", stack: [] },
  { line: 4, op: "LOAD_CONST", arg: "1 (None)", stack: ["None"] },
  { line: 4, op: "RETURN_VALUE", arg: "", stack: [] },
];

const LAYERS = [
  { id: "hw", ico: "HW", name: "Hardware", ds: "CPU · RAM · SSD · screen · network card",
    more: "The physical machine. The <b>CPU</b> runs machine instructions, billions per second. <b>RAM</b> holds the data of running programs: fast, but wiped when power goes off. <b>Storage</b> (SSD) keeps files permanently but is thousands of times slower than RAM." },
  { id: "os", ico: "OS", name: "Operating system", ds: "Windows 11: processes, memory, files, devices",
    more: "The manager of the hardware. No normal program touches hardware directly. Programs ask the OS through <b>system calls</b> (open this file, give me memory, write these bytes to the screen). The OS also decides which process gets the CPU and when." },
  { id: "interp", ico: "PY", name: "Python interpreter", ds: "python.exe, a program written in C",
    more: "<code>C:\\Python314\\python.exe</code> is itself a normal program (CPython), compiled to machine code. It reads your <code>.py</code> text, compiles it to <b>bytecode</b>, and runs that bytecode in a loop. <i>The CPU never sees your Python code.</i> It only runs the interpreter." },
  { id: "prog", ico: ".py", name: "Your program", ds: "trade.py: a text file of instructions",
    more: "Just text stored in a file. It means nothing until an interpreter reads it. It's a recipe, not a chef." },
  { id: "cpumem", ico: "⚙", name: "CPU / Memory at work", ds: "values live as objects in RAM",
    more: "While your program runs, the CPU is executing the interpreter's machine code, and your values (<code>100</code>, <code>3</code>, <code>300</code>) live as <b>objects in RAM</b>, with names pointing at them." },
  { id: "out", ico: "→", name: "Output", ds: "terminal · files · network",
    more: "Results only leave the process by asking the OS: bytes to the terminal, bytes to a file, packets to the network. Anything not written out is lost when the process ends." },
];

const RAM_CELLS = [
  { id: "exe", k: "python.exe", v: "machine code" },
  { id: "src", k: "trade.py", v: "source text" },
  { id: "code", k: "code object", v: "bytecode" },
  { id: "price", k: "price →", v: "int 100" },
  { id: "qty", k: "qty →", v: "int 3" },
  { id: "total", k: "total →", v: "int 300" },
];

const STEPS = [
  { t: "Ready", layers: [], ram: [], term: [],
    body: "We'll follow one command, <code>python trade.py</code>, through every layer of your computer. Press <b>Next</b> or <b>Play</b>. You can click any layer on the left at any time to read about it." },
  { t: "1 · You press Enter", layers: ["os", "hw"], ram: [], term: ["cmd"],
    body: "The keyboard sends a signal, the OS delivers it to the terminal window, and the terminal passes your text to a <b>shell</b> (PowerShell). The shell's job is to understand commands. The terminal and the shell are both ordinary programs." },
  { t: "2 · The shell finds python", layers: ["os", "hw"], ram: [], term: ["cmd"],
    body: "<code>python</code> is just a name. PowerShell checks each folder listed in the <b>PATH</b> environment variable until it finds a matching program. On your machine it finds <code>C:\\Python314\\python.exe</code>. If no folder has one, you get <i>'python' is not recognized…</i>, an OS-level problem. (Lesson 5 goes deep on PATH.)" },
  { t: "3 · The OS creates a process", layers: ["os", "hw", "cpumem"], ram: ["exe"], term: ["cmd"],
    body: "The OS copies python.exe's machine code from the SSD into RAM, gives it a <b>Process ID (PID)</b> and its own private memory space, and schedules it on the CPU. The <i>file</i> on disk is the program; the <i>running copy</i> in RAM is the <b>process</b>." },
  { t: "4 · The interpreter reads your file", layers: ["interp", "os", "hw"], ram: ["exe", "src"], term: ["cmd"],
    body: "python.exe asks the OS to open <code>trade.py</code>. The OS reads the bytes from storage and hands them over. Your program is now <b>text in RAM</b>, which the interpreter treats as data." },
  { t: "5 · Compile to bytecode", layers: ["interp"], ram: ["exe", "src", "code"], term: ["cmd"], code: true,
    body: "The interpreter <b>tokenizes</b> the text, <b>parses</b> it into a syntax tree, and <b>compiles</b> it into bytecode: small, simple instructions for Python's virtual machine. It does this for the <i>whole file before line 1 runs</i>. That's why a SyntaxError on the last line stops even the first line from running." },
  { t: "6 · Run line 1: price = 100", layers: ["prog", "interp", "cpumem", "hw"], ram: ["exe", "src", "code", "price"], term: ["cmd"], code: true, line: 1,
    body: "The interpreter's <b>evaluation loop</b> (C code, running on the CPU) executes each instruction. It pushes the object <code>100</code> onto a <b>stack</b>, then <code>STORE_NAME</code> pops it and binds the <i>name</i> <code>price</code> to it." },
  { t: "7 · Run line 2: qty = 3", layers: ["prog", "interp", "cpumem", "hw"], ram: ["exe", "src", "code", "price", "qty"], term: ["cmd"], code: true, line: 2,
    body: "Same pattern: push <code>3</code>, then bind the name <code>qty</code> to it. Every assignment in Python works this way: a <b>name</b> is bound to an <b>object</b>. (Lesson 7 is all about this.)" },
  { t: "8 · Run line 3: total = price * qty", layers: ["prog", "interp", "cpumem", "hw"], ram: ["exe", "src", "code", "price", "qty", "total"], term: ["cmd"], code: true, line: 3,
    body: "Look up <code>price</code>, look up <code>qty</code>: two values on the stack. <code>BINARY_OP *</code> pops both, and the interpreter's C code eventually runs a real CPU multiply instruction. It pushes <code>300</code>, which is then stored as <code>total</code>." },
  { t: "9 · Run line 4: print(total)", layers: ["prog", "interp", "cpumem"], ram: ["exe", "src", "code", "price", "qty", "total"], term: ["cmd"], code: true, line: 4,
    body: "Push the <code>print</code> function and the value of <code>total</code>, then <code>CALL</code>. <code>print</code> converts <code>300</code> (a number object) into the <i>text</i> <code>\"300\\n\"</code> and writes it to <code>sys.stdout</code>." },
  { t: "10 · Output through the OS", layers: ["os", "out", "hw"], ram: ["exe", "src", "code", "price", "qty", "total"], term: ["cmd", "out"],
    body: "Writing to stdout becomes a <b>system call</b>: the process asks the OS to deliver bytes. The OS passes them to the terminal, and the terminal draws the pixels for <code>300</code>. Your program never touched the screen itself." },
  { t: "11 · Exit: memory is freed", layers: ["os"], ram: [], term: ["cmd", "out", "prompt"],
    body: "The last instruction returns, the interpreter shuts down, and the OS <b>frees all of the process's RAM</b>. <code>price</code>, <code>qty</code> and <code>total</code> no longer exist anywhere. <b>If you want to keep data, you must write it to storage</b> (a file or a database). That's why file handling exists." },
];

// ---------------------------------------------------------------------------
// Widget: software stack tracer
// ---------------------------------------------------------------------------
function stackTracer() {
  let step = 0, playing = null, anim = null;
  const visited = new Set();
  const layerBtns = LAYERS.map((L) => {
    const b = h("button.layer", { type: "button", "aria-pressed": "false" },
      h("span.ico", L.ico), h("span", h("div.nm", L.name), h("div.ds", L.ds)));
    b.addEventListener("click", () => { stop(); explain.replaceChildren(h("div.step-title", L.name), h("div.body", { html: `<p>${L.more}</p>` })); });
    return b;
  });
  const explain = h("div");
  const term = h("div.mini-term", { "aria-live": "polite" });
  const ram = h("div.mem", { "aria-label": "RAM contents" });
  const bc = h("div.bytecode");
  const stackEl = h("div.vstack");
  const codeBox = h("div.two-col", { style: { marginTop: "12px" } },
    h("div", h("div.eyebrow", "Bytecode (real, from CPython 3.14)"), bc),
    h("div", h("div.eyebrow", "Value stack"), stackEl));
  const dots = h("div.dots", STEPS.map(() => h("span")));
  const prev = h("button.btn.secondary.sm", { type: "button", onclick: () => go(step - 1) }, "← Back");
  const next = h("button.btn.sm", { type: "button", onclick: () => go(step + 1) }, "Next →");
  const play = h("button.btn.ghost.sm", { type: "button", onclick: () => (playing ? stop() : start()) }, "▶ Play");

  const bcRows = BYTECODE.map((b) => h("div", h("span.ln", b.line || ""), h("span", b.op), h("span.faint", b.arg)));
  bc.append(...bcRows);

  function paintStack(items) {
    stackEl.replaceChildren(...(items.length ? [...items].reverse().map((v, i) => h("div.slot", i === 0 ? `${v}   ← top` : v)) : [h("div.small.faint", "(empty)")]));
  }

  function go(n) {
    step = Math.max(0, Math.min(STEPS.length - 1, n));
    const S = STEPS[step];
    clearInterval(anim);
    S.layers.forEach((id) => visited.add(id));
    layerBtns.forEach((b, i) => {
      const on = S.layers.includes(LAYERS[i].id);
      b.classList.toggle("active", on);
      b.classList.toggle("visited", visited.has(LAYERS[i].id));
      b.setAttribute("aria-pressed", String(on));
    });
    explain.replaceChildren(h("div.step-title", S.t), h("div.body", { html: `<p>${S.body}</p>` }));
    term.replaceChildren(...S.term.map((k) => k === "cmd" ? h("div", h("span.pr", "PS C:\\lab> "), "python trade.py")
      : k === "out" ? h("div.out", "300") : h("div", h("span.pr", "PS C:\\lab> "), h("span", { style: { opacity: .6 } }, "▋"))));
    if (!S.term.length) term.append(h("div", h("span.pr", "PS C:\\lab> "), h("span", { style: { opacity: .6 } }, "▋")));
    ram.replaceChildren(...RAM_CELLS.map((c) => h(`div.cell${S.ram.includes(c.id) ? ".lit" : ""}`, S.ram.includes(c.id) ? [h("b", c.k), c.v] : [h("b", "·"), "free"])));
    codeBox.style.display = S.code ? "" : "none";
    bcRows.forEach((r) => r.classList.remove("hl"));
    paintStack([]);
    if (S.line) {
      // Animate through this line's instructions one by one.
      const idxs = BYTECODE.map((b, i) => (b.line === S.line ? i : -1)).filter((i) => i >= 0);
      let k = 0;
      const tick = () => {
        bcRows.forEach((r) => r.classList.remove("hl"));
        const i = idxs[k];
        bcRows[i].classList.add("hl");
        paintStack(BYTECODE[i].stack);
        if (++k >= idxs.length) clearInterval(anim);
      };
      tick();
      anim = setInterval(tick, 900);
    }
    [...dots.children].forEach((d, i) => d.classList.toggle("on", i === step));
    prev.disabled = step === 0;
    next.disabled = step === STEPS.length - 1;
  }
  function start() {
    play.textContent = "❚❚ Pause";
    if (step === STEPS.length - 1) go(0);
    playing = setInterval(() => (step >= STEPS.length - 1 ? stop() : go(step + 1)), 4200);
  }
  function stop() { clearInterval(playing); playing = null; play.textContent = "▶ Play"; }

  go(0);
  return h("div",
    h("div.stackviz",
      h("div",
        h("div.eyebrow", "The layers (click to explore)"),
        h("div.layers", layerBtns)),
      h("div.card.stage-panel", { style: { boxShadow: "none" } },
        explain, h("div", { style: { marginTop: "auto" } }, h("div.eyebrow", "Terminal"), term),
        h("div.stepper", prev, dots, play, next))),
    codeBox,
    h("div", { style: { marginTop: "14px" } }, h("div.eyebrow", "RAM (this process)"), ram),
    h("pre", { style: { marginTop: "14px" } }, h("span.faint", "# trade.py\n"), PROGRAM.join("\n")),
  );
}

// ---------------------------------------------------------------------------
// Widget: toy stack machine (you write the instructions)
// ---------------------------------------------------------------------------
const OPS = { PUSH: 1, LOAD: 1, STORE: 1, ADD: 0, SUB: 0, MUL: 0, DIV: 0, PRINT: 0 };

export function runToyMachine(source, memory) {
  const mem = { ...memory };
  const stack = [];
  const out = [];
  const trace = [];
  const lines = source.split("\n").map((l) => l.replace(/#.*/, "").trim());
  for (let n = 0; n < lines.length; n++) {
    if (!lines[n]) continue;
    const [rawOp, arg, extra] = lines[n].split(/\s+/);
    const op = rawOp.toUpperCase();
    const where = `line ${n + 1}`;
    if (!(op in OPS)) return { error: `${where}: unknown instruction "${rawOp}". Valid: ${Object.keys(OPS).join(", ")}`, mem, stack, out, trace };
    if (OPS[op] && arg === undefined) return { error: `${where}: ${op} needs an argument`, mem, stack, out, trace };
    if (!OPS[op] && arg !== undefined) return { error: `${where}: ${op} takes no argument`, mem, stack, out, trace };
    if (extra !== undefined) return { error: `${where}: too many arguments`, mem, stack, out, trace };
    const pop = () => { if (!stack.length) throw new Error(`${where}: ${op} needs a value but the stack is empty (stack underflow)`); return stack.pop(); };
    try {
      if (op === "PUSH") {
        const v = Number(arg);
        if (!Number.isFinite(v)) throw new Error(`${where}: PUSH needs a number, got "${arg}"`);
        stack.push(v);
      } else if (op === "LOAD") {
        if (!(arg in mem)) throw new Error(`${where}: NameError: "${arg}" is not defined`);
        stack.push(mem[arg]);
      } else if (op === "STORE") mem[arg] = pop();
      else if (op === "PRINT") out.push(String(pop()));
      else {
        const b = pop(), a = pop();
        if (op === "DIV" && b === 0) throw new Error(`${where}: ZeroDivisionError`);
        stack.push({ ADD: a + b, SUB: a - b, MUL: a * b, DIV: a / b }[op]);
      }
    } catch (e) { return { error: e.message, mem, stack, out, trace }; }
    trace.push({ line: n + 1, text: lines[n], stack: [...stack] });
  }
  return { mem, stack, out, trace };
}

function toyMachine(ctx) {
  const TESTS = [
    { price: 2500, qty: 4, brokerage: 20 },
    { price: 1800, qty: 7, brokerage: 15 },
  ];
  const expected = (m) => m.price * m.qty - m.brokerage;
  const saved = ctx.exercise("vm");
  const ta = h("textarea.mono", { rows: 9, spellcheck: "false", "aria-label": "Toy machine program" });
  ta.value = saved?.program ?? "# Warm-up: this prints 5. Run it, then replace it with your solution.\nPUSH 2\nPUSH 3\nADD\nPRINT\n";
  const result = h("div", { style: { marginTop: "10px" } });
  let t;
  ta.addEventListener("input", () => { clearTimeout(t); t = setTimeout(() => ctx.setExercise("vm", { ...(ctx.exercise("vm") || {}), program: ta.value }), 600); });

  function show(res, memory) {
    const memRow = Object.entries(res.mem).map(([k, v]) => h("span.chip", `${k} = ${v}`));
    result.replaceChildren(
      res.error ? h("div.callout.bad", h("strong", "Error: "), res.error) : null,
      h("div.two-col",
        h("div", h("div.eyebrow", "Trace (stack after each line)"),
          h("div.bytecode", res.trace.map((s) => h("div", h("span.ln", s.line), h("span", s.text), h("span.faint", `[${s.stack.join(", ")}]`))))),
        h("div",
          h("div.eyebrow", "Memory"), h("div.topic-chips", memRow),
          h("div.eyebrow", { style: { marginTop: "12px" } }, "Output"),
          h("div.mini-term", res.out.length ? res.out.map((o) => h("div.out", o)) : h("span.faint", "(nothing printed)")))),
    );
    return memory;
  }

  const run = () => show(runToyMachine(ta.value, TESTS[0]), TESTS[0]);
  const check = () => {
    const src = ta.value.toUpperCase();
    const results = TESTS.map((m) => ({ m, res: runToyMachine(ta.value, m) }));
    show(results[0].res);
    const problems = [];
    for (const { m, res } of results) {
      if (res.error) { problems.push(`With price=${m.price}: ${res.error}`); continue; }
      if (res.mem.total !== expected(m)) problems.push(`With price=${m.price}, qty=${m.qty}, brokerage=${m.brokerage}: memory has total = ${res.mem.total ?? "(not stored)"}, expected ${expected(m)}.`);
      if (res.out.at(-1) !== String(expected(m))) problems.push(`With price=${m.price}: the last printed value should be ${expected(m)}.`);
      if (res.stack.length) problems.push(`With price=${m.price}: ${res.stack.length} value(s) left on the stack at the end. A clean program leaves it empty.`);
    }
    if (!/LOAD\s+PRICE/.test(src) || !/LOAD\s+QTY/.test(src) || !/LOAD\s+BROKERAGE/.test(src)) problems.push("Your program should LOAD price, qty and brokerage from memory, not hard-code numbers.");
    const passed = problems.length === 0;
    ctx.setExercise("vm", { program: ta.value, passed, checkedAt: new Date().toISOString() });
    result.prepend(passed
      ? h("div.callout.good", h("strong", "✓ Correct, and it works for both market states. "), "Your program computes from memory, so if the price changes it still gives the right answer. That's the difference between a program and a hard-coded answer. Now compare yours with lines 3–4 of the real bytecode in section 4.")
      : h("div.callout.warn", h("strong", "Not yet: "), h("ul", { style: { margin: "6px 0 0" } }, [...new Set(problems)].map((p) => h("li", p)))));
  };

  return h("div",
    h("div.row", { style: { marginBottom: "8px" } },
      h("button.btn.secondary.sm", { type: "button", onclick: run }, "Run (test memory 1)"),
      h("button.btn.sm", { type: "button", onclick: check }, "Check my solution"),
      saved?.passed ? h("span.badge.good", "✓ Passed") : null),
    ta, result);
}

// ---------------------------------------------------------------------------
// Widget: latency experiment
// ---------------------------------------------------------------------------
const LATENCY = [
  { name: "CPU cache read", ns: 1 },
  { name: "RAM read", ns: 100 },
  { name: "SSD read (random)", ns: 50_000 },
  { name: "Hard disk seek", ns: 10_000_000 },
  { name: "API call, same country", ns: 30_000_000 },
  { name: "API call, India → US", ns: 250_000_000 },
];

export function fmtDuration(ns) {
  const u = [[1e9 * 86400 * 365, "years"], [1e9 * 86400, "days"], [1e9 * 3600, "hours"], [1e9 * 60, "min"], [1e9, "s"], [1e6, "ms"], [1e3, "µs"], [1, "ns"]];
  for (const [size, label] of u) if (ns >= size) return `${(ns / size).toLocaleString("en-IN", { maximumFractionDigits: ns / size < 10 ? 1 : 0 })} ${label}`;
  return `${ns.toFixed(2)} ns`;
}

function latencyLab() {
  let log = true, human = false, rowsExp = 0;
  const rowsOut = h("strong");
  const bars = h("div");
  const verdict = h("div.callout", { style: { marginTop: "12px" } });
  const slider = h("input", { type: "range", min: 0, max: 7, step: 1, value: 0, "aria-label": "Number of reads, as a power of 10" });
  const logBtn = h("button.btn.secondary.sm", { type: "button" });
  const humanBtn = h("button.btn.secondary.sm", { type: "button" });

  function paint() {
    const n = 10 ** rowsExp;
    rowsOut.textContent = n.toLocaleString("en-IN");
    logBtn.textContent = log ? "Scale: logarithmic" : "Scale: linear";
    humanBtn.textContent = human ? "Human time: ON (1 ns = 1 s)" : "Human time: OFF";
    const max = Math.max(...LATENCY.map((l) => l.ns));
    bars.replaceChildren(...LATENCY.map((l) => {
      const pct = log ? (Math.log10(l.ns) + 1) / (Math.log10(max) + 1) * 100 : (l.ns / max) * 100;
      const total = l.ns * n * (human ? 1e9 : 1);
      return h("div.latency-row", h("span", l.name), h("div.track", h("span", { style: { width: `${pct}%` } })), h("span.t", fmtDuration(total)));
    }));
    const ram = LATENCY[1].ns * n, api = LATENCY[4].ns * n;
    verdict.innerHTML = `<b>${n.toLocaleString("en-IN")} price lookups:</b> about <b>${fmtDuration(ram)}</b> if the prices are already in RAM, but <b>${fmtDuration(api)}</b> with one API call per price. `
      + `That's why a data pipeline downloads data <i>once</i>, keeps it in memory or a file, and computes from there.`;
  }
  slider.addEventListener("input", () => { rowsExp = +slider.value; paint(); });
  logBtn.addEventListener("click", () => { log = !log; paint(); });
  humanBtn.addEventListener("click", () => { human = !human; paint(); });
  paint();
  return h("div",
    h("div.row", logBtn, humanBtn),
    h("div", { style: { margin: "14px 0 6px" } }, h("label.small", "Number of reads: ", rowsOut), slider),
    h("div.eyebrow", { style: { marginTop: "12px" } }, "Total time for that many reads"),
    bars, verdict,
    h("p.small.faint", { style: { marginTop: "8px" } }, "Numbers are order-of-magnitude approximations. Real values vary by hardware and network, but the gaps between them hold everywhere."));
}

// ---------------------------------------------------------------------------
// Widget: which layer failed?
// ---------------------------------------------------------------------------
const DIAG = [
  { msg: "'python' is not recognized as an internal or external command, operable program or batch file.", answer: "os",
    why: "Python never started. The shell asked Windows to find a program called <code>python</code> in the PATH folders and none matched. It's an OS/environment problem, fixed in Lesson 5." },
  { msg: "  File \"trade.py\", line 4\n    print(total\n         ^\nSyntaxError: '(' was never closed", answer: "interp",
    why: "The interpreter couldn't <i>compile</i> the text into bytecode. It happens before any line runs, which is why nothing printed." },
  { msg: "FileNotFoundError: [Errno 2] No such file or directory: 'nifty_prices.csv'", answer: "os",
    why: "Your program ran fine and asked the OS to open a file. The OS looked on storage at that path and found nothing. <code>Errno 2</code> is literally an OS error code. Often the file exists but you ran Python from a <i>different folder</i>." },
  { msg: "MemoryError", answer: "hw",
    why: "The process asked for more RAM than the OS could give it, for example loading 20 years of tick data for 500 stocks at once. The limit is physical memory (managed by the OS)." },
  { msg: "ZeroDivisionError: division by zero\n  (while computing return = (today - yesterday) / yesterday)", answer: "prog",
    why: "Everything underneath worked perfectly. Your program asked for something mathematically impossible, for example a price of 0 in the data. The bug is in <i>your</i> logic or your data checks." },
];
const DIAG_CHOICES = [["hw", "Hardware / RAM"], ["os", "Operating system"], ["interp", "Interpreter (compile)"], ["prog", "Your program's logic"]];

function diagnosis(ctx) {
  return h("div", DIAG.map((d, i) => {
    const key = `diag${i}`;
    const fb = h("div");
    const btns = DIAG_CHOICES.map(([id, label]) => h("button.btn.secondary.sm", { type: "button", onclick: () => pick(id) }, label));
    function pick(id) {
      const right = id === d.answer;
      const tries = (ctx.exercise(key)?.tries || 0) + 1;
      ctx.setExercise(key, { tries, solved: right || ctx.exercise(key)?.solved });
      btns.forEach((b, j) => { b.classList.remove("picked-right", "picked-wrong"); if (DIAG_CHOICES[j][0] === id) b.classList.add(right ? "picked-right" : "picked-wrong"); });
      fb.innerHTML = right
        ? `<div class="callout good small" style="margin-top:8px"><b>Yes.</b> ${d.why}</div>`
        : `<div class="callout warn small" style="margin-top:8px">Not quite. Ask yourself: <i>did the Python interpreter even start? Did it get past compiling? Did the failure happen when the program asked the OS for something?</i></div>`;
    }
    return h("div.task", h("div.eyebrow", `Error ${i + 1}`), h("pre", { style: { margin: "0 0 8px" } }, d.msg), h("div.small", "Which layer is responsible?"), h("div.choice", btns), fb);
  }));
}

// ---------------------------------------------------------------------------
// Sections
// ---------------------------------------------------------------------------
export const lesson = {
  requiredAnswers: ["kc1", "kc2", "kc3", "kc4", "kc5", "kc6"],
  requiredExercises: ["vm"],

  sections: [
    // 1 What
    () => html(`
      <p>Before learning any Python syntax, we answer a more basic question: <b>what actually happens when you run a program?</b></p>
      <pre>Hardware  →  Operating System  →  Python Interpreter  →  Python Program  →  CPU / Memory  →  Output</pre>
      <p>By the end of this lesson you'll be able to trace <code>python trade.py</code> through every one of these layers, and say which layer is at fault when something breaks.</p>
      <div class="callout"><b>You'll know you've learned it when</b> you can explain, without looking, why a SyntaxError on line 4 stops line 1 from running, and why a variable vanishes when the program ends.</div>`),

    // 2 Why
    () => html(`
      <p>Every tool you'll use later (NumPy, Pandas, PyTorch, vector databases, MCP servers) sits on top of these layers. When something goes wrong, the error message tells you <i>which layer</i> complained. If you know the layers, errors stop being mysterious.</p>
      <ul>
        <li><b>Debugging:</b> "not recognized", "SyntaxError", "FileNotFoundError", "MemoryError" and "ZeroDivisionError" come from different layers and have completely different fixes.</li>
        <li><b>Performance:</b> NumPy is fast <i>because</i> it avoids the interpreter's instruction-by-instruction loop (Phase 2). GPUs matter because of how hardware does arithmetic (Phase 9).</li>
        <li><b>Data engineering:</b> RAM is fast but forgets; storage remembers but is slow; the network is slower still. Every data pipeline you'll build is shaped by this.</li>
        <li><b>AI systems:</b> an LLM "calling a tool" through MCP is just processes talking to other processes through the OS and network. Same layers, bigger system.</li>
      </ul>`),

    // 3 Mental model
    () => html(`
      <p><b>Simple version: a restaurant kitchen.</b></p>
      <div class="two-col">
        <div>
          <ul>
            <li><b>Hardware</b> = the kitchen: the stove is the <b>CPU</b> (does the actual work), the counter is <b>RAM</b> (fast workspace, cleared at closing time), the pantry is <b>storage</b> (keeps everything, but it's a walk away).</li>
            <li><b>Operating system</b> = the kitchen manager: assigns stations, controls who uses the stove, fetches things from the pantry.</li>
          </ul>
        </div>
        <div>
          <ul>
            <li><b>Python interpreter</b> = a chef who reads recipes written in English and turns them into actions.</li>
            <li><b>Your program</b> = the recipe: just text, it can't cook anything by itself.</li>
            <li><b>Output</b> = the dish, sent out through the manager to the customer (the screen).</li>
          </ul>
        </div>
      </div>
      <p><b>Technical version:</b> a program is a file of instructions. Running it creates a <b>process</b>: a live copy in RAM that the OS schedules on the CPU. Python programs are special: the process is <i>python.exe</i>, and your file is <i>input data</i> that python.exe interprets.</p>
      <div class="callout warn"><b>Where the analogy breaks:</b> a real CPU does billions of tiny steps per second, and a "chef" here reads the whole recipe and rewrites it into shorthand (bytecode) <i>before</i> cooking anything. Keep that difference in mind.</div>`),

    // 4 Visual
    () => stackTracer(),

    // 5 Internals
    () => html(`
      <h3>The CPU: fetch → decode → execute</h3>
      <p>A CPU only understands <b>machine code</b>: numbered instructions like "add these two registers" or "load 8 bytes from this address". It repeats one cycle billions of times per second: <b>fetch</b> the next instruction from memory, <b>decode</b> what it means, <b>execute</b> it. That's all a CPU does.</p>
      <h3>Memory vs storage</h3>
      <p><b>RAM</b> is a huge array of numbered bytes (addresses). Any byte can be reached in about 100 ns, but everything is lost when power goes off. <b>Storage</b> (SSD) is permanent but around 500× slower for a random read. So programs are <i>stored</i> on the SSD and <i>run</i> from RAM.</p>
      <h3>The OS: processes and system calls</h3>
      <p>The OS gives each running program a <b>process</b>: a PID, a private memory space (processes can't read each other's RAM), open files, and turns on the CPU. Programs can't touch hardware directly. They make <b>system calls</b> (open, read, write, allocate memory), and the OS does the work and checks permissions.</p>
      <h3>CPython: your code is data</h3>
      <pre>source text  →  tokens  →  syntax tree (AST)  →  bytecode  →  evaluation loop</pre>
      <p>This is the real output of <code>python -m dis trade.py</code> on your machine (Python 3.14.2):</p>
      <pre>  1   LOAD_SMALL_INT   100
      STORE_NAME         0 (price)

  2   LOAD_SMALL_INT     3
      STORE_NAME         1 (qty)

  3   LOAD_NAME          0 (price)
      LOAD_NAME          1 (qty)
      BINARY_OP          5 (*)
      STORE_NAME         2 (total)

  4   LOAD_NAME          3 (print)
      PUSH_NULL
      LOAD_NAME          2 (total)
      CALL               1
      POP_TOP</pre>
      <p>The <b>evaluation loop</b> is a big C function inside python.exe: "read next bytecode instruction; do what it says; repeat". It's the same fetch-decode-execute idea as the CPU, one level up. That extra level is why Python is flexible, and also why a pure Python loop is slower than NumPy (which runs its loops directly in machine code).</p>
      <div class="callout"><b>You've already seen this:</b> your <code>nifty_option_analyzer</code> folder has a <code>__pycache__</code> directory. When Python <i>imports</i> a module, it saves the compiled bytecode there as a <code>.pyc</code> file so it can skip compiling next time.</div>
      <p class="small muted">Curiosity: <code>x = 2 + 3</code> compiles to just <code>LOAD_SMALL_INT 5</code>. The compiler did the maths ahead of time because both numbers were known. That's called <i>constant folding</i>.</p>`),

    // 6 Simple example
    () => html(`
      <p>The smallest possible program: <code>print("Hello, NIFTY")</code>. What each layer sees:</p>
      <div style="overflow-x:auto"><table style="width:100%;border-collapse:collapse;font-size:.9rem">
        <thead><tr style="text-align:left;border-bottom:1px solid var(--border)"><th style="padding:6px">Layer</th><th style="padding:6px">What it sees / does</th></tr></thead>
        <tbody>
          <tr><td style="padding:6px"><b>Storage</b></td><td style="padding:6px">22 bytes in a file named <code>hello.py</code></td></tr>
          <tr><td style="padding:6px"><b>OS</b></td><td style="padding:6px">A request to start <code>python.exe</code> with one argument; later, a request to write 13 bytes to the terminal</td></tr>
          <tr><td style="padding:6px"><b>Interpreter</b></td><td style="padding:6px">Text → bytecode: load <code>print</code>, load the string, call</td></tr>
          <tr><td style="padding:6px"><b>CPU</b></td><td style="padding:6px">Millions of machine instructions belonging to python.exe; it has no idea "Python" exists</td></tr>
          <tr><td style="padding:6px"><b>RAM</b></td><td style="padding:6px">A string object <code>"Hello, NIFTY"</code>, the code object, the interpreter itself</td></tr>
          <tr><td style="padding:6px"><b>Output</b></td><td style="padding:6px">Pixels in the terminal window</td></tr>
        </tbody></table></div>`),

    // 7 Code from scratch
    (ctx) => h("div",
      html(`
        <p>You only know <code>print</code> so far, and that&rsquo;s fine. You'll write code for a machine that works <i>exactly</i> like Python's evaluation loop: a <b>stack machine</b>.</p>
        <div class="two-col">
          <pre>PUSH n      push a number onto the stack
LOAD name   push the value of a variable
STORE name  pop the top value into a variable
ADD SUB     pop two (a, then b on top),
MUL DIV     push a+b, a-b, a*b or a/b
PRINT       pop the top value and print it
# ...       comment</pre>
          <div>
            <p>Memory already holds a trade:</p>
            <pre>price     = 2500
qty       = 4
brokerage = 20</pre>
          </div>
        </div>
        <div class="gate"><b>Your task:</b> write the program for <code>total = price * qty - brokerage</code>. Store the result in <code>total</code>, then print it. The checker also runs your program on a <i>second</i> trade with different numbers, so it has to compute the answer, not hard-code it. <b>Try it before opening any hints.</b></div>
      `),
      h("div", { style: { marginTop: "12px" } }, toyMachine(ctx)),
      h("div", { style: { marginTop: "14px" } }, h("div.eyebrow", "Stuck? Hints unlock one at a time"),
        ctx.hintLadder("vm", [
          "Python evaluates <code>price * qty</code> first. What two things must be on the stack right before <code>MUL</code>?",
          "After <code>MUL</code> the stack holds a single value (10000). For <code>SUB</code> you need two values, with the thing being subtracted on <i>top</i>.",
          "You need 7 instructions. Skeleton: <code>LOAD price</code> / <code>LOAD qty</code> / ? / ? / ? / <code>STORE total</code> / … and then how do you get <code>total</code> back onto the stack to print it?",
        ]))),

    // 8 Experiment
    () => h("div",
      html(`<p>How long does it take to read one value, depending on <i>where</i> it lives? Drag the slider to repeat the read millions of times. Switch to a linear scale to see why engineers use log scales. Turn on "human time" to scale 1 nanosecond up to 1 second.</p>
        <p><b>Before you touch anything, predict:</b> if 1 RAM read takes a "human" 100 seconds, how long does one API call to a US server take?</p>`),
      latencyLab(),
      html(`<p style="margin-top:12px"><b>Things to try:</b></p><ol>
        <li>Set 1,00,000 reads. Compare "RAM" with "API call, same country". What's the ratio?</li>
        <li>Switch to the linear scale. Why do the CPU and RAM bars disappear?</li>
        <li>You need 250 days of prices for 500 stocks. What's the difference between one API call per stock and one per candle?</li></ol>`)),

    // 9 Real world
    () => html(`
      <p><b>Opening a big Excel file.</b> Double-click → the OS starts <code>EXCEL.EXE</code> as a process → Excel asks the OS to read the file from storage into RAM (the slow part, which is why big files take time to open) → edits happen in RAM (instant) → <b>if the power fails before you save, your edits are gone</b>. Saving means asking the OS to write RAM contents back to storage.</p>
      <p>Every app you use follows this pattern: <b>load from storage → work in RAM → write results out</b>.</p>`),

    // 10 Financial
    () => html(`
      <p><b>A script that downloads NIFTY option prices and writes a log</b>, like the <code>nifty_option_analyzer</code> you already have. Trace it:</p>
      <pre>python main.py
  → OS finds python.exe (PATH), creates a process
  → interpreter compiles main.py; imports compile other .py files (cached in __pycache__)
  → program asks the OS to open a network connection to the broker's API server
  → bytes arrive via the network card → OS → process RAM
  → JSON text parsed into Python objects in RAM
  → calculations run: CPU executing the interpreter executing your bytecode
  → program asks the OS to append to option_analyzer.log (storage)
  → process ends: everything in RAM is gone, only the log file remains</pre>
      <div class="callout">This is why trading systems <b>persist state</b> to files or databases (your folder even has <code>auto_trader_state.json</code>). A crash loses RAM, and the state file is how the system remembers where it was.</div>`),

    // 11 Mistakes
    () => h("div", [
      ["\"The CPU runs my Python code.\"", "The CPU runs python.exe. python.exe runs your code. There's a whole layer in between, and it explains Python's speed."],
      ["\"Saving the file runs it\" / \"editing the file changes the running program.\"", "The process loaded and compiled the file when it started. Edits only take effect the next time you run it."],
      ["\"The terminal is Python.\"", "The terminal draws text, the shell interprets commands, and Python is a separate program the shell launches. Three different programs."],
      ["\"RAM and storage are the same thing, just memory.\"", "RAM is fast and forgets; storage is slow and remembers. Variables live in RAM, so they vanish when the program exits."],
      ["\"My variables are saved after the program finishes.\"", "Only what you explicitly write to a file or database survives."],
      ["\"Python checks one line at a time as it runs, so line 1 runs before a typo on line 4 is found.\"", "The whole file is compiled first. A SyntaxError anywhere means nothing runs."],
    ].map(([m, fix]) => h("div.mistake", h("div", h("strong", m), h("div.small.muted", fix))))),

    // 12 Debugging
    (ctx) => h("div",
      html(`<p>Real error messages. For each one, decide <b>which layer failed</b>. Reason it out before clicking. Wrong answers give you a question to think about, not the answer.</p>`),
      diagnosis(ctx)),

    // 13 Coding exercise (STOP: learner implements)
    () => html(`
      <div class="gate"><b>⏸ Your turn. The lesson pauses here.</b> Do these tasks in the <code>workspace/l04/</code> folder, in a real terminal. Write <b>predictions before running</b> and <b>observations after</b> in <code>workspace/l04/notes.md</code>. Wrong predictions are useful. Don't delete them.</div>
      <div class="task"><h4>Task 1 · Find your interpreter</h4>
        <ol><li>Run <code>python --version</code> and <code>where.exe python</code></li>
        <li>Record: which folder(s) contain python.exe? Which one ran, and how does the shell decide?</li></ol></div>
      <div class="task"><h4>Task 2 · Type (don't paste) and run trade.py</h4>
        <p class="small">Create <code>workspace/l04/trade.py</code> with the 4 lines from section 4. Run it with <code>python trade.py</code> from inside that folder.</p></div>
      <div class="task"><h4>Task 3 · See the bytecode yourself</h4>
        <p class="small">Run <code>python -m dis trade.py</code>. Find the instruction that does the multiplication. Then change line 3 to <code>total = price * qty - 20</code>, predict the new bytecode, and check your prediction.</p></div>
      <div class="task"><h4>Task 4 · Compile first, then run (predict first!)</h4>
        <ol><li>Add <code>print("start")</code> as the <b>first</b> line of trade.py.</li>
        <li>Remove the closing <code>)</code> on the last line. <b>Predict:</b> will "start" print? Run it.</li>
        <li>Restore it. Now change line 3 to use <code>qtty</code> instead of <code>qty</code>. <b>Predict</b> again, then run it.</li>
        <li>In notes.md, explain the difference using what you learned about compiling vs executing.</li></ol></div>
      <div class="task"><h4>Task 5 · Watch a process live</h4>
        <ol><li>Run: <code>python -c "import os, time; print(os.getpid()); time.sleep(60)"</code></li>
        <li>Within 60 seconds, open Task Manager → <b>Details</b> tab and find that PID. Record its memory usage.</li>
        <li>What happens to that row when the program ends?</li></ol></div>
      <p class="small muted">When you're done, tell your tutor. You'll get a review of notes.md, not an answer key.</p>`),

    // 14 Mini project
    () => html(`
      <p><b>Mini project: the trace report.</b> Create <code>workspace/l04/trace.md</code> and write, <i>in your own words and without looking back at this lesson</i>, the full journey of <code>python trade.py</code> from pressing Enter to the prompt coming back.</p>
      <ul>
        <li>At least one line per layer: hardware, OS, interpreter, program, CPU/memory, output.</li>
        <li>For <b>each layer, one thing that could go wrong</b> there, and the error you'd expect to see.</li>
        <li>Finish with: where would a <code>FileNotFoundError</code> for <code>nifty_prices.csv</code> come from, and what are two possible causes?</li>
      </ul>
      <p>You can draw with text arrows. Diagrams count. After this, compare your trace with the section 4 visualization and note anything you missed. That gap is exactly what to review.</p>`),

    // 15 Knowledge check
    (ctx) => h("div",
      html(`<p>Answer without scrolling up. These answers are saved and your tutor reads them during review.</p>`),
      ctx.answerBox("kc1", "1. What's the difference between RAM and storage, and why does a program need both?"),
      ctx.answerBox("kc2", "2. What is a process? What does the operating system give it?"),
      ctx.answerBox("kc3", "3. Your Python code doesn't run directly on the CPU. What does, and what does it do with your code?"),
      ctx.answerBox("kc4", "4. Why doesn't \"start\" print when the file has a SyntaxError on its last line, but does print when there's a NameError?"),
      ctx.answerBox("kc5", "5. Using the latency numbers, explain why fetching 1,00,000 prices with one API call each is a bad design. What would you do instead?"),
      ctx.answerBox("kc6", "6. Where will you use this knowledge? Give one example from your own future market-data project.")),

    // 16 Beginner → Pro
    (ctx) => levels(ctx, "levels", [
      { tier: "basics", title: "Program vs process", body: () => html(`<p>A <b>program</b> is a file on disk. A <b>process</b> is that program <i>running</i>: loaded into RAM, with its own PID and memory, taking turns on the CPU. <code>python trade.py</code> creates one process, which ends when the last line finishes.</p>`) },
      { tier: "under", title: "Scheduling: sharing the CPU", body: () => html(`<p>Your laptop runs hundreds of processes but has only a few cores. The OS <b>scheduler</b> gives each one a tiny time slice (milliseconds) and switches between them so fast that they all seem to run at once. In Task Manager you can see each one's CPU share.</p>`) },
      { tier: "advanced", title: "Processes, threads and memory isolation", body: () => html(`<p>Each process has a <b>private memory space</b>, so one crashing app can't corrupt another. A process can contain several <b>threads</b> (workers sharing the same memory). Python has an extra rule about threads that you'll meet in Phase 2, and it's why data work often uses several <i>processes</i> instead.</p>`) },
      { tier: "pro", title: "Processes in production", body: () => html(`<p>A web API is a <b>long-running process</b>: it starts, then waits for requests forever. In production:</p>
        <ul><li><b>Something must restart it when it crashes</b>: a process manager, Docker, or the cloud platform (Phase 5).</li>
        <li><b>It logs to stdout</b>, and the platform collects those logs, because nobody is watching a terminal.</li>
        <li><b>Health checks</b> ask it "are you alive?" every few seconds. If it stops answering, it gets replaced.</li>
        <li><b>Graceful shutdown</b>: on deploy it finishes the requests already in progress before exiting, so no user sees an error.</li></ul>
        <p>Everything you traced in this lesson (process, memory, output through the OS) is exactly what those tools manage.</p>`) },
    ]),

    // 17 Next
    () => html(`
      <p><b>This lesson unlocks:</b></p>
      <ul>
        <li><b>Lesson 5, Your Python Environment:</b> what PATH really is (why <code>'python' is not recognized</code> happens), environment variables, virtual environments, packages, and a proper project structure. This is the OS layer, up close.</li>
        <li><b>Lesson 7, Variables and Memory:</b> you already saw <code>STORE_NAME price</code>. Next you'll see that a Python variable is a <i>name pointing at an object in RAM</i>, and why that matters when you copy lists of prices.</li>
        <li><b>Later, Phase 2:</b> why NumPy is 50–100× faster than a Python loop. It skips the evaluation loop you just traced.</li>
      </ul>`),
  ],

  // Spaced-revision coding challenges, one per interval (1, 3, 7, 14, 30 days).
  revision: [
    { title: "Stack machine from memory", body: "<p>Without opening the lesson, write toy-machine code for <code>pnl = (sell - buy) * qty</code>, store it and print it. Then run it in the lesson 4 toy machine using temporary memory.</p>" },
    { title: "Compile vs run", body: "<p>Write a 5-line Python file that prints something on line 1 and has an error on line 5. Make one version where line 1 prints and one where it doesn't. Explain why in one sentence each.</p>" },
    { title: "Read bytecode", body: "<p>Write a 3-line program of your own that uses a variable twice. Run <code>python -m dis</code> on it and annotate every instruction in a comment.</p>" },
    { title: "Latency estimate", body: "<p>Estimate, with working, how long it takes to load 10 years of daily OHLCV for 200 stocks with one API call per stock vs one per day. Then write the timing as a tiny Python script.</p>" },
    { title: "Full trace, cold", body: "<p>Rewrite your trace.md from scratch without looking at the old one, then compare the two. What did you add? What did you forget?</p>" },
  ],
};
