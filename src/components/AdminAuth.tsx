"use client";

import { useState, useEffect, createContext, useContext, ReactNode } from "react";

interface AdminContextType {
  isAuthenticated: boolean;
  password: string;
  login: (password: string) => Promise<boolean>;
  logout: () => void;
}

const AdminContext = createContext<AdminContextType | null>(null);

export function useAdmin() {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error("useAdmin must be used within AdminProvider");
  }
  return context;
}

export function AdminProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = sessionStorage.getItem("adminPassword");
    if (stored) {
      verifyPassword(stored);
    } else {
      setLoading(false);
    }
  }, []);

  const verifyPassword = async (pwd: string) => {
    try {
      const res = await fetch("/api/admin/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: pwd }),
      });
      if (res.ok) {
        setIsAuthenticated(true);
        setPassword(pwd);
        sessionStorage.setItem("adminPassword", pwd);
      } else {
        sessionStorage.removeItem("adminPassword");
      }
    } catch (error) {
      console.error("Verification error:", error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (pwd: string): Promise<boolean> => {
    try {
      const res = await fetch("/api/admin/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: pwd }),
      });
      if (res.ok) {
        setIsAuthenticated(true);
        setPassword(pwd);
        sessionStorage.setItem("adminPassword", pwd);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Login error:", error);
      return false;
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    setPassword("");
    sessionStorage.removeItem("adminPassword");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-primary-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <AdminContext.Provider value={{ isAuthenticated, password, login, logout }}>
      {children}
    </AdminContext.Provider>
  );
}

export function AdminGuard({ children }: { children: ReactNode }) {
  const { isAuthenticated, login } = useAdmin();
  const [inputPassword, setInputPassword] = useState("");
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(false);

    const success = await login(inputPassword);
    if (!success) {
      setError(true);
    }
    setLoading(false);
  };

  if (isAuthenticated) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="card p-8 max-w-md w-full">
        <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          Admin Access
        </h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              Invalid password
            </div>
          )}
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              className="input-field"
              placeholder="Enter admin password"
              value={inputPassword}
              onChange={(e) => setInputPassword(e.target.value)}
              autoFocus
            />
          </div>
          <button
            type="submit"
            disabled={loading || !inputPassword}
            className="btn-primary w-full"
          >
            {loading ? "Verifying..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}
