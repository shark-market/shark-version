export const BLOG_CATEGORIES = [
  { value: "all", label: { EN: "All", AR: "الكل" } },
  { value: "Platform News", label: { EN: "Platform News", AR: "أخبار المنصة" } },
  {
    value: "Market & Investment",
    label: { EN: "Market & Investment", AR: "السوق والاستثمار" },
  },
  { value: "Buyer Tips", label: { EN: "Buyer Tips", AR: "نصائح للمشترين" } },
  { value: "Seller Tips", label: { EN: "Seller Tips", AR: "نصائح للبائعين" } },
  {
    value: "Product Updates",
    label: { EN: "Product Updates", AR: "تحديثات المنتج" },
  },
];

export const BLOG_POSTS = [
  {
    id: 1,
    category: "Platform News",
    title: {
      EN: "Shark Market reaches 565M SAR in sales",
      AR: "Shark Market تحقق 565 مليون ريال في المبيعات",
    },
    excerpt: {
      EN: "A new milestone reflecting platform growth and investor confidence in the Gulf market.",
      AR: "محطة جديدة تعكس نمو المنصة وثقة المستثمرين في سوق الخليج الرقمي.",
    },
    readTime: { EN: "4 min read", AR: "4 دقائق قراءة" },
    date: "2025-12-01",
    image: "blog-1",
  },
  {
    id: 2,
    category: "Product Updates",
    title: {
      EN: "Launch of automated financial data verification",
      AR: "إطلاق نظام التحقق الآلي من البيانات المالية",
    },
    excerpt: {
      EN: "A new system ensuring accuracy and reliability of financial data for listed projects.",
      AR: "نظام جديد يضمن دقة وموثوقية البيانات المالية للمشاريع المدرجة.",
    },
    readTime: { EN: "6 min read", AR: "6 دقائق قراءة" },
    date: "2025-12-03",
    image: "blog-2",
  },
  {
    id: 3,
    category: "Seller Tips",
    title: {
      EN: "How to increase your project value before selling",
      AR: "كيف ترفع قيمة مشروعك قبل البيع",
    },
    excerpt: {
      EN: "Practical strategies to improve valuation and attract the right investors.",
      AR: "استراتيجيات عملية لتحسين التقييم وجذب المستثمرين المناسبين.",
    },
    readTime: { EN: "7 min read", AR: "7 دقائق قراءة" },
    date: "2025-12-05",
    image: "blog-3",
  },
  {
    id: 4,
    category: "Buyer Tips",
    title: {
      EN: "Buyer guide to evaluating SaaS projects before purchase",
      AR: "دليل المشتري لتقييم مشاريع SaaS قبل الشراء",
    },
    excerpt: {
      EN: "Clear steps to assess digital projects and avoid common risks.",
      AR: "خطوات واضحة لتقييم المشاريع الرقمية وتجنب المخاطر الشائعة.",
    },
    readTime: { EN: "10 min read", AR: "10 دقائق قراءة" },
    date: "2025-12-08",
    image: "blog-4",
  },
  {
    id: 5,
    category: "Market & Investment",
    title: {
      EN: "Digital projects market trends in the Gulf 2025",
      AR: "اتجاهات سوق المشاريع الرقمية في الخليج 2025",
    },
    excerpt: {
      EN: "A comprehensive analysis of key trends and investment opportunities in the Gulf.",
      AR: "تحليل شامل لأبرز الاتجاهات وفرص الاستثمار في السوق الرقمي الخليجي.",
    },
    readTime: { EN: "8 min read", AR: "8 دقائق قراءة" },
    date: "2025-12-10",
    image: "blog-5",
  },
  {
    id: 6,
    category: "Platform News",
    title: {
      EN: "New updates to improve user experience",
      AR: "تحديثات جديدة لتحسين تجربة المستخدم",
    },
    excerpt: {
      EN: "A quick summary explaining the main idea behind the updates in one line.",
      AR: "ملخص سريع يشرح الفكرة الرئيسية للتحديثات في سطر واحد.",
    },
    readTime: { EN: "5 min read", AR: "5 دقائق قراءة" },
    date: "2025-12-12",
    image: "blog-6",
  },
];

export const BLOG_IMAGE_MAP = {
  "blog-1": ["#0f172a", "#38bdf8"],
  "blog-2": ["#0f172a", "#4f46e5"],
  "blog-3": ["#1f2937", "#22c55e"],
  "blog-4": ["#111827", "#f97316"],
  "blog-5": ["#0b1120", "#14b8a6"],
  "blog-6": ["#111827", "#a855f7"],
};

export const makeBlogImage = (label, colors) => {
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
        Shark Market Blog
      </text>
    </svg>
  `;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};
