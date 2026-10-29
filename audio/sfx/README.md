# Sound effects

| File | When it plays |
|---|---|
| `Click_sound.mp3` | Any button, and placing a building or wall |
| `Building_built.mp3` | A building finishes, an upgrade finishes, a repair finishes (softer) |
| `Building_sold.mp3` | You demolish a building |
| `Building_destroyed.mp3` | Raiders destroy a building |
| `Coins_payout.mp3` | Every 20 s payout |
| `Arrow_shot.mp3` | Any archer shoots (yours or the raiders') |
| `Attack_1.mp3`, `Attack_2.mp3` | A raider strikes a building; one of the two at random, never the same twice running |
| `Woodcutter_axe.mp3` | One chop per axe swing (single strikes are cut out of the recording automatically) |
| `Mason_pick.mp3` | One hit per pick swing (cut the same way) |
| `Farmer_hoe.mp3` | One stroke per hoe swing |
| `Building_with_hammer.mp3` | One knock per hammer swing (cut the same way) |
| `Path_placed.mp3` (not supplied yet) | A path tile is laid; until it exists a soft hoe stroke plays instead |
| `Bird_chirping.mp3` | Loops softly during the day, stops at night |

**Volume balance:** every clip is measured when it loads (loudness of its loudest 0.3 s) and brought to one
common level, then trimmed by how prominent it should be, like medieval-td. So re-uploading a file at a
different recording level needs no code change. World sounds also get quieter the further they are from
where the camera looks. To add or rename a sound, edit the `SND` table in `index.html`.

`Bird_chirping.m4a` is a compressed copy of `Bird_chirping.mp3` for faster phone loading; if you replace the `.mp3`, delete the `.m4a` too.
