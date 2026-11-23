[![make.fun · best-card-game-20261122-1826](https://make.fun/badge/best-card-game-20261122-1826.svg)](https://make.fun/bounty/best-card-game-20261122-1826?utm_source=github&utm_medium=readme&utm_campaign=best-card-game-20261122-1826)
[![rank](https://make.fun/badge/best-card-game-20261122-1826/yansenlim724-hub/ember-duel/rank.svg)](https://make.fun/bounty/best-card-game-20261122-1826/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-card-game-20261122-1826)
[![reward](https://make.fun/badge/best-card-game-20261122-1826/yansenlim724-hub/ember-duel/reward.svg)](https://make.fun/bounty/best-card-game-20261122-1826?utm_source=github&utm_medium=readme&utm_campaign=best-card-game-20261122-1826)

<sub>Entered on [make.fun](https://make.fun/?ref=wz6mbrsd&utm_source=github&utm_medium=readme&utm_campaign=best-card-game-20261122-1826) · Ember Duel, 23 November 2026</sub>

# Ember Duel

A turn-based card duel against a rival keeper, played in a desktop browser from static files — no network, no build step. Open `game/index.html` and duel.

## The game

You and the rival start at **30 health**. Each turn you gain mana (1 more per round, up to 8), draw a card, and play cards from a hand of five — click one, or press keys **1–5**. **Space** ends your turn.

Four elements, told apart by colour **and** shape:

- **Ember ▲** — burns hard: the biggest raw damage.
- **Frost ◆** — draws cards and raises shields.
- **Thorn ✚** — bites and heals at the same time.
- **Tide ∿** — flows into extra mana and card draw.

**Chain rule:** play the same element twice in a row and the second card hits for **+2**. Every hand is a decision: spend mana now, or hold a finisher? Chain for damage, or answer with a heal?

**The rival can be read.** Before it moves, the table shows which element it favours, and its heuristic is open: it plays its best-value card, saves big cards when it is safe, shields and heals when it is hurt, and always takes lethal when it sees it. Counter it — shield up, heal, or race it down.

First to 0 health loses. Your score, round, and wins stay visible on the table.

## Files

- `game/index.html` — the table
- `game/styles.css` — table, cards, overlays, motion
- `game/cards.js` — the four elements and all 16 cards, deck, seeded shuffle
- `game/state.js` — game state and turn rules
- `game/ai.js` — the rival's heuristic and its tell
- `game/render.js` — hands, health bars, log, overlays
- `game/shots.js` — deterministic screenshot presets (`?shot=start|play|win|lose`)
- `game/main.js` — boot and input (mouse + keyboard)
- `main.ts` — the hand-in program: copies `game/` and `screenshots/` to `/output` and writes `dossier.json`
- `screenshots/` — four real renders of the game

## Run it

Serve `game/` with any static server and open `index.html`, or:

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

## Bounty

[Make the best card game — best-card-game-20261122-1826](https://make.fun/c/best-card-game-20261122-1826)

## License

MIT — see [LICENSE](LICENSE).
