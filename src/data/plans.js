export const PLANS = [
  {
    id: "free",
    title: { EN: "Free", AR: "مجاني" },
    priceMonthlySAR: 0,
    priceYearlySAR: 0,
    billing: "free",
    popular: false,
    description: {
      EN: "Browse listings with basic details only.",
      AR: "تصفّح العروض بمعلومات أساسية فقط.",
    },
    features: {
      EN: [
        "Browse listings + basic filters",
        "Basic listing summary only",
        "No direct contact or inbox",
        "No NDA requests",
        "Locked financials & data",
      ],
      AR: [
        "تصفح القوائم + فلاتر أساسية",
        "عرض ملخص الإعلان فقط",
        "بدون تواصل أو صندوق وارد",
        "بدون طلب NDA",
        "بيانات مالية مقفلة",
      ],
    },
    successFeePercent: 7,
  },
  {
    id: "plus",
    title: { EN: "Basic", AR: "أساسي" },
    priceMonthlySAR: 59,
    priceYearlySAR: 590,
    billing: "monthly",
    popular: true,
    description: {
      EN: "Unlock most details with inbox access.",
      AR: "فتح معظم التفاصيل مع صندوق الوارد.",
    },
    features: {
      EN: [
        "Unlock most listing details",
        "Basic financial data",
        "Inbox + direct contact",
        "Favorites + partner list access",
        "Limited NDA requests",
      ],
      AR: [
        "فتح معظم التفاصيل",
        "عرض البيانات المالية الأساسية",
        "صندوق وارد + تواصل مباشر",
        "المفضلة + دخول قائمة الشركاء",
        "طلبات NDA محدودة",
      ],
    },
    successFeePercent: 5,
  },
  {
    id: "pro",
    title: { EN: "Pro", AR: "احترافية" },
    priceMonthlySAR: 149,
    priceYearlySAR: 1490,
    billing: "monthly",
    popular: false,
    description: {
      EN: "Full access, priority exposure, and deeper data.",
      AR: "وصول كامل مع أولوية وبيانات أعمق.",
    },
    features: {
      EN: [
        "Everything in Basic",
        "Unlimited messaging",
        "Priority exposure + Pro badge",
        "Unlimited NDA requests",
        "Full data room access",
      ],
      AR: [
        "كل ما في أساسي",
        "مراسلة غير محدودة",
        "أولوية الظهور + شارة Pro",
        "طلبات NDA غير محدودة",
        "عرض كل البيانات والملفات",
      ],
    },
    successFeePercent: 3,
  },
];

export const SUCCESS_FEE_NOTE = {
  EN: "No fees are charged unless the sale is completed successfully.",
  AR: "لا توجد رسوم إلا عند إتمام الصفقة بنجاح.",
};

export const PLAN_ACCESS = {
  guest: {
    canContact: false,
    canViewFinancials: false,
    canOpenPartner: false,
    canMessage: false,
    canRequestNda: false,
  },
  free: {
    canContact: false,
    canViewFinancials: false,
    canOpenPartner: false,
    canMessage: false,
    canRequestNda: false,
  },
  plus: {
    canContact: true,
    canViewFinancials: true,
    canOpenPartner: true,
    canMessage: true,
    canRequestNda: true,
  },
  pro: {
    canContact: true,
    canViewFinancials: true,
    canOpenPartner: true,
    canMessage: true,
    canRequestNda: true,
  },
  admin: {
    canContact: true,
    canViewFinancials: true,
    canOpenPartner: true,
    canMessage: true,
    canRequestNda: true,
  },
};

export const PLAN_TIER_MAP = {
  premium_buyer: "plus",
  pro_buyer: "pro",
  seller_plus: "plus",
  seller_pro: "pro",
};

export const getUserPlanId = (profile) => {
  const rawTier = profile?.subscription_tier;
  if (!rawTier) return "free";
  return PLAN_TIER_MAP[rawTier] || rawTier;
};
