import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useCurrency } from "../context/CurrencyContext";
import { useAuth } from "../context/AuthContext";
import { getCustomListings, upsertCustomListing } from "../data/listingsStore";
import {
  CATEGORY_OPTIONS,
  COMMITMENT_OPTIONS,
  DEAL_TYPES,
  DEFAULT_LISTING_FORM,
  MONETIZATION_OPTIONS,
  PARTNER_ROLE_OPTIONS,
  REGION_OPTIONS,
  STAGE_OPTIONS,
} from "../data/listingFormOptions";

export default function EditListing({ language = "EN" }) {
  const isArabic = language === "AR";
  const { currency, currencies, toSAR } = useCurrency();
  const currencyLabel = isArabic
    ? currencies?.[currency]?.symbol || currency
    : currencies?.[currency]?.label || currency;
  const { user, role } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();
  const [form, setForm] = useState(DEFAULT_LISTING_FORM);
  const [status, setStatus] = useState({ type: "", message: "" });
  const [listing, setListing] = useState(null);

  useEffect(() => {
    const current = getCustomListings();
    const found = current.find((item) => String(item.id) === String(id));
    setListing(found || null);
    if (found) {
      setForm({
        title: found.title || "",
        category: found.category || "saas",
        location: found.location || "",
        region: found.region || "saudi",
        price: found.price ? String(found.price) : "",
        stage: found.stage || "MVP",
        dealType: found.dealType || "full",
        monetization: found.monetization || "subscriptions",
        image: found.image || "",
        equityPercent: found.equityPercent ? String(found.equityPercent) : "",
        partnerRole: found.partnerRole || "technical",
        partnerCommitment: found.partnerCommitment || "part-time",
      });
    }
  }, [id]);

  const categoryLabel = useMemo(() => {
    const match = CATEGORY_OPTIONS.find((item) => item.value === form.category);
    return match?.label?.[language] || match?.label?.EN || form.category;
  }, [form.category, language]);

  if (!listing) {
    return (
      <section className="partner-page">
        <div className="container listing-details-empty">
          <h2>{isArabic ? "الإعلان غير موجود." : "Listing not found."}</h2>
          <button className="btn btn-dark" type="button" onClick={() => navigate("/my-listings")}>
            {isArabic ? "العودة" : "Go back"}
          </button>
        </div>
      </section>
    );
  }

  const canEdit = role === "admin" || listing.ownerId === user?.id;

  const handleChange = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!canEdit) {
      setStatus({
        type: "error",
        message: isArabic ? "لا يمكنك تعديل هذا الإعلان." : "You cannot edit this listing.",
      });
      return;
    }
    setStatus({ type: "", message: "" });
    const priceValue = toSAR(Number(form.price));
    if (!form.title || !priceValue || !form.location) {
      setStatus({
        type: "error",
        message: isArabic
          ? "يرجى تعبئة البيانات الأساسية."
          : "Please fill the required fields.",
      });
      return;
    }

    const nextListing = {
      ...listing,
      title: form.title.trim(),
      category: form.category,
      location: form.location.trim(),
      region: form.region,
      price: priceValue,
      stage: form.stage,
      dealType: form.dealType,
      monetization: form.monetization,
      image: form.image.trim(),
      equityPercent:
        form.dealType === "partner" ? Number(form.equityPercent) || 0 : undefined,
      partnerRole: form.dealType === "partner" ? form.partnerRole : undefined,
      partnerCommitment:
        form.dealType === "partner" ? form.partnerCommitment : undefined,
      updatedAt: new Date().toISOString(),
    };

    upsertCustomListing(nextListing);
    setStatus({
      type: "success",
      message: isArabic ? "تم حفظ التغييرات." : "Changes saved.",
    });
    navigate("/my-listings");
  };

  return (
    <section className="partner-page">
      <div className="container partner-header">
        <h2>{isArabic ? "تعديل الإعلان" : "Edit listing"}</h2>
        <p className="muted">
          {isArabic
            ? "قم بتحديث بيانات إعلانك."
            : "Update your listing details."}
        </p>
      </div>

      <div className="container partner-layout">
        <form className="partner-form" onSubmit={handleSubmit}>
          <h3>{isArabic ? "تفاصيل الإعلان" : "Listing details"}</h3>

          <div className="field-grid">
            <div className="field-group">
              <label>{isArabic ? "اسم الإعلان" : "Listing title"}</label>
              <input
                type="text"
                value={form.title}
                onChange={handleChange("title")}
                required
                disabled={!canEdit}
              />
            </div>
            <div className="field-group">
              <label>{isArabic ? "نوع الأصل" : "Asset type"}</label>
              <select
                value={form.category}
                onChange={handleChange("category")}
                disabled={!canEdit}
              >
                {CATEGORY_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label[language] || option.label.EN}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="field-grid">
            <div className="field-group">
              <label>{isArabic ? "الموقع" : "Location"}</label>
              <input
                type="text"
                value={form.location}
                onChange={handleChange("location")}
                required
                disabled={!canEdit}
              />
            </div>
            <div className="field-group">
              <label>{isArabic ? "المنطقة" : "Region"}</label>
              <select
                value={form.region}
                onChange={handleChange("region")}
                disabled={!canEdit}
              >
                {REGION_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label[language] || option.label.EN}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="field-grid">
            <div className="field-group">
              <label>
                {isArabic ? `السعر (${currencyLabel})` : `Price (${currencyLabel})`}
              </label>
              <input
                type="number"
                min="0"
                value={form.price}
                onChange={handleChange("price")}
                required
                disabled={!canEdit}
              />
            </div>
            <div className="field-group">
              <label>{isArabic ? "المرحلة" : "Stage"}</label>
              <select
                value={form.stage}
                onChange={handleChange("stage")}
                disabled={!canEdit}
              >
                {STAGE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label[language] || option.label.EN}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="field-grid">
            <div className="field-group">
              <label>{isArabic ? "نوع الصفقة" : "Deal type"}</label>
              <select
                value={form.dealType}
                onChange={handleChange("dealType")}
                disabled={!canEdit}
              >
                {DEAL_TYPES.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label[language] || option.label.EN}
                  </option>
                ))}
              </select>
            </div>
            <div className="field-group">
              <label>{isArabic ? "طريقة الربح" : "Monetization"}</label>
              <select
                value={form.monetization}
                onChange={handleChange("monetization")}
                disabled={!canEdit}
              >
                {MONETIZATION_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label[language] || option.label.EN}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {form.dealType === "partner" ? (
            <div className="partner-form-section">
              <h4>{isArabic ? "تفاصيل الشراكة" : "Partnership details"}</h4>
              <div className="field-grid">
                <div className="field-group">
                  <label>{isArabic ? "نسبة الملكية" : "Equity %"}</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={form.equityPercent}
                    onChange={handleChange("equityPercent")}
                    disabled={!canEdit}
                  />
                </div>
                <div className="field-group">
                  <label>{isArabic ? "الدور المطلوب" : "Role needed"}</label>
                  <select
                    value={form.partnerRole}
                    onChange={handleChange("partnerRole")}
                    disabled={!canEdit}
                  >
                    {PARTNER_ROLE_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label[language] || option.label.EN}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="field-group">
                <label>{isArabic ? "مستوى الالتزام" : "Commitment"}</label>
                <select
                  value={form.partnerCommitment}
                  onChange={handleChange("partnerCommitment")}
                  disabled={!canEdit}
                >
                  {COMMITMENT_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label[language] || option.label.EN}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ) : null}

          <div className="field-group">
            <label>{isArabic ? "صورة الإعلان (اختياري)" : "Image (optional)"}</label>
            <input
              type="url"
              value={form.image}
              onChange={handleChange("image")}
              placeholder="https://example.com/image.jpg"
              disabled={!canEdit}
            />
          </div>

          {status.message ? (
            <div className={`auth-status ${status.type}`}>{status.message}</div>
          ) : null}

          <button className="btn btn-dark btn-block" type="submit" disabled={!canEdit}>
            {isArabic ? "حفظ التغييرات" : "Save changes"}
          </button>
          <p className="muted">
            {isArabic
              ? `سيظهر الإعلان تحت تصنيف: ${categoryLabel}`
              : `This listing will appear under: ${categoryLabel}`}
          </p>
        </form>
      </div>
    </section>
  );
}

