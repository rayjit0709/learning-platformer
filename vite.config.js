import { defineConfig } from 'vite';

// base './' lets the built site work from any web address or sub-folder.
// Two pages: the game (index.html) and the voice recorder (recorder.html).
export default defineConfig({
  base: './',
  build: {
    rollupOptions: {
      input: { main: 'index.html', recorder: 'recorder.html' },
    },
  },
});
