import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import { useCurrency } from "../context/CurrencyContext";

const TEXT = {
  EN: {
    back: "Back",
    title: "Create Your Account",
    subtitle:
      "Create your account to access full business details, financial data, and communicate with sellers.",
    loginTitle: "Welcome Back",
    loginSubtitle: "Sign in to view financials and contact sellers.",
    nafath: "Sign up with Nafath",
    or: "or",
    apple: "Continue with Apple",
    google: "Continue with Google",
    email: "Sign up with Email",
    phone: "Continue with Phone",
    emailLabel: "Email",
    passwordLabel: "Password",
    signupButton: "Create Account",
    loginButton: "Log In",
    successLogin: "Logged in successfully.",
    successSignup: "Account created. Check your email to confirm.",
    errorFallback: "Something went wrong. Please try again.",
    resetPassword: "Forgot password?",
    resetSent: "Password reset email sent.",
    note: "By creating an account, you agree to our Terms & Conditions and Privacy Policy.",
    termsLabel: "I agree to the",
    termsError: "Please agree to the terms and privacy policy to continue.",
    heroTitle: "Join Shark Market Now",
    investorTitle: "Investor",
    sellerTitle: "Seller",
    investorHighlights: [
      "Verified business listings",
      "Advanced marketplace search",
      "Save listings and searches",
    ],
    sellerHighlights: [
      "Free business valuation",
      "Sell your project easily",
      "Full management dashboard",
    ],
    stats: [
      { label: "Sales Overall", value: 565745623, type: "currency", icon: "cart" },
      { label: "# of Listings Sold", value: 2555, type: "count", icon: "window" },
      { label: "Current Listings", value: 210, type: "count", icon: "globe" },
    ],
  },
  AR: {
    back: "رجوع",
    title: "أنشئ حسابك",
    subtitle:
      "أنشئ حسابك للوصول إلى تفاصيل المشاريع الكاملة والبيانات المالية والتواصل مع البائعين.",
    loginTitle: "مرحبًا بعودتك",
    loginSubtitle: "سجّل الدخول لعرض البيانات المالية والتواصل مع البائعين.",
    nafath: "سجّل عبر نفاذ",
    or: "أو",
    apple: "المتابعة عبر Apple",
    google: "المتابعة عبر Google",
    email: "التسجيل عبر البريد",
    phone: "المتابعة عبر الهاتف",
    emailLabel: "البريد الإلكتروني",
    passwordLabel: "كلمة المرور",
    signupButton: "إنشاء حساب",
    loginButton: "تسجيل الدخول",
    successLogin: "تم تسجيل الدخول بنجاح.",
    successSignup: "تم إنشاء الحساب. افحص بريدك للتأكيد.",
    errorFallback: "حدث خطأ، حاول مرة أخرى.",
    resetPassword: "نسيت كلمة المرور؟",
    resetSent: "تم إرسال رابط إعادة التعيين للبريد.",
    note: "بإنشاء حساب، أنت توافق على الشروط والأحكام وسياسة الخصوصية.",
    termsLabel: "أوافق على",
    termsError: "يرجى الموافقة على الشروط وسياسة الخصوصية للمتابعة.",
    heroTitle: "انضم إلى Shark Market الآن",
    investorTitle: "المستثمر",
    sellerTitle: "البائع",
    investorHighlights: [
      "عروض موثّقة للأعمال",
      "بحث متقدم في السوق",
      "حفظ العروض وعمليات البحث",
    ],
    sellerHighlights: [
      "تقييم مجاني للمشروع",
      "بيع مشروعك بسهولة",
      "لوحة تحكم للإدارة الكاملة",
    ],
    stats: [
      { label: "إجمالي المبيعات", value: 565745623, type: "currency", icon: "cart" },
      { label: "عدد العروض المباعة", value: 2555, type: "count", icon: "window" },
      { label: "العروض الحالية", value: 210, type: "count", icon: "globe" },
    ],
  },
};

