# Medieval Town Defense — project handoff

A medieval village-builder + tower-defence browser game prototype (inspired by Kingdom Rush and Age of Empires). Owner: Jack. He tests mostly on his phone (portrait and landscape) and also on desktop.

The whole game is currently one self-contained file: `index.html` (~165 KB, three.js r128 from cdnjs). It was built over ~37 iterations in a claude.ai chat and published as an artifact; this repo continues it in Claude Code.

## How to run
- Open `index.html` in a browser, or serve the folder: `npx serve .` / `python3 -m http.server`.
- To test on a phone: serve on the LAN, or enable GitHub Pages on the repo.
- Live build: https://jacktan98.github.io/Medieval-Town-Defense/ (GitHub Pages from `main` root; push to `main` to deploy).
- First real-WebGL playtest done 2026-10-27 (desktop, phone portrait/landscape): all building tiers, villager tools/poses, night waves, end screen render correctly.
- Debug: open `index.html?debug` and `window.G('code')` evaluates inside the game closure (e.g. `G('res.gold=9999')`, `G('PH.t=0')` to skip the day).

## Suggested next steps (not yet done)
1. ~~Verify rendering in a real browser~~ (done).
2. Split `index.html` into modules (e.g. `render/`, `models/`, `people/`, `sim/`, `ui/`) with a simple bundler (Vite), keeping a single-file build for easy sharing.
3. Replace the mock-based tests with real Playwright runs against the actual game.
4. Later: real art (model packs). Audio is wired up (see Audio below); it needs real files in `audio/music` and `audio/sfx`.
5. Open questions Jack hasn't answered: remove the gate plinth? should paths also speed up raiders (currently yes)? should farm output depend on number of farmers?

## Gameplay summary
- 28×28 grid of 2 m cells. Start: castle prebuilt in the middle, 3 villagers, gold 40, wood 45, stone 0, food 20.
- **Day/night**: 3 waves. Day 1 lasts 300 s, days 2–3 last 120 s (`DAYLEN=[300,120,120]`). Night ends when all enemies are dead. Summary screen at the end.
- **Repairs**: at dawn every damaged building gets a free `repair` site (`startRepairs`, time = build time × damage × `REPAIR_K` 1.2). A building's own workers repair it first (pausing their gathering; a farm whose farmers are all repairing pays no food), then idle villagers; HP climbs with progress.
- **Waves** (`WAVES`): 1 = 6 swords + 2 archers; 2 = 10 swords + 5 archers, hp ×1.2; 3 = 14 swords + 8 archers + captain, hp ×1.4. Enemy archer range 4.5.
- **Economy**: payouts every `TICK=20` s (ring in top panel). Each villager eats 1 food every `MEAL=20` s of daylight; hungry villagers go home and sleep.
- **Villagers**: live in houses/castle, take jobs, commute, walk to construction sites and build them before they work (`assignBuilders` every 0.5 s). At night they man the castle (priority) and towers; the rest hide in the castle.
- **Decor charm** boosts house gold within `CHARM_R=8`. Paths add `PATH_CHARM=.02` each (path bonus capped at +20%). Paths make everyone (including raiders) move ×1.6.

## Buildings (`DEF`)
| Type | Size | Cost | Upgrade T2 / T3 | Output / notes | Tier names |
|---|---|---|---|---|---|
| castle | 3×3 | prebuilt | stone 60 wood 40 gold 70 / stone 100 gold 100 | gold 3/5/7, food 3/4/5, 4 archer posts, 3 residents | Palisade fort / Stone keep / Castle |
| house | 1×1 | wood 15 | wood 25 gold 20 / wood 30 stone 20 gold 40 | gold 2/4/6, residents 2/3/4 | Hovel / Cottage / Townhouse |
| farm | 2×2 | wood 15 | wood 20 gold 20 / wood 30 stone 15 gold 35 | food 4/6/9, workers 1/1/2 | Plot / Croft / Manor farm |
| lodge ("Lumber camp") | 2×2 | gold 20 | gold 45 stone 10 / gold 75 stone 25 | reach 14, workers 2/3/4, `LUMBER_LOAD=2` wood/trip, chop 2.6 s | Lumber shack / Lumber camp / Lumber yard |
| quarry | 2×2 | gold 25 wood 10 | gold 45 wood 20 / gold 75 wood 30 | reach 16, workers 2/3/4 | Stone pit / Quarry / Masons' yard |
| tower | 1×1 | wood 15 gold 10 | wood 30 gold 30 / stone 40 gold 60 | 2 archers, dmg 7/9/12, range 11/13/15, shootY 3.4/3.8/5.4; T2 model scaled 0.74 | Lookout / Watchtower / Stone tower |
| wall | 1×1 | wood 5 gold 2 | stone 6 gold 3 / stone 10 gold 10 | drag-paint, auto-tiles, no plinth | Palisade / Stone wall / Battlement |
| gate | 1×1 | wood 15 gold 10 | stone 15 gold 20 / stone 25 gold 35 | auto-tiles with walls | Timber gate / Stone gate / Gatehouse |
| well | 1×1 | stone 5 | — | charm 0.25 | — |
| torch | ⅓ tile | wood 2 | — | charm 0.1, walkable, night light | — |
| flowers | 1×1 | gold 3 | — | charm 0.15, walkable | — |
| statue | 1×1 | stone 12 gold 10 | — | charm 0.35 | — |
| path | ⅓-tile strip | gold 1 | — | auto-connects, speed ×1.6 | — |

