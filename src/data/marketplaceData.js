import { businesses } from "./mockdata";
import { getListingTypeFromCategory } from "../utils/listingTypes";

export const LISTING_CATEGORY_OPTIONS = [
  { value: "saas", label: { EN: "SaaS", AR: "برمجيات SaaS" } },
  { value: "ecommerce", label: { EN: "E-commerce", AR: "تجارة إلكترونية" } },
  { value: "content", label: { EN: "Content", AR: "محتوى" } },
  { value: "mobile-app", label: { EN: "Mobile App", AR: "تطبيق جوال" } },
  { value: "domain", label: { EN: "Domain", AR: "نطاق" } },
  { value: "youtube-social", label: { EN: "Social Media", AR: "سوشال ميديا / يوتيوب" } },
  { value: "plugins", label: { EN: "Add-ons / Plugins", AR: "إضافات / Plugins / Extensions" } },
  { value: "marketplace", label: { EN: "Digital Marketplace", AR: "سوق رقمي" } },
  { value: "other", label: { EN: "Other", AR: "أخرى" } },
];

export const SELL_TYPE_CARD_CONTENT = {
  saas: {
    AR: {
      what: "منتج برمجي قائم على الاشتراك يُباع للشركات أو الأفراد.",
      example: "مثال سريع: نظام فوترة SaaS بإيراد شهري متكرر.",
    },
    EN: {
      what: "A subscription software business sold to companies or consumers.",
      example: "Quick example: a billing SaaS with recurring MRR.",
    },
  },
  ecommerce: {
    AR: {
      what: "متجر إلكتروني يبيع منتجات عبر منصة مثل Shopify أو WooCommerce.",
      example: "مثال سريع: متجر عناية شخصية مع موردين وعقود شحن.",
    },
    EN: {
      what: "An online store selling products through Shopify/WooCommerce.",
      example: "Quick example: a DTC store with suppliers and shipping contracts.",
    },
  },
  content: {
    AR: {
      what: "مشروع يعتمد على المحتوى وزيارات البحث أو الجمهور المباشر.",
      example: "مثال سريع: موقع محتوى متخصص + نشرة بريدية.",
    },
    EN: {
      what: "A content-driven business monetized by traffic and audience.",
      example: "Quick example: niche content site + newsletter.",
    },
  },
  "mobile-app": {
    AR: {
      what: "تطبيق جوال يحقق دخلًا من الاشتراكات أو الإعلانات أو المشتريات.",
      example: "مثال سريع: تطبيق عادات صحية مع اشتراك شهري.",
    },
    EN: {
      what: "A mobile app monetized via subscriptions, ads, or in-app sales.",
      example: "Quick example: a wellness app with paid subscription.",
    },
  },
  domain: {
    AR: {
      what: "بيع نطاق رقمي منفرد أو حزمة نطاقات مع أصول مرتبطة.",
      example: "مثال سريع: نطاق مميز + صفحة هبوط + شعار.",
    },
    EN: {
      what: "A single domain sale or bundle with related assets.",
      example: "Quick example: premium domain + landing page + logo.",
    },
  },
  "youtube-social": {
    AR: {
      what: "حسابات/قنوات تواصل اجتماعي تُباع كأصل رقمي مدر للدخل.",
      example: "مثال سريع: قناة يوتيوب تعليمية مع رعايات وإعلانات.",
    },
    EN: {
      what: "Social accounts/channels sold as monetized digital assets.",
      example: "Quick example: YouTube channel with ads and sponsorships.",
    },
  },
  plugins: {
    AR: {
      what: "منتج رقمي مثل Plugin أو Extension أو Add-on لمنصة قائمة.",
      example: "مثال سريع: إضافة Shopify بعدد تثبيتات نشط.",
    },
    EN: {
      what: "Digital product add-ons like plugins and extensions.",
      example: "Quick example: Shopify plugin with active installations.",
    },
  },
  marketplace: {
    AR: {
      what: "منصة سوق رقمي تربط بائعين ومشترين بنموذج عمولة أو اشتراك.",
      example: "مثال سريع: Marketplace لخدمات التصميم بعمولة على الطلبات.",
    },
    EN: {
      what: "A digital marketplace connecting buyers and sellers.",
      example: "Quick example: services marketplace with commission model.",
    },
  },
  other: {
    AR: {
      what: "أي أصل رقمي لا ينطبق عليه التصنيفات السابقة.",
      example: "مثال سريع: أداة داخلية مطورة خصيصًا أو مشروع هجين.",
    },
    EN: {
      what: "Any digital asset that does not fit the predefined categories.",
      example: "Quick example: custom internal tool or hybrid digital asset.",
    },
  },
};

