import test from "node:test";
import assert from "node:assert/strict";
import { readFile, readdir, access } from "node:fs/promises";
import { dirname, resolve, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { games } from "../assets/games.js";

const root = fileURLToPath(new URL("../", import.meta.url));
const expectedBalance = [
  ["5", "3", "2", "2", "3", "2", "3", "3"],
  ["6", "4", "2", "2", "3", "4", "3", "4"],
  ["7", "4", "3", "2", "3", "3", "4*", "4"],
  ["8", "5", "3", "3", "4", "4", "5*", "5"],
  ["9", "6", "3", "3", "4", "4", "5*", "5"],
  ["10", "6", "4", "3", "4", "4", "5*", "5"],
  ["11", "7", "4", "4", "5", "4", "6*", "6"],
  ["12", "8", "4", "4", "5", "5", "6*", "6"],
  ["13", "9", "4", "4", "5", "5", "6*", "7"],
  ["14", "9", "5", "4", "6", "5", "7*", "7"],
  ["15", "10", "5", "5", "6", "6", "7*", "8"],
  ["16", "11", "5", "5", "6", "6", "8*", "8"],
  ["17", "11", "6", "5", "7", "7", "8*", "9"],
  ["18", "12", "6", "5", "7", "7", "9*", "9"],
  ["19", "13", "6", "6", "8", "7", "9*", "10"],
  ["20", "13", "7", "6", "8", "8", "10*", "10*"],
];

async function htmlFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(entries
    .filter((entry) => !entry.name.startsWith(".") && entry.name !== "node_modules")
    .map((entry) => {
      const path = resolve(directory, entry.name);
      return entry.isDirectory() ? htmlFiles(path) : path.endsWith(".html") ? [path] : [];
    }));
  return files.flat();
}

test("all 16 balance rows exactly match the supplied rules", async () => {
  const html = await readFile(resolve(root, "games/mafia/moderator.html"), "utf8");
  const body = html.match(/<tbody>([\s\S]*?)<\/tbody>/)[1];
  const rows = [...body.matchAll(/<tr>([\s\S]*?)<\/tr>/g)].map((row) =>
    [...row[1].matchAll(/<t[dh][^>]*>([^<]*)<\/t[dh]>/g)].map((cell) => cell[1]));
  assert.deepEqual(rows, expectedBalance);
  for (const [players, loyal, saboteurs, ...missions] of rows) {
    assert.equal(Number(loyal) + Number(saboteurs), Number(players));
    assert.ok(missions.every((mission) => parseInt(mission, 10) <= Number(players)));
  }
  const options = [...html.matchAll(/<option value="(\d+)"/g)].map((match) => match[1]);
  assert.deepEqual(options, expectedBalance.map((row) => row[0]));
});

test("every role keeps its rank with the agreed faction and swapped suit", async () => {
  const html = await readFile(resolve(root, "games/mafia/jukselapp.html"), "utf8");
  const roles = [...html.matchAll(/<article class="role-card" data-faction="([^"]+)" data-role="[^"]+">([\s\S]*?)<\/article>/g)];
  const expected = [
    ["loyal", "Lojal sj&oslash;mann", "Ruter Ess til 7"],
    ["loyal", "Admiralen", "Ruter Konge"],
    ["loyal", "Livvakten", "Ruter Dame"],
    ["loyal", "Skipskameratene", "Ruter 8 og 9"],
    ["loyal", "V&aring;ghalsen", "Ruter Knekt"],
    ["saboteur", "Mytterist", "Spar Ess"],
    ["saboteur", "Mytterilederen", "Spar Konge"],
    ["saboteur", "Blindpassasjeren", "Spar Knekt"],
    ["saboteur", "Enst&oslash;ingen", "Spar Dame"],
    ["saboteur", "Den falske admiralen", "Spar 5"],
  ];
  assert.equal(roles.length, expected.length);
  for (const [index, role] of roles.entries()) {
    const [faction, name, card] = expected[index];
    assert.equal(role[1], faction);
    assert.ok(role[2].includes(`<h3>${name}</h3>`));
    assert.ok(role[2].includes(card));
  }
  assert.match(roles[1][2], /unntatt Blindpassasjeren<\/strong>/);
  assert.match(roles[2][2], /to kandidater/);
  assert.match(roles[4][2], /kan spille svart sabotasje/);
  assert.match(roles[7][2], /viser ikke tommel/);
});

test("removed duplicate role is absent from published rules and documentation", async () => {
  const files = [...await htmlFiles(root), resolve(root, "README.md")];
  for (const file of files) {
    const text = await readFile(file, "utf8");
    assert.doesNotMatch(text, /Overl(?:o|\u00f8|&oslash;)peren/i);
  }
  const moderator = await readFile(resolve(root, "games/mafia/moderator.html"), "utf8");
  assert.match(moderator, /Blindpassasjeren skal holde h&aring;nden helt flatt p&aring; bordet og IKKE vise tommel/);
});

