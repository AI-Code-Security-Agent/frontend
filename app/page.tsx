import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { Shield, ArrowRight, Code, Lock, AlertTriangle } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen min-w-full bg-background">
      <header className="fixed top-0 left-0 right-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 w-full">
        <div className="flex h-14 items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-2">
            <Code className="h-6 w-6 text-primary" />
            <span className="font-bold">CodeGuardian</span>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/login">
              <Button variant="ghost">Login</Button>
            </Link>
            <Link href="/signup">
              <Button>Sign Up</Button>
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="flex min-h-screen flex-col items-center justify-center gap-6 pb-8 pt-6 md:py-10">
        <div className="flex max-w-[980px] flex-col items-center gap-2 px-4">
          <h1 className="gradient-text text-center text-4xl font-semibold sm:text-5xl md:text-6xl">
            AI-Powered Code Security <br className="hidden sm:inline" />
            Analysis & Protection
          </h1>
          <p className="max-w-[700px] text-lg text-muted-foreground text-center">
            Analyze your code for security vulnerabilities, get intelligent recommendations,
            and ensure your applications are protected against potential threats.
          </p>
        </div>

        <div className="flex gap-4">
          <Link href="/signup">
            <Button size="lg" className="h-12">
              Analyze Your Code
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button size="lg" variant="outline" className="h-12">
              <Shield className="mr-2 h-4 w-4" />
              View Demo
            </Button>
          </Link>
        </div>

        <div className="mt-16 grid gap-8 px-4 md:grid-cols-3 max-w-5xl">
          <div className="relative overflow-hidden rounded-lg border bg-background p-2">
            <div className="flex h-[180px] flex-col justify-between rounded-md p-6">
              <Code className="h-12 w-12 text-primary" />
              <div className="space-y-2">
                <h3 className="font-bold">Smart Code Analysis</h3>
                <p className="text-sm text-muted-foreground">
                  Advanced AI analysis to detect security vulnerabilities in your code
                </p>
              </div>
            </div>
          </div>
          
          <div className="relative overflow-hidden rounded-lg border bg-background p-2">
            <div className="flex h-[180px] flex-col justify-between rounded-md p-6">
              <AlertTriangle className="h-12 w-12 text-primary" />
              <div className="space-y-2">
                <h3 className="font-bold">Threat Detection</h3>
                <p className="text-sm text-muted-foreground">
                  Identify potential security risks and vulnerabilities in real-time
                </p>
              </div>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-lg border bg-background p-2">
            <div className="flex h-[180px] flex-col justify-between rounded-md p-6">
              <Lock className="h-12 w-12 text-primary" />
              <div className="space-y-2">
                <h3 className="font-bold">Security Recommendations</h3>
                <p className="text-sm text-muted-foreground">
                  Get actionable fixes and best practices to secure your code
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}