export const LISTING_CATEGORY_MAP = LISTING_CATEGORY_OPTIONS.reduce((acc, item) => {
  acc[item.value] = item;
  return acc;
}, {});

export const MONETIZATION_OPTIONS = [
  { value: "ads", label: { EN: "Ads", AR: "إعلانات" } },
  { value: "subscription", label: { EN: "Subscription", AR: "اشتراكات" } },
  { value: "affiliate", label: { EN: "Affiliate", AR: "أفلييت" } },
  { value: "ecom", label: { EN: "Ecom", AR: "تجارة إلكترونية" } },
  { value: "services", label: { EN: "Services", AR: "خدمات" } },
  { value: "mixed", label: { EN: "Mixed", AR: "مختلط" } },
];

export const MONETIZATION_MAP = MONETIZATION_OPTIONS.reduce((acc, item) => {
  acc[item.value] = item;
  return acc;
}, {});

export const TECH_STACK_OPTIONS = [
  { value: "Shopify", label: { EN: "Shopify", AR: "Shopify" } },
  { value: "WordPress", label: { EN: "WordPress", AR: "WordPress" } },
  { value: "Custom", label: { EN: "Custom", AR: "مخصص" } },
];

export const PARTNER_ROLE_OPTIONS = [
  { value: "Investor", label: { EN: "Investor", AR: "مستثمر" } },
  { value: "Co-founder", label: { EN: "Co-founder", AR: "مؤسس مشارك" } },
  { value: "Operator", label: { EN: "Operator", AR: "مشغّل" } },
  { value: "Marketing", label: { EN: "Marketing", AR: "تسويق" } },
  { value: "Tech", label: { EN: "Tech", AR: "تقني" } },
  { value: "Sales", label: { EN: "Sales", AR: "مبيعات" } },
];

export const PARTNER_COMMITMENT_OPTIONS = [
  { value: "Full-time", label: { EN: "Full-time", AR: "دوام كامل" } },
  { value: "Part-time", label: { EN: "Part-time", AR: "دوام جزئي" } },
  { value: "Advisory", label: { EN: "Advisory", AR: "استشاري" } },
];

export const PARTNER_INDUSTRY_OPTIONS = [
  "SaaS",
  "E-commerce",
  "Content",
  "AI",
  "Health",
  "Fintech",
  "Marketplace",
  "Edtech",
  "Consumer",
  "B2B Services",
];

export const SELL_ASSET_OPTIONS = [
  { value: "domain", label: { EN: "Domain", AR: "النطاق" } },
  { value: "code", label: { EN: "Codebase", AR: "الكود" } },
  { value: "social", label: { EN: "Social accounts", AR: "حسابات التواصل" } },
  { value: "email-list", label: { EN: "Email list", AR: "القائمة البريدية" } },
  { value: "apps", label: { EN: "Apps/Integrations", AR: "التكاملات" } },
  {
    value: "supplier-contacts",
    label: { EN: "Supplier contacts", AR: "جهات الموردين" },
  },
];

