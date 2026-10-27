# Music

Drop background music here. The game finds files **by name**, so no code changes are needed.

| File name | When it plays |
|---|---|
| `day` | During the day (loops) |
| `night` | During a raid (loops; falls back to `day` if missing) |
| `victory` | Once, when all three waves are defended |
| `defeat` | Once, when the castle falls |

Formats: `.mp3` (recommended), `.ogg` or `.wav`, e.g. `day.mp3`.
Keep each file small (under ~3 MB) so the game loads quickly on phones.
Missing files are simply silent.
