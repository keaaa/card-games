import "./difficulty.js";

const playerCount = document.querySelector("#player-count");

if (playerCount) {
  const rows = [...document.querySelectorAll("#balance-table tbody tr")];
  const result = document.querySelector("#setup-result");
  const details = document.querySelector("[data-balance-details]");

  function updateSetup() {
    const selected = rows.find((row) => row.cells[0].textContent === playerCount.value);
    if (!selected) {
      result.textContent = "Ugyldig spillerantall. Velg mellom 5 og 20 spillere, eller bruk tabellen.";
      return;
    }
    for (const row of rows) {
      row.toggleAttribute("data-selected", row === selected);
    }

    const summary = document.createElement("div");
    summary.className = "setup-summary";
    for (const [index, faction, label] of [[1, "loyal", "lojale / Ruter"], [2, "saboteur", "mytterister / Spar"]]) {
      const team = document.createElement("span");
      team.className = `faction ${faction}`;
      team.textContent = `${selected.cells[index].textContent} ${label}`;
      summary.append(team);
    }

    const missions = document.createElement("div");
    missions.className = "mission-grid";
    for (let index = 3; index < 8; index += 1) {
      const value = selected.cells[index].textContent;
      const special = value.endsWith("*");
      const mission = document.createElement("div");
      mission.className = special ? "mission special" : "mission";
      const label = document.createElement("span");
      label.className = "rule-label";
      label.textContent = `Oppdrag ${index - 2}`;
      const size = document.createElement("strong");
      size.textContent = value;
      const people = document.createElement("small");
      people.textContent = "spillere";
      const threshold = document.createElement("small");
      threshold.textContent = special ? "2 svarte = feil" : "1 svart = feil";
      mission.append(label, size, people, threshold);
      missions.append(mission);
    }
    result.replaceChildren(summary, missions);
    document.querySelector("[data-reference-warning]").hidden = playerCount.value === "11";
  }

  playerCount.addEventListener("change", updateSetup);
  window.addEventListener("pageshow", updateSetup);
  updateSetup();
  document.querySelector("[data-setup]").hidden = false;
  details.open = window.location.hash === "#referanse";
  window.addEventListener("hashchange", () => {
    if (window.location.hash === "#referanse") details.open = true;
  });

  let wasOpen = false;
  window.addEventListener("beforeprint", () => {
    wasOpen = details.open;
    details.open = true;
  });
  window.addEventListener("afterprint", () => {
    details.open = wasOpen;
  });
}
