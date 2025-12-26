import Footer from "../components/Footer";
import { TEXT } from "../data/translations";

export default function Contact({ language = "EN" }) {
  const text = TEXT[language] || TEXT.EN;
  const isArabic = language === "AR";

  return (
    <div className="page">
      <section className="legal-section" id="contact">
        <div className="container legal-card">
          <h2>{isArabic ? "تواصل معنا" : "Contact Us"}</h2>
          <p className="muted">
            {isArabic
              ? "يسعدنا تواصلك معنا لأي استفسار يتعلق بالمنصة أو الدعم."
              : "We’re here to help with any questions about the platform or support."}
          </p>
          <div className="contact-details">
            <div>
              <span className="muted">
                {isArabic ? "البريد الإلكتروني" : "Email"}
              </span>
              <strong>hello@sharkmarket.com</strong>
            </div>
            <div>
              <span className="muted">
                {isArabic ? "الهاتف" : "Phone"}
              </span>
              <strong>+966 555 555 555</strong>
            </div>
            <div>
              <span className="muted">
                {isArabic ? "ساعات العمل" : "Business Hours"}
              </span>
              <strong>
                {isArabic
                  ? "الأحد - الخميس، 9 صباحًا - 6 مساءً"
                  : "Sunday - Thursday, 9AM - 6PM"}
              </strong>
            </div>
          </div>
        </div>
      </section>
      <Footer text={text} language={language} />
    </div>
  );
}
