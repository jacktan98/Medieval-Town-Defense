# Music

| File | When it plays |
|---|---|
| `Medieval_theme_music.mp3` | Loops during the day |
| `Night_theme_music.mp3` | Loops at night, while raiders attack (the day theme plays if it's missing) |
| `Victory_sound.mp3` | Once, when all three waves are defended (the theme stops) |
| `Defeat_sound.mp3` | Once, when the castle falls (the theme stops) |

File names are set in the `SND` and `LOOPS` tables in `index.html` (search for `// ---------- audio`).
Short clips are levelled automatically when they load. The theme streams, so its volume is a fixed
number in `LOOPS` (measured once); if you replace it with a much louder or quieter track, ask to re-measure.

**Phone loading:** the long loops also have a compressed `.m4a` copy (AAC 96 kbps, about 60% smaller) that the game loads first so music starts sooner on phones; the `.mp3` is used if the copy is missing. If you replace a loop's `.mp3`, delete its `.m4a` (or ask to regenerate it), or the old copy keeps playing.
