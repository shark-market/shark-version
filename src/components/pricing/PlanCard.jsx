import { useCurrency } from "../../context/CurrencyContext";

const getBillingLabel = (billing, interval, language) => {
  if (billing === "free") {
    return language === "AR" ? "بدون اشتراك" : "No subscription";
  }
  if (interval === "yearly") {
    return language === "AR" ? "/سنويًا" : "/year";
  }
  return language === "AR" ? "/شهريًا" : "/month";
};

export default function PlanCard({ plan, language = "EN", interval = "monthly", onSelectPlan }) {
  const { formatCurrency } = useCurrency();
  const locale = language === "AR" ? "ar-SA" : "en-US";
  const title = plan.title?.[language] || plan.title?.EN;
  const description = plan.description?.[language] || plan.description?.EN;
  const features = plan.features?.[language] || plan.features?.EN || [];
  const price =
    interval === "yearly" ? plan.priceYearlySAR : plan.priceMonthlySAR;

  return (
    <div className={`pricing-card ${plan.popular ? "popular" : ""}`}>
      {plan.popular ? (
        <span className="popular-pill">
          {language === "AR" ? "الأكثر استخدامًا" : "Most Popular"}
        </span>
      ) : null}
      <h3>{title}</h3>
      <div className="pricing-price">
        <span>
          {price === 0
            ? language === "AR"
              ? "مجاني"
              : "Free"
            : formatCurrency(price, { locale })}
        </span>
        {price === 0 ? null : (
          <small>{getBillingLabel(plan.billing, interval, language)}</small>
        )}
      </div>
      <p className="muted">{description}</p>
      <ul>
        {features.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
      <button
        className={`btn btn-block ${plan.popular ? "btn-dark" : "btn-ghost"}`}
        type="button"
        onClick={() => onSelectPlan?.(plan.id)}
      >
        {price === 0
          ? language === "AR"
            ? "ابدأ مجانًا"
            : "Start Free"
          : language === "AR"
            ? "اشترك الآن"
            : "Subscribe Now"}
      </button>
    </div>
  );
}
