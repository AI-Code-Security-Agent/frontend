"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import Cookies from "js-cookie";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

interface User {
  _id: string;
  fullname: string;
  email: string;
  role: string;
  profilePicture?: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
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

  useEffect(() => {

    const token = Cookies.get("accessToken");
    const storedUser = localStorage.getItem("user");

    if (token) setIsAuthenticated(true);
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        setUser(null);
      }
    }

    const googleToken = searchParams.get("accessToken");

    const fetchGoogleUser = async () => {
      if (!googleToken) return;

      Cookies.set("accessToken", googleToken, { expires: 1 });

      try {
        const res = await fetch(`${baseURL}/auth/auth-user`, {
          headers: { Authorization: `Bearer ${googleToken}` },
        });
        const data = await res.json();

        if (data.isSuccess) {
          localStorage.setItem("user", JSON.stringify(data.content.user));
          setUser(data.content.user);
          setIsAuthenticated(true);
          toast.success("Signed in with Google");

          // ✅ Clean up URL (remove query params)
          const cleanUrl = window.location.origin + "/dashboard";
          window.history.replaceState({}, document.title, cleanUrl);

          router.push("/dashboard");
        } else {
          toast.error("Failed to get user data");
        }
      } catch (err) {
        console.error("Fetch Google user error:", err);
        toast.error("An error occurred during Google login");
      }
       console.log('google login process complete');
    };

    fetchGoogleUser();
   
    setIsLoading(false);
  }, []); // ✅ Run only once on mount

  //  Normal login
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

        //  Pick only safe fields
        const safeUser: User = {
          _id: result.user._id,
          fullname: result.user.fullname,
          email: result.user.email,
          role: result.user.role,
          profilePicture: result.user.profilePicture,
        };
        // console.log('safe user :',safeUser)
        //Save user object in cookie
        localStorage.setItem("user", JSON.stringify(safeUser));

        setIsAuthenticated(true);
        setUser(safeUser);

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

  // ✅ API logout
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
        Cookies.remove("sessionId");
        localStorage.removeItem("user");

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
    <AuthContext.Provider
      value={{ isAuthenticated, user, setUser, signIn, signOut, isLoading }}
    >
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
