import { getLevel, getLoadout, hasFeature, levels } from "./levels.js";

const requestedLevel = new URL(window.location.href).searchParams.get("level");
let level;
let errorMessage;
try {
  level = getLevel(requestedLevel);
} catch (error) {
  if (!(error instanceof RangeError)) throw error;
  errorMessage = `${error.message} Niv\u00e5 1 vises nedenfor.`;
  level = getLevel("1");
}
export { level };

function element(tag, text, className) {
  const node = document.createElement(tag);
  if (text) node.textContent = text;
  if (className) node.className = className;
  return node;
}

const panel = document.querySelector("[data-difficulty]");
const compact = document.body.dataset.page === "cheatsheet";
const label = element("label", "Niv\u00e5");
label.htmlFor = "difficulty-level";
const select = element("select");
select.id = "difficulty-level";
select.setAttribute("aria-describedby", "difficulty-scope");
for (const entry of levels) {
  const option = element("option", `Niv\u00e5 ${entry.id}: ${entry.name}`);
  option.value = entry.id;
  option.selected = entry.id === level.id;
  select.append(option);
}
select.addEventListener("change", () => {
  const url = new URL(window.location.href);
  url.searchParams.set("level", select.value);
  url.hash = "";
  window.location.assign(url.href);
});
window.addEventListener("pageshow", () => {
  select.value = level.id;
});
const controls = element("div", null, "no-print");
controls.append(label, select);
const scope = element("p", "Ferdige oppsett for 11 spillere + 1 moderator. Alltid 7 lojale / Ruter og 4 mytterister / Spar.", "small");
scope.id = "difficulty-scope";
const title = element("h2", `Niv\u00e5 ${level.id}: ${level.name}`);
title.id = "selected-level";
panel.setAttribute("aria-labelledby", title.id);
scope.textContent = compact ? "11 spillere + moderator" : "11 spillere + moderator / 7 lojale og 4 mytterister";
title.className = "print-only";
panel.append(controls, scope, title);
if (errorMessage) {
  const error = element("p", errorMessage, "callout warning");
  error.setAttribute("role", "alert");
  panel.prepend(error);
}
const loadoutContainer = document.querySelector("[data-loadout-container]");
if (loadoutContainer) {
  const loadout = element("details");
  loadout.dataset.loadout = "";
  loadout.open = document.body.dataset.page === "moderator";
  loadout.append(element("summary", "N\u00f8yaktig kortliste / 11 rollekort"));
  const teams = element("div", null, "two-column");
  for (const [faction, heading] of [["loyal", "7 lojale / r\u00f8de ruterkort"], ["saboteur", "4 mytterister / svarte sparkort"]]) {
    const team = element("div");
    team.append(element("h3", heading, `faction ${faction}`));
    const list = element("ul");
    for (const role of getLoadout(level).filter((entry) => entry.faction === faction)) {
      list.append(element("li", `${role.count} x ${role.name}: ${role.cards.join(", ")}`));
    }
    team.append(list);
    teams.append(team);
  }
  loadout.append(teams);
  loadoutContainer.append(element("p", level.description), loadout);
  loadoutContainer.append(element("p", "Start gjerne p\u00e5 niv\u00e5 1. Bytt niv\u00e5 mellom hele spill, aldri mellom oppdrag. Spesialroller erstatter vanlige roller; dere legger ikke til spillere.", "small"));
  if (level.id === "4") {
    loadoutContainer.append(element("p", "Ekspert / kaos: V\u00e5ghalsen kan f\u00e5 et rent lojalt mannskap til \u00e5 feile. Flere krefter betyr ikke automatisk bedre balanse. Pr\u00f8v dette n\u00e5r alle er trygge p\u00e5 reglene.", "callout warning"));
  }
  let loadoutWasOpen = false;
  window.addEventListener("beforeprint", () => {
    loadoutWasOpen = loadout.open;
    loadout.open = true;
  });
  window.addEventListener("afterprint", () => {
    loadout.open = loadoutWasOpen;
  });
}
panel.hidden = false;

for (const node of document.querySelectorAll("[data-feature]")) {
  node.hidden = !hasFeature(level, node.dataset.feature);
}
for (const card of document.querySelectorAll("[data-role]")) {
  card.hidden = !level.counts[card.dataset.role];
  const role = getLoadout(level).find((entry) => entry.id === card.dataset.role);
  if (role) {
    const ranks = role.ranks.slice(0, role.count);
    const rankLabel = ranks.length > 2 ? `${ranks[0]}-${ranks.at(-1)}` : ranks.join(" og ");
    card.querySelector(".role-rank").textContent = `${role.faction === "loyal" ? "Ruter" : "Spar"} ${rankLabel}`;
  }
}
for (const link of document.querySelectorAll("a[href]")) {
  const url = new URL(link.href);
  const current = new URL(window.location.href);
  if (url.origin !== current.origin || url.pathname.slice(0, url.pathname.lastIndexOf("/")) !== current.pathname.slice(0, current.pathname.lastIndexOf("/"))) continue;
  if (!["index.html", "moderator.html", "jukselapp.html"].includes(url.pathname.split("/").pop())) continue;
  url.searchParams.set("level", level.id);
  link.href = url.href;
}
