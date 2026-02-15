import { getUI } from "../data/uiDictionary";

export default function EscrowServices({ language = "EN" }) {
  const ui = getUI(language);
  const text = ui.legal.escrow;

  return (
    <section className="market-page legal-page">
      <div className="container market-page-header">
        <div>
          <h1>{text.title}</h1>
          <p className="muted">{text.intro}</p>
        </div>
      </div>

      <div className="container legal-card">
        <div className="legal-block">
          <h2>{text.stepsTitle}</h2>
          <ol>
            {text.steps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </div>

        <div className="legal-block">
          <h2>{text.benefitsTitle}</h2>
          <ul>
            {text.benefits.map((benefit) => (
              <li key={benefit}>{benefit}</li>
            ))}
          </ul>
        </div>

        <p className="muted">{text.note}</p>
      </div>
    </section>
  );
}
