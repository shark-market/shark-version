import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCurrency } from "../context/CurrencyContext";
import { PLAN_ACCESS } from "../data/plans";
import { getPartnerListings } from "../data/partnerListings";
import LoginModal from "../components/LoginModal";

const LABELS = {
  EN: {
    back: "Back to partners",
    summary: "Summary",
    problemSolution: "Problem & Solution",
    stage: "Stage & Vision",
    partner: "Partner requirements",
    split: "Equity & Commitment",
    credibility: "Credibility",
    contact: "Contact partner",
    loginToContact: "Log in to contact",
    upgrade: "Upgrade to contact",
    notFound: "Partner listing not found.",
    goBack: "Go back",
    targetMarket: "Target market",
    projectType: "Project type",
    roleNeeded: "Role needed",
    partnerType: "Partner type",
    equity: "Equity",
    work: "Work",
    cashBudget: "Cash budget",
    vesting: "Vesting",
    commitment: "Commitment",
    founderType: "Founder type",
    skills: "Required skills",
    responsibilities: "Responsibilities",
    currentStage: "Current stage",
    vision: "6-12 month vision",
  },
  AR: {
    back: "الرجوع لطلبات الشراكة",
    summary: "نبذة مختصرة",
    problemSolution: "المشكلة والحل",
    stage: "المرحلة والرؤية",
    partner: "الشريك المطلوب",
    split: "التقسيم والالتزام",
    credibility: "المصداقية",
    contact: "تواصل مع الشريك",
    loginToContact: "سجّل الدخول للتواصل",
    upgrade: "ترقية الاشتراك للتواصل",
    notFound: "طلب الشراكة غير موجود.",
    goBack: "عودة",
    targetMarket: "السوق المستهدف",
    projectType: "نوع المشروع",
    roleNeeded: "الدور المطلوب",
    partnerType: "نوع الشريك",
    equity: "نسبة الملكية",
    work: "نسبة العمل",
    cashBudget: "ميزانية نقدية",
    vesting: "Vesting",
    commitment: "الالتزام",
    founderType: "نوع الشريك",
    skills: "المهارات المطلوبة",
    responsibilities: "المسؤوليات",
    currentStage: "المرحلة الحالية",
    vision: "رؤية 6-12 شهر",
  },
};

const STAGE_LABELS = {
  Idea: { EN: "Idea", AR: "فكرة" },
  MVP: { EN: "MVP", AR: "نموذج أولي" },
  Users: { EN: "Users", AR: "مستخدمين" },
  Revenue: { EN: "Revenue", AR: "إيرادات" },
};

const PROJECT_TYPE_LABELS = {
  SaaS: { EN: "SaaS", AR: "SaaS" },
  App: { EN: "App", AR: "تطبيق" },
  AI: { EN: "AI", AR: "ذكاء اصطناعي" },
  Content: { EN: "Content", AR: "محتوى" },
  Marketplace: { EN: "Marketplace", AR: "سوق" },
  Other: { EN: "Other", AR: "أخرى" },
  Ecom: { EN: "E-commerce", AR: "تجارة إلكترونية" },
};

const PARTNER_TYPE_LABELS = {
  Technical: { EN: "Technical", AR: "تقني" },
  Marketing: { EN: "Marketing", AR: "تسويق" },
  Operations: { EN: "Operations", AR: "تشغيل" },
  Investor: { EN: "Investor", AR: "مستثمر" },
};

const COMMITMENT_LABELS = {
  "full-time": { EN: "Full-time", AR: "دوام كامل" },
  "part-time": { EN: "Part-time", AR: "دوام جزئي" },
  hours: { EN: "Hours per week", AR: "ساعات أسبوعية" },
};

const FOUNDER_LABELS = {
  cofounder: { EN: "Co-founder", AR: "مؤسس مشارك" },
  executor: { EN: "Executor", AR: "منفذ" },
};

const VESTING_LABELS = {
  none: { EN: "None", AR: "لا يوجد" },
  "6m": { EN: "6 months", AR: "6 أشهر" },
  "1y": { EN: "1 year", AR: "سنة" },
};

