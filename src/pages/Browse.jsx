import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useCurrency } from "../context/CurrencyContext";
import {
  DEFAULT_LISTINGS,
  LISTING_CATEGORY_MAP,
  LISTING_CATEGORY_OPTIONS,
  LISTING_SORT_OPTIONS,
  MONETIZATION_MAP,
  MONETIZATION_OPTIONS,
  TECH_STACK_OPTIONS,
} from "../data/marketplaceData";
import {
  getAllMarketplaceListings,
  getWishlistIds,
  marketplaceEvents,
  toggleWishlistListing,
} from "../data/marketplaceStore";

const TEXT = {
  EN: {
    title: "Browse Listings",
    subtitle:
      "Explore verified digital businesses with clear metrics, pricing, and deal options.",
    searchPlaceholder: "Search by keyword, country, or listing name",
    filters: "Filters",
    clear: "Clear all",
    apply: "Apply",
    category: "Category",
    priceRange: "Price range",
    monthlyProfit: "Monthly profit",
    monthlyRevenue: "Monthly revenue",
    traffic: "Traffic",
    monetization: "Monetization",
    age: "Age of business (months)",
    countryRegion: "Country / Region",
    techStack: "Tech stack",
    verification: "Verification",
    verifiedOnly: "Verified only",
    sort: "Sort",
    noResults: "No listings match these filters.",
    viewDetails: "View details",
    save: "Save",
    saved: "Saved",
    escrow: "Escrow optional",
    secureComms: "Safe communication",
    verifiedMetrics: "Verified metrics",
    showing: "Showing",
    of: "of",
    results: "results",
    min: "Min",
    max: "Max",
    allRegions: "All regions",
    allCountries: "All countries",
    allSort: "Most relevant",
    filtersCount: "active filters",
    openFilters: "Open filters",
    closeFilters: "Close filters",
    trustNote:
      "Use platform messaging and optional escrow for safer transactions. Listings are for informational purposes only.",
    multiple: "Multiple",
    page: "Page",
    prev: "Prev",
    next: "Next",
  },
  AR: {
    title: "تصفح المشاريع",
    subtitle:
      "استكشف مشاريع رقمية موثقة ببيانات واضحة وتسعير وخيارات صفقة منظمة.",
    searchPlaceholder: "ابحث بالكلمات أو الدولة أو اسم المشروع",
    filters: "الفلاتر",
    clear: "مسح الكل",
    apply: "تطبيق",
    category: "التصنيف",
    priceRange: "نطاق السعر",
    monthlyProfit: "الربح الشهري",
    monthlyRevenue: "الإيراد الشهري",
    traffic: "الزيارات",
    monetization: "الربح",
    age: "عمر المشروع (بالأشهر)",
    countryRegion: "الدولة / المنطقة",
    techStack: "التقنية",
    verification: "التوثيق",
    verifiedOnly: "موثّق فقط",
    sort: "الترتيب",
    noResults: "لا توجد مشاريع تطابق هذه الفلاتر.",
    viewDetails: "عرض التفاصيل",
    save: "حفظ",
    saved: "محفوظ",
    escrow: "ضمان اختياري",
    secureComms: "تواصل آمن",
    verifiedMetrics: "بيانات موثقة",
    showing: "عرض",
    of: "من",
    results: "نتيجة",
    min: "الحد الأدنى",
    max: "الحد الأعلى",
    allRegions: "كل المناطق",
    allCountries: "كل الدول",
    allSort: "الأكثر صلة",
    filtersCount: "فلاتر مفعلة",
    openFilters: "فتح الفلاتر",
    closeFilters: "إغلاق الفلاتر",
    trustNote:
      "استخدم رسائل المنصة وخيار الضمان لصفقات أكثر أمانًا. المشاريع لأغراض معلوماتية فقط.",
    multiple: "المضاعف",
    page: "الصفحة",
    prev: "السابق",
    next: "التالي",
  },
};

const PAGE_SIZE = 8;

