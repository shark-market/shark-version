import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { businesses } from "../data/mockdata";
import { useCurrency } from "../context/CurrencyContext";
import { useAuth } from "../context/AuthContext";
import {
  getCustomListings,
  removeCustomListing,
  saveCustomListings,
  upsertCustomListing,
} from "../data/listingsStore";
import { getListingViews } from "../data/viewsStore";

const LABELS = {
  EN: {
    title: "My Listings",
    status: "Status",
    price: "Price",
    views: "Views",
    actions: "Actions",
    edit: "Edit",
    pause: "Pause",
    resume: "Resume",
    duplicate: "Duplicate",
    preview: "Preview",
    deleteConfirm: "Delete listing?",
    deleteHint: "This action cannot be undone.",
    cancel: "Cancel",
    confirm: "Delete",
    delete: "Delete",
    draft: "Draft",
    published: "Published",
    paused: "Paused",
    sold: "Sold",
  },
  AR: {
    title: "إعلاناتي",
    status: "الحالة",
    price: "السعر",
    views: "المشاهدات",
    actions: "الإجراءات",
    edit: "تعديل",
    pause: "إيقاف",
    resume: "استئناف",
    duplicate: "نسخ الإعلان",
    preview: "معاينة",
    deleteConfirm: "حذف الإعلان؟",
    deleteHint: "لا يمكن التراجع عن هذا الإجراء.",
    cancel: "إلغاء",
    confirm: "حذف",
    delete: "حذف",
    draft: "مسودة",
    published: "منشور",
    paused: "موقوف",
    sold: "مباع",
  },
};

const STATUS_OPTIONS = ["draft", "published", "paused", "sold"];

export default function MyListings({ language = "EN" }) {
  const text = LABELS[language] || LABELS.EN;
  const { formatCurrency } = useCurrency();
  const locale = language === "AR" ? "ar-SA" : "en-US";
  const navigate = useNavigate();
  const { role, user } = useAuth();
  const [seedListings] = useState(
    businesses.slice(0, 4).map((item) => ({
      ...item,
      status: "published",
    }))
  );
  const [customListings, setCustomListings] = useState(() => getCustomListings());
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const handleUpdate = () => setCustomListings(getCustomListings());
    window.addEventListener("sm-custom-listings", handleUpdate);
    return () => window.removeEventListener("sm-custom-listings", handleUpdate);
  }, []);

  const rows = useMemo(() => {
    const ownedListings =
      role === "admin"
        ? [...customListings, ...seedListings]
        : customListings.filter((item) => item.ownerId === user?.id);
    return ownedListings.map((listing) => ({
      ...listing,
      status: listing.status || "published",
      statusLabel: text[listing.status || "published"],
      canManage: role === "admin" || listing.ownerId === user?.id,
      isCustom: customListings.some((item) => String(item.id) === String(listing.id)),
    }));
  }, [customListings, role, seedListings, text, user]);

  const handleToggleStatus = (listing) => {
    if (!listing.isCustom) return;
    const nextStatus = listing.status === "published" ? "paused" : "published";
    const nextListing = { ...listing, status: nextStatus, updatedAt: new Date().toISOString() };
    upsertCustomListing(nextListing);
    setCustomListings(getCustomListings());
  };

  const handleDuplicate = (listing) => {
    if (!listing.canManage) return;
    const copy = {
      ...listing,
      id: `c-${Date.now()}`,
      status: "draft",
      ownerId: user?.id || listing.ownerId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const current = getCustomListings();
    saveCustomListings([copy, ...current]);
    setCustomListings(getCustomListings());
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    removeCustomListing(deleteTarget.id);
    setCustomListings(getCustomListings());
    setDeleteTarget(null);
  };

  return (
    <section className="my-listings">
      <div className="container">
        <div className="my-listings-header">
          <div>
            <h2>{text.title}</h2>
          </div>
          <button
            className="btn btn-dark"
            type="button"
            onClick={() => setShowPublishModal(true)}
          >
            {language === "AR" ? "إنشاء إعلان" : "Create Listing"}
          </button>
        </div>

        <div className="my-listings-table">
          <div className="my-listings-row header">
            <span>{text.title}</span>
            <span>{text.price}</span>
            <span>{text.status}</span>
            <span>{text.views}</span>
            <span>{text.actions}</span>
          </div>
          {rows.map((listing) => (
            <div className="my-listings-row" key={listing.id}>
              <button
                className="link-button"
                type="button"
                onClick={() => navigate(`/listing/${listing.id}`)}
              >
                {listing.title || listing.name}
              </button>
              <span>{formatCurrency(listing.price, { locale })}</span>
              <span className={`status-pill ${listing.status}`}>
                {listing.statusLabel}
              </span>
              <span>{getListingViews(listing.id, listing.views)}</span>
              <div className="row-actions">
                <button
                  className="btn btn-ghost"
                  type="button"
                  onClick={() => navigate(`/listing/${listing.id}/edit`)}
                  disabled={!listing.canManage || !listing.isCustom}
                >
                  {text.edit}
                </button>
                <button
                  className="btn btn-ghost"
                  type="button"
                  onClick={() => handleToggleStatus(listing)}
                  disabled={
                    !listing.canManage ||
                    !listing.isCustom ||
                    !["published", "paused"].includes(listing.status)
                  }
                >
                  {listing.status === "paused" ? text.resume : text.pause}
                </button>
                <button
                  className="btn btn-ghost"
                  type="button"
                  onClick={() => handleDuplicate(listing)}
                  disabled={!listing.canManage}
                >
                  {text.duplicate}
                </button>
                <button
                  className="btn btn-ghost"
                  type="button"
                  onClick={() => navigate(`/listing/${listing.id}`)}
                >
                  {text.preview}
                </button>
                <button
                  className="btn btn-ghost"
                  type="button"
                  onClick={() => setDeleteTarget(listing)}
                  disabled={!listing.canManage || !listing.isCustom}
                >
                  {text.delete}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
      {showPublishModal ? (
        <div className="modal-overlay" role="dialog" aria-modal="true">
          <div className="modal-card">
            <h3>{language === "AR" ? "اختر نوع النشر" : "Choose where to publish"}</h3>
            <p className="muted">
              {language === "AR"
                ? "هل تريد نشر إعلانك كطلب شريك أم كعرض للبيع؟"
                : "Publish as a partner request or a marketplace listing."}
            </p>
            <div className="modal-actions">
              <button
                className="btn btn-ghost"
                type="button"
                onClick={() => {
                  setShowPublishModal(false);
                  navigate("/partner");
                }}
              >
                {language === "AR" ? "ابحث عن شريك" : "Find a Partner"}
              </button>
              <button
                className="btn btn-dark"
                type="button"
                onClick={() => {
                  setShowPublishModal(false);
                  navigate("/create-listing");
                }}
              >
                {language === "AR" ? "العروض" : "Listings"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
      {deleteTarget ? (
        <div className="modal-overlay" role="dialog" aria-modal="true">
          <div className="modal-card">
            <h3>{text.deleteConfirm}</h3>
            <p className="muted">{text.deleteHint}</p>
            <div className="modal-actions">
              <button className="btn btn-ghost" type="button" onClick={() => setDeleteTarget(null)}>
                {text.cancel}
              </button>
              <button className="btn btn-dark" type="button" onClick={handleDelete}>
                {text.confirm}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
