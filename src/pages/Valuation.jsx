import ValuationForm from "../components/valuation/ValuationForm";
import { TEXT } from "../data/translations";

export default function Valuation({ language = "EN" }) {
  const text = TEXT[language] || TEXT.EN;

  return (
    <div className="page">
      <section className="valuation-section">
        <div className="container">
          <ValuationForm language={language} text={text.valuation} />
        </div>
      </section>
    </div>
  );
}
