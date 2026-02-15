import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useCurrency } from "../context/CurrencyContext";
import sallaLogo from "../assets/platform-logos/salla.svg";
import matajerLogo from "../assets/platform-logos/matajer.svg";
import shopifyLogo from "../assets/platform-logos/shopify.svg";
import wordpressLogo from "../assets/platform-logos/wordpress.svg";
import woocommerceLogo from "../assets/platform-logos/woocommerce.svg";
import {
  DEFAULT_LISTINGS,
  HOW_IT_WORKS_STEPS,
  LISTING_CATEGORY_MAP,
} from "../data/marketplaceData";
import { getAllMarketplaceListings, marketplaceEvents } from "../data/marketplaceStore";
import { getUI } from "../data/uiDictionary";

const SUPPORTED_PLATFORMS = [
  { name: "Salla", logo: sallaLogo },
  { name: "Matajer", logo: matajerLogo },
  { name: "Shopify", logo: shopifyLogo },
  { name: "WordPress", logo: wordpressLogo },
  { name: "WooCommerce", logo: woocommerceLogo },
];

const ACTION_ICONS = {
  "/sell": "↗",
  "/browse": "◎",
  "/partner": "◇",
};

const STEP_ICONS = ["⌕", "✉", "✓"];

export default function Home({ language = "EN" }) {
  const ui = getUI(language);
  const text = ui.home;
  const navigate = useNavigate();
  const location = useLocation();
  const isArabic = language === "AR";
  const locale = isArabic ? "ar-SA" : "en-US";
  const { formatCurrency, currency, currencies } = useCurrency();

  const [searchTerm, setSearchTerm] = useState("");
  const [listings, setListings] = useState(() => getAllMarketplaceListings(DEFAULT_LISTINGS));

  useEffect(() => {
    const refresh = () => {
      setListings(getAllMarketplaceListings(DEFAULT_LISTINGS));
    };

    refresh();
    window.addEventListener(marketplaceEvents.listings, refresh);
    window.addEventListener("storage", refresh);

    return () => {
      window.removeEventListener(marketplaceEvents.listings, refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  const featuredListings = useMemo(
    () => listings.filter((listing) => listing.featured).slice(0, 6),
    [listings]
  );
  const aboutPillars = useMemo(() => {
    const pillars = text.aboutPillars || [];
    return [pillars[2], pillars[1], pillars[0]].filter(Boolean);
  }, [text.aboutPillars]);

  const submitSearch = (event) => {
    event.preventDefault();
    const q = searchTerm.trim();
    navigate(q ? `/browse?q=${encodeURIComponent(q)}` : "/browse");
  };

  const currencyLabel =
    currencies?.[currency]?.label || currencies?.[currency]?.symbol || currency;
  const unauthorizedMessage = location.state?.unauthorizedMessage;

  return (
    <div className="page market-home-page">
      {unauthorizedMessage ? (
        <div className="container">
          <div className="auth-status error home-access-status">{unauthorizedMessage}</div>
        </div>
      ) : null}
      <section className="market-hero" id="home">
        <div className="container market-hero-inner">
          <p className="market-hero-kicker">SHARKMKT</p>
          <div className="market-hero-headline">
            <h1>{text.heroTitleAR}</h1>
            <p className="market-hero-dual">{text.heroTitleEN}</p>
          </div>
          <p className="market-hero-subtitle">{text.heroSubtitle}</p>

          <form className="market-hero-search searchBar" onSubmit={submitSearch}>
            <input
              type="search"
              placeholder={text.heroSearch}
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
            <button className="btn btnGhost" type="submit">
              {isArabic ? "بحث" : "Search"}
            </button>
          </form>

          <div className="market-hero-actions heroActions">
            <Link className="btn btnPrimary" to="/sell">
              {text.heroPrimary}
            </Link>
            <Link className="btn btnGhost" to="/browse">
              {text.heroSecondary}
            </Link>
          </div>
        </div>
      </section>

      <section className="market-platforms-section">
        <div className="container">
          <p className="market-platforms-title">
            {language === "AR"
              ? "المنصات المدعومة"
              : "Supported Platforms"}
          </p>
          <div className="market-platforms-grid">
            {SUPPORTED_PLATFORMS.map((platform) => (
              <div className="platform-logo-item" key={platform.name}>
                <img src={platform.logo} alt={platform.name} loading="lazy" />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="market-actions-section">
        <div className="container">
          <div className="section-header">
            <h2>{text.actionsTitle}</h2>
          </div>
          <div className="market-actions-grid">
            {text.actions.map((card) => (
              <article className="market-action-card" key={card.title}>
                <span className="market-action-icon" aria-hidden="true">
                  {ACTION_ICONS[card.href] || "•"}
                </span>
                <h3>{card.title}</h3>
                <p>{card.body}</p>
                <Link className="btn btnPrimary" to={card.href}>
                  {card.cta}
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="market-featured-section" id="listings">
        <div className="container">
          <div className="market-featured-header">
            <div>
              <h2>{text.featuredTitle}</h2>
              <p className="muted">{text.featuredSubtitle}</p>
            </div>
            <div className="market-card-buttons">
              <Link className="btn btn-ghost" to="/browse">
                {text.browseWithFilters}
              </Link>
              <Link className="btn btn-dark" to="/browse">
                {text.viewAll}
              </Link>
            </div>
          </div>

          <div className="market-cards-grid market-cards-grid-home">
            {featuredListings.map((listing) => {
              const title = listing[`title${language}`] || listing.titleEN;
              const summary = listing[`summary${language}`] || listing.summaryEN;
              const categoryLabel =
                LISTING_CATEGORY_MAP[listing.category]?.label?.[language] ||
                LISTING_CATEGORY_MAP[listing.category]?.label?.EN ||
                listing.category;

              return (
                <article className="market-listing-card" key={listing.id}>
                  <div className="market-listing-media">
                    <img src={listing.image} alt={title} loading="lazy" />
                    {listing.verified ? (
                      <span className="badge badge-light">
                        {language === "AR" ? "موثّق" : "Verified"}
                      </span>
                    ) : null}
                  </div>

                  <div className="market-listing-body">
                    <div className="market-listing-meta">
                      <span className="pill">{categoryLabel}</span>
                      <span className="muted">{listing.country}</span>
                    </div>

                    <h3>{title}</h3>
                    <p className="muted">{summary}</p>

                    <div className="market-listing-stats">
                      <span>
                        {language === "AR" ? "الربح الشهري" : "Monthly profit"}: {" "}
                        {formatCurrency(listing.monthlyProfitSAR, { locale })}
                      </span>
                      <span>
                        {language === "AR" ? "السعر" : "Price"}: {" "}
                        {formatCurrency(listing.askingPriceSAR, { locale })}
                      </span>
                      <span>
                        {language === "AR" ? "العملة" : "Currency"}: {currencyLabel}
                      </span>
                    </div>

                    <div className="market-trust-tags">
                      {text.listingTags.map((tag) => (
                        <span key={tag}>{tag}</span>
                      ))}
                    </div>

                    <div className="market-card-buttons">
                      <Link className="btn btn-dark" to={`/listing/${listing.id}`}>
                        {language === "AR" ? "عرض التفاصيل" : "View details"}
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="market-how-section">
        <div className="container">
          <div className="section-header">
            <h2>{text.howTitle}</h2>
          </div>
          <div className="market-how-grid">
            {HOW_IT_WORKS_STEPS.map((step, index) => (
              <article className="market-how-card" key={step.EN.title}>
                <div className="market-how-top">
                  <span className="market-how-step">{index + 1}</span>
                  <span className="market-how-icon" aria-hidden="true">
                    {STEP_ICONS[index] || "•"}
                  </span>
                </div>
                <h3>{step[language]?.title || step.EN.title}</h3>
                <p>{step[language]?.description || step.EN.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="market-about-section" id="about-preview">
        <div className="container">
          <div className="section-header light">
            <h2>{text.aboutTitle}</h2>
            <p className="muted">{text.aboutSubtitle}</p>
          </div>

          <div className="market-about-pillars">
            {aboutPillars.map((pillar) => (
              <article className="market-about-pillar" key={pillar.title}>
                <span className="market-about-icon" aria-hidden="true">
                  ◆
                </span>
                <h3>{pillar.title}</h3>
                <small>{pillar.subtitle}</small>
                <p>{pillar.body}</p>
              </article>
            ))}
          </div>

          <div className="market-about-link-row">
            <Link className="btn btn-ghost" to="/about">
              {text.aboutCta}
            </Link>
          </div>
        </div>
      </section>

      <section className="market-support-section">
        <div className="container">
          <div className="market-support-card">
            <div>
              <h2>{text.helpTitle}</h2>
              <p className="muted">{text.helpBody}</p>
            </div>
            <Link className="btn btnPrimary" to="/help">
              {text.helpCta}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
