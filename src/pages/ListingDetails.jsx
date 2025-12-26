import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { businesses } from "../data/mockdata";
import { getCustomListings } from "../data/listingsStore";
import { getListingViews, incrementListingViews } from "../data/viewsStore";
import { useCurrency } from "../context/CurrencyContext";
import { useAuth } from "../context/AuthContext";
import { PLAN_ACCESS } from "../data/plans";
import LockedSection from "../components/LockedSection";
import LoginModal from "../components/LoginModal";

const LABELS = {
  EN: {
    back: "Back to listings",
    overviewTab: "Overview",
    dataTab: "Data & Numbers",
    techTab: "Tech",
    partnershipTab: "Partnership",
    contactTab: "Contact",
    summary: "Summary",
    highlights: "Highlights",
    financials: "Financials",
    analytics: "Traffic & Analytics",
    assets: "Assets & Tech Stack",
    seller: "Seller details / Data room",
    partnership: "Partnership & Deal",
    contactSection: "Contact",
    statsTitle: "Key stats",
    visits: "Monthly visits",
    engagement: "Engagement rate",
    stageLabel: "Stage",
    contact: "Contact seller",
    requestNda: "Request NDA",
    askingPrice: "Asking Price",
    location: "Location",
    category: "Category",
    projectAge: "Project age",
    businessModel: "Business model",
    monthlyRevenue: "Monthly revenue",
    monthlyProfit: "Monthly profit",
    profitMargin: "Profit margin",
    pageViews: "Monthly page views",
    sessions: "Monthly sessions",
    channels: "Top channels",
    stack: "Tech stack",
    assetsList: "Included assets",
    sellerNotes: "Seller notes",
    dealType: "Deal type",
    support: "Support period",
    ndaInfo: "NDA available for subscribers",
    loginToView: "Log in to view details",
    loginToContact: "Log in to contact",
    upgrade: "Upgrade to start contacting",
    upgradeToUnlock: "Upgrade your plan to unlock details",
    notFound: "Listing not found.",
    goHome: "Go back",
  },
  AR: {
    back: "الرجوع للعروض",
    overviewTab: "نظرة عامة",
    dataTab: "البيانات والأرقام",
    techTab: "التقنية",
    partnershipTab: "الشراكة",
    contactTab: "التواصل",
    summary: "الملخص",
    highlights: "أبرز النقاط",
    financials: "البيانات المالية",
    analytics: "الزيارات والتحليلات",
    assets: "الأصول والتقنية",
    seller: "تفاصيل البائع / غرفة البيانات",
    partnership: "الشراكة والصفقة",
    contactSection: "التواصل",
    statsTitle: "إحصائيات رئيسية",
    visits: "الزيارات الشهرية",
    engagement: "معدل التفاعل",
    stageLabel: "المرحلة",
    contact: "تواصل مع البائع",
    requestNda: "طلب NDA",
    askingPrice: "السعر المطلوب",
    location: "الموقع",
    category: "التصنيف",
    projectAge: "عمر المشروع",
    businessModel: "نموذج العمل",
    monthlyRevenue: "الإيراد الشهري",
    monthlyProfit: "الربح الشهري",
    profitMargin: "هامش الربح",
    pageViews: "مشاهدات شهرية",
    sessions: "الجلسات الشهرية",
    channels: "أهم القنوات",
    stack: "التقنيات المستخدمة",
    assetsList: "الأصول المتضمنة",
    sellerNotes: "ملاحظات البائع",
    dealType: "نوع الصفقة",
    support: "مدة الدعم",
    ndaInfo: "إتاحة NDA للمشتركين",
    loginToView: "سجّل الدخول لعرض التفاصيل",
    loginToContact: "سجّل الدخول للتواصل",
    upgrade: "رقّ اشتراكك لبدء التواصل",
    upgradeToUnlock: "رقّ اشتراكك لفتح بقية التفاصيل",
    notFound: "الإعلان غير موجود.",
    goHome: "العودة",
  },
};

