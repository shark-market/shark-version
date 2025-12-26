import Footer from "../components/Footer";
import { TEXT } from "../data/translations";

export default function PrivacyPolicy({ language = "EN" }) {
  const text = TEXT[language] || TEXT.EN;
  const isArabic = language === "AR";
  const effectiveDate = isArabic ? "01 يناير 2024" : "January 1, 2024";

  return (
    <div className="page">
      <section className="legal-section">
        <div className="container legal-card">
          <h2>{isArabic ? "سياسة الخصوصية" : "Privacy Policy"}</h2>
          <p className="muted">
            {isArabic
              ? `تاريخ النفاذ: ${effectiveDate}`
              : `Effective Date: ${effectiveDate}`}
          </p>

          <p>
            {isArabic
              ? "توضح هذه السياسة كيفية جمع واستخدام وحماية البيانات الشخصية لدى Shark Market. باستخدامك للمنصة، فإنك توافق على الممارسات الموضحة هنا."
              : "This policy describes how Shark Market collects, uses, and protects personal data. By using the platform, you agree to the practices described here."}
          </p>

          <h3>{isArabic ? "المعلومات التي نجمعها" : "Information We Collect"}</h3>
          <ul>
            <li>
              {isArabic
                ? "بيانات الحساب مثل الاسم والبريد الإلكتروني ورقم الهاتف."
                : "Account data such as name, email, and phone number."}
            </li>
            <li>
              {isArabic
                ? "بيانات الملف الشخصي والاهتمامات والتفضيلات."
                : "Profile data, preferences, and interests."}
            </li>
            <li>
              {isArabic
                ? "بيانات الاستخدام والتحليلات لتحسين الخدمة."
                : "Usage and analytics data to improve the service."}
            </li>
          </ul>

          <h3>{isArabic ? "كيفية استخدام البيانات" : "How We Use Data"}</h3>
          <ul>
            <li>
              {isArabic
                ? "لتوفير الخدمات، والتحقق من الهوية، والتواصل معك."
                : "To deliver services, verify identity, and communicate with you."}
            </li>
            <li>
              {isArabic
                ? "لتحسين المنصة وتجربة المستخدم."
                : "To improve the platform and user experience."}
            </li>
            <li>
              {isArabic
                ? "للامتثال للمتطلبات النظامية في المملكة العربية السعودية."
                : "To comply with regulatory requirements in Saudi Arabia."}
            </li>
          </ul>

          <h3>{isArabic ? "مشاركة البيانات" : "Data Sharing"}</h3>
          <p>
            {isArabic
              ? "قد نشارك بيانات محدودة مع مزودي خدمات موثوقين فقط لتشغيل المنصة، مع الالتزام بالسرية."
              : "We may share limited data with trusted service providers to operate the platform, subject to confidentiality."}
          </p>

          <h3>{isArabic ? "حقوقك" : "Your Rights"}</h3>
          <p>
            {isArabic
              ? "يمكنك طلب الوصول لبياناتك أو تحديثها أو حذفها عبر التواصل معنا."
              : "You can request access, updates, or deletion of your data by contacting us."}
          </p>

          <h3>{isArabic ? "التواصل" : "Contact"}</h3>
          <p>
            {isArabic
              ? "للاستفسارات المتعلقة بالخصوصية، تواصل عبر البريد: privacy@sharkmarket.com"
              : "For privacy inquiries, contact: privacy@sharkmarket.com"}
          </p>
        </div>
      </section>
      <Footer text={text} language={language} />
    </div>
  );
}