export const SELL_PROOF_OPTIONS = [
  { value: "analytics", label: { EN: "Analytics access", AR: "وصول التحليلات" } },
  { value: "bank-statements", label: { EN: "Bank statements", AR: "كشوفات بنكية" } },
  { value: "platform-screens", label: { EN: "Platform screenshots", AR: "لقطات المنصة" } },
  { value: "tax-docs", label: { EN: "Tax docs", AR: "مستندات ضريبية" } },
  { value: "legal-docs", label: { EN: "Legal ownership docs", AR: "إثبات الملكية" } },
];

const MONETIZATION_BRIDGE = {
  subscriptions: "subscription",
  commission: "affiliate",
  products: "ecom",
  services: "services",
  ads: "ads",
  mixed: "mixed",
};

const LEGACY_CATEGORY_BRIDGE = {
  saas: "saas",
  ecommerce: "ecommerce",
  "website-content": "content",
  "website-blog": "content",
  "website-directory": "content",
  "website-community": "content",
  "website-reviews": "content",
  "app-ios": "mobile-app",
  "app-android": "mobile-app",
  "youtube-channel": "youtube-social",
  "social-instagram": "youtube-social",
  "social-x": "youtube-social",
  "social-tiktok": "youtube-social",
  "social-snapchat": "youtube-social",
  domains: "domain",
  newsletter: "content",
  "ai-tools": "other",
  other: "other",
};

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80";

const mkListing = (listing) => ({
  ...listing,
  id: String(listing.id),
  listingType: listing.listingType || getListingTypeFromCategory(listing.category),
  extraFields:
    listing.extraFields && typeof listing.extraFields === "object" && !Array.isArray(listing.extraFields)
      ? listing.extraFields
      : {},
  verified: Boolean(listing.verified),
  featured: Boolean(listing.featured),
  assetsIncluded: listing.assetsIncluded || [],
  techStack: listing.techStack || ["Custom"],
  region: listing.region || "Global",
  escrowEligible: listing.escrowEligible ?? true,
  safeCommunication: listing.safeCommunication ?? true,
  verifiedMetrics: listing.verifiedMetrics ?? Boolean(listing.verified),
  image: listing.image || FALLBACK_IMAGE,
});

