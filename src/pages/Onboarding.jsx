import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import { useCurrency } from "../context/CurrencyContext";

const COUNTRIES = [
  "Saudi Arabia",
  "United Arab Emirates",
  "Kuwait",
  "Qatar",
  "Bahrain",
  "Oman",
  "Jordan",
  "Egypt",
  "Morocco",
];

const HEAR_OPTIONS = [
  { value: "twitter", label: { EN: "Twitter", AR: "تويتر" } },
  { value: "google", label: { EN: "Google", AR: "Google" } },
  { value: "friend", label: { EN: "Friend", AR: "صديق" } },
  { value: "ad", label: { EN: "Ad", AR: "إعلان" } },
  { value: "other", label: { EN: "Other", AR: "أخرى" } },
];

const BUSINESS_CATEGORIES = [
  { value: "SaaS", label: { EN: "SaaS", AR: "SaaS" } },
  { value: "Ecom", label: { EN: "E-commerce", AR: "تجارة إلكترونية" } },
  { value: "Content", label: { EN: "Content", AR: "محتوى" } },
  { value: "App", label: { EN: "App", AR: "تطبيق" } },
  { value: "Channel", label: { EN: "Channel", AR: "قناة" } },
  { value: "Domain", label: { EN: "Domain", AR: "نطاق" } },
  { value: "Service", label: { EN: "Service", AR: "خدمة" } },
];

const PHONE_CODES = ["+966", "+971", "+965", "+974", "+973", "+968"];

const parsePhone = (phone, fallbackCode) => {
  if (!phone) {
    return { phoneCountry: fallbackCode, phoneNumber: "" };
  }
  const cleaned = String(phone).replace(/[^\d+]/g, "");
  const matchedCode = PHONE_CODES.find((code) => cleaned.startsWith(code));
  if (matchedCode) {
    return {
      phoneCountry: matchedCode,
      phoneNumber: cleaned.slice(matchedCode.length).replace(/\D/g, ""),
    };
  }
  return {
    phoneCountry: fallbackCode,
    phoneNumber: cleaned.replace(/^\+/, "").replace(/\D/g, ""),
  };
};

