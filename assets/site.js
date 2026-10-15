import { games } from "./games.js";

for (const button of document.querySelectorAll("[data-print]")) {
  button.hidden = false;
  button.addEventListener("click", () => window.print());
}

const library = document.querySelector("[data-game-library]");
if (library) {
  for (const game of games) {
    const card = document.createElement("a");
    card.className = "game-card";
    card.href = game.href;

    const artwork = document.createElement("div");
    artwork.className = "game-art";
    artwork.setAttribute("aria-hidden", "true");
    const mark = document.createElement("span");
    mark.className = "card-mark";
    mark.textContent = game.mark;
    artwork.append(mark);

    const body = document.createElement("div");
    body.className = "game-card-body";
    const category = document.createElement("p");
    category.className = "eyebrow";
    category.textContent = game.category;
    const title = document.createElement("h2");
    title.textContent = game.title;
    const description = document.createElement("p");
    description.textContent = game.description;
    const meta = document.createElement("p");
    meta.className = "game-meta";
    meta.textContent = `${game.players} / ${game.detail}`;
    const action = document.createElement("span");
    action.className = "text-link";
    action.textContent = "Utforsk spillet \u2192";
    body.append(category, title, description, meta, action);
    card.append(artwork, body);
    library.append(card);
  }
}
