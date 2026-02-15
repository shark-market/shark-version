import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import AdminShell from "../components/admin/AdminShell";
import {
  getServiceSubmissions,
  listingsEvents,
  updateServiceStatus,
} from "../services/listingsService";
import { getUsers, usersEvents } from "../services/usersService";

const TEXT = {
  AR: {
    title: "مراجعة الخدمات",
    subtitle: "إدارة طلبات الخدمات بين قيد المراجعة، المعتمدة، أو المرفوضة",
    all: "الكل",
    pending: "قيد المراجعة",
    approved: "معتمد",
    rejected: "مرفوض",
    owner: "صاحب الطلب",
    category: "التصنيف",
    status: "الحالة",
    createdAt: "التاريخ",
    action: "إجراء",
    approve: "اعتماد",
    reject: "رفض",
    setPending: "إرجاع للمراجعة",
    noRows: "لا توجد طلبات خدمات.",
  },
  EN: {
    title: "Services Review",
    subtitle: "Manage pending, approved, and rejected service submissions",
    all: "All",
    pending: "Pending",
    approved: "Approved",
    rejected: "Rejected",
    owner: "Owner",
    category: "Category",
    status: "Status",
    createdAt: "Date",
    action: "Action",
    approve: "Approve",
    reject: "Reject",
    setPending: "Set pending",
    noRows: "No service submissions.",
  },
};

const formatDate = (iso, locale) => {
  const date = new Date(iso || Date.now());
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString(locale, { year: "numeric", month: "2-digit", day: "2-digit" });
};

export default function AdminServices({ language = "AR" }) {
  const copy = TEXT[language] || TEXT.AR;
  const locale = language === "AR" ? "ar-SA" : "en-US";
  const [searchParams, setSearchParams] = useSearchParams();
  const [submissions, setSubmissions] = useState(() => getServiceSubmissions());
  const [users, setUsers] = useState(() => getUsers());
  const activeStatus = searchParams.get("status") || "all";

  useEffect(() => {
    const refresh = () => {
      setSubmissions(getServiceSubmissions());
      setUsers(getUsers());
    };
    refresh();
    window.addEventListener(listingsEvents.servicesChanged, refresh);
    window.addEventListener(usersEvents.changed, refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener(listingsEvents.servicesChanged, refresh);
      window.removeEventListener(usersEvents.changed, refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  const userMap = useMemo(
    () => Object.fromEntries(users.map((user) => [String(user.id), user])),
    [users]
  );

  const filteredSubmissions = useMemo(() => {
    if (activeStatus === "all") return submissions;
    return submissions.filter((item) => item.status === activeStatus);
  }, [activeStatus, submissions]);

  const setStatusFilter = (status) => {
    if (status === "all") {
      setSearchParams({});
      return;
    }
    setSearchParams({ status });
  };

  const statusLabel = (status) => {
    if (status === "pending") return copy.pending;
    if (status === "approved") return copy.approved;
    if (status === "rejected") return copy.rejected;
    return status;
  };

  return (
    <AdminShell language={language} title={copy.title} subtitle={copy.subtitle}>
      <article className="admin-panel-card">
        <div className="admin-filter-row">
          <button
            type="button"
            className={`admin-filter-chip${activeStatus === "all" ? " active" : ""}`}
            onClick={() => setStatusFilter("all")}
          >
            {copy.all}
          </button>
          <button
            type="button"
            className={`admin-filter-chip${activeStatus === "pending" ? " active" : ""}`}
            onClick={() => setStatusFilter("pending")}
          >
            {copy.pending}
          </button>
          <button
            type="button"
            className={`admin-filter-chip${activeStatus === "approved" ? " active" : ""}`}
            onClick={() => setStatusFilter("approved")}
          >
            {copy.approved}
          </button>
          <button
            type="button"
            className={`admin-filter-chip${activeStatus === "rejected" ? " active" : ""}`}
            onClick={() => setStatusFilter("rejected")}
          >
            {copy.rejected}
          </button>
        </div>

        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>{copy.owner}</th>
                <th>{copy.category}</th>
                <th>{copy.status}</th>
                <th>{copy.createdAt}</th>
                <th>{copy.action}</th>
              </tr>
            </thead>
            <tbody>
              {filteredSubmissions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="admin-empty-row">
                    {copy.noRows}
                  </td>
                </tr>
              ) : (
                filteredSubmissions.map((item) => {
                  const owner = userMap[String(item.ownerUserId)];
                  return (
                    <tr key={item.id}>
                      <td>{owner?.email || item.ownerUserId}</td>
                      <td>{item.category}</td>
                      <td>
                        <span className={`admin-status-pill${item.status === "approved" ? " active" : " pending"}`}>
                          {statusLabel(item.status)}
                        </span>
                      </td>
                      <td>{formatDate(item.createdAt, locale)}</td>
                      <td className="admin-table-actions">
                        <button type="button" className="btn btn-dark" onClick={() => updateServiceStatus(item.id, "approved")}>
                          {copy.approve}
                        </button>
                        <button type="button" className="btn btn-ghost" onClick={() => updateServiceStatus(item.id, "rejected")}>
                          {copy.reject}
                        </button>
                        <button type="button" className="btn btn-ghost" onClick={() => updateServiceStatus(item.id, "pending")}>
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
