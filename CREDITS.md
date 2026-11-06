# Credits

Platform shapes and touch buttons are drawn by code. No third-party assets yet.

| Asset | Author | License | Source |
|-------|--------|---------|--------|
| Music loop `theme-tamil.mp3` (`src/assets/music/`): original piece in raga Mohanam, flute / veena / tanpura / drum imitated by synthesis | Original, composed and synthesized by Claude (Anthropic) with `tools/make-music-tamil.py` | Free to use in this project | Own work; the scale is a standard Carnatic raga, the melody is new; no samples or third-party recordings |
| Earlier music loop `theme.mp3` (no longer used) | Original, composed and synthesized by Claude (Anthropic) with `tools/make-music.py` | Free to use in this project | Own work; no samples or third-party recordings |
| Backgrounds and ground borders (`src/game/backdrops.js`): palms, huts, gopurams, boats, hills, oil lamps | Original, drawn in code by Claude (Anthropic) at the owner's request | Free to use in this project | Own work; generic shapes inspired by South Indian scenery, not copied from any artwork |
| Boy and girl characters (`src/assets/heroes/`) | Original drawings made for this project by Claude (Anthropic) at the owner's request | Free to use in this project | Own work; not copied from any other artwork |

Software: Phaser (MIT), Vite (MIT), Noto Sans Tamil font via @fontsource/noto-sans-tamil (SIL Open Font License 1.1, Google / Noto Project).

Culture facts (`public/content/culture/facts.json`) are short summaries written for this project; each lists the web pages it was checked against (Britannica, Wikipedia, and travel/culture pages).

Spoken Tamil clips made with `tools/make-voices.js` use Microsoft Azure neural text to speech (voices ta-IN-PallaviNeural and ta-LK-SaranyaNeural). They are synthetic (AI-generated) voices, not recordings of a person, and are still to be checked by a Tamil speaker.