export const MARKETPLACE_LISTINGS = [
  mkListing({
    id: "mk-101",
    titleEN: "B2B Logistics SaaS",
    titleAR: "منصة SaaS للخدمات اللوجستية",
    summaryEN: "Enterprise-ready SaaS with stable MRR and low churn.",
    summaryAR: "منصة SaaS جاهزة للمؤسسات بإيراد ثابت ومعدل انسحاب منخفض.",
    category: "saas",
    askingPriceSAR: 3920000,
    monthlyProfitSAR: 124000,
    monthlyRevenueSAR: 255000,
    monthlyTraffic: 118000,
    monetization: "subscription",
    ageMonths: 38,
    country: "Saudi Arabia",
    region: "Middle East",
    techStack: ["Custom"],
    verified: true,
    featured: true,
    multiple: 2.63,
    businessLanguage: "AR/EN",
    image:
      "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1200&q=80",
    assetsIncluded: ["Codebase", "Client contracts", "Brand kit", "SOPs"],
  }),
  mkListing({
    id: "mk-102",
    titleEN: "Niche Beauty Shopify Store",
    titleAR: "متجر Shopify متخصص في منتجات الجمال",
    summaryEN: "Fast-growing DTC brand with repeat customers across GCC.",
    summaryAR: "علامة تجارية DTC سريعة النمو مع معدل عودة عملاء مرتفع في الخليج.",
    category: "ecommerce",
    askingPriceSAR: 1460000,
    monthlyProfitSAR: 57000,
    monthlyRevenueSAR: 214000,
    monthlyTraffic: 82000,
    monetization: "ecom",
    ageMonths: 29,
    country: "United Arab Emirates",
    region: "Middle East",
    techStack: ["Shopify"],
    verified: true,
    featured: true,
    multiple: 2.13,
    businessLanguage: "AR/EN",
    image:
      "https://images.unsplash.com/photo-1472851294608-062f824d29cc?auto=format&fit=crop&w=1200&q=80",
    assetsIncluded: ["Domain", "Supplier contracts", "Email list", "Creative assets"],
  }),
  mkListing({
    id: "mk-103",
    titleEN: "Arabic Newsletter Portfolio",
    titleAR: "محفظة نشرات بريدية عربية",
    summaryEN: "Profitable content portfolio monetized by sponsors and affiliates.",
    summaryAR: "محفظة محتوى رابحة تعتمد على الرعايات والأفلييت.",
    category: "content",
    askingPriceSAR: 910000,
    monthlyProfitSAR: 33000,
    monthlyRevenueSAR: 55000,
    monthlyTraffic: 190000,
    monetization: "affiliate",
    ageMonths: 42,
    country: "Egypt",
    region: "Middle East",
    techStack: ["WordPress"],
    verified: false,
    featured: false,
    multiple: 2.29,
    businessLanguage: "AR",
    image:
      "https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=1200&q=80",
    assetsIncluded: ["Domain", "Email list", "Editorial SOP", "Sponsorship pipeline"],
  }),
  mkListing({
    id: "mk-104",
    titleEN: "Health Habit Mobile App",
    titleAR: "تطبيق جوال لعادات الصحة",
    summaryEN: "Consumer app with 60k MAU and subscription upsell.",
    summaryAR: "تطبيق استهلاكي مع 60 ألف مستخدم نشط شهريًا ونمو في الاشتراكات.",
    category: "mobile-app",
    askingPriceSAR: 2230000,
    monthlyProfitSAR: 69000,
    monthlyRevenueSAR: 160000,
    monthlyTraffic: 240000,
    monetization: "subscription",
    ageMonths: 26,
    country: "Jordan",
    region: "Middle East",
    techStack: ["Custom"],
    verified: true,
    featured: true,
    multiple: 2.69,
    businessLanguage: "EN",
    image:
      "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1200&q=80",
    assetsIncluded: ["Codebase", "Analytics dashboard", "App store accounts"],
  }),
  mkListing({
    id: "mk-105",
    titleEN: "Vertical Freelancer Marketplace",
    titleAR: "سوق متخصص للمستقلين",
    summaryEN: "Marketplace with verified sellers and healthy repeat buyers.",
    summaryAR: "منصة سوق مع بائعين موثّقين ومشترين متكررين.",
    category: "marketplace",
    askingPriceSAR: 3180000,
    monthlyProfitSAR: 98000,
    monthlyRevenueSAR: 274000,
    monthlyTraffic: 146000,
    monetization: "services",
    ageMonths: 33,
    country: "Saudi Arabia",
    region: "Middle East",
    techStack: ["Custom"],
    verified: true,
    featured: true,
    multiple: 2.7,
    businessLanguage: "AR/EN",
    image:
      "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80",
    assetsIncluded: ["Codebase", "Seller verification playbook", "Operations handbook"],
  }),
  mkListing({
    id: "mk-106",
    titleEN: "Premium Domain Bundle",
    titleAR: "حزمة نطاقات مميزة",
    summaryEN: "14 premium domains in Arabic and English with buyer demand.",
    summaryAR: "14 نطاقًا مميزًا بالعربية والإنجليزية مع اهتمام من المشترين.",
    category: "domain",
    askingPriceSAR: 490000,
    monthlyProfitSAR: 8000,
    monthlyRevenueSAR: 14000,
    monthlyTraffic: 12000,
    monetization: "services",
    ageMonths: 72,
    country: "Kuwait",
    region: "Middle East",
    techStack: ["Custom"],
    verified: true,
    featured: false,
    multiple: 5.1,
    businessLanguage: "AR/EN",
    image:
      "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=1200&q=80",
    assetsIncluded: ["Domain ownership docs", "Historical offers", "Landing pages"],
  }),
  mkListing({
    id: "mk-107",
    titleEN: "WooCommerce Plugin Suite",
    titleAR: "حزمة إضافات WooCommerce",
    summaryEN: "Plugin business with recurring licenses and low support overhead.",
    summaryAR: "نشاط إضافات بإيرادات متكررة وتكلفة دعم منخفضة.",
    category: "plugins",
    askingPriceSAR: 1740000,
    monthlyProfitSAR: 52000,
    monthlyRevenueSAR: 108000,
    monthlyTraffic: 54000,
    monetization: "subscription",
    ageMonths: 47,
    country: "Lebanon",
    region: "Middle East",
    techStack: ["WordPress"],
    verified: true,
    featured: false,
    multiple: 2.79,
    businessLanguage: "EN",
    image:
      "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80",
    assetsIncluded: ["Codebase", "Documentation", "License server", "Support SOP"],
  }),
  mkListing({
    id: "mk-108",
    titleEN: "YouTube Finance Channel",
    titleAR: "قناة يوتيوب مالية",
    summaryEN: "Ad-driven media channel with strong Arabic audience loyalty.",
    summaryAR: "قناة إعلامية تعتمد على الإعلانات مع ولاء قوي للجمهور العربي.",
    category: "youtube-social",
    askingPriceSAR: 1260000,
    monthlyProfitSAR: 44000,
    monthlyRevenueSAR: 72000,
    monthlyTraffic: 310000,
    monetization: "ads",
    ageMonths: 34,
    country: "Bahrain",
    region: "Middle East",
    techStack: ["Custom"],
    verified: false,
    featured: false,
    multiple: 2.38,
    businessLanguage: "AR",
    image:
      "https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&w=1200&q=80",
    assetsIncluded: ["Channel account", "Sponsorship list", "Content calendar"],
  }),
  mkListing({
    id: "mk-109",
    titleEN: "AI Prompt Marketplace",
    titleAR: "سوق قوالب الذكاء الاصطناعي",
    summaryEN: "Global audience with mixed monetization and strong SEO moat.",
    summaryAR: "جمهور عالمي مع دخل مختلط وحضور SEO قوي.",
    category: "other",
    askingPriceSAR: 980000,
    monthlyProfitSAR: 35000,
    monthlyRevenueSAR: 93000,
    monthlyTraffic: 265000,
    monetization: "mixed",
    ageMonths: 19,
    country: "United Kingdom",
    region: "Europe",
    techStack: ["Custom"],
    verified: true,
    featured: false,
    multiple: 2.33,
    businessLanguage: "EN",
    image:
      "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=1200&q=80",
    assetsIncluded: ["Codebase", "SEO library", "Creator network"],
  }),
  mkListing({
    id: "mk-110",
    titleEN: "DTC Pet Brand Store",
    titleAR: "متجر علامة تجارية لمنتجات الحيوانات",
    summaryEN: "Shopify + TikTok growth engine with healthy repeat purchases.",
    summaryAR: "متجر Shopify مع نمو عبر TikTok ومعدل شراء متكرر جيد.",
    category: "ecommerce",
    askingPriceSAR: 2060000,
    monthlyProfitSAR: 77000,
    monthlyRevenueSAR: 228000,
    monthlyTraffic: 132000,
    monetization: "ecom",
    ageMonths: 31,
    country: "Saudi Arabia",
    region: "Middle East",
    techStack: ["Shopify"],
    verified: true,
    featured: true,
    multiple: 2.23,
    businessLanguage: "AR/EN",
    image:
      "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=80",
    assetsIncluded: ["Domain", "Supplier contracts", "Email/SMS flows", "Ad creatives"],
  }),
  mkListing({
    id: "mk-111",
    titleEN: "Enterprise Translation SaaS",
    titleAR: "منصة ترجمة للمؤسسات",
    summaryEN: "B2B SaaS focused on Arabic localization workflows.",
    summaryAR: "منصة SaaS للشركات تركّز على سير عمل الترجمة العربية.",
    category: "saas",
    askingPriceSAR: 4420000,
    monthlyProfitSAR: 141000,
    monthlyRevenueSAR: 297000,
    monthlyTraffic: 94000,
    monetization: "subscription",
    ageMonths: 44,
    country: "United Arab Emirates",
    region: "Middle East",
    techStack: ["Custom"],
    verified: true,
    featured: true,
    multiple: 2.61,
    businessLanguage: "AR/EN",
    image:
      "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1200&q=80",
    assetsIncluded: ["Codebase", "Enterprise contracts", "Localization memories"],
  }),
];

