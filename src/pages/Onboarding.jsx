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

const validateOnboarding = (formState, language) => {
  const isArabic = language === "AR";
  const errors = {};

  if (!formState.role) {
    errors.role = isArabic ? "اختر نوع الحساب" : "Select an account type";
  }
  if (!formState.firstName.trim()) {
    errors.firstName = isArabic ? "الاسم الأول مطلوب" : "First name is required";
  }
  if (!formState.lastName.trim()) {
    errors.lastName = isArabic ? "اسم العائلة مطلوب" : "Last name is required";
  }
  if (!formState.country) {
    errors.country = isArabic ? "الدولة مطلوبة" : "Country is required";
  }
  if (!formState.phoneNumber.trim()) {
    errors.phoneNumber = isArabic
      ? "رقم الهاتف مطلوب"
      : "Phone number is required";
  }
  if (!formState.termsAccepted) {
    errors.termsAccepted = isArabic
      ? "يجب الموافقة على الشروط"
      : "You must accept the terms";
  }
  if (
    formState.phoneNumber &&
    (formState.phoneNumber.length < 7 || formState.phoneNumber.length > 12)
  ) {
    errors.phoneNumber = isArabic
      ? "رقم الهاتف غير صحيح"
      : "Invalid phone number";
  }

  const firstErrorField = Object.keys(errors)[0] || "";
  return {
    valid: !firstErrorField,
    errors,
    firstErrorField,
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
    role: "",
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
  const [formMessage, setFormMessage] = useState("");
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSkipModal, setShowSkipModal] = useState(false);

  const text = useMemo(
    () => ({
      title: language === "AR" ? "لنبدأ" : "Let’s get you set up",
      subtitle:
        language === "AR"
          ? "أخبرنا عن نفسك لنخصص تجربتك."
          : "Tell us about yourself to personalize your experience.",
      progressStep: language === "AR" ? "الخطوة 1 من 3" : "Step 1 of 3",
      progressHelper:
        language === "AR"
          ? "أكمل المعلومات الأساسية لتبدأ بسرعة."
          : "Complete your basics to get started quickly.",
      role: language === "AR" ? "نوع الحساب" : "Account type",
      buyer: language === "AR" ? "مشتري" : "Buyer",
      seller: language === "AR" ? "بائع" : "Seller",
      firstName: language === "AR" ? "الاسم الأول" : "First name",
      lastName: language === "AR" ? "اسم العائلة" : "Last name",
      company: language === "AR" ? "اسم الشركة" : "Company name",
      country: language === "AR" ? "الدولة" : "Country",
      phone: language === "AR" ? "رقم الهاتف" : "Phone number",
      howHeard:
        language === "AR"
          ? "كيف سمعت عنا؟"
          : "How did you hear about us?",
      businessUrl: language === "AR" ? "رابط مشروعك" : "Business URL",
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
      avatar: language === "AR" ? "الصورة الشخصية" : "Avatar",
      chooseImage: language === "AR" ? "اختر صورة" : "Choose image",
      submit: language === "AR" ? "إكمال" : "Complete",
      optionalTitle: "اختياري / Optional",
      optionalHelper:
        language === "AR"
          ? "أضف تفاصيل إضافية لتحسين تجربتك."
          : "Add extra details to improve your experience.",
      skip: language === "AR" ? "تخطي الآن" : "Skip for now",
      skipTitle: "تخطي الإعداد الآن؟",
      skipBody:
        "يمكنك إكمال البيانات لاحقًا، لكن بعض الميزات مثل التحقق وإضافة المشاريع قد تكون محدودة.",
      skipCancel: "إلغاء",
      skipConfirm: "تخطي",
      toastBuyer: "جاهزين! ابدأ تصفح المشاريع",
      toastSeller: "ممتاز! ابدأ بإضافة مشروعك الأول",
      saving: language === "AR" ? "جاري الحفظ…" : "Saving...",
      successMessage:
        language === "AR"
          ? "✅ تم حفظ بياناتك بنجاح"
          : "✅ Your details were saved successfully",
      validationMessage:
        language === "AR"
          ? "يرجى تعبئة الحقول المطلوبة"
          : "Please fill the required fields.",
      saveError:
        language === "AR"
          ? "تعذر حفظ البيانات الآن. حاول مرة أخرى."
          : "We couldn't save your details. Please try again.",
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
    setFormMessage("");
    setErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const handlePhoneNumber = (event) => {
    const next = event.target.value.replace(/\D/g, "");
    setFormState((prev) => ({ ...prev, phoneNumber: next.slice(0, 12) }));
    setFormMessage("");
    setErrors((prev) => {
      if (!prev.phoneNumber) return prev;
      const updated = { ...prev };
      delete updated.phoneNumber;
      return updated;
    });
  };

  const setRole = (nextRole) => {
    setFormState((prev) => ({ ...prev, role: nextRole }));
    setFormMessage("");
    setErrors((prev) => {
      if (!prev.role) return prev;
      const next = { ...prev };
      delete next.role;
      return next;
    });
  };

  const focusFirstError = (field) => {
    if (!field || typeof document === "undefined") return;
    const target = document.querySelector(`[data-field="${field}"]`);
    if (!target) return;
    if (target.scrollIntoView) {
      target.scrollIntoView({ behavior: "smooth", block: "center" });
    }
    if (target.focus) {
      target.focus({ preventScroll: true });
    }
  };

  const handleSubmit = async (event) => {
    if (event?.preventDefault) {
      event.preventDefault();
    }
    if (!user) return;
    if (isSubmitting) return;
    setFormMessage("");
    setStatus({ type: "", message: "" });
    const {
      valid,
      errors: nextErrors,
      firstErrorField,
    } = validateOnboarding(formState, language);

    if (!valid) {
      setErrors(nextErrors);
      setFormMessage(text.validationMessage);
      focusFirstError(firstErrorField);
      return;
    }

    setErrors({});
    setIsSubmitting(true);
    try {
      let avatarUrl = profile?.avatar_url || null;
      if (avatarFile) {
        const fileExt = avatarFile.name.split(".").pop();
        const filePath = `${user.id}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from("avatars")
          .upload(filePath, avatarFile, { upsert: true });
        if (uploadError) {
          console.error("[Onboarding save] Avatar upload error:", uploadError);
          setStatus({
            type: "error",
            message: text.saveError,
          });
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
        console.error("[Onboarding save] Profile save error:", error);
        setStatus({
          type: "error",
          message: text.saveError,
        });
        return;
      }
      await refreshProfile(user.id);
      setStatus({ type: "success", message: text.successMessage });
      setTimeout(() => {
        navigate("/onboarding/next", { replace: true });
      }, 700);
    } catch (err) {
      console.error("[Onboarding save] Unexpected error:", err);
      setStatus({ type: "error", message: text.saveError });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) return null;

  return (
    <div className="page">
      <section className="onboarding-section">
        <div className="container onboarding-card">
          <div className="onboarding-progress">
            <div className="progress-meta">
              <span className="progress-step">{text.progressStep}</span>
              <span className="muted">{text.progressHelper}</span>
            </div>
            <div className="progress-bar">
              <span style={{ width: "33%" }} />
            </div>
          </div>
          <div className="onboarding-header">
            <h2>{text.title}</h2>
            <p className="muted">{text.subtitle}</p>
          </div>

          <form className="onboarding-form" onSubmit={handleSubmit}>
            {formMessage ? (
              <div className="form-error-banner" role="alert">
                {formMessage}
              </div>
            ) : null}
            <div className="field-group">
              <label id="role-label">{text.role}</label>
              <div
                className="role-toggle"
                role="radiogroup"
                aria-labelledby="role-label"
                aria-invalid={Boolean(errors.role)}
                aria-describedby={errors.role ? "role-error" : undefined}
              >
                <button
                  type="button"
                  className={`role-card ${formState.role === "buyer" ? "active" : ""}`}
                  role="radio"
                  aria-checked={formState.role === "buyer"}
                  data-field="role"
                  tabIndex={formState.role === "buyer" || !formState.role ? 0 : -1}
                  onClick={() => setRole("buyer")}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      setRole("buyer");
                    }
                    if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
                      event.preventDefault();
                      setRole("seller");
                    }
                  }}
                >
                  {text.buyer}
                </button>
                <button
                  type="button"
                  className={`role-card ${formState.role === "seller" ? "active" : ""}`}
                  role="radio"
                  aria-checked={formState.role === "seller"}
                  data-field="role"
                  tabIndex={formState.role === "seller" ? 0 : -1}
                  onClick={() => setRole("seller")}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      setRole("seller");
                    }
                    if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
                      event.preventDefault();
                      setRole("buyer");
                    }
                  }}
                >
                  {text.seller}
                </button>
              </div>
              {errors.role ? (
                <span className="field-error" id="role-error">
                  {errors.role}
                </span>
              ) : null}
            </div>

            <div className="field-grid">
              <div className="field-group">
                <label htmlFor="firstName">{text.firstName}</label>
                <input
                  id="firstName"
                  type="text"
                  value={formState.firstName}
                  onChange={handleChange("firstName")}
                  data-field="firstName"
                  aria-invalid={Boolean(errors.firstName)}
                  aria-describedby={errors.firstName ? "first-name-error" : undefined}
                  className={errors.firstName ? "input-error" : ""}
                />
                {errors.firstName ? (
                  <span className="field-error" id="first-name-error">
                    {errors.firstName}
                  </span>
                ) : null}
              </div>
              <div className="field-group">
                <label htmlFor="lastName">{text.lastName}</label>
                <input
                  id="lastName"
                  type="text"
                  value={formState.lastName}
                  onChange={handleChange("lastName")}
                  data-field="lastName"
                  aria-invalid={Boolean(errors.lastName)}
                  aria-describedby={errors.lastName ? "last-name-error" : undefined}
                  className={errors.lastName ? "input-error" : ""}
                />
                {errors.lastName ? (
                  <span className="field-error" id="last-name-error">
                    {errors.lastName}
                  </span>
                ) : null}
              </div>
            </div>

            <div className="field-grid">
              <div className="field-group">
                <label htmlFor="country">{text.country}</label>
                <select
                  id="country"
                  value={formState.country}
                  onChange={handleChange("country")}
                  data-field="country"
                  aria-invalid={Boolean(errors.country)}
                  aria-describedby={errors.country ? "country-error" : undefined}
                  className={errors.country ? "input-error" : ""}
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
                {errors.country ? (
                  <span className="field-error" id="country-error">
                    {errors.country}
                  </span>
                ) : null}
              </div>
              <div className="field-group">
                <label htmlFor="phoneNumber">{text.phone}</label>
                <div className="phone-input">
                  <select
                    id="phoneCountry"
                    value={formState.phoneCountry}
                    onChange={handleChange("phoneCountry")}
                    aria-label={isArabic ? "مفتاح الدولة" : "Country code"}
                  >
                    {PHONE_CODES.map((code) => (
                      <option key={code} value={code}>
                        {code}
                      </option>
                    ))}
                  </select>
                  <input
                    id="phoneNumber"
                    type="tel"
                    inputMode="numeric"
                    value={formState.phoneNumber}
                    onChange={handlePhoneNumber}
                    placeholder={isArabic ? "رقم الجوال" : "Phone number"}
                    data-field="phoneNumber"
                    aria-invalid={Boolean(errors.phoneNumber)}
                    aria-describedby={errors.phoneNumber ? "phone-error" : undefined}
                    className={errors.phoneNumber ? "input-error" : ""}
                  />
                </div>
                {errors.phoneNumber ? (
                  <span className="field-error" id="phone-error">
                    {errors.phoneNumber}
                  </span>
                ) : null}
              </div>
            </div>

            <details className="onboarding-optional">
              <summary className="optional-summary">
                <div className="optional-summary-text">
                  <span>{text.optionalTitle}</span>
                  <span className="muted">{text.optionalHelper}</span>
                </div>
              </summary>
              <div className="optional-body">
                <div className="field-grid">
                  <div className="field-group">
                    <label htmlFor="companyName">{text.company}</label>
                    <input
                      id="companyName"
                      type="text"
                      value={formState.companyName}
                      onChange={handleChange("companyName")}
                    />
                  </div>
                  <div className="field-group">
                    <label htmlFor="avatarUpload">{text.avatar}</label>
                    <div className="avatar-upload">
                      <input
                        id="avatarUpload"
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
                    <label htmlFor="howHeard">{text.howHeard}</label>
                    <select
                      id="howHeard"
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
                        <label htmlFor="businessUrl">{text.businessUrl}</label>
                        <input
                          id="businessUrl"
                          type="text"
                          value={formState.businessUrl}
                          onChange={handleChange("businessUrl")}
                          placeholder="e.g mywebsite.com"
                        />
                      </div>
                      <div className="field-group">
                        <label htmlFor="businessCategory">
                          {text.businessCategory}
                        </label>
                        <select
                          id="businessCategory"
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
                        <label htmlFor="annualRevenue">{text.annualRevenue}</label>
                        <input
                          id="annualRevenue"
                          type="text"
                          value={formState.annualRevenue}
                          onChange={handleChange("annualRevenue")}
                          placeholder="e.g 250,000"
                        />
                      </div>
                      <div className="field-group">
                        <label htmlFor="annualProfit">{text.annualProfit}</label>
                        <input
                          id="annualProfit"
                          type="text"
                          value={formState.annualProfit}
                          onChange={handleChange("annualProfit")}
                          placeholder="e.g 150,000"
                        />
                      </div>
                    </div>

                    <div className="field-grid">
                      <div className="field-group">
                        <label htmlFor="businessesOwned">
                          {text.businessesOwned}
                        </label>
                        <input
                          id="businessesOwned"
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
              </div>
            </details>

            <div className="field-group">
              <label className="checkbox-row">
                <input
                  id="termsAccepted"
                  type="checkbox"
                  checked={formState.termsAccepted}
                  onChange={handleChange("termsAccepted")}
                  data-field="termsAccepted"
                  aria-invalid={Boolean(errors.termsAccepted)}
                  aria-describedby={errors.termsAccepted ? "terms-error" : undefined}
                  aria-labelledby="terms-label"
                />
                <span id="terms-label">
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
              {errors.termsAccepted ? (
                <span className="field-error" id="terms-error">
                  {errors.termsAccepted}
                </span>
              ) : null}
            </div>

            {status.message ? (
              <div
                className={`auth-status ${status.type}`}
                role={status.type === "error" ? "alert" : "status"}
              >
                {status.message}
              </div>
            ) : null}

            <div className="onboarding-actions">
              <button className="btn btn-dark" type="submit" disabled={isSubmitting}>
                {isSubmitting ? text.saving : text.submit}
              </button>
              <button
                className="link-button onboarding-skip"
                type="button"
                onClick={() => setShowSkipModal(true)}
              >
                {text.skip}
              </button>
            </div>
          </form>
        </div>
      </section>
      {showSkipModal ? (
        <div className="modal-overlay" role="dialog" aria-modal="true">
          <div className="modal-card onboarding-skip-modal">
            <h3>{text.skipTitle}</h3>
            <p className="muted">{text.skipBody}</p>
            <div className="modal-actions">
              <button
                className="btn btn-ghost"
                type="button"
                onClick={() => setShowSkipModal(false)}
              >
                {text.skipCancel}
              </button>
              <button
                className="btn btn-dark"
                type="button"
                onClick={() => {
                  setShowSkipModal(false);
                  handleSubmit();
                }}
              >
                {text.skipConfirm}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
