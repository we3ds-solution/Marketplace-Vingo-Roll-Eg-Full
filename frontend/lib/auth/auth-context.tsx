"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

export type AuthUser = {
  id: string;
  email: string;
  displayName: string;
  roles: string[];
  vendorApplicationStatus?: string | null;
};

export type AuthStatus = "loading" | "authenticated" | "unauthenticated";

type AuthContextValue = {
  user: AuthUser | null;
  accessToken: string | null;
  status: AuthStatus;
  isAdmin: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (
    displayName: string,
    email: string,
    password: string,
    accountType?: "client" | "vendor",
    vendor?: { companyName: string; message?: string },
  ) => Promise<void>;
  signOut: () => Promise<void>;
  authedFetch: <T = unknown>(path: string, options?: RequestInit) => Promise<T>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";

/** Access tokens live in memory only — never localStorage. Refresh via HttpOnly cookie. */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [status, setStatus] = useState<AuthStatus>("loading");
  const tokenRef = useRef<string | null>(null);

  const applyAuth = useCallback((payload: { accessToken: string; user: AuthUser }) => {
    tokenRef.current = payload.accessToken;
    setAccessToken(payload.accessToken);
    setUser(payload.user);
    setStatus("authenticated");
  }, []);

  const clearAuth = useCallback(() => {
    tokenRef.current = null;
    setAccessToken(null);
    setUser(null);
    setStatus("unauthenticated");
  }, []);

  // Silent refresh on mount — the HttpOnly cookie does the talking.
  useEffect(() => {
    let cancelled = false;

    const restore = async () => {
      try {
        const response = await fetch(`${API_URL}/api/v1/auth/refresh`, {
          method: "POST",
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error("No active session");
        }

        const payload = (await response.json()) as { accessToken: string; user: AuthUser };
        if (!cancelled) applyAuth(payload);
      } catch {
        if (!cancelled) clearAuth();
      }
    };

    void restore();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const authenticate = useCallback(
    async (path: string, body: Record<string, string>) => {
      const response = await fetch(`${API_URL}${path}`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const text = await response.text();
      const payload = text ? JSON.parse(text) : null;

      if (!response.ok) {
        const message = payload?.error ?? "Something went wrong — please try again.";
        const error = new Error(message) as Error & { status?: number; errors?: Record<string, string[]> };
        error.status = response.status;
        error.errors = payload?.errors;
        throw error;
      }

      applyAuth(payload);
    },
    [applyAuth],
  );

  const signIn = useCallback(
    (email: string, password: string) => authenticate("/api/v1/auth/login", { email, password }),
    [authenticate],
  );

  const signUp = useCallback(
    (
      displayName: string,
      email: string,
      password: string,
      accountType: "client" | "vendor" = "client",
      vendor?: { companyName: string; message?: string },
    ) =>
      authenticate("/api/v1/auth/register", {
        displayName,
        email,
        password,
        accountType,
        ...(accountType === "vendor" ? { companyName: vendor?.companyName ?? "", message: vendor?.message ?? "" } : {}),
      }),
    [authenticate],
  );

  const signOut = useCallback(async () => {
    try {
      await fetch(`${API_URL}/api/v1/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch {
      // Even if the network call fails, drop local state.
    } finally {
      clearAuth();
    }
  }, [clearAuth]);

  const refresh = useCallback(async (): Promise<boolean> => {
    try {
      const response = await fetch(`${API_URL}/api/v1/auth/refresh`, {
        method: "POST",
        credentials: "include",
      });

      if (!response.ok) {
        clearAuth();
        return false;
      }

      const payload = (await response.json()) as { accessToken: string; user: AuthUser };
      applyAuth(payload);
      return true;
    } catch {
      clearAuth();
      return false;
    }
  }, [applyAuth, clearAuth]);

  // Authed fetch: attaches the access token, retries once after a refresh on 401.
  const authedFetch = useCallback(
    async <T,>(path: string, options: RequestInit = {}): Promise<T> => {
      const fetchWith = (token: string | null) =>
        fetch(`${API_URL}${path}`, {
          ...options,
          credentials: "include",
          headers: {
            ...(options.body ? { "Content-Type": "application/json" } : {}),
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...options.headers,
          },
        });

      let response = await fetchWith(tokenRef.current);

      if (response.status === 401 && (await refresh())) {
        response = await fetchWith(tokenRef.current);
      }

      if (!response.ok) {
        const text = await response.text();
        const payload = text ? tryParseJson(text) : null;
        const error = new Error(payload?.error ?? `Request failed (${response.status})`) as Error & {
          status?: number;
          errors?: Record<string, string[]>;
        };
        error.status = response.status;
        error.errors = payload?.errors;
        throw error;
      }

      if (response.status === 204) {
        return undefined as T;
      }

      return (await response.json()) as T;
    },
    [accessToken, refresh],
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      accessToken,
      status,
      isAdmin: user?.roles.includes("Admin") ?? false,
      signIn,
      signUp,
      signOut,
      authedFetch,
    }),
    [user, accessToken, status, signIn, signUp, signOut, authedFetch],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

function tryParseJson(text: string): { error?: string; errors?: Record<string, string[]> } | null {
  try {
    return JSON.parse(text) as { error?: string; errors?: Record<string, string[]> };
  } catch {
    return null;
  }
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside <AuthProvider>");
  }
  return context;
}
