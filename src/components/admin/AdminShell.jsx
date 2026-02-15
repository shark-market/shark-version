import { Link, NavLink, useNavigate } from "react-router-dom";
import brandLogo from "../../assets/brand/sharkmkt-logo.svg";

const SHELL_TEXT = {
  AR: {
    navDashboard: "لوحة التحكم",
    navUsers: "المستخدمين",
    navListings: "الإعلانات",
    navConversations: "المحادثات",
    navHelpCenter: "مركز الدعم",
    navServices: "مراجعة الخدمات",
    navPayments: "المدفوعات",
    sidePendingServices: "الخدمات قيد المراجعة",
    sideApprovedServices: "الخدمات المعتمدة",
    sideUsers: "كل المستخدمين",
    sideListings: "الإعلانات",
    sideConversations: "المحادثات",
    sideHelpCenter: "مركز الدعم",
    sidePayments: "طلبات الدفع",
  },
  EN: {
    navDashboard: "Dashboard",
    navUsers: "Users",
    navListings: "Listings",
    navConversations: "Conversations",
    navHelpCenter: "Help Center",
    navServices: "Services",
    navPayments: "Payments",
    sidePendingServices: "Pending Services",
    sideApprovedServices: "Approved Services",
    sideUsers: "All Users",
    sideListings: "Listings",
    sideConversations: "Conversations",
    sideHelpCenter: "Help Center",
    sidePayments: "Payment Requests",
  },
};

export default function AdminShell({ language = "AR", title, subtitle, children }) {
  const navigate = useNavigate();
  const copy = SHELL_TEXT[language] || SHELL_TEXT.AR;

  return (
    <section className="page admin-page-shell">
      <div className="container admin-shell">
        <header className="admin-topbar">
          <div
            className="admin-brand"
            role="button"
            tabIndex={0}
            onClick={() => navigate("/")}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                navigate("/");
              }
            }}
          >
            <img src={brandLogo} alt="SHARKMKT" />
          </div>

          <nav className="admin-topnav" aria-label="Admin navigation">
            <NavLink
              to="/admin/dashboard"
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              {copy.navDashboard}
            </NavLink>
            <NavLink
              to="/admin/users"
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              {copy.navUsers}
            </NavLink>
            <NavLink
              to="/admin/listings"
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              {copy.navListings}
            </NavLink>
            <NavLink
              to="/admin/conversations"
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              {copy.navConversations}
            </NavLink>
            <NavLink
              to="/admin/help-center"
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              {copy.navHelpCenter}
            </NavLink>
            <NavLink
              to="/admin/services"
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              {copy.navServices}
            </NavLink>
            <NavLink
              to="/admin/payments"
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              {copy.navPayments}
            </NavLink>
          </nav>
        </header>

        <div className="admin-body">
          <main className="admin-main">
            <div className="admin-page-head">
              <h1>{title}</h1>
              {subtitle ? <p>{subtitle}</p> : null}
            </div>
            {children}
          </main>

          <aside className="admin-sidebar">
            <div className="admin-side-menu">
              <Link to="/admin/services?status=pending">{copy.sidePendingServices}</Link>
              <Link to="/admin/services?status=approved">{copy.sideApprovedServices}</Link>
              <NavLink
                to="/admin/users"
                className={({ isActive }) => (isActive ? "active" : "")}
              >
                {copy.sideUsers}
              </NavLink>
              <NavLink
                to="/admin/listings"
                className={({ isActive }) => (isActive ? "active" : "")}
              >
                {copy.sideListings}
              </NavLink>
              <NavLink
                to="/admin/conversations"
                className={({ isActive }) => (isActive ? "active" : "")}
              >
                {copy.sideConversations}
              </NavLink>
              <NavLink
                to="/admin/help-center"
                className={({ isActive }) => (isActive ? "active" : "")}
              >
                {copy.sideHelpCenter}
              </NavLink>
              <NavLink
                to="/admin/payments"
                className={({ isActive }) => (isActive ? "active" : "")}
              >
                {copy.sidePayments}
              </NavLink>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
