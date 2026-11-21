# Neon Harbor

An original coastal crime story built for the make.fun gta6-01 competition. Drive sun-faded boulevards, thread the Old Town lanes, and make a name for yourself after dark. Eight story contracts, five vehicle classes, patrol pursuits, stunt ramps, glowing harbor caches, fares, shops and a four-district city live in the browser. Progress and upgrades save locally.

[![Make.fun — gta6-01](https://make.fun/badge/gta6-01.svg)](https://make.fun/bounty/gta6-01)
[![Neon Harbor rank](https://make.fun/badge/gta6-01/Jsmile19/neon-harbor/rank.svg)](https://make.fun/bounty/gta6-01)
[![Neon Harbor reward](https://make.fun/badge/gta6-01/Jsmile19/neon-harbor/reward.svg)](https://make.fun/bounty/gta6-01)

Neon Harbor uses an original 2D canvas city renderer and synthesized WebAudio. It has no dependencies, asset downloads, or build step.

## Play

Run `node serve.ts` from the repository root and open <http://localhost:8080> in desktop Chrome. Any static server can serve `game/`. Once served locally, the game works without an internet connection and makes no external network requests.

## Story runs

1. **First Wheels** — take a coupe to the marina overlook.
2. **Courier Run** — deliver three parcels against the clock.
3. **Getaway Driver** — collect Nia, then shake the patrol tail.
4. **Dockside Deal** — retrieve a package under the crane.
5. **Night Chase** — clear a three-star pursuit across the city.
6. **The Exchange** — deliver fragile cargo without a hard collision.
7. **Harbor Heist** — take a Vesper GT from the guarded lot and bring it to the pier.
8. **King of the Harbor** — the final high-heat run across the city.

## Controls

- **W / A / S / D** or **arrow keys** — walk; accelerate, steer and brake/reverse while driving
- **E** — enter/exit a nearby vehicle; interact with a shop on foot
- **Space** — handbrake / drift; jump on foot
- **Shift** — sprint
- **Mouse drag** — look around the player
- **R** — recover player and vehicle to the nearest junction
- **Esc** — pause/resume
- **M** — mute/unmute synthesized audio
- **Enter** — start, continue, next contract, or retry
- **H** — controls and city guide
- **N** on the title screen — clear the local save for a fresh story

Earn cash on contracts, fares, and stunt jumps; harbor caches are worth $250 each. Visit the dealership, garage, or clinic to buy a ride, tune up, or restore health. Vehicle classes have their own pace and handling.


## City guide

The gold beacon, compass arrow, and minimap route guide the active contract. Slow down at courier stops and for passengers. Dockside Deal requires collecting the package on foot. Harbor Heist requires the marked Vesper, rather than any sports car. Escape stages end only after the wanted stars clear. Hard crashes break the Exchange cargo; failed contracts can be retried with Enter. After the eighth contract, continue exploring freely.

Cyan caches pay $250 each. Taxi passengers use amber FARE markers; stop a taxi at the pickup and destination to earn $400. Five east-facing ramps award $300 and 250 style points on the first successful landing. Police respond to theft, collisions and speed traps, pursue and ram, and set roadblocks at five stars. Outrun patrols or hide behind blocks to cool the search.

Service stops are marked on the map: **H** restores health, **G** installs $450 upgrades (three engine levels, then brakes, then armor), and **$** sells the next unowned vehicle. Purchases spawn outside the dealership and return on reload. Engine, brakes, and armor affect handling and damage. Mission unlocks, cash, owned models, upgrades, collected caches, stunt rewards, style, city time, and mute settings save locally; an interrupted contract restarts on Continue.

## Verification

`node main.ts` copies the game and captures to `/output` and writes the dossier with the unmodified kit library. For a restricted local environment, use `MAKEFUN_OUTPUT_DIR=/tmp/neon-harbor-output node main.ts`. No compilation or dependency installation is required. The four supplied screenshots are retained as requested.
