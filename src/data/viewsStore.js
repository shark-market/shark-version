const VIEWS_KEY = "sm-listing-views";

const readViews = () => {
  if (typeof window === "undefined") return {};
  const raw = window.localStorage.getItem(VIEWS_KEY);
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch (error) {
    return {};
  }
};

const writeViews = (views) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(VIEWS_KEY, JSON.stringify(views));
};

export const getListingViews = (id, fallback = 0) => {
  const views = readViews();
  const value = views[String(id)];
  if (Number.isFinite(Number(value))) {
    return Number(value);
  }
  return Number(fallback) || 0;
};

export const incrementListingViews = (id, fallback = 0) => {
  const views = readViews();
  const key = String(id);
  const current = Number(views[key]) || Number(fallback) || 0;
  const next = current + 1;
  views[key] = next;
  writeViews(views);
  return next;
};
