# Kortbordet

A mobile-friendly, Norwegian card-game library for GitHub Pages. Plain HTML,
CSS and JavaScript, with no build step, external fonts, tracking or dependencies.

## Run locally

From this directory:

```sh
python3 -m http.server 8000
```

Open `http://localhost:8000`. Use an HTTP server rather than opening files
directly: the shared navigation enhancements use JavaScript modules.

## Publish to GitHub Pages

1. Push this directory's contents to a GitHub repository.
2. Open **Settings > Pages > Build and deployment**.
3. Choose **Deploy from a branch**, select your branch and **/ (root)**, then save.
4. Open the Pages URL once GitHub finishes deploying.

All internal URLs are relative, so both `https://owner.github.io/` and
`https://owner.github.io/repository-name/` work without configuration.
The [.nojekyll](.nojekyll) file disables Jekyll processing. There is no server-side
application, login, database or secret role assignment.

## Pages

- [Game library](index.html)
- [Mytteri!: player rules](games/mafia/index.html)
- [Moderator: setup, full balance table and night script](games/mafia/moderator.html)
- [Jukselapp: quick rules and the selected level's roles](games/mafia/jukselapp.html)

## Difficulty levels for 11 players

All four presets have **7 loyal players and 4 mutineers, plus one moderator**.
The teams are **De lojale** and **Mytteristene**.
Red/diamonds are loyal; black/spades are mutineers. Mission sizes remain
**4, 5, 4, 6*, 6**, where * requires two sabotage cards to fail.

| Level | Loyal roles (7 players) | Mutineer roles (4 players) | Rules introduced |
| --- | --- | --- | --- |
| 1: Learn the basics | 7 loyal sailors | 4 ordinary mutineers | Only mutineers wake at night. No inspection or reveal finale; three successes immediately win for the loyal team. |
| 2: Protect Admiralen | Admiralen + 6 loyal sailors | Mytterilederen + 3 ordinary mutineers | Admiralen sees all four mutineers. Three successes trigger the reveal finale. No inspection. |
| 3: Deception and protection | Admiralen, Livvakten + 5 loyal sailors | Mytterilederen, Blindpassasjeren, Den falske admiralen + 1 ordinary mutineer | Blindpassasjeren hides from Admiralen; Livvakten sees Admiralen and Den falske admiralen. Inspection after missions 1, 2 and 3 if play continues. |
| 4: All special roles / expert | Admiralen, Livvakten, both Skipskameratene, Vaaghalsen + 2 loyal sailors | Mytterilederen, Blindpassasjeren, Den falske admiralen, Enstoingen | Skipskameratene see each other; Enstoingen does not see fellow mutineers; Vaaghalsen may sabotage. No ordinary mutineer. |

Start at level 1 and move up only between complete games when everyone is
comfortable. Special roles replace ordinary roles; they do not add players.
Level 4 includes every special role but is an expert/chaos option, not a claim
of proven balance. Vaaghalsen can cause a wholly loyal crew to fail.

The selector appears on all three Mytteri! pages. Level 1 is the default.
The `?level=1` through `?level=4` URL parameter preserves the selected level
when navigating, reloading, bookmarking or sharing links. Changing level loads
the same page at the new level. Browser Back
returns to the previous selection. Invalid levels display an explicit warning
and show level 1.

[levels.js](games/mafia/levels.js) defines the four presets and their exact,
non-overlapping role cards. [difficulty.js](games/mafia/difficulty.js) renders
the shared selector and card lists, and filters applicable rules, roles and
night-script lines. No player identities are assigned or recorded.

The Jukselapp uses a compact selector and puts voting, mission cards and winning
before the role reference. Roles are grouped by team with short abilities and
identifying card ranges; there is no faction filter or personal role selection.
The secret role card reminder and level-specific exceptions remain visible.
Setup advice and the full dealing list stay in the moderator guide, linked from
the player rules and Jukselapp rather than repeated above their content.

The player page teaches the objective, the four-step mission cycle, inspection
and the ending, with section links near the top on mobile as well as desktop.
It explicitly separates the 11-player presets from the 5-20-player reference.
The moderator guide follows three phases: preparation (including the exact card
list), first-night script, and daytime checklist with mission sizes and winning
conditions. Its phase links stay available while scrolling. Spoken night text
is visually distinct from stage directions; Enstoingen's stay-asleep warning
comes before the other mutineers are told to open their eyes.

The moderator's separate **table reference** still covers 5-20 players,
excluding the moderator, and defaults to 11. It reads the HTML balance table
directly. Choosing another player count does **not** adapt the 11-player role
presets or night script; an explicit warning explains that limitation.
The table reference selection resets to 11 on reload. The selector and full
table sit in a collapsed reference section after the three phases. Opening a
link to `#referanse` expands it; without JavaScript the reference starts open.

Core Mytteri! rules, roles and the balance table remain readable without
JavaScript as an explicitly labeled, unfiltered reference. JavaScript is
required for difficulty selection, exact preset card lists and filtering.
The library has a no-JavaScript link to Mytteri!.

The existing `games/mafia/` URLs, script filenames and internal role identifiers
are retained so bookmarks, shared level links and feature gates keep working.
The rename changes presentation only: role cards, abilities, faction totals and
difficulty progression are unchanged. Kapteinen remains the rotating public
title, distinct from the secret role Admiralen.

## Printing

Use the print button on the relevant page, or the browser's Print command.
Print the player rules and moderator guide separately. Print extra copies of
the Jukselapp for players; it may span multiple sheets. The selected level is
included; controls and navigation are omitted. Printing the moderator guide
expands its card list and balance reference, then restores their previous
open/closed states. Player-rule prints contain the rules without setup lists.
The compact Jukselapp prints the quick rules and
roles **in the selected level**, without setup advice or the full dealing list.
Excluded roles and rules stay hidden. Actual pagination
depends on the browser and paper size.

## Add a game

1. Create `games/<slug>/index.html`. Use the Mytteri! pages as a structural example,
   including `lang`, viewport metadata, skip link and a link back to the library.
2. Reuse [assets/styles.css](assets/styles.css) and
   [assets/site.js](assets/site.js) with relative paths. Keep game-specific
   behavior within the game's directory.
3. Add an entry to the `games` array in [assets/games.js](assets/games.js).
   Each entry has `title`, `category`, `description`, `players`, `detail`,
   `href` (relative to the library), and a short decorative `mark`.
4. Add a fallback link to the library's `noscript` block.
5. Add separate moderator/reference pages as needed, linking them with the
   same game navigation and setting `aria-current="page"` on the current link.
6. Run the tests and check the pages on a narrow viewport and in print preview.

No router, compilation or deployment change is required to add a game.
Source files use ASCII; HTML entities and JavaScript Unicode escapes preserve
natural Norwegian text in the browser.

## Mytteri! rule clarifications

This version follows the supplied game with these agreed color and consistency
corrections:

- **Red / diamonds (Ruter) = loyal; black / spades (Spar) = mutineer.**
  Role ranks are preserved while suits are swapped.
- Red mission cards mean success; black mission cards mean sabotage.
- Vaaghalsen is explicitly exempt from the loyal-must-play-red rule.
- Blindpassasjeren hides from Admiralen during the night.
- Livvakten sees two possible admirals when Den falske admiralen is present.

The supplied balance values are preserved, including the two-sabotage
requirement on mission 4 for 7-20 players and mission 5 for 20 players.
Five rejected crews lose **one mission**, not the entire game.
Three successes win immediately at level 1 and trigger the reveal
finale at levels 2-4; three failures end the game at every level.
Resolve a three-point ending before any further inspection.

Practical setup notes make the existing rules playable: levels 2-4 include the
Admiralen and Mytterilederen for the finale, special roles count within their faction
totals, and level 4 includes both Skipskameratene together. Keep mission cards separate
from role cards.
Inspection shows only allegiance, not a special role's rank; use a separate
allegiance card or conceal the rank. Include the initial inspection-card holder
in the list of players who cannot be checked.

## Validation

Node.js 22 or newer is sufficient; there are no packages to install:

```sh
npm test
```

Tests check every balance row, preset faction totals, exact card assignments,
feature gates, internal links and fragments, registry entries, static page
accessibility landmarks, and local asset paths. For browser checks, verify all
four levels on all three pages, cross-page navigation and reloads, role visibility,
the other-player-count warning, mobile layout and level-specific print output.
At 375 x 812, verify the complete voting and mission-card sections (including
the level 4 exception) fit in the initial viewport with 16px body text.
