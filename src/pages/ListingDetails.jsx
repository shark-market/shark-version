import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useCurrency } from "../context/CurrencyContext";
import {
  DEFAULT_LISTINGS,
  LISTING_CATEGORY_MAP,
  MONETIZATION_MAP,
} from "../data/marketplaceData";
import {
  getAllMarketplaceListings,
  isListingReported,
  isWishlistedListing,
  marketplaceEvents,
  reportMarketplaceListing,
  toggleWishlistListing,
} from "../data/marketplaceStore";

const TEXT = {
  EN: {
    back: "Back to browse",
    notFound: "Listing not found",
    overview: "Overview",
    metrics: "Verified metrics",
    assets: "Assets included",
    trust: "Deal safety",
    requestInfo: "Request info",
    makeOffer: "Make offer",
    messageSeller: "Message seller",
    save: "Save listing",
    saved: "Saved",
    report: "Report listing",
    reported: "Reported",
    verified: "Verified",
    escrow: "Optional escrow",
    secure: "Safe communication",
    disclaimer:
      "Information is provided by sellers. Buyers should perform independent due diligence before closing.",
    price: "Asking price",
    monthlyRevenue: "Monthly revenue",
    monthlyProfit: "Monthly profit",
    traffic: "Monthly traffic",
    age: "Business age",
    monetization: "Monetization",
    multiple: "Multiple",
    region: "Region",
    country: "Country",
    techStack: "Tech stack",
    language: "Business language",
    submitOffer: "Send offer",
    offerPlaceholder: "Enter offer amount",
    reportReason: "Reason (optional)",
    reportPlaceholder: "Describe why this listing should be reviewed",
  },
  AR: {
    back: "العودة للتصفح",
    notFound: "الإعلان غير موجود",
    overview: "نظرة عامة",
    metrics: "مؤشرات موثقة",
    assets: "الأصول المتضمنة",
    trust: "أمان الصفقة",
    requestInfo: "طلب معلومات",
    makeOffer: "تقديم عرض",
    messageSeller: "مراسلة البائع",
    save: "حفظ الإعلان",
    saved: "محفوظ",
    report: "إبلاغ عن الإعلان",
    reported: "تم الإبلاغ",
    verified: "موثّق",
    escrow: "ضمان اختياري",
    secure: "تواصل آمن",
    disclaimer:
      "المعلومات مقدمة من البائعين. يجب إجراء فحص نافي للجهالة بشكل مستقل قبل إغلاق الصفقة.",
    price: "السعر المطلوب",
    monthlyRevenue: "الإيراد الشهري",
    monthlyProfit: "الربح الشهري",
    traffic: "الزيارات الشهرية",
    age: "عمر المشروع",
    monetization: "طريقة الربح",
    multiple: "المضاعف",
    region: "المنطقة",
    country: "الدولة",
    techStack: "التقنية",
    language: "لغة المشروع",
    submitOffer: "إرسال العرض",
    offerPlaceholder: "أدخل قيمة العرض",
    reportReason: "سبب البلاغ (اختياري)",
    reportPlaceholder: "اشرح سبب المراجعة",
  },
};

const toNumber = (value) => {
  const parsed = Number(String(value).replace(/[^0-9.]/g, ""));
  return Number.isFinite(parsed) ? parsed : 0;
};

