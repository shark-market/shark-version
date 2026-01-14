import { generatePost, pickTypeByIndex } from "./blogGenerator";

const STORAGE_KEY = "sharkMarketBlogPosts";
const LAST_PUBLISHED_KEY = "sharkMarketBlogLastPublishedAt";
const SEQUENCE_KEY = "sharkMarketBlogSequence";
const ADMIN_KEY = "sharkMarketBlogAdmin";

export const PUBLISH_INTERVAL_MS = 24 * 60 * 60 * 1000;

const SEED_MIN = 12;
const SEED_MAX = 20;
const SEED_SPACING_MS = 12 * 60 * 60 * 1000;

const getStorage = () => {
  if (typeof window === "undefined") {
    return null;
  }
  return window.localStorage;
};

const safeParse = (value, fallback) => {
  if (!value) {
    return fallback;
  }
  try {
    return JSON.parse(value);
  } catch (error) {
    return fallback;
  }
};

const getNumber = (value, fallback) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const getSequence = () => {
  const storage = getStorage();
  if (!storage) {
    return 0;
  }
  return getNumber(storage.getItem(SEQUENCE_KEY), 0);
};

const setSequence = (value) => {
  const storage = getStorage();
  if (!storage) {
    return;
  }
  storage.setItem(SEQUENCE_KEY, String(value));
};

const nextSequence = () => {
  const nextValue = getSequence() + 1;
  setSequence(nextValue);
  return nextValue;
};

const getStoredPosts = () => {
  const storage = getStorage();
  if (!storage) {
    return [];
  }
  return safeParse(storage.getItem(STORAGE_KEY), []);
};

const savePosts = (posts) => {
  const storage = getStorage();
  if (!storage) {
    return;
  }
  storage.setItem(STORAGE_KEY, JSON.stringify(posts));
};

const getLastPublishedAt = () => {
  const storage = getStorage();
  if (!storage) {
    return null;
  }
  const value = storage.getItem(LAST_PUBLISHED_KEY);
  const time = value ? new Date(value).getTime() : null;
  return Number.isFinite(time) ? time : null;
};

const setLastPublishedAt = (timestamp) => {
  const storage = getStorage();
  if (!storage) {
    return;
  }
  storage.setItem(LAST_PUBLISHED_KEY, new Date(timestamp).toISOString());
};

const getLatestPostTime = (posts) =>
  posts.reduce((max, post) => {
    const time = new Date(post.createdAt).getTime();
    return Number.isFinite(time) && time > max ? time : max;
  }, 0);

const createPost = (createdAt, type) => {
  const sequence = nextSequence();
  const resolvedType = type || pickTypeByIndex(sequence);
  return generatePost({ sequence, type: resolvedType, createdAt });
};

const seedPosts = (now) => {
  const count =
    Math.floor(Math.random() * (SEED_MAX - SEED_MIN + 1)) + SEED_MIN;
  const firstTime = now - (count - 1) * SEED_SPACING_MS;
  const seeded = [];

  for (let i = 0; i < count; i += 1) {
    seeded.push(createPost(firstTime + i * SEED_SPACING_MS));
  }

  return seeded;
};

export const syncBlogPosts = (now = Date.now()) => {
  let posts = getStoredPosts();

  if (!posts.length) {
    posts = seedPosts(now);
    savePosts(posts);
    setLastPublishedAt(now);
    return posts;
  }

  let lastPublishedAt = getLastPublishedAt();

  if (!lastPublishedAt) {
    lastPublishedAt = getLatestPostTime(posts) || now;
    setLastPublishedAt(lastPublishedAt);
  }

  const elapsed = now - lastPublishedAt;
  const dueCount = Math.floor(elapsed / PUBLISH_INTERVAL_MS);

  if (dueCount > 0) {
    const newPosts = [];

    for (let i = 1; i <= dueCount; i += 1) {
      newPosts.push(createPost(lastPublishedAt + i * PUBLISH_INTERVAL_MS));
    }

    posts = [...posts, ...newPosts];
    savePosts(posts);
    setLastPublishedAt(lastPublishedAt + dueCount * PUBLISH_INTERVAL_MS);
  }

  return posts;
};

export const forcePublishPost = (now = Date.now()) => {
  const posts = getStoredPosts();
  const newPost = createPost(now);
  const updated = [...posts, newPost];
  savePosts(updated);
  setLastPublishedAt(now);
  return updated;
};

export const isAdminMode = () => {
  const storage = getStorage();
  if (!storage) {
    return false;
  }
  return storage.getItem(ADMIN_KEY) === "1";
};

export const setAdminMode = (enabled) => {
  const storage = getStorage();
  if (!storage) {
    return;
  }
  storage.setItem(ADMIN_KEY, enabled ? "1" : "0");
};
