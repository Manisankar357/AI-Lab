// Generic lesson page. A lesson module (js/lessons/lessonNN.js) supplies the
// content for each of the 16 standard sections; this file supplies layout,
// progress tracking, answer boxes, progressive hints and the review gate.

import { lessonById, DIFFICULTY, phaseByKey, LESSONS } from "../curriculum.js";
import { lessonState, updateLesson, getState, isLocked } from "../store.js";
import { linkTerms } from "../terms.js";
import { h, statusBadge, toast } from "../ui.js";
import { deadlineStrip } from "./deadline.js";
import { subscribe } from "../store.js";

export const SECTION_TITLES = [
  "What are we learning?", "Why does it matter?", "Mental model", "Visual explanation",
  "How it works internally", "Simple example", "Code from scratch", "Interactive experiment",
  "Real-world example", "Financial-market example", "Common mistakes", "Debugging challenge",
  "Coding exercise", "Mini project", "Knowledge check", "Beginner → Pro: go deeper", "What this unlocks next",
];

// ---- Helpers handed to lesson modules --------------------------------------

function makeCtx(id) {
  const st = () => lessonState(id);
  return {
    id,
    state: st,

    // Free-text answer saved to progress.json as you type.
    answerBox(qid, label, { placeholder = "Answer in your own words, without looking back.", rows = 4 } = {}) {
      const ta = h("textarea", { id: `q-${qid}`, rows, placeholder });
      ta.value = st().answers?.[qid] || "";
      let t;
      ta.addEventListener("input", () => {
        clearTimeout(t);
        t = setTimeout(() => updateLesson(id, (l) => { (l.answers ||= {})[qid] = ta.value; }), 500);
      });
      return h("div.q", h("label", { for: `q-${qid}` }, label), ta);
    },

    // Hints revealed one at a time; the count is recorded (honest signal for review).
    hintLadder(hid, hints, { solution } = {}) {
      const list = h("div.hint-list");
      const btn = h("button.btn.secondary.sm", { type: "button" });
      const paint = () => {
        const shown = st().hints?.[hid] || 0;
        list.replaceChildren(...hints.slice(0, shown).map((txt, i) => h("div.hint", h("strong", `Hint ${i + 1}: `), h("span", { html: txt }))));
        if (solution && shown > hints.length) list.append(h("div.hint", { html: solution }));
        const left = hints.length - shown;
        btn.textContent = left > 0 ? `Show hint ${shown + 1} of ${hints.length}` : solution && shown === hints.length ? "Show explanation" : "No more hints";
        btn.disabled = left <= 0 && !(solution && shown === hints.length);
      };
      btn.addEventListener("click", () => { updateLesson(id, (l) => { (l.hints ||= {})[hid] = (l.hints[hid] || 0) + 1; }); paint(); });
      paint();
      return h("div", list, btn);
    },

    // Multiple-choice situations with feedback. Wrong picks get a nudge, not the answer.
    choiceQuiz(key, items, choices, { nudge = "Not quite. Think about which part is actually struggling." } = {}) {
      return h("div", items.map((it, i) => {
        const k = `${key}${i}`;
        const fb = h("div");
        const btns = choices.map(([id, label]) => h("button.btn.secondary.sm", { type: "button", onclick: () => pick(id) }, label));
        const pick = (id) => {
          const right = id === it.answer;
          const prev = this.exercise(k) || {};
          this.setExercise(k, { tries: (prev.tries || 0) + 1, solved: right || !!prev.solved });
          btns.forEach((b, j) => { b.classList.remove("picked-right", "picked-wrong"); if (choices[j][0] === id) b.classList.add(right ? "picked-right" : "picked-wrong"); });
          fb.innerHTML = right
            ? `<div class="callout good small" style="margin-top:8px"><b>Yes.</b> ${it.why}</div>`
            : `<div class="callout warn small" style="margin-top:8px">${it.nudge || nudge}</div>`;
        };
        return h("div.task", h("div.eyebrow", `Situation ${i + 1}`), h("p", { style: { margin: "0 0 8px" }, html: it.q }), h("div.choice", btns), fb);
      }));
    },

    setExercise(key, value) { updateLesson(id, (l) => { (l.exercises ||= {})[key] = value; }); },
    exercise(key) { return st().exercises?.[key]; },
  };
}

// ---- Page ------------------------------------------------------------------

