import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Hero from "../components/Hero";
import Filters from "../components/Filters";
import ListingsGrid from "../components/ListingsGrid";
import Footer from "../components/Footer";
import { useCurrency } from "../context/CurrencyContext";
import UpgradeModal from "../components/UpgradeModal";
import { PLAN_ACCESS } from "../data/plans";

import { businesses } from "../data/mockdata";
import { getCustomListings } from "../data/listingsStore";
import { TEXT } from "../data/translations";

const HERO_CATEGORIES = [
  { value: "all", label: { EN: "All", AR: "الكل" } },
  { value: "websites", label: { EN: "Websites", AR: "مواقع" } },
  { value: "saas", label: { EN: "SaaS", AR: "SaaS" } },
  { value: "ecommerce", label: { EN: "E-commerce", AR: "تجارة إلكترونية" } },
  { value: "apps", label: { EN: "Apps", AR: "تطبيقات" } },
  { value: "channels", label: { EN: "Channels / Accounts", AR: "قنوات / حسابات" } },
  { value: "domains", label: { EN: "Domains", AR: "نطاقات" } },
  { value: "other", label: { EN: "Other", AR: "أخرى" } },
];

const ASSET_GROUPS = [
  {
    value: "websites",
    label: { EN: "Websites", AR: "مواقع" },
    options: [
      { value: "website-content", label: { EN: "Content", AR: "محتوى" } },
      { value: "website-blog", label: { EN: "Blog", AR: "مدونة" } },
      { value: "website-directory", label: { EN: "Directory", AR: "دليل" } },
      { value: "website-community", label: { EN: "Community", AR: "مجتمع" } },
      { value: "website-reviews", label: { EN: "Reviews", AR: "مراجعات" } },
    ],
  },
  {
    value: "saas",
    label: { EN: "SaaS", AR: "SaaS" },
    options: [{ value: "saas", label: { EN: "SaaS", AR: "SaaS" } }],
  },
  {
    value: "apps",
    label: { EN: "Apps", AR: "تطبيقات" },
    options: [
      { value: "app-ios", label: { EN: "iOS", AR: "iOS" } },
      { value: "app-android", label: { EN: "Android", AR: "Android" } },
    ],
  },
  {
    value: "youtube",
    label: { EN: "YouTube Channels", AR: "قنوات يوتيوب" },
    options: [
      { value: "youtube-channel", label: { EN: "YouTube Channel", AR: "قناة يوتيوب" } },
    ],
  },
  {
    value: "social",
    label: { EN: "Social Media Accounts", AR: "حسابات تواصل" },
    options: [
      { value: "social-instagram", label: { EN: "Instagram", AR: "انستغرام" } },
      { value: "social-x", label: { EN: "X", AR: "X" } },
      { value: "social-tiktok", label: { EN: "TikTok", AR: "تيك توك" } },
      { value: "social-snapchat", label: { EN: "Snapchat", AR: "سناب شات" } },
    ],
  },
  {
    value: "newsletter",
    label: { EN: "Newsletters", AR: "نشرات بريدية" },
    options: [
      { value: "newsletter", label: { EN: "Newsletter", AR: "نشرة بريدية" } },
    ],
  },
  {
    value: "ai",
    label: { EN: "AI Tools", AR: "أدوات AI" },
    options: [
      { value: "ai-tools", label: { EN: "AI Tools", AR: "أدوات AI" } },
    ],
  },
  {
    value: "ecommerce",
    label: { EN: "E-commerce Stores", AR: "متاجر إلكترونية" },
    options: [
      { value: "ecommerce", label: { EN: "E-commerce", AR: "تجارة إلكترونية" } },
    ],
  },
  {
    value: "domains",
    label: { EN: "Domains", AR: "نطاقات" },
    options: [{ value: "domains", label: { EN: "Domains", AR: "نطاقات" } }],
  },
  {
    value: "other",
    label: { EN: "Other", AR: "أخرى" },
    options: [{ value: "other", label: { EN: "Other", AR: "أخرى" } }],
  },
];

