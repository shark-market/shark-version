import { PARTNER_POSTS } from "../data/marketplaceData";
import { getListingTypeFromCategory } from "../utils/listingTypes";
import { normalizeListingModel } from "./listingSchemas";
import { createId, nowIso, readJSON, upsertById, writeJSON } from "./storageService";

const LISTINGS_KEY = "sm-admin-listings-db-v1";
const SERVICE_SUBMISSIONS_KEY = "sm-admin-services-db-v1";
const EVENTS = {
  listingsChanged: "sm-admin-listings-update",
  servicesChanged: "sm-admin-services-update",
};

const seedListings = () =>
  PARTNER_POSTS.map((post, index) => ({
    id: post.id || createId("listing"),
    ownerUserId: index % 2 === 0 ? "user-sample-1" : "user-sample-2",
    title: post.projectName,
    shortDescription: post.summary,
    details: post.summary,
    accountTypeNeeded: post.roleNeeded,
    partnershipType: post.roleNeeded,
    projectStage: post.stage || "MVP",
    category: post.industryInterest || "Other",
    listingType: getListingTypeFromCategory(post.industryInterest || "other"),
    extraFields: {},
    skills: String(post.skills || "")
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean),
    commitment: post.commitmentLevel || "Part-time",
    experienceLevel: post.experienceLevel || "Intermediate",
    locationCountry: String(post.region || "Global").split(" - ")[0],
    locationCity: String(post.region || "").split(" - ")[1] || "",
    timezone: post.timezone || "GMT+3",
    budgetMin: Number(post.budgetMinSAR) || 0,
    budgetMax: Number(post.budgetMaxSAR || post.budgetMinSAR) || 0,
    status: "pending",
    featured: false,
    createdAt: post.createdAt || nowIso(),
  }));

const seedServiceSubmissions = () => [
  {
    id: "svc-101",
    ownerUserId: "user-sample-1",
    category: "Due diligence",
    status: "pending",
    createdAt: nowIso(),
  },
  {
    id: "svc-102",
    ownerUserId: "user-sample-2",
    category: "Valuation review",
    status: "approved",
    createdAt: nowIso(),
  },
];

const emit = (eventName) => {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(eventName));
};

export const listingsEvents = EVENTS;

export const getListings = () => {
  const stored = readJSON(LISTINGS_KEY, null);
  if (!Array.isArray(stored) || stored.length === 0) {
    const seeded = seedListings();
    writeJSON(LISTINGS_KEY, seeded);
    return seeded;
  }
  return stored;
};

export const saveListings = (listings) => {
  const safe = Array.isArray(listings) ? listings : [];
  writeJSON(LISTINGS_KEY, safe);
  emit(EVENTS.listingsChanged);
  return safe;
};

export const upsertListing = (listingInput) => {
  const existing = listingInput?.id
    ? getListings().find((item) => String(item.id) === String(listingInput.id))
    : null;
  const listingBase = {
    id: listingInput?.id || createId("listing"),
    ownerUserId: listingInput?.ownerUserId || "",
    title: listingInput?.title || "",
    shortDescription: listingInput?.shortDescription || "",
    details: listingInput?.details || "",
    accountTypeNeeded: listingInput?.accountTypeNeeded || "",
    partnershipType: listingInput?.partnershipType || "",
    projectStage: listingInput?.projectStage || "",
    category: listingInput?.category || "",
    listingType:
      listingInput?.listingType ||
      getListingTypeFromCategory(listingInput?.category || "other"),
    extraFields:
      listingInput?.extraFields &&
      typeof listingInput.extraFields === "object" &&
      !Array.isArray(listingInput.extraFields)
        ? listingInput.extraFields
        : {},
    skills: Array.isArray(listingInput?.skills) ? listingInput.skills : [],
    commitment: listingInput?.commitment || "",
    experienceLevel: listingInput?.experienceLevel || "",
    locationCountry: listingInput?.locationCountry || "",
    locationCity: listingInput?.locationCity || "",
    timezone: listingInput?.timezone || "GMT+3",
    budgetMin: Number(listingInput?.budgetMin || 0),
    budgetMax: Number(listingInput?.budgetMax || 0),
    status: listingInput?.status || "pending",
    featured: Boolean(listingInput?.featured),
    createdAt: existing?.createdAt || nowIso(),
  };

  const listing = normalizeListingModel(listingBase);

  const next = upsertById(getListings(), listing);
  saveListings(next);
  return listing;
};

export const updateListingStatus = (listingId, status, patch = {}) => {
  const current = getListings().find((item) => String(item.id) === String(listingId));
  if (!current) return null;
  return upsertListing({
    ...current,
    ...patch,
    status,
  });
};

export const deleteListing = (listingId) => {
  const next = getListings().filter((item) => String(item.id) !== String(listingId));
  saveListings(next);
  return next;
};

export const getListingsByOwner = (ownerUserId) =>
  getListings().filter((listing) => String(listing.ownerUserId) === String(ownerUserId));

export const getListingsStats = () => {
  const listings = getListings();
  const sevenDaysAgo = Date.now() - 1000 * 60 * 60 * 24 * 7;
  const newListingsLast7Days = listings.filter((item) => {
    const createdAt = new Date(item.createdAt || 0).getTime();
    return Number.isFinite(createdAt) && createdAt >= sevenDaysAgo;
  }).length;
  return {
    totalListings: listings.length,
    newListingsLast7Days,
  };
};

export const getServiceSubmissions = () => {
  const stored = readJSON(SERVICE_SUBMISSIONS_KEY, null);
  if (!Array.isArray(stored) || stored.length === 0) {
    const seeded = seedServiceSubmissions();
    writeJSON(SERVICE_SUBMISSIONS_KEY, seeded);
    return seeded;
  }
  return stored;
};

export const saveServiceSubmissions = (items) => {
  const safe = Array.isArray(items) ? items : [];
  writeJSON(SERVICE_SUBMISSIONS_KEY, safe);
  emit(EVENTS.servicesChanged);
  return safe;
};

export const upsertServiceSubmission = (submission) => {
  const item = {
    id: submission?.id || createId("svc"),
    ownerUserId: submission?.ownerUserId || "",
    category: submission?.category || "",
    status: submission?.status || "pending",
    createdAt: submission?.createdAt || nowIso(),
  };
  const next = upsertById(getServiceSubmissions(), item);
  saveServiceSubmissions(next);
  return item;
};

export const updateServiceStatus = (submissionId, status) => {
  const current = getServiceSubmissions().find((item) => String(item.id) === String(submissionId));
  if (!current) return null;
  return upsertServiceSubmission({ ...current, status });
};
