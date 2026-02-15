import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  createPaymentRequest,
  getBankTransferSettings,
  getLatestPaymentRequestByUser,
  paymentEvents,
  paymentFeeRate,
} from "../services/paymentsService";
import {
  getUserNotifications,
  markUserNotificationRead,
  notificationsEvents,
} from "../services/notificationsService";

const MAX_RECEIPT_SIZE_BYTES = 3 * 1024 * 1024;

const STATUS_LABELS = {
  pending: "بانتظار المراجعة",
  approved: "تمت الموافقة",
  rejected: "مرفوض",
};

const STATUS_STEPS = ["pending", "approved", "rejected"];

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

const formatDateTime = (iso) => {
  const date = new Date(iso || Date.now());
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString("ar-SA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const readFileAsDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("FILE_READ_FAILED"));
    reader.readAsDataURL(file);
  });

const isAcceptedReceipt = (file) => {
  if (!file) return false;
  const mime = String(file.type || "").toLowerCase();
  if (mime.startsWith("image/")) return true;
  if (mime === "application/pdf") return true;
  return String(file.name || "").toLowerCase().endsWith(".pdf");
};

const getStepClassName = (step, current) => {
  if (step === current) return "active";
  if (current === "approved" && step === "pending") return "done";
  if (current === "rejected" && step === "pending") return "done";
  return "idle";
};

