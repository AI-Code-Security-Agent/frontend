"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardFooter,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { Code, Mail, Lock, User, Github } from "lucide-react"

// This is just for demonstration
export default function SignUpPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [showUserForm, setShowUserForm] = useState(false)

  // Temporary function to demonstrate the flow
  const handleGithubSignIn = () => {
    setIsLoading(true)
    // Simulate API call
    setTimeout(() => {
      setShowUserForm(true)
      setIsLoading(false)
    }, 1500)
  }

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false)
      alert('Registration would be completed here!')
    }, 1500)
  }

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-background/95 p-4">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[400px]">
        <div className="flex flex-col space-y-2 text-center">
          <div className="flex items-center justify-center">
            <Code className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Join CodeGuardian
          </h1>
          <p className="text-sm text-muted-foreground">
            Start analyzing your code for security vulnerabilities
          </p>
        </div>

        <Card className="border-2">
          {!showUserForm ? (
            <CardContent className="pt-6">
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
                We need access to your GitHub account to analyze your repositories
              </p>
            </CardContent>
          ) : (
            <form onSubmit={onSubmit}>
              <CardContent className="grid gap-4 pt-6">
                <div className="flex items-center justify-center text-sm text-green-600 mb-2">
                  <Github className="mr-2 h-5 w-5" />
                  GitHub Connected Successfully
                </div>
                <div className="grid gap-2">
                  <Label className="text-sm font-medium" htmlFor="username">
                    Choose Username
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="username"
                      name="username"
                      type="text"
                      placeholder="preferred_username"
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label className="text-sm font-medium" htmlFor="password">
                    Create Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label className="text-sm font-medium" htmlFor="confirm-password">
                    Confirm Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="confirm-password"
                      name="confirm-password"
                      type="password"
                      className="pl-10"
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
                  {isLoading ? "Creating account..." : "Complete Registration"}
                </Button>
              </CardContent>
            </form>
          )}
          <CardFooter className="flex flex-col space-y-4 border-t pt-6">
            <div className="text-sm text-muted-foreground text-center">
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-medium text-primary hover:underline"
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
    </div>
  )
}