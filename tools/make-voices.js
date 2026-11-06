// Makes spoken clips of the Tamil words with Microsoft Azure's neural voices:
//   in = Pallavi (Tamil as spoken in India, ta-IN), lk = Saranya (Tamil as spoken in Sri Lanka, ta-LK), both female.
// It reads the Tamil script of every word (ta-Taml), so the voice pronounces real Tamil letters.
//
// You need a free Azure "Speech" resource: its key and region go in two environment variables
// (they stay on your computer; never put them in a file of the project):
//   export AZURE_SPEECH_KEY="..."        export AZURE_SPEECH_REGION="francecentral"
// Run:  node tools/make-voices.js            (all words, both voices; clips that already exist are skipped)
// Options:
//   --dry-run            show what would be made, without calling Azure (no key needed)
//   --voices=in          only one voice (in, lk or in,lk)
//   --only=naai,nee      only these word ids
//   --force              make the clips again even if they exist
//   --rate=-15%          speaking speed (default -15%: a little slower, easier for learners)
//   --out=<folder>       write into another "public" folder (for tests)
// Output: public/audio/ta/<voice>/<id>.mp3 (public words) and public/content/packs/<pack>/audio/<voice>/<id>.mp3 (private pack).
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { PUBLIC_DIR, walkContent, publicPath } from '../scripts/content-lib.js';

const VOICES = {
  in: { name: 'ta-IN-PallaviNeural', lang: 'ta-IN' },
  lk: { name: 'ta-LK-SaranyaNeural', lang: 'ta-LK' },
};

const args = Object.fromEntries(process.argv.slice(2).map((a) => {
  const [k, v] = a.replace(/^--/, '').split('=');
  return [k, v ?? true];
}));
const dryRun = Boolean(args['dry-run']);
const force = Boolean(args.force);
const rate = typeof args.rate === 'string' ? args.rate : '-15%';
const outDir = typeof args.out === 'string' ? args.out : PUBLIC_DIR;
const voiceIds = (typeof args.voices === 'string' ? args.voices.split(',') : Object.keys(VOICES)).filter((v) => VOICES[v]);
const only = typeof args.only === 'string' ? new Set(args.only.split(',')) : null;
const delayMs = Number(args.delay) || 700; // a pause between requests keeps us under the free plan's rate limit

const key = process.env.AZURE_SPEECH_KEY;
const region = process.env.AZURE_SPEECH_REGION;
const endpoint = process.env.AZURE_SPEECH_ENDPOINT || `https://${region}.tts.speech.microsoft.com/cognitiveservices/v1`;

if (voiceIds.length === 0) fail('No valid voice. Use --voices=in, --voices=lk or --voices=in,lk');
if (!dryRun && (!key || (!region && !process.env.AZURE_SPEECH_ENDPOINT))) {
  fail('Set AZURE_SPEECH_KEY and AZURE_SPEECH_REGION first (see the comment at the top of this file), or add --dry-run.');
}

function fail(message) {
  console.error(`\n${message}\n`);
  process.exit(1);
}

// The words, with the same duplicate rule as the game (a class-pack word wins over the same starter word)
function loadWords() {
  const entries = [];
  for (const file of walkContent()) {
    let data;
    try { data = JSON.parse(readFileSync(file, 'utf8')); } catch (e) { continue; }
    if (!Array.isArray(data.entries) || data.meta?.subject !== 'tamil') continue;
    const path = publicPath(file);
    const pack = path.startsWith('content/packs/') ? path.split('/')[2] : null;
    entries.push(...data.entries.map((e) => ({ ...e, pack })));
  }
  entries.sort((a, b) => Number(Boolean(b.pack)) - Number(Boolean(a.pack)));
  const seen = new Set();
  return entries.filter((e) => {
    const k = `${e['ta-Latn'].toLowerCase()}|${e.fr.toLowerCase()}`;
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}

const escapeXml = (s) => s.replace(/[<>&'"]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' }[c]));

function ssml(text, voice) {
  return `<speak version='1.0' xml:lang='${voice.lang}'><voice xml:lang='${voice.lang}' name='${voice.name}'><prosody rate='${rate}'>${escapeXml(text)}</prosody></voice></speak>`;
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function synthesize(text, voice) {
  for (let attempt = 1; attempt <= 5; attempt += 1) {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Ocp-Apim-Subscription-Key': key,
        'Content-Type': 'application/ssml+xml',
        'X-Microsoft-OutputFormat': 'audio-24khz-48kbitrate-mono-mp3',
        'User-Agent': 'learning-platformer-voices',
      },
      body: ssml(text, voice),
    });
    if (response.ok) return Buffer.from(await response.arrayBuffer());
    if (response.status === 401 || response.status === 403) fail(`Azure refused the key (HTTP ${response.status}). Check AZURE_SPEECH_KEY and AZURE_SPEECH_REGION.`);
    if ((response.status === 429 || response.status >= 500) && attempt < 5) {
      const wait = (Number(response.headers.get('retry-after')) || attempt * 3) * 1000;
      console.log(`    busy (HTTP ${response.status}), waiting ${wait / 1000} s...`);
      await sleep(wait);
      continue;
    }
    throw new Error(`HTTP ${response.status} ${(await response.text()).slice(0, 200)}`);
  }
  throw new Error('too many retries');
}

const words = loadWords().filter((w) => !only || only.has(w.id));
const jobs = [];
let skippedNoScript = 0;
for (const w of words) {
  if (!w['ta-Taml']) { skippedNoScript += 1; continue; }
  for (const id of voiceIds) {
    const folder = w.pack ? join(outDir, 'content', 'packs', w.pack, 'audio', id) : join(outDir, 'audio', 'ta', id);
    jobs.push({ word: w, voiceId: id, file: join(folder, `${w.id}.mp3`) });
  }
}
const todo = jobs.filter((j) => force || !existsSync(j.file));
console.log(`${words.length} word(s), voices: ${voiceIds.map((v) => VOICES[v].name).join(', ')}, speed ${rate}.`);
console.log(`${jobs.length} clip(s) in total, ${jobs.length - todo.length} already exist, ${todo.length} to make.`);
if (skippedNoScript > 0) console.log(`${skippedNoScript} word(s) skipped: no Tamil script ("ta-Taml") to read.`);

if (dryRun) {
  todo.slice(0, 8).forEach((j) => console.log(`  would make ${j.voiceId}/${j.word.id}: ${j.word['ta-Taml']}`));
  if (todo.length > 8) console.log(`  ... and ${todo.length - 8} more.`);
  process.exit(0);
}

let made = 0;
const failed = [];
for (const [i, job] of todo.entries()) {
  try {
    const audio = await synthesize(job.word['ta-Taml'], VOICES[job.voiceId]);
    mkdirSync(dirname(job.file), { recursive: true });
    writeFileSync(job.file, audio);
    made += 1;
    console.log(`[${i + 1}/${todo.length}] ${job.voiceId}/${job.word.id} ✓`);
  } catch (e) {
    failed.push(`${job.voiceId}/${job.word.id}`);
    console.log(`[${i + 1}/${todo.length}] ${job.voiceId}/${job.word.id} FAILED: ${e.message}`);
  }
  await sleep(delayMs);
}
console.log(`\nDone: ${made} clip(s) made${failed.length ? `, ${failed.length} failed (${failed.join(', ')}). Run the same command again to retry them.` : '.'}`);
console.log('Next: run "npm run dev", listen in the game, and have a Tamil speaker check the clips.');
