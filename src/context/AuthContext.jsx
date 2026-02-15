import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase";
import {
  ADMIN_EMAIL,
  ensureUserForAuth,
  getUserById,
  upsertUser,
  usersEvents,
} from "../services/usersService";

const AuthContext = createContext(null);
const MOCK_USER_KEY = "sm-mock-user";
const ACCESS_ROLE_KEY = "sm-access-role";
const PLAN_INTERVAL_KEY = "sm-plan-interval";
const ADMIN_PASSWORD = "Admin12345";

const clearSupabaseStorage = () => {
  if (typeof window === "undefined") return;
  const clearKeys = (storage) => {
    Object.keys(storage)
      .filter((key) => key.startsWith("sb-") && key.includes("auth-token"))
      .forEach((key) => storage.removeItem(key));
  };
  clearKeys(window.localStorage);
  clearKeys(window.sessionStorage);
};

const fetchProfile = async (userId) => {
  if (!userId) return null;
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();
  if (error) {
    console.warn("Profile fetch error:", error.message);
    return null;
  }
  return data;
};

const getStoredRole = () => {
  if (typeof window === "undefined") return "";
  return window.localStorage.getItem(ACCESS_ROLE_KEY) || "";
};

const getStoredPlanInterval = () => {
  if (typeof window === "undefined") return "monthly";
  return window.localStorage.getItem(PLAN_INTERVAL_KEY) || "monthly";
};

