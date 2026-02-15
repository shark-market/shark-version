import { createId, nowIso, readJSON, upsertById, writeJSON } from "./storageService";
import { notifyAdmin } from "./notificationsService";
import { ADMIN_EMAIL } from "./usersService";

const KEY = "sm-help-tickets-db-v1";
const EVENTS = {
  changed: "sm-help-tickets-update",
};

const seedTickets = () => [
  {
    id: "ticket-101",
    userId: "user-sample-1",
    userEmail: "fahad@sample.sa",
    subject: "مشكلة في الوصول للتفاصيل",
    category: "Technical",
    message: "لا أستطيع فتح بعض تفاصيل الإعلان.",
    attachments: [],
    status: "open",
    adminReply: null,
    createdAt: nowIso(),
  },
];

const emitChanged = () => {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(EVENTS.changed));
};

export const ticketsEvents = EVENTS;

export const getTickets = () => {
  const stored = readJSON(KEY, null);
  if (!Array.isArray(stored) || stored.length === 0) {
    const seeded = seedTickets();
    writeJSON(KEY, seeded);
    return seeded;
  }
  return stored;
};

export const saveTickets = (tickets) => {
  const safe = Array.isArray(tickets) ? tickets : [];
  writeJSON(KEY, safe);
  emitChanged();
  return safe;
};

export const createTicket = ({
  userId,
  userEmail,
  subject,
  category,
  message,
  attachments = [],
}) => {
  const ticket = {
    id: createId("ticket"),
    userId: userId || "",
    userEmail: userEmail || "",
    subject: subject || "",
    category: category || "General",
    message: message || "",
    attachments: Array.isArray(attachments) ? attachments : [],
    status: "open",
    adminReply: null,
    createdAt: nowIso(),
  };

  const next = upsertById(getTickets(), ticket);
  saveTickets(next);

  notifyAdmin({
    type: "ticket_created",
    title: "New Help Ticket",
    message: `${ticket.subject} (${ticket.userEmail})`,
    refId: ticket.id,
  });

  return ticket;
};

export const updateTicketStatus = (ticketId, status) => {
  const current = getTickets().find((item) => String(item.id) === String(ticketId));
  if (!current) return null;
  const updated = { ...current, status };
  const next = upsertById(getTickets(), updated);
  saveTickets(next);
  return updated;
};

export const replyToTicket = (ticketId, text, status) => {
  const current = getTickets().find((item) => String(item.id) === String(ticketId));
  if (!current) return null;

  const updated = {
    ...current,
    status: status || current.status || "pending",
    adminReply: {
      text,
      createdAt: nowIso(),
    },
  };

  const next = upsertById(getTickets(), updated);
  saveTickets(next);

  if (updated.userEmail) {
    console.info("[ticketsService] Email provider not configured. Reply stored in DB.", {
      from: ADMIN_EMAIL,
      to: updated.userEmail,
      subject: `Ticket reply: ${updated.subject}`,
    });
  }

  return updated;
};

export const getTicketsStats = () => {
  const tickets = getTickets();
  return {
    totalTickets: tickets.length,
    openTickets: tickets.filter((item) => item.status === "open").length,
  };
};
