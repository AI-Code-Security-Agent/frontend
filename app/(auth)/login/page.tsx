"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { Code, Mail, Lock } from "lucide-react";
import { useRouter } from "next/navigation";
import Cookies from 'js-cookie';
import { toast } from "sonner";
import { CosmicLayout } from "@/app/cosmic-layout";
const baseURL = process.env.NEXT_PUBLIC_BASE_URL;

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [username, setUserName] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const router = useRouter();

  const handleUserLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch(`${baseURL}/auth/login`, {
        method :'POST',
        headers : {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email: username,
          password : password
        })
      })

      const result = await response.json();
      if(result.isSuccess){
        Cookies.set("accessToken", result.accessToken , {expires:1})
        Cookies.set("userName", result.username , {expires:1})
        toast.success(result.message)
        router.push('/dashboard')
        setIsLoading(false)
      }else{
        setIsLoading(false);
        toast.error(result.message);
      }
      
    } catch (err) {
      console.log("Error during login:", err);
      toast.error("An error occurred. Please try again later.");
    }finally{
      setIsLoading(false)
    }

  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-background/95 p-4">
      <CosmicLayout>
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[400px]">
        <div className="flex flex-col space-y-2 text-center">
          <div className="flex items-center justify-center">
            <Code className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Welcome back to CodeGuardian
          </h1>
          <p className="text-sm text-muted-foreground">
            Access your code security dashboard
          </p>
        </div>

        <Card className="border-2">
          <form onSubmit={handleUserLogin}>
            <CardContent className="grid gap-4 pt-6">
              <div className="grid gap-2">
                <Label className="text-sm font-medium" htmlFor="email">
                  Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your Email"
                    className="pl-10"
                    value={username}
                    onChange={(e) => setUserName(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label className="text-sm font-medium" htmlFor="password">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    className="pl-10"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>
              <Button
                className="w-full font-medium"
                type="submit"
                size="lg"
                disabled={isLoading}
              >
                {isLoading ? "Signing in..." : "Sign in"}
              </Button>
            </CardContent>
          </form>
          <CardFooter className="flex flex-col space-y-4 border-t pt-6">
            <div className="flex w-full items-center justify-between">
              <div className="text-sm text-muted-foreground">
                New to CodeGuardian?{" "}
                <Link
                  href="/signup"
                  className="font-medium text-primary hover:underline"
                >
                  Create account
                </Link>
              </div>
              <Link
                href="/forgot-password"
                className="text-sm font-medium text-primary hover:underline"
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
