"use client";

import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { Code, Mail, Lock } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { CosmicLayout } from "@/app/cosmic-layout";
const baseURL = process.env.NEXT_PUBLIC_BASE_URL;

export default function ForgotPasswordPage() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const email = searchParams.get("email");
  const [isLoading, setIsLoading] = useState(false);
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const router = useRouter();

  const hasVerified = useRef(false);

  const verificaionData = async () => {
    if (!id || !email) {
      toast.error("Invalid or missing ID or email.");
      return;
    }
    console.log('verification function run.')
    console.log('id :', id)
    console.log('email :', email)

    const response = await fetch(
      `${baseURL}/auth/verifyResetAccess?id=${id}&email=${email}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const data = await response.json();
    if (data.isSuccess) {
      toast.success(data.message);
    } else {
      toast.error(data.message);
      router.push("/forgot-password");
    }
  };

useEffect(() => {
  if (id && email && !hasVerified.current) {
    hasVerified.current = true;
    verificaionData();
  }
}, [id, email]);

  const resetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (!id || !email) {
      toast.error("Invalid or missing ID or email.");
      setIsLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      toast.warning("Password and Confirm Password should be same");
      setIsLoading(false);
      return;
    }

    const payload = {
        email: email,
        verificationID: id,
        password,
        confirmPassword,
      };

    try {
      const response = await fetch(`${baseURL}/auth/resetPassword`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (result.isSuccess) {
        toast.success(result.message);
        router.push("/login");
      } else {
        toast.error(result.message);
      }
    } catch (err) {
      console.error("Error :", err);
      toast.error("An error occurred. Please try again later.");
    } finally {
      setIsLoading(false);
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
            CodeGuardian
          </h1>
          <p className="text-sm text-muted-foreground">Please reset your password.</p>
        </div>

        <Card className="border-2">
          <form onSubmit={resetPassword}>
            <CardContent className="grid gap-4 pt-6">
              <div className="grid gap-2">
               
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

              <div className="grid gap-2">
                
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="ConfirmPassword"
                    type="password"
                    placeholder="Confirm Password"
                    className="pl-10"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
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
                {isLoading ? "Loading..." : "Confirm"}
              </Button>
            </CardContent>
          </form>
        </Card>
      </div>
      </CosmicLayout>
    </div>
  );
}