export default function FeePaymentFollowup() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const fileInputRef = useRef(null);

  const initialDealValue = parseAmount(searchParams.get("deal"));
  const [dealValueInput, setDealValueInput] = useState(
    initialDealValue > 0 ? String(initialDealValue) : ""
  );
  const [bankSettings, setBankSettings] = useState(() => getBankTransferSettings());
  const [latestRequest, setLatestRequest] = useState(() =>
    user?.id ? getLatestPaymentRequestByUser(user.id) : null
  );
  const [transferReference, setTransferReference] = useState("");
  const [receipt, setReceipt] = useState(null);
  const [formError, setFormError] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [uploading, setUploading] = useState(false);
  const [statusNotifications, setStatusNotifications] = useState([]);

  useEffect(() => {
    if (!user?.id) {
      setLatestRequest(null);
      setStatusNotifications([]);
      return;
    }

    const refresh = () => {
      setBankSettings(getBankTransferSettings());
      setLatestRequest(getLatestPaymentRequestByUser(user.id));
      setStatusNotifications(
        getUserNotifications(user.id).filter((item) => item.type === "payment_status_changed")
      );
    };

    refresh();
    window.addEventListener(paymentEvents.settingsChanged, refresh);
    window.addEventListener(paymentEvents.requestsChanged, refresh);
    window.addEventListener(notificationsEvents.userChanged, refresh);
    window.addEventListener("storage", refresh);

    return () => {
      window.removeEventListener(paymentEvents.settingsChanged, refresh);
      window.removeEventListener(paymentEvents.requestsChanged, refresh);
      window.removeEventListener(notificationsEvents.userChanged, refresh);
      window.removeEventListener("storage", refresh);
    };
  }, [user?.id]);

  const latestUnreadStatusNotification = useMemo(
    () => statusNotifications.find((item) => !item.read) || null,
    [statusNotifications]
  );

  const { dealValue, feeAmount, totalAmount } = useMemo(() => {
    const safeDealValue = parseAmount(dealValueInput);
    const fee = safeDealValue * paymentFeeRate;
    return {
      dealValue: safeDealValue,
      feeAmount: fee,
      totalAmount: safeDealValue + fee,
    };
  }, [dealValueInput]);

  const qrSrc = bankSettings.qrImageDataUrl || bankSettings.qrImageUrl || "";
  const bankConfigured = Boolean(
    String(bankSettings.accountHolderName || "").trim() &&
      String(bankSettings.accountNumber || "").trim() &&
      String(bankSettings.iban || "").trim()
  );

  const handleReceiptUpload = async (event) => {
    const file = event.target.files?.[0];
    setFormError("");
    if (!file) {
      setReceipt(null);
      return;
    }

    if (!isAcceptedReceipt(file)) {
      setReceipt(null);
      setFormError("صيغة الإيصال غير مدعومة. الرجاء رفع صورة أو ملف PDF فقط.");
      return;
    }

    if (file.size > MAX_RECEIPT_SIZE_BYTES) {
      setReceipt(null);
      setFormError("حجم ملف الإيصال كبير. الحد الأقصى المسموح 3MB.");
      return;
    }

    setUploading(true);
    try {
      const dataUrl = await readFileAsDataUrl(file);
      setReceipt({
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        dataUrl,
      });
    } catch (error) {
      setReceipt(null);
      setFormError("تعذر قراءة الملف المرفوع. حاول مرة أخرى.");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setFormError("");
    setConfirmation("");

    if (!dealValue || dealValue <= 0) {
      setFormError("يرجى إدخال قيمة صفقة صحيحة لحساب العمولة.");
      return;
    }

    if (!bankConfigured) {
      setFormError("بيانات التحويل البنكي غير مفعلة حاليًا. يرجى المحاولة لاحقًا.");
      return;
    }

    if (!String(transferReference || "").trim()) {
      setFormError("حقل رقم مرجع التحويل مطلوب.");
      return;
    }

    if (!receipt?.dataUrl) {
      setFormError("حقل رفع إيصال التحويل مطلوب.");
      return;
    }

    let created = null;
    try {
      created = createPaymentRequest({
        userId: user?.id,
        userEmail: user?.email,
        dealValue,
        transferReference,
        receipt,
      });
    } catch (error) {
      setFormError("تعذر حفظ طلب الدفع حالياً. الرجاء المحاولة مرة أخرى.");
      return;
    }

    setLatestRequest(created);
    setTransferReference("");
    setReceipt(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    setConfirmation(
      "تم استلام طلب الدفع بنجاح بحالة: بانتظار المراجعة. سيتم التحقق خلال 24–48 ساعة."
    );
  };

  const activeStatus = latestRequest?.status || "pending";

  return (
    <section className="market-page fees-page fees-payment-page" dir="rtl">
      <div className="container fees-shell">
        <header className="fees-head">
          <h1>متابعة الدفع</h1>
          <p>الرجاء تحويل عمولة المنصة ثم إدخال مرجع التحويل ورفع الإيصال لإكمال المراجعة.</p>
        </header>

        {latestUnreadStatusNotification ? (
          <div className="payment-status-notice" role="status" aria-live="polite">
            <strong>{latestUnreadStatusNotification.title}</strong>
            <p>{latestUnreadStatusNotification.message}</p>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => markUserNotificationRead(latestUnreadStatusNotification.id, user?.id)}
            >
              تم الاطلاع
            </button>
          </div>
        ) : null}

        <article className="fees-card payment-followup-card">
          <div className="fees-results">
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
                required
              />
            </label>
            <div className="fees-row">
              <span>عمولة المنصة (٢.٥٪)</span>
              <strong>{formatSar(feeAmount)}</strong>
            </div>
            <div className="fees-row">
              <span>الإجمالي المطلوب دفعه</span>
              <strong>{formatSar(totalAmount)}</strong>
            </div>
          </div>

          <div className="payment-bank-card">
            <div className="payment-bank-card-head">
              <h2>بيانات التحويل البنكي</h2>
              {!bankConfigured ? (
                <small className="muted">لا توجد بيانات تحويل مفعلة من لوحة الأدمن حاليًا.</small>
              ) : null}
            </div>

            {qrSrc ? (
              <div className="payment-qr-wrap">
                <img src={qrSrc} alt="QR التحويل البنكي" />
              </div>
            ) : null}

            <div className="payment-bank-grid">
              <div>
                <span>اسم صاحب الحساب</span>
                <strong>{bankSettings.accountHolderName || "-"}</strong>
              </div>
              <div>
                <span>اسم البنك</span>
                <strong>{bankSettings.bankName || "-"}</strong>
              </div>
              <div>
                <span>رقم الحساب</span>
                <strong className="ltr-field">{bankSettings.accountNumber || "-"}</strong>
              </div>
              <div>
                <span>رقم الآيبان</span>
                <strong className="ltr-field">{bankSettings.iban || "-"}</strong>
              </div>
              <div>
                <span>كود سويفت</span>
                <strong className="ltr-field">{bankSettings.swiftCode || "-"}</strong>
              </div>
            </div>
          </div>

          <form className="payment-form" onSubmit={handleSubmit}>
            <label className="field-group">
              <span>رقم مرجع التحويل</span>
              <input
                type="text"
                value={transferReference}
                onChange={(event) => setTransferReference(event.target.value)}
                placeholder="أدخل رقم المرجع كما يظهر في البنك"
                required
              />
            </label>

            <label className="field-group">
              <span>رفع إيصال التحويل</span>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,application/pdf,.pdf"
                onChange={handleReceiptUpload}
                required
              />
              <small className="muted">
                الصيغ المدعومة: صورة أو PDF. الحد الأقصى: 3MB.
              </small>
              {uploading ? <small className="muted">جاري تجهيز الملف...</small> : null}
              {receipt?.fileName ? <small className="muted">تم اختيار: {receipt.fileName}</small> : null}
            </label>

            {formError ? <p className="payment-feedback error">{formError}</p> : null}
            {confirmation ? <p className="payment-feedback success">{confirmation}</p> : null}

            <div className="fees-actions">
              <button type="submit" className="btn btn-dark" disabled={uploading || !bankConfigured}>
                إرسال طلب المراجعة
              </button>
              <button type="button" className="btn btn-ghost" onClick={() => navigate(-1)}>
                رجوع
              </button>
            </div>
          </form>

          <div className="payment-status-wrap" aria-live="polite">
            <h3>حالة الطلب</h3>
            <p className="muted">بانتظار المراجعة → تمت الموافقة → مرفوض</p>
            <div className="payment-status-steps">
              {STATUS_STEPS.map((step, index) => (
                <div key={step} className={`payment-status-step ${getStepClassName(step, activeStatus)}`}>
                  <span className="payment-status-dot" aria-hidden="true" />
                  <strong>{STATUS_LABELS[step]}</strong>
                  {index < STATUS_STEPS.length - 1 ? (
                    <span className="payment-status-arrow" aria-hidden="true">
                      →
                    </span>
                  ) : null}
                </div>
              ))}
            </div>
            {latestRequest ? (
              <p className="payment-meta">
                آخر طلب: <strong>{latestRequest.id}</strong> - <strong>{STATUS_LABELS[latestRequest.status]}</strong> - {" "}
                {formatDateTime(latestRequest.updatedAt || latestRequest.createdAt)}
              </p>
            ) : (
              <p className="payment-meta">لم يتم إنشاء أي طلب دفع بعد.</p>
            )}
          </div>
        </article>
      </div>
    </section>
  );
}