const MONETIZATION_OPTIONS = [
  { value: "subscriptions", label: { EN: "Subscriptions", AR: "اشتراكات" } },
  { value: "ads", label: { EN: "Ads", AR: "إعلانات" } },
  { value: "commission", label: { EN: "Commission", AR: "عمولة" } },
  { value: "products", label: { EN: "Products", AR: "منتجات" } },
  { value: "services", label: { EN: "Services", AR: "خدمات" } },
  { value: "mixed", label: { EN: "Mixed", AR: "مختلط" } },
];

const REGION_OPTIONS = [
  { value: "all", label: { EN: "All regions", AR: "كل المناطق" } },
  { value: "saudi", label: { EN: "Saudi Arabia", AR: "السعودية" } },
  { value: "gulf", label: { EN: "Gulf", AR: "الخليج" } },
  { value: "global", label: { EN: "Global", AR: "عالمي" } },
];

const DEAL_TYPES = [
  { value: "all", label: { EN: "All", AR: "الكل" } },
  { value: "full", label: { EN: "Full Sale", AR: "بيع كامل" } },
  { value: "partner", label: { EN: "Partner", AR: "شريك" } },
  { value: "investment", label: { EN: "Investment", AR: "استثمار" } },
];

const STAGE_OPTIONS = [
  { value: "all", label: { EN: "All stages", AR: "كل المراحل" } },
  { value: "MVP", label: { EN: "MVP", AR: "MVP" } },
  { value: "Revenue", label: { EN: "Generating revenue", AR: "يحقق دخل" } },
  { value: "Growth", label: { EN: "Growth", AR: "نمو" } },
  { value: "Stable", label: { EN: "Stable", AR: "ثابت" } },
];

const PARTNER_ROLE_OPTIONS = [
  { value: "all", label: { EN: "All roles", AR: "كل الأدوار" } },
  { value: "technical", label: { EN: "Technical", AR: "تقني" } },
  { value: "marketing", label: { EN: "Marketing", AR: "تسويق" } },
  { value: "operations", label: { EN: "Operations", AR: "تشغيل" } },
  { value: "investor", label: { EN: "Investor", AR: "مستثمر" } },
];

const COMMITMENT_OPTIONS = [
  { value: "all", label: { EN: "All", AR: "الكل" } },
  { value: "full-time", label: { EN: "Full-time", AR: "دوام كامل" } },
  { value: "part-time", label: { EN: "Part-time", AR: "دوام جزئي" } },
  { value: "hours", label: { EN: "Hours per week", AR: "ساعات أسبوعية" } },
];

const parseNumber = (value) =>
  Number(value) || Number(String(value).replace(/[^0-9.]/g, "")) || 0;

