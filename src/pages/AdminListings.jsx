import { useEffect, useMemo, useState } from "react";
import AdminShell from "../components/admin/AdminShell";
import {
  deleteListing,
  getListings,
  listingsEvents,
  updateListingStatus,
} from "../services/listingsService";
import { getUsers, usersEvents } from "../services/usersService";

const TEXT = {
  AR: {
    title: "إدارة الإعلانات",
    subtitle: "مراجعة الإعلانات واعتمادها قبل الظهور الكامل",
    listing: "العنوان",
    type: "النوع",
    extraFields: "الحقول الإضافية",
    owner: "المالك",
    status: "الحالة",
    createdAt: "التاريخ",
    action: "إجراء",
    approve: "اعتماد",
    reject: "رفض",
    delete: "حذف",
    noRows: "لا توجد إعلانات.",
    pending: "قيد المراجعة",
    approved: "معتمد",
    rejected: "مرفوض",
    deleteConfirmTitle: "حذف الإعلان؟",
    deleteConfirmHint: "لن يمكن التراجع عن هذه العملية.",
    cancel: "إلغاء",
    confirm: "تأكيد الحذف",
    viewExtra: "عرض الحقول",
    noExtraFields: "لا توجد حقول إضافية",
  },
  EN: {
    title: "Listings Management",
    subtitle: "Review listings and approve before full visibility",
    listing: "Title",
    type: "Type",
    extraFields: "Extra fields",
    owner: "Owner",
    status: "Status",
    createdAt: "Date",
    action: "Action",
    approve: "Approve",
    reject: "Reject",
    delete: "Delete",
    noRows: "No listings.",
    pending: "Pending",
    approved: "Approved",
    rejected: "Rejected",
    deleteConfirmTitle: "Delete listing?",
    deleteConfirmHint: "This action cannot be undone.",
    cancel: "Cancel",
    confirm: "Confirm delete",
    viewExtra: "View extra fields",
    noExtraFields: "No extra fields",
  },
};

const formatDate = (iso, locale) => {
  const date = new Date(iso || Date.now());
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString(locale, {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
};

const normalizeStatus = (status) => {
  if (status === "approved" || status === "pending" || status === "rejected") {
    return status;
  }
  if (status === "active" || status === "published") return "approved";
  if (status === "paused" || status === "draft") return "pending";
  return "rejected";
};

const formatExtraValue = (value, locale, language) => {
  if (Array.isArray(value)) {
    return value.join(language === "AR" ? "، " : ", ");
  }
  if (typeof value === "number") {
    return value.toLocaleString(locale);
  }
  if (typeof value === "boolean") {
    if (language === "AR") {
      return value ? "نعم" : "لا";
    }
    return value ? "Yes" : "No";
  }
  return String(value || "-");
};

export default function AdminListings({ language = "AR" }) {
  const copy = TEXT[language] || TEXT.AR;
  const locale = language === "AR" ? "ar-SA" : "en-US";
  const [listings, setListings] = useState(() => getListings());
  const [users, setUsers] = useState(() => getUsers());
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => {
    const refresh = () => {
      setListings(getListings());
      setUsers(getUsers());
    };

    refresh();
    window.addEventListener(listingsEvents.listingsChanged, refresh);
    window.addEventListener(usersEvents.changed, refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener(listingsEvents.listingsChanged, refresh);
      window.removeEventListener(usersEvents.changed, refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  const userMap = useMemo(
    () => Object.fromEntries(users.map((user) => [String(user.id), user])),
    [users]
  );

  const statusLabel = (status) => {
    const normalized = normalizeStatus(status);
    if (normalized === "approved") return copy.approved;
    if (normalized === "pending") return copy.pending;
    return copy.rejected;
  };

  const setStatus = (listing, status) => {
    updateListingStatus(listing.id, status);
  };

  const confirmDelete = () => {
    if (!deleteTarget?.id) return;
    deleteListing(deleteTarget.id);
    setDeleteTarget(null);
  };

  return (
    <AdminShell language={language} title={copy.title} subtitle={copy.subtitle}>
      <article className="admin-panel-card">
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>{copy.listing}</th>
                <th>{copy.type}</th>
                <th>{copy.extraFields}</th>
                <th>{copy.owner}</th>
                <th>{copy.status}</th>
                <th>{copy.createdAt}</th>
                <th>{copy.action}</th>
              </tr>
            </thead>
            <tbody>
              {listings.length === 0 ? (
                <tr>
                  <td colSpan={7} className="admin-empty-row">
                    {copy.noRows}
                  </td>
                </tr>
              ) : (
                listings.map((listing) => {
                  const owner = userMap[String(listing.ownerUserId)];
                  const normalized = normalizeStatus(listing.status);
                  const extraEntries =
                    listing.extraFields && typeof listing.extraFields === "object"
                      ? Object.entries(listing.extraFields)
                      : [];
                  return (
                    <tr key={listing.id}>
                      <td>
                        <strong>{listing.title}</strong>
                      </td>
                      <td>{listing.listingType || listing.partnershipType || listing.category || "-"}</td>
                      <td>
                        <details>
                          <summary>{copy.viewExtra}</summary>
                          {extraEntries.length === 0 ? (
                            <p className="muted">{copy.noExtraFields}</p>
                          ) : (
                            <div>
                              {extraEntries.map(([key, value]) => (
                                <p key={key}>
                                  <strong>{key}:</strong>{" "}
                                  {formatExtraValue(value, locale, language)}
                                </p>
                              ))}
                            </div>
                          )}
                        </details>
                      </td>
                      <td>{owner?.email || listing.ownerUserId || "-"}</td>
                      <td>
                        <span className={`admin-status-pill${normalized === "approved" ? " active" : " pending"}`}>
                          {statusLabel(normalized)}
                        </span>
                      </td>
                      <td>{formatDate(listing.createdAt, locale)}</td>
                      <td className="admin-table-actions">
                        <button
                          type="button"
                          className="btn btn-dark"
                          onClick={() => setStatus(listing, "approved")}
                        >
                          {copy.approve}
                        </button>
                        <button
                          type="button"
                          className="btn btn-ghost"
                          onClick={() => setStatus(listing, "rejected")}
                        >
                          {copy.reject}
                        </button>
                        <button
                          type="button"
                          className="btn btn-ghost"
                          onClick={() => setDeleteTarget(listing)}
                        >
                          {copy.delete}
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

      {deleteTarget ? (
        <div className="modal-overlay" role="dialog" aria-modal="true">
          <div className="modal-card">
            <h3>{copy.deleteConfirmTitle}</h3>
            <p className="muted">{copy.deleteConfirmHint}</p>
            <div className="modal-actions">
              <button className="btn btn-ghost" type="button" onClick={() => setDeleteTarget(null)}>
                {copy.cancel}
              </button>
              <button className="btn btn-dark" type="button" onClick={confirmDelete}>
                {copy.confirm}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </AdminShell>
  );
}
