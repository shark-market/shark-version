import Footer from "../components/Footer";
import { TEXT } from "../data/translations";

export default function TermsOfService({ language = "EN" }) {
  const text = TEXT[language] || TEXT.EN;
  const isArabic = language === "AR";
  const effectiveDate = isArabic ? "01 يناير 2024" : "January 1, 2024";

  return (
    <div className="page">
      <section className="legal-section">
        <div className="container legal-card">
          <h2>{isArabic ? "شروط الخدمة" : "Terms of Service"}</h2>
          <p className="muted">
            {isArabic
              ? `تاريخ النفاذ: ${effectiveDate}`
              : `Effective Date: ${effectiveDate}`}
          </p>

          <p>
            {isArabic
              ? "باستخدامك لمنصة Shark Market، فإنك توافق على هذه الشروط والأحكام. إذا لم توافق، يرجى عدم استخدام الخدمة."
              : "By using Shark Market, you agree to these terms and conditions. If you do not agree, please do not use the service."}
          </p>

          <h3>{isArabic ? "الأهلية والحساب" : "Eligibility and Accounts"}</h3>
          <ul>
            <li>
              {isArabic
                ? "يجب أن تكون البيانات المقدمة دقيقة ومحدثة."
                : "You must provide accurate and up-to-date information."}
            </li>
            <li>
              {isArabic
                ? "أنت مسؤول عن الحفاظ على سرية بيانات الدخول."
                : "You are responsible for keeping your login credentials secure."}
            </li>
          </ul>

          <h3>{isArabic ? "الاستخدام المسموح" : "Permitted Use"}</h3>
          <p>
            {isArabic
              ? "يحظر استخدام المنصة لأي أنشطة غير قانونية أو مضللة أو تنتهك حقوق الآخرين."
              : "You may not use the platform for unlawful, misleading, or rights-infringing activities."}
          </p>

          <h3>{isArabic ? "المحتوى والقوائم" : "Listings and Content"}</h3>
          <p>
            {isArabic
              ? "تلتزم بتقديم معلومات دقيقة في القوائم، وقد نقوم بإزالة أي محتوى يخالف سياساتنا."
              : "You must provide accurate listing information. We may remove content that violates our policies."}
          </p>

          <h3>{isArabic ? "إخلاء المسؤولية" : "Disclaimers"}</h3>
          <p>
            {isArabic
              ? "المنصة تُقدم كما هي، ولا نقدم ضمانات ضمنية بشأن توافر أو دقة المعلومات."
              : "The platform is provided “as is” without implied warranties regarding availability or accuracy."}
          </p>

          <h3>{isArabic ? "القانون المعمول به" : "Governing Law"}</h3>
          <p>
            {isArabic
              ? "تخضع هذه الشروط لأنظمة المملكة العربية السعودية."
              : "These terms are governed by the laws of the Kingdom of Saudi Arabia."}
          </p>

          <h3>{isArabic ? "التواصل" : "Contact"}</h3>
          <p>
            {isArabic
              ? "للاستفسارات القانونية، تواصل عبر البريد: legal@sharkmarket.com"
              : "For legal inquiries, contact: legal@sharkmarket.com"}
          </p>
        </div>
      </section>
      <Footer text={text} language={language} />
    </div>
  );
}
