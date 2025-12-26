import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase";

const AuthContext = createContext(null);
const MOCK_USER_KEY = "sm-mock-user";
const ROLE_KEY = "sm-role";
const PLAN_INTERVAL_KEY = "sm-plan-interval";
const ADMIN_CREDENTIALS = {
  email: "admin@sharkmarket.com",
  password: "Admin12345",
};

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
  return window.localStorage.getItem(ROLE_KEY) || "";
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
  const [loading, setLoading] = useState(true);
  const [mockUser, setMockUser] = useState(getMockUser);
  const [roleOverride, setRoleOverride] = useState(getStoredRole);
  const [planInterval, setPlanIntervalState] = useState(getStoredPlanInterval);

  useEffect(() => {
    let isMounted = true;
    if (typeof window !== "undefined") {
      const loggedOutFlag = window.localStorage.getItem("sm-logged-out");
      if (loggedOutFlag) {
        clearSupabaseStorage();
        window.localStorage.removeItem("sm-logged-out");
        setSession(null);
        setProfile(null);
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
        }
      } else {
        setProfile(null);
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
        } else {
          setProfile(null);
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
      setMockUser(getMockUser());
      setRoleOverride(getStoredRole());
      setPlanIntervalState(getStoredPlanInterval());
    };
    window.addEventListener("storage", handleUpdate);
    window.addEventListener("sm-mock-auth", handleUpdate);
    window.addEventListener("sm-role-update", handleUpdate);
    return () => {
      window.removeEventListener("storage", handleUpdate);
      window.removeEventListener("sm-mock-auth", handleUpdate);
      window.removeEventListener("sm-role-update", handleUpdate);
    };
  }, []);

  const effectiveUser = mockUser || session?.user || null;
  const effectiveProfile = mockUser
    ? {
        id: mockUser.id,
        email: mockUser.email,
        first_name: "Admin",
        last_name: "User",
        role: "admin",
        subscription_tier: "pro",
      }
    : profile;

  const role = useMemo(() => {
    if (mockUser?.role === "admin") return "admin";
    if (!effectiveUser) return "guest";
    if (roleOverride) return roleOverride;
    if (effectiveProfile?.subscription_tier === "pro") return "pro";
    if (effectiveProfile?.subscription_tier === "plus") return "plus";
    return "free";
  }, [effectiveProfile, effectiveUser, mockUser, roleOverride]);

  const value = useMemo(
    () => ({
      session,
      user: effectiveUser,
      profile: effectiveProfile,
      loading,
      role,
      planInterval,
      refreshProfile: async (userId) => {
        const nextProfile = await fetchProfile(userId);
        setProfile(nextProfile);
        return nextProfile;
      },
      signInMock: (email, password) => {
        if (
          email?.toLowerCase() === ADMIN_CREDENTIALS.email &&
          password === ADMIN_CREDENTIALS.password
        ) {
          const nextMock = {
            id: "admin",
            email: ADMIN_CREDENTIALS.email,
            role: "admin",
          };
          setMockUser(nextMock);
          setRoleOverride("admin");
          if (typeof window !== "undefined") {
            window.localStorage.setItem(MOCK_USER_KEY, JSON.stringify(nextMock));
            window.localStorage.setItem(ROLE_KEY, "admin");
            window.dispatchEvent(new Event("sm-mock-auth"));
          }
          return true;
        }
        return false;
      },
      setRole: (nextRole) => {
        setRoleOverride(nextRole);
        if (typeof window !== "undefined") {
          if (nextRole) {
            window.localStorage.setItem(ROLE_KEY, nextRole);
          } else {
            window.localStorage.removeItem(ROLE_KEY);
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
        setMockUser(null);
        setRoleOverride("");
        if (typeof window !== "undefined") {
          window.localStorage.setItem("sm-logged-out", "1");
          window.localStorage.removeItem(MOCK_USER_KEY);
          window.localStorage.removeItem(ROLE_KEY);
          window.localStorage.removeItem(PLAN_INTERVAL_KEY);
        }
        const { error } = await supabase.auth.signOut({ scope: "global" });
        if (error) {
          console.warn("Logout error:", error.message);
        }
        clearSupabaseStorage();
      },
    }),
    [effectiveProfile, effectiveUser, loading, planInterval, role]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
