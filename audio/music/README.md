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
