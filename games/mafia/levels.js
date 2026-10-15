export const roles = {
  loyal: { name: "Lojal sj\u00f8mann", faction: "loyal", ranks: ["Ess", "2", "3", "4", "5", "6", "7"] },
  commander: { name: "Admiralen", faction: "loyal", ranks: ["Konge"] },
  security: { name: "Livvakten", faction: "loyal", ranks: ["Dame"] },
  lovers: { name: "Skipskameratene", faction: "loyal", ranks: ["8", "9"] },
  lancelot: { name: "V\u00e5ghalsen", faction: "loyal", ranks: ["Knekt"] },
  saboteur: { name: "Mytterist", faction: "saboteur", ranks: ["Ess", "2", "3", "4"] },
  assassin: { name: "Mytterilederen", faction: "saboteur", ranks: ["Konge"] },
  deceiver: { name: "Blindpassasjeren", faction: "saboteur", ranks: ["Knekt"] },
  blind: { name: "Enst\u00f8ingen", faction: "saboteur", ranks: ["Dame"] },
  witch: { name: "Den falske admiralen", faction: "saboteur", ranks: ["5"] },
};

export const levels = [
  {
    id: "1",
    name: "L\u00e6r det grunnleggende",
    description: "L\u00e6r mannskapsvalg, avstemning og hemmelige oppdragskort. Bare mytteristene v\u00e5kner om natten. Ingen innsyn eller avsl\u00f8ringsfinale.",
    inspection: false,
    counts: { loyal: 7, saboteur: 4 },
  },
  {
    id: "2",
    name: "Beskytt Admiralen",
    description: "Admiralen ser alle fire mytteristene. Etter tre vellykkede oppdrag f\u00e5r Mytterilederen en siste sjanse til \u00e5 finne Admiralen. Ingen innsynskort enn\u00e5.",
    inspection: false,
    counts: { loyal: 6, commander: 1, saboteur: 3, assassin: 1 },
  },
  {
    id: "3",
    name: "Bl\u00f8ff og beskyttelse",
    description: "Blindpassasjeren skjuler seg for Admiralen. Livvakten ser Admiralen og den falske admiralen, uten \u00e5 vite hvem som er hvem. Innsynskortet brukes etter oppdrag 1, 2 og 3 hvis spillet fortsetter.",
    inspection: true,
    counts: { loyal: 5, commander: 1, security: 1, saboteur: 1, assassin: 1, deceiver: 1, witch: 1 },
  },
  {
    id: "4",
    name: "Alle spesialroller / ekspert",
    description: "Skipskameratene kjenner hverandre. Enst\u00f8ingen kjenner ikke de andre mytteristene. V\u00e5ghalsen kan sabotere selv om han er lojal. Alle spesialroller er med; ingen vanlig mytterist.",
    inspection: true,
    counts: { loyal: 2, commander: 1, security: 1, lovers: 2, lancelot: 1, assassin: 1, deceiver: 1, blind: 1, witch: 1 },
  },
];

export function getLevel(id) {
  const level = levels.find((entry) => entry.id === (id ?? "1"));
  if (!level) throw new RangeError("Ugyldig niv\u00e5. Velg et niv\u00e5 fra 1 til 4.");
  return level;
}

export function hasFeature(level, feature) {
  if (feature === "inspection") return level.inspection;
  if (feature === "finale") return Boolean(level.counts.assassin);
  if (feature === "basic") return !level.counts.assassin;
  if (!(feature in roles)) throw new RangeError(`Ukjent regel: ${feature}`);
  return Boolean(level.counts[feature]);
}

export function getLoadout(level) {
  return Object.entries(level.counts).map(([id, count]) => {
    const role = roles[id];
    const suit = role.faction === "loyal" ? "Ruter" : "Spar";
    return { id, count, ...role, cards: role.ranks.slice(0, count).map((rank) => `${suit} ${rank}`) };
  });
}
