import { useEffect, useMemo, useState } from "react";
import AdminShell from "../components/admin/AdminShell";
import { conversationsEvents, getConversations } from "../services/conversationsService";
import { getUsers, usersEvents } from "../services/usersService";

const PAGE_TEXT = {
  AR: {
    title: "إدارة المحادثات",
    subtitle: "عرض المحادثات بين المستخدمين (وضع قراءة فقط)",
    searchPlaceholder: "بحث بالاسم أو البريد",
    userA: "المستخدم A",
    userB: "المستخدم B",
    lastMessage: "آخر رسالة",
    date: "التاريخ",
    action: "إجراء",
    view: "عرض",
    close: "إغلاق",
    noRows: "لا توجد محادثات مطابقة.",
    warning: "عرض فقط: لا يمكن للأدمن إرسال رسالة باسم المستخدم.",
  },
  EN: {
    title: "Conversations Management",
    subtitle: "View user conversations (read-only mode)",
    searchPlaceholder: "Search by name or email",
    userA: "User A",
    userB: "User B",
    lastMessage: "Last message",
    date: "Date",
    action: "Action",
    view: "View",
    close: "Close",
    noRows: "No matching conversations.",
    warning: "Read-only: admin cannot send as a user.",
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

export default function AdminConversations({ language = "AR" }) {
  const copy = PAGE_TEXT[language] || PAGE_TEXT.AR;
  const locale = language === "AR" ? "ar-SA" : "en-US";
  const [conversations, setConversations] = useState(() => getConversations());
  const [users, setUsers] = useState(() => getUsers());
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    const refresh = () => {
      setConversations(getConversations());
      setUsers(getUsers());
    };
    refresh();
    window.addEventListener(conversationsEvents.changed, refresh);
    window.addEventListener(usersEvents.changed, refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener(conversationsEvents.changed, refresh);
      window.removeEventListener(usersEvents.changed, refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  const usersMap = useMemo(
    () => Object.fromEntries(users.map((user) => [String(user.id), user])),
    [users]
  );

  const rows = useMemo(() => {
    return conversations
      .map((conversation) => {
        const [aId, bId] = conversation.participants || [];
        const userA = usersMap[String(aId)];
        const userB = usersMap[String(bId)];
        const messages = Array.isArray(conversation.messages) ? conversation.messages : [];
        const lastMessage = messages[messages.length - 1];
        return {
          ...conversation,
          userAName: `${userA?.firstName || "-"} ${userA?.lastName || ""}`.trim(),
          userBName: `${userB?.firstName || "-"} ${userB?.lastName || ""}`.trim(),
          userAEmail: userA?.email || aId || "-",
          userBEmail: userB?.email || bId || "-",
          lastMessageText: lastMessage?.text || "-",
          lastMessageAt: conversation.lastMessageAt || lastMessage?.createdAt || conversation.createdAt,
          normalizedQuery: [
            userA?.firstName,
            userA?.lastName,
            userA?.email,
            userB?.firstName,
            userB?.lastName,
            userB?.email,
            lastMessage?.text,
          ]
            .join(" ")
            .toLowerCase(),
        };
      })
      .sort(
        (a, b) =>
          new Date(b.lastMessageAt || 0).getTime() - new Date(a.lastMessageAt || 0).getTime()
      );
  }, [conversations, usersMap]);

  const filteredRows = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((row) => row.normalizedQuery.includes(q));
  }, [query, rows]);

  return (
    <AdminShell language={language} title={copy.title} subtitle={copy.subtitle}>
      <article className="admin-panel-card">
        <div className="admin-filter-row">
          <input
            type="search"
            className="admin-search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={copy.searchPlaceholder}
          />
        </div>

        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>{copy.userA}</th>
                <th>{copy.userB}</th>
                <th>{copy.lastMessage}</th>
                <th>{copy.date}</th>
                <th>{copy.action}</th>
              </tr>
            </thead>
            <tbody>
              {filteredRows.length === 0 ? (
                <tr>
                  <td colSpan={5} className="admin-empty-row">
                    {copy.noRows}
                  </td>
                </tr>
              ) : (
                filteredRows.map((row) => (
                  <tr key={row.id}>
                    <td>
                      <strong>{row.userAName}</strong>
                      <div className="admin-table-sub">{row.userAEmail}</div>
                    </td>
                    <td>
                      <strong>{row.userBName}</strong>
                      <div className="admin-table-sub">{row.userBEmail}</div>
                    </td>
                    <td>{row.lastMessageText}</td>
                    <td>{formatDate(row.lastMessageAt, locale)}</td>
                    <td>
                      <button type="button" className="btn btn-dark" onClick={() => setSelected(row)}>
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
        className={`admin-drawer-backdrop${selected ? " open" : ""}`}
        role="button"
        tabIndex={selected ? 0 : -1}
        onClick={() => setSelected(null)}
        onKeyDown={(event) => {
          if (event.key === "Escape" || event.key === "Enter") setSelected(null);
        }}
      />

      <aside className={`admin-drawer${selected ? " open" : ""}`} aria-hidden={!selected}>
        {selected ? (
          <>
            <div className="admin-drawer-head">
              <h3>
                {selected.userAName} × {selected.userBName}
              </h3>
              <button type="button" className="btn btn-ghost" onClick={() => setSelected(null)}>
                {copy.close}
              </button>
            </div>

            <div className="admin-drawer-messages">
              {(selected.messages || []).map((message) => (
                <div
                  key={message.id}
                  className={`admin-message-bubble${
                    message.senderId === selected.participants?.[1] ? " me" : ""
                  }`}
                >
                  {message.text}
                </div>
              ))}
            </div>

            <div className="admin-warning-note">{copy.warning}</div>
          </>
        ) : null}
      </aside>
    </AdminShell>
  );
}
