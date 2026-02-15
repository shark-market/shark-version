import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

const FEE_RATE = 0.025;

const parseAmount = (value) => {
  const clean = String(value || "").replace(/[^0-9.]/g, "");
  const parsed = Number(clean);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
};

const formatSar = (value) =>
  new Intl.NumberFormat("ar-SA", {
    style: "currency",
    currency: "SAR",
    maximumFractionDigits: 2,
  }).format(value || 0);

export default function Fees() {
  const navigate = useNavigate();
  const [dealValueInput, setDealValueInput] = useState("");

  const { feeValue, totalValue } = useMemo(() => {
    const dealValue = parseAmount(dealValueInput);
    const fee = dealValue * FEE_RATE;
    return {
      feeValue: fee,
      totalValue: dealValue + fee,
    };
  }, [dealValueInput]);

  const goToPaymentFollowup = () => {
    const dealValue = parseAmount(dealValueInput);
    navigate(`/fees/payment?deal=${encodeURIComponent(String(dealValue))}`);
  };

  return (
    <section className="market-page fees-page" dir="rtl">
      <div className="container fees-shell">
        <header className="fees-head">
          <h1>حاسبة عمولة المنصة</h1>
        </header>

        <article className="fees-card">
          <label className="field-group">
            <span>قيمة الصفقة (ر.س)</span>
            <input
              type="number"
              min="0"
              step="0.01"
              inputMode="decimal"
              value={dealValueInput}
              onChange={(event) => setDealValueInput(event.target.value)}
              placeholder="0"
            />
          </label>

          <div className="fees-results">
            <div className="fees-row">
              <span>عمولة المنصة (٢.٥٪)</span>
              <strong>{formatSar(feeValue)}</strong>
            </div>
            <div className="fees-row">
              <span>الإجمالي المطلوب دفعه</span>
              <strong>{formatSar(totalValue)}</strong>
            </div>
          </div>

          <p className="fees-note">
            لا توجد رسوم على نشر الإعلان. تُستحق عمولة المنصة فقط عند إتمام البيع عبر المنصة.
          </p>

          <div className="fees-actions">
            <button className="btn btn-dark" type="button" onClick={goToPaymentFollowup}>
              متابعة الدفع
            </button>
            <button className="btn btn-ghost" type="button" onClick={() => navigate(-1)}>
              رجوع
            </button>
          </div>
        </article>
      </div>
    </section>
  );
}