export default function ListingDetails({ language = "EN" }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const text = TEXT[language] || TEXT.EN;
  const isArabic = language === "AR";
  const locale = isArabic ? "ar-SA" : "en-US";
  const { formatCurrency, toSAR, currency } = useCurrency();

  const [listings, setListings] = useState(() => getAllMarketplaceListings(DEFAULT_LISTINGS));
  const [saved, setSaved] = useState(() => isWishlistedListing(id));
  const [reported, setReported] = useState(() => isListingReported(id));
  const [offerAmount, setOfferAmount] = useState("");
  const [reportReason, setReportReason] = useState("");

  useEffect(() => {
    const refresh = () => {
      setListings(getAllMarketplaceListings(DEFAULT_LISTINGS));
      setSaved(isWishlistedListing(id));
      setReported(isListingReported(id));
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
  }, [id]);

  const listing = useMemo(
    () => listings.find((item) => String(item.id) === String(id)),
    [id, listings]
  );

  if (!listing) {
    return (
      <section className="market-page listing-details-v2">
        <div className="container listing-details-empty">
          <h1>{text.notFound}</h1>
          <button className="btn btn-dark" type="button" onClick={() => navigate("/browse")}>
            {text.back}
          </button>
        </div>
      </section>
    );
  }

  const title = listing[`title${language}`] || listing.titleEN;
  const summary = listing[`summary${language}`] || listing.summaryEN;
  const categoryLabel =
    LISTING_CATEGORY_MAP[listing.category]?.label?.[language] ||
    LISTING_CATEGORY_MAP[listing.category]?.label?.EN ||
    listing.category;
  const monetizationLabel =
    MONETIZATION_MAP[listing.monetization]?.label?.[language] ||
    MONETIZATION_MAP[listing.monetization]?.label?.EN ||
    listing.monetization;

  const sendRequestInfo = () => navigate(`/messages?listing=${listing.id}&intent=request-info`);
  const sendMessageSeller = () => navigate(`/messages?listing=${listing.id}`);

  const submitOffer = () => {
    const offerInSAR = toSAR(toNumber(offerAmount), currency);
    const intentQuery = offerInSAR ? "make-offer" : "request-info";
    navigate(`/messages?listing=${listing.id}&intent=${intentQuery}`);
  };

  const toggleSave = () => {
    const nextSaved = toggleWishlistListing(listing.id);
    setSaved(nextSaved);
  };

  const reportListing = () => {
    if (reported) return;
    reportMarketplaceListing(listing.id, reportReason);
    setReported(true);
  };

  return (
    <section className="market-page listing-details-v2">
      <div className="container">
        <Link className="back-link" to="/browse">
          {text.back}
        </Link>

        <div className="listing-details-v2-head">
          <div>
            <span className="pill">{categoryLabel}</span>
            <h1>{title}</h1>
            <p className="muted">{summary}</p>
          </div>
          <div className="market-trust-tags">
            {listing.verified ? <span>{text.verified}</span> : null}
            <span>{text.escrow}</span>
            <span>{text.secure}</span>
          </div>
        </div>

        <div className="listing-details-v2-layout">
          <main className="listing-details-v2-main">
            <div className="details-image">
              <img src={listing.image} alt={title} />
            </div>

            <section className="details-card" id="overview">
              <h2>{text.overview}</h2>
              <div className="detail-rows">
                <div>
                  <span className="muted">{text.country}</span>
                  <strong>{listing.country}</strong>
                </div>
                <div>
                  <span className="muted">{text.region}</span>
                  <strong>{listing.region}</strong>
                </div>
                <div>
                  <span className="muted">{text.age}</span>
                  <strong>
                    {isArabic
                      ? `${listing.ageMonths} شهر`
                      : `${listing.ageMonths} months`}
                  </strong>
                </div>
                <div>
                  <span className="muted">{text.language}</span>
                  <strong>{listing.businessLanguage || "AR / EN"}</strong>
                </div>
              </div>
            </section>

            <section className="details-card" id="metrics">
              <h2>{text.metrics}</h2>
              <div className="metric-list">
                <div>
                  <span className="muted">{text.monthlyRevenue}</span>
                  <strong>{formatCurrency(listing.monthlyRevenueSAR, { locale })}</strong>
                </div>
                <div>
                  <span className="muted">{text.monthlyProfit}</span>
                  <strong>{formatCurrency(listing.monthlyProfitSAR, { locale })}</strong>
                </div>
                <div>
                  <span className="muted">{text.traffic}</span>
                  <strong>{Number(listing.monthlyTraffic || 0).toLocaleString(locale)}</strong>
                </div>
                <div>
                  <span className="muted">{text.multiple}</span>
                  <strong>{Number(listing.multiple || 0).toFixed(2)}x</strong>
                </div>
                <div>
                  <span className="muted">{text.monetization}</span>
                  <strong>{monetizationLabel}</strong>
                </div>
              </div>
            </section>

            <section className="details-card" id="assets">
              <h2>{text.assets}</h2>
              <ul className="details-list">
                {(listing.assetsIncluded || []).map((asset) => (
                  <li key={asset}>{asset}</li>
                ))}
              </ul>
              <div className="detail-rows">
                <div>
                  <span className="muted">{text.techStack}</span>
                  <strong>{(listing.techStack || []).join(" · ")}</strong>
                </div>
              </div>
            </section>

            <section className="details-card" id="trust">
              <h2>{text.trust}</h2>
              <p className="muted">{text.disclaimer}</p>
              <div className="market-trust-tags">
                {listing.verified ? <span>{text.verified}</span> : null}
                {listing.escrowEligible ? <span>{text.escrow}</span> : null}
                {listing.safeCommunication ? <span>{text.secure}</span> : null}
              </div>

              <label className="field-group field-group-full">
                <span>{text.reportReason}</span>
                <textarea
                  rows="2"
                  value={reportReason}
                  onChange={(event) => setReportReason(event.target.value)}
                  placeholder={text.reportPlaceholder}
                />
              </label>
            </section>
          </main>

          <aside className="listing-details-v2-sidebar">
            <div className="details-sidebar-card">
              <div className="details-price">
                <span className="muted">{text.price}</span>
                <strong>{formatCurrency(listing.askingPriceSAR, { locale })}</strong>
              </div>

              <div className="listing-actions-stack">
                <button className="btn btn-dark btn-block" type="button" onClick={sendRequestInfo}>
                  {text.requestInfo}
                </button>
                <button className="btn btn-ghost btn-block" type="button" onClick={sendMessageSeller}>
                  {text.messageSeller}
                </button>
              </div>

              <div className="listing-offer-box">
                <label>{text.makeOffer}</label>
                <input
                  type="number"
                  min="0"
                  placeholder={text.offerPlaceholder}
                  value={offerAmount}
                  onChange={(event) => setOfferAmount(event.target.value)}
                />
                <button className="btn btn-dark btn-block" type="button" onClick={submitOffer}>
                  {text.submitOffer}
                </button>
              </div>

              <div className="listing-side-actions">
                <button className="btn btn-ghost btn-block" type="button" onClick={toggleSave}>
                  {saved ? text.saved : text.save}
                </button>
                <button
                  className="btn btn-ghost btn-block"
                  type="button"
                  onClick={reportListing}
                  disabled={reported}
                >
                  {reported ? text.reported : text.report}
                </button>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
