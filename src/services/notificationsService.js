import { createId, nowIso, readJSON, writeJSON } from "./storageService";
import { ADMIN_EMAIL } from "./usersService";

const ADMIN_KEY = "sm-admin-notifications-db-v1";
const USER_KEY = "sm-user-notifications-db-v1";
const EVENTS = {
  changed: "sm-admin-notifications-update",
  adminChanged: "sm-admin-notifications-update",
  userChanged: "sm-user-notifications-update",
};

const emit = (eventName) => {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(eventName));
};

export const notificationsEvents = EVENTS;

export const getAdminNotifications = () => {
  const stored = readJSON(ADMIN_KEY, []);
  return Array.isArray(stored) ? stored : [];
};

export const saveAdminNotifications = (notifications) => {
  const safe = Array.isArray(notifications) ? notifications : [];
  writeJSON(ADMIN_KEY, safe);
  emit(EVENTS.adminChanged);
  return safe;
};

export const notifyAdmin = ({ type, title, message, refId }) => {
  const nextItem = {
    id: createId("notify"),
    toEmail: ADMIN_EMAIL,
    type: type || "general",
    title: title || "",
    message: message || "",
    refId: refId || null,
    createdAt: nowIso(),
    read: false,
  };
  const next = [nextItem, ...getAdminNotifications()];
  saveAdminNotifications(next);
  return nextItem;
};

export const markNotificationRead = (notificationId) => {
  const next = getAdminNotifications().map((item) =>
    String(item.id) === String(notificationId) ? { ...item, read: true } : item
  );
  saveAdminNotifications(next);
  return next;
};

export const getUserNotifications = (userId) => {
  const all = readJSON(USER_KEY, []);
  const safe = Array.isArray(all) ? all : [];
  if (!userId) return [];
  return safe
    .filter((item) => String(item.userId) === String(userId))
    .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
};

export const saveUserNotifications = (notifications) => {
  const safe = Array.isArray(notifications) ? notifications : [];
  writeJSON(USER_KEY, safe);
  emit(EVENTS.userChanged);
  return safe;
};

export const notifyUser = ({ userId, type, title, message, refId, meta }) => {
  if (!userId) return null;
  const nextItem = {
    id: createId("notify-user"),
    userId: String(userId),
    type: type || "general",
    title: title || "",
    message: message || "",
    refId: refId || null,
    meta: meta && typeof meta === "object" ? meta : {},
    createdAt: nowIso(),
    read: false,
  };
  const all = readJSON(USER_KEY, []);
  const safe = Array.isArray(all) ? all : [];
  const next = [nextItem, ...safe];
  saveUserNotifications(next);
  return nextItem;
};

export const markUserNotificationRead = (notificationId, userId) => {
  if (!userId) return [];
  const all = readJSON(USER_KEY, []);
  const safe = Array.isArray(all) ? all : [];
  const next = safe.map((item) => {
    if (String(item.userId) !== String(userId)) return item;
    if (String(item.id) !== String(notificationId)) return item;
    return { ...item, read: true };
  });
  saveUserNotifications(next);
  return getUserNotifications(userId);
};