export const adaptLegacyListing = (legacy) => {
  const category = LEGACY_CATEGORY_BRIDGE[legacy.category] || "other";
  const monthlyProfit = Number(legacy.monthlyProfit) || 0;
  const annualProfit = monthlyProfit * 12;
  const multiple = annualProfit ? Number(legacy.price) / annualProfit : 0;

  return mkListing({
    id: String(legacy.id),
    titleEN: legacy.title,
    titleAR: legacy.title,
    summaryEN: "Legacy listing imported from existing catalog.",
    summaryAR: "إعلان سابق تم استيراده من الكتالوج الحالي.",
    category,
    askingPriceSAR: Number(legacy.price) || 0,
    monthlyProfitSAR: monthlyProfit,
    monthlyRevenueSAR: Number(legacy.monthlyRevenue) || 0,
    monthlyTraffic: Math.max(legacy.views || 0, 8000),
    monetization: MONETIZATION_BRIDGE[legacy.monetization] || "mixed",
    ageMonths: Math.max(12, (Number(legacy.ageYears) || 2) * 12),
    country: legacy.location || "Unknown",
    region: legacy.region || "Global",
    techStack: [
      category === "ecommerce"
        ? "Shopify"
        : category === "plugins" || category === "content"
          ? "WordPress"
          : "Custom",
    ],
    verified: Boolean(legacy.verified),
    featured: Boolean(legacy.featured),
    multiple: Number.isFinite(multiple) ? Number(multiple.toFixed(2)) : 0,
    businessLanguage: "AR/EN",
    image: legacy.image || FALLBACK_IMAGE,
    assetsIncluded: ["Domain", "Core assets", "Performance snapshots"],
  });
};

