import Footer from "../components/Footer";
import { TEXT } from "../data/translations";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";

export default function Account({ language = "EN" }) {
  const text = TEXT[language] || TEXT.EN;
  const { user, profile } = useAuth();

  if (!user) return null;

  return (
    <div className="page">
      <section className="account-section" id="account">
        <div className="container account-card">
          <h2>{language === "AR" ? "حسابي" : "My Account"}</h2>
          <p className="muted">
            {language === "AR"
              ? "مرحبًا بك. يمكنك إدارة حسابك من هنا."
              : "Welcome back. Manage your account here."}
          </p>

          <div className="account-info">
            <div>
              <span className="muted">
                {language === "AR" ? "البريد الإلكتروني" : "Email"}
              </span>
              <strong>{user.email}</strong>
            </div>
            <div>
              <span className="muted">
                {language === "AR" ? "الاسم" : "Name"}
              </span>
              <strong>
                {[profile?.first_name, profile?.last_name]
                  .filter(Boolean)
                  .join(" ") || "-"}
              </strong>
            </div>
            <div>
              <span className="muted">
                {language === "AR" ? "الدور" : "Role"}
              </span>
              <strong>{profile?.role || "-"}</strong>
            </div>
            <div>
              <span className="muted">
                {language === "AR" ? "الدولة" : "Country"}
              </span>
              <strong>{profile?.country || "-"}</strong>
            </div>
            <div>
              <span className="muted">
                {language === "AR" ? "الشركة" : "Company"}
              </span>
              <strong>{profile?.company_name || "-"}</strong>
            </div>
            <div>
              <span className="muted">
                {language === "AR" ? "الهاتف" : "Phone"}
              </span>
              <strong>{profile?.phone || "-"}</strong>
            </div>
            <div>
              <span className="muted">
                {language === "AR" ? "كيف سمعت عنا؟" : "How did you hear about us?"}
              </span>
              <strong>{profile?.how_heard || "-"}</strong>
            </div>
            <div>
              <span className="muted">
                {language === "AR" ? "المعرّف" : "User ID"}
              </span>
              <strong>{user.id}</strong>
            </div>
          </div>

          <button
            className="btn btn-dark"
            type="button"
            onClick={() => supabase.auth.signOut()}
          >
            {language === "AR" ? "تسجيل الخروج" : "Log out"}
          </button>
        </div>
      </section>
      <Footer text={text} language={language} />
    </div>
  );
}
