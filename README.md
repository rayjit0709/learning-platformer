# Learning Platformer

A free browser platformer for children (about ages 3 to 15) where learning is the gameplay.
French first, English switch, Tamil oral practice. No accounts, no tracking.

## Run it on your computer
1. Install Node.js 20.19 or newer (https://nodejs.org).
2. In a terminal, open this folder and run `npm install` (once).
3. Run `npm run dev`, then open the address it prints (usually http://localhost:5173).
4. To test touch buttons on a computer, add `?touch=1` to the address.

Controls: arrow keys or A/D to move, Up / W / Space to jump. Touch: big buttons on screen.

## Put it online
See `DEPLOY.md` (GitHub + Netlify, step by step).

## Adding or editing questions
Questions are plain text files in `public/content/<level>/<subject>/`. The current one is
`public/content/primaire-c2/math/addition-subtraction.json`. To add a new set, copy
`public/content/_template.json`, rename it and edit it. Each question has a prompt, 2 to 4 choices,
the position of the right answer (`0` = first choice), a hint, and a difficulty from 1 to 3, with French and English text.

After any change, run `npm run content`. It checks every question file and lists mistakes in plain words.
It also runs automatically before every build, so a broken file can never be published by mistake.
Set `"reviewed": true` in a file's `meta` once a teacher or parent has checked it.

## Levels
- The recipe for each level (number of questions, gap width, colours, how hard the questions and words are) is the `LEVELS` list in `src/game/levelData.js`. Which vocabulary category counts as easy or hard is `WORD_TIERS` in `src/config/subjects.js`.
- Stars: 3 = every question right at the first try, 2 = at least half, 1 = finished the level. Progress is saved in `localStorage` (`lp.progress.v1`); profiles in M4 will split it per child.

## Recording the words (voice recorder)
1. Run `npm run dev` and open `http://localhost:5173/recorder.html` (the microphone only works on `localhost` or an `https` address, so not on a phone through the Wi-Fi address). On the public site, `/recorder.html` also works on a phone, but it only lists the 30 starter words (the class pack stays private).
2. A native speaker records each word (Record, say it alone, Stop, Listen, Erase and redo if needed). Clips stay in that browser until downloaded.
3. Press "Download the recordings (.zip)", then in the project folder run `unzip -o ~/Downloads/recordings.zip -d public` and restart `npm run dev`. Class-pack words go to the private pack folder; starter words go to `public/audio/ta/` (those can be pushed to GitHub).
4. Files are WAV (16 kHz, mono). An `.mp3` with the same name wins over a `.wav` if you prefer to convert them.

## Culture facts
- `public/content/culture/facts.json` holds the "Did you know?" cards: `level` (1 to 5), `fr`, `en`, `sources` (web addresses) and `status`. Keep each text under about 330 characters so it fits the card. After a win, a fact for that level not yet shown on this device appears first.
- All facts are marked "to be verified": they were checked against the listed web sources, but please have someone who knows the topic read them before the game is shared widely.
- The look of each level lives in `src/game/backdrops.js` (colours and shapes per theme).

## Tamil mode
- Vocabulary lists live in `public/content/**/vocab.json` (or `starter-vocab.json`). Each word has Tamil script, Latin spelling, French, English, a category, and `"status": "to be verified"` until a native speaker checks it.
- `public/content/tamil/starter-vocab.json` (30 words) is public. The class material in `public/content/packs/tamil-class/` is **private**: it is in `.gitignore`, so it only works on your computer (`npm run dev`) and never reaches GitHub or the public link. The public link falls back to the 30 starter words.
- To try it on a phone at home: `npm run dev -- --host`, then open the "Network" address it prints (same Wi-Fi).
- Recordings: put an mp3 named after the word id in `public/audio/ta/<id>.mp3` (public) or `public/content/packs/<pack>/audio/<id>.mp3` (private, wins if both exist). Words with a recording get a speaker button, play automatically, and gain a "listen and choose" question. Words without one still work.
- Run `npm run content` after editing: it checks the files and reminds you what is still unverified.

## Handy address options (for testing)
- `?hero=girl` forces the girl character; `?lang=en` forces English (normally the start screen remembers your choice); `?touch=1` shows the touch buttons on a computer. Combine them with `&`, for example `?lang=en&hero=girl`.

## Music
`src/assets/music/theme.mp3` is an original 16-bar loop composed in code: `python3 tools/make-music.py` re-creates it (needs Python, numpy and ffmpeg).
To use your own track instead, replace that file with another mp3 of the same name.

## Tech
Phaser 4 (game engine), Vite (dev server and build), plain JavaScript.

## What's built / what's next
- [x] **M1** Moving, jumping character; keyboard and touch controls; scrolling level; respawn when falling
- [x] **M1.1** Original boy and girl characters (add `?hero=girl` to the address for the girl; the profile picker comes in M4)
- [x] **M2** Higher jump, 20 coins, score, 3 lives (hearts), flag at the end, win / try-again screen, French and English texts (`?lang=en`)
- [x] **M3** Four question stations (answer blocks + gate), 15 Cycle 2 math questions in JSON (fr/en), hints and retry without penalty, checkpoints, content validator
- [x] **M3.1** Start screen: choose the boy or girl character, FR/EN switch, Play; original music loop with an on/off button (also key M); choices remembered on the device
- [x] **T1** Tamil mode: choose "Tamoul" on the start screen. Questions are generated from vocabulary lists (Tamil script + Latin spelling): "what does it mean?", "how do you say it in Tamil?", and "listen and choose" when a recording exists. Everything Tamil is marked "to be verified"
- [x] **L1** Levels: 5 levels per subject (more questions, wider gaps, new colours, harder words as you go). Win 1 to 3 stars from first-try answers; 2 stars open the next level. Level-select screen, best stars saved on the device (add `?unlock=1` to the address to open every level when testing)
- [x] **S1** South Indian look, all drawn in code: village and paddy fields, temple town with gopurams, sea coast, hills and tea gardens, night of oil lamps (one per level); temple-style striped borders on the ground
- [x] **C1** "Did you know?" card after each win (Tamil and Dravidian culture and history, three facts per level in French and English, with sources, shown in turn; including Sri Lankan (Eelam) Tamil culture and history)
- [x] **T2** Voice recorder: open `recorder.html` (on your computer: `http://localhost:5173/recorder.html` while `npm run dev` runs). It shows each word, you press Record, say it, press Stop; it trims the silence and keeps the clip on the device. "Download" gives a `recordings.zip` to unzip into `public`; words with a recording then get a speaker button and "listen and choose" questions
- [ ] T3 More Tamil game types: matching, listen-and-repeat, "Jacques a dit" commands level
- [ ] T4 Pictures for the words (original art or free-licensed packs)
- [ ] M4 Full home screen: level, subject, language, FR/EN switch, 2-5 profiles
- [ ] M5 Four school bands (Maternelle, Cycle 2, Cycle 3, Collège) with their own difficulty and theme
- [ ] M6 French and English content, read-aloud (on/off)
- [ ] M8 Stars, badges, saved progress, sound and music, PWA (installable, offline), final deploy

## Project notes
- `src/config/constants.js` holds screen size and player feel (speed, jump).
- `src/game/levelData.js` holds the level layout (platforms, coins, flag) as plain data.
- `src/content/` picks and prepares questions; `src/game/QuestionStation.js` is one question in the level.
- `src/i18n/` holds the interface texts (`fr.json`, `en.json`).
- `public/content/packs/` is private class material and is excluded from Git on purpose.