export async function render(root, id) {
  const meta = lessonById(id);
  if (!meta?.module) {
    root.append(h("div.empty", h("strong", "This lesson hasn't been written yet"),
      "Lessons are written one at a time, after the previous one is reviewed. ", h("a", { href: "#/lessons" }, "Back to lessons")));
    return;
  }
  if (isLocked(id)) {
    const prev = LESSONS[LESSONS.findIndex((l) => l.id === id) - 1];
    root.append(h("div.empty", h("strong", "🔒 This lesson is locked"),
      `It builds on Lesson ${prev.id.slice(1)} (${prev.title}). Finish that one and get it reviewed first. `, h("a", { href: "#/lessons" }, "Back to lessons")));
    return;
  }
  const { lesson } = await import(`../lessons/${meta.module}`);
  const ctx = makeCtx(id);
  const phase = phaseByKey(meta.phase);
  const d = DIFFICULTY[meta.difficulty];

  const deadlineHost = h("div");
  const paintDeadline = () => deadlineHost.replaceChildren(deadlineStrip(id));
  paintDeadline();
  const unsubDeadline = subscribe(paintDeadline);

  const tocLinks = [];
  const sectionEls = lesson.sections.map((sec, i) => {
    const num = String(i + 1).padStart(2, "0");
    const doneBtn = h("button.btn.ghost.sm", { type: "button" });
    const el = h("section.card.lsec", { id: `s${i + 1}`, "aria-labelledby": `h-s${i + 1}` },
      h("div.lsec-head", h("span.lsec-num", num), h("h2", { id: `h-s${i + 1}` }, SECTION_TITLES[i])),
      linkTerms(sec(ctx)),
      h("div.lsec-foot", doneBtn));
    const paintDone = () => {
      const done = (ctx.state().sectionsDone || []).includes(i + 1);
      el.classList.toggle("done", done);
      doneBtn.textContent = done ? "✓ Done" : "Mark section done";
      tocLinks[i]?.classList.toggle("done", done);
    };
    doneBtn.addEventListener("click", () => {
      const markDone = !(ctx.state().sectionsDone || []).includes(i + 1);
      updateLesson(id, (l) => {
        const set = new Set(l.sectionsDone || []);
        markDone ? set.add(i + 1) : set.delete(i + 1);
        l.sectionsDone = [...set].sort((a, b) => a - b);
      });
      paintDone();
      paintGate();
    });
    el._paint = paintDone;
    return el;
  });

  const toc = h("nav.lesson-toc", { "aria-label": "Lesson sections" },
    h("div.eyebrow", "Sections"),
    h("ol", SECTION_TITLES.map((t, i) => {
      const a = h("a", { href: `#s${i + 1}`, onclick: (e) => { e.preventDefault(); document.getElementById(`s${i + 1}`).scrollIntoView({ behavior: "smooth" }); } },
        h("span.faint.mono", String(i + 1).padStart(2, "0")), t);
      tocLinks.push(a);
      return h("li", a);
    })));
  sectionEls.forEach((el) => el._paint());

  // Scroll-spy for the table of contents.
  const spy = new IntersectionObserver((entries) => {
    for (const e of entries) if (e.isIntersecting) {
      const idx = sectionEls.indexOf(e.target);
      tocLinks.forEach((a, i) => a.classList.toggle("active", i === idx));
    }
  }, { rootMargin: "-30% 0px -60% 0px" });
  sectionEls.forEach((el) => spy.observe(el));

  // Review gate: submitting doesn't mean mastery. A review does.
  const gate = h("div.gate");
  function paintGate() {
    const st = ctx.state();
    const done = (st.sectionsDone || []).length;
    const missing = lesson.requiredAnswers.filter((q) => !(st.answers?.[q] || "").trim());
    const unsolved = (lesson.requiredExercises || []).filter((k) => !st.exercises?.[k]?.passed);
    const reviews = getState().reviews.filter((r) => r.lessonId === id);
    const last = reviews.at(-1);
    const ready = done === SECTION_TITLES.length && missing.length === 0 && unsolved.length === 0;
    gate.replaceChildren(
      h("div.row.between", h("h3", { style: { margin: 0 } }, "Submit for review"), statusBadge(st.status)),
      h("p.small", { style: { margin: "8px 0" } }, "A lesson is marked mastered only after your tutor reviews your work: your answers and exercises here, plus any files the lesson asked you to create in ", h("code", `workspace/${id.toLowerCase()}/`), "."),
      h("ul.small",
        h("li", `${done} / ${SECTION_TITLES.length} sections done`),
        h("li", missing.length ? `${missing.length} required answer(s) still empty` : "All required answers written"),
        h("li", unsolved.length ? "The build-it-yourself exercise (section 7) isn't passed yet" : "Build-it-yourself exercise passed")),
      last ? h("div.callout" + (last.verdict === "mastered" ? ".good" : ".warn"),
        h("strong", `Review ${last.date}: ${last.verdict === "mastered" ? "Mastered" : "Revise and resubmit"}`),
        h("p.small", { style: { margin: "4px 0 0", whiteSpace: "pre-wrap" } }, last.notes)) : null,
      st.status === "mastered" ? null : h("div.row",
        h("button.btn", { type: "button", disabled: !ready || st.status === "awaiting_review", onclick: () => {
          updateLesson(id, (l) => { l.status = "awaiting_review"; l.submittedAt = new Date().toISOString(); });
          toast("Submitted. Ask your tutor: review my " + id + " work");
          paintGate();
        } }, st.status === "awaiting_review" ? "Waiting for review…" : "Submit for review"),
        st.status === "awaiting_review" ? h("span.small", "In Claude Code, say: ", h("code", `review my ${id} work`)) : null),
    );
  }
  paintGate();

  root.append(
    h("div.page-head",
      h("div",
        h("div.eyebrow", `Lesson ${id.slice(1)} · Phase ${phase.num}: ${phase.title}`),
        h("h1", meta.title),
        h("p", `${d.dot} ${d.label} · ${meta.hours} hours planned · progress saves automatically`),
        deadlineHost),
      statusBadge(ctx.state().status)),
    h("div.lesson-layout", toc, h("div.lesson-body", sectionEls, gate)),
  );

  if (location.hash.includes("#s")) document.getElementById(location.hash.split("#").pop())?.scrollIntoView();
  // Keep section ticks and the review box current if progress changes underneath
  // (e.g. merged from another tab). Answer boxes are left alone, so typing isn't interrupted.
  const unsubSections = subscribe(() => { sectionEls.forEach((el) => el._paint()); paintGate(); });
  return () => { spy.disconnect(); unsubDeadline(); unsubSections(); };
}
