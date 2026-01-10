"use client";
import { createContext, useContext, useState } from "react";

type Role = "hr" | "manager" | "employee" | null;

interface AuthContextType {
  role: Role;
  setRole: (role: Role) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // ✅ Initialize state from localStorage directly
  const [role, setRole] = useState<Role>(() => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("role") as Role;
  });

  return (
    <AuthContext.Provider value={{ role, setRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return ctx;
};
