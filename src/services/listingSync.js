import { getListingTypeFromCategory } from "../utils/listingTypes";

const toNumber = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const parseLocation = (location = "", region = "") => {
  const rawLocation = String(location || "").trim();
  const rawRegion = String(region || "").trim();

  if (rawLocation.includes(" - ")) {
    const [country, city] = rawLocation.split(" - ").map((item) => item.trim());
    return {
      country: country || rawRegion || "Global",
      city: city || "",
    };
  }

  return {
    country: rawLocation || rawRegion || "Global",
    city: "",
  };
};

export const toAdminListingStatus = (status) => {
  if (status === "approved" || status === "rejected" || status === "pending") {
    return status;
  }
  if (status === "published") return "approved";
  return "pending";
};

export const toMarketplaceListingStatus = (status) => {
  if (status === "rejected") return "paused";
  if (status === "pending") return "draft";
  return "published";
};

export const mapCustomListingToAdminListing = (listing) => {
  const safe = listing || {};
  const location = parseLocation(safe.location, safe.region);

  return {
    id: safe.id,
    ownerUserId: safe.ownerId || "",
    title: safe.title || "",
    shortDescription: safe.shortDescription || safe.summary || "",
    details: safe.details || safe.summary || "",
    accountTypeNeeded: safe.partnerRole || "",
    partnershipType: safe.dealType || "",
    projectStage: safe.stage || "MVP",
    category: safe.category || "Other",
    listingType: safe.listingType || getListingTypeFromCategory(safe.category || "other"),
    extraFields:
      safe.extraFields && typeof safe.extraFields === "object" && !Array.isArray(safe.extraFields)
        ? safe.extraFields
        : {},
    skills: Array.isArray(safe.skills) ? safe.skills : [],
    commitment: safe.partnerCommitment || "",
    experienceLevel: safe.experienceLevel || "",
    locationCountry: location.country,
    locationCity: location.city,
    timezone: safe.timezone || "GMT+3",
    budgetMin: toNumber(safe.price || safe.budgetMin || 0),
    budgetMax: toNumber(safe.price || safe.budgetMax || 0),
    status: toAdminListingStatus(
      safe.approvalStatus || safe.moderationStatus || safe.status
    ),
    featured: Boolean(safe.featured),
    createdAt: safe.createdAt || new Date().toISOString(),
  };
};
