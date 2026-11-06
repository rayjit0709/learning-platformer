import '@fontsource/noto-sans-tamil/tamil-400.css';
import '@fontsource/noto-sans-tamil/tamil-700.css';
import { INDEX_URL, assetUrl } from '../config/content.js';
import { dedupe } from '../content/contentLoader.js';
import { setSetting } from '../services/settings.js';
import { currentLang, t, localized } from '../i18n/index.js';
import { blobToWav } from './wav.js';
import { makeZip } from './zip.js';
import * as store from './store.js';

const MAX_SECONDS = 6; // a word never needs longer
const $ = (id) => document.getElementById(id);

let words = []; // [{ id, taml, latn, fr, en, note, pack, category }]
let recordings = new Map(); // word id -> WAV blob
let inGame = {}; // word id -> address of a recording already used by the game
let index = 0;
let recorder = null; // the running MediaRecorder, if any
let audio = null; // what is playing
let status = { text: '', kind: '' };

// ---------- loading the word list (same files and same duplicate rule as the game) ----------
async function loadWords() {
  const list = await (await fetch(INDEX_URL)).json();
  inGame = (list.audio && list.audio.family) || {}; // clips recorded by a person (not the generated voices)
  const entries = [];
  for (const file of list.files.filter((f) => f.type === 'vocab' && f.subject === 'tamil')) {
    try {
      const data = await (await fetch(assetUrl(file.path))).json();
      entries.push(...data.entries.map((e) => ({ ...e, pack: file.pack })));
    } catch (e) { /* one broken file does not stop the others */ }
  }
  entries.sort((a, b) => Number(Boolean(b.pack)) - Number(Boolean(a.pack))); // class pack first, as in the game
  words = dedupe(entries).map((e) => ({
    id: e.id, taml: e['ta-Taml'] || '', latn: e['ta-Latn'], fr: e.fr, en: e.en, note: e.note || '', pack: e.pack || null,
  }));
}

// ---------- screen ----------
function setStatus(text, kind = '') {
  status = { text, kind };
  const el = $('status');
  if (el) { el.textContent = text; el.className = kind; }
}

function renderCard() {
  const card = $('card');
  if (words.length === 0) { card.textContent = t('rec.empty'); return; }
  const w = words[index];
  const has = recordings.has(w.id);
  const recording = recorder !== null;
  card.innerHTML = '';
  const add = (tag, cls, text) => { const el = document.createElement(tag); el.className = cls; el.textContent = text; card.appendChild(el); return el; };
  add('div', 'count', t('rec.word', { n: index + 1, total: words.length }));
  if (w.taml) add('p', 'taml', w.taml);
  add('div', 'latn', w.latn);
  add('div', 'meaning', localized({ fr: w.fr, en: w.en }));
  if (w.note) add('div', 'note', w.note);
  if (has) add('span', 'tag', t('rec.hasRecording'));
  if (inGame[w.id]) add('span', 'tag', t('rec.ingame'));

  const row = document.createElement('div');
  row.className = 'row';
  const button = (label, cls, onClick, disabled = false) => {
    const b = document.createElement('button');
    b.className = `big ${cls}`; b.textContent = label; b.disabled = disabled; b.onclick = onClick; row.appendChild(b); return b;
  };
  button(recording ? `■ ${t('rec.stop')}` : `● ${t('rec.record')}`, recording ? 'rec' : '', recording ? stopRecording : startRecording);
  button(`▶ ${t('rec.listen')}`, 'plain', playCurrent, !has || recording);
  button(t('rec.erase'), 'plain', eraseCurrent, !has || recording);
  card.appendChild(row);

  const nav = document.createElement('div');
  nav.className = 'row';
  const prev = document.createElement('button'); prev.className = 'small'; prev.textContent = `← ${t('rec.prev')}`; prev.disabled = index === 0 || recording; prev.onclick = () => go(index - 1);
  const next = document.createElement('button'); next.className = 'small'; next.textContent = `${t('rec.next')} →`; next.disabled = index >= words.length - 1 || recording; next.onclick = () => go(index + 1);
  nav.append(prev, next);
  card.appendChild(nav);

  const live = document.createElement('div');
  live.id = 'status'; live.textContent = status.text; live.className = status.kind;
  card.appendChild(live);
}

function renderRest() {
  const done = words.filter((w) => recordings.has(w.id)).length;
  $('progress').textContent = t('rec.progress', { done, total: words.length });
  const list = $('list');
  list.innerHTML = '';
  words.forEach((w, i) => {
    const li = document.createElement('li');
    const b = document.createElement('button');
    b.textContent = `${recordings.has(w.id) ? '✓ ' : ''}${w.latn}`;
    b.className = `${recordings.has(w.id) ? 'done' : ''} ${i === index ? 'current' : ''}`;
    b.onclick = () => { if (!recorder) go(i); };
    li.appendChild(b);
    list.appendChild(li);
  });
}

