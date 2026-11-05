import musicUrl from '../assets/music/theme.mp3';
import { getSetting, setSetting } from './settings.js';

export const MUSIC_KEY = 'music-theme';
export const MUSIC_URL = musicUrl;

// Starts the background loop (once). Browsers only allow sound after a first tap or key press;
// Phaser waits for that automatically, so it is safe to call this at any time.
export function startMusic(scene) {
  if (!scene.cache.audio.exists(MUSIC_KEY)) return; // the file did not load: play without music
  let music = scene.sound.get(MUSIC_KEY);
  if (!music) music = scene.sound.add(MUSIC_KEY, { loop: true, volume: 0.35 });
  if (!music.isPlaying) music.play();
  applyMusicSetting(scene);
}

export function isMusicOn() {
  return getSetting('musicOn') !== false;
}

export function setMusicOn(scene, on) {
  setSetting('musicOn', on);
  applyMusicSetting(scene);
}

// "Off" mutes the music instead of stopping it, so turning it back on is instant.
function applyMusicSetting(scene) {
  const music = scene.sound.get(MUSIC_KEY);
  if (music) music.setMute(!isMusicOn());
}
