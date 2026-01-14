import { useMemo } from "react";
import { useNavigate } from "react-router-dom";

export default function OnboardingNext({ language = "EN" }) {
  const navigate = useNavigate();
  const isArabic = language === "AR";

  const text = useMemo(
    () => ({
      success: isArabic
        ? "✅ تم حفظ بياناتك بنجاح"
        : "✅ Your details were saved successfully",
      subtitle: isArabic
        ? "الخطوة التالية: أضف مشروعك الآن أو تخطَّ وأكمل التصفح"
        : "Next step: add a project now or skip and continue browsing.",
      primaryTitle: isArabic ? "إضافة مشروع" : "Add a project",
      primaryDesc: isArabic
        ? "ابدأ بإضافة مشروعك الأول وعرضه للمستثمرين."
        : "Start by adding your first project and showcase it to investors.",
      primaryCta: isArabic ? "ابدأ الآن" : "Start now",
      secondaryTitle: isArabic ? "تخطّي الآن" : "Skip for now",
      secondaryDesc: isArabic
        ? "يمكنك إضافة مشروع لاحقًا من لوحة التحكم."
        : "You can add a project later from your dashboard.",
      secondaryCta: isArabic ? "تخطّي الآن" : "Skip for now",
    }),
    [isArabic]
  );

  return (
    <div className="page">
      <section className="onboarding-next-section">
        <div className="container onboarding-next-card">
          <div className="onboarding-next-header">
            <h2>{text.success}</h2>
            <p className="muted">{text.subtitle}</p>
          </div>
          <div className="next-step-grid">
            <div className="next-step-option primary">
              <h3>{text.primaryTitle}</h3>
              <p className="muted">{text.primaryDesc}</p>
              <button
                className="btn btn-dark"
                type="button"
                onClick={() => navigate("/create-listing")}
              >
                {text.primaryCta}
              </button>
            </div>
            <div className="next-step-option">
              <h3>{text.secondaryTitle}</h3>
              <p className="muted">{text.secondaryDesc}</p>
              <button
                className="btn btn-ghost"
                type="button"
                onClick={() =>
                  navigate("/", { state: { scrollTo: "#listings" } })
                }
              >
                {text.secondaryCta}
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
