import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCurrency } from "../context/CurrencyContext";
import { useAuth } from "../context/AuthContext";
import { getCustomListings, saveCustomListings } from "../data/listingsStore";
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

export default function CreateListing({ language = "EN" }) {
  const isArabic = language === "AR";
  const { currency, currencies, toSAR } = useCurrency();
  const currencyLabel = isArabic
    ? currencies?.[currency]?.symbol || currency
    : currencies?.[currency]?.label || currency;
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState(DEFAULT_LISTING_FORM);
  const [status, setStatus] = useState({ type: "", message: "" });

  const categoryLabel = useMemo(() => {
    const match = CATEGORY_OPTIONS.find((item) => item.value === form.category);
    return match?.label?.[language] || match?.label?.EN || form.category;
  }, [form.category, language]);

  const handleChange = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
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

    const newListing = {
      id: `c-${Date.now()}`,
      ownerId: user?.id || "guest",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      title: form.title.trim(),
      category: form.category,
      location: form.location.trim(),
      region: form.region,
      price: priceValue,
      monthlyRevenue: 0,
      monthlyProfit: 0,
      dealType: form.dealType,
      stage: form.stage,
      views: 0,
      likes: 0,
      verified: false,
      featured: false,
      monetization: form.monetization,
      ageYears: 0,
      image:
        form.image.trim() ||
        "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80",
      equityPercent:
        form.dealType === "partner" ? Number(form.equityPercent) || 0 : undefined,
      partnerRole: form.dealType === "partner" ? form.partnerRole : undefined,
      partnerCommitment:
        form.dealType === "partner" ? form.partnerCommitment : undefined,
      status: "published",
    };

    const current = getCustomListings();
    saveCustomListings([newListing, ...current]);
    setForm(DEFAULT_LISTING_FORM);
    setStatus({
      type: "success",
      message: isArabic
        ? "تم إنشاء الإعلان بنجاح."
        : "Listing created successfully.",
    });
    navigate("/my-listings");
  };

  return (
    <section className="partner-page">
      <div className="container partner-header">
        <h2>{isArabic ? "إنشاء إعلان جديد" : "Create a listing"}</h2>
        <p className="muted">
          {isArabic
            ? "أدخل بيانات إعلانك ليظهر في صفحة العروض."
            : "Add the listing details to publish on the marketplace."}
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
              />
            </div>
            <div className="field-group">
              <label>{isArabic ? "نوع الأصل" : "Asset type"}</label>
              <select value={form.category} onChange={handleChange("category")}>
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
              />
            </div>
            <div className="field-group">
              <label>{isArabic ? "المنطقة" : "Region"}</label>
              <select value={form.region} onChange={handleChange("region")}>
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
              />
            </div>
            <div className="field-group">
              <label>{isArabic ? "المرحلة" : "Stage"}</label>
              <select value={form.stage} onChange={handleChange("stage")}>
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
              <select value={form.dealType} onChange={handleChange("dealType")}>
                {DEAL_TYPES.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label[language] || option.label.EN}
                  </option>
                ))}
              </select>
            </div>
            <div className="field-group">
              <label>{isArabic ? "طريقة الربح" : "Monetization"}</label>
              <select value={form.monetization} onChange={handleChange("monetization")}>
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
                  />
                </div>
                <div className="field-group">
                  <label>{isArabic ? "الدور المطلوب" : "Role needed"}</label>
                  <select
                    value={form.partnerRole}
                    onChange={handleChange("partnerRole")}
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
            />
          </div>

          {status.message ? (
            <div className={`auth-status ${status.type}`}>{status.message}</div>
          ) : null}

          <button className="btn btn-dark btn-block" type="submit">
            {isArabic ? "نشر الإعلان" : "Publish listing"}
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
