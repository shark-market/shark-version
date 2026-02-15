import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import LoginModal from "../components/LoginModal";
import { useAuth } from "../context/AuthContext";
import { useCurrency } from "../context/CurrencyContext";
import { getUI } from "../data/uiDictionary";

export default function Pricing({ language = "EN" }) {
  const ui = getUI(language);
  const text = ui.pricing;
  const navigate = useNavigate();
  const { user, setRole, setPlanInterval, planInterval } = useAuth();
  const { formatCurrency } = useCurrency();

  const [interval, setInterval] = useState(planInterval || "monthly");
  const [showLoginModal, setShowLoginModal] = useState(false);

  useEffect(() => {
    if (planInterval && planInterval !== interval) {
      setInterval(planInterval);
    }
  }, [interval, planInterval]);

  const handleSelectPlan = (planKey) => {
    if (!user) {
      setShowLoginModal(true);
      return;
    }

    setRole?.(planKey);
    setPlanInterval?.(interval);
    navigate("/account");
  };

  return (
    <section className="market-page pricing-page-v2">
      <div className="container pricing-v2-header">
        <h1>{text.title}</h1>
        <p className="muted">{text.subtitle}</p>

        <div className="pricing-toggle">
          <div className="toggle-pill">
            <button
              className={interval === "monthly" ? "active" : ""}
              type="button"
              onClick={() => setInterval("monthly")}
            >
              {text.monthly}
            </button>
            <button
              className={interval === "yearly" ? "active" : ""}
              type="button"
              onClick={() => setInterval("yearly")}
            >
              {text.yearly}
            </button>
            <span className="toggle-badge">{text.save}</span>
          </div>
        </div>
      </div>

      <div className="container pricing-v2-grid">
        {text.plans.map((plan) => {
          const amountSAR = interval === "yearly" ? plan.yearly : plan.monthly;
          const isFeatured = plan.key === "plus";
          const priceLabel =
            amountSAR === 0
              ? language === "AR"
                ? "مجاني"
                : "Free"
              : formatCurrency(amountSAR, {
                  locale: language === "AR" ? "ar-SA" : "en-US",
                });

          return (
            <article className={`pricing-card ${isFeatured ? "featured" : ""}`} key={plan.key}>
              {isFeatured ? (
                <span className="pricing-popular-badge">
                  {language === "AR" ? "الأكثر شيوعًا" : "Most Popular"}
                </span>
              ) : null}
              <h3>{plan.name}</h3>
              <p className="pricing-price">
                <strong>{priceLabel}</strong>
                <small>{interval === "yearly" ? text.periodYear : text.period}</small>
              </p>
              <p className="muted">{plan.description}</p>
              <ul>
                {plan.features.map((feature) => (
                  <li key={feature}>{feature}</li>
                ))}
              </ul>
              <button className="btn btn-dark btn-block" type="button" onClick={() => handleSelectPlan(plan.key)}>
                {text.cta}
              </button>
            </article>
          );
        })}
      </div>

      <div className="container pricing-v2-footer">
        <button className="btn btn-ghost" type="button" onClick={() => navigate("/contact")}>
          {text.contactSales}
        </button>
      </div>

      <LoginModal
        open={showLoginModal}
        language={language}
        onClose={() => setShowLoginModal(false)}
      />
    </section>
  );
}
