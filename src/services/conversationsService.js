import { createId, nowIso, readJSON, upsertById, writeJSON } from "./storageService";

const KEY = "sm-admin-conversations-db-v1";
const EVENTS = {
  changed: "sm-admin-conversations-update",
};

const seedConversations = () => [
  {
    id: "conv-101",
    listingId: "pt-201",
    participants: ["user-sample-1", "user-sample-2"],
    reports: 0,
    status: "active",
    messages: [
      {
        id: "msg-101-1",
        senderId: "user-sample-1",
        text: "مرحبًا، أود معرفة المزيد عن المشروع.",
        createdAt: nowIso(),
      },
      {
        id: "msg-101-2",
        senderId: "user-sample-2",
        text: "أكيد، يمكنني مشاركة التفاصيل الأساسية الآن.",
        createdAt: nowIso(),
      },
    ],
    lastMessageAt: nowIso(),
  },
  {
    id: "conv-102",
    listingId: "pt-205",
    participants: ["user-sample-1", "user-admin"],
    reports: 1,
    status: "active",
    messages: [
      {
        id: "msg-102-1",
        senderId: "user-sample-1",
        text: "تم تقديم بلاغ على هذه المحادثة.",
        createdAt: nowIso(),
      },
    ],
    lastMessageAt: nowIso(),
  },
];

const emitChanged = () => {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(EVENTS.changed));
};

export const conversationsEvents = EVENTS;

export const getConversations = () => {
  const stored = readJSON(KEY, null);
  if (!Array.isArray(stored) || stored.length === 0) {
    const seeded = seedConversations();
    writeJSON(KEY, seeded);
    return seeded;
  }
  return stored;
};

export const saveConversations = (conversations) => {
  const safe = Array.isArray(conversations) ? conversations : [];
  writeJSON(KEY, safe);
  emitChanged();
  return safe;
};

export const upsertConversation = (conversationInput) => {
  const current = conversationInput?.id
    ? getConversations().find((item) => String(item.id) === String(conversationInput.id))
    : null;

  const conversation = {
    id: conversationInput?.id || createId("conv"),
    listingId: conversationInput?.listingId || null,
    participants: Array.isArray(conversationInput?.participants)
      ? conversationInput.participants
      : [],
    reports: Number(conversationInput?.reports || 0),
    status: conversationInput?.status || "active",
    messages: Array.isArray(conversationInput?.messages) ? conversationInput.messages : [],
    lastMessageAt: conversationInput?.lastMessageAt || current?.lastMessageAt || nowIso(),
  };

  const next = upsertById(getConversations(), conversation);
  saveConversations(next);
  return conversation;
};

export const addConversationMessage = (conversationId, senderId, text) => {
  const current = getConversations().find((item) => String(item.id) === String(conversationId));
  if (!current) return null;

  const message = {
    id: createId("msg"),
    senderId,
    text,
    createdAt: nowIso(),
  };

  return upsertConversation({
    ...current,
    messages: [...(current.messages || []), message],
    lastMessageAt: message.createdAt,
  });
};

export const updateConversationStatus = (conversationId, status) => {
  const current = getConversations().find((item) => String(item.id) === String(conversationId));
  if (!current) return null;
  return upsertConversation({
    ...current,
    status,
  });
};

export const getConversationsStats = () => {
  const conversations = getConversations();
  return {
    totalConversations: conversations.length,
  };
};