const getMockUser = () => {
  if (typeof window === "undefined") return null;
  const stored = window.localStorage.getItem(MOCK_USER_KEY);
  if (!stored) return null;
  try {
    return JSON.parse(stored);
  } catch (error) {
    return null;
  }
};

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [appUser, setAppUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mockUser, setMockUser] = useState(getMockUser);
  const [accessRole, setAccessRole] = useState(getStoredRole);
  const [planInterval, setPlanIntervalState] = useState(getStoredPlanInterval);

  const ensureAppUserState = (userLike, profileLike = null) => {
    if (!userLike?.id || !userLike?.email) {
      setAppUser(null);
      return null;
    }

    const base = ensureUserForAuth({
      id: userLike.id,
      email: userLike.email,
    });

    if (!base) {
      setAppUser(null);
      return null;
    }

    const hasBasicProfile = Boolean(profileLike?.first_name && profileLike?.last_name);
    const next = upsertUser({
      ...base,
      email: userLike.email,
      firstName: base.firstName || profileLike?.first_name || "",
      lastName: base.lastName || profileLike?.last_name || "",
      country: base.country || profileLike?.country || "",
      city: base.city || profileLike?.company_name || "",
      phoneCode: base.phoneCode || "+966",
      phoneNumber:
        base.phoneNumber ||
        String(profileLike?.phone || "")
          .replace(/[^\d]/g, "")
          .slice(-12),
      onboardingCompleted: base.onboardingCompleted || hasBasicProfile,
    });

    setAppUser(next);
    return next;
  };

  useEffect(() => {
    let isMounted = true;
    if (typeof window !== "undefined") {
      const loggedOutFlag = window.localStorage.getItem("sm-logged-out");
      if (loggedOutFlag) {
        clearSupabaseStorage();
        window.localStorage.removeItem("sm-logged-out");
        setSession(null);
        setProfile(null);
        setAppUser(null);
        setLoading(false);
        return () => {
          isMounted = false;
        };
      }
    }

    supabase.auth.getSession().then(async ({ data }) => {
      if (!isMounted) return;
      const nextSession = data.session || null;
      setSession(nextSession);
      if (nextSession?.user) {
        const nextProfile = await fetchProfile(nextSession.user.id);
        if (isMounted) {
          setProfile(nextProfile);
          ensureAppUserState(nextSession.user, nextProfile);
        }
      } else {
        setProfile(null);
        setAppUser(null);
      }
      if (isMounted) {
        setLoading(false);
      }
    });

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (_event, nextSession) => {
        setSession(nextSession || null);
        if (nextSession?.user) {
          const nextProfile = await fetchProfile(nextSession.user.id);
          setProfile(nextProfile);
          ensureAppUserState(nextSession.user, nextProfile);
        } else {
          setProfile(null);
          setAppUser(null);
        }
        setLoading(false);
      }
    );

    return () => {
      isMounted = false;
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleUpdate = () => {
      const nextMock = getMockUser();
      const nextRole = getStoredRole();
      const nextInterval = getStoredPlanInterval();

      setMockUser(nextMock);
      setAccessRole(nextRole);
      setPlanIntervalState(nextInterval);

      const sourceUser =
        nextMock || (session?.user?.id && session?.user?.email ? session.user : null);

      if (!sourceUser?.id) {
        setAppUser(null);
        return;
      }

      const fresh = getUserById(sourceUser.id);
      if (fresh) {
        setAppUser(fresh);
        return;
      }

      if (sourceUser.email) {
        const created = ensureUserForAuth({
          id: sourceUser.id,
          email: sourceUser.email,
        });
        if (created) setAppUser(created);
      }
    };

    handleUpdate();
    window.addEventListener("storage", handleUpdate);
    window.addEventListener("sm-mock-auth", handleUpdate);
    window.addEventListener("sm-role-update", handleUpdate);
    window.addEventListener(usersEvents.changed, handleUpdate);
    return () => {
      window.removeEventListener("storage", handleUpdate);
      window.removeEventListener("sm-mock-auth", handleUpdate);
      window.removeEventListener("sm-role-update", handleUpdate);
      window.removeEventListener(usersEvents.changed, handleUpdate);
    };
  }, [session?.user?.email, session?.user?.id]);

  const effectiveUser = mockUser || session?.user || null;
  const effectiveProfile = mockUser
    ? {
        id: mockUser.id,
        email: mockUser.email,
        first_name: "Admin",
        last_name: "User",
        role: "admin",
        subscription_tier: "pro",
        onboarding_completed: true,
      }
    : profile;

  const role = useMemo(() => {
    if (!effectiveUser?.email) return "guest";
    if (appUser?.role === "admin") return "admin";
    if (String(effectiveUser.email).trim().toLowerCase() === ADMIN_EMAIL) {
      return "admin";
    }
    return "user";
  }, [appUser?.role, effectiveUser]);

  const planRole = useMemo(() => {
    if (role === "admin") return "admin";
    if (accessRole) return accessRole;
    if (effectiveProfile?.subscription_tier === "pro") return "pro";
    if (effectiveProfile?.subscription_tier === "plus") return "plus";
    return "free";
  }, [accessRole, effectiveProfile?.subscription_tier, role]);

  const onboardingCompleted = Boolean(
    appUser?.onboardingCompleted || effectiveProfile?.onboarding_completed
  );

  const value = useMemo(
    () => ({
      session,
      user: effectiveUser,
      profile: effectiveProfile,
      appUser,
      loading,
      role,
      planRole,
      onboardingCompleted,
      planInterval,
      refreshProfile: async (userId) => {
        const nextProfile = await fetchProfile(userId);
        setProfile(nextProfile);
        if (effectiveUser?.id === userId) {
          ensureAppUserState(effectiveUser, nextProfile);
        }
        return nextProfile;
      },
      signInMock: (email, password) => {
        if (
          email?.toLowerCase() === ADMIN_EMAIL &&
          password === ADMIN_PASSWORD
        ) {
          const nextMock = {
            id: "admin",
            email: ADMIN_EMAIL,
            role: "admin",
          };
          setMockUser(nextMock);
          setAccessRole("admin");
          ensureAppUserState(nextMock, {
            first_name: "Admin",
            last_name: "User",
            onboarding_completed: true,
          });
          if (typeof window !== "undefined") {
            window.localStorage.setItem(MOCK_USER_KEY, JSON.stringify(nextMock));
            window.localStorage.setItem(ACCESS_ROLE_KEY, "admin");
            window.dispatchEvent(new Event("sm-mock-auth"));
          }
          return true;
        }
        return false;
      },
      setRole: (nextRole) => {
        setAccessRole(nextRole);
        if (typeof window !== "undefined") {
          if (nextRole) {
            window.localStorage.setItem(ACCESS_ROLE_KEY, nextRole);
          } else {
            window.localStorage.removeItem(ACCESS_ROLE_KEY);
          }
          window.dispatchEvent(new Event("sm-role-update"));
        }
      },
      setPlanInterval: (nextInterval) => {
        setPlanIntervalState(nextInterval);
        if (typeof window !== "undefined") {
          window.localStorage.setItem(PLAN_INTERVAL_KEY, nextInterval);
          window.dispatchEvent(new Event("sm-role-update"));
        }
      },
      signOut: async () => {
        setSession(null);
        setProfile(null);
        setAppUser(null);
        setMockUser(null);
        setAccessRole("");
        if (typeof window !== "undefined") {
          window.localStorage.setItem("sm-logged-out", "1");
          window.localStorage.removeItem(MOCK_USER_KEY);
          window.localStorage.removeItem(ACCESS_ROLE_KEY);
          window.localStorage.removeItem(PLAN_INTERVAL_KEY);
        }
        const { error } = await supabase.auth.signOut({ scope: "global" });
        if (error) {
          console.warn("Logout error:", error.message);
        }
        clearSupabaseStorage();
      },
    }),
    [
      appUser,
      effectiveProfile,
      effectiveUser,
      loading,
      onboardingCompleted,
      planInterval,
      planRole,
      role,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
