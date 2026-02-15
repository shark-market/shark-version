import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useCurrency } from "../context/CurrencyContext";
import {
  LISTING_CATEGORY_MAP,
  LISTING_CATEGORY_OPTIONS,
  MONETIZATION_OPTIONS,
  SELL_ASSET_OPTIONS,
  SELL_PROOF_OPTIONS,
  TECH_STACK_OPTIONS,
} from "../data/marketplaceData";
import {
  clearSellDraft,
  getSellDraft,
  saveSellDraft,
  upsertMarketplaceListing,
} from "../data/marketplaceStore";
import { upsertCustomListing } from "../data/listingsStore";
import { mapCustomListingToAdminListing } from "../services/listingSync";
import { upsertListing } from "../services/listingsService";
import { getUI } from "../data/uiDictionary";
import {
  getListingTypeFromCategory,
  isDynamicTypeCategory,
  normalizeSellCategoryType,
} from "../utils/listingTypes";

const CATEGORY_SPECIFIC_LABELS = {
  saas: { EN: "Churn rate (%)", AR: "معدل الانسحاب (%)" },
  ecommerce: { EN: "Top supplier count", AR: "عدد الموردين الأساسيين" },
  content: { EN: "Newsletter subscribers", AR: "عدد مشتركي النشرة" },
  "mobile-app": { EN: "App downloads", AR: "عدد التحميلات" },
  domain: { EN: "Estimated domain authority", AR: "تقييم قوة النطاق" },
  "youtube-social": { EN: "Follower/subscriber count", AR: "عدد المتابعين/المشتركين" },
  plugins: { EN: "Active installations", AR: "عدد التثبيتات النشطة" },
  marketplace: { EN: "Active sellers", AR: "عدد البائعين النشطين" },
  other: { EN: "Key differentiator", AR: "الميزة التنافسية" },
};

const DOMAIN_REGISTRARS = ["GoDaddy", "Namecheap", "Other"];
const SOCIAL_PLATFORMS = [
  "YouTube",
  "Instagram",
  "TikTok",
  "X",
  "Snapchat",
  "LinkedIn",
  "Facebook",
  "Other",
];
const SOCIAL_MONETIZATION_OPTIONS = ["Ads", "Sponsorships", "Affiliate", "Other"];
const ADDONS_PLATFORM_TYPES = [
  "Shopify",
  "WooCommerce",
  "Chrome extension",
  "WordPress plugin",
  "Other",
];
const ADDONS_PRICING_MODELS = ["one-time", "subscription"];
const MARKETPLACE_REVENUE_MODELS = ["commission", "subscription", "ads"];

const DYNAMIC_LABELS = {
  AR: {
    sectionTitle: "حقول مخصصة حسب نوع المشروع",
    optional: "اختياري",
    none: "لا توجد حقول إضافية.",
    domainName: "اسم النطاق",
    domainRegistrar: "المسجّل",
    domainExpiryDate: "تاريخ انتهاء النطاق",
    domainMonthlyTraffic: "زيارات شهرية للنطاق",
    domainRevenue: "إيراد من النطاق",
    domainIncludedAssets: "الأصول المتضمنة (شعار، Landing Page، إلخ)",
    socialPlatforms: "المنصات",
    socialHandle: "معرّف الحساب أو الرابط",
    socialFollowers: "عدد المتابعين/المشتركين",
    socialViews: "المشاهدات/الانطباعات الشهرية",
    socialMonetization: "طرق تحقيق الدخل",
    socialRevenue: "الإيراد الشهري",
    socialProfit: "الربح الشهري",
    addonsPlatformType: "نوع المنصة",
    addonsProductUrl: "رابط المنتج",
    addonsActiveInstallations: "المستخدمون/التثبيتات النشطة",
    addonsPricingModel: "نموذج التسعير",
    addonsMonthlyRevenue: "الإيراد الشهري",
    marketplaceUrl: "رابط السوق الرقمي",
    marketplaceVendors: "عدد البائعين",
    marketplaceListings: "عدد الإدراجات",
    marketplaceRevenueModel: "نموذج الإيراد",
    marketplaceGmv: "إجمالي المبيعات الشهرية GMV",
    otherDescription: "وصف ما الذي تبيعه",
    otherLink: "رابط الموقع/التطبيق (إن وجد)",
  },
  EN: {
    sectionTitle: "Type-specific fields",
    optional: "optional",
    none: "No extra fields.",
    domainName: "Domain name",
    domainRegistrar: "Registrar",
    domainExpiryDate: "Expiry date",
    domainMonthlyTraffic: "Monthly traffic",
    domainRevenue: "Revenue from domain",
    domainIncludedAssets: "Included assets (logo, landing page, etc.)",
    socialPlatforms: "Platforms",
    socialHandle: "Account/channel handle or URL",
    socialFollowers: "Followers/Subscribers",
    socialViews: "Monthly views/impressions",
    socialMonetization: "Monetization",
    socialRevenue: "Monthly revenue",
    socialProfit: "Monthly profit",
    addonsPlatformType: "Platform type",
    addonsProductUrl: "Product URL",
    addonsActiveInstallations: "Active users/installations",
    addonsPricingModel: "Pricing model",
    addonsMonthlyRevenue: "Monthly revenue",
    marketplaceUrl: "Marketplace URL",
    marketplaceVendors: "Number of vendors/sellers",
    marketplaceListings: "Number of listings",
    marketplaceRevenueModel: "Revenue model",
    marketplaceGmv: "Monthly GMV",
    otherDescription: "Describe what you are selling",
    otherLink: "Website/app link if exists",
  },
};

