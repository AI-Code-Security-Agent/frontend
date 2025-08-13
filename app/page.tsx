"use client";

import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { Shield, ArrowRight, Code, Lock, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { CosmicLayout } from "./cosmic-layout";
import { ChatSessionDemo } from "@/components/ChatSessionDemo";
import { useState } from "react";
import { ProjectLogo } from "@/components/ui/ProjectLogo";

export default function Home() {
  const [showChat, setShowChat] = useState(false);

  return (
    <div className="min-h-screen min-w-full bg-background relative overflow-hidden">
      <CosmicLayout>
        {/* Content overlay */}
        <div className="relative z-10">
          <header className="fixed top-4 left-4 right-4 z-50 mx-auto max-w-6xl">
            <div className="bg-white/10 dark:bg-black/20 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-2xl shadow-2xl shadow-black/10 dark:shadow-black/30">
              <div className="flex h-14 items-center justify-between px-6 sm:px-8 lg:px-10">
                {/* <Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
                  <Code className="h-6 w-6 text-primary" />
                  <span className="font-bold text-gray-900 dark:text-white">
                    CodeGuardian
                  </span>
                </Link> */}
                <Link
                  href="/"
                  className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
                >
                  <ProjectLogo size="md" clickable={false} />
                  <span className="font-bold text-gray-900 dark:text-white">
                    CodeGuardian
                  </span>
                </Link>
                <div className="flex items-center space-x-4">
                  <Link href="/login">
                    <Button
                      variant="ghost"
                      className="hover:bg-white/10 dark:hover:bg-white/5"
                    >
                      Login
                    </Button>
                  </Link>
                  <Link href="/signup">
                    <Button
                      variant="ghost"
                      className="bg-white/20 dark:bg-white/10 hover:bg-white/30 dark:hover:bg-white/20 border border-white/30 dark:border-white/20 backdrop-blur-sm"
                    >
                      Sign Up
                    </Button>
                  </Link>
                  <ThemeToggle />
                </div>
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
                Analyze your code for security vulnerabilities, get intelligent
                recommendations, and ensure your applications are protected
                against potential threats.
              </p>
            </div>

            <div className="flex gap-4">
              <Link href="/signup">
                <Button
                  size="lg"
                  className="h-12 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white border-0"
                >
                  Analyze Your Code
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>

              {/* Updated View Demo to navigate to /demo route */}
              <Link href="/demo">
                <Button
                  size="lg"
                  variant="outline"
                  className="h-12 bg-white/10 dark:bg-white/5 border-white/20 dark:border-white/10 hover:bg-white/20 dark:hover:bg-white/10 backdrop-blur-sm"
                >
                  <Shield className="mr-2 h-4 w-4" />
                  View Demo
                </Button>
              </Link>
            </div>

            {/* Chat section - hidden initially, visible after clicking demo */}
            {showChat && (
              <div className="w-full max-w-5xl mt-8 px-4 flex justify-center">
                <ChatSessionDemo onClose={() => setShowChat(false)} />
              </div>
            )}

            {/* 3-feature grid section moves below chat section */}
            <div className="mt-16 grid gap-8 px-4 md:grid-cols-3 max-w-5xl">
              <div className="relative overflow-hidden rounded-lg border border-white/10 dark:border-white/5 bg-white/5 dark:bg-black/20 backdrop-blur-xl p-2">
                <div className="flex h-[180px] flex-col justify-between rounded-md p-6">
                  <Code className="h-12 w-12 text-blue-500 dark:text-blue-400" />
                  <div className="space-y-2">
                    <h3 className="font-bold text-gray-900 dark:text-white">
                      Smart Code Analysis
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Advanced AI analysis to detect security vulnerabilities in
                      your code
                    </p>
                  </div>
                </div>
              </div>

              <div className="relative overflow-hidden rounded-lg border border-white/10 dark:border-white/5 bg-white/5 dark:bg-black/20 backdrop-blur-xl p-2">
                <div className="flex h-[180px] flex-col justify-between rounded-md p-6">
                  <AlertTriangle className="h-12 w-12 text-purple-500 dark:text-purple-400" />
                  <div className="space-y-2">
                    <h3 className="font-bold text-gray-900 dark:text-white">
                      Threat Detection
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Identify potential security risks and vulnerabilities in
                      real-time
                    </p>
                  </div>
                </div>
              </div>

              <div className="relative overflow-hidden rounded-lg border border-white/10 dark:border-white/5 bg-white/5 dark:bg-black/20 backdrop-blur-xl p-2">
                <div className="flex h-[180px] flex-col justify-between rounded-md p-6">
                  <Lock className="h-12 w-12 text-pink-500 dark:text-pink-400" />
                  <div className="space-y-2">
                    <h3 className="font-bold text-gray-900 dark:text-white">
                      Security Recommendations
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Get actionable fixes and best practices to secure your
                      code
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </CosmicLayout>
    </div>
  );
}
