// Writes public/content/index.json: the list of content files the game can use
// and the word recordings that exist. Runs automatically before "npm run dev" and "npm run build".
// Because it only lists what is really present, the private class pack simply does not
// appear in a build made without it.
import { readFileSync, readdirSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { CONTENT_DIR, PUBLIC_DIR, walkContent, publicPath } from './content-lib.js';

const files = [];
for (const full of walkContent()) {
  const path = publicPath(full);
  let data;
  try {
    data = JSON.parse(readFileSync(full, 'utf8'));
  } catch (e) {
    console.log(`  skipped ${path}: not valid JSON`);
    continue;
  }
  const type = Array.isArray(data.entries) ? 'vocab' : Array.isArray(data.questions) ? 'questions' : Array.isArray(data.facts) ? 'facts' : null;
  if (!type || !data.meta || !data.meta.subject) {
    console.log(`  skipped ${path}: needs "entries", "questions" or "facts" and a "meta.subject"`);
    continue;
  }
  const pack = path.startsWith('content/packs/') ? path.split('/')[2] : null;
  files.push({ path, type, subject: data.meta.subject, pack });
}

// Word recordings, grouped by voice: "in" (generated Indian Tamil voice), "lk" (generated Sri Lankan Tamil voice)
// and "family" (recorded by a person, with the recorder page).
// Layout: <audio folder>/<voice>/<id>.mp3 or .wav. Files placed directly in the folder count as "family".
// The audio folders are public/audio/ta and <pack>/audio. A pack's file wins over a public one for the same voice and word.
// Inside one folder, an .mp3 wins over a .wav of the same word.
const VOICES = ['in', 'lk', 'family'];
const audio = Object.fromEntries(VOICES.map((v) => [v, {}]));
function readVoiceFolder(folder, urlBase, voice) {
  if (!existsSync(folder)) return;
  const found = {};
  for (const name of readdirSync(folder)) {
    const match = name.match(/^(.+)\.(mp3|wav)$/);
    if (match && !(match[2] === 'wav' && found[match[1]]?.endsWith('.mp3'))) found[match[1]] = `${urlBase}/${name}`;
  }
  Object.assign(audio[voice], found);
}
function addAudio(folder, urlBase) {
  readVoiceFolder(folder, urlBase, 'family');
  for (const voice of VOICES) readVoiceFolder(join(folder, voice), `${urlBase}/${voice}`, voice);
}
addAudio(join(PUBLIC_DIR, 'audio', 'ta'), 'audio/ta');
const packsDir = join(CONTENT_DIR, 'packs');
if (existsSync(packsDir)) {
  for (const pack of readdirSync(packsDir)) addAudio(join(packsDir, pack, 'audio'), `content/packs/${pack}/audio`);
}

writeFileSync(join(CONTENT_DIR, 'index.json'), JSON.stringify({ version: 2, files, audio }, null, 1));
const counts = VOICES.map((v) => `${v}: ${Object.keys(audio[v]).length}`).join(', ');
console.log(`Content index: ${files.length} file(s); recordings per voice (${counts}).`);