const CATEGORY_LABELS = {
  "website-content": { EN: "Content Website", AR: "موقع محتوى" },
  "website-blog": { EN: "Blog", AR: "مدونة" },
  "website-directory": { EN: "Directory", AR: "دليل" },
  "website-community": { EN: "Community", AR: "مجتمع" },
  "website-reviews": { EN: "Reviews", AR: "مراجعات" },
  saas: { EN: "SaaS", AR: "SaaS" },
  "app-ios": { EN: "iOS App", AR: "تطبيق iOS" },
  "app-android": { EN: "Android App", AR: "تطبيق Android" },
  "youtube-channel": { EN: "YouTube Channel", AR: "قناة يوتيوب" },
  "social-instagram": { EN: "Instagram Account", AR: "حساب انستغرام" },
  "social-x": { EN: "X Account", AR: "حساب X" },
  "social-tiktok": { EN: "TikTok Account", AR: "حساب تيك توك" },
  "social-snapchat": { EN: "Snapchat Account", AR: "حساب سناب شات" },
  newsletter: { EN: "Newsletter", AR: "نشرة بريدية" },
  "ai-tools": { EN: "AI Tools", AR: "أدوات AI" },
  ecommerce: { EN: "E-commerce", AR: "تجارة إلكترونية" },
  domains: { EN: "Domains", AR: "نطاقات" },
  other: { EN: "Other", AR: "أخرى" },
};

const getCategoryLabel = (category, language) => {
  const label = CATEGORY_LABELS[category];
  return label?.[language] || label?.EN || category;
};

const buildMetrics = (price) => {
  const monthlyRevenue = Math.round(price * 0.02);
  const monthlyProfit = Math.round(price * 0.011);
  const profitMargin = Math.min(
    45,
    Math.max(18, Math.round((monthlyProfit / monthlyRevenue) * 100))
  );
  const monthlyViews = Math.round(monthlyRevenue / 45);
  return { monthlyRevenue, monthlyProfit, profitMargin, monthlyViews };
};

