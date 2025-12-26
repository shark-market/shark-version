import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCurrency } from "../context/CurrencyContext";

const NAV_TEXT = {
  EN: {
    home: "Home",
    listings: "Browse Listings",
    pricing: "Pricing",
    partner: "Find a Partner",
    login: "Log in",
    signup: "Sign Up",
    account: "My Account",
    inbox: "Inbox",
    myListings: "My Listings",
    blog: "Blog",
    contact: "Contact",
  },
  AR: {
    home: "الرئيسية",
    listings: "تصفح العروض",
    pricing: "الأسعار",
    partner: "ابحث عن شريك",
    login: "تسجيل الدخول",
    signup: "إنشاء حساب",
    account: "حسابي",
    inbox: "صندوق الوارد",
    myListings: "إعلاناتي",
    blog: "المدونة",
    contact: "تواصل معنا",
  },
};

export default function Navbar({
  language = "EN",
  onLanguageChange,
  user,
  profile,
  onLogout,
}) {
  const text = NAV_TEXT[language] || NAV_TEXT.EN;
  const navigate = useNavigate();
  const { currency, currencies, setCurrency } = useCurrency();
  const [open, setOpen] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  const dropdownRef = useRef(null);

  const handleNavigate = (path, scrollTo) => {
    if (scrollTo) {
      navigate(path, { state: { scrollTo } });
      return;
    }
    navigate(path);
  };

  useEffect(() => {
    const handleClick = (event) => {
      if (!dropdownRef.current?.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  useEffect(() => {
    const updateUnread = () => {
      if (typeof window === "undefined") return;
      setHasUnread(window.localStorage.getItem("sm-inbox-unread") === "1");
    };
    updateUnread();
    window.addEventListener("storage", updateUnread);
    window.addEventListener("sm-inbox-update", updateUnread);
    return () => {
      window.removeEventListener("storage", updateUnread);
      window.removeEventListener("sm-inbox-update", updateUnread);
    };
  }, []);

  useEffect(() => {
    if (!user || typeof window === "undefined") return;
    const stored = window.localStorage.getItem("sm-inbox-unread");
    if (stored === null) {
      window.localStorage.setItem("sm-inbox-unread", "1");
      setHasUnread(true);
      window.dispatchEvent(new Event("sm-inbox-update"));
    }
  }, [user]);

  const avatarLabel =
    profile?.first_name?.[0] || user?.email?.[0] || "A";
  const avatarUrl = profile?.avatar_url;

  return (
    <nav className="navbar">
      <div className="logo">
        <img className="logo-img" src="/sharkmkt-logo.png" alt="Shark Market" />
      </div>

      <div className="nav-links">
        <button type="button" onClick={() => handleNavigate("/", "#home")}>
          {text.home}
        </button>
        <button
          type="button"
          onClick={() => handleNavigate("/", "#listings")}
        >
          {text.listings}
        </button>
        <button type="button" onClick={() => handleNavigate("/partner")}>
          {text.partner}
        </button>
        <button type="button" onClick={() => handleNavigate("/pricing")}>
          {text.pricing}
        </button>
      </div>

      <div className="nav-actions">
        <div className="language-toggle">
          <button
            className={`pill-button ${language === "EN" ? "active" : ""}`}
            type="button"
            onClick={() => onLanguageChange?.("EN")}
          >
            EN
          </button>
          <button
            className={`pill-button ${language === "AR" ? "active" : ""}`}
            type="button"
            onClick={() => onLanguageChange?.("AR")}
          >
            AR
          </button>
        </div>
        <div className="currency-switcher">
          <select
            value={currency}
            onChange={(event) => setCurrency(event.target.value)}
            aria-label={language === "AR" ? "تغيير العملة" : "Change currency"}
          >
            {Object.entries(currencies).map(([code, meta]) => (
              <option key={code} value={code}>
                {meta.flag} {code}
              </option>
            ))}
          </select>
        </div>
        {user ? (
          <div className="nav-user" ref={dropdownRef}>
            <button
              className="inbox-button"
              type="button"
              onClick={() => navigate("/inbox")}
              aria-label={language === "AR" ? "صندوق الوارد" : "Inbox"}
            >
              <span className="inbox-icon" aria-hidden="true">
                ✉️
              </span>
              {hasUnread ? <span className="inbox-dot" /> : null}
            </button>
            <button
              className="avatar-button"
              type="button"
              onClick={() => setOpen((prev) => !prev)}
              aria-label={language === "AR" ? "الحساب" : "Account"}
            >
              {avatarUrl ? (
                <img src={avatarUrl} alt="avatar" />
              ) : (
                <span>{avatarLabel.toUpperCase()}</span>
              )}
            </button>
            {open ? (
              <div className="avatar-dropdown">
                <button type="button" onClick={() => handleNavigate("/account")}>
                  {text.account}
                </button>
                <button
                  type="button"
                  onClick={() => handleNavigate("/subscriptions")}
                >
                  {language === "AR"
                    ? "إدارة الاشتراكات"
                    : "Manage Subscriptions"}
                </button>
                <button type="button" onClick={() => handleNavigate("/my-listings")}>
                  {text.myListings}
                </button>
                <button type="button" onClick={() => handleNavigate("/inbox")}>
                  {text.inbox}
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    setOpen(false);
                    onLogout?.();
                    navigate("/auth", { state: { mode: "login" }, replace: true });
                  }}
                >
                  {language === "AR" ? "تسجيل الخروج" : "Log out"}
                </button>
              </div>
            ) : null}
          </div>
        ) : (
          <>
            <button
              className="btn btn-ghost"
              type="button"
              onClick={() => navigate("/auth", { state: { mode: "login" } })}
            >
              {text.login}
            </button>
            <button
              className="btn btn-dark"
              type="button"
              onClick={() => navigate("/auth", { state: { mode: "signup" } })}
            >
              {text.signup}
            </button>
          </>
        )}
      </div>
    </nav>
  );
}
