import { getUI } from "../data/uiDictionary";

export default function Contact({ language = "EN" }) {
  const ui = getUI(language);
  const text = ui.legal.contact;

  return (
    <section className="market-page legal-page">
      <div className="container market-page-header">
        <div>
          <h1>{text.title}</h1>
          <p className="muted">{text.subtitle}</p>
        </div>
      </div>

      <div className="container legal-card">
        <div className="contact-details">
          <div>
            <span className="muted">{text.emailLabel}</span>
            <strong>{text.email}</strong>
          </div>
          <div>
            <span className="muted">{text.phoneLabel}</span>
            <strong>{text.phone}</strong>
          </div>
          <div>
            <span className="muted">{text.hoursLabel}</span>
            <strong>{text.hours}</strong>
          </div>
        </div>
      </div>
    </section>
  );
}
