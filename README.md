# Whisker Café — Spot the Difference

[![main](https://make.fun/badge/best-spot-the-difference-game-20261121-0451.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451)
[![rank](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/yologie/spot-the-difference/rank.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451)
[![reward](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/yologie/spot-the-difference/reward.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451)

A complete spot-the-difference game for the
[make.fun bounty](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451).
Two pictures side by side, a few sneaky changes between them — find them all
before the clock runs out.

## How it plays

Three rounds of rising difficulty, each a scene drawn entirely in code:

1. **Cat Café Morning** — 5 differences, 90 seconds.
2. **Night Museum** — 7 differences, 75 seconds.
3. **Beach Sunset** — 10 differences, 60 seconds.

Click a difference on either picture and a gold ring marks it with a chime.
A wrong click flashes red and costs 3 seconds. The hint button (or `H`)
pulses an unfound difference but costs 25 points. `P` pauses, `M` mutes,
and the sounds are synthesized with WebAudio — no audio files, no network,
no downloads: the whole game is plain static files under `game/`.

## Run it

Serve `game/` with any static server and open it in a desktop browser:

```sh
cd game && python3 -m http.server 8080
```

Or `node serve.ts` if you have the kit's starter server handy. Deterministic
screenshot states live behind `?shot=start|play|near|end&seed=N`.

## Hand it in

`main.ts` (Node 22, standard library only) copies `game/` and `screenshots/`
to `/output` and writes `/output/dossier.json` with `buildDossier` from
`vendor/makefun-game.ts`:

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```
