import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import * as authApi from "../api/auth";

interface AuthContextValue {
  isAuthenticated: boolean;
  userId: string | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (
    email: string,
    username: string,
    firstName: string,
    lastName: string,
    password: string,
    confirmPassword: string
  ) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [userId, setUserId] = useState<string | null>(
    localStorage.getItem("trackflow_user_id")
  );

  const isAuthenticated = !!localStorage.getItem("trackflow_access");

  useEffect(() => {
    setUserId(localStorage.getItem("trackflow_user_id"));
  }, [isAuthenticated]);

  async function handleLogin(email: string, password: string) {
    const data = await authApi.login(email, password);
    localStorage.setItem("trackflow_access", data.access);
    localStorage.setItem("trackflow_refresh", data.refresh);
    localStorage.setItem("trackflow_user_id", data.id);
    setUserId(data.id);
  }

  async function handleSignup(
    email: string,
    username: string,
    firstName: string,
    lastName: string,
    password: string,
    confirmPassword: string
  ) {
    await authApi.signup(email, username, firstName, lastName, password, confirmPassword);
    await handleLogin(email, password);
  }

  async function handleLogout() {
    const refresh = localStorage.getItem("trackflow_refresh");
    try {
      if (refresh) await authApi.logout(refresh);
    } catch {
      // ignore — clearing session regardless
    } finally {
      localStorage.removeItem("trackflow_access");
      localStorage.removeItem("trackflow_refresh");
      localStorage.removeItem("trackflow_user_id");
      setUserId(null);
      window.location.href = "/login";
    }
  }

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        userId,
        login: handleLogin,
        signup: handleSignup,
        logout: handleLogout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}