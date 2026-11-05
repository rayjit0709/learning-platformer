// Helpers to find content files. Files are listed in public/content/index.json (generated).
export const QUESTIONS_INDEX_KEY = 'content-index';
export const INDEX_URL = `${import.meta.env.BASE_URL}content/index.json`;

export const assetUrl = (path) => `${import.meta.env.BASE_URL}${path}`;
export const fileKey = (path) => `content:${path}`;
