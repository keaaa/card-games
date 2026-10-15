import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { getLevel, getLoadout, hasFeature, levels, roles } from "../games/mafia/levels.js";

test("four presets have exactly the agreed role counts", () => {
  assert.deepEqual(levels.map((level) => level.counts), [
    { loyal: 7, saboteur: 4 },
    { loyal: 6, commander: 1, saboteur: 3, assassin: 1 },
    { loyal: 5, commander: 1, security: 1, saboteur: 1, assassin: 1, deceiver: 1, witch: 1 },
    { loyal: 2, commander: 1, security: 1, lovers: 2, lancelot: 1, assassin: 1, deceiver: 1, blind: 1, witch: 1 },
  ]);
});

test("nautical role names match their static reference cards without changing IDs", async () => {
  assert.deepEqual(Object.fromEntries(Object.entries(roles).map(([id, role]) => [id, role.name])), {
    loyal: "Lojal sj\u00f8mann",
    commander: "Admiralen",
    security: "Livvakten",
    lovers: "Skipskameratene",
    lancelot: "V\u00e5ghalsen",
    saboteur: "Mytterist",
    assassin: "Mytterilederen",
    deceiver: "Blindpassasjeren",
    blind: "Enst\u00f8ingen",
    witch: "Den falske admiralen",
  });
  const html = await readFile(new URL("../games/mafia/jukselapp.html", import.meta.url), "utf8");
  for (const [, id, content] of html.matchAll(/data-role="([^"]+)">([\s\S]*?)<\/article>/g)) {
    const title = content.match(/<h3>([^<]+)<\/h3>/)[1]
      .replaceAll("&oslash;", "\u00f8").replaceAll("&aring;", "\u00e5");
    assert.equal(title, roles[id].name);
  }
});

test("each preset deals 11 unique role cards with the correct 7/4 faction split", () => {
  for (const level of levels) {
    const loadout = getLoadout(level);
    const cards = loadout.flatMap((role) => role.cards);
    assert.equal(cards.length, 11);
    assert.equal(new Set(cards).size, 11);
    for (const [faction, total, suit] of [["loyal", 7, "Ruter"], ["saboteur", 4, "Spar"]]) {
      const team = loadout.filter((role) => role.faction === faction);
      assert.equal(team.reduce((sum, role) => sum + role.count, 0), total);
      assert.ok(team.flatMap((role) => role.cards).every((card) => card.startsWith(`${suit} `)));
    }
    for (const role of loadout) assert.equal(role.cards.length, role.count);
  }
  assert.deepEqual(getLoadout(getLevel("1")).flatMap((role) => role.cards), [
    "Ruter Ess", "Ruter 2", "Ruter 3", "Ruter 4", "Ruter 5", "Ruter 6", "Ruter 7",
    "Spar Ess", "Spar 2", "Spar 3", "Spar 4",
  ]);
  assert.deepEqual(getLoadout(getLevel("4")).flatMap((role) => role.cards), [
    "Ruter Ess", "Ruter 2", "Ruter Konge", "Ruter Dame", "Ruter 8", "Ruter 9",
    "Ruter Knekt", "Spar Konge", "Spar Knekt", "Spar Dame", "Spar 5",
  ]);
});

test("finale, inspection and night roles are introduced at the right levels", () => {
  const expected = {
    basic: [true, false, false, false],
    finale: [false, true, true, true],
    inspection: [false, false, true, true],
    commander: [false, true, true, true],
    security: [false, false, true, true],
    deceiver: [false, false, true, true],
    witch: [false, false, true, true],
    blind: [false, false, false, true],
    lovers: [false, false, false, true],
    lancelot: [false, false, false, true],
    saboteur: [true, true, true, false],
  };
  for (const [feature, states] of Object.entries(expected)) {
    assert.deepEqual(levels.map((level) => hasFeature(level, feature)), states, feature);
  }
  const expert = getLevel("4");
  for (const id of Object.keys(roles).filter((id) => !["loyal", "saboteur"].includes(id))) {
    assert.ok(expert.counts[id] > 0, `Expert level must include ${id}`);
  }
  assert.equal(expert.counts.lovers, 2);
});

test("missing level defaults to beginner and invalid levels are rejected", () => {
  assert.equal(getLevel(null).id, "1");
  assert.equal(getLevel(undefined).id, "1");
  for (const id of ["", "0", "5", "-1", "2.5", "01", "expert", "__proto__"]) {
    assert.throws(() => getLevel(id), RangeError);
  }
  assert.throws(() => hasFeature(getLevel("1"), "unknown"), RangeError);
});

