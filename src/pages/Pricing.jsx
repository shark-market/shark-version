import { useEffect, useState } from "react";
import PricingPlans from "../components/pricing/PricingPlans";
import SuccessFeeSection from "../components/pricing/SuccessFeeSection";
import Footer from "../components/Footer";
import { TEXT } from "../data/translations";
import { useAuth } from "../context/AuthContext";
import LoginModal from "../components/LoginModal";

export default function Pricing({ language = "EN" }) {
  const text = TEXT[language] || TEXT.EN;
  const { user, setRole, setPlanInterval, planInterval } = useAuth();
  const [interval, setInterval] = useState(planInterval || "monthly");
  const [showLoginModal, setShowLoginModal] = useState(false);

  useEffect(() => {
    if (planInterval && planInterval !== interval) {
      setInterval(planInterval);
    }
  }, [interval, planInterval]);

  const handleSelectPlan = (planId) => {
    if (!user) {
      setShowLoginModal(true);
      return;
    }
    setRole?.(planId);
    setPlanInterval?.(interval);
  };

  return (
    <div className="page">
      <section className="pricing-section">
        <div className="container pricing-header">
          <h2>{text.pricingTitle}</h2>
          <p className="muted">{text.pricingSubtitle}</p>
          <div className="pricing-toggle">
            <div className="toggle-pill">
              <button
                className={interval === "monthly" ? "active" : ""}
                type="button"
                onClick={() => setInterval("monthly")}
              >
                {language === "AR" ? "شهري" : "Monthly"}
              </button>
              <button
                className={interval === "yearly" ? "active" : ""}
                type="button"
                onClick={() => setInterval("yearly")}
              >
                {language === "AR" ? "سنوي" : "Yearly"}
              </button>
              <span className="toggle-badge">
                {language === "AR" ? "وفر شهرين" : "Save 2 months"}
              </span>
            </div>
          </div>
        </div>
        <div className="container pricing-groups">
          <PricingPlans
            language={language}
            interval={interval}
            onSelectPlan={handleSelectPlan}
          />
          <SuccessFeeSection language={language} />
          <section className="pricing-compare">
            <div className="pricing-group-header">
              <h3>{language === "AR" ? "مقارنة مختصرة" : "Quick Comparison"}</h3>
              <p className="muted">
                {language === "AR"
                  ? "كل الخطط بالريال السعودي مع خيار شهري أو سنوي."
                  : "All plans are priced in SAR with monthly or yearly options."}
              </p>
            </div>
            <div className="compare-table">
              <div className="compare-row header">
                <span />
                <span>{language === "AR" ? "مجاني" : "Free"}</span>
                <span>{language === "AR" ? "أساسي" : "Basic"}</span>
                <span>{language === "AR" ? "برو" : "Pro"}</span>
              </div>
              {[
                {
                  label: language === "AR" ? "التواصل" : "Contact",
                  free: "—",
                  plus: "✓",
                  pro: "✓",
                },
                {
                  label: language === "AR" ? "صندوق الوارد" : "Inbox",
                  free: "—",
                  plus: "✓",
                  pro: "✓",
                },
                {
                  label: language === "AR" ? "طلب NDA" : "Request NDA",
                  free: "—",
                  plus: language === "AR" ? "محدود" : "Limited",
                  pro: language === "AR" ? "غير محدود" : "Unlimited",
                },
              ].map((row) => (
                <div className="compare-row" key={row.label}>
                  <span>{row.label}</span>
                  <span>{row.free}</span>
                  <span>{row.plus}</span>
                  <span>{row.pro}</span>
                </div>
              ))}
            </div>
          </section>
        </div>
      </section>
      <Footer text={text} language={language} />
      <LoginModal
        open={showLoginModal}
        language={language}
        onClose={() => setShowLoginModal(false)}
      />
    </div>
  );
}
