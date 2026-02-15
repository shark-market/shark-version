import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import brandLogo from "../assets/brand/sharkmkt-logo.svg";
import { useAuth } from "../context/AuthContext";
import {
  PARTNER_COMMITMENT_OPTIONS,
  PARTNER_INDUSTRY_OPTIONS,
  PARTNER_ROLE_OPTIONS,
} from "../data/marketplaceData";
import { upsertPartnerPost } from "../data/marketplaceStore";
import { upsertListing } from "../services/listingsService";
import { mapCustomListingToAdminListing } from "../services/listingSync";

const DRAFT_KEY = "sm-partner-publish-draft";
const STAGE_OPTIONS = ["Idea", "MVP", "Revenue", "Growth"];
const PARTNERSHIP_TYPE_OPTIONS = ["Co-founder", "Freelancer", "Agency", "Advisor"];
const EXPERIENCE_OPTIONS = ["Beginner", "Intermediate", "Expert"];
const SKILL_OPTIONS = [
  "Product Management",
  "Marketing",
  "Sales",
  "Operations",
  "Design",
  "Engineering",
  "Finance",
  "SEO",
  "Content",
  "Growth",
];
const REGION_OPTIONS = ["Saudi Arabia", "UAE", "Kuwait", "Qatar", "Bahrain", "Egypt", "Global"];
const CITY_OPTIONS = {
  "Saudi Arabia": ["Riyadh", "Jeddah", "Dammam"],
  UAE: ["Dubai", "Abu Dhabi", "Sharjah"],
  Kuwait: ["Kuwait City"],
  Qatar: ["Doha"],
  Bahrain: ["Manama"],
  Egypt: ["Cairo", "Alexandria"],
  Global: ["Remote"],
};
const TIMEZONE_OPTIONS = ["GMT+3", "GMT+2", "GMT+4", "GMT+1", "GMT+0"];

const initialForm = {
  projectName: "",
  summary: "",
  industry: "",
  stage: "",
  roleNeeded: "",
  equityPercent: "",
  partnershipType: "",
  notes: "",
  skills: [],
  commitment: "",
  experienceLevel: "",
  budgetMin: "",
  budgetMax: "",
  region: "",
  city: "",
  timezone: "GMT+3",
  remote: "yes",
  acceptedTerms: false,
};

const TEXT = {
  EN: {
    title: "Publish Partnership Request",
    subtitle: "Complete the steps below to list your request in Find a Partner.",
    steps: [
      "Basic Information",
      "Partnership Details",
      "Skills & Commitment",
      "Budget & Location",
      "Review & Publish",
    ],
    next: "Next",
    back: "Back",
    saveDraft: "Save as draft",
    publish: "Publish request",
    edit: "Edit",
    terms: "I agree to the terms and conditions",
    requiredError: "Please complete required fields before continuing.",
    draftSaved: "Draft saved successfully.",
    publishSuccess: "Your request was published successfully ✅",
    goToPartner: "Go to Find a Partner",
    publishAnother: "Publish another request",
    newBadge: "New",
    projectName: "Project name",
    summary: "Short description",
    industry: "Industry",
    stage: "Project stage",
    roleNeeded: "Role needed",
    equity: "Expected equity (%)",
    partnershipType: "Partnership type",
    notes: "Additional notes",
    skills: "Required skills",
    commitment: "Commitment",
    experienceLevel: "Experience level",
    budget: "Budget range (SAR)",
    min: "Min",
    max: "Max",
    region: "Region",
    city: "City",
    timezone: "Timezone",
    remote: "Remote work?",
    yes: "Yes",
    no: "No",
    helperBasic:
      "Write a clear description so potential partners can understand your project quickly.",
    previewBudget: "Budget",
    previewRole: "Role",
    previewCommitment: "Commitment",
  },
  AR: {
    title: "نشر طلب شراكة",
    subtitle: "أكمل الخطوات التالية لعرض طلبك في صفحة ابحث عن شريك.",
    steps: [
      "معلومات أساسية",
      "تفاصيل الشراكة",
      "المهارات والالتزام",
      "الميزانية والموقع",
      "المراجعة والنشر",
    ],
    next: "التالي",
    back: "رجوع",
    saveDraft: "حفظ كمسودة",
    publish: "نشر الإعلان",
    edit: "تعديل",
    terms: "أوافق على الشروط والأحكام",
    requiredError: "يرجى تعبئة الحقول المطلوبة قبل المتابعة.",
    draftSaved: "تم حفظ المسودة بنجاح.",
    publishSuccess: "تم نشر إعلانك بنجاح ✅",
    goToPartner: "الانتقال إلى صفحة ابحث عن شريك",
    publishAnother: "نشر إعلان آخر",
    newBadge: "جديد",
    projectName: "اسم المشروع",
    summary: "وصف مختصر",
    industry: "القطاع",
    stage: "مرحلة المشروع",
    roleNeeded: "الدور المطلوب",
    equity: "نسبة الملكية المتوقعة (%)",
    partnershipType: "نوع الشراكة",
    notes: "ملاحظات إضافية",
    skills: "المهارات المطلوبة",
    commitment: "الالتزام",
    experienceLevel: "مستوى الخبرة",
    budget: "نطاق الميزانية (ريال)",
    min: "الحد الأدنى",
    max: "الحد الأعلى",
    region: "المنطقة",
    city: "المدينة",
    timezone: "المنطقة الزمنية",
    remote: "العمل عن بعد؟",
    yes: "نعم",
    no: "لا",
    helperBasic: "اكتب وصفًا واضحًا يساعد الشركاء على فهم فكرتك بسرعة.",
    previewBudget: "الميزانية",
    previewRole: "الدور المطلوب",
    previewCommitment: "الالتزام",
  },
};

