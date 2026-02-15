import { createId, nowIso, readJSON, upsertById, writeJSON } from "./storageService";

export const ADMIN_EMAIL = "sharkmkt@sharkmkt.io";

const USERS_KEY = "sm-users-db-v1";
const USER_EVENTS = {
  changed: "sm-users-db-update",
};

const seedUsers = () => [
  {
    id: "user-admin",
    email: ADMIN_EMAIL,
    role: "admin",
    firstName: "SharkMKT",
    lastName: "Admin",
    country: "Saudi Arabia",
    city: "Riyadh",
    phoneCode: "+966",
    phoneNumber: "",
    accountType: "admin",
    interests: ["Marketplace"],
    budgetMin: "",
    budgetMax: "",
    onboardingCompleted: true,
    createdAt: nowIso(),
  },
  {
    id: "user-sample-1",
    email: "fahad@sample.sa",
    role: "user",
    firstName: "Fahad",
    lastName: "Alqahtani",
    country: "Saudi Arabia",
    city: "Riyadh",
    phoneCode: "+966",
    phoneNumber: "555123456",
    accountType: "buyer",
    interests: ["SaaS", "AI"],
    budgetMin: "20000",
    budgetMax: "120000",
    onboardingCompleted: true,
    createdAt: nowIso(),
  },
  {
    id: "user-sample-2",
    email: "mona@sample.sa",
    role: "user",
    firstName: "Mona",
    lastName: "Saleh",
    country: "United Arab Emirates",
    city: "Dubai",
    phoneCode: "+971",
    phoneNumber: "500222333",
    accountType: "seller",
    interests: ["E-commerce", "Marketplace"],
    budgetMin: "",
    budgetMax: "",
    onboardingCompleted: true,
    createdAt: nowIso(),
  },
];

const emitChanged = () => {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(USER_EVENTS.changed));
};

export const usersEvents = USER_EVENTS;

export const getUsers = () => {
  const stored = readJSON(USERS_KEY, null);
  if (!Array.isArray(stored) || stored.length === 0) {
    const seeded = seedUsers();
    writeJSON(USERS_KEY, seeded);
    return seeded;
  }
  return stored;
};

export const saveUsers = (users) => {
  const safeUsers = Array.isArray(users) ? users : [];
  writeJSON(USERS_KEY, safeUsers);
  emitChanged();
  return safeUsers;
};

export const getUserById = (id) =>
  getUsers().find((user) => String(user.id) === String(id)) || null;

export const getUserByEmail = (email) => {
  const normalized = String(email || "").trim().toLowerCase();
  return getUsers().find((user) => String(user.email || "").toLowerCase() === normalized) || null;
};

export const upsertUser = (userInput) => {
  const existing = userInput?.id ? getUserById(userInput.id) : null;
  const createdAt = existing?.createdAt || nowIso();
  const base = {
    id: userInput?.id || createId("user"),
    email: userInput?.email || "",
    role:
      String(userInput?.email || "").trim().toLowerCase() === ADMIN_EMAIL
        ? "admin"
        : userInput?.role || "user",
    firstName: userInput?.firstName || "",
    lastName: userInput?.lastName || "",
    country: userInput?.country || "",
    city: userInput?.city || "",
    phoneCode: userInput?.phoneCode || "+966",
    phoneNumber: userInput?.phoneNumber || "",
    accountType: userInput?.accountType || "",
    interests: Array.isArray(userInput?.interests) ? userInput.interests : [],
    budgetMin: userInput?.budgetMin || "",
    budgetMax: userInput?.budgetMax || "",
    onboardingCompleted: Boolean(userInput?.onboardingCompleted),
    createdAt,
  };

  const next = upsertById(getUsers(), base);
  saveUsers(next);
  return base;
};

export const ensureUserForAuth = ({ id, email }) => {
  if (!id || !email) return null;
  const isAdminEmail = String(email).trim().toLowerCase() === ADMIN_EMAIL;
  const byId = getUserById(id);
  if (byId) {
    const adminRole = isAdminEmail ? "admin" : "user";
    if (byId.role !== adminRole) {
      return upsertUser({
        ...byId,
        role: adminRole,
        onboardingCompleted: adminRole === "admin" ? true : byId.onboardingCompleted,
        email,
      });
    }
    if (adminRole === "admin" && !byId.onboardingCompleted) {
      return upsertUser({ ...byId, onboardingCompleted: true, email });
    }
    return byId;
  }

  const byEmail = getUserByEmail(email);
  if (byEmail) {
    return upsertUser({
      ...byEmail,
      id,
      email,
      role: isAdminEmail ? "admin" : byEmail.role,
      onboardingCompleted: isAdminEmail ? true : byEmail.onboardingCompleted,
    });
  }

  return upsertUser({
    id,
    email,
    role: isAdminEmail ? "admin" : "user",
    onboardingCompleted: isAdminEmail,
  });
};

export const setOnboardingCompleted = (userId, completed, patch = {}) => {
  const current = getUserById(userId);
  if (!current) return null;
  return upsertUser({
    ...current,
    ...patch,
    onboardingCompleted: Boolean(completed),
  });
};

export const getUserStats = () => {
  const users = getUsers();
  const weekAgo = Date.now() - 1000 * 60 * 60 * 24 * 7;
  const newUsersLast7Days = users.filter((user) => {
    const createdAt = new Date(user.createdAt || 0).getTime();
    return Number.isFinite(createdAt) && createdAt >= weekAgo;
  }).length;

  return {
    totalUsers: users.length,
    newUsersLast7Days,
  };
};
