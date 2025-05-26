"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { Code, Mail, Lock } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
const baseURL = process.env.NEXT_PUBLIC_BASE_URL;

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState<string>("");
  const router = useRouter();

  const emailSubmit = async(e: React.FormEvent) =>{
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch(`${baseURL}/auth/forgotPassword`, {
        method : "POST",
        headers : {
          "Content-Type" : "application/json"
        },
        body:JSON.stringify({email})
      })

       const result = await response.json();
      if(result.isSuccess){
        toast.success(result.message);
      }else{
        toast.error(result.message);
      }
      
    } catch (err) {
       console.error("Error :", err);
      toast.error("An error occurred. Please try again later.");
    }finally{
      setIsLoading(false);
    }

  }

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-background/95 p-4">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[400px]">
        <div className="flex flex-col space-y-2 text-center">
          <div className="flex items-center justify-center">
            <Code className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">
            CodeGuardian
          </h1>
          <p className="text-sm text-muted-foreground">
            Enter your email to reset your password.
          </p>
        </div>

        <Card className="border-2">
          <form onSubmit={emailSubmit}>
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
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
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
          <CardFooter className="flex flex-col space-y-4 border-t pt-6">
            <div className="flex w-full items-center justify-end">
              
              <Link
                href="/login"
                className="text-sm font-medium text-primary hover:underline"
              >
                Login?
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
