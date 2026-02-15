import { useEffect, useRef, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import brandLogo from "../assets/brand/sharkmkt-logo.svg";
import { useCurrency } from "../context/CurrencyContext";
import { getUI } from "../data/uiDictionary";

const PRIMARY_LINKS = [
  {
    to: "/",
    label: {
      EN: "Home",
      AR: "الرئيسية",
    },
  },
  {
    to: "/partner",
    label: {
      EN: "Find a Partner",
      AR: "ابحث عن شريك",
    },
  },
  {
    to: "/browse",
    label: {
      EN: "Browse Projects",
      AR: "تصفح المشاريع",
    },
  },
  {
    to: "/fees",
    label: {
      EN: "Platform fee: 2.5% on successful sale",
      AR: "عمولة المنصة: ٢.٥٪ عند إتمام البيع",
    },
    className: "nav-fees-link",
  },
];

export default function Navbar({
  language = "EN",
  onLanguageChange,
  user,
  profile,
  onLogout,
}) {
  const ui = getUI(language);
  const text = ui.nav;
  const navigate = useNavigate();
  const location = useLocation();
  const { currency, currencies, setCurrency } = useCurrency();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [openMenu, setOpenMenu] = useState(null);

  const menuRootRef = useRef(null);
  const currencyOptions = ["SAR", "USD"].filter((code) => currencies?.[code]);

  useEffect(() => {
    const refreshUnread = () => {
      if (typeof window === "undefined") return;
      const hasAnyUnread =
        window.localStorage.getItem("sm-messages-unread") === "1" ||
        window.localStorage.getItem("sm-inbox-unread") === "1";
      setHasUnread(hasAnyUnread);
    };

    refreshUnread();
    window.addEventListener("storage", refreshUnread);
    window.addEventListener("sm-marketplace-conversations-update", refreshUnread);

    return () => {
      window.removeEventListener("storage", refreshUnread);
      window.removeEventListener("sm-marketplace-conversations-update", refreshUnread);
    };
  }, []);

  useEffect(() => {
    const onScroll = () => {
      setIsScrolled((window.scrollY || 0) > 10);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const handleOutside = (event) => {
      if (!menuRootRef.current?.contains(event.target)) {
        setOpenMenu(null);
      }
    };

    const handleEsc = (event) => {
      if (event.key === "Escape") {
        setOpenMenu(null);
        setMobileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutside);
    document.addEventListener("keydown", handleEsc);

    return () => {
      document.removeEventListener("mousedown", handleOutside);
      document.removeEventListener("keydown", handleEsc);
    };
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setOpenMenu(null);
  }, [location.pathname]);

  const avatarLabel = profile?.first_name?.[0] || user?.email?.[0] || "S";
  const avatarUrl = profile?.avatar_url;
  const navbarScrolled = isScrolled || location.pathname !== "/";

  const closeDrawerAndNavigate = (path) => {
    setMobileOpen(false);
    navigate(path);
  };

  const cycleLanguage = () => {
    onLanguageChange?.(language === "AR" ? "EN" : "AR");
  };

  const cycleCurrency = () => {
    const next = currency === "SAR" ? "USD" : "SAR";
    setCurrency(next);
  };

  const openAuth = (mode = "login") => {
    navigate("/auth", { state: { mode } });
  };

  const profileButtonAction = () => {
    if (!user) {
      openAuth("login");
      return;
    }
    setOpenMenu((prev) => (prev === "profile" ? null : "profile"));
  };

  const notificationsAction = () => {
    if (!user) {
      openAuth("login");
      return;
    }
    navigate("/messages");
  };

  return (
    <nav className={`navbar${navbarScrolled ? " scrolled" : ""}`}>
      <div className="navbar-center">
        <div className="nav-links nav-links-main">
          {PRIMARY_LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                [isActive ? "active" : "", link.className || ""].filter(Boolean).join(" ")
              }
            >
              {link.label?.[language] || link.label?.EN}
            </NavLink>
          ))}
        </div>
      </div>

      <div className="navbar-tools" ref={menuRootRef}>
        <div className="utility-dropdown">
          <button
            type="button"
            className="utility-pill"
            aria-expanded={openMenu === "language"}
            onClick={() => setOpenMenu((prev) => (prev === "language" ? null : "language"))}
          >
            <span className="utility-icon" aria-hidden="true">
              ◎
            </span>
            <span>{language}</span>
            <span className="utility-caret" aria-hidden="true">
              ▾
            </span>
          </button>

          {openMenu === "language" ? (
            <div className="utility-dropdown-panel" role="menu" aria-label={text.language}>
              <button
                type="button"
                className={language === "EN" ? "active" : ""}
                onClick={() => {
                  onLanguageChange?.("EN");
                  setOpenMenu(null);
                }}
              >
                EN
              </button>
              <button
                type="button"
                className={language === "AR" ? "active" : ""}
                onClick={() => {
                  onLanguageChange?.("AR");
                  setOpenMenu(null);
                }}
              >
                AR
              </button>
            </div>
          ) : null}
        </div>

        <div className="utility-dropdown">
          <button
            type="button"
            className="utility-pill"
            aria-expanded={openMenu === "currency"}
            onClick={() => setOpenMenu((prev) => (prev === "currency" ? null : "currency"))}
          >
            <span className="utility-icon" aria-hidden="true">
              ¤
            </span>
            <span>{currency}</span>
            <span className="utility-caret" aria-hidden="true">
              ▾
            </span>
          </button>

          {openMenu === "currency" ? (
            <div className="utility-dropdown-panel" role="menu" aria-label={text.currency}>
              {currencyOptions.map((code) => (
                <button
                  key={code}
                  type="button"
                  className={currency === code ? "active" : ""}
                  onClick={() => {
                    setCurrency(code);
                    setOpenMenu(null);
                  }}
                >
                  {currencies?.[code]?.flag} {code}
                </button>
              ))}
            </div>
          ) : null}
        </div>

        <button
          className="utility-icon-btn"
          type="button"
          aria-label={text.messages}
          onClick={notificationsAction}
        >
          <span aria-hidden="true">✉</span>
          {hasUnread && user ? <span className="inbox-dot" /> : null}
        </button>

        <div className="utility-dropdown">
          <button
            className="avatar-button"
            type="button"
            aria-label={text.account}
            aria-expanded={openMenu === "profile"}
            onClick={profileButtonAction}
          >
            {avatarUrl ? <img src={avatarUrl} alt="avatar" /> : <span>{avatarLabel.toUpperCase()}</span>}
          </button>

          {openMenu === "profile" ? (
            <div className="utility-dropdown-panel profile-dropdown" role="menu" aria-label={text.account}>
              {user ? (
                <>
                  <button type="button" onClick={() => navigate("/account")}>
                    {text.account}
                  </button>
                  <button type="button" onClick={() => navigate("/messages")}>
                    {text.messages}
                  </button>
                  <button type="button" onClick={() => navigate("/pricing")}>
                    {text.pricing}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setOpenMenu(null);
                      onLogout?.();
                      navigate("/auth", { state: { mode: "login" }, replace: true });
                    }}
                  >
                    {text.logout}
                  </button>
                </>
              ) : (
                <>
                  <button type="button" onClick={() => openAuth("login")}>
                    {text.login}
                  </button>
                  <button type="button" onClick={() => openAuth("signup")}>
                    {text.signup}
                  </button>
                </>
              )}
            </div>
          ) : null}
        </div>
      </div>

      <div className="navbar-brand">
        <button
          type="button"
          className="logo logo-button"
          aria-label={ui.brand}
          onClick={() => navigate("/")}
        >
          <img className="logo-img" src={brandLogo} alt={ui.brand} />
        </button>
      </div>

      <div className="nav-mobile-controls">
        <button className="mobile-utility" type="button" onClick={cycleLanguage}>
          {language}
        </button>
        <button className="mobile-utility" type="button" onClick={cycleCurrency}>
          {currency}
        </button>
      </div>

      <button
        className="nav-toggle"
        type="button"
        aria-label={text.menu}
        aria-expanded={mobileOpen}
        onClick={() => setMobileOpen((prev) => !prev)}
      >
        <span className="nav-toggle-bar" />
        <span className="nav-toggle-bar" />
        <span className="nav-toggle-bar" />
      </button>

      {mobileOpen ? (
        <button
          className="nav-drawer-backdrop"
          type="button"
          aria-label={text.close}
          onClick={() => setMobileOpen(false)}
        />
      ) : null}

      <aside className={`nav-drawer ${mobileOpen ? "open" : ""}`}>
        <div className="nav-drawer-header">
          <strong>{text.menu}</strong>
          <button
            className="nav-drawer-close"
            type="button"
            aria-label={text.close}
            onClick={() => setMobileOpen(false)}
          >
            X
          </button>
        </div>

        <div className="nav-drawer-links">
          {PRIMARY_LINKS.map((link) => (
            <button key={link.to} type="button" onClick={() => closeDrawerAndNavigate(link.to)}>
              {link.label?.[language] || link.label?.EN}
            </button>
          ))}
        </div>

        <div className="nav-drawer-section nav-drawer-auth">
          {user ? (
            <>
              <button className="btn btn-ghost" type="button" onClick={() => closeDrawerAndNavigate("/account")}>
                {text.account}
              </button>
              <button className="btn btn-ghost" type="button" onClick={() => closeDrawerAndNavigate("/messages")}>
                {text.messages}
              </button>
              <button
                className="btn btn-dark"
                type="button"
                onClick={() => {
                  setMobileOpen(false);
                  onLogout?.();
                  navigate("/auth", { state: { mode: "login" }, replace: true });
                }}
              >
                {text.logout}
              </button>
            </>
          ) : (
            <>
              <button
                className="btn btn-ghost"
                type="button"
                onClick={() => {
                  setMobileOpen(false);
                  openAuth("login");
                }}
              >
                {text.login}
              </button>
              <button
                className="btn btn-dark"
                type="button"
                onClick={() => {
                  setMobileOpen(false);
                  openAuth("signup");
                }}
              >
                {text.signup}
              </button>
            </>
          )}
        </div>
      </aside>
    </nav>
  );
}
