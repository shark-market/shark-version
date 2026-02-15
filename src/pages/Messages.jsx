import { useEffect, useMemo, useState } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  DEFAULT_LISTINGS,
  PARTNER_POSTS,
} from "../data/marketplaceData";
import {
  getAllMarketplaceListings,
  getAllPartnerPosts,
  getConversations as getMarketplaceConversations,
  marketplaceEvents,
  saveConversations,
} from "../data/marketplaceStore";
import { upsertConversation as upsertAdminConversation } from "../services/conversationsService";

const TEXT = {
  EN: {
    title: "Messages",
    subtitle: "Secure communication only inside SharkMKT.",
    search: "Search conversations",
    empty: "Select a conversation to start chatting.",
    placeholder: "Write your message...",
    send: "Send",
    listing: "Listing",
    partner: "Partner",
    requestInfo: "Request info",
    makeOffer: "Make offer",
    upsell: "Full details are available after subscribing.",
  },
  AR: {
    title: "الرسائل",
    subtitle: "تواصل آمن داخل SharkMKT فقط.",
    search: "ابحث في المحادثات",
    empty: "اختر محادثة لبدء الدردشة.",
    placeholder: "اكتب رسالتك...",
    send: "إرسال",
    listing: "إعلان",
    partner: "شريك",
    requestInfo: "طلب معلومات",
    makeOffer: "تقديم عرض",
    upsell: "يمكننا مشاركة التفاصيل الكاملة بعد الاشتراك.",
  },
};

const DEFAULT_CONVERSATIONS = [
  {
    id: "listing-mk-101",
    type: "listing",
    title: "B2B Logistics SaaS",
    subtitle: "Saudi Arabia",
    unread: true,
    updatedAt: new Date().toISOString(),
    messages: [
      {
        id: "msg-1",
        from: "seller",
        text: "Thanks for your interest. Happy to share verified metrics.",
        createdAt: new Date().toISOString(),
      },
    ],
  },
  {
    id: "partner-pt-202",
    type: "partner",
    title: "Arabic Creator Commerce",
    subtitle: "Co-founder",
    unread: false,
    updatedAt: new Date().toISOString(),
    messages: [
      {
        id: "msg-2",
        from: "partner",
        text: "Can we schedule a quick intro call this week?",
        createdAt: new Date().toISOString(),
      },
    ],
  },
];

const ensureConversation = (conversations, conversation) => {
  const exists = conversations.some((item) => String(item.id) === String(conversation.id));
  if (exists) return conversations;
  return [conversation, ...conversations];
};

const markConversationAsRead = (conversations, conversationId) =>
  conversations.map((conversation) =>
    String(conversation.id) === String(conversationId)
      ? { ...conversation, unread: false }
      : conversation
  );

const syncConversationToAdminStore = (conversation, currentUserId = "guest-user") => {
  if (!conversation?.id) return;
  const otherParticipantId = "user-sample-2";
  const safeMessages = Array.isArray(conversation.messages)
    ? conversation.messages.map((message, index) => ({
        id: message.id || `msg-${conversation.id}-${index}`,
        senderId:
          message.from === "me" || message.senderId === currentUserId
            ? currentUserId
            : otherParticipantId,
        text: message.text || "",
        createdAt: message.createdAt || new Date().toISOString(),
      }))
    : [];

  upsertAdminConversation({
    id: String(conversation.id),
    listingId: conversation.type === "listing" ? String(conversation.id).replace("listing-", "") : null,
    participants: [currentUserId, otherParticipantId],
    reports: 0,
    status: "active",
    messages: safeMessages,
    lastMessageAt:
      safeMessages[safeMessages.length - 1]?.createdAt ||
      conversation.updatedAt ||
      new Date().toISOString(),
  });
};