export default function Auth({ language = "EN" }) {
  const text = TEXT[language] || TEXT.EN;
  const { formatCurrency, formatNumber } = useCurrency();
  const locale = language === "AR" ? "ar-SA" : "en-US";
  const navigate = useNavigate();
  const location = useLocation();
  const { user, profile, loading, signInMock } = useAuth();
  const initialMode = location.state?.mode || "signup";
  const [activeMode, setActiveMode] = useState(initialMode);
  const [formState, setFormState] = useState({
    email: "",
    password: "",
  });
  const [status, setStatus] = useState({ type: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [oauthLoading, setOauthLoading] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);

  useEffect(() => {
    setActiveMode(location.state?.mode || "signup");
  }, [location.state?.mode]);

  useEffect(() => {
    if (loading) return;
    if (user) {
      if (profile?.first_name && profile?.last_name) {
        navigate("/", { replace: true });
      } else {
        navigate("/onboarding", { replace: true });
      }
    }
  }, [loading, navigate, profile, user]);

  useEffect(() => {
    setStatus({ type: "", message: "" });
    setFormState({ email: "", password: "" });
    setTermsAccepted(false);
  }, [activeMode]);

  const handleChange = (field) => (event) => {
    setFormState((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (activeMode === "signup" && !termsAccepted) {
      setStatus({ type: "error", message: text.termsError });
      return;
    }
    setIsSubmitting(true);
    setStatus({ type: "", message: "" });
    try {
      if (activeMode === "login") {
        if (signInMock?.(formState.email, formState.password)) {
          setStatus({ type: "success", message: text.successLogin });
          navigate("/", { replace: true });
          return;
        }
        const { error } = await supabase.auth.signInWithPassword({
          email: formState.email,
          password: formState.password,
        });
        if (error) {
          setStatus({ type: "error", message: error.message });
          return;
        }
        setStatus({ type: "success", message: text.successLogin });
        return;
      }

      const { data, error } = await supabase.auth.signUp({
        email: formState.email,
        password: formState.password,
      });
      if (error) {
        setStatus({ type: "error", message: error.message });
        return;
      }
      if (data?.user) {
        const { error: profileError } = await supabase.from("profiles").upsert({
          id: data.user.id,
          email: data.user.email,
          terms_accepted: true,
          terms_accepted_at: new Date().toISOString(),
          terms_version: "v1",
        });
        if (profileError) {
          console.warn("Profile terms update failed:", profileError.message);
        }
      }
      setStatus({ type: "success", message: text.successSignup });
      setFormState({ email: "", password: "" });
    } catch (err) {
      setStatus({
        type: "error",
        message: err?.message || text.errorFallback,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOAuth = async (provider) => {
    setOauthLoading(provider);
    setStatus({ type: "", message: "" });
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/#/onboarding`,
      },
    });
    if (error) {
      setStatus({ type: "error", message: error.message });
      setOauthLoading("");
    }
  };

  const handleResetPassword = async () => {
    if (!formState.email) {
      setStatus({
        type: "error",
        message: language === "AR"
          ? "اكتب بريدك الإلكتروني أولاً."
          : "Enter your email first.",
      });
      return;
    }
    setIsSubmitting(true);
    setStatus({ type: "", message: "" });
    const { error } = await supabase.auth.resetPasswordForEmail(
      formState.email,
      {
        redirectTo: window.location.origin,
      }
    );
    if (error) {
      setStatus({ type: "error", message: error.message });
    } else {
      setStatus({ type: "success", message: text.resetSent });
    }
    setIsSubmitting(false);
  };
  return (
    <div className="auth-page">
      <header className="auth-header">
        <button
          className="btn btn-ghost"
          type="button"
          onClick={() => navigate("/")}
        >
          {text.back}
        </button>
        <div className="logo">
          <img className="logo-img" src="/sharkmkt-logo.png" alt="Shark Market" />
        </div>
      </header>

      <div className="auth-layout">
        <section className="auth-card">
          <div className="auth-tabs">
            <button
              className={`auth-tab ${
                activeMode === "signup" ? "active" : ""
              }`}
              type="button"
              onClick={() => setActiveMode("signup")}
            >
              {language === "AR" ? "إنشاء حساب" : "Sign Up"}
            </button>
            <button
              className={`auth-tab ${
                activeMode === "login" ? "active" : ""
              }`}
              type="button"
              onClick={() => setActiveMode("login")}
            >
              {language === "AR" ? "تسجيل الدخول" : "Log In"}
            </button>
          </div>

          <h2>{activeMode === "login" ? text.loginTitle : text.title}</h2>
          <p className="muted">
            {activeMode === "login" ? text.loginSubtitle : text.subtitle}
          </p>

          <div className="auth-actions">
            {activeMode === "signup" ? (
              <>
                <div className="auth-divider">{text.or}</div>
                <button
                  className="auth-button oauth-button"
                  type="button"
                  onClick={() => handleOAuth("apple")}
                  disabled={oauthLoading === "apple"}
                >
                  <span className="oauth-icon oauth-apple" aria-hidden="true">
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <path
                        fill="currentColor"
                        d="M16.56 13.2c.02 2.12 1.86 2.82 1.88 2.83-.01.05-.29.99-.94 1.95-.56.84-1.15 1.67-2.07 1.69-.9.02-1.19-.54-2.22-.54-1.03 0-1.35.52-2.2.56-.89.03-1.57-.9-2.14-1.74-1.17-1.7-2.06-4.8-.86-6.9.6-1.04 1.67-1.7 2.84-1.72.88-.02 1.72.6 2.22.6.5 0 1.45-.74 2.44-.63.41.02 1.56.17 2.29 1.25-.06.04-1.37.8-1.36 2.4ZM14.9 4.8c.47-.57.79-1.36.7-2.14-.68.03-1.5.45-1.98 1.01-.43.5-.81 1.3-.71 2.07.74.06 1.52-.38 1.99-.94Z"
                      />
                    </svg>
                  </span>
                  {text.apple}
                </button>
                <button
                  className="auth-button oauth-button"
                  type="button"
                  onClick={() => handleOAuth("google")}
                  disabled={oauthLoading === "google"}
                >
                  <span className="oauth-icon oauth-google" aria-hidden="true">
                    <svg viewBox="0 0 48 48" aria-hidden="true">
                      <path
                        fill="#FFC107"
                        d="M43.6 20.5H42V20H24v8h11.3C33.7 32.3 29.2 35 24 35c-6.1 0-11-4.9-11-11s4.9-11 11-11c2.7 0 5.2 1 7.1 2.9l5.7-5.7C33.3 7 28.9 5 24 5 12.9 5 4 13.9 4 25s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.7-.4-4.5Z"
                      />
                      <path
                        fill="#FF3D00"
                        d="M6.3 14.7 12.8 19C14.6 15.4 18 13 24 13c2.7 0 5.2 1 7.1 2.9l5.7-5.7C33.3 7 28.9 5 24 5 16.2 5 9.2 9.4 6.3 14.7Z"
                      />
                      <path
                        fill="#4CAF50"
                        d="M24 45c4.9 0 9.3-1.9 12.7-5l-5.9-5c-1.8 1.4-4.1 2.2-6.8 2.2-5.2 0-9.7-2.7-11.3-7.1l-6.4 4.9C9.1 40.6 16.2 45 24 45Z"
                      />
                      <path
                        fill="#1976D2"
                        d="M43.6 20.5H42V20H24v8h11.3c-1.1 3.1-3.7 5.6-7.1 7.1l.1.1 5.9 5C34.3 39.9 40 35 42.4 28c1.1-3.3 1.3-6.1 1.2-7.5Z"
                      />
                    </svg>
                  </span>
                  {text.google}
                </button>
                <form className="auth-form" onSubmit={handleSubmit}>
                  <label className="auth-label" htmlFor="signup-email">
                    {text.emailLabel}
                  </label>
                  <input
                    id="signup-email"
                    type="email"
                    value={formState.email}
                    onChange={handleChange("email")}
                    placeholder="example@email.com"
                    required
                  />
                  <label className="auth-label" htmlFor="signup-password">
                    {text.passwordLabel}
                  </label>
                  <input
                    id="signup-password"
                    type="password"
                    value={formState.password}
                    onChange={handleChange("password")}
                    placeholder="••••••••"
                    required
                  />
                  <label className="auth-checkbox">
                    <input
                      type="checkbox"
                      checked={termsAccepted}
                      onChange={(event) => setTermsAccepted(event.target.checked)}
                    />
                    <span>
                      {text.termsLabel}{" "}
                      <button
                        className="link-button inline-link"
                        type="button"
                        onClick={() => navigate("/terms")}
                      >
                        {language === "AR" ? "الشروط" : "Terms"}
                      </button>
                      {" · "}
                      <button
                        className="link-button inline-link"
                        type="button"
                        onClick={() => navigate("/privacy")}
                      >
                        {language === "AR" ? "الخصوصية" : "Privacy"}
                      </button>
                    </span>
                  </label>
                  <button
                    className="auth-button primary"
                    type="submit"
                    disabled={isSubmitting || !termsAccepted}
                  >
                    {isSubmitting ? "..." : text.signupButton}
                  </button>
                </form>
                <button className="auth-button" type="button">
                  {text.phone}
                </button>
              </>
            ) : (
              <form className="auth-form" onSubmit={handleSubmit}>
                <div className="auth-divider">{text.or}</div>
                <button
                  className="auth-button oauth-button"
                  type="button"
                  onClick={() => handleOAuth("apple")}
                  disabled={oauthLoading === "apple"}
                >
                  <span className="oauth-icon oauth-apple" aria-hidden="true">
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <path
                        fill="currentColor"
                        d="M16.56 13.2c.02 2.12 1.86 2.82 1.88 2.83-.01.05-.29.99-.94 1.95-.56.84-1.15 1.67-2.07 1.69-.9.02-1.19-.54-2.22-.54-1.03 0-1.35.52-2.2.56-.89.03-1.57-.9-2.14-1.74-1.17-1.7-2.06-4.8-.86-6.9.6-1.04 1.67-1.7 2.84-1.72.88-.02 1.72.6 2.22.6.5 0 1.45-.74 2.44-.63.41.02 1.56.17 2.29 1.25-.06.04-1.37.8-1.36 2.4ZM14.9 4.8c.47-.57.79-1.36.7-2.14-.68.03-1.5.45-1.98 1.01-.43.5-.81 1.3-.71 2.07.74.06 1.52-.38 1.99-.94Z"
                      />
                    </svg>
                  </span>
                  {text.apple}
                </button>
                <button
                  className="auth-button oauth-button"
                  type="button"
                  onClick={() => handleOAuth("google")}
                  disabled={oauthLoading === "google"}
                >
                  <span className="oauth-icon oauth-google" aria-hidden="true">
                    <svg viewBox="0 0 48 48" aria-hidden="true">
                      <path
                        fill="#FFC107"
                        d="M43.6 20.5H42V20H24v8h11.3C33.7 32.3 29.2 35 24 35c-6.1 0-11-4.9-11-11s4.9-11 11-11c2.7 0 5.2 1 7.1 2.9l5.7-5.7C33.3 7 28.9 5 24 5 12.9 5 4 13.9 4 25s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.7-.4-4.5Z"
                      />
                      <path
                        fill="#FF3D00"
                        d="M6.3 14.7 12.8 19C14.6 15.4 18 13 24 13c2.7 0 5.2 1 7.1 2.9l5.7-5.7C33.3 7 28.9 5 24 5 16.2 5 9.2 9.4 6.3 14.7Z"
                      />
                      <path
                        fill="#4CAF50"
                        d="M24 45c4.9 0 9.3-1.9 12.7-5l-5.9-5c-1.8 1.4-4.1 2.2-6.8 2.2-5.2 0-9.7-2.7-11.3-7.1l-6.4 4.9C9.1 40.6 16.2 45 24 45Z"
                      />
                      <path
                        fill="#1976D2"
                        d="M43.6 20.5H42V20H24v8h11.3c-1.1 3.1-3.7 5.6-7.1 7.1l.1.1 5.9 5C34.3 39.9 40 35 42.4 28c1.1-3.3 1.3-6.1 1.2-7.5Z"
                      />
                    </svg>
                  </span>
                  {text.google}
                </button>
                <label className="auth-label" htmlFor="email">
                  {text.emailLabel}
                </label>
                <input
                  id="email"
                  type="email"
                  value={formState.email}
                  onChange={handleChange("email")}
                  placeholder={
                    language === "AR"
                      ? "example@email.com"
                      : "example@email.com"
                  }
                  required
                />
                <label className="auth-label" htmlFor="password">
                  {text.passwordLabel}
                </label>
                <input
                  id="password"
                  type="password"
                  value={formState.password}
                  onChange={handleChange("password")}
                  placeholder={language === "AR" ? "••••••••" : "••••••••"}
                  required
                />
                <button
                  className="link-button auth-reset"
                  type="button"
                  onClick={handleResetPassword}
                  disabled={isSubmitting}
                >
                  {text.resetPassword}
                </button>
                <button
                  className="auth-button primary"
                  type="submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "..." : text.loginButton}
                </button>
              </form>
            )}
          </div>

          {status.message ? (
            <div className={`auth-status ${status.type}`}>
              {status.message}
            </div>
          ) : null}

          {activeMode === "signup" ? (
            <div className="auth-note">{text.note}</div>
          ) : null}
        </section>

        <aside className="auth-benefits auth-hero">
          <h3>{text.heroTitle}</h3>

            <div className="auth-hero-card">
              <div className="hero-card-header">
                <span className="hero-card-icon hero-card-icon-blue">
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path
                      fill="currentColor"
                      d="M3 17h2.6l4.8-6 4 4 6.6-8.6V10h2V3h-7v2h3.6l-5 6.5-4-4-6.1 7.5z"
                    />
                  </svg>
                </span>
                <strong>{text.investorTitle}</strong>
              </div>
            {text.investorHighlights.map((item) => (
              <div className="hero-row" key={item}>
                <span className="hero-dot hero-dot-blue" aria-hidden="true" />
                <span>{item}</span>
              </div>
            ))}
          </div>

            <div className="auth-hero-card">
              <div className="hero-card-header">
                <span className="hero-card-icon hero-card-icon-green">
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path
                      fill="currentColor"
                      d="M6 3h12l1 4H5l1-4zm-1 6h14v10H5V9zm4 2v6h2v-6H9zm4 0v6h2v-6h-2z"
                    />
                  </svg>
                </span>
                <strong>{text.sellerTitle}</strong>
              </div>
            {text.sellerHighlights.map((item) => (
              <div className="hero-row" key={item}>
                <span className="hero-dot hero-dot-green" aria-hidden="true" />
                <span>{item}</span>
              </div>
            ))}
          </div>

          <div className="auth-hero-stats">
            {text.stats.map((stat) => (
              <div className="hero-stat" key={stat.label}>
                <span className="hero-stat-icon" aria-hidden="true">
                  {stat.icon === "cart" ? (
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <path
                        fill="currentColor"
                        d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zm10 0c-1.1 0-1.99.9-1.99 2S15.9 22 17 22s2-.9 2-2-.9-2-2-2zM7.2 6l.9 2h8.8c.8 0 1.5.4 1.8 1.1l2.1 4.2-1.8.9-2.1-4.2H7.8L6.1 6H3V4h3.6l1 2z"
                      />
                    </svg>
                  ) : stat.icon === "window" ? (
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <path
                        fill="currentColor"
                        d="M3 5h18v14H3V5zm2 2v2h14V7H5zm0 4v6h14v-6H5z"
                      />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <path
                        fill="currentColor"
                        d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm0 18c-1.9 0-3.6-.6-5-1.6.5-1.1 2.2-1.9 5-1.9s4.5.8 5 1.9c-1.4 1-3.1 1.6-5 1.6zm-6.7-3.6C5.9 14.7 8.7 13.5 12 13.5s6.1 1.2 6.7 2.9c-1.5 1.6-3.7 2.6-6.7 2.6s-5.2-1-6.7-2.6z"
                      />
                    </svg>
                  )}
                  <span className="hero-stat-badge">✓</span>
                </span>
                <div>
                  <strong>
                    {stat.type === "currency"
                      ? formatCurrency(stat.value, { locale })
                      : formatNumber(stat.value, { locale })}
                  </strong>
                  <span>{stat.label}</span>
                </div>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}
