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
  const type = Array.isArray(data.entries) ? 'vocab' : Array.isArray(data.questions) ? 'questions' : null;
  if (!type || !data.meta || !data.meta.subject) {
    console.log(`  skipped ${path}: needs "entries" or "questions" and a "meta.subject"`);
    continue;
  }
  const pack = path.startsWith('content/packs/') ? path.split('/')[2] : null;
  files.push({ path, type, subject: data.meta.subject, pack });
}

// Word recordings: public/audio/ta/<id>.mp3, and <pack>/audio/<id>.mp3 inside a pack (the pack wins).
const audio = {};
function addAudio(folder, urlBase) {
  if (!existsSync(folder)) return;
  for (const name of readdirSync(folder)) {
    if (name.endsWith('.mp3')) audio[name.slice(0, -4)] = `${urlBase}/${name}`;
  }
}
addAudio(join(PUBLIC_DIR, 'audio', 'ta'), 'audio/ta');
const packsDir = join(CONTENT_DIR, 'packs');
if (existsSync(packsDir)) {
  for (const pack of readdirSync(packsDir)) addAudio(join(packsDir, pack, 'audio'), `content/packs/${pack}/audio`);
}

writeFileSync(join(CONTENT_DIR, 'index.json'), JSON.stringify({ version: 1, files, audio }, null, 1));
console.log(`Content index: ${files.length} file(s), ${Object.keys(audio).length} recording(s).`);