const toNumber = (value) => {
  const parsed = Number(String(value).replace(/[^0-9.]/g, ""));
  return Number.isFinite(parsed) ? parsed : 0;
};

const normalize = (value) => String(value || "").trim().toLowerCase();

const getLabel = (option, language) =>
  option?.label?.[language] || option?.label?.EN || option?.value || "";

const loadDraft = () => {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(DRAFT_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch (error) {
    return null;
  }
};

const saveDraftToStorage = (data) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(DRAFT_KEY, JSON.stringify(data));
};

const clearDraftStorage = () => {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(DRAFT_KEY);
};

export default function PartnerPublish({ language = "EN" }) {
  const navigate = useNavigate();
  const copy = TEXT[language] || TEXT.EN;
  const isArabic = language === "AR";
  const { user } = useAuth();

  const [step, setStep] = useState(0);
  const [form, setForm] = useState(() => ({ ...initialForm, ...(loadDraft() || {}) }));
  const [errors, setErrors] = useState({});
  const [skillsSearch, setSkillsSearch] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [successState, setSuccessState] = useState({ open: false, postId: "" });

  const skillOptions = useMemo(() => {
    const query = normalize(skillsSearch);
    if (!query) return SKILL_OPTIONS;
    return SKILL_OPTIONS.filter((skill) => normalize(skill).includes(query));
  }, [skillsSearch]);

  const cityOptions = useMemo(() => {
    return CITY_OPTIONS[form.region] || [];
  }, [form.region]);

  const setField = (field) => (event) => {
    const value =
      event.target.type === "checkbox" ? event.target.checked : event.target.value;
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
    setStatusMessage("");
  };

  const toggleSkill = (skill) => {
    setForm((prev) => {
      const exists = prev.skills.includes(skill);
      return {
        ...prev,
        skills: exists
          ? prev.skills.filter((item) => item !== skill)
          : [...prev.skills, skill],
      };
    });
    setErrors((prev) => ({ ...prev, skills: "" }));
  };

  const validateStep = (targetStep) => {
    const nextErrors = {};

    if (targetStep === 0) {
      if (!form.projectName.trim()) nextErrors.projectName = copy.requiredError;
      if (!form.summary.trim()) nextErrors.summary = copy.requiredError;
      if (!form.industry) nextErrors.industry = copy.requiredError;
      if (!form.stage) nextErrors.stage = copy.requiredError;
    }

    if (targetStep === 1) {
      if (!form.roleNeeded) nextErrors.roleNeeded = copy.requiredError;
      if (!form.partnershipType) nextErrors.partnershipType = copy.requiredError;
    }

    if (targetStep === 2) {
      if (!form.skills.length) nextErrors.skills = copy.requiredError;
      if (!form.commitment) nextErrors.commitment = copy.requiredError;
      if (!form.experienceLevel) nextErrors.experienceLevel = copy.requiredError;
    }

    if (targetStep === 3) {
      if (!form.budgetMin) nextErrors.budgetMin = copy.requiredError;
      if (!form.budgetMax) nextErrors.budgetMax = copy.requiredError;
      if (!form.region) nextErrors.region = copy.requiredError;
      if (!form.city) nextErrors.city = copy.requiredError;
      if (!form.timezone) nextErrors.timezone = copy.requiredError;
    }

    if (targetStep === 4) {
      if (!form.acceptedTerms) nextErrors.acceptedTerms = copy.requiredError;
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const goNext = () => {
    if (!validateStep(step)) return;
    setStep((prev) => Math.min(4, prev + 1));
  };

  const goBack = () => {
    if (step === 0) {
      navigate("/partner");
      return;
    }
    setStep((prev) => Math.max(0, prev - 1));
  };

  const onSaveDraft = () => {
    saveDraftToStorage({ ...form, updatedAt: new Date().toISOString() });
    setStatusMessage(copy.draftSaved);
  };

  const publishRequest = () => {
    const allValid = [0, 1, 2, 3, 4].every((target) => validateStep(target));
    if (!allValid) return;

    const now = new Date().toISOString();
    const post = {
      id: `pt-user-${Date.now()}`,
      projectName: form.projectName.trim(),
      summary: form.summary.trim(),
      roleNeeded: form.roleNeeded,
      equityPercent: toNumber(form.equityPercent),
      budgetMinSAR: toNumber(form.budgetMin),
      budgetMaxSAR: toNumber(form.budgetMax),
      skills: form.skills.join(", "),
      industryInterest: form.industry,
      stage: form.stage,
      region: `${form.region}${form.city ? ` - ${form.city}` : ""}`,
      timezone: form.timezone,
      commitmentLevel: form.commitment,
      verified: false,
      isNew: true,
      partnershipType: form.partnershipType,
      experienceLevel: form.experienceLevel,
      remote: form.remote === "yes",
      notes: form.notes.trim(),
      createdAt: now,
    };

    upsertPartnerPost(post);
    upsertListing(
      mapCustomListingToAdminListing({
        id: post.id,
        ownerId: user?.id || "",
        title: post.projectName,
        summary: post.summary,
        category: post.industryInterest,
        stage: post.stage,
        location: post.region,
        region: form.region,
        price: post.budgetMaxSAR || post.budgetMinSAR || 0,
        partnerRole: post.roleNeeded,
        partnerCommitment: post.commitmentLevel,
        status: "pending",
        createdAt: now,
      })
    );
    clearDraftStorage();
    setSuccessState({ open: true, postId: post.id });
  };

  const resetForAnother = () => {
    setForm(initialForm);
    setErrors({});
    setSkillsSearch("");
    setStatusMessage("");
    setSuccessState({ open: false, postId: "" });
    setStep(0);
  };

  const renderStep = () => {
    if (step === 0) {
      return (
        <div className="publish-step-content">
          <label className="field-group">
            <span>{copy.projectName}</span>
            <input type="text" value={form.projectName} onChange={setField("projectName")} />
            {errors.projectName ? <small className="field-error">{errors.projectName}</small> : null}
          </label>

          <label className="field-group">
            <span>{copy.summary}</span>
            <textarea rows="4" value={form.summary} onChange={setField("summary")} />
            {errors.summary ? <small className="field-error">{errors.summary}</small> : null}
          </label>

          <div className="publish-form-grid">
            <label className="field-group">
              <span>{copy.industry}</span>
              <select value={form.industry} onChange={setField("industry")}>
                <option value="">{copy.industry}</option>
                {PARTNER_INDUSTRY_OPTIONS.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
              {errors.industry ? <small className="field-error">{errors.industry}</small> : null}
            </label>

            <label className="field-group">
              <span>{copy.stage}</span>
              <select value={form.stage} onChange={setField("stage")}>
                <option value="">{copy.stage}</option>
                {STAGE_OPTIONS.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
              {errors.stage ? <small className="field-error">{errors.stage}</small> : null}
            </label>
          </div>

          <p className="publish-helper">{copy.helperBasic}</p>
        </div>
      );
    }

    if (step === 1) {
      return (
        <div className="publish-step-content">
          <div className="publish-form-grid">
            <label className="field-group">
              <span>{copy.roleNeeded}</span>
              <select value={form.roleNeeded} onChange={setField("roleNeeded")}>
                <option value="">{copy.roleNeeded}</option>
                {PARTNER_ROLE_OPTIONS.map((item) => (
                  <option key={item.value} value={item.value}>
                    {getLabel(item, language)}
                  </option>
                ))}
              </select>
              {errors.roleNeeded ? <small className="field-error">{errors.roleNeeded}</small> : null}
            </label>

            <label className="field-group">
              <span>{copy.equity}</span>
              <input type="number" min="0" max="100" value={form.equityPercent} onChange={setField("equityPercent")} />
            </label>

            <label className="field-group">
              <span>{copy.partnershipType}</span>
              <select value={form.partnershipType} onChange={setField("partnershipType")}>
                <option value="">{copy.partnershipType}</option>
                {PARTNERSHIP_TYPE_OPTIONS.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
              {errors.partnershipType ? (
                <small className="field-error">{errors.partnershipType}</small>
              ) : null}
            </label>
          </div>

          <label className="field-group">
            <span>{copy.notes}</span>
            <textarea rows="4" value={form.notes} onChange={setField("notes")} />
          </label>
        </div>
      );
    }

    if (step === 2) {
      return (
        <div className="publish-step-content">
          <div className="field-group">
            <span>{copy.skills}</span>
            <input
              type="search"
              value={skillsSearch}
              onChange={(event) => setSkillsSearch(event.target.value)}
              placeholder={copy.skills}
            />
            <div className="partner-skill-chip-wrap">
              {skillOptions.map((skill) => {
                const selected = form.skills.includes(skill);
                return (
                  <button
                    key={skill}
                    type="button"
                    className={`partner-skill-chip-btn${selected ? " active" : ""}`}
                    onClick={() => toggleSkill(skill)}
                  >
                    {skill}
                  </button>
                );
              })}
            </div>
            {errors.skills ? <small className="field-error">{errors.skills}</small> : null}
          </div>

          <div className="publish-form-grid">
            <label className="field-group">
              <span>{copy.commitment}</span>
              <select value={form.commitment} onChange={setField("commitment")}>
                <option value="">{copy.commitment}</option>
                {PARTNER_COMMITMENT_OPTIONS.map((item) => (
                  <option key={item.value} value={item.value}>
                    {getLabel(item, language)}
                  </option>
                ))}
              </select>
              {errors.commitment ? <small className="field-error">{errors.commitment}</small> : null}
            </label>

            <label className="field-group">
              <span>{copy.experienceLevel}</span>
              <select value={form.experienceLevel} onChange={setField("experienceLevel")}>
                <option value="">{copy.experienceLevel}</option>
                {EXPERIENCE_OPTIONS.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
              {errors.experienceLevel ? (
                <small className="field-error">{errors.experienceLevel}</small>
              ) : null}
            </label>
          </div>
        </div>
      );
    }

    if (step === 3) {
      return (
        <div className="publish-step-content">
          <label className="field-group">
            <span>{copy.budget}</span>
            <div className="partner-budget-grid">
              <input
                type="number"
                value={form.budgetMin}
                onChange={setField("budgetMin")}
                placeholder={copy.min}
              />
              <input
                type="number"
                value={form.budgetMax}
                onChange={setField("budgetMax")}
                placeholder={copy.max}
              />
            </div>
            {errors.budgetMin || errors.budgetMax ? (
              <small className="field-error">{copy.requiredError}</small>
            ) : null}
          </label>

          <div className="publish-form-grid">
            <label className="field-group">
              <span>{copy.region}</span>
              <select value={form.region} onChange={setField("region")}>
                <option value="">{copy.region}</option>
                {REGION_OPTIONS.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
              {errors.region ? <small className="field-error">{errors.region}</small> : null}
            </label>

            <label className="field-group">
              <span>{copy.city}</span>
              <select value={form.city} onChange={setField("city")}>
                <option value="">{copy.city}</option>
                {cityOptions.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
              {errors.city ? <small className="field-error">{errors.city}</small> : null}
            </label>

            <label className="field-group">
              <span>{copy.timezone}</span>
              <select value={form.timezone} onChange={setField("timezone")}>
                {TIMEZONE_OPTIONS.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
              {errors.timezone ? <small className="field-error">{errors.timezone}</small> : null}
            </label>

            <label className="field-group">
              <span>{copy.remote}</span>
              <select value={form.remote} onChange={setField("remote")}>
                <option value="yes">{copy.yes}</option>
                <option value="no">{copy.no}</option>
              </select>
            </label>
          </div>
        </div>
      );
    }

    return (
      <div className="publish-step-content">
        <article className="partner-result-card partner-preview-card">
          <div className="partner-result-head">
            <div>
              <h3>{form.projectName || "-"}</h3>
              <p>{form.summary || "-"}</p>
            </div>
            <span className="badge badge-light">{copy.newBadge || "جديد"}</span>
          </div>

          <div className="partner-result-chips">
            <span className="partner-chip">{form.industry || "-"}</span>
            <span className="partner-chip">{form.stage || "-"}</span>
            <span className="partner-chip">{form.roleNeeded || "-"}</span>
            <span className="partner-chip">{form.timezone || "-"}</span>
          </div>

          <div className="partner-result-skills">
            {form.skills.map((skill) => (
              <span className="partner-skill-chip" key={skill}>
                {skill}
              </span>
            ))}
          </div>

          <div className="partner-result-footer">
            <strong>
              {copy.previewBudget}: {form.budgetMin || "0"} - {form.budgetMax || "0"}
            </strong>
            <strong>{copy.previewRole}: {form.roleNeeded || "-"}</strong>
            <strong>{copy.previewCommitment}: {form.commitment || "-"}</strong>
          </div>
        </article>

        <label className="checkbox-row partner-terms-checkbox">
          <input
            type="checkbox"
            checked={form.acceptedTerms}
            onChange={setField("acceptedTerms")}
          />
          <span>{copy.terms}</span>
        </label>
        {errors.acceptedTerms ? <small className="field-error">{errors.acceptedTerms}</small> : null}
      </div>
    );
  };

  return (
    <section className="market-page partner-page-v2 partner-publish-page">
      <div className="container partner-page-head">
        <div className="partner-page-head-main">
          <h1>{copy.title}</h1>
          <p>{copy.subtitle}</p>
        </div>
        <img className="partner-page-head-logo" src={brandLogo} alt="SHARKMKT" />
      </div>

      <div className="container partner-publish-shell">
        <div className="partner-publish-card">
          <div className="partner-publish-stepper">
            {copy.steps.map((label, index) => (
              <div
                key={label}
                className={`partner-step-item${index === step ? " active" : ""}${index < step ? " done" : ""}`}
              >
                <span>{index + 1}</span>
                <strong>{label}</strong>
              </div>
            ))}
          </div>

          {renderStep()}

          {statusMessage ? <p className="auth-status success">{statusMessage}</p> : null}

          <div className="partner-publish-actions">
            <button className="btn btn-ghost" type="button" onClick={goBack}>
              {step === 4 ? copy.edit : copy.back}
            </button>
            <div className="partner-publish-actions-end">
              <button className="btn btn-ghost" type="button" onClick={onSaveDraft}>
                {copy.saveDraft}
              </button>
              {step < 4 ? (
                <button className="btn btn-dark" type="button" onClick={goNext}>
                  {copy.next}
                </button>
              ) : (
                <button className="btn btn-dark" type="button" onClick={publishRequest}>
                  {copy.publish}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {successState.open ? (
        <div className="modal-overlay" role="dialog" aria-modal="true">
          <div className="modal-card partner-success-modal">
            <h3>{copy.publishSuccess}</h3>
            <div className="modal-actions">
              <button
                type="button"
                className="btn btn-dark"
                onClick={() =>
                  navigate("/partner", { state: { newPostId: successState.postId } })
                }
              >
                {copy.goToPartner}
              </button>
              <button type="button" className="btn btn-ghost" onClick={resetForAnother}>
                {copy.publishAnother}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
