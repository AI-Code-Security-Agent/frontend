"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import Cookies from "js-cookie";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

interface User {
  username: string;
  email?: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const baseURL = process.env.NEXT_PUBLIC_BASE_URL;

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const router = useRouter();
  const searchParams = useSearchParams();

  // ✅ Check cookies or Google callback on mount
  useEffect(() => {
    const token = Cookies.get("accessToken");
    const username = Cookies.get("userName");

    const googleToken = searchParams.get("accessToken") || searchParams.get("token");
    const googleUser = searchParams.get("username");

    if (googleToken) {
      Cookies.set("accessToken", googleToken, { expires: 1 });
      if (googleUser) Cookies.set("userName", googleUser, { expires: 1 });
      setIsAuthenticated(true);
      setUser({ username: googleUser || "Google User" });
      toast.success("Signed in with Google");
      router.push("/dashboard");
      return;
    }

    if (token && username) {
      setIsAuthenticated(true);
      setUser({ username });
    }

    setIsLoading(false);
  }, [searchParams, router]);

  // ✅ Normal login
  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${baseURL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const result = await response.json();
      if (result.isSuccess) {
        Cookies.set("accessToken", result.accessToken, { expires: 1 });
        Cookies.set("userName", result.username, { expires: 1 });
        setIsAuthenticated(true);
        setUser({ username: result.username });
        toast.success(result.message);
        router.push("/dashboard");
      } else {
        toast.error(result.message);
      }
    } catch (err) {
      console.error("Error during login:", err);
      toast.error("An error occurred. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ API logout (replaces old signOut)
  const signOut = async () => {
    const token = Cookies.get("accessToken");
    if (!token) {
      toast.error("No session found. Please log in.");
      router.push("/login");
      return;
    }

    try {
      const response = await fetch(`${baseURL}/auth/logout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
      });

      const data = await response.json();
      if (data.isSuccess) {
        Cookies.remove("accessToken");
        Cookies.remove("userName");
        Cookies.remove("sessionId");
        setIsAuthenticated(false);
        setUser(null);
        router.push("/");
        toast.success(data.message || "Logged out successfully");
      } else {
        toast.error(data.message || "Logout failed. Please try again.");
      }
    } catch (err) {
      console.error("Logout error:", err);
      toast.error("An error occurred while logging out.");
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, signIn, signOut, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
