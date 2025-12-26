import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { businesses } from "../data/mockdata";
import { PLAN_ACCESS } from "../data/plans";

const LABELS = {
  EN: {
    title: "Inbox",
    upgrade: "Upgrade to access the inbox",
    upgradeButton: "View pricing",
    placeholder: "Select a conversation to view messages.",
    send: "Send message",
    messagePlaceholder: "Write a message...",
    listing: "Listing",
    partner: "Partner request",
  },
  AR: {
    title: "صندوق الوارد",
    upgrade: "قم بالترقية للوصول لصندوق الوارد",
    upgradeButton: "عرض الأسعار",
    placeholder: "اختر محادثة لعرض الرسائل.",
    send: "إرسال الرسالة",
    messagePlaceholder: "اكتب رسالة...",
    listing: "إعلان",
    partner: "طلب شراكة",
  },
};

const buildConversation = (listingId, language) => {
  const listing = businesses.find((item) => item.id === listingId);
  if (!listing) return null;
  return {
    id: `listing-${listingId}`,
    listingId,
    type: "listing",
    title: listing.title,
    subtitle: listing.category,
    unread: true,
    messages: [
      {
        id: 1,
        from: "seller",
        text:
          language === "AR"
            ? "مرحبًا! يسعدني الإجابة عن أي أسئلة."
            : "Hi! Happy to answer any questions.",
      },
    ],
  };
};

const buildPartnerConversation = (partnerTitle, partnerSubtitle, language) => {
  if (!partnerTitle) return null;
  return {
    id: `partner-${partnerTitle}`,
    listingId: null,
    type: "partner",
    title: partnerTitle,
    subtitle: partnerSubtitle || (language === "AR" ? "شراكات" : "Partnership"),
    unread: true,
    messages: [
      {
        id: 1,
        from: "partner",
        text:
          language === "AR"
            ? "مرحبًا! يسعدنا مشاركة تفاصيل الشراكة."
            : "Hi! Happy to share partnership details.",
      },
    ],
  };
};

export default function Inbox({ language = "EN" }) {
  const text = LABELS[language] || LABELS.EN;
  const { user, role } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const canMessage = PLAN_ACCESS[role]?.canMessage ?? false;
  const canOpen = role !== "free";

  const [conversations, setConversations] = useState([
    {
      id: "listing-1",
      listingId: 1,
      type: "listing",
      title: businesses[0].title,
      subtitle: businesses[0].category,
      unread: true,
      messages: [
        {
          id: 1,
          from: "seller",
          text:
            language === "AR"
              ? "مرحبًا! يسعدنا مشاركة التفاصيل بعد الترقية."
              : "Hi! We can share full details once you're subscribed.",
        },
      ],
    },
    {
      id: "partner-1",
      listingId: null,
      type: "partner",
      title: language === "AR" ? "فرصة شراكة جديدة" : "New partner request",
      subtitle: language === "AR" ? "تطبيقات" : "Apps",
      unread: false,
      messages: [
        {
          id: 1,
          from: "partner",
          text:
            language === "AR"
              ? "نبحث عن شريك تقني، هل لديك وقت للتواصل؟"
              : "We are looking for a technical partner. Interested?",
        },
      ],
    },
  ]);
  const [activeId, setActiveId] = useState(conversations[0]?.id || "");
  const [message, setMessage] = useState("");

  const activeConversation = useMemo(
    () => conversations.find((conv) => conv.id === activeId),
    [activeId, conversations]
  );

  useEffect(() => {
    const listingId = location.state?.listingId;
    const partnerTitle = location.state?.partnerTitle;
    const partnerSubtitle = location.state?.partnerSubtitle;
    if (listingId) {
      setConversations((prev) => {
        const exists = prev.some((conv) => conv.id === `listing-${listingId}`);
        if (exists) return prev;
        const next = buildConversation(listingId, language);
        if (!next) return prev;
        return [next, ...prev];
      });
      setActiveId(`listing-${listingId}`);
    } else if (partnerTitle) {
      setConversations((prev) => {
        const id = `partner-${partnerTitle}`;
        const exists = prev.some((conv) => conv.id === id);
        if (exists) return prev;
        const next = buildPartnerConversation(partnerTitle, partnerSubtitle, language);
        if (!next) return prev;
        return [next, ...prev];
      });
      setActiveId(`partner-${partnerTitle}`);
    }
  }, [language, location.state?.listingId, location.state?.partnerSubtitle, location.state?.partnerTitle]);

  useEffect(() => {
    setConversations((prev) =>
      prev.map((conv) =>
        conv.id === activeId ? { ...conv, unread: false } : conv
      )
    );
  }, [activeId]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const hasUnread = conversations.some((conv) => conv.unread);
    window.localStorage.setItem("sm-inbox-unread", hasUnread ? "1" : "0");
    window.dispatchEvent(new Event("sm-inbox-update"));
  }, [conversations]);

  const handleSend = () => {
    if (!activeConversation) return;
    if (!canMessage) {
      navigate("/pricing");
      return;
    }
    if (!message.trim()) return;
    setConversations((prev) =>
      prev.map((conv) =>
        conv.id === activeId
          ? {
              ...conv,
              messages: [
                ...conv.messages,
                { id: Date.now(), from: "me", text: message.trim() },
              ],
            }
          : conv
      )
    );
    setMessage("");
  };

  if (!user) return null;

  return (
    <section className="inbox-page">
      <div className="container inbox-layout">
        <aside className="inbox-list">
          <h2>{text.title}</h2>
          {conversations.map((conv) => (
            <button
              key={conv.id}
              className={`inbox-thread ${conv.id === activeId ? "active" : ""}`}
              type="button"
              onClick={() => setActiveId(conv.id)}
            >
              <div>
                <strong>{conv.title}</strong>
                <span className="muted">
                  {conv.type === "listing" ? text.listing : text.partner} ·{" "}
                  {conv.subtitle}
                </span>
              </div>
              {conv.unread ? <span className="inbox-dot" /> : null}
            </button>
          ))}
        </aside>

        <div className="inbox-thread-panel">
          {activeConversation ? (
            <div className={`thread-content ${canOpen ? "" : "locked"}`}>
              <div className="thread-header">
                <h3>{activeConversation.title}</h3>
                <span className="muted">{activeConversation.subtitle}</span>
              </div>
              <div className="thread-body">
                {activeConversation.messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`thread-message ${msg.from === "me" ? "me" : ""}`}
                  >
                    <p>{msg.text}</p>
                  </div>
                ))}
              </div>
              <div className="thread-composer">
                <input
                  type="text"
                  placeholder={text.messagePlaceholder}
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  disabled={!canMessage}
                />
                <button
                  className="btn btn-dark"
                  type="button"
                  onClick={handleSend}
                  disabled={!canMessage}
                >
                  {text.send}
                </button>
              </div>
              {!canOpen ? (
                <div className="thread-locked-overlay">
                  <p className="muted">{text.upgrade}</p>
                  <button
                    className="btn btn-dark"
                    type="button"
                    onClick={() => navigate("/pricing")}
                  >
                    {text.upgradeButton}
                  </button>
                </div>
              ) : null}
            </div>
          ) : (
            <div className="thread-empty">
              <p className="muted">{text.placeholder}</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
