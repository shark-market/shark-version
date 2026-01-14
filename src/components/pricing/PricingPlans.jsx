import { useNavigate } from "react-router-dom";
import { PLANS } from "../../data/plans";
import PlanCard from "./PlanCard";

export default function PricingPlans({ language = "EN", interval = "monthly", onSelectPlan }) {
  const navigate = useNavigate();
  const isArabic = language === "AR";

  return (
    <section className="pricing-group pricing-single">
      <div className="pricing-grid">
        {PLANS.map((plan) => (
          <PlanCard
            key={plan.id}
            plan={plan}
            language={language}
            interval={interval}
            onSelectPlan={onSelectPlan}
          />
        ))}
        <div className="pricing-card pricing-card-enterprise">
          <span className="pill">{isArabic ? "مؤسسات" : "Enterprise"}</span>
          <h3>{isArabic ? "Enterprise" : "Enterprise"}</h3>
          <div className="pricing-price">
            <span>{isArabic ? "حسب الطلب" : "Custom"}</span>
          </div>
          <p className="muted">
            {isArabic
              ? "مناسب للفرق الكبيرة والصفقات الاستراتيجية مع دعم مخصص."
              : "Tailored for large teams and strategic acquisitions with dedicated support."}
          </p>
          <ul>
            <li>{isArabic ? "مدير حساب مخصص" : "Dedicated account manager"}</li>
            <li>{isArabic ? "تسعير مرن حسب الحجم" : "Flexible pricing by volume"}</li>
            <li>{isArabic ? "دعم فحص شامل" : "Full due diligence support"}</li>
          </ul>
          <button
            className="btn btn-block btn-ghost"
            type="button"
            onClick={() => navigate("/contact")}
          >
            {isArabic ? "تواصل معنا" : "Contact sales"}
          </button>
        </div>
      </div>
    </section>
  );
}
