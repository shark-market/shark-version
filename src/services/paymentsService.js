import { createId, nowIso, readJSON, upsertById, writeJSON } from "./storageService";
import { notifyUser } from "./notificationsService";

const BANK_SETTINGS_KEY = "sm-bank-transfer-settings-v1";
const PAYMENT_REQUESTS_KEY = "sm-payment-requests-db-v1";

const PAYMENT_EVENTS = {
  settingsChanged: "sm-bank-transfer-settings-update",
  requestsChanged: "sm-payment-requests-update",
};

const FEE_RATE = 0.025;

const DEFAULT_BANK_SETTINGS = {
  accountHolderName: "",
  bankName: "",
  accountNumber: "",
  iban: "",
  swiftCode: "",
  qrImageUrl: "",
  qrImageDataUrl: "",
  updatedAt: nowIso(),
};

const STATUS_LABEL_AR = {
  pending: "بانتظار المراجعة",
  approved: "تمت الموافقة",
  rejected: "مرفوض",
};

const emit = (eventName) => {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(eventName));
};

const toAmount = (value) => {
  const parsed = Number(String(value ?? "").replace(/[^0-9.]/g, ""));
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
};

const normalizeStatus = (status) => {
  if (status === "approved" || status === "rejected" || status === "pending") {
    return status;
  }
  return "pending";
};

export const paymentEvents = PAYMENT_EVENTS;
export const paymentFeeRate = FEE_RATE;

export const getBankTransferSettings = () => {
  const stored = readJSON(BANK_SETTINGS_KEY, null);
  if (!stored || typeof stored !== "object" || Array.isArray(stored)) {
    writeJSON(BANK_SETTINGS_KEY, DEFAULT_BANK_SETTINGS);
    return { ...DEFAULT_BANK_SETTINGS };
  }
  return {
    ...DEFAULT_BANK_SETTINGS,
    ...stored,
  };
};

export const saveBankTransferSettings = (settings) => {
  const next = {
    ...DEFAULT_BANK_SETTINGS,
    ...(settings && typeof settings === "object" ? settings : {}),
    updatedAt: nowIso(),
  };
  writeJSON(BANK_SETTINGS_KEY, next);
  emit(PAYMENT_EVENTS.settingsChanged);
  return next;
};

export const updateBankTransferSettings = (patch) => {
  const current = getBankTransferSettings();
  return saveBankTransferSettings({
    ...current,
    ...(patch && typeof patch === "object" ? patch : {}),
  });
};

export const getPaymentRequests = () => {
  const stored = readJSON(PAYMENT_REQUESTS_KEY, []);
  return Array.isArray(stored) ? stored : [];
};

export const savePaymentRequests = (requests) => {
  const safe = Array.isArray(requests) ? requests : [];
  writeJSON(PAYMENT_REQUESTS_KEY, safe);
  emit(PAYMENT_EVENTS.requestsChanged);
  return safe;
};

export const getPaymentRequestsByUser = (userId) =>
  getPaymentRequests()
    .filter((item) => String(item.userId) === String(userId))
    .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());

export const createPaymentRequest = ({
  userId,
  userEmail,
  dealValue,
  transferReference,
  receipt,
}) => {
  const normalizedDealValue = toAmount(dealValue);
  const feeAmount = normalizedDealValue * FEE_RATE;
  const totalAmount = normalizedDealValue + feeAmount;

  const request = {
    id: createId("payment"),
    userId: userId || "",
    userEmail: userEmail || "",
    dealValue: normalizedDealValue,
    feeAmount,
    totalAmount,
    transferReference: String(transferReference || "").trim(),
    receipt:
      receipt && typeof receipt === "object"
        ? {
            fileName: receipt.fileName || "",
            fileType: receipt.fileType || "",
            fileSize: Number(receipt.fileSize || 0),
            dataUrl: receipt.dataUrl || "",
          }
        : null,
    status: "pending",
    reviewNote: "",
    createdAt: nowIso(),
    updatedAt: nowIso(),
    statusHistory: [
      {
        status: "pending",
        changedAt: nowIso(),
        changedByUserId: userId || null,
        changedByEmail: userEmail || "",
        note: "",
      },
    ],
  };

  const next = upsertById(getPaymentRequests(), request);
  savePaymentRequests(next);
  return request;
};

export const updatePaymentRequestStatus = (
  requestId,
  status,
  { reviewNote = "", changedByUserId = "", changedByEmail = "" } = {}
) => {
  const nextStatus = normalizeStatus(status);
  const current = getPaymentRequests().find((item) => String(item.id) === String(requestId));
  if (!current) return null;

  const statusChanged = current.status !== nextStatus;
  const updated = {
    ...current,
    status: nextStatus,
    reviewNote: String(reviewNote || "").trim(),
    updatedAt: nowIso(),
    statusHistory: [
      ...(Array.isArray(current.statusHistory) ? current.statusHistory : []),
      {
        status: nextStatus,
        changedAt: nowIso(),
        changedByUserId: changedByUserId || null,
        changedByEmail: changedByEmail || "",
        note: String(reviewNote || "").trim(),
      },
    ],
  };

  const next = upsertById(getPaymentRequests(), updated);
  savePaymentRequests(next);

  if (statusChanged && updated.userId) {
    notifyUser({
      userId: updated.userId,
      type: "payment_status_changed",
      title: "تحديث حالة طلب الدفع",
      message: `تم تحديث حالة طلب الدفع إلى: ${STATUS_LABEL_AR[nextStatus] || nextStatus}`,
      refId: updated.id,
      meta: {
        paymentStatus: nextStatus,
      },
    });
  }

  return updated;
};

export const getLatestPaymentRequestByUser = (userId) => {
  const items = getPaymentRequestsByUser(userId);
  return items[0] || null;
};
