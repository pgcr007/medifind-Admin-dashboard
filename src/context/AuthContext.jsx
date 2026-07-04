import { createContext, useContext, useState, useCallback } from "react";
import * as api from "../api/endpoints";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("medifind_admin_user");
    return stored ? JSON.parse(stored) : null;
  });

  const login = useCallback(async (email, password) => {
    const { token, user: loggedInUser } = await api.login(email, password);
    if (loggedInUser.role !== "admin") {
      throw new Error("NOT_ADMIN");
    }
    localStorage.setItem("medifind_admin_token", token);
    localStorage.setItem("medifind_admin_user", JSON.stringify(loggedInUser));
    setUser(loggedInUser);
    return loggedInUser;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("medifind_admin_token");
    localStorage.removeItem("medifind_admin_user");
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}