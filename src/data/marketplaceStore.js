import { adaptLegacyListing } from "./marketplaceData";
import { getPartnerListings } from "./partnerListings";
import { getCustomListings } from "./listingsStore";
import { normalizeListingModel } from "../services/listingSchemas";

const KEYS = {
  listings: "sm-marketplace-listings",
  partnerPosts: "sm-marketplace-partners",
  wishlist: "sm-marketplace-wishlist",
  reports: "sm-marketplace-reports",
  conversations: "sm-marketplace-conversations",
  messagesUnread: "sm-messages-unread",
  draftPrefix: "sm-marketplace-sell-draft:",
};

const EVENTS = {
  listings: "sm-marketplace-listings-update",
  partnerPosts: "sm-marketplace-partners-update",
  wishlist: "sm-marketplace-wishlist-update",
  conversations: "sm-marketplace-conversations-update",
};

const isBrowser = () => typeof window !== "undefined";

const readJSON = (key, fallback) => {
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

const writeJSON = (key, value) => {
  if (!isBrowser()) return;
  window.localStorage.setItem(key, JSON.stringify(value));
};

const emit = (eventName) => {
  if (!isBrowser()) return;
  window.dispatchEvent(new Event(eventName));
};

const upsertById = (collection, item) => {
  const id = String(item.id);
  const index = collection.findIndex((entry) => String(entry.id) === id);
  if (index === -1) {
    return [item, ...collection];
  }
  const next = [...collection];
  next[index] = { ...next[index], ...item };
  return next;
};

const mergeById = (primary, secondary) => {
  const map = new Map();
  primary.forEach((item) => {
    map.set(String(item.id), item);
  });
  secondary.forEach((item) => {
    if (!map.has(String(item.id))) {
      map.set(String(item.id), item);
    }
  });
  return Array.from(map.values());
};

const adaptLegacyPartner = (partner) => ({
  id: String(partner.id),
  projectName: partner.projectName || "Partner Opportunity",
  summary: partner.summary || partner.problem || "",
  roleNeeded: partner.partnerType || "Co-founder",
  budgetMinSAR: Number(partner.cashBudget) || 0,
  budgetMaxSAR: Number(partner.cashBudget) || 0,
  industryInterest: partner.projectType || "Other",
  region: partner.location || "Global",
  timezone: "GMT+3",
  commitmentLevel:
    partner.commitment === "full-time"
      ? "Full-time"
      : partner.commitment === "part-time"
        ? "Part-time"
        : "Advisory",
  verified: Boolean(partner.credibility?.founderExperience),
});

export const marketplaceEvents = EVENTS;

export const getCustomMarketplaceListings = () =>
  readJSON(KEYS.listings, [])
    .filter((item) => item && item.id)
    .map((item) => normalizeListingModel(item));

export const saveCustomMarketplaceListings = (listings) => {
  const safeListings = Array.isArray(listings) ? listings : [];
  writeJSON(KEYS.listings, safeListings);
  emit(EVENTS.listings);
};

export const upsertMarketplaceListing = (listing) => {
  const safeListing = normalizeListingModel(listing);
  const current = getCustomMarketplaceListings();
  const next = upsertById(current, safeListing);
  saveCustomMarketplaceListings(next);
  return safeListing;
};

export const getAllMarketplaceListings = (baseListings = []) => {
  const custom = getCustomMarketplaceListings();
  const legacyCustomListings = getCustomListings().map(adaptLegacyListing);
  return mergeById(custom, mergeById(legacyCustomListings, baseListings));
};

export const getCustomPartnerPosts = () =>
  readJSON(KEYS.partnerPosts, []).filter((item) => item && item.id);

export const saveCustomPartnerPosts = (posts) => {
  const safePosts = Array.isArray(posts) ? posts : [];
  writeJSON(KEYS.partnerPosts, safePosts);
  emit(EVENTS.partnerPosts);
};

export const upsertPartnerPost = (post) => {
  const current = getCustomPartnerPosts();
  const next = upsertById(current, post);
  saveCustomPartnerPosts(next);
  return post;
};

export const getAllPartnerPosts = (basePosts = []) => {
  const custom = getCustomPartnerPosts();
  const legacyPosts = getPartnerListings().map(adaptLegacyPartner);
  return mergeById(custom, mergeById(legacyPosts, basePosts));
};

export const getWishlistIds = () => {
  const ids = readJSON(KEYS.wishlist, []);
  if (!Array.isArray(ids)) return [];
  return ids.map((id) => String(id));
};

export const isWishlistedListing = (listingId) =>
  getWishlistIds().includes(String(listingId));

export const toggleWishlistListing = (listingId) => {
  const id = String(listingId);
  const current = getWishlistIds();
  const next = current.includes(id)
    ? current.filter((item) => item !== id)
    : [id, ...current];
  writeJSON(KEYS.wishlist, next);
  emit(EVENTS.wishlist);
  return next.includes(id);
};

export const getReportedListings = () =>
  readJSON(KEYS.reports, []).filter((entry) => entry && entry.id);

export const isListingReported = (listingId) =>
  getReportedListings().some((entry) => String(entry.id) === String(listingId));

export const reportMarketplaceListing = (listingId, reason = "") => {
  const id = String(listingId);
  const current = getReportedListings();
  if (current.some((entry) => String(entry.id) === id)) {
    return current;
  }
  const next = [
    {
      id,
      reason: reason.trim(),
      reportedAt: new Date().toISOString(),
    },
    ...current,
  ];
  writeJSON(KEYS.reports, next);
  return next;
};

export const getSellDraft = (type) => {
  if (!type) return null;
  return readJSON(`${KEYS.draftPrefix}${String(type)}`, null);
};

export const saveSellDraft = (type, draft) => {
  if (!type || !draft) return;
  writeJSON(`${KEYS.draftPrefix}${String(type)}`, {
    ...draft,
    updatedAt: new Date().toISOString(),
  });
};

export const clearSellDraft = (type) => {
  if (!isBrowser() || !type) return;
  window.localStorage.removeItem(`${KEYS.draftPrefix}${String(type)}`);
};

export const getConversations = (seedConversations = []) => {
  const stored = readJSON(KEYS.conversations, []);
  if (!Array.isArray(stored) || stored.length === 0) {
    return seedConversations;
  }
  return mergeById(stored, seedConversations);
};

export const saveConversations = (conversations) => {
  const safeConversations = Array.isArray(conversations) ? conversations : [];
  writeJSON(KEYS.conversations, safeConversations);
  const hasUnread = safeConversations.some((conversation) => conversation.unread);
  if (isBrowser()) {
    window.localStorage.setItem(KEYS.messagesUnread, hasUnread ? "1" : "0");
  }
  emit(EVENTS.conversations);
};

export const upsertConversation = (conversation) => {
  const current = getConversations();
  const next = upsertById(current, conversation);
  saveConversations(next);
  return next;
};

export const setConversationRead = (conversationId) => {
  const current = getConversations();
  const next = current.map((conversation) =>
    String(conversation.id) === String(conversationId)
      ? { ...conversation, unread: false }
      : conversation
  );
  saveConversations(next);
  return next;
};

export const addConversationMessage = (conversationId, message) => {
  const current = getConversations();
  const next = current.map((conversation) => {
    if (String(conversation.id) !== String(conversationId)) {
      return conversation;
    }
    const currentMessages = Array.isArray(conversation.messages)
      ? conversation.messages
      : [];
    return {
      ...conversation,
      messages: [...currentMessages, message],
      unread: false,
      updatedAt: new Date().toISOString(),
    };
  });
  saveConversations(next);
  return next;
};

export const getMessagesUnread = () => {
  if (!isBrowser()) return false;
  return window.localStorage.getItem(KEYS.messagesUnread) === "1";
};

export const clearMessagesUnread = () => {
  if (!isBrowser()) return;
  window.localStorage.setItem(KEYS.messagesUnread, "0");
  emit(EVENTS.conversations);
};
