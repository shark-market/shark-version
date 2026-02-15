import { useEffect, useMemo, useState } from "react";
import AdminShell from "../components/admin/AdminShell";
import { getTickets, replyToTicket, ticketsEvents, updateTicketStatus } from "../services/ticketsService";

const TEXT = {
  AR: {
    title: "مركز الدعم - الإدارة",
    subtitle: "مراجعة التذاكر والرد عليها من لوحة الأدمن",
    submittedAt: "تاريخ الإرسال",
    subject: "الموضوع",
    userEmail: "البريد",
    status: "الحالة",
    attachments: "المرفقات",
    action: "إجراء",
    view: "عرض",
    close: "إغلاق",
    noRows: "لا توجد تذاكر.",
    open: "مفتوحة",
    pending: "قيد المعالجة",
    closed: "مغلقة",
    details: "تفاصيل التذكرة",
    message: "رسالة المستخدم",
    reply: "رد الإدارة",
    saveReply: "حفظ الرد",
    statusField: "تحديث الحالة",
  },
  EN: {
    title: "Help Center - Admin",
    subtitle: "Review tickets and respond from admin dashboard",
    submittedAt: "Submitted",
    subject: "Subject",
    userEmail: "Email",
    status: "Status",
    attachments: "Attachments",
    action: "Action",
    view: "View",
    close: "Close",
    noRows: "No tickets.",
    open: "Open",
    pending: "Pending",
    closed: "Closed",
    details: "Ticket details",
    message: "User message",
    reply: "Admin reply",
    saveReply: "Save reply",
    statusField: "Update status",
  },
};

const formatDate = (iso, locale) => {
  const date = new Date(iso || Date.now());
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString(locale, { year: "numeric", month: "2-digit", day: "2-digit" });
};

export default function AdminHelpCenter({ language = "AR" }) {
  const copy = TEXT[language] || TEXT.AR;
  const locale = language === "AR" ? "ar-SA" : "en-US";
  const [tickets, setTickets] = useState(() => getTickets());
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [nextStatus, setNextStatus] = useState("pending");

  useEffect(() => {
    const refresh = () => setTickets(getTickets());
    refresh();
    window.addEventListener(ticketsEvents.changed, refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener(ticketsEvents.changed, refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  useEffect(() => {
    if (!selectedTicket) return;
    setReplyText(selectedTicket.adminReply?.text || "");
    setNextStatus(selectedTicket.status || "pending");
  }, [selectedTicket]);

  const sortedTickets = useMemo(
    () =>
      [...tickets].sort(
        (a, b) =>
          new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
      ),
    [tickets]
  );

  const statusLabel = (status) => {
    if (status === "open") return copy.open;
    if (status === "pending") return copy.pending;
    if (status === "closed") return copy.closed;
    return status;
  };

  const handleSaveReply = () => {
    if (!selectedTicket) return;
    if (replyText.trim()) {
      replyToTicket(selectedTicket.id, replyText.trim(), nextStatus);
    } else {
      updateTicketStatus(selectedTicket.id, nextStatus);
    }
    const refreshed = getTickets().find((ticket) => String(ticket.id) === String(selectedTicket.id));
    setSelectedTicket(refreshed || null);
  };

  return (
    <AdminShell language={language} title={copy.title} subtitle={copy.subtitle}>
      <article className="admin-panel-card">
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>{copy.submittedAt}</th>
                <th>{copy.subject}</th>
                <th>{copy.userEmail}</th>
                <th>{copy.status}</th>
                <th>{copy.attachments}</th>
                <th>{copy.action}</th>
              </tr>
            </thead>
            <tbody>
              {sortedTickets.length === 0 ? (
                <tr>
                  <td colSpan={6} className="admin-empty-row">
                    {copy.noRows}
                  </td>
                </tr>
              ) : (
                sortedTickets.map((ticket) => (
                  <tr key={ticket.id}>
                    <td>{formatDate(ticket.createdAt, locale)}</td>
                    <td>{ticket.subject}</td>
                    <td>{ticket.userEmail}</td>
                    <td>
                      <span className={`admin-status-pill${ticket.status === "open" ? " active" : " pending"}`}>
                        {statusLabel(ticket.status)}
                      </span>
                    </td>
                    <td>{ticket.attachments?.length || 0}</td>
                    <td>
                      <button
                        type="button"
                        className="btn btn-ghost"
                        onClick={() => setSelectedTicket(ticket)}
                      >
                        {copy.view}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </article>

      <div
        className={`admin-drawer-backdrop${selectedTicket ? " open" : ""}`}
        role="button"
        tabIndex={selectedTicket ? 0 : -1}
        onClick={() => setSelectedTicket(null)}
        onKeyDown={(event) => {
          if (event.key === "Escape" || event.key === "Enter") setSelectedTicket(null);
        }}
      />

      <aside className={`admin-drawer${selectedTicket ? " open" : ""}`} aria-hidden={!selectedTicket}>
        {selectedTicket ? (
          <>
            <div className="admin-drawer-head">
              <h3>{copy.details}</h3>
              <button type="button" className="btn btn-ghost" onClick={() => setSelectedTicket(null)}>
                {copy.close}
              </button>
            </div>

            <div className="admin-detail-grid">
              <p>
                <strong>{copy.subject}:</strong> {selectedTicket.subject}
              </p>
              <p>
                <strong>{copy.userEmail}:</strong> {selectedTicket.userEmail}
              </p>
              <p>
                <strong>{copy.message}:</strong> {selectedTicket.message}
              </p>
              <p>
                <strong>{copy.attachments}:</strong> {selectedTicket.attachments?.length || 0}
              </p>
            </div>

            <div className="field-group">
              <span>{copy.statusField}</span>
              <select value={nextStatus} onChange={(event) => setNextStatus(event.target.value)}>
                <option value="open">{copy.open}</option>
                <option value="pending">{copy.pending}</option>
                <option value="closed">{copy.closed}</option>
              </select>
            </div>

            <div className="field-group">
              <span>{copy.reply}</span>
              <textarea
                rows={5}
                value={replyText}
                onChange={(event) => setReplyText(event.target.value)}
              />
            </div>

            <button type="button" className="btn btn-dark" onClick={handleSaveReply}>
              {copy.saveReply}
            </button>
          </>
        ) : null}
      </aside>
    </AdminShell>
  );
}