const getDefaultForm = (type) => ({
  type,
  title: "",
  shortDescriptionEN: "",
  shortDescriptionAR: "",
  category: type,
  country: "",
  listingLanguage: "AR / EN",
  monthlyRevenue: "",
  monthlyProfit: "",
  expenses: "",
  growth: "",
  askingPrice: "",
  multiple: "",
  traffic: "",
  trafficSource: "",
  returningRate: "",
  businessAgeMonths: "",
  techStack: "Custom",
  monetization: "subscription",
  team: "",
  operations: "",
  categorySpecificValue: "",
  assets: [],
  proofs: [],
  proofFiles: [],
  negotiable: true,
  escrowOptional: true,

  domainName: "",
  domainRegistrar: "",
  domainExpiryDate: "",
  domainMonthlyTraffic: "",
  domainMonthlyRevenue: "",
  domainIncludedAssets: "",

  socialPlatforms: [],
  socialHandleUrl: "",
  socialFollowers: "",
  socialMonthlyViews: "",
  socialMonetization: [],
  socialMonthlyRevenue: "",
  socialMonthlyProfit: "",

  addonsPlatformType: "",
  addonsProductUrl: "",
  addonsActiveInstallations: "",
  addonsPricingModel: "",
  addonsMonthlyRevenue: "",

  marketplaceUrl: "",
  marketplaceVendors: "",
  marketplaceListings: "",
  marketplaceRevenueModel: "",
  marketplaceMonthlyGMV: "",

  otherDescription: "",
  otherLink: "",
});

const toNumber = (value) => {
  const parsed = Number(String(value).replace(/[^0-9.]/g, ""));
  return Number.isFinite(parsed) ? parsed : 0;
};

const toggleArrayValue = (values, value) =>
  values.includes(value)
    ? values.filter((item) => item !== value)
    : [...values, value];

const normalizeDraft = (type, draft) => ({
  ...getDefaultForm(type),
  ...(draft && typeof draft === "object" ? draft : {}),
  type,
  category: type,
});

const buildTypeExtraFields = (type, form, currency) => {
  if (type === "domain") {
    const fields = {
      domainName: form.domainName.trim(),
      registrar: form.domainRegistrar,
      expiryDate: form.domainExpiryDate,
      includedAssets: form.domainIncludedAssets.trim(),
    };

    if (toNumber(form.domainMonthlyTraffic) > 0) {
      fields.monthlyTraffic = toNumber(form.domainMonthlyTraffic);
    }
    if (toNumber(form.domainMonthlyRevenue) > 0) {
      fields.monthlyRevenue = toNumber(form.domainMonthlyRevenue);
      fields.currency = currency;
    }
    return fields;
  }

  if (type === "youtube-social") {
    const fields = {
      platforms: form.socialPlatforms,
      handleOrUrl: form.socialHandleUrl.trim(),
      followersOrSubscribers: toNumber(form.socialFollowers),
      monthlyViewsOrImpressions: toNumber(form.socialMonthlyViews),
      monetization: form.socialMonetization,
    };

    if (toNumber(form.socialMonthlyRevenue) > 0) {
      fields.monthlyRevenue = toNumber(form.socialMonthlyRevenue);
      fields.currency = currency;
    }
    if (toNumber(form.socialMonthlyProfit) > 0) {
      fields.monthlyProfit = toNumber(form.socialMonthlyProfit);
      fields.currency = currency;
    }
    return fields;
  }

  if (type === "plugins") {
    const fields = {
      platformType: form.addonsPlatformType,
      productUrl: form.addonsProductUrl.trim(),
      activeUsersOrInstallations: toNumber(form.addonsActiveInstallations),
      pricingModel: form.addonsPricingModel,
    };

    if (toNumber(form.addonsMonthlyRevenue) > 0) {
      fields.monthlyRevenue = toNumber(form.addonsMonthlyRevenue);
      fields.currency = currency;
    }
    return fields;
  }

  if (type === "marketplace") {
    const fields = {
      marketplaceUrl: form.marketplaceUrl.trim(),
      vendorsOrSellers: toNumber(form.marketplaceVendors),
      listingsCount: toNumber(form.marketplaceListings),
      revenueModel: form.marketplaceRevenueModel,
    };

    if (toNumber(form.marketplaceMonthlyGMV) > 0) {
      fields.monthlyGMV = toNumber(form.marketplaceMonthlyGMV);
      fields.currency = currency;
    }
    return fields;
  }

  if (type === "other") {
    return {
      description: form.otherDescription.trim(),
      websiteOrAppLink: form.otherLink.trim(),
    };
  }

  return {};
};

const formatExtraFieldValue = (value, locale) => {
  if (Array.isArray(value)) {
    return value.join(locale.startsWith("ar") ? "، " : ", ");
  }
  if (typeof value === "number") {
    return value.toLocaleString(locale);
  }
  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }
  return String(value || "-");
};

