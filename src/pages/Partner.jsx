import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCurrency } from "../context/CurrencyContext";
import { useAuth } from "../context/AuthContext";
import UpgradeModal from "../components/UpgradeModal";
import { PLAN_ACCESS } from "../data/plans";
import { TEXT } from "../data/translations";
import { getPartnerListings, savePartnerListings } from "../data/partnerListings";

const PROJECT_TYPES = [
  { value: "SaaS", label: { EN: "SaaS", AR: "SaaS" } },
  { value: "App", label: { EN: "App", AR: "تطبيق" } },
  { value: "AI", label: { EN: "AI", AR: "ذكاء اصطناعي" } },
  { value: "Content", label: { EN: "Content", AR: "محتوى" } },
  { value: "Marketplace", label: { EN: "Marketplace", AR: "سوق" } },
  { value: "Other", label: { EN: "Other", AR: "أخرى" } },
];

const STAGE_OPTIONS = [
  { value: "Idea", label: { EN: "Idea", AR: "فكرة" } },
  { value: "MVP", label: { EN: "MVP", AR: "نموذج أولي" } },
  { value: "Users", label: { EN: "Users", AR: "مستخدمين" } },
  { value: "Revenue", label: { EN: "Revenue", AR: "إيرادات" } },
];

const PARTNER_TYPES = [
  { value: "Technical", label: { EN: "Technical", AR: "تقني" } },
  { value: "Marketing", label: { EN: "Marketing", AR: "تسويق" } },
  { value: "Operations", label: { EN: "Operations", AR: "تشغيل" } },
  { value: "Investor", label: { EN: "Investor", AR: "مستثمر" } },
];

const ROLE_OPTIONS = [
  { value: "Frontend Lead", label: { EN: "Frontend Lead", AR: "قائد واجهات" } },
  { value: "Full-stack Developer", label: { EN: "Full-stack Developer", AR: "مطوّر شامل" } },
  { value: "Growth Marketer", label: { EN: "Growth Marketer", AR: "مختص نمو" } },
  { value: "Content Lead", label: { EN: "Content Lead", AR: "مسؤول محتوى" } },
  { value: "Operations Lead", label: { EN: "Operations Lead", AR: "مسؤول تشغيل" } },
  { value: "Strategic Investor", label: { EN: "Strategic Investor", AR: "مستثمر استراتيجي" } },
];

const RESPONSIBILITY_OPTIONS = [
  { value: "product", label: { EN: "Product strategy", AR: "استراتيجية المنتج" } },
  { value: "engineering", label: { EN: "Engineering delivery", AR: "تسليم التطوير" } },
  { value: "marketing", label: { EN: "Marketing & brand", AR: "التسويق والهوية" } },
  { value: "sales", label: { EN: "Sales & partnerships", AR: "المبيعات والشراكات" } },
  { value: "operations", label: { EN: "Operations", AR: "التشغيل" } },
  { value: "fundraising", label: { EN: "Fundraising", AR: "جمع التمويل" } },
  { value: "customer-success", label: { EN: "Customer success", AR: "نجاح العملاء" } },
  { value: "community", label: { EN: "Community", AR: "المجتمع" } },
];

const COMMITMENT_OPTIONS = [
  { value: "full-time", label: { EN: "Full-time", AR: "دوام كامل" } },
  { value: "part-time", label: { EN: "Part-time", AR: "دوام جزئي" } },
  { value: "hours", label: { EN: "Hours per week", AR: "ساعات أسبوعية" } },
];

const FOUNDER_TYPES = [
  { value: "cofounder", label: { EN: "Co-founder", AR: "مؤسس مشارك" } },
  { value: "executor", label: { EN: "Executor", AR: "منفذ" } },
];

const VESTING_OPTIONS = [
  { value: "none", label: { EN: "None", AR: "لا يوجد" } },
  { value: "6m", label: { EN: "6 months", AR: "6 أشهر" } },
  { value: "1y", label: { EN: "1 year", AR: "سنة" } },
];

