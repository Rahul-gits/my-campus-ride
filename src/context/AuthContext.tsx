import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

type UserRole = "student" | "driver" | "admin";

export interface AuthUser {
  id: string;
  username: string;
  email: string;
  role: UserRole;
}

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (params: { email: string; password: string }) => Promise<{ ok: boolean; message?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const STORAGE_KEY = "mcr_auth_state";

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        setUser(parsed.user ?? null);
        setToken(parsed.token ?? null);
      } catch {}
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ user, token })
    );
  }, [user, token]);

  const login: AuthContextValue["login"] = async ({ email, password }) => {
    try {
      const baseUrl = (import.meta as any).env.VITE_API_URL || "/api";
      const res = await fetch(`${baseUrl}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      let data: any = null;
      try {
        data = await res.json();
      } catch {
        // Non-JSON or empty body
        const text = await res.text().catch(() => "");
        if (!res.ok) {
          return { ok: false, message: text || `Login failed (HTTP ${res.status})` };
        }
        return { ok: false, message: "Unexpected server response" };
      }
      if (!res.ok || !data?.success) {
        return { ok: false, message: data?.message || `Login failed (HTTP ${res.status})` };
      }
      const nextUser: AuthUser = data.data.user;
      const nextToken: string = data.data.token;
      setUser(nextUser);
      setToken(nextToken);
      if (nextUser.role === "admin") navigate("/dashboard/admin");
      else if (nextUser.role === "driver") navigate("/dashboard/driver");
      else navigate("/dashboard/student");
      return { ok: true };
    } catch (err: any) {
      return { ok: false, message: err?.message || "Network error" };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem(STORAGE_KEY);
    navigate("/");
  };

  const value = useMemo<AuthContextValue>(
    () => ({ user, token, isAuthenticated: Boolean(user && token), login, logout }),
    [user, token]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};


