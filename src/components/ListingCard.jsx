import { Link } from "react-router-dom";
import { useCurrency } from "../context/CurrencyContext";
import { getListingViews } from "../data/viewsStore";

export default function ListingCard({
  business,
  onViewDetails,
  labels,
  language = "EN",
  isAuthenticated = false,
  canAccessDetails = true,
  onRequireAuth,
  onRequireSubscription,
}) {
  const { formatCurrency } = useCurrency();
  const locale = language === "AR" ? "ar-SA" : "en-US";
  const priceValue =
    Number(business.price) ||
    Number(String(business.price).replace(/[^0-9.]/g, "")) ||
    0;
  const priceLabel = formatCurrency(priceValue, { locale });
  const viewsCount = getListingViews(business.id, business.views);
  const financialsLabel = canAccessDetails
    ? labels?.financialsReady || "Financials available"
    : labels?.upgradeHint || "Upgrade to see full financials";
  const actionLabel = labels?.viewDetailsLabel || "View Details";

  const handleUpgrade = () => {
    if (onRequireSubscription) {
      onRequireSubscription();
      return;
    }
    onRequireAuth?.();
  };

  const handleContactSeller = () => {
    if (!isAuthenticated || !canAccessDetails) {
      handleUpgrade();
      return;
    }
    onViewDetails?.(business.id);
  };

  const handleViewFinancials = () => {
    if (!isAuthenticated || !canAccessDetails) {
      handleUpgrade();
      return;
    }
    onViewDetails?.(business.id);
  };

  const handleViewDetails = () => {
    onViewDetails?.(business.id);
  };

  return (
    <article className="listing-card">
      <div className="listing-media">
        <img src={business.image} alt={business.title} />
        {business.featured ? (
          <span className="badge badge-dark">
            {labels?.featuredLabel || "Featured"}
          </span>
        ) : null}
        {business.verified ? (
          <span className="badge badge-light">
            <span className="badge-dot" aria-hidden="true" />
            {labels?.verifiedLabel || "Verified"}
          </span>
        ) : null}
      </div>

      <div className="listing-body">
        <div className="listing-meta">
          <span className="pill">
            {labels?.categoryLabels?.[business.category] || business.category}
          </span>
          <span className="muted">{business.location}</span>
        </div>

        <h3>{business.title}</h3>

        <div className="listing-stats">
          <span>
            {labels?.viewsLabel || "Views"} {viewsCount}
          </span>
          <span>
            {labels?.likesLabel || "Likes"} {business.likes}
          </span>
        </div>

        <div className="listing-price">
          <span className="muted">
            {labels?.askingPriceLabel || "Asking Price"}
          </span>
          <strong>{priceLabel}</strong>
          <button
            className="link-button listing-link"
            type="button"
            onClick={handleViewFinancials}
          >
            {labels?.viewFinancialsLabel || "View financials"}
          </button>
          <small className="muted">{financialsLabel}</small>
        </div>

        <div className="listing-actions">
          <button
            className="btn btn-dark btn-block"
            type="button"
            onClick={handleContactSeller}
          >
            {labels?.contactSellerLabel || "Contact seller"}
          </button>
          <button
            className="btn btn-ghost btn-block"
            type="button"
            onClick={handleViewDetails}
          >
            {actionLabel}
          </button>
        </div>
      </div>
      <Link
        className="listing-card-link"
        to={`/listing/${business.id}`}
        aria-label={
          language === "AR"
            ? "عرض تفاصيل الإعلان"
            : "View listing details"
        }
      />
    </article>
  );
}