export default function SellWizard({ language = "EN" }) {
  const { type: typeParam } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const ui = getUI(language);
  const text = ui.sellWizard;
  const isArabic = language === "AR";
  const locale = isArabic ? "ar-SA" : "en-US";
  const dynamicLabels = DYNAMIC_LABELS[language] || DYNAMIC_LABELS.EN;
  const { currency, currencies, toSAR, formatCurrency } = useCurrency();

  const queryType = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return params.get("type") || "";
  }, [location.search]);

  const type = useMemo(
    () => normalizeSellCategoryType(queryType || typeParam || ""),
    [queryType, typeParam]
  );

  const isValidType = Boolean(LISTING_CATEGORY_MAP[type]);
  const hasDynamicTypeFields = isDynamicTypeCategory(type);
  const totalSteps = text.stepNames.length;

  const [step, setStep] = useState(1);
  const [statusMessage, setStatusMessage] = useState("");
  const [validationMessage, setValidationMessage] = useState("");
  const [form, setForm] = useState(() => {
    const safeType = type || "other";
    return normalizeDraft(safeType, getSellDraft(safeType));
  });

  useEffect(() => {
    if (!type) return;
    const draft = getSellDraft(type);
    setForm(normalizeDraft(type, draft));
    setStep(Math.min(totalSteps, Math.max(1, Number(draft?.step) || 1)));
    setStatusMessage("");
    setValidationMessage("");
  }, [type, totalSteps]);

  const currencyLabel =
    currencies?.[currency]?.label || currencies?.[currency]?.symbol || currency;

  const categoryLabel =
    LISTING_CATEGORY_MAP[type]?.label?.[language] ||
    LISTING_CATEGORY_MAP[type]?.label?.EN ||
    type;

  const conditionalLabel =
    CATEGORY_SPECIFIC_LABELS[type]?.[language] ||
    CATEGORY_SPECIFIC_LABELS[type]?.EN ||
    text.fields.conditional;

  const typeExtraFields = useMemo(
    () => buildTypeExtraFields(type, form, currency),
    [currency, form, type]
  );

  const missingByStep = useMemo(() => {
    const missing = [];

    if (step === 1) {
      if (!form.title.trim()) missing.push(text.fields.title);
      if (!form.shortDescriptionEN.trim()) missing.push(text.fields.shortEN);
      if (!form.shortDescriptionAR.trim()) missing.push(text.fields.shortAR);
      if (!form.country.trim()) missing.push(text.fields.country);
    }

    if (step === 2) {
      if (!hasDynamicTypeFields) {
        if (!toNumber(form.monthlyRevenue)) missing.push(text.fields.monthlyRevenue);
        if (!toNumber(form.monthlyProfit)) missing.push(text.fields.monthlyProfit);
      }
      if (!toNumber(form.askingPrice)) missing.push(text.fields.askingPrice);
      if (!toNumber(form.multiple)) missing.push(text.fields.multiple);

      if (type === "domain") {
        if (!form.domainName.trim()) missing.push(dynamicLabels.domainName);
        if (!form.domainRegistrar) missing.push(dynamicLabels.domainRegistrar);
        if (!form.domainExpiryDate) missing.push(dynamicLabels.domainExpiryDate);
        if (!form.domainIncludedAssets.trim()) missing.push(dynamicLabels.domainIncludedAssets);
      }

      if (type === "youtube-social") {
        if (form.socialPlatforms.length === 0) missing.push(dynamicLabels.socialPlatforms);
        if (!form.socialHandleUrl.trim()) missing.push(dynamicLabels.socialHandle);
        if (!toNumber(form.socialFollowers)) missing.push(dynamicLabels.socialFollowers);
        if (!toNumber(form.socialMonthlyViews)) missing.push(dynamicLabels.socialViews);
        if (form.socialMonetization.length === 0) missing.push(dynamicLabels.socialMonetization);
      }

      if (type === "plugins") {
        if (!form.addonsPlatformType) missing.push(dynamicLabels.addonsPlatformType);
        if (!form.addonsProductUrl.trim()) missing.push(dynamicLabels.addonsProductUrl);
        if (!toNumber(form.addonsActiveInstallations)) {
          missing.push(dynamicLabels.addonsActiveInstallations);
        }
        if (!form.addonsPricingModel) missing.push(dynamicLabels.addonsPricingModel);
      }

      if (type === "marketplace") {
        if (!form.marketplaceUrl.trim()) missing.push(dynamicLabels.marketplaceUrl);
        if (!toNumber(form.marketplaceVendors)) missing.push(dynamicLabels.marketplaceVendors);
        if (!toNumber(form.marketplaceListings)) missing.push(dynamicLabels.marketplaceListings);
        if (!form.marketplaceRevenueModel) missing.push(dynamicLabels.marketplaceRevenueModel);
      }

      if (type === "other") {
        if (!form.otherDescription.trim()) missing.push(dynamicLabels.otherDescription);
      }
    }

    if (step === 3) {
      if (!toNumber(form.traffic)) missing.push(text.fields.traffic);
      if (!toNumber(form.businessAgeMonths)) missing.push(text.fields.age);
      if (!form.trafficSource.trim()) missing.push(text.fields.trafficSource);
    }

    if (step === 4) {
      if (!form.techStack) missing.push(text.fields.techStack);
      if (!form.monetization) missing.push(text.fields.monetization);
      if (!hasDynamicTypeFields && !form.categorySpecificValue.trim()) {
        missing.push(conditionalLabel);
      }
      if (!form.operations.trim()) missing.push(text.fields.operations);
      if (form.assets.length === 0) missing.push(text.fields.assets);
    }

    if (step === 5) {
      if (form.proofs.length === 0) missing.push(text.fields.proofChecklist);
    }

    return missing;
  }, [
    conditionalLabel,
    dynamicLabels.addonsActiveInstallations,
    dynamicLabels.addonsPlatformType,
    dynamicLabels.addonsPricingModel,
    dynamicLabels.addonsProductUrl,
    dynamicLabels.domainExpiryDate,
    dynamicLabels.domainIncludedAssets,
    dynamicLabels.domainName,
    dynamicLabels.domainRegistrar,
    dynamicLabels.marketplaceListings,
    dynamicLabels.marketplaceRevenueModel,
    dynamicLabels.marketplaceUrl,
    dynamicLabels.marketplaceVendors,
    dynamicLabels.otherDescription,
    dynamicLabels.socialFollowers,
    dynamicLabels.socialHandle,
    dynamicLabels.socialMonetization,
    dynamicLabels.socialPlatforms,
    dynamicLabels.socialViews,
    form.addonsActiveInstallations,
    form.addonsPlatformType,
    form.addonsPricingModel,
    form.addonsProductUrl,
    form.askingPrice,
    form.assets,
    form.businessAgeMonths,
    form.categorySpecificValue,
    form.country,
    form.domainExpiryDate,
    form.domainIncludedAssets,
    form.domainName,
    form.domainRegistrar,
    form.marketplaceListings,
    form.marketplaceRevenueModel,
    form.marketplaceUrl,
    form.marketplaceVendors,
    form.monthlyProfit,
    form.monthlyRevenue,
    form.monetization,
    form.multiple,
    form.operations,
    form.otherDescription,
    form.proofs,
    form.shortDescriptionAR,
    form.shortDescriptionEN,
    form.socialFollowers,
    form.socialHandleUrl,
    form.socialMonetization,
    form.socialMonthlyViews,
    form.socialPlatforms,
    form.techStack,
    form.title,
    form.traffic,
    form.trafficSource,
    hasDynamicTypeFields,
    step,
    text.fields.age,
    text.fields.askingPrice,
    text.fields.assets,
    text.fields.country,
    text.fields.monthlyProfit,
    text.fields.monthlyRevenue,
    text.fields.multiple,
    text.fields.operations,
    text.fields.proofChecklist,
    text.fields.shortAR,
    text.fields.shortEN,
    text.fields.techStack,
    text.fields.title,
    text.fields.traffic,
    text.fields.trafficSource,
    type,
  ]);

  const goNext = () => {
    if (missingByStep.length > 0) {
      setValidationMessage(`${text.validationPrefix} ${missingByStep.join(isArabic ? "، " : ", ")}`);
      return;
    }
    setValidationMessage("");
    setStep((prev) => Math.min(totalSteps, prev + 1));
  };

  const goPrevious = () => {
    setValidationMessage("");
    setStep((prev) => Math.max(1, prev - 1));
  };

  const handleFieldChange = (field) => (event) => {
    const value =
      event.target.type === "checkbox" ? event.target.checked : event.target.value;
    setForm((prev) => ({ ...prev, [field]: value }));
    setStatusMessage("");
  };

  const saveDraft = () => {
    if (!type) return;
    saveSellDraft(type, { ...form, step, category: type, type });
    setStatusMessage(text.draftSaved);
  };

  const handlePublish = () => {
    if (missingByStep.length > 0) {
      setValidationMessage(`${text.validationPrefix} ${missingByStep.join(isArabic ? "، " : ", ")}`);
      return;
    }

    const monthlyRevenueSAR = toSAR(toNumber(form.monthlyRevenue), currency);
    const monthlyProfitSAR = toSAR(toNumber(form.monthlyProfit), currency);
    const askingPriceSAR = toSAR(toNumber(form.askingPrice), currency);

    const newListing = {
      id: `mk-user-${Date.now()}`,
      createdAt: new Date().toISOString(),
      titleEN: form.title.trim(),
      titleAR: form.title.trim(),
      summaryEN: form.shortDescriptionEN.trim(),
      summaryAR: form.shortDescriptionAR.trim(),
      category: form.category,
      listingType: getListingTypeFromCategory(form.category),
      extraFields: typeExtraFields,
      askingPriceSAR,
      monthlyProfitSAR,
      monthlyRevenueSAR,
      monthlyTraffic: toNumber(form.traffic),
      monetization: form.monetization,
      ageMonths: toNumber(form.businessAgeMonths),
      country: form.country.trim(),
      region: "Global",
      techStack: [form.techStack],
      verified: false,
      featured: false,
      multiple: toNumber(form.multiple),
      businessLanguage: form.listingLanguage.trim(),
      assetsIncluded: form.assets,
      proofChecklist: [...form.proofs, ...form.proofFiles],
      sellerNotes: `${form.operations.trim()}${form.team ? ` | Team: ${form.team}` : ""}${
        !hasDynamicTypeFields && form.categorySpecificValue
          ? ` | ${conditionalLabel}: ${form.categorySpecificValue}`
          : ""
      }`,
      negotiable: Boolean(form.negotiable),
      escrowEligible: Boolean(form.escrowOptional),
      safeCommunication: true,
      verifiedMetrics: false,
      image:
        "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80",
    };

    upsertMarketplaceListing(newListing);

    const customListing = {
      id: newListing.id,
      title: newListing.titleEN,
      shortDescription: newListing.summaryEN,
      details: newListing.sellerNotes,
      category: newListing.category,
      listingType: newListing.listingType,
      extraFields: newListing.extraFields,
      location: newListing.country,
      region: "global",
      price: newListing.askingPriceSAR,
      monthlyRevenue: newListing.monthlyRevenueSAR,
      monthlyProfit: newListing.monthlyProfitSAR,
      dealType: "full",
      stage: "Revenue",
      views: 0,
      likes: 0,
      verified: false,
      featured: false,
      monetization: newListing.monetization,
      ageYears: Math.max(1, Math.round(newListing.ageMonths / 12)),
      image: newListing.image,
      status: "published",
      createdAt: newListing.createdAt,
      updatedAt: new Date().toISOString(),
    };

    upsertCustomListing(customListing);
    upsertListing(mapCustomListingToAdminListing(customListing));

    clearSellDraft(type);
    setStatusMessage(text.published);
    setValidationMessage("");
    navigate(`/listing/${newListing.id}`);
  };

  if (!isValidType) {
    return (
      <section className="market-page sell-wizard-page">
        <div className="container sell-wizard-shell">
          <h1>{text.title}</h1>
          <p className="muted">{text.unknownType}</p>
          <button className="btn btn-dark" type="button" onClick={() => navigate("/sell")}>
            {text.backToSell}
          </button>
        </div>
      </section>
    );
  }

  const renderTypeFieldsStepTwo = () => {
    if (type === "domain") {
      return (
        <>
          <label className="field-group field-group-full">
            <span>{dynamicLabels.sectionTitle}</span>
          </label>

          <label className="field-group">
            <span>{dynamicLabels.domainName}</span>
            <input type="text" value={form.domainName} onChange={handleFieldChange("domainName")} />
          </label>

          <label className="field-group">
            <span>{dynamicLabels.domainRegistrar}</span>
            <select value={form.domainRegistrar} onChange={handleFieldChange("domainRegistrar")}>
              <option value="">-</option>
              {DOMAIN_REGISTRARS.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>

          <label className="field-group">
            <span>{dynamicLabels.domainExpiryDate}</span>
            <input type="date" value={form.domainExpiryDate} onChange={handleFieldChange("domainExpiryDate")} />
          </label>

          <label className="field-group">
            <span>{`${dynamicLabels.domainMonthlyTraffic} (${dynamicLabels.optional})`}</span>
            <input
              type="number"
              min="0"
              value={form.domainMonthlyTraffic}
              onChange={handleFieldChange("domainMonthlyTraffic")}
            />
          </label>

          <label className="field-group">
            <span>{`${dynamicLabels.domainRevenue} (${currencyLabel}) ${dynamicLabels.optional}`}</span>
            <input
              type="number"
              min="0"
              value={form.domainMonthlyRevenue}
              onChange={handleFieldChange("domainMonthlyRevenue")}
            />
          </label>

          <label className="field-group field-group-full">
            <span>{dynamicLabels.domainIncludedAssets}</span>
            <textarea rows="3" value={form.domainIncludedAssets} onChange={handleFieldChange("domainIncludedAssets")} />
          </label>
        </>
      );
    }

    if (type === "youtube-social") {
      return (
        <>
          <label className="field-group field-group-full">
            <span>{dynamicLabels.sectionTitle}</span>
          </label>

          <div className="field-group field-group-full">
            <span>{dynamicLabels.socialPlatforms}</span>
            <div className="market-filter-checklist">
              {SOCIAL_PLATFORMS.map((platform) => (
                <label className="checkbox-row" key={platform}>
                  <input
                    type="checkbox"
                    checked={form.socialPlatforms.includes(platform)}
                    onChange={() =>
                      setForm((prev) => ({
                        ...prev,
                        socialPlatforms: toggleArrayValue(prev.socialPlatforms, platform),
                      }))
                    }
                  />
                  <span>{platform}</span>
                </label>
              ))}
            </div>
          </div>

          <label className="field-group field-group-full">
            <span>{dynamicLabels.socialHandle}</span>
            <input type="text" value={form.socialHandleUrl} onChange={handleFieldChange("socialHandleUrl")} />
          </label>

          <label className="field-group">
            <span>{dynamicLabels.socialFollowers}</span>
            <input type="number" min="0" value={form.socialFollowers} onChange={handleFieldChange("socialFollowers")} />
          </label>

          <label className="field-group">
            <span>{dynamicLabels.socialViews}</span>
            <input
              type="number"
              min="0"
              value={form.socialMonthlyViews}
              onChange={handleFieldChange("socialMonthlyViews")}
            />
          </label>

          <div className="field-group field-group-full">
            <span>{dynamicLabels.socialMonetization}</span>
            <div className="market-filter-checklist">
              {SOCIAL_MONETIZATION_OPTIONS.map((method) => (
                <label className="checkbox-row" key={method}>
                  <input
                    type="checkbox"
                    checked={form.socialMonetization.includes(method)}
                    onChange={() =>
                      setForm((prev) => ({
                        ...prev,
                        socialMonetization: toggleArrayValue(prev.socialMonetization, method),
                      }))
                    }
                  />
                  <span>{method}</span>
                </label>
              ))}
            </div>
          </div>

          <label className="field-group">
            <span>{`${dynamicLabels.socialRevenue} (${currencyLabel}) ${dynamicLabels.optional}`}</span>
            <input
              type="number"
              min="0"
              value={form.socialMonthlyRevenue}
              onChange={handleFieldChange("socialMonthlyRevenue")}
            />
          </label>

          <label className="field-group">
            <span>{`${dynamicLabels.socialProfit} (${currencyLabel}) ${dynamicLabels.optional}`}</span>
            <input
              type="number"
              min="0"
              value={form.socialMonthlyProfit}
              onChange={handleFieldChange("socialMonthlyProfit")}
            />
          </label>
        </>
      );
    }

    if (type === "plugins") {
      return (
        <>
          <label className="field-group field-group-full">
            <span>{dynamicLabels.sectionTitle}</span>
          </label>

          <label className="field-group">
            <span>{dynamicLabels.addonsPlatformType}</span>
            <select value={form.addonsPlatformType} onChange={handleFieldChange("addonsPlatformType")}>
              <option value="">-</option>
              {ADDONS_PLATFORM_TYPES.map((platform) => (
                <option key={platform} value={platform}>
                  {platform}
                </option>
              ))}
            </select>
          </label>

          <label className="field-group">
            <span>{dynamicLabels.addonsPricingModel}</span>
            <select value={form.addonsPricingModel} onChange={handleFieldChange("addonsPricingModel")}>
              <option value="">-</option>
              {ADDONS_PRICING_MODELS.map((model) => (
                <option key={model} value={model}>
                  {model}
                </option>
              ))}
            </select>
          </label>

          <label className="field-group field-group-full">
            <span>{dynamicLabels.addonsProductUrl}</span>
            <input type="url" value={form.addonsProductUrl} onChange={handleFieldChange("addonsProductUrl")} />
          </label>

          <label className="field-group">
            <span>{dynamicLabels.addonsActiveInstallations}</span>
            <input
              type="number"
              min="0"
              value={form.addonsActiveInstallations}
              onChange={handleFieldChange("addonsActiveInstallations")}
            />
          </label>

          <label className="field-group">
            <span>{`${dynamicLabels.addonsMonthlyRevenue} (${currencyLabel}) ${dynamicLabels.optional}`}</span>
            <input
              type="number"
              min="0"
              value={form.addonsMonthlyRevenue}
              onChange={handleFieldChange("addonsMonthlyRevenue")}
            />
          </label>
        </>
      );
    }

    if (type === "marketplace") {
      return (
        <>
          <label className="field-group field-group-full">
            <span>{dynamicLabels.sectionTitle}</span>
          </label>

          <label className="field-group field-group-full">
            <span>{dynamicLabels.marketplaceUrl}</span>
            <input type="url" value={form.marketplaceUrl} onChange={handleFieldChange("marketplaceUrl")} />
          </label>

          <label className="field-group">
            <span>{dynamicLabels.marketplaceVendors}</span>
            <input type="number" min="0" value={form.marketplaceVendors} onChange={handleFieldChange("marketplaceVendors")} />
          </label>

          <label className="field-group">
            <span>{dynamicLabels.marketplaceListings}</span>
            <input
              type="number"
              min="0"
              value={form.marketplaceListings}
              onChange={handleFieldChange("marketplaceListings")}
            />
          </label>

          <label className="field-group">
            <span>{dynamicLabels.marketplaceRevenueModel}</span>
            <select value={form.marketplaceRevenueModel} onChange={handleFieldChange("marketplaceRevenueModel")}>
              <option value="">-</option>
              {MARKETPLACE_REVENUE_MODELS.map((model) => (
                <option key={model} value={model}>
                  {model}
                </option>
              ))}
            </select>
          </label>

          <label className="field-group">
            <span>{`${dynamicLabels.marketplaceGmv} (${currencyLabel}) ${dynamicLabels.optional}`}</span>
            <input
              type="number"
              min="0"
              value={form.marketplaceMonthlyGMV}
              onChange={handleFieldChange("marketplaceMonthlyGMV")}
            />
          </label>
        </>
      );
    }

    if (type === "other") {
      return (
        <>
          <label className="field-group field-group-full">
            <span>{dynamicLabels.sectionTitle}</span>
          </label>

          <label className="field-group field-group-full">
            <span>{dynamicLabels.otherDescription}</span>
            <textarea rows="4" value={form.otherDescription} onChange={handleFieldChange("otherDescription")} />
          </label>

          <label className="field-group field-group-full">
            <span>{`${dynamicLabels.otherLink} (${dynamicLabels.optional})`}</span>
            <input type="url" value={form.otherLink} onChange={handleFieldChange("otherLink")} />
          </label>
        </>
      );
    }

    return null;
  };

  const renderStep = () => {
    if (step === 1) {
      return (
        <div className="sell-step-grid">
          <label className="field-group">
            <span>{text.fields.title}</span>
            <input type="text" value={form.title} onChange={handleFieldChange("title")} />
          </label>

          <label className="field-group">
            <span>{text.fields.category}</span>
            <select value={form.category} disabled>
              {LISTING_CATEGORY_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label?.[language] || option.label?.EN}
                </option>
              ))}
            </select>
          </label>

          <label className="field-group field-group-full">
            <span>{text.fields.shortEN}</span>
            <textarea rows="3" value={form.shortDescriptionEN} onChange={handleFieldChange("shortDescriptionEN")} />
          </label>

          <label className="field-group field-group-full">
            <span>{text.fields.shortAR}</span>
            <textarea rows="3" value={form.shortDescriptionAR} onChange={handleFieldChange("shortDescriptionAR")} />
          </label>

          <label className="field-group">
            <span>{text.fields.country}</span>
            <input
              type="text"
              placeholder={text.placeholder.country}
              value={form.country}
              onChange={handleFieldChange("country")}
            />
          </label>

          <label className="field-group">
            <span>{text.fields.listingLanguage}</span>
            <input
              type="text"
              placeholder={text.placeholder.listingLanguage}
              value={form.listingLanguage}
              onChange={handleFieldChange("listingLanguage")}
            />
          </label>
        </div>
      );
    }

    if (step === 2) {
      return (
        <div className="sell-step-grid">
          <label className="field-group">
            <span>{`${text.fields.monthlyRevenue} (${currencyLabel})${
              hasDynamicTypeFields ? ` ${dynamicLabels.optional}` : ""
            }`}</span>
            <input type="number" min="0" value={form.monthlyRevenue} onChange={handleFieldChange("monthlyRevenue")} />
          </label>

          <label className="field-group">
            <span>{`${text.fields.monthlyProfit} (${currencyLabel})${
              hasDynamicTypeFields ? ` ${dynamicLabels.optional}` : ""
            }`}</span>
            <input type="number" min="0" value={form.monthlyProfit} onChange={handleFieldChange("monthlyProfit")} />
          </label>

          <label className="field-group">
            <span>{`${text.fields.expenses} (${currencyLabel})`}</span>
            <input type="number" min="0" value={form.expenses} onChange={handleFieldChange("expenses")} />
          </label>

          <label className="field-group">
            <span>{text.fields.growth}</span>
            <input type="number" value={form.growth} placeholder={text.placeholder.growth} onChange={handleFieldChange("growth")} />
          </label>

          <label className="field-group">
            <span>{`${text.fields.askingPrice} (${currencyLabel})`}</span>
            <input type="number" min="0" value={form.askingPrice} onChange={handleFieldChange("askingPrice")} />
          </label>

          <label className="field-group">
            <span>{text.fields.multiple}</span>
            <input
              type="number"
              step="0.1"
              min="0"
              placeholder={text.placeholder.multiple}
              value={form.multiple}
              onChange={handleFieldChange("multiple")}
            />
          </label>

          {renderTypeFieldsStepTwo()}
        </div>
      );
    }

    if (step === 3) {
      return (
        <div className="sell-step-grid">
          <label className="field-group">
            <span>{text.fields.traffic}</span>
            <input type="number" min="0" value={form.traffic} onChange={handleFieldChange("traffic")} />
          </label>

          <label className="field-group">
            <span>{text.fields.age}</span>
            <input
              type="number"
              min="1"
              value={form.businessAgeMonths}
              onChange={handleFieldChange("businessAgeMonths")}
            />
          </label>

          <label className="field-group field-group-full">
            <span>{text.fields.trafficSource}</span>
            <input
              type="text"
              placeholder={text.placeholder.trafficSource}
              value={form.trafficSource}
              onChange={handleFieldChange("trafficSource")}
            />
          </label>

          <label className="field-group field-group-full">
            <span>{text.fields.returningRate}</span>
            <input type="number" min="0" max="100" value={form.returningRate} onChange={handleFieldChange("returningRate")} />
          </label>
        </div>
      );
    }

    if (step === 4) {
      return (
        <div className="sell-step-grid">
          <label className="field-group">
            <span>{text.fields.techStack}</span>
            <select value={form.techStack} onChange={handleFieldChange("techStack")}>
              {TECH_STACK_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label?.[language] || option.label?.EN}
                </option>
              ))}
            </select>
          </label>

          <label className="field-group">
            <span>{text.fields.monetization}</span>
            <select value={form.monetization} onChange={handleFieldChange("monetization")}>
              {MONETIZATION_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label?.[language] || option.label?.EN}
                </option>
              ))}
            </select>
          </label>

          <label className="field-group">
            <span>{text.fields.team}</span>
            <input type="text" placeholder={text.placeholder.team} value={form.team} onChange={handleFieldChange("team")} />
          </label>

          <label className="field-group field-group-full">
            <span>{text.fields.operations}</span>
            <textarea
              rows="3"
              placeholder={text.placeholder.operations}
              value={form.operations}
              onChange={handleFieldChange("operations")}
            />
          </label>

          {!hasDynamicTypeFields ? (
            <label className="field-group field-group-full">
              <span>{conditionalLabel}</span>
              <input
                type="text"
                placeholder={text.placeholder.conditional}
                value={form.categorySpecificValue}
                onChange={handleFieldChange("categorySpecificValue")}
              />
            </label>
          ) : null}

          <div className="field-group field-group-full">
            <span>{text.fields.assets}</span>
            <div className="market-filter-checklist">
              {SELL_ASSET_OPTIONS.map((asset) => (
                <label className="checkbox-row" key={asset.value}>
                  <input
                    type="checkbox"
                    checked={form.assets.includes(asset.value)}
                    onChange={() =>
                      setForm((prev) => ({
                        ...prev,
                        assets: toggleArrayValue(prev.assets, asset.value),
                      }))
                    }
                  />
                  <span>{asset.label?.[language] || asset.label?.EN}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      );
    }

    if (step === 5) {
      return (
        <div className="sell-step-grid">
          <div className="field-group field-group-full">
            <span>{text.fields.proofChecklist}</span>
            <div className="market-filter-checklist">
              {SELL_PROOF_OPTIONS.map((proof) => (
                <label className="checkbox-row" key={proof.value}>
                  <input
                    type="checkbox"
                    checked={form.proofs.includes(proof.value)}
                    onChange={() =>
                      setForm((prev) => ({
                        ...prev,
                        proofs: toggleArrayValue(prev.proofs, proof.value),
                      }))
                    }
                  />
                  <span>{proof.label?.[language] || proof.label?.EN}</span>
                </label>
              ))}
            </div>
          </div>

          <label className="field-group field-group-full">
            <span>{text.fields.proofFiles}</span>
            <input
              type="file"
              multiple
              onChange={(event) => {
                const names = Array.from(event.target.files || []).map((file) => file.name);
                setForm((prev) => ({ ...prev, proofFiles: names }));
              }}
            />
            <small className="muted">{text.uploadHint}</small>
            <small className="muted">
              {form.proofFiles.length > 0
                ? form.proofFiles.join(isArabic ? "، " : ", ")
                : text.noFiles}
            </small>
          </label>

          <label className="checkbox-row">
            <input type="checkbox" checked={form.negotiable} onChange={handleFieldChange("negotiable")} />
            <span>{text.fields.negotiable}</span>
          </label>

          <label className="checkbox-row">
            <input
              type="checkbox"
              checked={form.escrowOptional}
              onChange={handleFieldChange("escrowOptional")}
            />
            <span>{text.fields.escrow}</span>
          </label>
        </div>
      );
    }

    return (
      <div className="sell-step-grid">
        <div className="sell-preview-card field-group-full">
          <h3>{form.title || "-"}</h3>
          <p className="muted">{categoryLabel}</p>
          <p>{form.shortDescriptionEN || "-"}</p>
          <p className="muted">{form.shortDescriptionAR || "-"}</p>

          <div className="sell-preview-metrics">
            <span>
              {text.fields.monthlyRevenue}: {formatCurrency(toSAR(toNumber(form.monthlyRevenue), currency), { locale })}
            </span>
            <span>
              {text.fields.monthlyProfit}: {formatCurrency(toSAR(toNumber(form.monthlyProfit), currency), { locale })}
            </span>
            <span>
              {text.fields.askingPrice}: {formatCurrency(toSAR(toNumber(form.askingPrice), currency), { locale })}
            </span>
            <span>
              {text.fields.multiple}: {toNumber(form.multiple).toFixed(2)}x
            </span>
            <span>
              {text.fields.traffic}: {Number(form.traffic || 0).toLocaleString(locale)}
            </span>
            <span>
              {text.fields.assets}: {form.assets.length}
            </span>
            <span>
              {text.fields.proofFiles}: {form.proofFiles.length || 0}
            </span>
          </div>

          <div className="detail-rows">
            {Object.entries(typeExtraFields).length === 0 ? (
              <div>
                <span className="muted">{dynamicLabels.sectionTitle}</span>
                <strong>{dynamicLabels.none}</strong>
              </div>
            ) : (
              Object.entries(typeExtraFields).map(([key, value]) => (
                <div key={key}>
                  <span className="muted">{key}</span>
                  <strong>{formatExtraFieldValue(value, locale)}</strong>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <section className="market-page sell-wizard-page">
      <div className="container sell-wizard-shell">
        <div className="sell-wizard-head">
          <div>
            <h1>{text.title}</h1>
            <p className="muted">{categoryLabel}</p>
          </div>
          <button className="btn btn-ghost" type="button" onClick={saveDraft}>
            {text.saveDraft}
          </button>
        </div>

        <div className="sell-progress">
          {text.stepNames.map((name, index) => {
            const stepIndex = index + 1;
            const active = stepIndex === step;
            const done = stepIndex < step;
            return (
              <div
                key={name}
                className={`sell-progress-item ${active ? "active" : ""} ${done ? "done" : ""}`}
              >
                <span>{stepIndex}</span>
                <small>{name}</small>
              </div>
            );
          })}
        </div>

        <div className="sell-wizard-card">{renderStep()}</div>

        {validationMessage ? <p className="auth-status error">{validationMessage}</p> : null}
        {statusMessage ? <p className="auth-status success">{statusMessage}</p> : null}

        <div className="sell-wizard-actions">
          <button className="btn btn-ghost" type="button" onClick={goPrevious} disabled={step === 1}>
            {text.previous}
          </button>
          {step < totalSteps ? (
            <button className="btn btn-dark" type="button" onClick={goNext}>
              {text.next}
            </button>
          ) : (
            <button className="btn btn-dark" type="button" onClick={handlePublish}>
              {text.publish}
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