function render() { renderCard(); renderRest(); }

function go(i) {
  index = Math.max(0, Math.min(words.length - 1, i));
  setStatus('');
  stopPlayback();
  render();
}

// ---------- recording ----------
async function startRecording() {
  stopPlayback();
  if (!navigator.mediaDevices || !window.isSecureContext) { setStatus(t('rec.insecure'), 'bad'); return; }
  let stream;
  try {
    stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  } catch (e) {
    setStatus(t('rec.denied'), 'bad');
    return;
  }
  const chunks = [];
  const wordId = words[index].id;
  const rec = new MediaRecorder(stream);
  recorder = rec;
  rec.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data); };
  rec.onstop = async () => {
    stream.getTracks().forEach((track) => track.stop());
    recorder = null;
    clearTimeout(rec.timer);
    renderCard();
    setStatus(t('rec.processing'));
    try {
      const wav = await blobToWav(new Blob(chunks, { type: rec.mimeType }));
      if (!wav) { setStatus(t('rec.quiet'), 'bad'); render(); return; }
      recordings.set(wordId, wav);
      await store.save(wordId, wav);
      setStatus(t('rec.saved'), 'ok');
      render();
      playBlob(wav);
    } catch (e) {
      setStatus(t('rec.error'), 'bad');
      render();
    }
  };
  rec.start();
  rec.timer = setTimeout(() => { if (rec.state === 'recording') rec.stop(); }, MAX_SECONDS * 1000);
  setStatus(t('rec.recording'));
  renderCard();
}

function stopRecording() {
  if (recorder && recorder.state === 'recording') recorder.stop();
}

// ---------- playback and erasing ----------
function stopPlayback() {
  if (audio) { audio.pause(); audio = null; }
}
function playBlob(blob) {
  stopPlayback();
  audio = new Audio(URL.createObjectURL(blob));
  audio.play().catch(() => {});
}
function playCurrent() {
  const blob = recordings.get(words[index].id);
  if (blob) playBlob(blob);
}
async function eraseCurrent() {
  const id = words[index].id;
  recordings.delete(id);
  await store.remove(id);
  setStatus('');
  render();
}

// ---------- download ----------
// The zip mirrors the project's "public" folder, so it can simply be unzipped into it.
async function download() {
  const files = [];
  for (const w of words) {
    const blob = recordings.get(w.id);
    if (!blob) continue;
    const name = w.pack ? `content/packs/${w.pack}/audio/family/${w.id}.wav` : `audio/ta/family/${w.id}.wav`;
    files.push({ name, data: new Uint8Array(await blob.arrayBuffer()) });
  }
  if (files.length === 0) { setStatus(t('rec.nothing'), 'bad'); return; }
  const link = document.createElement('a');
  link.href = URL.createObjectURL(makeZip(files));
  link.download = 'recordings.zip';
  link.click();
  $('after').innerHTML = '';
  const p = document.createElement('p'); p.textContent = t('rec.after');
  const pre = document.createElement('pre'); pre.textContent = 'unzip -o ~/Downloads/recordings.zip -d public';
  $('after').append(p, pre);
}

function nextWithoutRecording() {
  const order = [...words.keys()];
  const target = [...order.slice(index + 1), ...order.slice(0, index)].find((i) => !recordings.has(words[i].id));
  if (target !== undefined) go(target);
}

// ---------- start ----------
function texts() {
  document.documentElement.lang = currentLang();
  $('title').textContent = t('rec.title');
  document.title = t('rec.title');
  $('help').textContent = t('rec.help');
  $('nextTodo').textContent = t('rec.nextTodo');
  $('download').textContent = t('rec.download');
  $('back').textContent = t('rec.back');
  document.querySelectorAll('.lang button').forEach((b) => b.classList.toggle('on', b.dataset.lang === currentLang()));
}

async function start() {
  document.querySelectorAll('.lang button').forEach((b) => {
    b.onclick = () => { setSetting('lang', b.dataset.lang); location.reload(); };
  });
  $('nextTodo').onclick = () => { if (!recorder) nextWithoutRecording(); };
  $('download').onclick = download;
  texts();
  try {
    await loadWords();
    recordings = await store.loadAll();
  } catch (e) {
    setStatus(t('rec.error'), 'bad');
  }
  if (!store.state.persistent) {
    const warn = document.createElement('p'); warn.className = 'warn'; warn.textContent = t('rec.memory'); $('warnings').appendChild(warn);
  }
  if (!window.isSecureContext) {
    const warn = document.createElement('p'); warn.className = 'warn'; warn.textContent = t('rec.insecure'); $('warnings').appendChild(warn);
  }
  const firstTodo = words.findIndex((w) => !recordings.has(w.id));
  index = Math.max(0, firstTodo);
  render();
}

start();
