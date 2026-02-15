import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import { getUserById, setOnboardingCompleted, upsertUser } from "../services/usersService";

const ROLE_OPTIONS = [
  { value: "partner", label: { AR: "أبحث عن شريك", EN: "Find a Partner" } },
  { value: "seller", label: { AR: "بائع", EN: "Seller" } },
  { value: "buyer", label: { AR: "مشتري", EN: "Buyer" } },
  { value: "investor", label: { AR: "مستثمر", EN: "Investor" } },
];

const COUNTRY_OPTIONS = [
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

const CITY_OPTIONS = {
  "Saudi Arabia": ["Riyadh", "Jeddah", "Dammam", "Makkah", "Madinah"],
  "United Arab Emirates": ["Dubai", "Abu Dhabi", "Sharjah"],
  Kuwait: ["Kuwait City"],
  Qatar: ["Doha"],
  Bahrain: ["Manama"],
  Oman: ["Muscat"],
  Jordan: ["Amman"],
  Egypt: ["Cairo", "Alexandria"],
  Morocco: ["Casablanca", "Rabat"],
};

const INTEREST_OPTIONS = ["SaaS", "E-commerce", "Marketplace", "Content", "AI", "Mobile App"];
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

const ACCOUNT_DESTINATIONS = {
  partner: "/partner",
  seller: "/sell",
  buyer: "/browse",
  investor: "/browse?filter=investor",
};

const BUDGET_TYPES = new Set(["buyer", "investor"]);

const shouldShowBudget = (role) => BUDGET_TYPES.has(String(role || "").trim());

const getOnboardingDestination = (role) =>
  ACCOUNT_DESTINATIONS[String(role || "").trim()] || "/partner";

const asText = (value) => String(value ?? "").trim();

const validateOnboarding = (formState, language) => {
  const isArabic = language === "AR";
  const errors = {};

  if (!formState.role) {
    errors.role = isArabic ? "حدد نوع الحساب" : "Account type is required";
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
  if (!formState.city) {
    errors.city = isArabic ? "المدينة مطلوبة" : "City is required";
  }
  if (
    formState.phoneNumber &&
    (formState.phoneNumber.length < 7 || formState.phoneNumber.length > 12)
  ) {
    errors.phoneNumber = isArabic ? "رقم الجوال غير صحيح" : "Invalid mobile number";
  }

  if (
    shouldShowBudget(formState.role) &&
    formState.budgetMin &&
    formState.budgetMax &&
    Number(formState.budgetMin) > Number(formState.budgetMax)
  ) {
    errors.budgetMax = isArabic
      ? "الحد الأعلى يجب أن يكون أكبر من الحد الأدنى"
      : "Max budget must be greater than min budget";
  }

  const firstErrorField = Object.keys(errors)[0] || "";
  return {
    valid: !firstErrorField,
    errors,
    firstErrorField,
  };
};

export default function Onboarding({ language = "AR" }) {
  const navigate = useNavigate();
  const { user, profile, appUser, refreshProfile } = useAuth();
  const isArabic = language === "AR";

  const [formState, setFormState] = useState({
    role: "",
    firstName: "",
    lastName: "",
    phoneCountry: "+966",
    phoneNumber: "",
    country: "",
    city: "",
    interests: [],
    budgetMin: "",
    budgetMax: "",
  });
  const [status, setStatus] = useState({ type: "", message: "" });
  const [formMessage, setFormMessage] = useState("");
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCustomInterest, setShowCustomInterest] = useState(false);
  const [customInterest, setCustomInterest] = useState("");
  const showBudgetFields = shouldShowBudget(formState.role);

  const text = useMemo(
    () => ({
      title: isArabic ? "خلّنا نجهز حسابك" : "Let us set up your account",
      subtitle: isArabic
        ? "أجب على أسئلة بسيطة لتخصيص تجربتك"
        : "Answer a few simple questions to personalize your experience.",
      role: isArabic ? "نوع الحساب" : "Account type",
      firstName: isArabic ? "الاسم الأول" : "First name",
      lastName: isArabic ? "اسم العائلة" : "Last name",
      phone: isArabic ? "رقم الجوال" : "Mobile number",
      country: isArabic ? "الدولة" : "Country",
      city: isArabic ? "المدينة" : "City",
      interests: isArabic ? "اهتماماتك" : "Your interests",
      budget: isArabic ? "نطاق الميزانية (ريال)" : "Budget range (SAR)",
      budgetMin: isArabic ? "من" : "From",
      budgetMax: isArabic ? "إلى" : "To",
      submit: isArabic ? "حفظ والمتابعة" : "Save and Continue",
      skip: isArabic ? "تخطي الآن" : "Skip now",
      validationMessage: isArabic
        ? "يرجى تعبئة الحقول المطلوبة"
        : "Please complete the required fields.",
      saving: isArabic ? "جاري الحفظ…" : "Saving...",
      successMessage: isArabic
        ? "✅ تم حفظ بياناتك بنجاح"
        : "✅ Your details were saved successfully",
      saveError: isArabic
        ? "تعذر حفظ البيانات الآن. حاول مرة أخرى."
        : "We couldn't save your details. Please try again.",
      choose: isArabic ? "اختر" : "Select",
      addOther: isArabic ? "+ أخرى" : "+ Other",
      customInterestPlaceholder: isArabic ? "اكتب اهتمامك هنا" : "Type your interest here",
      add: isArabic ? "إضافة" : "Add",
    }),
    [isArabic]
  );

  useEffect(() => {
    if (!profile) return;

    const phoneData = parsePhone(profile.phone, PHONE_CODES[0]);
    const profileInterests = String(profile.business_category || "")
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean);

    setFormState((prev) => ({
      ...prev,
      role: appUser?.accountType || profile.role || prev.role,
      firstName: profile.first_name || prev.firstName,
      lastName: profile.last_name || prev.lastName,
      phoneCountry: phoneData.phoneCountry || prev.phoneCountry,
      phoneNumber: phoneData.phoneNumber || prev.phoneNumber,
      country: appUser?.country || profile.country || prev.country,
      city: appUser?.city || profile.company_name || prev.city,
      interests: profileInterests.length ? profileInterests : prev.interests,
      budgetMin: appUser?.budgetMin || profile.annual_profit || prev.budgetMin,
      budgetMax: appUser?.budgetMax || profile.annual_revenue || prev.budgetMax,
    }));
  }, [appUser, profile]);

  const cityOptions = useMemo(() => CITY_OPTIONS[formState.country] || [], [formState.country]);

  const setField = (field, value) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
    setFormMessage("");
    setErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const handleChange = (field) => (event) => {
    setField(field, event.target.value);
  };

  const handlePhoneNumber = (event) => {
    const next = event.target.value.replace(/\D/g, "");
    setField("phoneNumber", next.slice(0, 12));
  };

  const toggleInterest = (interest) => {
    setFormState((prev) => {
      const selected = prev.interests.includes(interest);
      return {
        ...prev,
        interests: selected
          ? prev.interests.filter((item) => item !== interest)
          : [...prev.interests, interest],
      };
    });
  };

  const addCustomInterest = () => {
    const nextInterest = customInterest.trim();
    if (!nextInterest) return;
    if (formState.interests.some((item) => item.toLowerCase() === nextInterest.toLowerCase())) {
      setCustomInterest("");
      return;
    }
    setFormState((prev) => ({
      ...prev,
      interests: [...prev.interests, nextInterest],
    }));
    setCustomInterest("");
    setShowCustomInterest(false);
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
    event.preventDefault();
    if (!user || isSubmitting) return;

    setStatus({ type: "", message: "" });
    setFormMessage("");

    const { valid, errors: nextErrors, firstErrorField } = validateOnboarding(formState, language);
    if (!valid) {
      setErrors(nextErrors);
      setFormMessage(text.validationMessage);
      focusFirstError(firstErrorField);
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    try {
      const role = asText(formState.role) || "partner";
      const firstName = asText(formState.firstName);
      const lastName = asText(formState.lastName);
      const country = asText(formState.country);
      const city = asText(formState.city);
      const phoneCountry = asText(formState.phoneCountry) || "+966";
      const phoneNumber = asText(formState.phoneNumber).replace(/\D/g, "");
      const budgetMin = shouldShowBudget(role) ? asText(formState.budgetMin) : "";
      const budgetMax = shouldShowBudget(role) ? asText(formState.budgetMax) : "";
      const interests = Array.isArray(formState.interests) ? formState.interests : [];

      const existingUser = getUserById(user.id);
      upsertUser({
        ...existingUser,
        id: user.id,
        email: user.email,
        role: existingUser?.role || "user",
        firstName,
        lastName,
        country,
        city,
        phoneCode: phoneCountry,
        phoneNumber,
        accountType: role,
        interests,
        budgetMin,
        budgetMax,
        onboardingCompleted: true,
      });

      try {
        const profilePayload = {
          id: user.id,
          email: user.email,
          first_name: firstName,
          last_name: lastName,
          role,
          country,
          company_name: city,
          phone: phoneNumber ? `${phoneCountry}${phoneNumber}` : null,
          business_category: interests.join(", ") || null,
          annual_profit: budgetMin || null,
          annual_revenue: budgetMax || null,
          onboarding_completed: true,
          terms_accepted: true,
          terms_accepted_at: profile?.terms_accepted_at || new Date().toISOString(),
          terms_version: profile?.terms_version || "v1",
          avatar_url: profile?.avatar_url || null,
        };

        const { error } = await supabase.from("profiles").upsert(profilePayload);
        if (error) {
          console.error("[Onboarding] Supabase profile save failed:", error, profilePayload);
        }
      } catch (backendError) {
        console.error("[Onboarding] Unexpected save error:", backendError);
      }

      try {
        await refreshProfile(user.id);
      } catch (refreshError) {
        console.error("[Onboarding] Profile refresh failed:", refreshError);
      }

      setStatus({ type: "success", message: text.successMessage });
      setTimeout(
        () => navigate(getOnboardingDestination(role), { replace: true }),
        550
      );
    } catch (submitError) {
      console.error("[Onboarding] Save failed:", submitError);
      setStatus({ type: "error", message: text.saveError });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkip = async () => {
    if (!user || isSubmitting) return;
    setIsSubmitting(true);
    setStatus({ type: "", message: "" });
    try {
      const role = asText(formState.role) || appUser?.accountType || "partner";
      const existingUser = getUserById(user.id);
      if (existingUser) {
        setOnboardingCompleted(user.id, true, {
          email: user.email,
          firstName: existingUser.firstName || formState.firstName || "",
          lastName: existingUser.lastName || formState.lastName || "",
          accountType: asText(formState.role) || existingUser.accountType || role,
          country: existingUser.country || formState.country || "",
          city: existingUser.city || formState.city || "",
        });
      } else {
        upsertUser({
          id: user.id,
          email: user.email,
          role: "user",
          accountType: role,
          firstName: asText(formState.firstName),
          lastName: asText(formState.lastName),
          country: asText(formState.country),
          city: asText(formState.city),
          phoneCode: asText(formState.phoneCountry) || "+966",
          phoneNumber: asText(formState.phoneNumber).replace(/\D/g, ""),
          interests: formState.interests || [],
          onboardingCompleted: true,
        });
      }

      try {
        await supabase.from("profiles").upsert({
          id: user.id,
          email: user.email,
          role,
          onboarding_completed: true,
        });
      } catch (backendError) {
        console.error("[Onboarding] Skip sync failed:", backendError);
      }

      try {
        await refreshProfile(user.id);
      } catch (refreshError) {
        console.error("[Onboarding] Skip profile refresh failed:", refreshError);
      }

      navigate(getOnboardingDestination(role), { replace: true });
    } catch (error) {
      console.error("[Onboarding] Skip failed:", error);
      setStatus({ type: "error", message: text.saveError });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) return null;

  return (
    <div className="page onboarding-modern-page">
      <section className="onboarding-section">
        <div className="container onboarding-card onboarding-modern-card">
          <div className="onboarding-modern-head">
            <h2>{text.title}</h2>
            <p>{text.subtitle}</p>
          </div>

          <form className="onboarding-form onboarding-modern-form" onSubmit={handleSubmit}>
            {formMessage ? (
              <div className="form-error-banner" role="alert">
                {formMessage}
              </div>
            ) : null}

            <div className="field-group">
              <label>{text.role}</label>
              <div className="onboarding-role-tabs" role="radiogroup" aria-invalid={Boolean(errors.role)}>
                {ROLE_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    role="radio"
                    aria-checked={formState.role === option.value}
                    className={`onboarding-role-tab${formState.role === option.value ? " active" : ""}`}
                    data-field="role"
                    onClick={() => setField("role", option.value)}
                  >
                    {option.label[language] || option.label.AR}
                  </button>
                ))}
              </div>
              {errors.role ? <span className="field-error">{errors.role}</span> : null}
            </div>

            <div className="field-grid onboarding-modern-grid">
              <div className="field-group">
                <label htmlFor="firstName">{text.firstName}</label>
                <input
                  id="firstName"
                  type="text"
                  value={formState.firstName}
                  onChange={handleChange("firstName")}
                  data-field="firstName"
                  className={errors.firstName ? "input-error" : ""}
                />
                {errors.firstName ? <span className="field-error">{errors.firstName}</span> : null}
              </div>

              <div className="field-group">
                <label htmlFor="lastName">{text.lastName}</label>
                <input
                  id="lastName"
                  type="text"
                  value={formState.lastName}
                  onChange={handleChange("lastName")}
                  data-field="lastName"
                  className={errors.lastName ? "input-error" : ""}
                />
                {errors.lastName ? <span className="field-error">{errors.lastName}</span> : null}
              </div>
            </div>

            <div className="field-grid onboarding-modern-grid onboarding-modern-grid-3">
              <div className="field-group">
                <label htmlFor="mobile">{text.phone}</label>
                <div className="phone-control" data-field="phoneNumber">
                  <input
                    id="mobile"
                    type="tel"
                    inputMode="numeric"
                    value={formState.phoneNumber}
                    onChange={handlePhoneNumber}
                    className={errors.phoneNumber ? "input-error" : ""}
                  />
                  <select
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
                </div>
                {errors.phoneNumber ? <span className="field-error">{errors.phoneNumber}</span> : null}
              </div>

              <div className="field-group">
                <label htmlFor="country">{text.country}</label>
                <select
                  id="country"
                  value={formState.country}
                  onChange={(event) => {
                    setField("country", event.target.value);
                    setField("city", "");
                  }}
                  data-field="country"
                  className={errors.country ? "input-error" : ""}
                >
                  <option value="">{text.choose}</option>
                  {COUNTRY_OPTIONS.map((country) => (
                    <option key={country} value={country}>
                      {country}
                    </option>
                  ))}
                </select>
                {errors.country ? <span className="field-error">{errors.country}</span> : null}
              </div>

              <div className="field-group">
                <label htmlFor="city">{text.city}</label>
                <select
                  id="city"
                  value={formState.city}
                  onChange={handleChange("city")}
                  data-field="city"
                  className={errors.city ? "input-error" : ""}
                >
                  <option value="">{text.choose}</option>
                  {cityOptions.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
                {errors.city ? <span className="field-error">{errors.city}</span> : null}
              </div>
            </div>

            <div className="field-group">
              <label>{text.interests}</label>
              <div className="onboarding-interest-chips">
                {INTEREST_OPTIONS.map((interest) => {
                  const selected = formState.interests.includes(interest);
                  return (
                    <button
                      key={interest}
                      type="button"
                      className={`onboarding-interest-chip${selected ? " active" : ""}`}
                      onClick={() => toggleInterest(interest)}
                    >
                      {interest}
                    </button>
                  );
                })}
                <button
                  type="button"
                  className="onboarding-interest-chip onboarding-interest-chip-add"
                  onClick={() => setShowCustomInterest((prev) => !prev)}
                >
                  {text.addOther}
                </button>
              </div>
              {showCustomInterest ? (
                <div className="onboarding-custom-interest">
                  <input
                    type="text"
                    value={customInterest}
                    onChange={(event) => setCustomInterest(event.target.value)}
                    placeholder={text.customInterestPlaceholder}
                  />
                  <button type="button" className="btn btn-ghost" onClick={addCustomInterest}>
                    {text.add}
                  </button>
                </div>
              ) : null}
            </div>

            {showBudgetFields ? (
              <div className="field-group">
                <label>{text.budget}</label>
                <div className="onboarding-budget-grid">
                  <input
                    type="number"
                    placeholder={text.budgetMin}
                    value={formState.budgetMin}
                    onChange={handleChange("budgetMin")}
                    data-field="budgetMin"
                    className={errors.budgetMin ? "input-error" : ""}
                  />
                  <input
                    type="number"
                    placeholder={text.budgetMax}
                    value={formState.budgetMax}
                    onChange={handleChange("budgetMax")}
                    data-field="budgetMax"
                    className={errors.budgetMax ? "input-error" : ""}
                  />
                </div>
                {errors.budgetMax ? <span className="field-error">{errors.budgetMax}</span> : null}
              </div>
            ) : null}

            {status.message ? (
              <div className={`auth-status ${status.type}`} role={status.type === "error" ? "alert" : "status"}>
                {status.message}
              </div>
            ) : null}

            <div className="onboarding-modern-actions">
              <button className="btn btn-dark" type="submit" disabled={isSubmitting}>
                {isSubmitting ? text.saving : text.submit}
              </button>
              <button
                className="link-button onboarding-modern-skip"
                type="button"
                onClick={handleSkip}
                disabled={isSubmitting}
              >
                {text.skip}
              </button>
            </div>
          </form>
        </div>
      </section>
    </div>
  );
}
