"use client";

import * as React from "react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "REDAKTEUR" | "VORSTAND" | "MITGLIED" | "MODERATOR";
}

interface AuthContextValue {
  user: AdminUser | null;
  accessToken: string | null;
  loading: boolean;
  login: (email: string, password: string, totpCode?: string) => Promise<{ requiresTwoFactor?: boolean }>;
  logout: () => Promise<void>;
  adminFetch: <T>(path: string, init?: RequestInit) => Promise<T>;
}

const AuthContext = React.createContext<AuthContextValue | null>(null);

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<AdminUser | null>(null);
  const [accessToken, setAccessToken] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);
  const accessTokenRef = React.useRef<string | null>(null);

  const setToken = React.useCallback((token: string | null) => {
    accessTokenRef.current = token;
    setAccessToken(token);
  }, []);

  const rawFetch = React.useCallback(async (path: string, init?: RequestInit) => {
    return fetch(`${API_BASE_URL}${path}`, {
      ...init,
      credentials: "include",
      headers: { "Content-Type": "application/json", ...init?.headers },
    });
  }, []);

  const refresh = React.useCallback(async () => {
    const res = await rawFetch("/api/auth/refresh", { method: "POST" });
    if (!res.ok) {
      setToken(null);
      setUser(null);
      return null;
    }
    const data = await res.json();
    setToken(data.accessToken);
    return data.accessToken as string;
  }, [rawFetch, setToken]);

  const adminFetch = React.useCallback(
    async <T,>(path: string, init?: RequestInit): Promise<T> => {
      let token = accessTokenRef.current;
      let res = await rawFetch(path, {
        ...init,
        headers: { ...init?.headers, ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      });

      if (res.status === 401) {
        token = await refresh();
        if (token) {
          res = await rawFetch(path, {
            ...init,
            headers: { ...init?.headers, Authorization: `Bearer ${token}` },
          });
        }
      }

      if (!res.ok) {
        const body = await res.json().catch(() => ({ error: res.statusText }));
        throw new Error(body.error ?? "Anfrage fehlgeschlagen");
      }
      if (res.status === 204) return undefined as T;
      return res.json() as Promise<T>;
    },
    [rawFetch, refresh],
  );

  const login = React.useCallback(
    async (email: string, password: string, totpCode?: string) => {
      const res = await rawFetch("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password, totpCode }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Login fehlgeschlagen");
      if (data.requiresTwoFactor) return { requiresTwoFactor: true };

      setToken(data.accessToken);
      setUser(data.user);
      return {};
    },
    [rawFetch, setToken],
  );

  const logout = React.useCallback(async () => {
    await rawFetch("/api/auth/logout", { method: "POST" });
    setToken(null);
    setUser(null);
  }, [rawFetch, setToken]);

  React.useEffect(() => {
    (async () => {
      const token = await refresh();
      if (token) {
        try {
          const res = await fetch(`${API_BASE_URL}/api/auth/me`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (res.ok) setUser(await res.json());
        } catch {
          // ignore, user stays logged out
        }
      }
      setLoading(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <AuthContext.Provider value={{ user, accessToken, loading, login, logout, adminFetch }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAdminAuth() {
  const ctx = React.useContext(AuthContext);
  if (!ctx) throw new Error("useAdminAuth must be used within AdminAuthProvider");
  return ctx;
}
