import { useEffect, useMemo, useState } from "react";
import { Navigate, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import Home from "./pages/Home";
import Auth from "./pages/Auth";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import Pricing from "./pages/Pricing";
import Browse from "./pages/Browse";
import Sell from "./pages/Sell";
import SellWizard from "./pages/SellWizard";
import Messages from "./pages/Messages";
import About from "./pages/About";
import Help from "./pages/Help";
import Account from "./pages/Account";
import Subscriptions from "./pages/Subscriptions";
import Onboarding from "./pages/Onboarding";
import OnboardingNext from "./pages/OnboardingNext";
import AdminDashboard from "./pages/AdminDashboard";
import AdminConversations from "./pages/AdminConversations";
import AdminHelpCenter from "./pages/AdminHelpCenter";
import AdminUsers from "./pages/AdminUsers";
import AdminListings from "./pages/AdminListings";
import AdminServices from "./pages/AdminServices";
import Valuation from "./pages/Valuation";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import EscrowServices from "./pages/EscrowServices";
import Contact from "./pages/Contact";
import Partner from "./pages/Partner";
import PartnerPublish from "./pages/PartnerPublish";
import PartnerDetails from "./pages/PartnerDetails";
import ListingDetails from "./pages/ListingDetails";
import MyListings from "./pages/MyListings";
import CreateListing from "./pages/CreateListing";
import EditListing from "./pages/EditListing";
import MobileBottomCTA from "./components/MobileBottomCTA";
import Fees from "./pages/Fees";
import FeePaymentFollowup from "./pages/FeePaymentFollowup";
import AdminPayments from "./pages/AdminPayments";
import { useAuth } from "./context/AuthContext";
import { ADMIN_EMAIL } from "./services/usersService";

export default function App() {
  const [language, setLanguage] = useState(() => {
    if (typeof window === "undefined") {
      return "AR";
    }
    const stored = window.localStorage.getItem("sm-language");
    return stored === "EN" || stored === "AR" ? stored : "AR";
  });
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile, appUser, loading, signOut, role, onboardingCompleted } = useAuth();
  const authenticated = Boolean(user);
  const isAdminRoute = location.pathname.startsWith("/admin");
  const hideNavbar = ["/auth", "/onboarding", "/onboarding/next"].includes(
    location.pathname
  ) || isAdminRoute;
  const hideFooter = ["/auth", "/onboarding", "/onboarding/next"].includes(
    location.pathname
  ) || isAdminRoute;
  const hideMobileCta = hideNavbar || isAdminRoute;

  useEffect(() => {
    const targetId = location.state?.scrollTo;
    if (targetId) {
      const target = document.querySelector(targetId);
      if (target) {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  }, [location]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    window.localStorage.setItem("sm-language", language);
    document.documentElement.lang = language === "AR" ? "ar" : "en";
    document.documentElement.dir = language === "AR" ? "rtl" : "ltr";
  }, [language]);

  const needsOnboarding = useMemo(
    () => authenticated && !loading && !onboardingCompleted,
    [authenticated, loading, onboardingCompleted]
  );

  const allowRoute = (element) =>
    needsOnboarding ? <Navigate to="/onboarding" replace /> : element;

  const allowAuthedRoute = (element) => {
    if (!authenticated) return <Navigate to="/auth" replace />;
    if (needsOnboarding) return <Navigate to="/onboarding" replace />;
    return element;
  };

  const allowAdminRoute = (element) => {
    if (!authenticated) return <Navigate to="/auth" replace />;
    if (needsOnboarding) return <Navigate to="/onboarding" replace />;
    const email = String(user?.email || "").trim().toLowerCase();
    const isAdmin = email === ADMIN_EMAIL || role === "admin" || appUser?.role === "admin";
    if (!isAdmin) {
      return (
        <Navigate
          to="/"
          replace
          state={{
            unauthorizedMessage: "غير مصرح",
          }}
        />
      );
    }
    return element;
  };

  return (
    <div className="app" dir={language === "AR" ? "rtl" : "ltr"}>
      {hideNavbar ? null : (
        <Navbar
          language={language}
          onLanguageChange={setLanguage}
          user={user}
          profile={profile}
          onLogout={signOut}
        />
      )}
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
        <Route
          path="/browse"
          element={allowRoute(<Browse language={language} />)}
        />
        <Route path="/fees" element={allowRoute(<Fees />)} />
        <Route
          path="/fees/payment"
          element={allowAuthedRoute(<FeePaymentFollowup />)}
        />
        <Route path="/sell" element={allowRoute(<Sell language={language} />)} />
        <Route
          path="/sell/publish"
          element={allowRoute(<SellWizard language={language} />)}
        />
        <Route
          path="/sell/:type"
          element={allowRoute(<SellWizard language={language} />)}
        />
        <Route
          path="/messages"
          element={allowAuthedRoute(<Messages language={language} />)}
        />
        <Route path="/about" element={allowRoute(<About language={language} />)} />
        <Route path="/help" element={allowRoute(<Help language={language} />)} />
        <Route path="/blog" element={allowRoute(<Blog language={language} />)} />
        <Route
          path="/blog/:slug"
          element={allowRoute(<BlogPost language={language} />)}
        />
        <Route
          path="/valuation"
          element={allowRoute(<Valuation language={language} />)}
        />
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
                <Navigate to="/partner" replace />
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
              onboardingCompleted ? (
                <Navigate to="/partner" replace />
              ) : (
                <Onboarding language={language} />
              )
            ) : loading ? null : (
              <Navigate to="/auth" replace />
            )
          }
        />
        <Route
          path="/onboarding/next"
          element={
            authenticated ? (
              needsOnboarding ? (
                <Navigate to="/onboarding" replace />
              ) : (
                <OnboardingNext language={language} />
              )
            ) : loading ? null : (
              <Navigate to="/auth" replace />
            )
          }
        />
        <Route
          path="/admin"
          element={allowAdminRoute(<Navigate to="/admin/dashboard" replace />)}
        />
        <Route
          path="/admin/dashboard"
          element={allowAdminRoute(<AdminDashboard language={language} />)}
        />
        <Route
          path="/admin/conversations"
          element={allowAdminRoute(<AdminConversations language={language} />)}
        />
        <Route
          path="/admin/help-center"
          element={allowAdminRoute(<AdminHelpCenter language={language} />)}
        />
        <Route
          path="/admin/users"
          element={allowAdminRoute(<AdminUsers language={language} />)}
        />
        <Route
          path="/admin/listings"
          element={allowAdminRoute(<AdminListings language={language} />)}
        />
        <Route
          path="/admin/services"
          element={allowAdminRoute(<AdminServices language={language} />)}
        />
        <Route
          path="/admin/payments"
          element={allowAdminRoute(<AdminPayments language={language} />)}
        />
        <Route
          path="/account"
          element={
            authenticated ? (
              onboardingCompleted ? (
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
              onboardingCompleted ? (
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
          element={allowAuthedRoute(<Messages language={language} />)}
        />
        <Route
          path="/my-listings"
          element={
            authenticated ? (
              onboardingCompleted ? (
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
              onboardingCompleted ? (
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
          path="/partner/publish"
          element={allowAuthedRoute(<PartnerPublish language={language} />)}
        />
        <Route
          path="/find-partner"
          element={allowRoute(<Partner language={language} />)}
        />
        <Route
          path="/find-partner/publish"
          element={allowAuthedRoute(<PartnerPublish language={language} />)}
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
              onboardingCompleted ? (
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
      {hideFooter ? null : <Footer language={language} />}
      {hideMobileCta ? null : <MobileBottomCTA language={language} />}
    </div>
  );
}
