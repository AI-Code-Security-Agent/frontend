"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { Mail, Lock } from "lucide-react";
import { CosmicLayout } from "@/app/cosmic-layout";
import { ProjectLogo } from "@/components/ui/ProjectLogo";
import { useAuth } from "@/components/auth/auth-provider";

const baseURL = process.env.NEXT_PUBLIC_BASE_URL;

function GoogleSignInButton() {
  return (
    <Button
      type="button"
      onClick={() => (window.location.href = `${baseURL}/auth/google`)}
      className="w-full flex items-center justify-center gap-3 bg-white border text-gray-700 font-medium rounded-lg shadow-sm hover:bg-gray-50 transition-all duration-200"
    >
      <svg
        className="w-5 h-5"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 48 48"
      >
        <path
          fill="#EA4335"
          d="M24 9.5c3.54 0 6.72 1.23 9.23 3.25l6.85-6.85C35.2 2.57 29.88 0 24 0 14.64 0 6.4 5.45 2.6 13.35l7.93 6.16C12.53 13.13 17.88 9.5 24 9.5z"
        />
        <path
          fill="#4285F4"
          d="M46.1 24.5c0-1.57-.14-3.08-.39-4.5H24v9h12.35c-.54 2.88-2.13 5.32-4.53 6.96l7.06 5.48C43.71 37.41 46.1 31.39 46.1 24.5z"
        />
        <path
          fill="#FBBC05"
          d="M10.53 28.49a14.47 14.47 0 0 1 0-8.98l-7.93-6.16a24 24 0 0 0 0 21.3l7.93-6.16z"
        />
        <path
          fill="#34A853"
          d="M24 48c6.48 0 11.92-2.14 15.9-5.81l-7.06-5.48c-2.05 1.39-4.68 2.29-8.84 2.29-6.12 0-11.47-3.63-13.47-8.85l-7.93 6.16C6.4 42.55 14.64 48 24 48z"
        />
      </svg>
      <span>Sign in with Google</span>
    </Button>
  );
}

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { signIn, isLoading } = useAuth();

  const handleUserLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    await signIn(email, password);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background/95">
      <CosmicLayout>
        <div className="mx-auto w-full sm:w-[400px] space-y-6">
          <div className="text-center space-y-2 mt-20">
            <ProjectLogo size="xl" clickable={true} className="mx-auto" />
            <h1 className="text-2xl font-semibold">
              Welcome back to CodeGuardian
            </h1>
            <p className="text-sm text-muted-foreground">
              Access your code security dashboard
            </p>
          </div>

          <Card className="border-2">
            <CardContent className="pt-6 space-y-4">
              <form onSubmit={handleUserLogin} className="space-y-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      className="pl-10"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="Password"
                      className="pl-10"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  size="lg"
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? "Signing in..." : "Sign in"}
                </Button>
              </form>

              <div className="flex items-center gap-2">
                <div className="flex-1 h-px bg-muted-foreground/20" />
                <span className="text-xs text-muted-foreground">OR</span>
                <div className="flex-1 h-px bg-muted-foreground/20" />
              </div>

              <GoogleSignInButton />
            </CardContent>

            <CardFooter className="flex flex-col space-y-4 border-t pt-6">
              <div className="flex justify-between w-full text-sm">
                <span>
                  New to CodeGuardian?{" "}
                  <Link
                    href="/signup"
                    className="font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 hover:underline"
                  >
                    Create account
                  </Link>
                </span>
                <Link
                  href="/forgot-password"
                  className="font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
            </CardFooter>
          </Card>
        </div>
      </CosmicLayout>
    </div>
  );
}