test("every page uses valid feature gates and every role has a matching reference card", async () => {
  const pages = ["index.html", "moderator.html", "jukselapp.html"];
  for (const page of pages) {
    const html = await readFile(new URL(`../games/mafia/${page}`, import.meta.url), "utf8");
    assert.match(html, /data-difficulty hidden/);
    assert.match(html, /<noscript>/);
    assert.match(html, /src="(?:difficulty|mafia)\.js"/);
    for (const [, feature] of html.matchAll(/data-feature="([^"]+)"/g)) {
      for (const level of levels) assert.equal(typeof hasFeature(level, feature), "boolean");
    }
    assert.match(html, /data-feature="basic"/);
    assert.match(html, /data-feature="finale"/);
    assert.match(html, /data-feature="inspection"/);
  }
  const html = await readFile(new URL("../games/mafia/jukselapp.html", import.meta.url), "utf8");
  const ids = [...html.matchAll(/data-role="([^"]+)"/g)].map((match) => match[1]);
  assert.deepEqual(ids, Object.keys(roles));
  const css = await readFile(new URL("../assets/styles.css", import.meta.url), "utf8");
  assert.doesNotMatch(css, /\.role-card[^{]*\[hidden\][^{]*\{ display: block/);
});

test("cheat sheet puts actions before roles and preserves critical reminders", async () => {
  const html = await readFile(new URL("../games/mafia/jukselapp.html", import.meta.url), "utf8");
  assert.match(html, /data-page="cheatsheet"/);
  assert.ok(html.indexOf('id="hurtig"') < html.indexOf('id="oppdragskort"'));
  assert.ok(html.indexOf('id="oppdragskort"') < html.indexOf('id="seier"'));
  assert.ok(html.indexOf('id="seier"') < html.indexOf('id="roller"'));
  assert.doesNotMatch(html, /data-role-filters|data-role-count|class="breadcrumb"/);
  assert.match(html, /Ikke spill rollekortet!/);
  assert.match(html, /uavgjort betyr NEI/);
  assert.match(html, /5 avviste lagforslag/);
  assert.match(html, /oppdrag 4 to svarte/);
  assert.match(html, /null eller ett betyr suksess/);
  assert.match(html, /href="moderator.html#klargjoring"/);
});

test("player rules teach before setup and moderator phases follow play order", async () => {
  const [player, moderator] = await Promise.all(["index.html", "moderator.html"].map((page) =>
    readFile(new URL(`../games/mafia/${page}`, import.meta.url), "utf8")));
  assert.doesNotMatch(player, /data-loadout-container|class="game-hero"|role-route|<aside/);
  assert.ok(player.indexOf('aria-label="I spillereglene"') < player.indexOf('id="maal"'));
  assert.match(player, /11 spillere \+ moderator/);
  assert.match(player, /href="moderator.html#referanse"/);
  assert.match(moderator, /id="klargjoring"[\s\S]*?data-loadout-container/);
  const phases = ["klargjoring", "natt", "dag", "referanse"].map((id) => moderator.indexOf(`id="${id}"`));
  assert.ok(phases.every((position, index) => position >= 0 && (index === 0 || position > phases[index - 1])));
  assert.ok(moderator.indexOf('aria-label="I moderatorens hefte"') < phases[0]);
  assert.ok(moderator.indexOf('id="player-count"') > phases[3]);
  assert.equal([...moderator.matchAll(/4 \/ 5 \/ 4 \/ 6\* \/ 6/g)].length, 1);
  const night = moderator.match(/<h3>Mytteristene finner hverandre<\/h3><blockquote>([\s\S]*?)<\/blockquote>/)[1];
  assert.ok(night.indexOf("Enst&oslash;ingen skal holde &oslash;ynene lukket") < night.indexOf("&aring;pne &oslash;ynene"));
});

test("player atmosphere keeps the round structure and essential rules", async () => {
  const html = await readFile(new URL("../games/mafia/index.html", import.meta.url), "utf8");
  assert.match(html, /class="guide-heading player-intro"/);
  assert.match(html, /class="compass-rose" aria-hidden="true"/);
  const steps = html.match(/<ol class="steps">([\s\S]*?)<\/ol>/)[1];
  assert.equal([...steps.matchAll(/<li>/g)].length, 4);
  for (const rule of ["Tommel opp = JA", "Tommel ned = NEI", "Lojale m&aring; spille r&oslash;dt", "minst to svarte kort", "5 avviste lagforslag"]) {
    assert.ok(steps.includes(rule), `Missing rule: ${rule}`);
  }
  assert.match(html, /Ingen ryker ut/);
});
