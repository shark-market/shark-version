import { useEffect, useMemo, useState } from "react";
import AdminShell from "../components/admin/AdminShell";
import {
  getListings,
  getTickets,
  listingsEvents,
  ticketsEvents,
  usersEvents,
  getUsers,
} from "../services";

const DASHBOARD_TEXT = {
  AR: {
    title: "لوحة تحكم SHARKMKT",
    subtitle: "نظرة عامة على المنصة والإجراءات التي تحتاج متابعة",
    weeklyActivity: "النشاط الأسبوعي",
    recentActivity: "أحدث النشاطات",
    activityType: "النوع",
    activityDetails: "التفاصيل",
    activityDate: "التاريخ",
    activityUser: "المستخدم",
    cardUsers: "إجمالي المستخدمين",
    cardListings: "إجمالي الإعلانات/الطلبات",
    cardNewUsers: "مستخدمون جدد (آخر 7 أيام)",
    cardNewListings: "إعلانات جديدة (آخر 7 أيام)",
    typeSignup: "تسجيل جديد",
    typeListing: "إعلان جديد",
    typeTicket: "تذكرة دعم",
  },
  EN: {
    title: "SHARKMKT Dashboard",
    subtitle: "Overview of core platform operations",
    weeklyActivity: "Weekly Activity",
    recentActivity: "Recent Activity",
    activityType: "Type",
    activityDetails: "Details",
    activityDate: "Date",
    activityUser: "User",
    cardUsers: "Total Users",
    cardListings: "Total Listings/Posts",
    cardNewUsers: "New Users (last 7 days)",
    cardNewListings: "New Listings (last 7 days)",
    typeSignup: "Signup",
    typeListing: "Listing",
    typeTicket: "Ticket",
  },
};

const toPolylinePoints = (values) => {
  const width = 640;
  const height = 220;
  const pad = 16;
  const max = Math.max(...values, 1);
  const stepX = (width - pad * 2) / (values.length - 1);
  return values
    .map((value, index) => {
      const x = pad + stepX * index;
      const y = height - pad - (value / max) * (height - pad * 2);
      return `${x},${y}`;
    })
    .join(" ");
};

const formatDate = (iso, locale) => {
  const date = new Date(iso || Date.now());
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString(locale, { year: "numeric", month: "2-digit", day: "2-digit" });
};

export default function AdminDashboard({ language = "AR" }) {
  const copy = DASHBOARD_TEXT[language] || DASHBOARD_TEXT.AR;
  const locale = language === "AR" ? "ar-SA" : "en-US";
  const [users, setUsers] = useState(() => getUsers());
  const [listings, setListings] = useState(() => getListings());
  const [tickets, setTickets] = useState(() => getTickets());

  useEffect(() => {
    const refresh = () => {
      setUsers(getUsers());
      setListings(getListings());
      setTickets(getTickets());
    };

    refresh();
    window.addEventListener(usersEvents.changed, refresh);
    window.addEventListener(listingsEvents.listingsChanged, refresh);
    window.addEventListener(ticketsEvents.changed, refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener(usersEvents.changed, refresh);
      window.removeEventListener(listingsEvents.listingsChanged, refresh);
      window.removeEventListener(ticketsEvents.changed, refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  const summaryCards = useMemo(() => {
    const sevenDaysAgo = Date.now() - 1000 * 60 * 60 * 24 * 7;
    const newUsers7 = users.filter((user) => {
      const ts = new Date(user.createdAt || 0).getTime();
      return Number.isFinite(ts) && ts >= sevenDaysAgo;
    }).length;
    const newListings7 = listings.filter((listing) => {
      const ts = new Date(listing.createdAt || 0).getTime();
      return Number.isFinite(ts) && ts >= sevenDaysAgo;
    }).length;

    return [
      { label: copy.cardUsers, value: users.length },
      { label: copy.cardListings, value: listings.length },
      { label: copy.cardNewUsers, value: newUsers7 },
      { label: copy.cardNewListings, value: newListings7 },
    ];
  }, [
    copy.cardListings,
    copy.cardNewListings,
    copy.cardNewUsers,
    copy.cardUsers,
    listings,
    users,
  ]);

  const weeklySeries = useMemo(() => {
    const days = Array.from({ length: 7 }).map((_, index) => {
      const date = new Date();
      date.setHours(0, 0, 0, 0);
      date.setDate(date.getDate() - (6 - index));
      return date;
    });
    const source = [...users, ...listings, ...tickets];
    return days.map((day) => {
      const start = day.getTime();
      const end = start + 1000 * 60 * 60 * 24;
      return source.filter((item) => {
        const ts = new Date(item.createdAt || 0).getTime();
        return Number.isFinite(ts) && ts >= start && ts < end;
      }).length;
    });
  }, [listings, tickets, users]);

  const recentActivityRows = useMemo(() => {
    const rows = [
      ...users.map((user) => ({
        id: `user-${user.id}`,
        type: copy.typeSignup,
        details: user.email,
        user: `${user.firstName || "-"} ${user.lastName || ""}`.trim(),
        createdAt: user.createdAt,
      })),
      ...listings.map((listing) => ({
        id: `listing-${listing.id}`,
        type: copy.typeListing,
        details: listing.title,
        user: listing.ownerUserId,
        createdAt: listing.createdAt,
      })),
      ...tickets.map((ticket) => ({
        id: `ticket-${ticket.id}`,
        type: copy.typeTicket,
        details: ticket.subject,
        user: ticket.userEmail,
        createdAt: ticket.createdAt,
      })),
    ];

    return rows
      .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
      .slice(0, 8);
  }, [copy.typeListing, copy.typeSignup, copy.typeTicket, listings, tickets, users]);

  return (
    <AdminShell language={language} title={copy.title} subtitle={copy.subtitle}>
      <div className="admin-summary-grid">
        {summaryCards.map((card) => (
          <article className="admin-summary-card" key={card.label}>
            <span>{card.label}</span>
            <strong>{Number(card.value).toLocaleString(locale)}</strong>
          </article>
        ))}
      </div>

      <div className="admin-panel-grid">
        <article className="admin-panel-card">
          <header>
            <h2>{copy.weeklyActivity}</h2>
          </header>
          <div className="admin-chart-wrap">
            <svg viewBox="0 0 640 220" role="img" aria-label={copy.weeklyActivity}>
              <defs>
                <linearGradient id="activityLine" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#111111" />
                  <stop offset="100%" stopColor="#0B0B0B" />
                </linearGradient>
              </defs>
              <polyline
                points={toPolylinePoints(weeklySeries)}
                fill="none"
                stroke="url(#activityLine)"
                strokeWidth="4"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </article>

        <article className="admin-panel-card">
          <header>
            <h2>{copy.recentActivity}</h2>
          </header>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>{copy.activityType}</th>
                  <th>{copy.activityDetails}</th>
                  <th>{copy.activityUser}</th>
                  <th>{copy.activityDate}</th>
                </tr>
              </thead>
              <tbody>
                {recentActivityRows.map((row) => (
                  <tr key={row.id}>
                    <td>{row.type}</td>
                    <td>{row.details}</td>
                    <td>{row.user}</td>
                    <td>{formatDate(row.createdAt, locale)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>
      </div>
    </AdminShell>
  );
}
