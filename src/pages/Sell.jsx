import { Link } from "react-router-dom";
import {
  LISTING_CATEGORY_OPTIONS,
  SELL_TYPE_CARD_CONTENT,
} from "../data/marketplaceData";
import { getUI } from "../data/uiDictionary";

export default function Sell({ language = "EN" }) {
  const ui = getUI(language);
  const text = ui.sell;

  return (
    <section className="market-page sell-page">
      <div className="container market-page-header">
        <div>
          <h1>{text.title}</h1>
          <p className="muted">{text.subtitle}</p>
        </div>
      </div>

      <div className="container sell-layout">
        <aside className="sell-guide-card">
          <h2>{text.chooseType}</h2>
          <ol>
            {text.steps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
          <p className="muted">{text.trust}</p>
        </aside>

        <div className="sell-types-grid">
          {LISTING_CATEGORY_OPTIONS.map((type) => {
            const label = type.label?.[language] || type.label?.EN;
            const cardCopy =
              SELL_TYPE_CARD_CONTENT[type.value]?.[language] ||
              SELL_TYPE_CARD_CONTENT[type.value]?.EN;
            return (
              <article className="sell-type-card" key={type.value}>
                <div className="sell-type-content">
                  <h3>
                    <span className="sell-type-badge">{label}</span>
                  </h3>
                  <p className="muted">{cardCopy?.what}</p>
                  <p className="muted">{cardCopy?.example}</p>
                </div>
                <Link className="btn btn-dark sell-type-cta" to={`/sell/publish?type=${encodeURIComponent(type.value)}`}>
                  {text.start}
                </Link>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
