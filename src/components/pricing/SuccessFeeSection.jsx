import { PLANS, SUCCESS_FEE_NOTE } from "../../data/plans";

export default function SuccessFeeSection({ language = "EN" }) {
  return (
    <section className="pricing-group pricing-commission">
      <div className="pricing-group-header">
        <h3>{language === "AR" ? "عمولة إتمام الصفقة" : "Success Fee"}</h3>
        <p className="muted">
          {SUCCESS_FEE_NOTE[language] || SUCCESS_FEE_NOTE.EN}
        </p>
      </div>
      <div className="commission-grid">
        {PLANS.map((plan) => (
          <div className="commission-card" key={plan.id}>
            <strong>{plan.title?.[language] || plan.title?.EN}</strong>
            <span className="muted">{plan.successFeePercent}%</span>
          </div>
        ))}
      </div>
    </section>
  );
}
