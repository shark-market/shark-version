const isBrowser = () => typeof window !== "undefined";

export const nowIso = () => new Date().toISOString();

export const createId = (prefix = "id") =>
  `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

export const readJSON = (key, fallback) => {
  if (!isBrowser()) return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return parsed ?? fallback;
  } catch (error) {
    return fallback;
  }
};

export const writeJSON = (key, value) => {
  if (!isBrowser()) return;
  window.localStorage.setItem(key, JSON.stringify(value));
};

export const upsertById = (collection, item) => {
  const safeCollection = Array.isArray(collection) ? collection : [];
  const id = String(item.id);
  const index = safeCollection.findIndex((entry) => String(entry.id) === id);

  if (index === -1) {
    return [item, ...safeCollection];
  }

  const next = [...safeCollection];
  next[index] = { ...next[index], ...item };
  return next;
};
