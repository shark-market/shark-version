import { useEffect, useMemo, useState } from "react";
import AdminShell from "../components/admin/AdminShell";
import {
  getBankTransferSettings,
  getPaymentRequests,
  paymentEvents,
  updateBankTransferSettings,
  updatePaymentRequestStatus,
} from "../services/paymentsService";
import { getUsers, usersEvents } from "../services/usersService";
import { useAuth } from "../context/AuthContext";

const MAX_QR_SIZE_BYTES = 2 * 1024 * 1024;

const TEXT = {
  AR: {
    title: "مدفوعات التحويل البنكي",
    subtitle: "إدارة بيانات الحساب البنكي ومراجعة طلبات دفع العمولة",
    settingsTitle: "إعدادات التحويل البنكي",
    accountHolderName: "اسم صاحب الحساب",
    bankName: "اسم البنك",
    accountNumber: "رقم الحساب",
    iban: "رقم الآيبان",
    swiftCode: "كود سويفت",
    qrImageUrl: "رابط صورة QR (اختياري)",
    qrUpload: "رفع صورة QR",
    qrHint: "صيغة صورة فقط - الحد الأقصى 2MB",
    saveSettings: "حفظ إعدادات التحويل",
    settingsSaved: "تم حفظ إعدادات التحويل البنكي بنجاح.",
    all: "الكل",
    pending: "بانتظار المراجعة",
    approved: "تمت الموافقة",
    rejected: "مرفوض",
    requestsTitle: "طلبات الدفع",
    owner: "المستخدم",
    dealValue: "قيمة الصفقة",
    feeAmount: "العمولة",
    totalAmount: "الإجمالي",
    transferReference: "مرجع التحويل",
    receipt: "الإيصال",
    status: "الحالة",
    createdAt: "التاريخ",
    action: "إجراء",
    approve: "اعتماد",
    reject: "رفض",
    setPending: "إرجاع للمراجعة",
    noRows: "لا توجد طلبات دفع حالياً.",
    viewReceipt: "عرض الإيصال",
  },
  EN: {
    title: "Bank Transfer Payments",
    subtitle: "Manage bank transfer settings and review commission payment requests",
    settingsTitle: "Bank Transfer Settings",
    accountHolderName: "Account holder name",
    bankName: "Bank name",
    accountNumber: "Account number",
    iban: "IBAN",
    swiftCode: "SWIFT code",
    qrImageUrl: "QR image URL (optional)",
    qrUpload: "Upload QR image",
    qrHint: "Image only - max 2MB",
    saveSettings: "Save transfer settings",
    settingsSaved: "Bank transfer settings were saved successfully.",
    all: "All",
    pending: "Pending review",
    approved: "Approved",
    rejected: "Rejected",
    requestsTitle: "Payment requests",
    owner: "User",
    dealValue: "Deal value",
    feeAmount: "Fee",
    totalAmount: "Total",
    transferReference: "Transfer ref",
    receipt: "Receipt",
    status: "Status",
    createdAt: "Date",
    action: "Action",
    approve: "Approve",
    reject: "Reject",
    setPending: "Set pending",
    noRows: "No payment requests yet.",
    viewReceipt: "View receipt",
  },
};

const STATUS_OPTIONS = ["all", "pending", "approved", "rejected"];

const parseAmount = (value) => {
  const parsed = Number(value || 0);
  return Number.isFinite(parsed) ? parsed : 0;
};

const formatSar = (value, locale) =>
  new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "SAR",
    maximumFractionDigits: 2,
  }).format(parseAmount(value));

const formatDate = (iso, locale) => {
  const date = new Date(iso || Date.now());
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString(locale, {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
};

const readFileAsDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("FILE_READ_FAILED"));
    reader.readAsDataURL(file);
  });

const normalizeStatus = (status) => {
  if (status === "approved" || status === "rejected" || status === "pending") {
    return status;
  }
  return "pending";
};

