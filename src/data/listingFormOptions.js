export const CATEGORY_OPTIONS = [
  { value: "website-content", label: { EN: "Content website", AR: "موقع محتوى" } },
  { value: "website-blog", label: { EN: "Blog", AR: "مدونة" } },
  { value: "website-directory", label: { EN: "Directory", AR: "دليل" } },
  { value: "saas", label: { EN: "SaaS", AR: "SaaS" } },
  { value: "app-ios", label: { EN: "iOS App", AR: "تطبيق iOS" } },
  { value: "app-android", label: { EN: "Android App", AR: "تطبيق Android" } },
  { value: "youtube-channel", label: { EN: "YouTube Channel", AR: "قناة يوتيوب" } },
  { value: "social-instagram", label: { EN: "Instagram", AR: "انستغرام" } },
  { value: "social-x", label: { EN: "X", AR: "X" } },
  { value: "social-tiktok", label: { EN: "TikTok", AR: "تيك توك" } },
  { value: "social-snapchat", label: { EN: "Snapchat", AR: "سناب شات" } },
  { value: "newsletter", label: { EN: "Newsletter", AR: "نشرة بريدية" } },
  { value: "ai-tools", label: { EN: "AI Tools", AR: "أدوات AI" } },
  { value: "ecommerce", label: { EN: "E-commerce", AR: "تجارة إلكترونية" } },
  { value: "domains", label: { EN: "Domains", AR: "نطاقات" } },
  { value: "other", label: { EN: "Other", AR: "أخرى" } },
];

export const STAGE_OPTIONS = [
  { value: "MVP", label: { EN: "MVP", AR: "MVP" } },
  { value: "Revenue", label: { EN: "Revenue", AR: "إيرادات" } },
  { value: "Growth", label: { EN: "Growth", AR: "نمو" } },
  { value: "Stable", label: { EN: "Stable", AR: "ثابت" } },
];

export const DEAL_TYPES = [
  { value: "full", label: { EN: "Full sale", AR: "بيع كامل" } },
  { value: "partner", label: { EN: "Partner", AR: "شراكة" } },
  { value: "investment", label: { EN: "Investment", AR: "استثمار" } },
];

export const MONETIZATION_OPTIONS = [
  { value: "subscriptions", label: { EN: "Subscriptions", AR: "اشتراكات" } },
  { value: "ads", label: { EN: "Ads", AR: "إعلانات" } },
  { value: "commission", label: { EN: "Commission", AR: "عمولة" } },
  { value: "products", label: { EN: "Products", AR: "منتجات" } },
  { value: "services", label: { EN: "Services", AR: "خدمات" } },
  { value: "mixed", label: { EN: "Mixed", AR: "مختلط" } },
];

export const REGION_OPTIONS = [
  { value: "saudi", label: { EN: "Saudi Arabia", AR: "السعودية" } },
  { value: "gulf", label: { EN: "Gulf", AR: "الخليج" } },
  { value: "global", label: { EN: "Global", AR: "عالمي" } },
];

export const PARTNER_ROLE_OPTIONS = [
  { value: "technical", label: { EN: "Technical", AR: "تقني" } },
  { value: "marketing", label: { EN: "Marketing", AR: "تسويق" } },
  { value: "operations", label: { EN: "Operations", AR: "تشغيل" } },
  { value: "investor", label: { EN: "Investor", AR: "مستثمر" } },
];

export const COMMITMENT_OPTIONS = [
  { value: "full-time", label: { EN: "Full-time", AR: "دوام كامل" } },
  { value: "part-time", label: { EN: "Part-time", AR: "دوام جزئي" } },
  { value: "hours", label: { EN: "Hours per week", AR: "ساعات أسبوعية" } },
];

export const DEFAULT_LISTING_FORM = {
  title: "",
  category: "saas",
  location: "",
  region: "saudi",
  price: "",
  stage: "MVP",
  dealType: "full",
  monetization: "subscriptions",
  image: "",
  equityPercent: "",
  partnerRole: "technical",
  partnerCommitment: "part-time",
};

