import { getUI } from "../data/uiDictionary";

export default function About({ language = "EN" }) {
  const ui = getUI(language);
  const content = ui.about;

  return (
    <section className="market-page about-page">
      <div className="container about-hero">
        <p className="pill">{content.arabicTitle}</p>
        <h1>{content.title}</h1>
        <p>{content.intro}</p>
        <p className="muted">{content.body}</p>
      </div>

      <div className="container about-pillars-grid">
        {content.pillars.map((pillar) => (
          <article className="about-pillar-card" key={pillar.title}>
            <h2>{pillar.title}</h2>
            <span>{pillar.subtitle}</span>
            <p>{pillar.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
