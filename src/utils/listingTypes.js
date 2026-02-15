export const SELL_CATEGORY_TO_LISTING_TYPE = {
  saas: "SaaS",
  ecommerce: "Ecommerce",
  content: "Content",
  "mobile-app": "MobileApp",
  domain: "Domain",
  "youtube-social": "SocialMedia",
  plugins: "Addons",
  marketplace: "DigitalMarket",
  other: "Other",
};

export const LISTING_TYPE_TO_SELL_CATEGORY = {
  SaaS: "saas",
  Ecommerce: "ecommerce",
  Content: "content",
  MobileApp: "mobile-app",
  Domain: "domain",
  SocialMedia: "youtube-social",
  Addons: "plugins",
  DigitalMarket: "marketplace",
  Other: "other",
};

export const LISTING_TYPE_VALUES = [
  "SaaS",
  "Ecommerce",
  "Content",
  "MobileApp",
  "Domain",
  "SocialMedia",
  "Addons",
  "DigitalMarket",
  "Other",
];

export const DYNAMIC_TYPE_CATEGORIES = [
  "domain",
  "youtube-social",
  "plugins",
  "marketplace",
  "other",
];

const NORMALIZED_TYPE_ALIASES = {
  saas: "saas",
  ecommerce: "ecommerce",
  "e-commerce": "ecommerce",
  ecom: "ecommerce",
  content: "content",
  blog: "content",
  mobileapp: "mobile-app",
  "mobile-app": "mobile-app",
  app: "mobile-app",
  domain: "domain",
  social: "youtube-social",
  socialmedia: "youtube-social",
  "social-media": "youtube-social",
  youtube: "youtube-social",
  "youtube-social": "youtube-social",
  addons: "plugins",
  "add-ons": "plugins",
  plugin: "plugins",
  plugins: "plugins",
  extension: "plugins",
  extensions: "plugins",
  digitalmarket: "marketplace",
  "digital-market": "marketplace",
  marketplace: "marketplace",
  other: "other",
};

const normalizeTextKey = (value) =>
  String(value || "")
    .trim()
    .replace(/\s+/g, "")
    .replace(/_/g, "-")
    .toLowerCase();

export const normalizeSellCategoryType = (typeInput) => {
  const raw = String(typeInput || "").trim();
  if (!raw) return "";

  if (LISTING_TYPE_TO_SELL_CATEGORY[raw]) {
    return LISTING_TYPE_TO_SELL_CATEGORY[raw];
  }

  const normalized = normalizeTextKey(raw);
  if (NORMALIZED_TYPE_ALIASES[normalized]) {
    return NORMALIZED_TYPE_ALIASES[normalized];
  }

  return "";
};

export const getListingTypeFromCategory = (category) =>
  SELL_CATEGORY_TO_LISTING_TYPE[category] || "Other";

export const isDynamicTypeCategory = (category) =>
  DYNAMIC_TYPE_CATEGORIES.includes(category);
