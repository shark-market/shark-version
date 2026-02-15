import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { createTicket, getTickets, ticketsEvents } from "../services/ticketsService";
import { getUI } from "../data/uiDictionary";

export default function Help({ language = "EN" }) {
  const ui = getUI(language);
  const text = ui.help;
  const isArabic = language === "AR";
  const { user } = useAuth();
  const [subject, setSubject] = useState("");
  const [category, setCategory] = useState("General");
  const [message, setMessage] = useState("");
  const [attachments, setAttachments] = useState([]);
  const [status, setStatus] = useState("");
  const [userTickets, setUserTickets] = useState([]);

  useEffect(() => {
    const refresh = () => {
      if (!user?.id) {
        setUserTickets([]);
        return;
      }
      const allTickets = getTickets();
      setUserTickets(
        allTickets.filter((ticket) => String(ticket.userId) === String(user.id)).slice(0, 5)
      );
    };
    refresh();
    window.addEventListener(ticketsEvents.changed, refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener(ticketsEvents.changed, refresh);
      window.removeEventListener("storage", refresh);
    };
  }, [user?.id]);

  const statusLabel = useMemo(
    () =>
      ({
        open: isArabic ? "مفتوحة" : "Open",
        pending: isArabic ? "قيد المعالجة" : "Pending",
        closed: isArabic ? "مغلقة" : "Closed",
      }),
    [isArabic]
  );

  const onSubmitTicket = (event) => {
    event.preventDefault();
    if (!user) {
      setStatus(isArabic ? "يرجى تسجيل الدخول أولًا." : "Please sign in first.");
      return;
    }
    if (!subject.trim() || !message.trim()) {
      setStatus(isArabic ? "يرجى إدخال الموضوع والرسالة." : "Subject and message are required.");
      return;
    }

    const files = attachments.map((file) => ({ name: file.name, url: "" }));
    createTicket({
      userId: user.id,
      userEmail: user.email,
      subject: subject.trim(),
      category,
      message: message.trim(),
      attachments: files,
    });

    setSubject("");
    setCategory("General");
    setMessage("");
    setAttachments([]);
    setStatus(isArabic ? "تم إرسال التذكرة بنجاح." : "Ticket submitted successfully.");
  };

  return (
    <section className="market-page help-page">
      <div className="container market-page-header">
        <div>
          <h1>{text.title}</h1>
          <p className="muted">{text.subtitle}</p>
        </div>
      </div>

      <div className="container help-grid">
        {text.sections.map((section) => (
          <article className="help-card" key={section.title}>
            <h2>{section.title}</h2>
            <p>{section.body}</p>
          </article>
        ))}
      </div>

      <div className="container help-ticket-wrap">
        <article className="help-ticket-card">
          <h2>{isArabic ? "إرسال تذكرة دعم" : "Submit a support ticket"}</h2>
          <form className="help-ticket-form" onSubmit={onSubmitTicket}>
            <div className="field-grid">
              <label className="field-group">
                <span>{isArabic ? "الموضوع" : "Subject"}</span>
                <input value={subject} onChange={(event) => setSubject(event.target.value)} />
              </label>
              <label className="field-group">
                <span>{isArabic ? "التصنيف" : "Category"}</span>
                <select value={category} onChange={(event) => setCategory(event.target.value)}>
                  <option value="General">{isArabic ? "عام" : "General"}</option>
                  <option value="Technical">{isArabic ? "تقني" : "Technical"}</option>
                  <option value="Billing">{isArabic ? "الفوترة" : "Billing"}</option>
                  <option value="Safety">{isArabic ? "السلامة" : "Safety"}</option>
                </select>
              </label>
            </div>

            <label className="field-group">
              <span>{isArabic ? "الرسالة" : "Message"}</span>
              <textarea
                rows={4}
                value={message}
                onChange={(event) => setMessage(event.target.value)}
              />
            </label>

            <label className="field-group">
              <span>{isArabic ? "مرفقات (اختياري)" : "Attachments (optional)"}</span>
              <input
                type="file"
                multiple
                onChange={(event) =>
                  setAttachments(Array.from(event.target.files || []))
                }
              />
            </label>

            <button type="submit" className="btn btn-dark">
              {isArabic ? "إرسال التذكرة" : "Submit ticket"}
            </button>
            {status ? <p className="help-ticket-status">{status}</p> : null}
          </form>
        </article>

        <article className="help-ticket-card">
          <h2>{isArabic ? "آخر تذاكرك" : "Your latest tickets"}</h2>
          <div className="help-ticket-list">
            {userTickets.length === 0 ? (
              <p className="muted">
                {isArabic ? "لا توجد تذاكر حتى الآن." : "No tickets yet."}
              </p>
            ) : (
              userTickets.map((ticket) => (
                <div key={ticket.id} className="help-ticket-item">
                  <strong>{ticket.subject}</strong>
                  <span>{statusLabel[ticket.status] || ticket.status}</span>
                </div>
              ))
            )}
          </div>
        </article>
      </div>

      <div className="container market-support-section">
        <div className="market-support-card">
          <div>
            <h2>{language === "AR" ? "تواصل مع الفريق" : "Contact the team"}</h2>
            <p className="muted">
              {language === "AR"
                ? "تحتاج مساعدة مباشرة؟ ابدأ من صفحة التواصل."
                : "Need direct support? Start from our contact page."}
            </p>
          </div>
          <Link className="btn btn-dark" to="/contact">
            {language === "AR" ? "تواصل الآن" : "Contact now"}
          </Link>
        </div>
      </div>
    </section>
  );
}
