import { useEffect, useMemo, useState } from "react";
import { Navigate, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import Home from "./pages/Home";
import Auth from "./pages/Auth";
import Navbar from "./components/Navbar";
import Blog from "./pages/Blog";
import Pricing from "./pages/Pricing";
import Account from "./pages/Account";
import Subscriptions from "./pages/Subscriptions";
import Onboarding from "./pages/Onboarding";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import EscrowServices from "./pages/EscrowServices";
import Contact from "./pages/Contact";
import Partner from "./pages/Partner";
import PartnerDetails from "./pages/PartnerDetails";
import ListingDetails from "./pages/ListingDetails";
import Inbox from "./pages/Inbox";
import MyListings from "./pages/MyListings";
import CreateListing from "./pages/CreateListing";
import EditListing from "./pages/EditListing";
import { useAuth } from "./context/AuthContext";

const isProfileComplete = (profile) =>
  Boolean(profile?.first_name && profile?.last_name);

export default function App() {
  const [language, setLanguage] = useState("EN");
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile, loading, signOut, role } = useAuth();
  const authenticated = role !== "guest";

  useEffect(() => {
    const targetId = location.state?.scrollTo;
    if (targetId) {
      const target = document.querySelector(targetId);
      if (target) {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  }, [location]);

  const needsOnboarding = useMemo(
    () => authenticated && !loading && !isProfileComplete(profile),
    [authenticated, loading, profile]
  );

  const allowRoute = (element) =>
    needsOnboarding ? <Navigate to="/onboarding" replace /> : element;

  return (
    <div className="app" dir={language === "AR" ? "rtl" : "ltr"}>
      <Navbar
        language={language}
        onLanguageChange={setLanguage}
        user={user}
        profile={profile}
        onLogout={signOut}
      />
      <Routes>
        <Route
          path="/"
          element={
            allowRoute(
              <Home
                language={language}
                isAuthenticated={authenticated}
                profile={profile}
                role={role}
                onRequireAuth={() =>
                  navigate("/auth", { state: { mode: "login" } })
                }
              />
            )
          }
        />
        <Route path="/blog" element={allowRoute(<Blog language={language} />)} />
        <Route
          path="/pricing"
          element={allowRoute(<Pricing language={language} />)}
        />
        <Route
          path="/auth"
          element={
            authenticated ? (
              needsOnboarding ? (
                <Navigate to="/onboarding" replace />
              ) : (
                <Navigate to="/" replace />
              )
            ) : (
              <Auth language={language} />
            )
          }
        />
        <Route
          path="/onboarding"
          element={
            authenticated ? (
              isProfileComplete(profile) ? (
                <Navigate to="/" replace />
              ) : (
                <Onboarding language={language} />
              )
            ) : loading ? null : (
              <Navigate to="/auth" replace />
            )
          }
        />
        <Route
          path="/account"
          element={
            authenticated ? (
              isProfileComplete(profile) ? (
                <Account language={language} />
              ) : (
                <Navigate to="/onboarding" replace />
              )
            ) : loading ? null : (
              <Navigate to="/auth" replace />
            )
          }
        />
        <Route
          path="/subscriptions"
          element={
            authenticated ? (
              isProfileComplete(profile) ? (
                <Subscriptions language={language} />
              ) : (
                <Navigate to="/onboarding" replace />
              )
            ) : loading ? null : (
              <Navigate to="/auth" replace />
            )
          }
        />
        <Route
          path="/inbox"
          element={
            authenticated ? (
              isProfileComplete(profile) ? (
                <Inbox language={language} />
              ) : (
                <Navigate to="/onboarding" replace />
              )
            ) : loading ? null : (
              <Navigate to="/auth" replace />
            )
          }
        />
        <Route
          path="/my-listings"
          element={
            authenticated ? (
              isProfileComplete(profile) ? (
                <MyListings language={language} />
              ) : (
                <Navigate to="/onboarding" replace />
              )
            ) : loading ? null : (
              <Navigate to="/auth" replace />
            )
          }
        />
        <Route
          path="/create-listing"
          element={
            authenticated ? (
              isProfileComplete(profile) ? (
                <CreateListing language={language} />
              ) : (
                <Navigate to="/onboarding" replace />
              )
            ) : loading ? null : (
              <Navigate to="/auth" replace />
            )
          }
        />
        <Route
          path="/privacy"
          element={allowRoute(<PrivacyPolicy language={language} />)}
        />
        <Route
          path="/terms"
          element={allowRoute(<TermsOfService language={language} />)}
        />
        <Route
          path="/escrow"
          element={allowRoute(<EscrowServices language={language} />)}
        />
        <Route
          path="/contact"
          element={allowRoute(<Contact language={language} />)}
        />
        <Route
          path="/partner"
          element={allowRoute(<Partner language={language} />)}
        />
        <Route
          path="/partner/:id"
          element={allowRoute(<PartnerDetails language={language} />)}
        />
        <Route
          path="/listing/:id"
          element={allowRoute(<ListingDetails language={language} />)}
        />
        <Route
          path="/listing/:id/edit"
          element={
            authenticated ? (
              isProfileComplete(profile) ? (
                <EditListing language={language} />
              ) : (
                <Navigate to="/onboarding" replace />
              )
            ) : loading ? null : (
              <Navigate to="/auth" replace />
            )
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}
