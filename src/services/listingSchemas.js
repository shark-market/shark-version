import { z } from "zod";
import {
  getListingTypeFromCategory,
  LISTING_TYPE_VALUES,
  normalizeSellCategoryType,
} from "../utils/listingTypes";

const extraFieldScalarSchema = z.union([z.string(), z.number(), z.boolean(), z.null()]);
const extraFieldArraySchema = z.array(z.union([z.string(), z.number()]));
const extraFieldValueSchema = z.union([extraFieldScalarSchema, extraFieldArraySchema]);

const listingModelSchema = z
  .object({
    id: z.string().min(1),
    category: z.string().min(1),
    listingType: z.enum(LISTING_TYPE_VALUES),
    extraFields: z.record(extraFieldValueSchema),
  })
  .passthrough();

const toSafeScalar = (value) => {
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    return value;
  }
  return null;
};

const toSafeExtraFieldValue = (value) => {
  if (Array.isArray(value)) {
    return value
      .map((item) => {
        if (typeof item === "string" || typeof item === "number") return item;
        return null;
      })
      .filter((item) => item !== null);
  }
  return toSafeScalar(value);
};

const toSafeExtraFields = (extraFields) => {
  if (!extraFields || typeof extraFields !== "object" || Array.isArray(extraFields)) {
    return {};
  }

  return Object.entries(extraFields).reduce((acc, [key, value]) => {
    const normalizedKey = String(key || "").trim();
    if (!normalizedKey) return acc;
    acc[normalizedKey] = toSafeExtraFieldValue(value);
    return acc;
  }, {});
};

export const normalizeListingModel = (listing) => {
  const safeListing = listing && typeof listing === "object" ? listing : {};
  const categoryFromInput = normalizeSellCategoryType(safeListing.category) || safeListing.category || "other";
  const listingType = LISTING_TYPE_VALUES.includes(safeListing.listingType)
    ? safeListing.listingType
    : getListingTypeFromCategory(categoryFromInput);

  const candidate = {
    ...safeListing,
    id: String(safeListing.id || ""),
    category: String(categoryFromInput),
    listingType,
    extraFields: toSafeExtraFields(safeListing.extraFields),
  };

  const parsed = listingModelSchema.safeParse(candidate);
  if (parsed.success) return parsed.data;

  return {
    ...candidate,
    category: normalizeSellCategoryType(candidate.category) || "other",
    listingType: getListingTypeFromCategory(candidate.category),
    extraFields: {},
  };
};
