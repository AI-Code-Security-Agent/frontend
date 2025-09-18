"use client";

const baseURL = process.env.NEXT_PUBLIC_BASE_URL;
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { Code, Mail, Lock, User, Github, Target } from "lucide-react";
import { UserTypes } from "@/types/types";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { CosmicLayout } from "@/app/cosmic-layout";
import { ProjectLogo } from "@/components/ui/ProjectLogo";

export default function SignUpPage() {

  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showUserForm, setShowUserForm] = useState(false);
  const [newUserDetails, setNewUserDetails] = useState<UserTypes>({
    fullname: "",
    email: "",
    gitAccessToken: "",
  });

  // Temporary function to demonstrate the flow
  // const handleGithubSignIn = () => {
  //   setIsLoading(true);
  //   // Simulate API call
  //   setTimeout(() => {
  //     setShowUserForm(true);
  //     setIsLoading(false);
  //   }, 1500);
  // };

  const hndleCreateUser = async(e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    if (
      !newUserDetails.fullname ||
      !newUserDetails.email
    ) {
      toast.warning("Please Fill all the fields.");
      setIsLoading(false);
      return;
    }
    const payload = {
      fullname: newUserDetails.fullname,
      email: newUserDetails.email,
      gitAccessToken: "not define",
    };

   try {
    const response = await fetch(`${baseURL}/users/createuser?role=user`,{
      method:"POST",
      headers : {
        "Content-Type" : "application/json"
      },
      body : JSON.stringify(payload)
    });

    const result = await response.json();
    if(result.isSuccess) {
      toast.success(result.message + " please check your email to get your password.");
      router.push("/login");
    }else {
      toast.error(result.message || "Failed to create User.")
    }
    
   } catch (err) {
    toast.error("An error occurred while creating the user.");
   }finally{
    setIsLoading(false)
   }
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-background/95 p-4">
      <CosmicLayout>
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[400px]">
        <div className="flex flex-col space-y-2 text-center">
          <div className="flex items-center justify-center mt-20">
            <ProjectLogo size="xl" clickable={true} className="mx-auto" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Join CodeGuardian
          </h1>
          <p className="text-sm text-muted-foreground">
            Start analyzing your code for security vulnerabilities
          </p>
        </div>

        <Card className="border-2">
          {/* {!showUserForm ? ( */}
            {/* <CardContent className="pt-6">
              <Button
                className="w-full font-medium flex items-center justify-center"
                size="lg"
                onClick={handleGithubSignIn}
                disabled={isLoading}
              >
                <Github className="mr-2 h-5 w-5" />
                {isLoading ? "Connecting..." : "Connect with GitHub"}
              </Button>
              <p className="text-sm text-muted-foreground text-center mt-4">
                We need access to your GitHub account to analyze your
                repositories
              </p>
            </CardContent> */}
          {/* ) : ( */}
            <form onSubmit={hndleCreateUser}>
              <CardContent className="grid gap-4 pt-6">
                {/* <div className="flex items-center justify-center text-sm text-green-600 mb-2">
                  <Github className="mr-2 h-5 w-5" />
                  GitHub Connected Successfully
                </div> */}
                <div className="grid gap-2">
                  <Label className="text-sm font-medium" htmlFor="FullName">
                    Enter Full name
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="FullName"
                      name="FullName"
                      type="text"
                      placeholder="Enter Your Full name"
                      className="pl-10"
                      value={newUserDetails.fullname}
                      onChange={(e) => setNewUserDetails({...newUserDetails,fullname:e.target.value})}
                    />
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label className="text-sm font-medium" htmlFor="email">
                    Enter E-mail
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      className="pl-10"
                      placeholder="Enater Your E-mail"
                      required
                      value={newUserDetails.email}
                      onChange={(e) => setNewUserDetails({...newUserDetails,email:e.target.value})}
                    />
                  </div>
                </div>
                <Button
                  className="w-full font-medium"
                  type="submit"
                  size="lg"
                  disabled={isLoading}
                >
                  {isLoading ? "Creating account..." : "Complete Registration"}
                </Button>
              </CardContent>
            </form>
          {/* )} */}
          <CardFooter className="flex flex-col space-y-4 border-t pt-6">
            <div className="text-sm text-muted-foreground text-center">
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 hover:underline"
              >
                Sign in
              </Link>
            </div>
          </CardFooter>
        </Card>

        <p className="px-8 text-center text-sm text-muted-foreground">
          By clicking continue, you agree to our{" "}
          <Link
            href="/terms"
            className="hover:text-primary underline underline-offset-4"
          >
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link
            href="/privacy"
            className="hover:text-primary underline underline-offset-4"
          >
            Privacy Policy
          </Link>
          .
        </p>
      </div>
      </CosmicLayout>
    </div>
  );
}
