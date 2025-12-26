import { PLANS } from "../../data/plans";
import PlanCard from "./PlanCard";

export default function PricingPlans({ language = "EN", interval = "monthly", onSelectPlan }) {
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
      </div>
    </section>
  );
}
