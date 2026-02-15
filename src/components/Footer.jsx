import { useNavigate } from "react-router-dom";
import brandLogo from "../assets/brand/sharkmkt-logo.svg";
import { getUI } from "../data/uiDictionary";

const PRODUCT_LINKS = [
  { key: "home", path: "/" },
  { key: "browse", path: "/browse" },
  { key: "sell", path: "/sell" },
  { key: "partner", path: "/partner" },
  { key: "messages", path: "/messages" },
  { key: "pricing", path: "/pricing" },
  { key: "blog", path: "/blog" },
];

const COMPANY_LINKS = [
  { key: "about", path: "/about" },
  { key: "contact", path: "/contact" },
  { key: "help", path: "/help" },
];

const LEGAL_LINKS = [
  { key: "privacy", path: "/privacy" },
  { key: "terms", path: "/terms" },
  { key: "escrow", path: "/escrow" },
  { key: "disclaimer", path: "/terms" },
];

const SOCIAL_LINKS = [
  { id: "x", label: "X" },
  { id: "linkedin", label: "in" },
  { id: "instagram", label: "IG" },
];

const TRUST_ICONS = ["✓", "◆", "▣", "●"];

const FOOTER_META = {
  EN: {
    contact: "Contact",
    legal: {
      disclaimer: "Disclaimer",
    },
    contactLabels: {
      emails: "Emails",
      phone: "Phone",
    },
    tagline: "Global standards for buying, selling, and partnering in digital businesses.",
    statement:
      "SHARKMKT is a trusted global destination for buying, selling, and investing in premium digital businesses.",
  },
  AR: {
    contact: "التواصل",
    legal: {
      disclaimer: "إخلاء مسؤولية",
    },
    contactLabels: {
      emails: "البريد",
      phone: "الهاتف",
    },
    tagline: "معايير عالمية لشراء وبيع ومطابقة الشركاء في المشاريع الرقمية.",
    statement:
      "SHARKMKT وجهة عالمية موثوقة لشراء وبيع والاستثمار في المشاريع الرقمية المتميزة.",
  },
};

export default function Footer({ language = "EN" }) {
  const navigate = useNavigate();
  const ui = getUI(language);
  const text = ui.footer;
  const meta = FOOTER_META[language] || FOOTER_META.EN;
  const year = new Date().getFullYear();

  return (
    <footer className="footer" id="footer">
      <div className="container footer-brand-strip">
        <div className="footer-brand-column">
          <div className="footer-logo">
            <img src={brandLogo} alt={ui.brand} />
          </div>
          <p className="muted">{text.intro}</p>
          <p className="footer-statement">{meta.statement}</p>

          <div className="footer-trust-row" aria-label="Trust signals">
            {(text.trust || []).map((item, index) => (
              <span className="footer-trust-item" key={item}>
                <span className="footer-trust-icon" aria-hidden="true">
                  {TRUST_ICONS[index] || "✓"}
                </span>
                {item}
              </span>
            ))}
          </div>

          <div className="footer-social" aria-label={text.social}>
            {SOCIAL_LINKS.map((item) => (
              <button
                key={item.id}
                className="footer-social-link"
                type="button"
                aria-label={item.id}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="container footer-grid-v2">

        <div className="footer-column">
          <h4>{text.product}</h4>
          {PRODUCT_LINKS.map((item) => (
            <button
              key={item.path}
              className="footer-link"
              type="button"
              onClick={() => navigate(item.path)}
            >
              {text.links[item.key]}
            </button>
          ))}
        </div>

        <div className="footer-column">
          <h4>{text.company}</h4>
          {COMPANY_LINKS.map((item) => (
            <button
              key={item.path}
              className="footer-link"
              type="button"
              onClick={() => navigate(item.path)}
            >
              {text.links[item.key]}
            </button>
          ))}
        </div>

        <div className="footer-column">
          <h4>{text.legal}</h4>
          {LEGAL_LINKS.map((item) => (
            <button
              key={`${item.key}-${item.path}`}
              className="footer-link"
              type="button"
              onClick={() => navigate(item.path)}
            >
              {item.key === "disclaimer"
                ? meta.legal.disclaimer
                : text.links[item.key]}
            </button>
          ))}
        </div>

        <div className="footer-column footer-contact-column">
          <h4>{meta.contact}</h4>

          <div className="footer-contact-group">
            <span className="muted">{meta.contactLabels.emails}</span>
            <a className="footer-contact-link" href="mailto:sharkmkt@sharkmkt.io">
              sharkmkt@sharkmkt.io
            </a>
          </div>

          <div className="footer-contact-group">
            <span className="muted">{meta.contactLabels.phone}</span>
            <a className="footer-contact-link" href="tel:+966591658849">
              +966 59 165 8849 (0591658849)
            </a>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="container footer-bottom-inner">
          <span>© SHARKMKT {year}</span>
          <span className="muted">{meta.tagline}</span>
        </div>
      </div>
    </footer>
  );
}
