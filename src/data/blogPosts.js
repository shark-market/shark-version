const COVER_COLORS = [
  ["#0f172a", "#38bdf8"],
  ["#111827", "#f97316"],
  ["#1f2937", "#22c55e"],
  ["#0b1120", "#14b8a6"],
  ["#111827", "#a855f7"],
  ["#0f172a", "#f43f5e"],
  ["#111827", "#38bdf8"],
  ["#0f172a", "#4f46e5"],
];

export const BLOG_CATEGORIES = [
  { value: "all", label: { EN: "All", AR: "الكل" } },
  { value: "news", label: { EN: "News", AR: "أخبار" } },
  { value: "stories", label: { EN: "Stories", AR: "قصص" } },
  { value: "growth", label: { EN: "Growth", AR: "نمو" } },
];

const makeBlogImage = (label, colors) => {
  const [start, end] = colors;
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800">
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="${start}" />
          <stop offset="100%" stop-color="${end}" />
        </linearGradient>
      </defs>
      <rect width="1200" height="800" fill="url(#g)" />
      <rect x="70" y="520" width="1060" height="210" rx="24" fill="#ffffff" opacity="0.9" />
      <text x="110" y="600" font-family="Plus Jakarta Sans, Arial" font-size="42" font-weight="700" fill="#0f172a">
        ${label}
      </text>
      <text x="110" y="660" font-family="Plus Jakarta Sans, Arial" font-size="24" fill="#475569">
        Shark Market
      </text>
    </svg>
  `;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

const cover = (label, index) => makeBlogImage(label, COVER_COLORS[index % COVER_COLORS.length]);

export const BLOG_POSTS = [
  {
    id: "news-1",
    category: "news",
    title: {
      AR: "تحديث مؤشرات السوق للربع الثاني",
      EN: "Q2 marketplace indicators update",
    },
    excerpt: {
      AR: "نمو في متوسط المضاعفات للمشاريع ذات الإيراد المتكرر في السعودية.",
      EN: "Higher valuation multiples for recurring-revenue assets across KSA.",
    },
    date: "2025-07-12",
    coverImage: cover("تحديث مؤشرات السوق", 0),
  },
  {
    id: "news-2",
    category: "news",
    title: {
      AR: "إطلاق تدقيق سريع للبيانات المالية",
      EN: "Fast-track financial verification launches",
    },
    excerpt: {
      AR: "مسار جديد يقلل وقت المراجعة الأولية إلى 72 ساعة.",
      EN: "A new path cuts initial review time down to 72 hours.",
    },
    date: "2025-07-08",
    coverImage: cover("تدقيق مالي سريع", 1),
  },
  {
    id: "news-3",
    category: "news",
    title: {
      AR: "شراكات دفع محلية لتحويلات أسرع",
      EN: "Local payment partners for faster transfers",
    },
    excerpt: {
      AR: "دعم مدفوعات محلية بعملات الخليج لتسهيل إتمام الصفقات.",
      EN: "Local GCC payments supported to streamline deal closures.",
    },
    date: "2025-06-28",
    coverImage: cover("شراكات دفع محلية", 2),
  },
  {
    id: "stories-1",
    category: "stories",
    title: {
      AR: "قصة بيع متجر عناية بالبشرة خلال 3 أسابيع",
      EN: "A skincare store sale closed in 3 weeks",
    },
    excerpt: {
      AR: "تنظيم البيانات المالية ووضوح الطلب ساعدا في تسريع الصفقة.",
      EN: "Clear financials and a focused ask accelerated the deal.",
    },
    date: "2025-07-02",
    coverImage: cover("قصة بيع متجر", 3),
  },
  {
    id: "stories-2",
    category: "stories",
    title: {
      AR: "شراكة تشغيلية لمنصة SaaS للفوترة",
      EN: "An operating partner joins a billing SaaS",
    },
    excerpt: {
      AR: "شريك تشغيلي دخل بنسبة 30% لتوسيع المبيعات في السعودية.",
      EN: "A 30% operating partner to scale Saudi sales.",
    },
    date: "2025-06-20",
    coverImage: cover("شراكة SaaS", 4),
  },
  {
    id: "stories-3",
    category: "stories",
    title: {
      AR: "استحواذ على مدونة تعليمية وتحويلها لاشتراكات",
      EN: "An education blog turned into subscriptions",
    },
    excerpt: {
      AR: "المشتري ركز على بناء مجتمع مدفوع وزيادة الدخل المتكرر.",
      EN: "The buyer built a paid community to grow recurring revenue.",
    },
    date: "2025-06-12",
    coverImage: cover("مدونة تعليمية", 5),
  },
  {
    id: "growth-1",
    category: "growth",
    title: {
      AR: "قائمة تدقيق قبل عرض المشروع للبيع",
      EN: "Pre-sale checklist for sellers",
    },
    excerpt: {
      AR: "خطوات بسيطة لتجهيز التقارير المالية والعمليات التشغيلية.",
      EN: "Simple steps to prep financials and operations docs.",
    },
    date: "2025-07-06",
    coverImage: cover("قائمة تدقيق البيع", 6),
  },
  {
    id: "growth-2",
    category: "growth",
    title: {
      AR: "كيف تحدد المضاعف العادل لمشروعك",
      EN: "How to price your asset with a fair multiple",
    },
    excerpt: {
      AR: "المضاعف يعتمد على الاستقرار، النمو، وتنوع مصادر الدخل.",
      EN: "Multiples depend on stability, growth, and revenue diversity.",
    },
    date: "2025-06-30",
    coverImage: cover("تحديد المضاعف", 7),
  },
  {
    id: "growth-3",
    category: "growth",
    title: {
      AR: "مراجعة مصادر الزيارات قبل الشراء",
      EN: "Review traffic sources before buying",
    },
    excerpt: {
      AR: "فهم جودة الزيارات يساعد على تقدير المخاطر الفعلية.",
      EN: "Traffic quality helps you assess real acquisition risk.",
    },
    date: "2025-06-18",
    coverImage: cover("مراجعة الزيارات", 0),
  },
  {
    id: "stories-4",
    category: "stories",
    title: {
      AR: "صفقة جزئية لبرمجية تحليلات المتاجر",
      EN: "A partial acquisition for a retail analytics tool",
    },
    excerpt: {
      AR: "بيع 40% من الحصة مقابل تطوير ميزات ذكاء أعمال.",
      EN: "A 40% stake sold to accelerate BI feature development.",
    },
    date: "2025-06-08",
    coverImage: cover("تحليلات المتاجر", 1),
  },
  {
    id: "news-4",
    category: "news",
    title: {
      AR: "تحسينات تجربة المشتري في صفحة العروض",
      EN: "Buyer experience improvements on listings",
    },
    excerpt: {
      AR: "عرض مؤشرات الجودة والموثوقية بشكل أوضح داخل البطاقة.",
      EN: "Clearer quality and verification indicators on cards.",
    },
    date: "2025-06-04",
    coverImage: cover("تحسينات تجربة المشتري", 2),
  },
  {
    id: "growth-4",
    category: "growth",
    title: {
      AR: "تهيئة غرفة بيانات منظمة للمشترين",
      EN: "Setting up a buyer-ready data room",
    },
    excerpt: {
      AR: "ترتيب الملفات يعزز الثقة ويقلل زمن الفحص.",
      EN: "Structured files build trust and shorten diligence time.",
    },
    date: "2025-05-30",
    coverImage: cover("غرفة بيانات منظمة", 3),
  },
  {
    id: "stories-5",
    category: "stories",
    title: {
      AR: "تحويل نشرة بريدية إلى مشروع إعلاني مربح",
      EN: "Turning a newsletter into ad revenue",
    },
    excerpt: {
      AR: "إعادة تسعير الرعايات رفعت الدخل بنسبة 35%.",
      EN: "Repricing sponsorships lifted revenue by 35%.",
    },
    date: "2025-05-22",
    coverImage: cover("نشرة بريدية مربحة", 4),
  },
];
