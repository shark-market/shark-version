const STORAGE_KEY = "sm-custom-listings";

export const getCustomListings = () => {
  if (typeof window === "undefined") return [];
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (!stored) return [];
  try {
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    return [];
  }
};

export const saveCustomListings = (listings) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(listings));
  window.dispatchEvent(new Event("sm-custom-listings"));
};

export const upsertCustomListing = (listing) => {
  const current = getCustomListings();
  const index = current.findIndex((item) => String(item.id) === String(listing.id));
  const next = [...current];
  if (index >= 0) {
    next[index] = listing;
  } else {
    next.unshift(listing);
  }
  saveCustomListings(next);
};

export const removeCustomListing = (id) => {
  const current = getCustomListings();
  const next = current.filter((item) => String(item.id) !== String(id));
  saveCustomListings(next);
};
