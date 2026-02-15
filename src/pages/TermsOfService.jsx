import { getUI } from "../data/uiDictionary";

export default function TermsOfService({ language = "EN" }) {
  const ui = getUI(language);
  const text = ui.legal.terms;

  return (
    <section className="market-page legal-page">
      <div className="container market-page-header">
        <div>
          <h1>{text.title}</h1>
          <p className="muted">{text.effective}</p>
        </div>
      </div>

      <div className="container legal-card">
        <p>{text.intro}</p>

        {text.sections.map((section) => (
          <div className="legal-block" key={section.heading}>
            <h2>{section.heading}</h2>
            <ul>
              {section.points.map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
          </div>
        ))}

        <p className="muted">{text.contact}</p>
      </div>
    </section>
  );
}