export default function AdminPayments({ language = "AR" }) {
  const copy = TEXT[language] || TEXT.AR;
  const locale = language === "AR" ? "ar-SA" : "en-US";
  const { user } = useAuth();

  const [settingsDraft, setSettingsDraft] = useState(() => getBankTransferSettings());
  const [requests, setRequests] = useState(() => getPaymentRequests());
  const [users, setUsers] = useState(() => getUsers());
  const [activeStatus, setActiveStatus] = useState("all");
  const [settingsFeedback, setSettingsFeedback] = useState("");

  useEffect(() => {
    const refresh = () => {
      setSettingsDraft(getBankTransferSettings());
      setRequests(getPaymentRequests());
      setUsers(getUsers());
    };

    refresh();
    window.addEventListener(paymentEvents.settingsChanged, refresh);
    window.addEventListener(paymentEvents.requestsChanged, refresh);
    window.addEventListener(usersEvents.changed, refresh);
    window.addEventListener("storage", refresh);

    return () => {
      window.removeEventListener(paymentEvents.settingsChanged, refresh);
      window.removeEventListener(paymentEvents.requestsChanged, refresh);
      window.removeEventListener(usersEvents.changed, refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  const userMap = useMemo(
    () => Object.fromEntries(users.map((item) => [String(item.id), item])),
    [users]
  );

  const filteredRequests = useMemo(() => {
    if (activeStatus === "all") return requests;
    return requests.filter((item) => normalizeStatus(item.status) === activeStatus);
  }, [activeStatus, requests]);

  const statusLabel = (status) => {
    const normalized = normalizeStatus(status);
    if (normalized === "pending") return copy.pending;
    if (normalized === "approved") return copy.approved;
    if (normalized === "rejected") return copy.rejected;
    return normalized;
  };

  const handleSettingsSubmit = (event) => {
    event.preventDefault();
    try {
      updateBankTransferSettings(settingsDraft);
      setSettingsFeedback(copy.settingsSaved);
    } catch (error) {
      setSettingsFeedback("");
    }
  };

  const handleQrUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!String(file.type || "").toLowerCase().startsWith("image/")) {
      return;
    }

    if (file.size > MAX_QR_SIZE_BYTES) {
      return;
    }

    try {
      const dataUrl = await readFileAsDataUrl(file);
      setSettingsDraft((prev) => ({
        ...prev,
        qrImageDataUrl: dataUrl,
        qrImageUrl: "",
      }));
    } catch (error) {
      return;
    }
  };

  const changeRequestStatus = (requestId, status) => {
    updatePaymentRequestStatus(requestId, status, {
      changedByUserId: user?.id,
      changedByEmail: user?.email,
    });
  };

  const qrPreview = settingsDraft.qrImageDataUrl || settingsDraft.qrImageUrl || "";

  return (
    <AdminShell language={language} title={copy.title} subtitle={copy.subtitle}>
      <article className="admin-panel-card admin-payment-settings">
        <header>
          <h2>{copy.settingsTitle}</h2>
        </header>

        <form className="admin-payment-settings-form" onSubmit={handleSettingsSubmit}>
          <label className="field-group">
            <span>{copy.accountHolderName}</span>
            <input
              type="text"
              value={settingsDraft.accountHolderName || ""}
              onChange={(event) =>
                setSettingsDraft((prev) => ({ ...prev, accountHolderName: event.target.value }))
              }
            />
          </label>

          <label className="field-group">
            <span>{copy.bankName}</span>
            <input
              type="text"
              value={settingsDraft.bankName || ""}
              onChange={(event) =>
                setSettingsDraft((prev) => ({ ...prev, bankName: event.target.value }))
              }
            />
          </label>

          <label className="field-group">
            <span>{copy.accountNumber}</span>
            <input
              className="ltr-field"
              type="text"
              value={settingsDraft.accountNumber || ""}
              onChange={(event) =>
                setSettingsDraft((prev) => ({ ...prev, accountNumber: event.target.value }))
              }
            />
          </label>

          <label className="field-group">
            <span>{copy.iban}</span>
            <input
              className="ltr-field"
              type="text"
              value={settingsDraft.iban || ""}
              onChange={(event) =>
                setSettingsDraft((prev) => ({ ...prev, iban: event.target.value }))
              }
            />
          </label>

          <label className="field-group">
            <span>{copy.swiftCode}</span>
            <input
              className="ltr-field"
              type="text"
              value={settingsDraft.swiftCode || ""}
              onChange={(event) =>
                setSettingsDraft((prev) => ({ ...prev, swiftCode: event.target.value }))
              }
            />
          </label>

          <label className="field-group">
            <span>{copy.qrImageUrl}</span>
            <input
              type="url"
              value={settingsDraft.qrImageUrl || ""}
              onChange={(event) =>
                setSettingsDraft((prev) => ({
                  ...prev,
                  qrImageUrl: event.target.value,
                  qrImageDataUrl: event.target.value ? "" : prev.qrImageDataUrl,
                }))
              }
            />
          </label>

          <label className="field-group">
            <span>{copy.qrUpload}</span>
            <input type="file" accept="image/*" onChange={handleQrUpload} />
            <small className="muted">{copy.qrHint}</small>
          </label>

          {qrPreview ? (
            <div className="admin-payment-qr-preview">
              <img src={qrPreview} alt="Bank transfer QR" />
            </div>
          ) : null}

          {settingsFeedback ? <p className="payment-feedback success">{settingsFeedback}</p> : null}

          <div className="admin-payment-settings-actions">
            <button type="submit" className="btn btn-dark">
              {copy.saveSettings}
            </button>
          </div>
        </form>
      </article>

      <article className="admin-panel-card">
        <header>
          <h2>{copy.requestsTitle}</h2>
        </header>

        <div className="admin-filter-row">
          {STATUS_OPTIONS.map((status) => (
            <button
              key={status}
              type="button"
              className={`admin-filter-chip${activeStatus === status ? " active" : ""}`}
              onClick={() => setActiveStatus(status)}
            >
              {status === "all" ? copy.all : statusLabel(status)}
            </button>
          ))}
        </div>

        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>{copy.owner}</th>
                <th>{copy.dealValue}</th>
                <th>{copy.feeAmount}</th>
                <th>{copy.totalAmount}</th>
                <th>{copy.transferReference}</th>
                <th>{copy.receipt}</th>
                <th>{copy.status}</th>
                <th>{copy.createdAt}</th>
                <th>{copy.action}</th>
              </tr>
            </thead>
            <tbody>
              {filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan={9} className="admin-empty-row">
                    {copy.noRows}
                  </td>
                </tr>
              ) : (
                filteredRequests.map((item) => {
                  const owner = userMap[String(item.userId)];
                  const normalized = normalizeStatus(item.status);
                  return (
                    <tr key={item.id}>
                      <td>{owner?.email || item.userEmail || item.userId || "-"}</td>
                      <td>{formatSar(item.dealValue, locale)}</td>
                      <td>{formatSar(item.feeAmount, locale)}</td>
                      <td>{formatSar(item.totalAmount, locale)}</td>
                      <td className="ltr-field">{item.transferReference || "-"}</td>
                      <td>
                        {item.receipt?.dataUrl ? (
                          <a
                            href={item.receipt.dataUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="link-button"
                          >
                            {copy.viewReceipt}
                          </a>
                        ) : (
                          "-"
                        )}
                      </td>
                      <td>
                        <span className={`admin-status-pill${normalized === "approved" ? " active" : " pending"}`}>
                          {statusLabel(normalized)}
                        </span>
                      </td>
                      <td>{formatDate(item.createdAt, locale)}</td>
                      <td className="admin-table-actions">
                        <button
                          type="button"
                          className="btn btn-dark"
                          onClick={() => changeRequestStatus(item.id, "approved")}
                        >
                          {copy.approve}
                        </button>
                        <button
                          type="button"
                          className="btn btn-ghost"
                          onClick={() => changeRequestStatus(item.id, "rejected")}
                        >
                          {copy.reject}
                        </button>
                        <button
                          type="button"
                          className="btn btn-ghost"
                          onClick={() => changeRequestStatus(item.id, "pending")}
                        >
                          {copy.setPending}
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </article>
    </AdminShell>
  );
}
