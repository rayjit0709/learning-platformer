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

## Handy address options (for testing)
- `?hero=girl` plays the girl character; `?lang=en` shows English; `?touch=1` shows the touch buttons on a computer. Combine them with `&`, for example `?lang=en&hero=girl`.

## Tech
Phaser 4 (game engine), Vite (dev server and build), plain JavaScript.

## What's built / what's next
- [x] **M1** Moving, jumping character; keyboard and touch controls; scrolling level; respawn when falling
- [x] **M1.1** Original boy and girl characters (add `?hero=girl` to the address for the girl; the profile picker comes in M4)
- [x] **M2** Higher jump, 20 coins, score, 3 lives (hearts), flag at the end, win / try-again screen, French and English texts (`?lang=en`)
- [ ] M3 Math answer blocks from JSON, hints, retry
- [ ] M4 Home screen: level, subject, language, FR/EN switch, 2-5 profiles
- [ ] M5 Four school bands (Maternelle, Cycle 2, Cycle 3, Collège) with their own difficulty and theme
- [ ] M6 French and English content, read-aloud (on/off)
- [ ] M7 Tamil oral mode: class pack (private) + 30-word starter list, all "to be verified"
- [ ] M8 Stars, badges, saved progress, sound and music, PWA (installable, offline), final deploy

## Project notes
- `src/config/constants.js` holds screen size and player feel (speed, jump).
- `src/game/levelData.js` holds the level layout (platforms, coins, flag) as plain data.
- `src/i18n/` holds the interface texts (`fr.json`, `en.json`).
- `public/content/packs/` is private class material and is excluded from Git on purpose.
