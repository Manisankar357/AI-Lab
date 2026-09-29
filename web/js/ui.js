// Small DOM helpers shared by every view. No framework: just functions.

// h("div.card#id", { onclick }, child, child...) -> Element
export function h(tag, attrs, ...children) {
  const [, name = "div", rest = ""] = tag.match(/^([a-z0-9]+)?(.*)$/i);
  const el = document.createElement(name);
  for (const part of rest.match(/[.#][^.#]+/g) || []) {
    if (part[0] === ".") el.classList.add(part.slice(1));
    else el.id = part.slice(1);
  }
  if (attrs != null && attrs !== false && (typeof attrs !== "object" || attrs instanceof Node || Array.isArray(attrs))) {
    children.unshift(attrs);
    attrs = null;
  }
  for (const [k, v] of Object.entries(attrs || {})) {
    if (v == null || v === false) continue;
    if (k.startsWith("on")) el.addEventListener(k.slice(2), v);
    else if (k === "html") el.innerHTML = v;
    else if (k === "style" && typeof v === "object") Object.assign(el.style, v);
    else el.setAttribute(k, v === true ? "" : v);
  }
  append(el, children);
  return el;
}

function append(el, children) {
  for (const c of children.flat(Infinity)) {
    if (c == null || c === false) continue;
    el.append(c instanceof Node ? c : document.createTextNode(String(c)));
  }
}

// Trusted, author-written HTML only (lesson content). Never user input.
export const html = (str) => {
  const t = document.createElement("template");
  t.innerHTML = str.trim();
  return t.content;
};

export function progressBar(pct, variant = "") {
  const fill = h("span");
  const bar = h(`div.bar${variant ? "." + variant : ""}`, { role: "progressbar", "aria-valuenow": pct, "aria-valuemin": 0, "aria-valuemax": 100 }, fill);
  requestAnimationFrame(() => requestAnimationFrame(() => { fill.style.width = pct + "%"; }));
  return bar;
}

export function toast(msg) {
  const el = h("div.toast", msg);
  document.getElementById("toasts").append(el);
  setTimeout(() => el.remove(), 3200);
}

export const STATUS_BADGE = {
  not_started: ["Not started", ""],
  in_progress: ["In progress", "accent"],
  awaiting_review: ["Awaiting review", "warn"],
  mastered: ["Mastered", "good"],
  needs_revision: ["Needs revision", "bad"],
};

export function statusBadge(status) {
  const [label, cls] = STATUS_BADGE[status] || STATUS_BADGE.not_started;
  return h(`span.badge${cls ? "." + cls : ""}`, label);
}

export const stagger = (els, step = 40) => els.forEach((el, i) => { el.style.animationDelay = `${i * step}ms`; });
