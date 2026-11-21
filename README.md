# Neon Harbor

Neon Harbor is an original coastal crime adventure for the make.fun gta6-01 competition. Take on eight connected contracts, borrow a ride, evade patrols, and explore four neighborhoods: Downtown, Old Town, the Docks, and the Beachfront. Five vehicle classes, traffic, pedestrians, fares, caches, and stunt ramps keep the streets busy between jobs.

[![Make.fun — gta6-01](https://make.fun/badge/gta6-01.svg)](https://make.fun/bounty/gta6-01)
[![Neon Harbor rank](https://make.fun/badge/gta6-01/Jsmile19/neon-harbor/rank.svg)](https://make.fun/bounty/gta6-01)
[![Neon Harbor reward](https://make.fun/badge/gta6-01/Jsmile19/neon-harbor/reward.svg)](https://make.fun/bounty/gta6-01)

The game uses a Canvas 2D renderer and synthesizes its music and effects with WebAudio. All runtime files live in `game/`. No dependency installation, compilation, remote assets, or internet connection is needed when playing through a local static server.

## Launch

Use Node 22 or newer from the repository root:

```sh
node serve.ts
```

Open <http://localhost:8080> in desktop Chrome. Alternatively, serve `game/` with any static web server. Enter begins the story or continues a local save; H opens the guide. N on the title screen clears the save for a fresh start.

## Controls

| Key or gesture | Use |
| --- | --- |
| WASD / arrows | Walk; accelerate, steer, brake, and reverse in a vehicle |
| E | Enter or leave a nearby vehicle; interact with services on foot |
| Space | Handbrake and drift in a vehicle; jump on foot |
| Shift | Sprint on foot |
| Mouse drag | Look around the player |
| R | Recover the player and vehicle to the nearest junction |
| Esc | Pause, resume, or leave a result screen for free roam |
| M | Mute or restore audio |
| Enter | Start, continue, retry, or begin the next contract |
| H | Show or close the controls and city guide |
| N on the title | Remove saved progress |

## The story

1. **First Wheels:** drive the sedan to the marina overlook.
2. **Courier Run:** finish three deliveries before the deadline.
3. **Getaway Driver:** pick up Nia and shake her pursuers.
4. **Dockside Deal:** collect the crane-side package on foot, then drive to safety.
5. **Night Chase:** reach the west gate and escape a three-star search.
6. **The Exchange:** deliver fragile cargo on time without a hard impact.
7. **Harbor Heist:** steal the guarded red Vesper GT and deliver that vehicle to the pier.
8. **King of the Harbor:** clear the checkpoint, make the harbor drop, and escape the final pursuit.

Gold beacons, an arrow, and the minimap route point toward your current objective. Slow down for parcel stops and passenger pickups. Escape stages finish after the wanted stars clear. Enter retries a failed contract. The city remains open after the final job.

## Life around the harbor

Collect twenty cyan caches for $250 each. Stop a taxi at the amber FARE marker, carry its passenger to the destination, and earn $400. Approach the five east-facing ramps at speed: each first successful landing pays $300 and awards 250 style points. Fast handbrake slides also increase style.

Vehicle theft, collisions, and speed traps attract police. Patrols pursue and ram; five wanted stars bring roadblocks. Put distance or buildings between yourself and the patrol to let the search cool down.

On the map, **H** marks the free clinic, **G** the garage, and **$** the dealership. Use these services on foot. The garage installs $450 upgrades in order: three engine levels, three brake levels, then three armor levels. The dealership sells the next unowned model and parks purchases outside; owned purchases return after a reload. Vehicle classes have distinct speed and handling, and upgrades affect acceleration, braking, and crash damage.

## Saved progress

Browser local storage keeps contract unlocks, cash, owned models, upgrades, cache collection, completed stunts, style, city time, and mute settings. An interrupted contract restarts when you continue. Saves stay on the current browser and origin.

## Hand-in

`node main.ts` copies `game/` and the four existing screenshots to `/output`, then writes `dossier.json` with the unchanged make.fun kit library. A writable local destination can be selected explicitly:

```sh
MAKEFUN_OUTPUT_DIR=/tmp/neon-harbor-output3 node main.ts
```

Packaging preserves the existing screenshot files. It does not capture or regenerate them.
