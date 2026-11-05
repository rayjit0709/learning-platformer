// Plays a recording of a word (a short mp3). Only one plays at a time.
// If the file is missing or the browser refuses, nothing happens and the game goes on.
let current = null;

export function playWordAudio(url) {
  stopWordAudio();
  if (!url) return;
  try {
    current = new Audio(url);
    current.play().catch(() => { current = null; });
  } catch (e) {
    current = null;
  }
}

export function stopWordAudio() {
  if (current) {
    current.pause();
    current = null;
  }
}
