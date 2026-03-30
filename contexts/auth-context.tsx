"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  joinedAt: string;
  bio?: string;
  city?: string;
  interests?: string[];
};

type StoredUser = AuthUser & { passwordHash: string };

type AuthContextValue = {
  isLoggedIn: boolean;
  isLoading: boolean;
  user: AuthUser | null;
  hydrated: boolean;
  login: (
    email: string,
    password: string,
  ) => Promise<{ success: boolean; error?: string }>;
  signup: (
    name: string,
    email: string,
    password: string,
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateProfile: (data: Partial<AuthUser>) => void;
};

const USERS_KEY = "synlo_users";
// Session key required by your instructions
const CURRENT_USER_KEY = "currentUser";

const AuthContext = createContext<AuthContextValue | null>(null);

function safeParse<T>(value: string | null, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

function getUsers(): Record<string, StoredUser> {
  if (typeof window === "undefined") return {};
  return safeParse<Record<string, StoredUser>>(
    window.localStorage.getItem(USERS_KEY),
    {},
  );
}

function saveUsers(users: Record<string, StoredUser>) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function hashPassword(password: string): string {
  let hash = 0;
  for (let i = 0; i < password.length; i += 1) {
    const char = password.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return hash.toString(36);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    if (typeof window === "undefined") return null;
    return safeParse<AuthUser | null>(
      window.localStorage.getItem(CURRENT_USER_KEY),
      null,
    );
  });

  const [isLoading] = useState(() => typeof window === "undefined");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    // We intentionally flip a simple boolean after mount to avoid
    // SSR/CSR mismatches while keeping initial markup stable.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHydrated(true);
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      const users = getUsers();
      const found = Object.values(users).find(
        (u) => u.email.toLowerCase() === email.toLowerCase(),
      );

      if (!found) {
        return { success: false, error: "No account found with that email." };
      }

      if (found.passwordHash !== hashPassword(password)) {
        return { success: false, error: "Incorrect password." };
      }

      const { passwordHash, ...publicUser } = found;
      void passwordHash;
      if (typeof window !== "undefined") {
        window.localStorage.setItem(
          CURRENT_USER_KEY,
          JSON.stringify(publicUser),
        );
      }
      setUser(publicUser);
      return { success: true };
    },
    [],
  );

  const signup = useCallback(
    async (name: string, email: string, password: string) => {
      const cleanName = name.trim();
      const users = getUsers();

      const exists = Object.values(users).some(
        (u) => u.email.toLowerCase() === email.toLowerCase(),
      );
      if (exists) {
        return {
          success: false,
          error: "An account with that email already exists.",
        };
      }

      const id = `user_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
      const now = new Date().toISOString();

      const storedUser: StoredUser = {
        id,
        name: cleanName || email.split("@")[0],
        email,
        joinedAt: now,
        passwordHash: hashPassword(password),
      };

      const nextUsers = { ...users, [id]: storedUser };
      saveUsers(nextUsers);

      const { passwordHash, ...publicUser } = storedUser;
      void passwordHash;
      if (typeof window !== "undefined") {
        window.localStorage.setItem(
          CURRENT_USER_KEY,
          JSON.stringify(publicUser),
        );
      }
      setUser(publicUser);

      return { success: true };
    },
    [],
  );

  const logout = useCallback(() => {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(CURRENT_USER_KEY);
    }
    setUser(null);
  }, []);

  const updateProfile = useCallback((data: Partial<AuthUser>) => {
    setUser((prev) => {
      if (!prev) return prev;
      const updated: AuthUser = { ...prev, ...data };

      if (typeof window !== "undefined") {
        const users = getUsers();
        const existing = Object.values(users).find((u) => u.id === prev.id);
        if (existing) {
          const nextUsers: Record<string, StoredUser> = { ...users };
          nextUsers[existing.id] = { ...existing, ...data };
          saveUsers(nextUsers);
        }
        window.localStorage.setItem(
          CURRENT_USER_KEY,
          JSON.stringify(updated),
        );
      }

      return updated;
    });
  }, []);

  const value = useMemo(
    () => ({
      isLoggedIn: !!user,
      isLoading,
      user,
      hydrated,
      login,
      signup,
      logout,
      updateProfile,
    }),
    [hydrated, isLoading, login, logout, signup, updateProfile, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