export default function Onboarding({ language = "EN" }) {
  const navigate = useNavigate();
  const { user, profile, refreshProfile } = useAuth();
  const { currency, currencies } = useCurrency();
  const isArabic = language === "AR";
  const currencyLabel = isArabic
    ? currencies?.[currency]?.symbol || currency
    : currencies?.[currency]?.label || currency;
  const [formState, setFormState] = useState({
    role: "buyer",
    firstName: "",
    lastName: "",
    companyName: "",
    country: "",
    phoneCountry: "+966",
    phoneNumber: "",
    howHeard: "",
    businessUrl: "",
    businessCategory: "",
    annualRevenue: "",
    annualProfit: "",
    businessesOwned: "",
    termsAccepted: false,
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState("");
  const [status, setStatus] = useState({ type: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const text = useMemo(
    () => ({
      title: language === "AR" ? "لنبدأ" : "Let’s get you set up",
      subtitle:
        language === "AR"
          ? "أخبرنا عن نفسك لنخصص تجربتك."
          : "Tell us about yourself to personalize your experience.",
      role: language === "AR" ? "أنا" : "I am a",
      buyer: language === "AR" ? "مشتري" : "Buyer",
      seller: language === "AR" ? "بائع" : "Seller",
      firstName: language === "AR" ? "الاسم الأول" : "First name",
      lastName: language === "AR" ? "اسم العائلة" : "Last name",
      company: language === "AR" ? "اسم الشركة (اختياري)" : "Company (optional)",
      country: language === "AR" ? "الدولة" : "Country",
      phone: language === "AR" ? "الهاتف (اختياري)" : "Phone (optional)",
      howHeard:
        language === "AR"
          ? "كيف سمعت عنا؟ (اختياري)"
          : "How did you hear about us? (optional)",
      businessUrl:
        language === "AR" ? "رابط مشروعك" : "Business URL",
      businessCategory:
        language === "AR" ? "تصنيف المشروع" : "Business Category",
      annualRevenue:
        language === "AR"
          ? `الإيراد السنوي (${currencyLabel})`
          : `Annual revenue (${currencyLabel})`,
      annualProfit:
        language === "AR"
          ? `الربح السنوي (${currencyLabel})`
          : `Annual profit (${currencyLabel})`,
      businessesOwned:
        language === "AR"
          ? "كم عدد المشاريع التي تملكها؟"
          : "How many businesses do you own?",
      termsLabel: language === "AR" ? "أوافق على" : "I agree to the",
      termsAnd: language === "AR" ? "و" : "and",
      termsTerms: language === "AR" ? "الشروط والأحكام" : "Terms & Conditions",
      termsPrivacy: language === "AR" ? "سياسة الخصوصية" : "Privacy Policy",
      avatar:
        language === "AR" ? "الصورة الشخصية (اختياري)" : "Avatar (optional)",
      chooseImage: language === "AR" ? "اختر صورة" : "Choose image",
      submit: language === "AR" ? "احفظ وأكمل" : "Save & Continue",
      error:
        language === "AR"
          ? "حدث خطأ، حاول مرة أخرى."
          : "Something went wrong. Please try again.",
    }),
    [currencyLabel, language]
  );

  useEffect(() => {
    if (!profile) return;
    setFormState((prev) => {
      const phoneData = parsePhone(profile.phone, PHONE_CODES[0]);
      return {
        ...prev,
        role: profile.role || prev.role,
        firstName: profile.first_name || prev.firstName,
        lastName: profile.last_name || prev.lastName,
        companyName: profile.company_name || prev.companyName,
        country: profile.country || prev.country,
        phoneCountry: phoneData.phoneCountry || prev.phoneCountry,
        phoneNumber: phoneData.phoneNumber || prev.phoneNumber,
        howHeard: profile.how_heard || prev.howHeard,
        businessUrl: profile.business_url || prev.businessUrl,
        businessCategory: profile.business_category || prev.businessCategory,
        annualRevenue: profile.annual_revenue || prev.annualRevenue,
        annualProfit: profile.annual_profit || prev.annualProfit,
        businessesOwned: profile.businesses_owned || prev.businessesOwned,
        termsAccepted: profile.terms_accepted || prev.termsAccepted,
      };
    });
    if (profile.avatar_url) {
      setAvatarPreview(profile.avatar_url);
    }
  }, [profile]);

  const handleChange = (field) => (event) => {
    const value =
      event.target.type === "checkbox"
        ? event.target.checked
        : event.target.value;
    setFormState((prev) => ({ ...prev, [field]: value }));
  };

  const handlePhoneNumber = (event) => {
    const next = event.target.value.replace(/\D/g, "");
    setFormState((prev) => ({ ...prev, phoneNumber: next.slice(0, 12) }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!user) return;
    if (!formState.termsAccepted) {
      setStatus({
        type: "error",
        message: isArabic
          ? "يرجى الموافقة على الشروط لإكمال التسجيل."
          : "Please accept the terms to continue.",
      });
      return;
    }
    if (
      formState.phoneNumber &&
      (formState.phoneNumber.length < 7 || formState.phoneNumber.length > 12)
    ) {
      setStatus({
        type: "error",
        message: isArabic
          ? "رقم الهاتف غير صحيح."
          : "Phone number length is invalid.",
      });
      return;
    }
    setIsSubmitting(true);
    setStatus({ type: "", message: "" });
    try {
      let avatarUrl = profile?.avatar_url || null;
      if (avatarFile) {
        const fileExt = avatarFile.name.split(".").pop();
        const filePath = `${user.id}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from("avatars")
          .upload(filePath, avatarFile, { upsert: true });
        if (uploadError) {
          setStatus({ type: "error", message: uploadError.message });
          return;
        }
        const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);
        avatarUrl = data.publicUrl;
      }

      const { error } = await supabase.from("profiles").upsert({
        id: user.id,
        email: user.email,
        first_name: formState.firstName,
        last_name: formState.lastName,
        company_name: formState.companyName || null,
        country: formState.country,
        phone: formState.phoneNumber
          ? `${formState.phoneCountry}${formState.phoneNumber}`
          : null,
        role: formState.role,
        how_heard: formState.howHeard || null,
        business_url: formState.businessUrl || null,
        business_category: formState.businessCategory || null,
        annual_revenue: formState.annualRevenue || null,
        annual_profit: formState.annualProfit || null,
        businesses_owned: formState.businessesOwned || null,
        terms_accepted: formState.termsAccepted || false,
        terms_accepted_at: formState.termsAccepted
          ? new Date().toISOString()
          : profile?.terms_accepted_at || null,
        terms_version: formState.termsAccepted ? "v1" : profile?.terms_version || null,
        avatar_url: avatarUrl,
      });
      if (error) {
        setStatus({ type: "error", message: error.message });
        return;
      }
      await refreshProfile(user.id);
      navigate("/", { replace: true });
    } catch (err) {
      setStatus({ type: "error", message: err?.message || text.error });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) return null;

  return (
    <div className="page">
      <section className="onboarding-section">
        <div className="container onboarding-card">
          <div className="onboarding-header">
            <h2>{text.title}</h2>
            <p className="muted">{text.subtitle}</p>
          </div>

          <form className="onboarding-form" onSubmit={handleSubmit}>
            <div className="field-group">
              <label>{text.role}</label>
              <div className="role-toggle">
                <button
                  type="button"
                  className={formState.role === "buyer" ? "active" : ""}
                  onClick={() =>
                    setFormState((prev) => ({ ...prev, role: "buyer" }))
                  }
                >
                  {text.buyer}
                </button>
                <button
                  type="button"
                  className={formState.role === "seller" ? "active" : ""}
                  onClick={() =>
                    setFormState((prev) => ({ ...prev, role: "seller" }))
                  }
                >
                  {text.seller}
                </button>
              </div>
            </div>

            <div className="field-grid">
              <div className="field-group">
                <label>{text.firstName}</label>
                <input
                  type="text"
                  value={formState.firstName}
                  onChange={handleChange("firstName")}
                  required
                />
              </div>
              <div className="field-group">
                <label>{text.lastName}</label>
                <input
                  type="text"
                  value={formState.lastName}
                  onChange={handleChange("lastName")}
                  required
                />
              </div>
            </div>

            <div className="field-grid">
              <div className="field-group">
                <label>{text.company}</label>
                <input
                  type="text"
                  value={formState.companyName}
                  onChange={handleChange("companyName")}
                />
              </div>
              <div className="field-group">
                <label>{text.avatar}</label>
                <div className="avatar-upload">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      if (!file) return;
                      setAvatarFile(file);
                      setAvatarPreview(URL.createObjectURL(file));
                    }}
                  />
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="avatar preview" />
                  ) : (
                    <span className="muted">{text.chooseImage}</span>
                  )}
                </div>
              </div>
            </div>

            <div className="field-grid">
              <div className="field-group">
                <label>{text.country}</label>
                <select
                  value={formState.country}
                  onChange={handleChange("country")}
                  required
                >
                  <option value="">
                    {language === "AR" ? "اختر" : "Select"}
                  </option>
                  {COUNTRIES.map((country) => (
                    <option key={country} value={country}>
                      {country}
                    </option>
                  ))}
                </select>
              </div>
              <div className="field-group">
                <label>{text.phone}</label>
                <div className="phone-input">
                  <select
                    value={formState.phoneCountry}
                    onChange={handleChange("phoneCountry")}
                  >
                    {PHONE_CODES.map((code) => (
                      <option key={code} value={code}>
                        {code}
                      </option>
                    ))}
                  </select>
                  <input
                    type="tel"
                    inputMode="numeric"
                    value={formState.phoneNumber}
                    onChange={handlePhoneNumber}
                    placeholder={isArabic ? "رقم الجوال" : "Phone number"}
                  />
                </div>
              </div>
            </div>

            <div className="field-grid">
              <div className="field-group">
                <label>{text.howHeard}</label>
                <select
                  value={formState.howHeard}
                  onChange={handleChange("howHeard")}
                >
                  <option value="">
                    {language === "AR" ? "اختر" : "Select"}
                  </option>
                  {HEAR_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label[language] || option.label.EN}
                    </option>
                  ))}
                </select>
              </div>
              <div className="field-group" />
            </div>

            {formState.role === "seller" ? (
              <>
                <div className="field-grid">
                  <div className="field-group">
                    <label>{text.businessUrl}</label>
                    <input
                      type="text"
                      value={formState.businessUrl}
                      onChange={handleChange("businessUrl")}
                      placeholder="e.g mywebsite.com"
                    />
                  </div>
                  <div className="field-group">
                    <label>{text.businessCategory}</label>
                    <select
                      value={formState.businessCategory}
                      onChange={handleChange("businessCategory")}
                    >
                      <option value="">
                        {language === "AR" ? "اختر" : "Select"}
                      </option>
                      {BUSINESS_CATEGORIES.map((category) => (
                        <option key={category.value} value={category.value}>
                          {category.label[language] || category.label.EN}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="field-grid">
                  <div className="field-group">
                    <label>{text.annualRevenue}</label>
                    <input
                      type="text"
                      value={formState.annualRevenue}
                      onChange={handleChange("annualRevenue")}
                      placeholder="e.g 250,000"
                    />
                  </div>
                  <div className="field-group">
                    <label>{text.annualProfit}</label>
                    <input
                      type="text"
                      value={formState.annualProfit}
                      onChange={handleChange("annualProfit")}
                      placeholder="e.g 150,000"
                    />
                  </div>
                </div>

                <div className="field-grid">
                  <div className="field-group">
                    <label>{text.businessesOwned}</label>
                    <input
                      type="text"
                      value={formState.businessesOwned}
                      onChange={handleChange("businessesOwned")}
                      placeholder="e.g 2"
                    />
                  </div>
                  <div className="field-group" />
                </div>
              </>
            ) : null}

            <div className="field-group">
              <label className="checkbox-row">
                <input
                  type="checkbox"
                  checked={formState.termsAccepted}
                  onChange={handleChange("termsAccepted")}
                  required
                />
                <span>
                  {text.termsLabel}{" "}
                  <button
                    type="button"
                    className="link-button"
                    onClick={() => navigate("/terms")}
                  >
                    {text.termsTerms}
                  </button>{" "}
                  {text.termsAnd}{" "}
                  <button
                    type="button"
                    className="link-button"
                    onClick={() => navigate("/privacy")}
                  >
                    {text.termsPrivacy}
                  </button>
                </span>
              </label>
            </div>

            {status.message ? (
              <div className={`auth-status ${status.type}`}>
                {status.message}
              </div>
            ) : null}

            <button className="btn btn-dark" type="submit" disabled={isSubmitting}>
              {isSubmitting ? "..." : text.submit}
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