export default function Home({
  language = "EN",
  isAuthenticated = false,
  onRequireAuth,
  profile,
  role = "guest",
}) {
  const text = TEXT[language] || TEXT.EN;
  const isArabic = language === "AR";
  const { currency, currencies, toSAR } = useCurrency();
  const currencyLabel = isArabic
    ? currencies?.[currency]?.symbol || currency
    : currencies?.[currency]?.label || currency;
  const navigate = useNavigate();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const categoryLabels = useMemo(() => {
    const next = {};
    ASSET_GROUPS.forEach((group) => {
      group.options.forEach((option) => {
        next[option.value] = option.label[language] || option.label.EN;
      });
    });
    return next;
  }, [language]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [heroCategory, setHeroCategory] = useState("all");
  const [selectedDealType, setSelectedDealType] = useState("all");
  const [selectedStage, setSelectedStage] = useState("all");
  const [selectedRegion, setSelectedRegion] = useState("all");
  const [selectedMonetization, setSelectedMonetization] = useState([]);
  const [selectedPartnerRole, setSelectedPartnerRole] = useState("all");
  const [selectedCommitment, setSelectedCommitment] = useState("all");
  const [equityMin, setEquityMin] = useState("");
  const [equityMax, setEquityMax] = useState("");
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [revenueMin, setRevenueMin] = useState("");
  const [revenueMax, setRevenueMax] = useState("");
  const [profitMin, setProfitMin] = useState("");
  const [profitMax, setProfitMax] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [customListings, setCustomListings] = useState(() => getCustomListings());

  useEffect(() => {
    if (typeof window === "undefined") return;
    const handleUpdate = () => {
      setCustomListings(getCustomListings());
    };
    window.addEventListener("sm-custom-listings", handleUpdate);
    return () => window.removeEventListener("sm-custom-listings", handleUpdate);
  }, []);

  const allListings = useMemo(
    () => [...customListings, ...businesses],
    [customListings]
  );
  const filteredListings = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();
    const minSAR = toSAR(parseNumber(priceMin));
    const maxSAR = toSAR(parseNumber(priceMax));
    const minRevenueSAR = toSAR(parseNumber(revenueMin));
    const maxRevenueSAR = toSAR(parseNumber(revenueMax));
    const minProfitSAR = toSAR(parseNumber(profitMin));
    const maxProfitSAR = toSAR(parseNumber(profitMax));
    const minEquity = parseNumber(equityMin);
    const maxEquity = parseNumber(equityMax) || 100;

    return allListings.filter((business) => {
      const matchesSearch = normalizedSearch
        ? business.title.toLowerCase().includes(normalizedSearch) ||
          business.category.toLowerCase().includes(normalizedSearch)
        : true;

      const matchesCategory =
        selectedCategories.length > 0
          ? selectedCategories.includes(business.category)
          : true;

      const priceValue = Number(business.price) || 0;
      const matchesMin = priceMin ? priceValue >= minSAR : true;
      const matchesMax = priceMax ? priceValue <= maxSAR : true;

      const matchesRevenueMin = revenueMin
        ? business.monthlyRevenue >= minRevenueSAR
        : true;
      const matchesRevenueMax = revenueMax
        ? business.monthlyRevenue <= maxRevenueSAR
        : true;
      const matchesProfitMin = profitMin
        ? business.monthlyProfit >= minProfitSAR
        : true;
      const matchesProfitMax = profitMax
        ? business.monthlyProfit <= maxProfitSAR
        : true;

      const matchesMonetization =
        selectedMonetization.length > 0
          ? selectedMonetization.includes(business.monetization)
          : true;
      const matchesRegion =
        selectedRegion === "all" ? true : business.region === selectedRegion;
      const matchesDealType =
        selectedDealType === "all" ? true : business.dealType === selectedDealType;
      const matchesStage =
        selectedStage === "all" ? true : business.stage === selectedStage;
      const matchesVerified = verifiedOnly ? business.verified : true;
      const matchesPartnerRole =
        selectedPartnerRole === "all"
          ? true
          : business.partnerRole === selectedPartnerRole;
      const matchesCommitment =
        selectedCommitment === "all"
          ? true
          : business.partnerCommitment === selectedCommitment;
      const matchesEquity =
        equityMin || equityMax
          ? typeof business.equityPercent === "number" &&
            business.equityPercent >= minEquity &&
            business.equityPercent <= maxEquity
          : true;

      return (
        matchesSearch &&
        matchesCategory &&
        matchesMin &&
        matchesMax &&
        matchesRevenueMin &&
        matchesRevenueMax &&
        matchesProfitMin &&
        matchesProfitMax &&
        matchesMonetization &&
        matchesRegion &&
        matchesDealType &&
        matchesStage &&
        matchesVerified &&
        matchesPartnerRole &&
        matchesCommitment &&
        matchesEquity
      );
    });
  }, [
    allListings,
    searchTerm,
    selectedCategories,
    selectedDealType,
    selectedStage,
    selectedMonetization,
    selectedRegion,
    selectedPartnerRole,
    selectedCommitment,
    equityMin,
    equityMax,
    verifiedOnly,
    priceMin,
    priceMax,
    revenueMin,
    revenueMax,
    profitMin,
    profitMax,
    toSAR,
  ]);

  const sortedListings = useMemo(() => {
    const listings = [...filteredListings];
    listings.sort((a, b) => {
      if (sortBy === "price-high") {
        return (Number(b.price) || 0) - (Number(a.price) || 0);
      }
      if (sortBy === "price-low") {
        return (Number(a.price) || 0) - (Number(b.price) || 0);
      }
      if (sortBy === "oldest") {
        return a.id - b.id;
      }
      return b.id - a.id;
    });
    return listings;
  }, [filteredListings, sortBy]);

  const handleHeroCategory = (category) => {
    setHeroCategory(category);
    if (category === "all") {
      setSelectedCategories([]);
      return;
    }
    if (category === "websites") {
      setSelectedCategories(
        ASSET_GROUPS.find((group) => group.value === "websites")?.options.map(
          (option) => option.value
        ) || []
      );
      return;
    }
    if (category === "apps") {
      setSelectedCategories(["app-ios", "app-android"]);
      return;
    }
    if (category === "channels") {
      setSelectedCategories([
        "youtube-channel",
        "social-instagram",
        "social-x",
        "social-tiktok",
        "social-snapchat",
      ]);
      return;
    }
    if (category === "other") {
      setSelectedCategories(["newsletter", "ai-tools", "other"]);
      return;
    }
    if (category === "domains") {
      setSelectedCategories(["domains"]);
      return;
    }
    if (category === "saas") {
      setSelectedCategories(["saas"]);
      return;
    }
    if (category === "ecommerce") {
      setSelectedCategories(["ecommerce"]);
    }
  };

  const handleToggleCategory = (category) => {
    setSelectedCategories((prev) => {
      if (prev.includes(category)) {
        return prev.filter((item) => item !== category);
      }
      return [...prev, category];
    });
  };

  const handleToggleMonetization = (value) => {
    setSelectedMonetization((prev) =>
      prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value]
    );
  };

  const handleClear = () => {
    setSearchTerm("");
    setSelectedCategories([]);
    setHeroCategory("all");
    setSelectedDealType("all");
    setSelectedStage("all");
    setSelectedMonetization([]);
    setSelectedRegion("all");
    setSelectedPartnerRole("all");
    setSelectedCommitment("all");
    setEquityMin("");
    setEquityMax("");
    setVerifiedOnly(false);
    setPriceMin("");
    setPriceMax("");
    setRevenueMin("");
    setRevenueMax("");
    setProfitMin("");
    setProfitMax("");
  };

  const buyerHasAccess = PLAN_ACCESS[role]?.canViewFinancials ?? false;

  const handleRequireSubscription = () => {
    setShowUpgradeModal(true);
  };

  return (
    <div className="page" id="top">
      <Hero
        title={text.heroTitle}
        subtitle={text.heroSubtitle}
        searchPlaceholder={text.heroSearch}
        categories={HERO_CATEGORIES.map((item) => ({
          value: item.value,
          label: item.label[language] || item.label.EN,
        }))}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        activeCategory={heroCategory}
        onCategoryChange={handleHeroCategory}
      />

      <main className="container layout">
        <Filters
          language={language}
          title={text.filtersTitle}
          clearLabel={text.clearAll}
          assetTypeLabel={text.assetType}
          assetGroups={ASSET_GROUPS.map((group) => ({
            value: group.value,
            label: group.label[language] || group.label.EN,
            options: group.options.map((option) => ({
              value: option.value,
              label: option.label[language] || option.label.EN,
            })),
          }))}
          dealTypeLabel={text.saleType}
          monetizationLabel={text.monetization}
          priceRangeLabel={`${text.priceRange} (${currencyLabel})`}
          revenueLabel={text.monthlyRevenue}
          profitLabel={text.monthlyProfit}
          stageLabel={text.projectStage}
          roleLabel={text.partnerRole}
          equityLabel={text.equityRange}
          commitmentLabel={text.commitment}
          verifiedLabel={text.verifiedOnly}
          countryLabel={text.country}
          selectedCategories={selectedCategories}
          onToggleCategory={handleToggleCategory}
          dealTypes={DEAL_TYPES.map((type) => ({
            value: type.value,
            label: type.label[language] || type.label.EN,
          }))}
          selectedDealType={selectedDealType}
          onDealTypeChange={setSelectedDealType}
          minPrice={priceMin}
          maxPrice={priceMax}
          onMinPriceChange={setPriceMin}
          onMaxPriceChange={setPriceMax}
          minRevenue={revenueMin}
          maxRevenue={revenueMax}
          onMinRevenueChange={setRevenueMin}
          onMaxRevenueChange={setRevenueMax}
          minProfit={profitMin}
          maxProfit={profitMax}
          onMinProfitChange={setProfitMin}
          onMaxProfitChange={setProfitMax}
          monetizationOptions={MONETIZATION_OPTIONS.map((option) => ({
            value: option.value,
            label: option.label[language] || option.label.EN,
          }))}
          selectedMonetization={selectedMonetization}
          onToggleMonetization={handleToggleMonetization}
          regions={REGION_OPTIONS.map((region) => ({
            value: region.value,
            label: region.label[language] || region.label.EN,
          }))}
          selectedRegion={selectedRegion}
          onRegionChange={setSelectedRegion}
          stages={STAGE_OPTIONS.map((stage) => ({
            value: stage.value,
            label: stage.label[language] || stage.label.EN,
          }))}
          selectedStage={selectedStage}
          onStageChange={setSelectedStage}
          roleOptions={PARTNER_ROLE_OPTIONS.map((roleOption) => ({
            value: roleOption.value,
            label: roleOption.label[language] || roleOption.label.EN,
          }))}
          selectedRole={selectedPartnerRole}
          onRoleChange={setSelectedPartnerRole}
          equityMin={equityMin}
          equityMax={equityMax}
          onEquityMinChange={setEquityMin}
          onEquityMaxChange={setEquityMax}
          commitmentOptions={COMMITMENT_OPTIONS.map((option) => ({
            value: option.value,
            label: option.label[language] || option.label.EN,
          }))}
          selectedCommitment={selectedCommitment}
          onCommitmentChange={setSelectedCommitment}
          verifiedOnly={verifiedOnly}
          onVerifiedChange={setVerifiedOnly}
          onClear={handleClear}
        />

        <ListingsGrid
          items={sortedListings}
          sortBy={sortBy}
          onSortChange={setSortBy}
          labels={{ ...text.listingLabels, categoryLabels }}
          language={language}
          sortOptions={text.sortOptions}
          isAuthenticated={isAuthenticated}
          canAccessDetails={buyerHasAccess}
          onRequireAuth={onRequireAuth}
          onRequireSubscription={handleRequireSubscription}
          onViewDetails={(id) => navigate(`/listing/${id}`)}
        />
      </main>

      <section className="why-section" id="why">
        <div className="container">
          <div className="section-header">
            <h2>{text.whyTitle}</h2>
            <p className="muted">{text.whySubtitle}</p>
          </div>
          <div className="why-grid">
            {text.whyItems.map((item) => (
              <div className="why-card" key={item.title}>
                <h3>{item.title}</h3>
                <p className="muted">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="home-trust" id="trust">
        <div className="container">
          <div className="section-header light">
            <h2>{text.trustTitle}</h2>
            <p className="muted">{text.trustSubtitle}</p>
          </div>
          <div className="trust-grid">
            {text.trustItems.map((item) => (
              <div className="trust-item" key={item.label}>
                <span className="trust-icon" aria-hidden="true">
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="cta-section">
        <div className="container cta-card">
          <div>
            <h2>{text.ctaTitle}</h2>
            <p className="muted">{text.ctaSubtitle}</p>
          </div>
          <button
            className="btn btn-dark"
            type="button"
            onClick={() => navigate("/auth", { state: { mode: "signup" } })}
          >
            {text.ctaButton}
          </button>
        </div>
      </section>
      <Footer text={text} language={language} />

      <UpgradeModal
        open={showUpgradeModal}
        title={text.upgradeTitle}
        subtitle={text.upgradeSubtitle}
        confirmLabel={text.upgradeButton}
        cancelLabel={text.upgradeCancel}
        onClose={() => setShowUpgradeModal(false)}
        onConfirm={() => navigate("/pricing")}
      />
    </div>
  );
}
