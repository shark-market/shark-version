import { NavLink } from "react-router-dom";
import { getUI } from "../data/uiDictionary";

export default function MobileBottomCTA({ language = "EN" }) {
  const nav = getUI(language).nav;

  return (
    <div className="mobile-cta-bar" role="navigation" aria-label="Quick actions">
      <NavLink
        to="/browse"
        className={({ isActive }) => `mobile-cta-link ${isActive ? "active" : ""}`}
      >
        {language === "AR" ? "شراء" : "Buy"}
      </NavLink>
      <NavLink
        to="/sell"
        className={({ isActive }) => `mobile-cta-link ${isActive ? "active" : ""}`}
      >
        {nav.sell}
      </NavLink>
      <NavLink
        to="/partner"
        className={({ isActive }) => `mobile-cta-link ${isActive ? "active" : ""}`}
      >
        {nav.partner}
      </NavLink>
    </div>
  );
}
