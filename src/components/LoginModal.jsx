import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";

const TEXT = {
  EN: {
    title: "Sign in to continue",
    email: "Email",
    password: "Password",
    submit: "Log In",
    cancel: "Not now",
    error: "Please check your credentials.",
    signup: "Create an account",
  },
  AR: {
    title: "سجّل الدخول للمتابعة",
    email: "البريد الإلكتروني",
    password: "كلمة المرور",
    submit: "تسجيل الدخول",
    cancel: "لاحقًا",
    error: "تأكد من بيانات الدخول.",
    signup: "إنشاء حساب",
  },
};

export default function LoginModal({ open, language = "EN", onClose }) {
  const text = TEXT[language] || TEXT.EN;
  const navigate = useNavigate();
  const { signInMock } = useAuth();
  const [formState, setFormState] = useState({ email: "", password: "" });
  const [status, setStatus] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    setFormState({ email: "", password: "" });
    setStatus("");
    setSubmitting(false);
  }, [open]);

  if (!open) return null;

  const handleChange = (field) => (event) => {
    setFormState((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setStatus("");
    if (signInMock?.(formState.email, formState.password)) {
      setSubmitting(false);
      onClose?.();
      return;
    }
    const { error } = await supabase.auth.signInWithPassword({
      email: formState.email,
      password: formState.password,
    });
    if (error) {
      setStatus(error.message || text.error);
      setSubmitting(false);
      return;
    }
    setSubmitting(false);
    onClose?.();
  };

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true">
      <div className="modal-card">
        <h3>{text.title}</h3>
        <form className="modal-form" onSubmit={handleSubmit}>
          <label className="modal-label">
            {text.email}
            <input
              type="email"
              required
              value={formState.email}
              onChange={handleChange("email")}
            />
          </label>
          <label className="modal-label">
            {text.password}
            <input
              type="password"
              required
              value={formState.password}
              onChange={handleChange("password")}
            />
          </label>
          {status ? <div className="auth-status error">{status}</div> : null}
          <button className="btn btn-dark btn-block" type="submit" disabled={submitting}>
            {text.submit}
          </button>
        </form>
        <div className="modal-actions">
          <button className="btn btn-ghost" type="button" onClick={onClose}>
            {text.cancel}
          </button>
          <button
            className="btn btn-ghost"
            type="button"
            onClick={() => navigate("/auth", { state: { mode: "signup" } })}
          >
            {text.signup}
          </button>
        </div>
      </div>
    </div>
  );
}
