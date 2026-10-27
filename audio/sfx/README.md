# Sound effects

Drop short sound effects here. The game finds files **by name**, so no code changes are needed.

| File name | When it plays |
|---|---|
| `click` | Any button press, and placing a building or wall |
| `build` | A building finishes construction |
| `upgrade` | An upgrade finishes |
| `chop` | Woodcutter's axe strike |
| `pick` | Mason's pick strike |
| `hoe` | Farmer's hoe stroke |
| `hammer` | Builder's hammer strike |
| `coins` | Every 20 s payout |
| `arrow` | An archer shoots (yours or the raiders') |
| `hit` | A raider or building is hit |
| `destroyed` | A building is destroyed by raiders |
| `horn-night` | Nightfall, when raiders approach |

Formats: `.mp3` (recommended), `.ogg` or `.wav`, e.g. `chop.mp3`. Keep them short (under 1 s for strikes and hits).
World sounds get quieter the further they are from where the camera looks. Missing files are simply silent.
