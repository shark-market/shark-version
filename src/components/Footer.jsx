import { useNavigate } from "react-router-dom";

export default function Footer({ text, language = "EN" }) {
  const isArabic = language === "AR";
  const navigate = useNavigate();
  const goTo = (path, scrollTo) => {
    navigate(path, scrollTo ? { state: { scrollTo } } : undefined);
  };
  return (
    <footer className="footer" id="contact">
      <div className="footer-trust">
        <div className="container trust-grid">
          <div className="trust-item">
            <span className="trust-icon">🔒</span>
            <span>{isArabic ? "مدفوعات آمنة" : "Secure Payments"}</span>
          </div>
          <div className="trust-item">
            <span className="trust-icon">🛡️</span>
            <span>{isArabic ? "حماية وسيط الضمان" : "Escrow Protection"}</span>
          </div>
          <div className="trust-item">
            <span className="trust-icon">✅</span>
            <span>{isArabic ? "عروض موثّقة" : "Verified Listings"}</span>
          </div>
          <div className="trust-item">
            <span className="trust-icon">✔️</span>
            <span>{isArabic ? "توثيق KYC" : "KYC Verification"}</span>
          </div>
        </div>
      </div>

      <div className="container footer-inner">
        <div className="footer-column">
          <div className="footer-logo">
            <img src="/sharkmkt-logo.png" alt="Shark Market" />
          </div>
          <p className="muted">{text.footerIntro}</p>
        </div>
        <div className="footer-column">
          <h4>{text.quickLinks}</h4>
          <button className="footer-link" type="button" onClick={() => goTo("/", "#listings")}>
            {text.browseListings}
          </button>
          <button className="footer-link" type="button" onClick={() => goTo("/onboarding")}>
            {isArabic ? "بيع مشروعك" : "Sell Your Business"}
          </button>
          <button className="footer-link" type="button" onClick={() => goTo("/", "#home")}>
            {text.howItWorks}
          </button>
          <button className="footer-link" type="button" onClick={() => goTo("/pricing")}>
            {text.pricingLink}
          </button>
        </div>
        <div className="footer-column">
          <h4>{isArabic ? "الموارد" : "Resources"}</h4>
          <button className="footer-link" type="button" onClick={() => goTo("/blog")}>
            {isArabic ? "المدونة" : "Blog"}
          </button>
          <button className="footer-link" type="button">
            {isArabic ? "مركز المساعدة" : "Help Center"}
          </button>
          <button className="footer-link" type="button">
            {isArabic ? "دليل المشتري" : "Buyer Guide"}
          </button>
          <button className="footer-link" type="button">
            {isArabic ? "دليل البائع" : "Seller Guide"}
          </button>
        </div>
        <div className="footer-column">
          <h4>{isArabic ? "قانوني" : "Legal"}</h4>
          <button className="footer-link" type="button" onClick={() => goTo("/privacy")}>
            {isArabic ? "سياسة الخصوصية" : "Privacy Policy"}
          </button>
          <button className="footer-link" type="button" onClick={() => goTo("/terms")}>
            {isArabic ? "شروط الخدمة" : "Terms of Service"}
          </button>
          <button className="footer-link" type="button" onClick={() => goTo("/escrow")}>
            {isArabic ? "خدمات الضمان" : "Escrow Services"}
          </button>
          <button className="footer-link" type="button" onClick={() => goTo("/contact")}>
            {isArabic ? "تواصل معنا" : "Contact Us"}
          </button>
        </div>
      </div>

      <div className="footer-bottom">
        © 2024 Shark Market. {isArabic ? "جميع الحقوق محفوظة." : "All rights reserved."}
      </div>
    </footer>
  );
}
