"use client";

import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { Shield, ArrowRight, Code, Lock, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { CosmicLayout } from "./cosmic-layout";
import { useState } from "react";
import { ProjectLogo } from "@/components/ui/ProjectLogo";
import { AnimatedBackground } from "@/components/animated-background";

export default function Home() {
  const [showChat, setShowChat] = useState(false);

  return (
    <div className="min-h-screen min-w-full bg-background relative overflow-hidden">
      <CosmicLayout>
        <AnimatedBackground />
        <div className="relative z-10">
          <main className="flex min-h-screen flex-col items-center justify-center gap-6 pb-8 pt-6 md:py-10">
            <div className="flex max-w-[980px] flex-col items-center gap-2 px-4 text-center">
              <h1 className="gradient-text text-3xl sm:text-5xl md:text-6xl font-semibold leading-tight">
                AI-Powered Code Security <br className="hidden sm:inline" />
                Analysis & Protection
              </h1>
              <p className="max-w-[700px] text-base sm:text-lg text-muted-foreground">
                Analyze your code for vulnerabilities and get intelligent
                recommendations.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto px-4 sm:px-0">
              <Link href="/signup" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  className="w-full sm:w-auto h-12 bg-gradient-to-r from-pink-500 to-purple-500 text-white"
                >
                  Analyze Your Code
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/demo" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto h-12 bg-white/10 dark:bg-white/5"
                >
                  <Shield className="mr-2 h-4 w-4" />
                  View Demo
                </Button>
              </Link>
            </div>
            {/* 3-feature grid section moves below chat section */}
            <div className="mt-16 grid gap-8 px-4 sm:grid-cols-2 lg:grid-cols-3 max-w-5xl w-full">
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