export default function Messages({ language = "EN" }) {
  const text = TEXT[language] || TEXT.EN;
  const isArabic = language === "AR";
  const locale = isArabic ? "ar-SA" : "en-US";
  const { planRole, user } = useAuth();
  const [searchParams] = useSearchParams();
  const location = useLocation();

  const [listingMap, setListingMap] = useState(() => {
    const items = getAllMarketplaceListings(DEFAULT_LISTINGS);
    return Object.fromEntries(items.map((item) => [String(item.id), item]));
  });

  const [partnerMap, setPartnerMap] = useState(() => {
    const items = getAllPartnerPosts(PARTNER_POSTS);
    return Object.fromEntries(items.map((item) => [String(item.id), item]));
  });

  const [conversations, setConversations] = useState(() =>
    getMarketplaceConversations(DEFAULT_CONVERSATIONS)
  );
  const [activeId, setActiveId] = useState(() =>
    getMarketplaceConversations(DEFAULT_CONVERSATIONS)[0]?.id || ""
  );
  const [query, setQuery] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const refresh = () => {
      const listings = getAllMarketplaceListings(DEFAULT_LISTINGS);
      const partners = getAllPartnerPosts(PARTNER_POSTS);
      setListingMap(Object.fromEntries(listings.map((item) => [String(item.id), item])));
      setPartnerMap(Object.fromEntries(partners.map((item) => [String(item.id), item])));
      const nextConversations = getMarketplaceConversations(DEFAULT_CONVERSATIONS);
      setConversations(nextConversations);
      setActiveId((current) => current || nextConversations[0]?.id || "");
      nextConversations.forEach((conversation) => {
        syncConversationToAdminStore(conversation, user?.id || "guest-user");
      });
    };

    refresh();

    window.addEventListener(marketplaceEvents.conversations, refresh);
    window.addEventListener(marketplaceEvents.listings, refresh);
    window.addEventListener(marketplaceEvents.partnerPosts, refresh);
    window.addEventListener("storage", refresh);

    return () => {
      window.removeEventListener(marketplaceEvents.conversations, refresh);
      window.removeEventListener(marketplaceEvents.listings, refresh);
      window.removeEventListener(marketplaceEvents.partnerPosts, refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  useEffect(() => {
    const listingId = searchParams.get("listing");
    const partnerId = searchParams.get("partner");
    const intent = searchParams.get("intent");
    const legacyListingId = location.state?.listingId;
    const legacyPartnerTitle = location.state?.partnerTitle;
    const legacyPartnerSubtitle = location.state?.partnerSubtitle;

    if (!listingId && !partnerId && !legacyListingId && !legacyPartnerTitle) {
      return;
    }

    setConversations((prev) => {
      let next = [...prev];

      if (listingId && listingMap[String(listingId)]) {
        const listing = listingMap[String(listingId)];
        const title = listing[`title${language}`] || listing.titleEN;
        const conversation = {
          id: `listing-${listingId}`,
          type: "listing",
          title,
          subtitle: listing.country,
          unread: false,
          updatedAt: new Date().toISOString(),
          messages: [
            {
              id: `seed-${Date.now()}`,
              from: "seller",
              text:
                language === "AR"
                  ? "مرحبًا، يسعدني مشاركة معلومات إضافية حول المشروع."
                  : "Hello, happy to share more details about the business.",
              createdAt: new Date().toISOString(),
            },
          ],
        };
        next = ensureConversation(next, conversation);
        setActiveId(conversation.id);

        if (intent === "request-info") {
          setMessage(
            language === "AR"
              ? "مرحبًا، أرغب بطلب معلومات إضافية وبيانات موثقة."
              : "Hi, I would like to request additional details and verified metrics."
          );
        }

        if (intent === "make-offer") {
          setMessage(
            language === "AR"
              ? "مرحبًا، أود تقديم عرض جاد. هل يمكن مشاركة الخطوات التالية؟"
              : "Hi, I would like to make a serious offer. Can you share next steps?"
          );
        }
      }

      if (legacyListingId && listingMap[String(legacyListingId)]) {
        const listing = listingMap[String(legacyListingId)];
        const title = listing[`title${language}`] || listing.titleEN;
        const conversation = {
          id: `listing-${legacyListingId}`,
          type: "listing",
          title,
          subtitle: listing.country,
          unread: false,
          updatedAt: new Date().toISOString(),
          messages: [
            {
              id: `legacy-seed-${Date.now()}`,
              from: "seller",
              text:
                language === "AR"
                  ? "مرحبًا، يسعدنا الرد على استفساراتك."
                  : "Hi, happy to answer your questions.",
              createdAt: new Date().toISOString(),
            },
          ],
        };
        next = ensureConversation(next, conversation);
        setActiveId(conversation.id);
      }

      if (partnerId && partnerMap[String(partnerId)]) {
        const partner = partnerMap[String(partnerId)];
        const conversation = {
          id: `partner-${partnerId}`,
          type: "partner",
          title: partner.projectName,
          subtitle: partner.roleNeeded,
          unread: false,
          updatedAt: new Date().toISOString(),
          messages: [
            {
              id: `seed-${Date.now()}`,
              from: "partner",
              text:
                language === "AR"
                  ? "مرحبًا، شكرًا لاهتمامك. يمكننا مشاركة تفاصيل الدور فورًا."
                  : "Hi, thanks for your interest. We can share role details right away.",
              createdAt: new Date().toISOString(),
            },
          ],
        };
        next = ensureConversation(next, conversation);
        setActiveId(conversation.id);
      }

      if (legacyPartnerTitle) {
        const conversation = {
          id: `partner-legacy-${legacyPartnerTitle}`,
          type: "partner",
          title: legacyPartnerTitle,
          subtitle:
            legacyPartnerSubtitle ||
            (language === "AR" ? "طلب شراكة" : "Partnership request"),
          unread: false,
          updatedAt: new Date().toISOString(),
          messages: [
            {
              id: `legacy-partner-seed-${Date.now()}`,
              from: "partner",
              text:
                language === "AR"
                  ? "مرحبًا، نقدر اهتمامك بالتواصل."
                  : "Hi, thanks for your interest in connecting.",
              createdAt: new Date().toISOString(),
            },
          ],
        };
        next = ensureConversation(next, conversation);
        setActiveId(conversation.id);
      }

      saveConversations(next);
      next.forEach((conversation) => {
        syncConversationToAdminStore(conversation, user?.id || "guest-user");
      });
      return next;
    });
  }, [language, listingMap, location.state, partnerMap, searchParams, user?.id]);

  useEffect(() => {
    if (!activeId) return;
    setConversations((prev) => {
      const next = markConversationAsRead(prev, activeId);
      saveConversations(next);
      return next;
    });
  }, [activeId]);

  const filteredConversations = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return conversations;
    return conversations.filter((conversation) =>
      [conversation.title, conversation.subtitle, conversation.type]
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  }, [conversations, query]);

  const activeConversation = useMemo(
    () => conversations.find((conversation) => conversation.id === activeId),
    [activeId, conversations]
  );

  const sendMessage = () => {
    if (!activeConversation || !message.trim()) return;

    const nextMessage = {
      id: `msg-${Date.now()}`,
      from: "me",
      text: message.trim(),
      createdAt: new Date().toISOString(),
    };

    setConversations((prev) => {
      const next = prev.map((conversation) =>
        conversation.id === activeConversation.id
          ? {
              ...conversation,
              messages: [...(conversation.messages || []), nextMessage],
              updatedAt: new Date().toISOString(),
              unread: false,
            }
          : conversation
      );
      saveConversations(next);
      const changed = next.find((conversation) => conversation.id === activeConversation.id);
      if (changed) {
        syncConversationToAdminStore(changed, user?.id || "guest-user");
      }
      return next;
    });

    setMessage("");
  };

  return (
    <section className="market-page messages-page">
      <div className="container market-page-header">
        <div>
          <h1>{text.title}</h1>
          <p className="muted">{text.subtitle}</p>
        </div>
      </div>

      <div className="container messages-layout">
        <aside className="messages-sidebar">
          <label className="sr-only" htmlFor="messages-search">
            {text.search}
          </label>
          <input
            id="messages-search"
            type="search"
            placeholder={text.search}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          <div className="messages-thread-list">
            {filteredConversations.map((conversation) => (
              <button
                key={conversation.id}
                className={`messages-thread-item ${
                  conversation.id === activeId ? "active" : ""
                }`}
                type="button"
                onClick={() => setActiveId(conversation.id)}
              >
                <div>
                  <strong>{conversation.title}</strong>
                  <span className="muted">
                    {conversation.type === "listing" ? text.listing : text.partner} · {" "}
                    {conversation.subtitle}
                  </span>
                </div>
                {conversation.unread ? <span className="inbox-dot" /> : null}
              </button>
            ))}
          </div>
        </aside>

        <div className="messages-chat-panel">
          {!activeConversation ? (
            <div className="messages-empty">
              <p className="muted">{text.empty}</p>
            </div>
          ) : (
            <>
              <header className="messages-chat-header">
                <div>
                  <h2>{activeConversation.title}</h2>
                  <p className="muted">{activeConversation.subtitle}</p>
                </div>
                <span className="pill">
                  {activeConversation.type === "listing" ? text.listing : text.partner}
                </span>
              </header>

              <div className="messages-chat-body">
                {(activeConversation.messages || []).map((chatMessage) => (
                  <article
                    key={chatMessage.id}
                    className={`messages-bubble ${
                      chatMessage.from === "me" ? "mine" : ""
                    }`}
                  >
                    <p>{chatMessage.text}</p>
                    <small>
                      {new Date(chatMessage.createdAt).toLocaleString(locale, {
                        hour: "2-digit",
                        minute: "2-digit",
                        month: "short",
                        day: "numeric",
                      })}
                    </small>
                  </article>
                ))}
              </div>

              {planRole === "free" ? (
                <div className="messages-upsell">
                  <p>{text.upsell}</p>
                </div>
              ) : null}

              <div className="messages-composer">
                <input
                  type="text"
                  placeholder={text.placeholder}
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      sendMessage();
                    }
                  }}
                />
                <button className="btn btn-dark" type="button" onClick={sendMessage}>
                  {text.send}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
