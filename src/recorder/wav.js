// Turns what the browser recorded (webm or mp4 audio, depending on the browser) into a small, clean WAV file:
// mono, 16 000 samples per second, silence trimmed at both ends, volume levelled.
// WAV plays in every browser, so recordings made on a phone or a computer all work in the game.
const RATE = 16000;
const PAD_SECONDS = 0.12; // a little silence kept around the word
const MIN_PEAK = 0.01; // quieter than this = nothing was recorded

export async function blobToWav(blob) {
  const context = new (window.AudioContext || window.webkitAudioContext)();
  let decoded;
  try {
    decoded = await context.decodeAudioData(await blob.arrayBuffer());
  } finally {
    context.close();
  }
  // Rendering into a 1-channel, 16 kHz context mixes down and resamples in one go
  const offline = new OfflineAudioContext(1, Math.max(1, Math.ceil(decoded.duration * RATE)), RATE);
  const source = offline.createBufferSource();
  source.buffer = decoded;
  source.connect(offline.destination);
  source.start();
  const rendered = await offline.startRendering();
  const samples = trimAndLevel(rendered.getChannelData(0));
  return samples ? encodeWav(samples) : null; // null = too quiet
}

function trimAndLevel(samples) {
  let peak = 0;
  for (const s of samples) peak = Math.max(peak, Math.abs(s));
  if (peak < MIN_PEAK) return null;
  const threshold = Math.max(MIN_PEAK, peak * 0.08);
  const window = RATE / 100; // 10 ms
  const loud = (start) => {
    let top = 0;
    for (let i = start; i < Math.min(start + window, samples.length); i += 1) top = Math.max(top, Math.abs(samples[i]));
    return top >= threshold;
  };
  let first = 0;
  while (first < samples.length && !loud(first)) first += window;
  let last = samples.length - 1;
  while (last > first && !loud(Math.max(0, last - window))) last -= window;
  const pad = Math.round(PAD_SECONDS * RATE);
  const from = Math.max(0, first - pad);
  const to = Math.min(samples.length, last + pad);
  const gain = Math.min(0.9 / peak, 20);
  const out = new Float32Array(to - from);
  for (let i = 0; i < out.length; i += 1) out[i] = samples[from + i] * gain;
  return out;
}

function encodeWav(samples) {
  const bytes = new DataView(new ArrayBuffer(44 + samples.length * 2));
  const text = (offset, str) => [...str].forEach((c, i) => bytes.setUint8(offset + i, c.charCodeAt(0)));
  text(0, 'RIFF');
  bytes.setUint32(4, 36 + samples.length * 2, true);
  text(8, 'WAVEfmt ');
  bytes.setUint32(16, 16, true); // size of this block
  bytes.setUint16(20, 1, true); // plain PCM
  bytes.setUint16(22, 1, true); // mono
  bytes.setUint32(24, RATE, true);
  bytes.setUint32(28, RATE * 2, true);
  bytes.setUint16(32, 2, true);
  bytes.setUint16(34, 16, true);
  text(36, 'data');
  bytes.setUint32(40, samples.length * 2, true);
  samples.forEach((s, i) => bytes.setInt16(44 + i * 2, Math.max(-1, Math.min(1, s)) * 32767, true));
  return new Blob([bytes], { type: 'audio/wav' });
}