const RESPONSIBILITY_LABELS = {
  product: { EN: "Product strategy", AR: "استراتيجية المنتج" },
  engineering: { EN: "Engineering delivery", AR: "تسليم التطوير" },
  marketing: { EN: "Marketing & brand", AR: "التسويق والهوية" },
  sales: { EN: "Sales & partnerships", AR: "المبيعات والشراكات" },
  operations: { EN: "Operations", AR: "التشغيل" },
  fundraising: { EN: "Fundraising", AR: "جمع التمويل" },
  "customer-success": { EN: "Customer success", AR: "نجاح العملاء" },
  community: { EN: "Community", AR: "المجتمع" },
};

export default function PartnerDetails({ language = "EN" }) {
  const { id } = useParams();
  const text = LABELS[language] || LABELS.EN;
  const isArabic = language === "AR";
  const navigate = useNavigate();
  const { user, role } = useAuth();
  const { formatCurrency } = useCurrency();
  const [showLoginModal, setShowLoginModal] = useState(false);

  const listing = useMemo(() => {
    const listings = getPartnerListings();
    return listings.find((item) => String(item.id) === String(id));
  }, [id]);

  if (!listing) {
    return (
      <section className="partner-details">
        <div className="container listing-details-empty">
          <h2>{text.notFound}</h2>
          <button className="btn btn-dark" type="button" onClick={() => navigate("/partner")}>
            {text.goBack}
          </button>
        </div>
      </section>
    );
  }

  const canContact = PLAN_ACCESS[role]?.canContact ?? false;
  const primaryActionLabel = !user
    ? text.loginToContact
    : canContact
      ? text.contact
      : text.upgrade;

  const stageLabel =
    STAGE_LABELS[listing.status]?.[language] ||
    STAGE_LABELS[listing.status]?.EN ||
    listing.status;
  const projectTypeLabel =
    PROJECT_TYPE_LABELS[listing.projectType]?.[language] ||
    PROJECT_TYPE_LABELS[listing.projectType]?.EN ||
    listing.projectType;
  const partnerTypeLabel =
    PARTNER_TYPE_LABELS[listing.partnerType]?.[language] ||
    PARTNER_TYPE_LABELS[listing.partnerType]?.EN ||
    listing.partnerType;
  const commitmentLabel =
    COMMITMENT_LABELS[listing.commitment]?.[language] ||
    COMMITMENT_LABELS[listing.commitment]?.EN ||
    listing.commitment;
  const founderLabel =
    FOUNDER_LABELS[listing.founderType]?.[language] ||
    FOUNDER_LABELS[listing.founderType]?.EN ||
    listing.founderType;
  const vestingLabel =
    VESTING_LABELS[listing.vesting]?.[language] ||
    VESTING_LABELS[listing.vesting]?.EN ||
    listing.vesting;

  const handleContact = () => {
    if (!user) {
      setShowLoginModal(true);
      return;
    }
    if (!canContact) {
      navigate("/pricing");
      return;
    }
    navigate("/inbox", {
      state: { partnerTitle: listing.projectName, partnerSubtitle: listing.roleNeeded },
    });
  };

  return (
    <section className="partner-details">
      <div className="container">
        <Link className="back-link" to="/partner">
          {text.back}
        </Link>

        <div className="details-layout">
          <div className="details-main">
            <div className="details-header">
              <span className="pill">{projectTypeLabel}</span>
              <h1>{listing.projectName}</h1>
              <p className="muted">
                {stageLabel} · {listing.location}
              </p>
            </div>

            <div className={`details-image ${listing.imageUrl ? "" : "placeholder"}`}>
              {listing.imageUrl ? (
                <img src={listing.imageUrl} alt={listing.projectName} />
              ) : (
                <span>{isArabic ? "بدون صورة" : "No image"}</span>
              )}
            </div>

            <section className="details-card">
              <h3>{text.summary}</h3>
              <p className="muted">{listing.summary}</p>
            </section>

            <section className="details-card">
              <h3>{text.problemSolution}</h3>
              <div className="detail-rows">
                <div>
                  <span className="muted">{isArabic ? "المشكلة" : "Problem"}</span>
                  <strong>{listing.problem}</strong>
                </div>
                <div>
                  <span className="muted">{isArabic ? "الحل" : "Solution"}</span>
                  <strong>{listing.solution}</strong>
                </div>
              </div>
            </section>

            <section className="details-card">
              <h3>{text.stage}</h3>
              <div className="detail-rows">
                <div>
                  <span className="muted">{text.currentStage}</span>
                  <strong>{listing.currentStage || stageLabel}</strong>
                </div>
                <div>
                  <span className="muted">{text.vision}</span>
                  <strong>{listing.vision || "-"}</strong>
                </div>
              </div>
            </section>

            <section className="details-card">
              <h3>{text.partner}</h3>
              <div className="detail-rows">
                <div>
                  <span className="muted">{text.partnerType}</span>
                  <strong>{partnerTypeLabel}</strong>
                </div>
                <div>
                  <span className="muted">{text.roleNeeded}</span>
                  <strong>{listing.roleNeeded}</strong>
                </div>
                <div>
                  <span className="muted">{text.skills}</span>
                  <strong>{listing.requiredSkills || "-"}</strong>
                </div>
                <div>
                  <span className="muted">{text.responsibilities}</span>
                  <strong>
                    {(listing.responsibilities || [])
                      .map(
                        (item) =>
                          RESPONSIBILITY_LABELS[item]?.[language] ||
                          RESPONSIBILITY_LABELS[item]?.EN ||
                          item
                      )
                      .join(isArabic ? "، " : ", ") || "-"}
                  </strong>
                </div>
              </div>
            </section>

            <section className="details-card">
              <h3>{text.split}</h3>
              <div className="detail-rows">
                <div>
                  <span className="muted">{text.equity}</span>
                  <strong>{listing.equityPercent}%</strong>
                </div>
                <div>
                  <span className="muted">{text.work}</span>
                  <strong>{listing.workEquityPercent || 0}%</strong>
                </div>
                <div>
                  <span className="muted">{text.cashBudget}</span>
                  <strong>
                    {listing.cashBudget
                      ? formatCurrency(listing.cashBudget, {
                          locale: isArabic ? "ar-SA" : "en-US",
                        })
                      : "-"}
                  </strong>
                </div>
                <div>
                  <span className="muted">{text.vesting}</span>
                  <strong>{vestingLabel}</strong>
                </div>
                <div>
                  <span className="muted">{text.commitment}</span>
                  <strong>
                    {commitmentLabel}
                    {listing.commitment === "hours" && listing.commitmentHours
                      ? ` · ${listing.commitmentHours} ${
                          isArabic ? "ساعة/أسبوع" : "hrs/week"
                        }`
                      : ""}
                  </strong>
                </div>
                <div>
                  <span className="muted">{text.founderType}</span>
                  <strong>{founderLabel}</strong>
                </div>
              </div>
            </section>

            <section className="details-card">
              <h3>{text.credibility}</h3>
              <div className="detail-rows">
                <div>
                  <span className="muted">{isArabic ? "لماذا الآن؟" : "Why now"}</span>
                  <strong>{listing.credibility?.whyNow || "-"}</strong>
                </div>
                <div>
                  <span className="muted">{isArabic ? "لماذا هذا الدور؟" : "Why this role"}</span>
                  <strong>{listing.credibility?.whyRole || "-"}</strong>
                </div>
                <div>
                  <span className="muted">{isArabic ? "خبرة المؤسس" : "Founder experience"}</span>
                  <strong>{listing.credibility?.founderExperience || "-"}</strong>
                </div>
              </div>
            </section>
          </div>

          <aside className="details-sidebar">
            <div className="details-sidebar-card">
              <div className="details-price">
                <span className="muted">{text.targetMarket}</span>
                <strong>{listing.targetMarket}</strong>
              </div>
              <button className="btn btn-dark btn-block" type="button" onClick={handleContact}>
                {primaryActionLabel}
              </button>
              <div className="quick-info">
                <div>
                  <span className="muted">{text.projectType}</span>
                  <strong>{projectTypeLabel}</strong>
                </div>
                <div>
                  <span className="muted">{text.partnerType}</span>
                  <strong>{partnerTypeLabel}</strong>
                </div>
                <div>
                  <span className="muted">{text.roleNeeded}</span>
                  <strong>{listing.roleNeeded}</strong>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>

      <LoginModal
        open={showLoginModal}
        language={language}
        onClose={() => setShowLoginModal(false)}
      />
    </section>
  );
}