export const LEGACY_LISTINGS = businesses.map(adaptLegacyListing);

export const DEFAULT_LISTINGS = [...MARKETPLACE_LISTINGS, ...LEGACY_LISTINGS];

export const PARTNER_POSTS = [
  {
    id: "pt-201",
    projectName: "Revenue Ops Copilot",
    summary:
      "Looking for an operator who can own delivery and customer onboarding in GCC.",
    roleNeeded: "Operator",
    budgetMinSAR: 18000,
    budgetMaxSAR: 45000,
    industryInterest: "B2B Services",
    region: "Riyadh",
    timezone: "GMT+3",
    commitmentLevel: "Part-time",
    verified: true,
  },
  {
    id: "pt-202",
    projectName: "Arabic Creator Commerce",
    summary: "Need a co-founder to lead growth partnerships and monetization.",
    roleNeeded: "Co-founder",
    budgetMinSAR: 0,
    budgetMaxSAR: 0,
    industryInterest: "Marketplace",
    region: "Dubai",
    timezone: "GMT+4",
    commitmentLevel: "Full-time",
    verified: true,
  },
  {
    id: "pt-203",
    projectName: "Clinical AI Assistant",
    summary: "Seeking strategic investor with healthtech market access.",
    roleNeeded: "Investor",
    budgetMinSAR: 250000,
    budgetMaxSAR: 1200000,
    industryInterest: "Health",
    region: "Jeddah",
    timezone: "GMT+3",
    commitmentLevel: "Advisory",
    verified: true,
  },
  {
    id: "pt-204",
    projectName: "KSA Subscription Box",
    summary: "Need marketing lead to scale paid social and influencer programs.",
    roleNeeded: "Marketing",
    budgetMinSAR: 12000,
    budgetMaxSAR: 32000,
    industryInterest: "E-commerce",
    region: "Dammam",
    timezone: "GMT+3",
    commitmentLevel: "Part-time",
    verified: false,
  },
  {
    id: "pt-205",
    projectName: "Real Estate Data API",
    summary: "Need tech partner to harden API platform and enterprise security.",
    roleNeeded: "Tech",
    budgetMinSAR: 20000,
    budgetMaxSAR: 50000,
    industryInterest: "SaaS",
    region: "Cairo",
    timezone: "GMT+2",
    commitmentLevel: "Full-time",
    verified: true,
  },
  {
    id: "pt-206",
    projectName: "Wholesale Fashion Portal",
    summary: "Need sales partner to open B2B accounts across Gulf retailers.",
    roleNeeded: "Sales",
    budgetMinSAR: 10000,
    budgetMaxSAR: 22000,
    industryInterest: "Consumer",
    region: "Kuwait City",
    timezone: "GMT+3",
    commitmentLevel: "Part-time",
    verified: false,
  },
  {
    id: "pt-207",
    projectName: "Edtech Skills Platform",
    summary: "Raising seed round and looking for investor with distribution network.",
    roleNeeded: "Investor",
    budgetMinSAR: 350000,
    budgetMaxSAR: 1800000,
    industryInterest: "Edtech",
    region: "Amman",
    timezone: "GMT+3",
    commitmentLevel: "Advisory",
    verified: true,
  },
  {
    id: "pt-208",
    projectName: "SMB Accounting SaaS",
    summary: "Need a co-founder to lead product strategy and retention roadmap.",
    roleNeeded: "Co-founder",
    budgetMinSAR: 0,
    budgetMaxSAR: 0,
    industryInterest: "Fintech",
    region: "Bahrain",
    timezone: "GMT+3",
    commitmentLevel: "Full-time",
    verified: true,
  },
  {
    id: "pt-209",
    projectName: "Regional Influencer Hub",
    summary: "Need operator partner to own creator onboarding and QA operations.",
    roleNeeded: "Operator",
    budgetMinSAR: 9000,
    budgetMaxSAR: 24000,
    industryInterest: "Content",
    region: "Doha",
    timezone: "GMT+3",
    commitmentLevel: "Part-time",
    verified: false,
  },
  {
    id: "pt-210",
    projectName: "Industrial Procurement AI",
    summary: "Need technical sales partner to drive enterprise pipeline.",
    roleNeeded: "Sales",
    budgetMinSAR: 18000,
    budgetMaxSAR: 42000,
    industryInterest: "SaaS",
    region: "Abu Dhabi",
    timezone: "GMT+4",
    commitmentLevel: "Full-time",
    verified: true,
  },
];