test("Mytteri branding and nautical terms are consistent across all published content", async () => {
  const pages = await htmlFiles(root);
  const sources = [
    "README.md", "assets/games.js", "games/mafia/levels.js",
    "games/mafia/difficulty.js", "games/mafia/mafia.js",
  ].map((path) => resolve(root, path));
  for (const file of [...pages, ...sources]) {
    const text = await readFile(file, "utf8");
    assert.doesNotMatch(text, /Avansert Mafia|Kommand|kommand|Sikkerhetssjef|Elskerne|Lancelot|[Ss]nikmorder|Bedrageren|[Dd]en blinde kjempen|Heksa|[Ss]abot(?:&oslash;|\\u00f8|\u00f8|o)r/);
    if (file.includes("/games/") && file.endsWith(".html")) {
      assert.match(text, /<title>[^<]*Mytteri!/);
      assert.match(text, /<nav class="game-nav" aria-label="Mytteri!">/);
    }
  }
  assert.equal(games.find((game) => game.href === "games/mafia/index.html").title, "Mytteri!");
});

test("all local links, fragments and assets exist and work under a Pages subpath", async () => {
  for (const file of await htmlFiles(root)) {
    const html = await readFile(file, "utf8");
    for (const [, attribute, value] of html.matchAll(/\b(href|src)="([^"]+)"/g)) {
      assert.ok(!value.startsWith("/"), `${relative(root, file)}: root-relative ${attribute}`);
      if (/^[a-z]+:/i.test(value)) continue;
      const [path, fragment] = value.split("#");
      const target = path ? resolve(dirname(file), path) : file;
      await access(target);
      if (fragment) {
        const targetHtml = await readFile(target, "utf8");
        assert.ok(targetHtml.includes(`id="${fragment}"`), `${value}: missing anchor`);
      }
    }
    for (const [, id] of html.matchAll(/\b(?:aria-labelledby|aria-describedby)="([^"]+)"/g)) {
      for (const reference of id.split(" ")) {
        assert.ok(html.includes(`id="${reference}"`), `Missing accessible reference ${reference}`);
      }
    }
  }
});

test("pages have mobile metadata, landmarks, unique IDs and current navigation", async () => {
  for (const file of await htmlFiles(root)) {
    const html = await readFile(file, "utf8");
    assert.match(html, /<html lang="nb">/);
    assert.match(html, /name="viewport" content="width=device-width, initial-scale=1"/);
    assert.equal([...html.matchAll(/<h1[ >]/g)].length, 1);
    assert.match(html, /<main[^>]*id="main"/);
    assert.match(html, /class="skip-link" href="#main"/);
    const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]);
    assert.equal(new Set(ids).size, ids.length, `${file}: duplicate IDs`);
    assert.doesNotMatch(html, /[^\x00-\x7F]/);
    if (file.includes("/games/")) {
      assert.equal([...html.matchAll(/aria-current="page"/g)].length, 1);
      const current = html.match(/href="([^"]+)" aria-current="page"/)[1];
      assert.equal(resolve(dirname(file), current), file);
    }
  }
});

test("game registry entries link to real pages and have all display fields", async () => {
  assert.ok(games.length > 0);
  assert.equal(new Set(games.map((game) => game.href)).size, games.length);
  for (const game of games) {
    for (const key of ["title", "category", "description", "players", "detail", "href", "mark"]) {
      assert.equal(typeof game[key], "string");
      assert.ok(game[key].length > 0);
    }
    assert.ok(!game.href.startsWith("/"));
    await access(resolve(root, game.href));
  }
});

test("core content is present in HTML without JavaScript", async () => {
  const [library, moderator, cheatSheet] = await Promise.all([
    readFile(resolve(root, "index.html"), "utf8"),
    readFile(resolve(root, "games/mafia/moderator.html"), "utf8"),
    readFile(resolve(root, "games/mafia/jukselapp.html"), "utf8"),
  ]);
  assert.match(library, /<noscript>[\s\S]*?href="games\/mafia\/index.html"[\s\S]*?<\/noscript>/);
  assert.match(moderator, /<details open data-balance-details\b/);
  assert.equal([...moderator.matchAll(/<tr><th scope="row">/g)].length, 16);
  assert.equal([...cheatSheet.matchAll(/<article class="role-card" data-faction="(?:loyal|saboteur)" data-role="[^"]+">/g)].length, 10);
  assert.match(moderator, /<ol class="night-script">[\s\S]*?<\/ol>/);
});
