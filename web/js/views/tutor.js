import { h } from "../ui.js";
import { currentLesson } from "./home.js";

// The tutor is Claude Code, running beside this dashboard. These are the
// commands that switch it into each teaching mode.
const MODES = [
  ["Explain", "Explain a concept visually, with analogy, code and a market example.", "Why does gradient descent work?"],
  ["Simpler", "Re-explain the current idea from a different angle.", "I don't understand this."],
  ["Challenge", "Get a coding challenge at your current level.", "Give me a challenge."],
  ["Debug", "Get broken code. Hints come one at a time, never the answer first.", "Give me a debugging challenge."],
  ["Build", "Get requirements only. You build, and the tutor helps only when you're stuck.", "Build mode: next project."],
  ["Review", "Get your code reviewed: what works, what's risky, and why. Your code isn't rewritten for you.", "Review my {lesson} work."],
  ["Quiz", "Be asked to explain, implement and debug from memory.", "Quiz me on {lesson}."],
];

export function render(root) {
  const cur = currentLesson();
  root.append(
    h("div.page-head", h("div", h("div.eyebrow", "Tutor"), h("h1", "Your tutor is Claude Code"),
      h("p", "This dashboard is where you learn and track progress. The chat beside it is where you ask questions and get reviews."))),
    h("div.callout", h("p", h("strong", "Ground rule: "),
      "The tutor explains, sets the problem, and waits for your attempt. It reviews your code and gives hints in order. It only shows a better implementation after you've tried.")),
    h("div.grid.g2", MODES.map(([name, what, say]) => h("div.card",
      h("h3", name), h("p.small.muted", what),
      h("div.small", "Say: ", h("code", say.replace("{lesson}", cur.id)))))),
    h("div.card", { style: { marginTop: "16px" } },
      h("h3", "How mastery gets recorded"),
      h("ol.small",
        h("li", "Work through the lesson sections and write your answers."),
        h("li", "Do the lesson's tasks (some are in the dashboard, and later ones are files in ", h("code", `workspace/${cur.id.toLowerCase()}/`), "), then click ", h("em", "Submit for review"), "."),
        h("li", "Ask the tutor to review it. After a real review, the tutor records it with ", h("code", "python tools/review.py"), "."),
        h("li", "Only a passing review marks the lesson mastered and schedules revision."))),
  );
}
