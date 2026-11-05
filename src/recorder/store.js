// Keeps the recordings on this device (IndexedDB). If the browser refuses (private window...),
// they are kept in memory only, and `persistent` is false so the page can warn about it.
const DB_NAME = 'lp-recordings';
const STORE = 'wav';
const memory = new Map();
export const state = { persistent: true };
let dbPromise = null;

function open() {
  if (!dbPromise) {
    dbPromise = new Promise((resolve, reject) => {
      try {
        const request = indexedDB.open(DB_NAME, 1);
        request.onupgradeneeded = () => request.result.createObjectStore(STORE);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      } catch (e) { reject(e); }
    }).catch(() => { state.persistent = false; return null; });
  }
  return dbPromise;
}

function run(mode, action) {
  return open().then((db) => new Promise((resolve, reject) => {
    const request = action(db.transaction(STORE, mode).objectStore(STORE));
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  }));
}

// All saved recordings as a Map: word id -> WAV blob
export async function loadAll() {
  const db = await open();
  if (!db) return new Map(memory);
  const keys = await run('readonly', (s) => s.getAllKeys());
  const values = await run('readonly', (s) => s.getAll());
  return new Map(keys.map((k, i) => [k, values[i]]));
}

export async function save(id, blob) {
  memory.set(id, blob);
  if (await open()) await run('readwrite', (s) => s.put(blob, id));
}

export async function remove(id) {
  memory.delete(id);
  if (await open()) await run('readwrite', (s) => s.delete(id));
}