const toNumber = (value) => {
  const parsed = Number(String(value).replace(/[^0-9.]/g, ""));
  return Number.isFinite(parsed) ? parsed : 0;
};

const normalize = (value) => String(value || "").trim().toLowerCase();

const toggleArrayValue = (values, value) =>
  values.includes(value)
    ? values.filter((item) => item !== value)
    : [...values, value];

const getSortValueLabel = (language, sortValue) => {
  const option = LISTING_SORT_OPTIONS.find((item) => item.value === sortValue);
  if (!option) return sortValue;
  return option.label?.[language] || option.label?.EN || sortValue;
};

export default function Browse({ language = "EN" }) {
  const text = TEXT[language] || TEXT.EN;
  const isArabic = language === "AR";
  const navigate = useNavigate();
  const locale = isArabic ? "ar-SA" : "en-US";
  const { formatCurrency } = useCurrency();
  const [searchParams] = useSearchParams();

  const [listings, setListings] = useState(() =>
    getAllMarketplaceListings(DEFAULT_LISTINGS)
  );
  const [wishlistIds, setWishlistIds] = useState(() => getWishlistIds());
  const [filtersOpen, setFiltersOpen] = useState(false);

  const [query, setQuery] = useState(() => searchParams.get("q") || "");
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [minProfit, setMinProfit] = useState("");
  const [maxProfit, setMaxProfit] = useState("");
  const [minRevenue, setMinRevenue] = useState("");
  const [maxRevenue, setMaxRevenue] = useState("");
  const [minTraffic, setMinTraffic] = useState("");
  const [maxTraffic, setMaxTraffic] = useState("");
  const [selectedMonetization, setSelectedMonetization] = useState([]);
  const [minAgeMonths, setMinAgeMonths] = useState("");
  const [maxAgeMonths, setMaxAgeMonths] = useState("");
  const [country, setCountry] = useState("");
  const [region, setRegion] = useState("");
  const [selectedTechStack, setSelectedTechStack] = useState([]);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [sortBy, setSortBy] = useState("relevant");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const refresh = () => {
      setListings(getAllMarketplaceListings(DEFAULT_LISTINGS));
      setWishlistIds(getWishlistIds());
    };

    refresh();
    window.addEventListener(marketplaceEvents.listings, refresh);
    window.addEventListener(marketplaceEvents.wishlist, refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener(marketplaceEvents.listings, refresh);
      window.removeEventListener(marketplaceEvents.wishlist, refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  useEffect(() => {
    const externalQuery = searchParams.get("q") || "";
    setQuery(externalQuery);
  }, [searchParams]);

  const regionOptions = useMemo(() => {
    const unique = new Set(listings.map((item) => item.region).filter(Boolean));
    return Array.from(unique).sort();
  }, [listings]);

  const countryOptions = useMemo(() => {
    const unique = new Set(listings.map((item) => item.country).filter(Boolean));
    return Array.from(unique).sort();
  }, [listings]);

  const filteredListings = useMemo(() => {
    const search = normalize(query);

    const results = listings.filter((listing) => {
      const searchable = normalize(
        [
          listing.titleEN,
          listing.titleAR,
          listing.summaryEN,
          listing.summaryAR,
          listing.country,
          listing.region,
          LISTING_CATEGORY_MAP[listing.category]?.label?.EN,
          LISTING_CATEGORY_MAP[listing.category]?.label?.AR,
        ].join(" ")
      );

      const matchesSearch = search ? searchable.includes(search) : true;
      const matchesCategory =
        selectedCategories.length > 0
          ? selectedCategories.includes(listing.category)
          : true;

      const price = Number(listing.askingPriceSAR) || 0;
      const profit = Number(listing.monthlyProfitSAR) || 0;
      const revenue = Number(listing.monthlyRevenueSAR) || 0;
      const traffic = Number(listing.monthlyTraffic) || 0;
      const age = Number(listing.ageMonths) || 0;

      const matchesPriceMin = minPrice ? price >= toNumber(minPrice) : true;
      const matchesPriceMax = maxPrice ? price <= toNumber(maxPrice) : true;
      const matchesProfitMin = minProfit ? profit >= toNumber(minProfit) : true;
      const matchesProfitMax = maxProfit ? profit <= toNumber(maxProfit) : true;
      const matchesRevenueMin = minRevenue ? revenue >= toNumber(minRevenue) : true;
      const matchesRevenueMax = maxRevenue ? revenue <= toNumber(maxRevenue) : true;
      const matchesTrafficMin = minTraffic ? traffic >= toNumber(minTraffic) : true;
      const matchesTrafficMax = maxTraffic ? traffic <= toNumber(maxTraffic) : true;
      const matchesMonetization =
        selectedMonetization.length > 0
          ? selectedMonetization.includes(listing.monetization)
          : true;
      const matchesAgeMin = minAgeMonths ? age >= toNumber(minAgeMonths) : true;
      const matchesAgeMax = maxAgeMonths ? age <= toNumber(maxAgeMonths) : true;
      const matchesCountry = country ? normalize(listing.country) === normalize(country) : true;
      const matchesRegion = region ? normalize(listing.region) === normalize(region) : true;
      const matchesTechStack =
        selectedTechStack.length > 0
          ? selectedTechStack.some((stack) => listing.techStack?.includes(stack))
          : true;
      const matchesVerified = verifiedOnly ? listing.verified : true;

      return (
        matchesSearch &&
        matchesCategory &&
        matchesPriceMin &&
        matchesPriceMax &&
        matchesProfitMin &&
        matchesProfitMax &&
        matchesRevenueMin &&
        matchesRevenueMax &&
        matchesTrafficMin &&
        matchesTrafficMax &&
        matchesMonetization &&
        matchesAgeMin &&
        matchesAgeMax &&
        matchesCountry &&
        matchesRegion &&
        matchesTechStack &&
        matchesVerified
      );
    });

    const sorted = [...results];

    sorted.sort((a, b) => {
      if (sortBy === "newest") {
        const aTime = new Date(a.createdAt || 0).getTime() || Number(String(a.id).replace(/\D/g, "")) || 0;
        const bTime = new Date(b.createdAt || 0).getTime() || Number(String(b.id).replace(/\D/g, "")) || 0;
        return bTime - aTime;
      }
      if (sortBy === "highest-profit") {
        return (Number(b.monthlyProfitSAR) || 0) - (Number(a.monthlyProfitSAR) || 0);
      }
      if (sortBy === "lowest-price") {
        return (Number(a.askingPriceSAR) || 0) - (Number(b.askingPriceSAR) || 0);
      }
      if (sortBy === "highest-multiple") {
        return (Number(b.multiple) || 0) - (Number(a.multiple) || 0);
      }

      const relevanceA =
        (a.featured ? 2 : 0) +
        (a.verified ? 1 : 0) +
        (Number(a.monthlyProfitSAR) || 0) / 100000;
      const relevanceB =
        (b.featured ? 2 : 0) +
        (b.verified ? 1 : 0) +
        (Number(b.monthlyProfitSAR) || 0) / 100000;
      return relevanceB - relevanceA;
    });

    return sorted;
  }, [
    country,
    maxAgeMonths,
    maxPrice,
    maxProfit,
    maxRevenue,
    maxTraffic,
    minAgeMonths,
    minPrice,
    minProfit,
    minRevenue,
    minTraffic,
    query,
    region,
    listings,
    selectedCategories,
    selectedMonetization,
    selectedTechStack,
    sortBy,
    verifiedOnly,
  ]);

  const activeFilterCount = useMemo(() => {
    const values = [
      query,
      selectedCategories.length,
      minPrice,
      maxPrice,
      minProfit,
      maxProfit,
      minRevenue,
      maxRevenue,
      minTraffic,
      maxTraffic,
      selectedMonetization.length,
      minAgeMonths,
      maxAgeMonths,
      country,
      region,
      selectedTechStack.length,
      verifiedOnly,
      sortBy !== "relevant",
    ];
    return values.filter(Boolean).length;
  }, [
    country,
    maxAgeMonths,
    maxPrice,
    maxProfit,
    maxRevenue,
    maxTraffic,
    minAgeMonths,
    minPrice,
    minProfit,
    minRevenue,
    minTraffic,
    query,
    region,
    selectedCategories.length,
    selectedMonetization.length,
    selectedTechStack.length,
    sortBy,
    verifiedOnly,
  ]);

  useEffect(() => {
    setCurrentPage(1);
  }, [
    country,
    maxAgeMonths,
    maxPrice,
    maxProfit,
    maxRevenue,
    maxTraffic,
    minAgeMonths,
    minPrice,
    minProfit,
    minRevenue,
    minTraffic,
    query,
    region,
    selectedCategories,
    selectedMonetization,
    selectedTechStack,
    sortBy,
    verifiedOnly,
  ]);

  const totalPages = Math.max(1, Math.ceil(filteredListings.length / PAGE_SIZE));

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const visibleListings = useMemo(() => {
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    return filteredListings.slice(startIndex, startIndex + PAGE_SIZE);
  }, [currentPage, filteredListings]);

  const clearAll = () => {
    setQuery("");
    setSelectedCategories([]);
    setMinPrice("");
    setMaxPrice("");
    setMinProfit("");
    setMaxProfit("");
    setMinRevenue("");
    setMaxRevenue("");
    setMinTraffic("");
    setMaxTraffic("");
    setSelectedMonetization([]);
    setMinAgeMonths("");
    setMaxAgeMonths("");
    setCountry("");
    setRegion("");
    setSelectedTechStack([]);
    setVerifiedOnly(false);
    setSortBy("relevant");
  };

  const renderFilterPanel = () => (
    <div className="market-filters-panel" role="region" aria-label={text.filters}>
      <div className="market-filters-head">
        <h2>{text.filters}</h2>
        <button className="link-button" type="button" onClick={clearAll}>
          {text.clear}
        </button>
      </div>

      <div className="market-filter-group">
        <label>{text.searchPlaceholder}</label>
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={text.searchPlaceholder}
        />
      </div>

      <div className="market-filter-group">
        <label>{text.category}</label>
        <div className="market-filter-checklist">
          {LISTING_CATEGORY_OPTIONS.map((category) => (
            <label key={category.value} className="checkbox-row">
              <input
                type="checkbox"
                checked={selectedCategories.includes(category.value)}
                onChange={() =>
                  setSelectedCategories((prev) =>
                    toggleArrayValue(prev, category.value)
                  )
                }
              />
              <span>{category.label?.[language] || category.label?.EN}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="market-filter-group">
        <label>{text.priceRange}</label>
        <div className="market-range-grid">
          <input
            type="number"
            inputMode="numeric"
            placeholder={text.min}
            value={minPrice}
            onChange={(event) => setMinPrice(event.target.value)}
          />
          <input
            type="number"
            inputMode="numeric"
            placeholder={text.max}
            value={maxPrice}
            onChange={(event) => setMaxPrice(event.target.value)}
          />
        </div>
      </div>

      <div className="market-filter-group">
        <label>{text.monthlyProfit}</label>
        <div className="market-range-grid">
          <input
            type="number"
            inputMode="numeric"
            placeholder={text.min}
            value={minProfit}
            onChange={(event) => setMinProfit(event.target.value)}
          />
          <input
            type="number"
            inputMode="numeric"
            placeholder={text.max}
            value={maxProfit}
            onChange={(event) => setMaxProfit(event.target.value)}
          />
        </div>
      </div>

      <div className="market-filter-group">
        <label>{text.monthlyRevenue}</label>
        <div className="market-range-grid">
          <input
            type="number"
            inputMode="numeric"
            placeholder={text.min}
            value={minRevenue}
            onChange={(event) => setMinRevenue(event.target.value)}
          />
          <input
            type="number"
            inputMode="numeric"
            placeholder={text.max}
            value={maxRevenue}
            onChange={(event) => setMaxRevenue(event.target.value)}
          />
        </div>
      </div>

      <div className="market-filter-group">
        <label>{text.traffic}</label>
        <div className="market-range-grid">
          <input
            type="number"
            inputMode="numeric"
            placeholder={text.min}
            value={minTraffic}
            onChange={(event) => setMinTraffic(event.target.value)}
          />
          <input
            type="number"
            inputMode="numeric"
            placeholder={text.max}
            value={maxTraffic}
            onChange={(event) => setMaxTraffic(event.target.value)}
          />
        </div>
      </div>

      <div className="market-filter-group">
        <label>{text.monetization}</label>
        <div className="market-filter-checklist">
          {MONETIZATION_OPTIONS.map((option) => (
            <label className="checkbox-row" key={option.value}>
              <input
                type="checkbox"
                checked={selectedMonetization.includes(option.value)}
                onChange={() =>
                  setSelectedMonetization((prev) =>
                    toggleArrayValue(prev, option.value)
                  )
                }
              />
              <span>{option.label?.[language] || option.label?.EN}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="market-filter-group">
        <label>{text.age}</label>
        <div className="market-range-grid">
          <input
            type="number"
            inputMode="numeric"
            placeholder={text.min}
            value={minAgeMonths}
            onChange={(event) => setMinAgeMonths(event.target.value)}
          />
          <input
            type="number"
            inputMode="numeric"
            placeholder={text.max}
            value={maxAgeMonths}
            onChange={(event) => setMaxAgeMonths(event.target.value)}
          />
        </div>
      </div>

      <div className="market-filter-group">
        <label>{text.countryRegion}</label>
        <div className="market-range-grid">
          <select value={country} onChange={(event) => setCountry(event.target.value)}>
            <option value="">{text.allCountries}</option>
            {countryOptions.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
          <select value={region} onChange={(event) => setRegion(event.target.value)}>
            <option value="">{text.allRegions}</option>
            {regionOptions.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="market-filter-group">
        <label>{text.techStack}</label>
        <div className="market-filter-checklist">
          {TECH_STACK_OPTIONS.map((stack) => (
            <label className="checkbox-row" key={stack.value}>
              <input
                type="checkbox"
                checked={selectedTechStack.includes(stack.value)}
                onChange={() =>
                  setSelectedTechStack((prev) => toggleArrayValue(prev, stack.value))
                }
              />
              <span>{stack.label?.[language] || stack.label?.EN}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="market-filter-group">
        <label>{text.verification}</label>
        <label className="checkbox-row">
          <input
            type="checkbox"
            checked={verifiedOnly}
            onChange={(event) => setVerifiedOnly(event.target.checked)}
          />
          <span>{text.verifiedOnly}</span>
        </label>
      </div>

      <div className="market-filter-group">
        <label>{text.sort}</label>
        <select value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
          {LISTING_SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label?.[language] || option.label?.EN}
            </option>
          ))}
        </select>
      </div>

      <button
        className="btn btn-dark btn-block market-filters-apply"
        type="button"
        onClick={() => setFiltersOpen(false)}
      >
        {text.apply}
      </button>
    </div>
  );

  return (
    <section className="market-page">
      <div className="container market-page-header">
        <div>
          <h1>{text.title}</h1>
          <p className="muted">{text.subtitle}</p>
        </div>
        <div className="market-header-actions">
          <button
            className="btn btn-ghost market-mobile-filters-btn"
            type="button"
            onClick={() => setFiltersOpen(true)}
          >
            {text.openFilters}
          </button>
          <button className="btn btn-dark" type="button" onClick={() => navigate("/sell")}> 
            {isArabic ? "ابدأ البيع" : "Start selling"}
          </button>
        </div>
      </div>

      <div className="container market-layout">
        <aside className="market-filters-column">{renderFilterPanel()}</aside>

        <div className="market-results-column">
          <div className="market-results-toolbar">
            <strong>
              {text.showing} {filteredListings.length} {text.of} {listings.length} {text.results}
            </strong>
            <span className="muted">
              {text.sort}: {getSortValueLabel(language, sortBy)}
            </span>
            {activeFilterCount > 0 ? (
              <span className="muted">
                {activeFilterCount} {text.filtersCount}
              </span>
            ) : null}
          </div>

          <div className="market-cards-grid">
            {filteredListings.length === 0 ? (
              <div className="market-empty-state">
                <p>{text.noResults}</p>
              </div>
            ) : (
              visibleListings.map((listing) => {
                const listingTitle = listing[`title${language}`] || listing.titleEN;
                const listingSummary = listing[`summary${language}`] || listing.summaryEN;
                const categoryLabel =
                  LISTING_CATEGORY_MAP[listing.category]?.label?.[language] ||
                  LISTING_CATEGORY_MAP[listing.category]?.label?.EN ||
                  listing.category;
                const saved = wishlistIds.includes(String(listing.id));

                return (
                  <article className="market-listing-card" key={listing.id}>
                    <div className="market-listing-media">
                      <img src={listing.image} alt={listingTitle} loading="lazy" />
                      {listing.verified ? (
                        <span className="badge badge-light">{text.verifiedOnly}</span>
                      ) : null}
                    </div>
                    <div className="market-listing-body">
                      <div className="market-listing-meta">
                        <span className="pill">{categoryLabel}</span>
                        <span className="muted">{listing.country}</span>
                      </div>
                      <h3>{listingTitle}</h3>
                      <p className="muted">{listingSummary}</p>

                      <div className="market-listing-stats">
                        <span>
                          {text.monthlyProfit}: {formatCurrency(listing.monthlyProfitSAR, { locale })}
                        </span>
                        <span>
                          {text.monthlyRevenue}: {formatCurrency(listing.monthlyRevenueSAR, { locale })}
                        </span>
                        <span>
                          {text.multiple}: {Number(listing.multiple || 0).toFixed(2)}x
                        </span>
                      </div>

                      <div className="market-trust-tags">
                        <span>{text.escrow}</span>
                        <span>{text.secureComms}</span>
                        <span>{text.verifiedMetrics}</span>
                      </div>

                      <div className="market-listing-actions">
                        <strong>
                          {formatCurrency(listing.askingPriceSAR, { locale })}
                        </strong>
                        <div className="market-card-buttons">
                          <button
                            className="btn btn-ghost"
                            type="button"
                            onClick={() => {
                              const nextSaved = toggleWishlistListing(listing.id);
                              setWishlistIds((prev) => {
                                if (nextSaved) {
                                  return [String(listing.id), ...prev.filter((id) => id !== String(listing.id))];
                                }
                                return prev.filter((id) => id !== String(listing.id));
                              });
                            }}
                          >
                            {saved ? text.saved : text.save}
                          </button>
                          <Link className="btn btn-dark" to={`/listing/${listing.id}`}>
                            {text.viewDetails}
                          </Link>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })
            )}
          </div>

          {filteredListings.length > 0 ? (
            <div className="market-pagination">
              <button
                className="btn btn-ghost"
                type="button"
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                {text.prev}
              </button>
              <span className="muted">
                {text.page} {currentPage} / {totalPages}
              </span>
              <button
                className="btn btn-ghost"
                type="button"
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
              >
                {text.next}
              </button>
            </div>
          ) : null}

          <p className="market-trust-note">{text.trustNote}</p>
        </div>
      </div>

      {filtersOpen ? (
        <>
          <button
            className="market-filters-backdrop"
            type="button"
            aria-label={text.closeFilters}
            onClick={() => setFiltersOpen(false)}
          />
          <div className={`market-filters-drawer ${filtersOpen ? "open" : ""}`}>
            <div className="market-filters-drawer-head">
              <strong>{text.filters}</strong>
              <button className="link-button" type="button" onClick={() => setFiltersOpen(false)}>
                {text.closeFilters}
              </button>
            </div>
            {renderFilterPanel()}
          </div>
        </>
      ) : null}
    </section>
  );
}