export default function ListingDetails({ language = "EN" }) {
  const { id } = useParams();
  const listing = useMemo(() => {
    const combined = [...getCustomListings(), ...businesses];
    return combined.find((item) => String(item.id) === String(id));
  }, [id]);
  const text = LABELS[language] || LABELS.EN;
  const isArabic = language === "AR";
  const locale = isArabic ? "ar-SA" : "en-US";
  const navigate = useNavigate();
  const { user, role } = useAuth();
  const canAccess = PLAN_ACCESS[role]?.canViewFinancials ?? false;
  const canRequestNda = PLAN_ACCESS[role]?.canRequestNda ?? false;
  const canContact = PLAN_ACCESS[role]?.canContact ?? false;
  const shouldLock = !user || !canAccess;
  const { formatCurrency } = useCurrency();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [viewCount, setViewCount] = useState(() => getListingViews(id));

  useEffect(() => {
    if (!listing) return;
    const next = incrementListingViews(listing.id, listing.views);
    setViewCount(next);
  }, [listing]);

  if (!listing) {
    return (
      <section className="listing-details">
        <div className="container listing-details-empty">
          <h2>{text.notFound}</h2>
          <button className="btn btn-dark" type="button" onClick={() => navigate("/")}>
            {text.goHome}
          </button>
        </div>
      </section>
    );
  }

  const { monthlyRevenue, monthlyProfit, profitMargin, monthlyViews } =
    buildMetrics(listing.price);
  const listingViews = Number(viewCount) || getListingViews(listing.id, listing.views);
  const engagementRate = listingViews
    ? Math.min(100, Math.round((listing.likes / listingViews) * 100))
    : 0;
  const lockMessage = user ? text.upgradeToUnlock : text.loginToView;
  const primaryActionLabel = !user
    ? text.loginToContact
    : canContact
      ? text.contact
      : text.upgrade;
  const ageLabel = listing.ageYears
    ? isArabic
      ? `${listing.ageYears} سنوات`
      : `${listing.ageYears} years`
    : isArabic
      ? "غير محدد"
      : "N/A";
  const stageLabel = listing.stage || (isArabic ? "غير محدد" : "N/A");
  const categoryLabel = getCategoryLabel(listing.category, language);

  const handlePrimaryAction = () => {
    if (!user) {
      setShowLoginModal(true);
      return;
    }
    if (!canContact) {
      navigate("/pricing");
      return;
    }
    navigate("/inbox", { state: { listingId: listing.id } });
  };

  const handleLockedAction = () => {
    if (!user) {
      setShowLoginModal(true);
      return;
    }
    navigate("/pricing");
  };

  return (
    <section className="listing-details">
      <div className="container">
        <Link className="back-link" to="/">
          {text.back}
        </Link>

        <div className="details-tabs">
          {[
            { id: "overview", label: text.overviewTab },
            { id: "data", label: text.dataTab },
            { id: "tech", label: text.techTab },
            { id: "partnership", label: text.partnershipTab },
            { id: "contact", label: text.contactTab },
          ].map((tab) => (
            <a key={tab.id} className="tab-chip" href={`#${tab.id}`}>
              {tab.label}
            </a>
          ))}
        </div>

        <div className="details-layout">
          <div className="details-main">
            <div className="details-header" id="overview">
              <span className="pill">{categoryLabel}</span>
              <h1>{listing.title}</h1>
              <p className="muted">
                {text.location}: {listing.location}
              </p>
            </div>
            <div className="details-image">
              <img src={listing.image} alt={listing.title} />
            </div>

            <section className="details-card details-stats">
              <h3>{text.statsTitle}</h3>
              <div className="stats-grid">
                <div>
                  <span className="muted">{text.visits}</span>
                  <strong>{monthlyViews.toLocaleString(locale)}</strong>
                </div>
                <div>
                  <span className="muted">{text.engagement}</span>
                  <strong>{engagementRate}%</strong>
                </div>
                <div>
                  <span className="muted">{text.stageLabel}</span>
                  <strong>{stageLabel}</strong>
                </div>
              </div>
            </section>

            <section className="details-card">
              <h3>{text.summary}</h3>
              <p className="muted">
                {isArabic
                  ? "فرصة رقمية بمؤشرات نمو ثابتة مع قابلية توسع واضحة داخل السوق السعودي."
                  : "A verified digital opportunity with steady growth and clear expansion potential."}
              </p>
            </section>

            <section className="details-card">
              <h3>{text.highlights}</h3>
              <ul className="details-list">
                <li>
                  {isArabic
                    ? "طلب قوي داخل السوق المحلي مع تفاعل مستمر."
                    : "Strong local demand with consistent engagement."}
                </li>
                <li>
                  {isArabic
                    ? "نموذج ربحي واضح وقابل للتوسع."
                    : "Clear monetization model and scalable roadmap."}
                </li>
                <li>
                  {isArabic
                    ? "عمليات تشغيلية مبسطة وفريق صغير."
                    : "Lean operations with a small, efficient team."}
                </li>
              </ul>
            </section>

            <LockedSection
              title={text.financials}
              isLocked={shouldLock}
              message={lockMessage}
              onAction={handleLockedAction}
            >
              <div className="metric-list" id="data">
                <div>
                  <span className="muted">{text.monthlyRevenue}</span>
                  <strong>{formatCurrency(monthlyRevenue, { locale })}</strong>
                </div>
                <div>
                  <span className="muted">{text.monthlyProfit}</span>
                  <strong>{formatCurrency(monthlyProfit, { locale })}</strong>
                </div>
                <div>
                  <span className="muted">{text.profitMargin}</span>
                  <strong>{profitMargin}%</strong>
                </div>
              </div>
            </LockedSection>

            <LockedSection
              title={text.analytics}
              isLocked={shouldLock}
              message={lockMessage}
              onAction={handleLockedAction}
            >
              <div className="metric-list">
                <div>
                  <span className="muted">{text.pageViews}</span>
                  <strong>{monthlyViews.toLocaleString(locale)}</strong>
                </div>
                <div>
                  <span className="muted">{text.sessions}</span>
                  <strong>{Math.round(monthlyViews * 1.6).toLocaleString(locale)}</strong>
                </div>
                <div>
                  <span className="muted">{text.channels}</span>
                  <strong>{isArabic ? "بحث عضوي · إحالات" : "Organic · Referral"}</strong>
                </div>
              </div>
            </LockedSection>

            <LockedSection
              title={text.assets}
              isLocked={shouldLock}
              message={lockMessage}
              onAction={handleLockedAction}
            >
              <div className="detail-rows" id="tech">
                <div>
                  <span className="muted">{text.stack}</span>
                  <strong>{isArabic ? "React · Supabase · Vite" : "React · Supabase · Vite"}</strong>
                </div>
                <div>
                  <span className="muted">{text.assetsList}</span>
                  <strong>
                    {isArabic
                      ? "الدومين، قاعدة البيانات، التصميم"
                      : "Domain, database, design assets"}
                  </strong>
                </div>
              </div>
            </LockedSection>

            <LockedSection
              title={text.partnership}
              isLocked={shouldLock}
              message={lockMessage}
              onAction={handleLockedAction}
            >
              <div className="detail-rows" id="partnership">
                <div>
                  <span className="muted">{text.dealType}</span>
                  <strong>
                    {listing.dealType === "partner"
                      ? isArabic
                        ? "شراكة"
                        : "Partnership"
                      : listing.dealType === "investment"
                        ? isArabic
                          ? "استثمار"
                          : "Investment"
                        : isArabic
                          ? "بيع كامل"
                          : "Full sale"}
                  </strong>
                </div>
                <div>
                  <span className="muted">{text.support}</span>
                  <strong>
                    {isArabic ? "30 يوم دعم بعد البيع" : "30 days post-sale support"}
                  </strong>
                </div>
              </div>
            </LockedSection>

            <LockedSection
              title={text.contactSection}
              isLocked={shouldLock}
              message={lockMessage}
              onAction={handleLockedAction}
            >
              <div className="detail-rows" id="contact">
                <div>
                  <span className="muted">{text.sellerNotes}</span>
                  <strong>
                    {isArabic
                      ? "التواصل يتم عبر صندوق الوارد داخل المنصة."
                      : "All communication happens via the built-in inbox."}
                  </strong>
                </div>
                <div>
                  <span className="muted">{text.ndaInfo}</span>
                  <strong>{isArabic ? "متاح للمشتركين" : "Available for subscribers"}</strong>
                </div>
              </div>
            </LockedSection>
          </div>

          <aside className="details-sidebar">
            <div className="details-sidebar-card">
              <div className="details-price">
                <span className="muted">{text.askingPrice}</span>
                <strong>{formatCurrency(listing.price, { locale })}</strong>
              </div>
              <button className="btn btn-dark btn-block" type="button" onClick={handlePrimaryAction}>
                {primaryActionLabel}
              </button>
              {user && canRequestNda ? (
                <button className="btn btn-ghost btn-block" type="button">
                  {text.requestNda}
                </button>
              ) : null}
              <div className="quick-info">
                <div>
                  <span className="muted">{text.category}</span>
                  <strong>{categoryLabel}</strong>
                </div>
                <div>
                  <span className="muted">{text.location}</span>
                  <strong>{listing.location}</strong>
                </div>
                <div>
                  <span className="muted">{text.projectAge}</span>
                  <strong>{ageLabel}</strong>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
      <LoginModal
        open={showLoginModal}
        language={language}
        onClose={() => setShowLoginModal(false)}
      />
    </section>
  );
}
