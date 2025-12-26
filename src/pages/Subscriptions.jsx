import Footer from "../components/Footer";
import { useMemo } from "react";
import { TEXT } from "../data/translations";
import { useAuth } from "../context/AuthContext";
import { PLANS } from "../data/plans";

export default function Subscriptions({ language = "EN" }) {
  const text = TEXT[language] || TEXT.EN;
  const { role, planInterval, setPlanInterval, setRole } = useAuth();
  const isArabic = language === "AR";
  const plansMap = useMemo(() => {
    return PLANS.reduce((acc, plan) => {
      acc[plan.id] = plan;
      return acc;
    }, {});
  }, []);
  const activePlan = plansMap[role] || plansMap.free;
  const interval = planInterval || "monthly";

  return (
    <div className="page">
      <section className="subscriptions-section">
        <div className="container subscriptions-card">
          <div className="subscriptions-header">
            <div>
              <h2>{isArabic ? "إدارة الاشتراكات" : "Manage Subscriptions"}</h2>
              <p className="muted">
                {isArabic
                  ? "تحكم بخطتك، واستفد من أفضل المزايا للمشترين والبائعين."
                  : "Manage your plan and unlock the best buyer & seller tools."}
              </p>
            </div>
            <div className="subscriptions-toggle">
              <button
                className={interval === "monthly" ? "active" : ""}
                type="button"
                onClick={() => setPlanInterval?.("monthly")}
              >
                {isArabic ? "شهري" : "Monthly"}
              </button>
              <button
                className={interval === "yearly" ? "active" : ""}
                type="button"
                onClick={() => setPlanInterval?.("yearly")}
              >
                {isArabic ? "سنوي" : "Yearly"}
              </button>
              <span className="toggle-badge">
                {isArabic ? "وفر شهرين" : "Save 2 months"}
              </span>
            </div>
          </div>

          <div className="subscriptions-current">
            <div>
              <span className="muted">{isArabic ? "الخطة الحالية" : "Current plan"}</span>
              <h3>{activePlan.title?.[language] || activePlan.title?.EN}</h3>
            </div>
            <p className="muted">
              {isArabic
                ? "يمكنك الترقية أو العودة للخطة المجانية في أي وقت."
                : "You can upgrade or return to the free plan anytime."}
            </p>
          </div>

          <div className="subscriptions-grid">
            <div className="subscriptions-panel">
              <h4>{isArabic ? "مزايا خطتك" : "Plan benefits"}</h4>
              <ul className="subscriptions-list">
                {(activePlan.features?.[language] || activePlan.features?.EN || []).map(
                  (item) => (
                    <li key={item}>{item}</li>
                  )
                )}
              </ul>
              <div className="subscriptions-actions">
                <button
                  className="btn btn-dark"
                  type="button"
                  onClick={() => setRole?.("plus")}
                >
                  {isArabic ? "ترقية إلى بلس" : "Upgrade to Plus"}
                </button>
                <button
                  className="btn btn-ghost"
                  type="button"
                  onClick={() => setRole?.("pro")}
                >
                  {isArabic ? "ترقية إلى برو" : "Upgrade to Pro"}
                </button>
                <button
                  className="btn btn-ghost"
                  type="button"
                  onClick={() => setRole?.("free")}
                >
                  {isArabic ? "العودة للمجاني" : "Switch to Free"}
                </button>
              </div>
            </div>

            <div className="subscriptions-panel">
              <h4>{isArabic ? "نصائح للمشتركين" : "Subscriber tips"}</h4>
              <ul className="subscriptions-list muted">
                <li>
                  {isArabic
                    ? "أضف تفاصيل واضحة في إعلانك لزيادة التفاعل."
                    : "Add clear details to your listing to boost engagement."}
                </li>
                <li>
                  {isArabic
                    ? "استخدم صندوق الوارد للرد السريع على المشترين."
                    : "Use the inbox for fast follow-ups with buyers."}
                </li>
                <li>
                  {isArabic
                    ? "فعّل طلب NDA عند مشاركة بيانات حساسة."
                    : "Use NDA requests before sharing sensitive data."}
                </li>
              </ul>
            </div>

            <div className="subscriptions-panel">
              <h4>{isArabic ? "محتوى تعليمي" : "Learning corner"}</h4>
              <div className="subscriptions-links">
                <button className="link-button" type="button">
                  {isArabic ? "كيف تختار مشروعًا مناسبًا؟" : "How to evaluate a listing"}
                </button>
                <button className="link-button" type="button">
                  {isArabic ? "كيف تحدد شريكًا مناسبًا؟" : "How to pick the right partner"}
                </button>
                <button className="link-button" type="button">
                  {isArabic ? "خطوات إتمام الصفقة بأمان" : "Close your deal safely"}
                </button>
              </div>
            </div>
          </div>

          <div className="subscriptions-reco">
            <h4>{isArabic ? "توصيات مخصصة لك" : "Smart recommendations"}</h4>
            <div className="subscriptions-reco-grid">
              <div className="subscriptions-reco-card">
                <strong>{isArabic ? "مشروع SaaS جاهز للنمو" : "Growth-ready SaaS"}</strong>
                <p className="muted">
                  {isArabic
                    ? "إيرادات شهرية مستقرة وفرصة توسع سريعة."
                    : "Stable monthly revenue with fast expansion potential."}
                </p>
              </div>
              <div className="subscriptions-reco-card">
                <strong>{isArabic ? "فرصة شراكة تقنية" : "Technical partner request"}</strong>
                <p className="muted">
                  {isArabic
                    ? "مؤسس يبحث عن قائد تقني لمنتج قائم."
                    : "Founder looking for a technical lead for an active product."}
                </p>
              </div>
              <div className="subscriptions-reco-card">
                <strong>{isArabic ? "إعلان مميز جديد" : "New featured listing"}</strong>
                <p className="muted">
                  {isArabic
                    ? "عرض موثّق مع بيانات مالية كاملة."
                    : "Verified listing with full financial data."}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
      <Footer text={text} language={language} />
    </div>
  );
}
