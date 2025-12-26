import Footer from "../components/Footer";
import { TEXT } from "../data/translations";

export default function EscrowServices({ language = "EN" }) {
  const text = TEXT[language] || TEXT.EN;
  const isArabic = language === "AR";

  return (
    <div className="page">
      <section className="legal-section">
        <div className="container legal-card">
          <h2>{isArabic ? "خدمات الضمان" : "Escrow Services"}</h2>
          <p>
            {isArabic
              ? "توفر Shark Market آلية ضمان لضمان سلامة المعاملات بين البائع والمشتري."
              : "Shark Market provides escrow-style safeguards to protect both buyers and sellers."}
          </p>

          <h3>{isArabic ? "كيف تعمل" : "How It Works"}</h3>
          <ol>
            <li>
              {isArabic
                ? "يتفق الطرفان على الشروط والسعر."
                : "Both parties agree on the terms and price."}
            </li>
            <li>
              {isArabic
                ? "يتم حجز المبلغ لدى جهة ضمان حتى إتمام التسليم."
                : "Funds are held by an escrow provider until delivery is confirmed."}
            </li>
            <li>
              {isArabic
                ? "بعد التحقق، تُحوّل الدفعة للبائع."
                : "After verification, payment is released to the seller."}
            </li>
          </ol>

          <h3>{isArabic ? "الفوائد" : "Benefits"}</h3>
          <ul>
            <li>
              {isArabic
                ? "تقليل المخاطر للطرفين."
                : "Reduced risk for both parties."}
            </li>
            <li>
              {isArabic
                ? "شفافية أكبر في المعاملات."
                : "Greater transparency in transactions."}
            </li>
            <li>
              {isArabic
                ? "حماية عند وجود نزاع."
                : "Dispute protection if issues arise."}
            </li>
          </ul>

          <p className="muted">
            {isArabic
              ? "قد تختلف تفاصيل خدمة الضمان حسب نوع الصفقة."
              : "Escrow details may vary depending on the transaction type."}
          </p>
        </div>
      </section>
      <Footer text={text} language={language} />
    </div>
  );
}
