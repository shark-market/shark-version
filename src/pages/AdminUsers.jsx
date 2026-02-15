import { useEffect, useMemo, useState } from "react";
import AdminShell from "../components/admin/AdminShell";
import { getUsers, usersEvents } from "../services/usersService";

const TEXT = {
  AR: {
    title: "إدارة المستخدمين",
    subtitle: "بحث وفحص ملفات المستخدمين المسجلين في المنصة",
    search: "بحث بالاسم أو البريد أو الجوال",
    allRoles: "كل الأدوار",
    allCountries: "كل الدول",
    roleUser: "مستخدم",
    roleAdmin: "مشرف",
    name: "الاسم",
    email: "البريد",
    role: "الدور",
    country: "الدولة",
    city: "المدينة",
    createdAt: "تاريخ التسجيل",
    onboarding: "اكتمال الإعداد",
    action: "إجراء",
    view: "عرض",
    close: "إغلاق",
    noRows: "لا توجد نتائج مطابقة.",
    details: "تفاصيل المستخدم",
    phone: "الجوال",
    accountType: "نوع الحساب",
    interests: "الاهتمامات",
    budget: "الميزانية",
  },
  EN: {
    title: "Users Management",
    subtitle: "Search and inspect registered users",
    search: "Search by name, email, or phone",
    allRoles: "All roles",
    allCountries: "All countries",
    roleUser: "User",
    roleAdmin: "Admin",
    name: "Name",
    email: "Email",
    role: "Role",
    country: "Country",
    city: "City",
    createdAt: "Created",
    onboarding: "Onboarding",
    action: "Action",
    view: "View",
    close: "Close",
    noRows: "No matching users.",
    details: "User Details",
    phone: "Phone",
    accountType: "Account type",
    interests: "Interests",
    budget: "Budget",
  },
};

const formatDate = (iso, locale) => {
  const date = new Date(iso || Date.now());
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString(locale, { year: "numeric", month: "2-digit", day: "2-digit" });
};

export default function AdminUsers({ language = "AR" }) {
  const copy = TEXT[language] || TEXT.AR;
  const locale = language === "AR" ? "ar-SA" : "en-US";
  const [users, setUsers] = useState(() => getUsers());
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [countryFilter, setCountryFilter] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    const refresh = () => setUsers(getUsers());
    refresh();
    window.addEventListener(usersEvents.changed, refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener(usersEvents.changed, refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  const countryOptions = useMemo(() => {
    const values = new Set(users.map((user) => user.country).filter(Boolean));
    return Array.from(values).sort((a, b) => a.localeCompare(b));
  }, [users]);

  const filteredUsers = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return users.filter((user) => {
      const byRole = roleFilter ? user.role === roleFilter : true;
      const byCountry = countryFilter ? user.country === countryFilter : true;
      const searchable = [
        user.firstName,
        user.lastName,
        user.email,
        `${user.phoneCode || ""}${user.phoneNumber || ""}`,
      ]
        .join(" ")
        .toLowerCase();
      const byQuery = normalizedQuery ? searchable.includes(normalizedQuery) : true;
      return byRole && byCountry && byQuery;
    });
  }, [countryFilter, query, roleFilter, users]);

  return (
    <AdminShell language={language} title={copy.title} subtitle={copy.subtitle}>
      <article className="admin-panel-card">
        <div className="admin-filter-row">
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="admin-search"
            placeholder={copy.search}
          />
          <select value={roleFilter} onChange={(event) => setRoleFilter(event.target.value)}>
            <option value="">{copy.allRoles}</option>
            <option value="user">{copy.roleUser}</option>
            <option value="admin">{copy.roleAdmin}</option>
          </select>
          <select value={countryFilter} onChange={(event) => setCountryFilter(event.target.value)}>
            <option value="">{copy.allCountries}</option>
            {countryOptions.map((country) => (
              <option key={country} value={country}>
                {country}
              </option>
            ))}
          </select>
        </div>

        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>{copy.name}</th>
                <th>{copy.email}</th>
                <th>{copy.role}</th>
                <th>{copy.country}</th>
                <th>{copy.city}</th>
                <th>{copy.createdAt}</th>
                <th>{copy.onboarding}</th>
                <th>{copy.action}</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="admin-empty-row">
                    {copy.noRows}
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id}>
                    <td>{`${user.firstName || "-"} ${user.lastName || ""}`.trim()}</td>
                    <td>{user.email}</td>
                    <td>
                      <span className={`admin-status-pill${user.role === "admin" ? " active" : ""}`}>
                        {user.role === "admin" ? copy.roleAdmin : copy.roleUser}
                      </span>
                    </td>
                    <td>{user.country || "-"}</td>
                    <td>{user.city || "-"}</td>
                    <td>{formatDate(user.createdAt, locale)}</td>
                    <td>
                      <span className={`admin-status-pill${user.onboardingCompleted ? " active" : " pending"}`}>
                        {user.onboardingCompleted
                          ? language === "AR"
                            ? "مكتمل"
                            : "Completed"
                          : language === "AR"
                            ? "غير مكتمل"
                            : "Incomplete"}
                      </span>
                    </td>
                    <td>
                      <button type="button" className="btn btn-ghost" onClick={() => setSelectedUser(user)}>
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
        className={`admin-drawer-backdrop${selectedUser ? " open" : ""}`}
        role="button"
        tabIndex={selectedUser ? 0 : -1}
        onClick={() => setSelectedUser(null)}
        onKeyDown={(event) => {
          if (event.key === "Escape" || event.key === "Enter") setSelectedUser(null);
        }}
      />

      <aside className={`admin-drawer${selectedUser ? " open" : ""}`} aria-hidden={!selectedUser}>
        {selectedUser ? (
          <>
            <div className="admin-drawer-head">
              <h3>{copy.details}</h3>
              <button type="button" className="btn btn-ghost" onClick={() => setSelectedUser(null)}>
                {copy.close}
              </button>
            </div>
            <div className="admin-detail-grid">
              <p>
                <strong>{copy.name}:</strong> {`${selectedUser.firstName || "-"} ${selectedUser.lastName || ""}`.trim()}
              </p>
              <p>
                <strong>{copy.email}:</strong> {selectedUser.email}
              </p>
              <p>
                <strong>{copy.phone}:</strong> {`${selectedUser.phoneCode || ""} ${selectedUser.phoneNumber || "-"}`}
              </p>
              <p>
                <strong>{copy.country}:</strong> {selectedUser.country || "-"}
              </p>
              <p>
                <strong>{copy.city}:</strong> {selectedUser.city || "-"}
              </p>
              <p>
                <strong>{copy.accountType}:</strong> {selectedUser.accountType || "-"}
              </p>
              <p>
                <strong>{copy.interests}:</strong> {selectedUser.interests?.join(", ") || "-"}
              </p>
              <p>
                <strong>{copy.budget}:</strong>{" "}
                {selectedUser.budgetMin || selectedUser.budgetMax
                  ? `${selectedUser.budgetMin || "0"} - ${selectedUser.budgetMax || "∞"}`
                  : "-"}
              </p>
            </div>
          </>
        ) : null}
      </aside>
    </AdminShell>
  );
}
