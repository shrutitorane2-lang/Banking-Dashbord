// UI layer: fetches data from the mock API and renders it. No product data lives here.
const state = { category: "", status: "", q: "" };
const $ = (id) => document.getElementById(id);
const CATEGORY_COLORS = { Savings: "#0b6e69", "Credit Cards": "#7a4bb5", Loans: "#b5651d", Wealth: "#1d6fa5" };

async function api(path) {
  const res = await fetch(path);
  if (!res.ok) throw new Error(res.statusText);
  return res.json();
}

function el(tag, props = {}, ...children) {
  const node = document.createElement(tag);
  Object.entries(props).forEach(([k, v]) => {
    if (k === "class") node.className = v;
    else if (k.startsWith("on")) node.addEventListener(k.slice(2), v);
    else node.setAttribute(k, v);
  });
  children.flat().forEach((c) => node.append(c));
  return node;
}

function metricList(metrics) {
  return el("dl", { class: "metrics" },
    metrics.map((m) => el("div", {}, el("dt", {}, m.label), el("dd", {}, m.value))));
}

// "Apply" for products the customer doesn't hold yet; "View details" otherwise.
function ctaFor(p) {
  if (p.status === "Available") return { label: "Apply now", cls: "primary" };
  if (p.status === "Pending") return { label: "Track application", cls: "secondary" };
  return { label: "View details", cls: "secondary" };
}

function card(p) {
  const cta = ctaFor(p);
  const c = el("article", { class: "card" },
    el("div", { class: "card-head" },
      el("div", {}, el("h2", {}, p.name), el("p", { class: "category" }, p.category)),
      el("span", { class: `status ${p.status}` }, p.status)),
    metricList(p.metrics),
    el("button", { class: `btn ${cta.cls}`, onclick: () => openDetail(p.id) }, cta.label));
  c.style.setProperty("--cat", CATEGORY_COLORS[p.category] || "#0b6e69");
  return c;
}

async function openDetail(id) {
  try {
    const p = await api(`/api/products/${id}`);
    const cta = ctaFor(p);
    $("detail-body").replaceChildren(
      el("span", { class: `status ${p.status}` }, p.status),
      el("h2", { id: "detail-title" }, p.name),
      el("p", {}, p.description),
      metricList(p.metrics),
      el("button", {
        class: `btn ${cta.cls}`,
        onclick: () => {
          $("detail").close();
          toast(p.status === "Available" ? `Application started for ${p.name}.` : `Opening ${p.name}…`);
        },
      }, cta.label));
    $("detail").showModal();
  } catch { toast("Could not load product details. Try again."); }
}

function toast(msg) {
  const t = $("toast");
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => t.classList.remove("show"), 2800);
}

async function renderTabs() {
  const cats = await api("/api/categories");
  const total = cats.reduce((n, c) => n + c.count, 0);
  const all = [{ name: "", label: "All", count: total }, ...cats.map((c) => ({ ...c, label: c.name }))];
  $("tabs").replaceChildren(...all.map((c) =>
    el("button", {
      class: "tab", role: "tab", "aria-selected": String(state.category === c.name),
      onclick: () => { state.category = c.name; renderTabs(); load(); },
    }, c.label, el("span", { class: "count" }, String(c.count)))));
}

async function load() {
  const params = new URLSearchParams();
  Object.entries(state).forEach(([k, v]) => v && params.set(k, v));
  try {
    const items = await api(`/api/products?${params}`);
    $("error").hidden = true;
    $("grid").replaceChildren(...items.map(card));
    $("empty").hidden = items.length > 0;
    const active = items.filter((p) => p.status === "Active").length;
    $("summary").textContent = `${items.length} product${items.length === 1 ? "" : "s"} shown, ${active} active`;
  } catch {
    $("grid").replaceChildren();
    $("error").hidden = false;
  }
}

let debounce;
$("search").addEventListener("input", (e) => {
  clearTimeout(debounce);
  debounce = setTimeout(() => { state.q = e.target.value; load(); }, 200);
});
$("status").addEventListener("change", (e) => { state.status = e.target.value; load(); });

renderTabs().then(load).catch(() => { $("error").hidden = false; });