export const LISTING_SORT_OPTIONS = [
  { value: "relevant", label: { EN: "Most relevant", AR: "الأكثر صلة" } },
  { value: "newest", label: { EN: "Newest", AR: "الأحدث" } },
  { value: "highest-profit", label: { EN: "Highest profit", AR: "أعلى ربح" } },
  { value: "lowest-price", label: { EN: "Lowest price", AR: "أقل سعر" } },
  { value: "highest-multiple", label: { EN: "Highest multiple", AR: "أعلى مضاعف" } },
];

export const HOW_IT_WORKS_STEPS = [
  {
    EN: {
      title: "Discover",
      description: "Browse verified opportunities with clean metrics and structured filters.",
    },
    AR: {
      title: "اكتشف",
      description: "تصفح فرص موثقة ببيانات واضحة وفلاتر منظمة.",
    },
  },
  {
    EN: {
      title: "Connect Safely",
      description:
        "Request details, message directly, and keep communication in one secure inbox.",
    },
    AR: {
      title: "تواصل بأمان",
      description: "اطلب المعلومات وتواصل مباشرة داخل صندوق رسائل آمن.",
    },
  },
  {
    EN: {
      title: "Close the Deal",
      description: "Use optional escrow and verified documentation to finalize with confidence.",
    },
    AR: {
      title: "أغلق الصفقة",
      description: "استخدم الضمان الاختياري والوثائق الموثقة لإتمام الصفقة بثقة.",
    },
  },
];