Build times (`BUILD_T`, builder-seconds): house 10, farm 10, lodge 12, quarry 14, tower 14, wall 3, gate 8, castle 24, well 5, torch 3, flowers 3, statue 8. Upgrades ×1.3.

Castle night posts: T1 = 4 small corner lookout platforms (y 2.55); T2 = wooden corner tower tops (y 3.55); T3 = keep + wall-walk.

## Technical notes
- **Colour**: `THREE.Color` setHex/setStyle/setHSL patched to convert sRGB→linear; renderer uses sRGBEncoding + ACES filmic, exposure 1.1. Overlays use `toneMapped:false`.
- **Terrain**: heightmap, 1 m vertex spacing (V=57). Placing a building snaps to cells, checks slope, flattens with smoothstep falloff, locks the footprint, lays a dirt splat, adds a plinth and clears trees. "Adapt terrain" is always on.
- **Auto-tiling**: bitmask N=1 E=2 S=4 W=8 for paths and walls/gates (`wallMask`, `refreshWalls`, `swapModel`).
- **Paths**: packed-earth tracks built from overlapping discs (centre + 3 per connected arm, radius wobbling by world position so neighbours agree): darker base layer for the worn edge, smooth position-based colour on top, and flat set stones (`pathStones` InstancedMesh; `frustumCulled=false` and `instanceColor` pre-sized, both needed in r128).
- **Pathfinding**: A* on cells (`findPath`, `cellPass`, `walkTo`), `clearLine` line-of-sight shortcuts, `unstick` after 3.5 s without progress, cache invalidated on any build/path change. `steer`/`turnTo` commit to one side round obstacles. Villagers enter/exit buildings via their door.
- **Villager states**: wander, visit, commute, find, go, work, home, drop, building, hungry/sleeping, night posts.
- **Shaders (`onBeforeCompile`)**: tree wind sway, procedural ground detail, masonry (running-bond + mortar) on `M.stone`/`M.stone2`, flag wave anchored on position x, hanging banners (`M.drape`) anchored at the top. `tinted()` copies `onBeforeCompile` onto clones.
- **Stone bases**: every plinth fills its footprint exactly (2 m per tile), so neighbours meet edge to edge. `snapToNeighbours` (called from `evaluate`) sets a new stone-based building's target height so its plinth top (`PLINTH_TOP`) is flush with an edge-sharing neighbour's, if within 0.8 m; the masonry shader is world-space, so joints run straight across.
- **Farm obstacles**: `FARM_OBST` per tier (hut, hay, scarecrow, barn, stooks); `canStand` rejects them although farms are walkable.
- **Tree cutaway**: `cutaway(sh)` on trunk/crown materials dither-discards trees near the camera→`target` sightline (shadows unaffected).
- **Instancing**: trees (instanceColor), clutter (320 tufts, pebbles, bushes) hidden on occupied/path cells. Lone trees within 12 m of the castle, forest 12–18 m.
- **Lights**: pool of 4 PointLights shared by night lamps; gradient sky dome.
- **Sprites**: HP/progress bars (`fg.center.x=.5/f` trick); floating SVG icon pop-ups for income (`floatRes`).
- **People**: `makePerson` → arms on pivots (angle 0 = hanging, −1.57 = forward, −3 = overhead). Tools come from `makeTool(kind)` and are parented to the hand (`arms[1]`; bow on `arms[0]`); `giveTool(v,kind)`. Task poses are all one-handed (the single-segment arms can't both reach one handle; the free arm steadies): axe overhead chop, pick overhead strike, hoe bent low, hammer; log on right shoulder with the hand resting on it, stone held at chest in both hands. Axe and hoe heads sit on the local −z side so they lead the swing / face the soil. Bow is a gentle C (arc segments). Outfits via `OUTFIT`/`dress()`: lumberjack round green wool cap with rolled brim + red feather, mason soft grey cloth bonnet on a leather band + leather apron, farmer straw hat, builder blue smock + red felt hat + tool belt.
- **Ambient**: bird flocks every 45–95 s (scale 0.55, half circle), waving flags.

## Audio
- Event → file map in `SND` (effects, decoded) and `LOOPS` (theme music and birdsong, streamed through `<audio>` + MediaElementSource). File names are the owner's (e.g. `Woodcutter_axe.mp3`); see `audio/*/README.md`.
- Levelling as in medieval-td: each decoded clip gets gain = `TARGET_LOUD` (0.09) × trim ÷ RMS of its loudest 0.3 s, clamped to [0.1, 6] and to a peak ceiling of 0.95 at the output (`MASTER` 0.9). Trims follow medieval-td where the sounds match (click/attack .445, arrow .889, sold .7, hammer .668, axe .736).
- `strikes: true` clips (axe, pick, hammer, hoe) are long recordings; `strikes()` cuts single strikes at onsets (10 ms envelope > 25% of peak after 80 ms quiet), each levelled on its own; one random cut plays per tool impact (swing sine passing +0.85).
- Loops can't be measured at load; their `vol` was measured offline (theme 0.254, birds 0.214 loudest-0.3 s RMS) to sit ~6 dB / ~10 dB under effects. Re-measure if the files change.
- Theme loops day and night; birds by day only; `Victory_sound`/`Defeat_sound` stop the loops and play once. `attack` (two takes, never the same twice) on raider melee strikes. No file yet for nightfall, upgrade or raider-hit; those events are silent.
- Audio starts on the first tap/key. Mute (`#muteBtn`, key M) persists in localStorage; audio pauses when the tab is hidden. Audio state uses `var` because `sfx()`/`setMusic()` run during the startup reset.

## UI
- **Top panel**: sun/moon + phase, 20 s payout ring, "Skip day", resource chips (green idle badge on villagers), collapsible short "Town log".
- **Bottom dock**: Economy / Defences / Decor tabs, Select + Grid buttons, tool tiles with SVG icons (`TOOL_ICON`), building card (HP bar, `STAT()` chips, Upgrade/Demolish).
- **Pause** (top right): Resume, Full screen (fallback "Not available here"), Restart (tap twice within 3 s). No building while paused.
- **Admin** (bottom right; under Pause on phone): resource inputs (+100/+1k, Fill all 9,999), Finish all building, Instant build, +5 villagers, Skip to night; speed 1×/2× (scales game-logic dt).
- Landscape layout under `@media (max-height:520px)`. Two-finger twist rotates (`yaw += da`), drag pans, pinch zooms.
- Tap selection is strict while a build tool is active (`pickBuilding(e, strict)`: hit must be 0.35 m inside the footprint, ignores AO planes) so you don't keep selecting the castle.

## Gotchas fixed before (don't reintroduce)
- `var paused` (not `let`) — TDZ crash on startup.
- Global `[hidden]{display:none!important}` — otherwise flex modals ignore `hidden`.
- Restart confirm needs `resetArmed && ...` guard.
- Flag waves must anchor on position, not uv (uv tore between box faces).
- `randomNear` targets must not land inside a building footprint (villagers stalled at the castle gate).
- `evaluate` rejects solid buildings on another building's door cell (villagers exiting got snapped back into a blocked door forever). Flowers/torch/gate are still allowed.
- The file must keep `<!doctype html>`, `<meta charset>` and the viewport meta (the claude.ai artifact wrapper used to add them; without them phones render zoomed-out and arrows show as mojibake).

## Tools in `tools/` (from the old workspace)
- `tools/mock/mock.js`: Proxy-based THREE mock used for headless Playwright logic tests (`window.T` hook). Scripts in `tools/mock/*.js` are examples; they were run against a generated `test.html`.
- `tools/preview/mini3d.js` + `models.js` + `people.js`: a tiny canvas renderer for PNG previews of building tiers and villager poses (`gallery.html`, `castle.html`, `farm.html`, `poses.html`). With real three.js available these are mostly obsolete.
- `tools/preview/*.png`: last preview renders for reference.