const getOptionLabel = (options, value, language) => {
  const match = options.find((option) => option.value === value);
  if (!match) return value;
  return match.label?.[language] || match.label?.EN || value;
};

const DEFAULT_FORM = {
  projectName: "",
  projectType: "SaaS",
  targetMarket: "",
  location: "",
  status: "Idea",
  imageUrl: "",
  summary: "",
  problem: "",
  solution: "",
  currentStage: "",
  vision: "",
  partnerType: "Technical",
  roleNeeded: "Frontend Lead",
  requiredSkills: "",
  responsibilities: [],
  commitment: "part-time",
  commitmentHours: "",
  founderType: "cofounder",
  equityPercent: "",
  workEquityPercent: "",
  cashBudget: "",
  vesting: "none",
  whyNow: "",
  whyRole: "",
  founderExperience: "",
  isAccurate: false,
};

export default function Partner({ language = "EN" }) {
  const text = TEXT[language] || TEXT.EN;
  const isArabic = language === "AR";
  const { currency, currencies, toSAR } = useCurrency();
  const currencyLabel = isArabic
    ? currencies?.[currency]?.symbol || currency
    : currencies?.[currency]?.label || currency;
  const { user, role } = useAuth();
  const navigate = useNavigate();
  const hasPartnerAccess = user && PLAN_ACCESS[role]?.canOpenPartner;
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [form, setForm] = useState(DEFAULT_FORM);
  const [offers, setOffers] = useState(() => getPartnerListings());
  const [filters, setFilters] = useState({
    search: "",
    role: "all",
    stage: "all",
    minEquity: "",
    maxEquity: "",
  });
  const [formStatus, setFormStatus] = useState({ type: "", message: "" });

  const handleChange = (field) => (event) => {
    const nextValue =
      event.target.type === "checkbox" ? event.target.checked : event.target.value;
    setForm((prev) => {
      if (field === "commitment" && nextValue !== "hours") {
        return { ...prev, commitment: nextValue, commitmentHours: "" };
      }
      return { ...prev, [field]: nextValue };
    });
  };

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const previewUrl = URL.createObjectURL(file);
    setForm((prev) => ({ ...prev, imageUrl: previewUrl }));
  };

  const handleFilterChange = (field) => (event) => {
    setFilters((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const toggleResponsibility = (value) => {
    setForm((prev) => ({
      ...prev,
      responsibilities: prev.responsibilities.includes(value)
        ? prev.responsibilities.filter((item) => item !== value)
        : [...prev.responsibilities, value],
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setFormStatus({ type: "", message: "" });
    const equityPercent = Number(form.equityPercent) || 0;
    const workEquityPercent = Number(form.workEquityPercent) || 0;
    const cashBudget = form.cashBudget ? toSAR(Number(form.cashBudget)) : 0;
    const totalEquity = equityPercent + workEquityPercent;

    if (totalEquity > 100) {
      setFormStatus({
        type: "error",
        message: isArabic
          ? "مجموع نسب الملكية والعمل يجب ألا يتجاوز 100٪."
          : "Equity and work percentages must not exceed 100%.",
      });
      return;
    }

    if (!form.isAccurate) {
      setFormStatus({
        type: "error",
        message: isArabic
          ? "يرجى تأكيد صحة المعلومات قبل النشر."
          : "Please confirm the information is accurate.",
      });
      return;
    }

    const newOffer = {
      id: `p${Date.now()}`,
      projectName: form.projectName.trim(),
      projectType: form.projectType,
      targetMarket: form.targetMarket.trim(),
      location: form.location.trim(),
      status: form.status,
      imageUrl: form.imageUrl.trim(),
      summary: form.summary.trim(),
      problem: form.problem.trim(),
      solution: form.solution.trim(),
      currentStage: form.currentStage.trim(),
      vision: form.vision.trim(),
      partnerType: form.partnerType,
      roleNeeded: form.roleNeeded,
      requiredSkills: form.requiredSkills.trim(),
      responsibilities: form.responsibilities,
      commitment: form.commitment,
      commitmentHours: form.commitment === "hours" ? form.commitmentHours : "",
      founderType: form.founderType,
      equityPercent,
      workEquityPercent,
      cashBudget,
      vesting: form.vesting,
      credibility: {
        whyNow: form.whyNow.trim(),
        whyRole: form.whyRole.trim(),
        founderExperience: form.founderExperience.trim(),
      },
    };

    const nextOffers = [newOffer, ...offers];
    setOffers(nextOffers);
    savePartnerListings(nextOffers);
    setForm(DEFAULT_FORM);
    setFormStatus({
      type: "success",
      message: isArabic ? "تم نشر العرض بنجاح." : "Offer published successfully.",
    });
  };

  const filteredOffers = useMemo(() => {
    const search = filters.search.trim().toLowerCase();
    const minEquity = Number(filters.minEquity) || 0;
    const maxEquity = Number(filters.maxEquity) || 100;

    return offers.filter((offer) => {
      const matchesSearch = search
        ? [
            offer.projectName,
            offer.requiredSkills,
            offer.location,
            offer.targetMarket,
            offer.roleNeeded,
          ]
            .join(" ")
            .toLowerCase()
            .includes(search)
        : true;
      const matchesRole =
        filters.role === "all" ? true : offer.roleNeeded === filters.role;
      const matchesStage =
        filters.stage === "all" ? true : offer.status === filters.stage;
      const matchesEquity =
        offer.equityPercent >= minEquity && offer.equityPercent <= maxEquity;
      return matchesSearch && matchesRole && matchesStage && matchesEquity;
    });
  }, [filters, offers]);

  const handleContact = (offer) => {
    if (!hasPartnerAccess) {
      setShowUpgradeModal(true);
      return;
    }
    navigate("/inbox", {
      state: { partnerTitle: offer.projectName, partnerSubtitle: offer.roleNeeded },
    });
  };

  return (
    <section className="partner-page">
      <div className="container partner-header">
        <h2>{isArabic ? "ابحث عن شريك" : "Find a Partner"}</h2>
        <p className="muted">
          {isArabic
            ? "اعرض فرص الشراكة وشارك النسبة المطلوبة."
            : "Post a partnership opportunity and share the equity percentage."}
        </p>
      </div>

      <div className="container partner-layout">
        <form className="partner-form" onSubmit={handleSubmit}>
          <h3>{isArabic ? "نشر فرصة شراكة" : "Post an Offer"}</h3>

          <div className="partner-form-section">
            <h4>{isArabic ? "1) معلومات المشروع" : "1) Project basics"}</h4>
            <div className="field-grid">
              <div className="field-group">
                <label>{isArabic ? "اسم المشروع" : "Project name"}</label>
                <input
                  type="text"
                  value={form.projectName}
                  onChange={handleChange("projectName")}
                  required
                />
              </div>
              <div className="field-group">
                <label>{isArabic ? "نوع المشروع" : "Project type"}</label>
                <select
                  value={form.projectType}
                  onChange={handleChange("projectType")}
                >
                  {PROJECT_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label[language] || type.label.EN}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="field-grid">
              <div className="field-group">
                <label>{isArabic ? "السوق المستهدف" : "Target market"}</label>
                <input
                  type="text"
                  value={form.targetMarket}
                  onChange={handleChange("targetMarket")}
                  required
                />
              </div>
              <div className="field-group">
                <label>{isArabic ? "الدولة / المدينة" : "Country / City"}</label>
                <input
                  type="text"
                  value={form.location}
                  onChange={handleChange("location")}
                  required
                />
              </div>
            </div>

            <div className="field-grid">
              <div className="field-group">
                <label>{isArabic ? "حالة المشروع" : "Project status"}</label>
                <select value={form.status} onChange={handleChange("status")}>
                  {STAGE_OPTIONS.map((stage) => (
                    <option key={stage.value} value={stage.value}>
                      {stage.label[language] || stage.label.EN}
                    </option>
                  ))}
                </select>
              </div>
              <div className="field-group">
                <label>{isArabic ? "صورة أو شعار (اختياري)" : "Logo (optional)"}</label>
                <input
                  type="url"
                  value={form.imageUrl}
                  onChange={handleChange("imageUrl")}
                  placeholder={
                    isArabic
                      ? "https://example.com/image.jpg"
                      : "https://example.com/image.jpg"
                  }
                />
                <div className="partner-upload">
                  <input type="file" accept="image/*" onChange={handleImageChange} />
                  <span className="muted">
                    {isArabic ? "أو ارفع صورة من جهازك" : "Or upload from your device"}
                  </span>
                </div>
              </div>
            </div>

            <div className="field-group">
              <label>{isArabic ? "نبذة مختصرة" : "Short summary"}</label>
              <textarea
                rows="3"
                value={form.summary}
                onChange={handleChange("summary")}
                required
              />
            </div>
          </div>

          <div className="partner-form-section">
            <h4>{isArabic ? "2) الرؤية والمرحلة" : "2) Vision & stage"}</h4>
            <div className="field-group">
              <label>{isArabic ? "المشكلة التي نحلها" : "Problem we're solving"}</label>
              <textarea
                rows="3"
                value={form.problem}
                onChange={handleChange("problem")}
                required
              />
            </div>
            <div className="field-group">
              <label>{isArabic ? "الحل المقترح" : "Proposed solution"}</label>
              <textarea
                rows="3"
                value={form.solution}
                onChange={handleChange("solution")}
                required
              />
            </div>
            <div className="field-grid">
              <div className="field-group">
                <label>{isArabic ? "المرحلة الحالية" : "Current stage"}</label>
                <input
                  type="text"
                  value={form.currentStage}
                  onChange={handleChange("currentStage")}
                  placeholder={isArabic ? "مثال: MVP مع مستخدمين" : "e.g. MVP with users"}
                />
              </div>
              <div className="field-group">
                <label>{isArabic ? "رؤية 6-12 شهر" : "6-12 month vision"}</label>
                <input
                  type="text"
                  value={form.vision}
                  onChange={handleChange("vision")}
                  placeholder={isArabic ? "هدف واضح للمرحلة القادمة" : "Goal for the next stage"}
                />
              </div>
            </div>
          </div>

          <div className="partner-form-section">
            <h4>{isArabic ? "3) الشريك المطلوب" : "3) Partner requirements"}</h4>
            <div className="field-grid">
              <div className="field-group">
                <label>{isArabic ? "نوع الشريك" : "Partner type"}</label>
                <select value={form.partnerType} onChange={handleChange("partnerType")}>
                  {PARTNER_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label[language] || type.label.EN}
                    </option>
                  ))}
                </select>
              </div>
              <div className="field-group">
                <label>{isArabic ? "الدور المطلوب" : "Role needed"}</label>
                <select value={form.roleNeeded} onChange={handleChange("roleNeeded")}>
                  {ROLE_OPTIONS.map((roleOption) => (
                    <option key={roleOption.value} value={roleOption.value}>
                      {roleOption.label[language] || roleOption.label.EN}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="field-group">
              <label>{isArabic ? "المهارات المطلوبة" : "Skills required"}</label>
              <input
                type="text"
                value={form.requiredSkills}
                onChange={handleChange("requiredSkills")}
                placeholder={isArabic ? "مثال: React, Growth" : "e.g React, Growth"}
              />
            </div>

            <div className="field-group">
              <label>{isArabic ? "المسؤوليات" : "Responsibilities"}</label>
              <div className="partner-checklist">
                {RESPONSIBILITY_OPTIONS.map((item) => (
                  <label className="checkbox-row" key={item.value}>
                    <input
                      type="checkbox"
                      checked={form.responsibilities.includes(item.value)}
                      onChange={() => toggleResponsibility(item.value)}
                    />
                    <span>{item.label[language] || item.label.EN}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="field-grid">
              <div className="field-group">
                <label>{isArabic ? "مستوى الالتزام" : "Commitment"}</label>
                <select value={form.commitment} onChange={handleChange("commitment")}>
                  {COMMITMENT_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label[language] || option.label.EN}
                    </option>
                  ))}
                </select>
              </div>
              <div className="field-group">
                <label>{isArabic ? "الساعات الأسبوعية" : "Weekly hours"}</label>
                <input
                  type="number"
                  min="1"
                  value={form.commitmentHours}
                  onChange={handleChange("commitmentHours")}
                  disabled={form.commitment !== "hours"}
                  required={form.commitment === "hours"}
                />
              </div>
            </div>

            <div className="field-group">
              <label>{isArabic ? "نوع الشريك" : "Founder type"}</label>
              <select value={form.founderType} onChange={handleChange("founderType")}>
                {FOUNDER_TYPES.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label[language] || option.label.EN}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="partner-form-section">
            <h4>{isArabic ? "4) التقسيم" : "4) Equity split"}</h4>
            <div className="field-grid">
              <div className="field-group">
                <label>{isArabic ? "نسبة الملكية" : "Equity %"}</label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={form.equityPercent}
                  onChange={handleChange("equityPercent")}
                  required
                />
              </div>
              <div className="field-group">
                <label>{isArabic ? "نسبة العمل" : "Work equity %"}</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={form.workEquityPercent}
                  onChange={handleChange("workEquityPercent")}
                />
              </div>
            </div>

            <div className="field-grid">
              <div className="field-group">
                <label>
                  {isArabic
                    ? `ميزانية نقدية (اختياري) - ${currencyLabel}`
                    : `Cash budget (optional) - ${currencyLabel}`}
                </label>
                <input
                  type="number"
                  min="0"
                  value={form.cashBudget}
                  onChange={handleChange("cashBudget")}
                  placeholder={
                    isArabic
                      ? `مثال: 1000 ${currencyLabel}`
                      : `e.g. 1000 ${currencyLabel}`
                  }
                />
              </div>
              <div className="field-group">
                <label>{isArabic ? "Vesting" : "Vesting"}</label>
                <select value={form.vesting} onChange={handleChange("vesting")}>
                  {VESTING_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label[language] || option.label.EN}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="partner-form-section">
            <h4>{isArabic ? "5) المصداقية" : "5) Credibility"}</h4>
            <div className="field-group">
              <label>{isArabic ? "لماذا تبحث عن شريك الآن؟" : "Why now?"}</label>
              <textarea
                rows="2"
                value={form.whyNow}
                onChange={handleChange("whyNow")}
              />
            </div>
            <div className="field-group">
              <label>{isArabic ? "لماذا هذا الدور مهم؟" : "Why is this role critical?"}</label>
              <textarea
                rows="2"
                value={form.whyRole}
                onChange={handleChange("whyRole")}
              />
            </div>
            <div className="field-group">
              <label>{isArabic ? "خبرة المؤسس" : "Founder experience"}</label>
              <textarea
                rows="2"
                value={form.founderExperience}
                onChange={handleChange("founderExperience")}
              />
            </div>
            <label className="checkbox-row">
              <input
                type="checkbox"
                checked={form.isAccurate}
                onChange={handleChange("isAccurate")}
                required
              />
              <span>
                {isArabic
                  ? "أتعهد أن المعلومات صحيحة"
                  : "I confirm the information is accurate"}
              </span>
            </label>
          </div>

          {formStatus.message ? (
            <div className={`auth-status ${formStatus.type}`}>
              {formStatus.message}
            </div>
          ) : null}

          <button className="btn btn-dark btn-block" type="submit">
            {isArabic ? "نشر العرض" : "Submit Offer"}
          </button>
        </form>

        <div className="partner-results">
          {hasPartnerAccess ? (
            <div className="partner-filters">
              <input
                type="text"
                placeholder={isArabic ? "ابحث..." : "Search..."}
                value={filters.search}
                onChange={handleFilterChange("search")}
              />
              <select value={filters.role} onChange={handleFilterChange("role")}>
                <option value="all">{isArabic ? "كل الأدوار" : "All roles"}</option>
                {ROLE_OPTIONS.map((role) => (
                  <option key={role.value} value={role.value}>
                    {role.label[language] || role.label.EN}
                  </option>
                ))}
              </select>
              <select value={filters.stage} onChange={handleFilterChange("stage")}>
                <option value="all">{isArabic ? "كل المراحل" : "All stages"}</option>
                {STAGE_OPTIONS.map((stage) => (
                  <option key={stage.value} value={stage.value}>
                    {stage.label[language] || stage.label.EN}
                  </option>
                ))}
              </select>
              <input
                type="number"
                min="0"
                max="100"
                placeholder={isArabic ? "أقل نسبة" : "Min %"}
                value={filters.minEquity}
                onChange={handleFilterChange("minEquity")}
              />
              <input
                type="number"
                min="0"
                max="100"
                placeholder={isArabic ? "أعلى نسبة" : "Max %"}
                value={filters.maxEquity}
                onChange={handleFilterChange("maxEquity")}
              />
            </div>
          ) : null}

          {!hasPartnerAccess ? (
            <div className="partner-locked">
              <div className="partner-locked-card">
                <h3>{isArabic ? "طلبات الشراكة" : "Partner Requests"}</h3>
                <p className="muted">
                  {isArabic
                    ? `عدد الطلبات المتاحة: ${offers.length}`
                    : `Total requests available: ${offers.length}`}
                </p>
                <button
                  className="btn btn-dark"
                  type="button"
                  onClick={() => setShowUpgradeModal(true)}
                >
                  {isArabic ? "فتح قائمة الشركاء" : "Open Partner list"}
                </button>
              </div>
            </div>
          ) : (
            <div className="partner-grid">
              {filteredOffers.map((offer) => (
                <article className="partner-card" key={offer.id}>
                  {offer.imageUrl ? (
                    <div className="partner-image">
                      <img src={offer.imageUrl} alt={offer.projectName} />
                    </div>
                  ) : (
                    <div className="partner-image placeholder">
                      {isArabic ? "بدون صورة" : "No image"}
                    </div>
                  )}
                  <div className="partner-card-top">
                    <h4>{offer.projectName}</h4>
                    <span className="pill">
                      {getOptionLabel(PARTNER_TYPES, offer.partnerType, language)}
                    </span>
                  </div>
                  <p className="muted">
                    {getOptionLabel(STAGE_OPTIONS, offer.status, language)} · {offer.location}
                  </p>
                  <p>{offer.summary}</p>
                  <div className="partner-equity">
                    <span>
                      {isArabic ? "نسبة الملكية:" : "Equity:"} {offer.equityPercent}%
                    </span>
                    <span>
                      {isArabic ? "عمل" : "Work"} {offer.workEquityPercent || 0}%
                    </span>
                  </div>

                  <div className="partner-actions">
                    <button
                      className="btn btn-ghost"
                      type="button"
                      onClick={() => navigate(`/partner/${offer.id}`)}
                    >
                      {isArabic ? "عرض التفاصيل" : "View details"}
                    </button>
                    <button
                      className="btn btn-dark"
                      type="button"
                      onClick={() => handleContact(offer)}
                    >
                      {isArabic ? "تواصل" : "Contact"}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
      <UpgradeModal
        open={showUpgradeModal}
        title={text.upgradeTitle}
        subtitle={text.upgradeSubtitle}
        confirmLabel={text.upgradeButton}
        cancelLabel={text.upgradeCancel}
        onClose={() => setShowUpgradeModal(false)}
        onConfirm={() => navigate("/pricing")}
      />
    </section>
  );
}
