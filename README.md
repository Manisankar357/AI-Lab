# AI Engineering Lab

A local, learn-by-building dashboard that takes you from "how does a computer run a program" to building a market-research AI system: one lesson at a time, with you writing the code.

## Run it

Requires Python 3.10+ (no packages to install).

```bash
python server.py
```

Open http://localhost:8765. The server listens on `127.0.0.1` only, so your data never leaves your machine.

## On another computer (or after a reinstall)

```bash
git clone https://github.com/Manisankar357/AI-Lab.git
cd AI-Lab
python server.py
```

All lessons and your workspace code come with it. Your progress, answers and review feedback (`data/`) are **not** on GitHub, because the repo is public. To take them along, copy the `data/` folder across yourself.

## How it works

```
ai-engineering-lab/
├── server.py            stdlib HTTP server: serves web/, saves progress (atomic writes)
├── tools/review.py      the tutor records code reviews here (only way to reach "mastered")
├── data/                created at runtime (gitignored)
│   ├── progress.json    written by the dashboard: sections, answers, exercises, hints, time
│   └── reviews.json     written only by tools/review.py: reviews + completed projects
├── web/
│   ├── index.html, css/app.css
│   └── js/
│       ├── curriculum.js    data only: phases, topics, graph edges, projects, lessons
│       ├── store.js         state, saving, streak/hours/progress, spaced revision
│       ├── ui.js            tiny DOM helpers (no framework)
│       ├── views/           home, roadmap, graph, lessons, lesson, projects, revision, tutor
│       └── lessons/         one module per lesson (content + interactive widgets)
└── workspace/           YOUR code, one folder per lesson (l01/, l02/, …)
```

No build step and no frameworks, on purpose: later in the curriculum you'll read and extend this code yourself.

## The learning loop

1. Open the current lesson. Each one follows the same 16-section format (concept → visual → from scratch → experiment → debugging → exercise → project → knowledge check).
2. Where a lesson needs implementation, it **stops** and gives you a task in `workspace/lNN/`. No solution is shown.
3. Hints unlock one at a time. The number of hints you used is recorded, which is useful signal for review, not a penalty.
4. When every section is done, click **Submit for review**, then tell Claude Code: `review my L01 work`.
5. The tutor reads your files and answers, gives feedback, and records the verdict with `tools/review.py`. **Only a "mastered" review advances you.** Completing the reading doesn't.
6. Mastered lessons come back as coding challenges after 1, 3, 7, 14 and 30 days (Revision tab).

## Tutor commands (say these in Claude Code)

| Say | You get |
|---|---|
| `Why does X work?` | Visual + analogy + code + market example |
| `I don't understand this.` | A simpler explanation from a different angle |
| `Give me a challenge.` | A coding challenge at your level |
| `Give me a debugging challenge.` | Broken code, with hints revealed progressively |
| `Build mode: next project.` | Requirements only; you build it |
| `Review my L01 work.` | A code review: what works, what's risky, why; no rewrite |

## Built for a complete beginner

- Every lesson assumes only the lessons before it. Later lessons stay 🔒 locked until earlier ones are reviewed.
- **Word book:** technical words are written as `{{RAM}}` in lesson text and become tappable plain-English meanings (defined in `web/js/glossary.js`, browsable on the Word book page).
- **Code walkthrough** (`web/js/widgets/codewalk.js`): steps through code line by line, showing the running line, a plain-English explanation, what's in memory, and what's on screen. Every code lesson uses it.

## Status

- **Built:** dashboard, roadmap (16 phases), knowledge graph, project ladder, revision system, review gate, word book, code walkthrough, coding-time tracker, Lesson 01 (What Is a Computer?), Lesson 04 (How Python Runs Your Code; locked until L01–L03 are done).
- **Written one at a time:** Lessons 02, 03, 05 onward, each one after the previous lesson is reviewed.
- **Planned later in the curriculum:** architecture drag-and-drop builder, paradigm comparison (rules / ML / DL / RAG / fine-tuning), gradient-descent and neural-network labs. Each arrives with the lesson that needs it.
