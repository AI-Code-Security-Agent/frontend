"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { CosmicLayout } from "./cosmic-layout";
import { useState } from "react";
import { ProjectLogo } from "@/components/common/ProjectLogo";
import { AnimatedBackground } from "@/components/common/animated-background";

import {
  Shield,
  ArrowRight,
  Code,
  Lock,
  AlertTriangle,
  Zap,
  GitBranch,
  Brain,
  CheckCircle2,
  Github,
  MessageSquare,
  Database,
  Cpu,
  Eye,
  Workflow,
} from "lucide-react";

export default function Home() {
  const [selectedMode, setSelectedMode] = useState<"chat" | "rag">("chat");

  return (
    <div className="min-h-screen min-w-full bg-background relative overflow-hidden">
      <CosmicLayout>
        <AnimatedBackground />
        <div className="min-h-screen  relative overflow-hidden">
          {/* Hero Section */}
          <section className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 py-20">
            <div className="max-w-4xl mx-auto text-center space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm">
                <Shield className="h-4 w-4 text-blue-400" />
                <span className="text-sm text-gray-300">
                  AI-Powered Code Security
                </span>
              </div>

              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight">
                <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-teal-400 bg-clip-text text-transparent">
                  Secure Your Code
                </span>
                <br />
                <span className="text-white">with AI Intelligence</span>
              </h1>

              <p className="text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
                Detect vulnerabilities in real-time, get intelligent security
                recommendations, and automatically scan your repositories with
                our advanced AI-powered platform.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <Link href="/signup" className="w-full sm:w-auto">
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white border-0 h-12 px-8"
                  >
                    Start Analyzing
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/demo" className="w-full sm:w-auto">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-white/20 hover:bg-white/10 h-12 px-8"
                  >
                    <Shield className="mr-2 h-4 w-4" />
                    View Demo
                  </Button>
                </Link>
              </div>

              <div className="grid grid-cols-3 gap-4 pt-8 text-sm">
                <div className="flex flex-col items-center gap-2">
                  <div className="text-2xl font-bold text-blue-400">
                    2 Modes
                  </div>
                  <div className="text-gray-400">Chat & RAG</div>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <div className="text-2xl font-bold text-cyan-400">
                    OWASP Top 10
                  </div>
                  <div className="text-gray-400">Compliant</div>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <div className="text-2xl font-bold text-teal-400">
                    Real-time
                  </div>
                  <div className="text-gray-400">Analysis</div>
                </div>
              </div>
            </div>
          </section>

          {/* Two Modes Section */}
          <section className="relative z-10 px-4 py-20 max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl sm:text-5xl font-bold mb-4">
                Two Powerful Modes
              </h2>
              <p className="text-gray-400 text-lg">
                Choose the approach that fits your workflow
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
              {/* Chat Mode */}
              <div
                onClick={() => setSelectedMode("chat")}
                className={`group cursor-pointer relative rounded-2xl border transition-all duration-300 p-8 ${
                  selectedMode === "chat"
                    ? "border-blue-500/50 bg-blue-500/10 shadow-lg shadow-blue-500/20"
                    : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10"
                }`}
              >
                <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-br from-blue-500/0 to-blue-500/0" />
                <div className="relative">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 rounded-lg bg-blue-500/20 border border-blue-500/30">
                      <MessageSquare className="h-6 w-6 text-blue-400" />
                    </div>
                    <h3 className="text-2xl font-bold">Chat Mode</h3>
                  </div>

                  <p className="text-gray-300 mb-8">
                    Upload your codebase directly and get instant security
                    analysis with AI-powered recommendations.
                  </p>

                  <div className="space-y-3 mb-8">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-blue-400 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-300">
                        Upload and analyze code snippets
                      </span>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-blue-400 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-300">
                        Interactive vulnerability detection
                      </span>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-blue-400 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-300">
                        Real-time secure code suggestions
                      </span>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-blue-400 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-300">
                        SAST tool integration (Bandit, Semgrep, ESLint)
                      </span>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-white/10">
                    <p className="text-sm text-gray-400 mb-4">
                      Integrated Tools:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <span className="px-3 py-1 rounded-full text-xs bg-blue-500/20 text-blue-300">
                        Bandit
                      </span>
                      <span className="px-3 py-1 rounded-full text-xs bg-blue-500/20 text-blue-300">
                        Semgrep
                      </span>
                      <span className="px-3 py-1 rounded-full text-xs bg-blue-500/20 text-blue-300">
                        ESLint
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* RAG Mode */}
              <div
                onClick={() => setSelectedMode("rag")}
                className={`group cursor-pointer relative rounded-2xl border transition-all duration-300 p-8 ${
                  selectedMode === "rag"
                    ? "border-cyan-500/50 bg-cyan-500/10 shadow-lg shadow-cyan-500/20"
                    : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10"
                }`}
              >
                <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-br from-cyan-500/0 to-cyan-500/0" />
                <div className="relative">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 rounded-lg bg-cyan-500/20 border border-cyan-500/30">
                      <Github className="h-6 w-6 text-cyan-400" />
                    </div>
                    <h3 className="text-2xl font-bold">RAG Mode</h3>
                  </div>

                  <p className="text-gray-300 mb-8">
                    Connect your GitHub repositories and get automatic security
                    scanning on every commit.
                  </p>

                  <div className="space-y-3 mb-8">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-cyan-400 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-300">
                        GitHub repository integration
                      </span>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-cyan-400 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-300">
                        Automatic commit scanning
                      </span>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-cyan-400 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-300">
                        DevSecOps pipeline integration
                      </span>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-cyan-400 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-300">
                        RAG-powered contextual analysis
                      </span>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-white/10">
                    <p className="text-sm text-gray-400 mb-4">Workflow:</p>
                    <div className="flex flex-wrap gap-2">
                      <span className="px-3 py-1 rounded-full text-xs bg-cyan-500/20 text-cyan-300">
                        Connect Repo
                      </span>
                      <span className="px-3 py-1 rounded-full text-xs bg-cyan-500/20 text-cyan-300">
                        Auto-Scan
                      </span>
                      <span className="px-3 py-1 rounded-full text-xs bg-cyan-500/20 text-cyan-300">
                        Get Suggestions
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Core Features Section */}
          <section className="relative z-10 px-4 py-20 max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl sm:text-5xl font-bold mb-4">
                Comprehensive Security Analysis
              </h2>
              <p className="text-gray-400 text-lg">
                Powered by advanced AI and industry-leading tools
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {/* Feature 1 */}
              <div className="group relative rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all duration-300 p-6 hover:border-white/20">
                <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-br from-blue-500/5 to-transparent" />
                <div className="relative">
                  <div className="p-3 rounded-lg bg-blue-500/20 border border-blue-500/30 w-fit mb-4">
                    <Code className="h-6 w-6 text-blue-400" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">
                    Code Security Checker
                  </h3>
                  <p className="text-gray-400">
                    Deep analysis of your code to identify security
                    vulnerabilities, code smells, and potential risks before
                    they reach production.
                  </p>
                </div>
              </div>

              {/* Feature 2 */}
              <div className="group relative rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all duration-300 p-6 hover:border-white/20">
                <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-br from-cyan-500/5 to-transparent" />
                <div className="relative">
                  <div className="p-3 rounded-lg bg-cyan-500/20 border border-cyan-500/30 w-fit mb-4">
                    <Zap className="h-6 w-6 text-cyan-400" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">
                    AI-Powered Generator
                  </h3>
                  <p className="text-gray-400">
                    Automatically generate secure code fixes and best practice
                    recommendations tailored to your specific vulnerabilities.
                  </p>
                </div>
              </div>

              {/* Feature 3 */}
              <div className="group relative rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all duration-300 p-6 hover:border-white/20">
                <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-br from-teal-500/5 to-transparent" />
                <div className="relative">
                  <div className="p-3 rounded-lg bg-teal-500/20 border border-teal-500/30 w-fit mb-4">
                    <Brain className="h-6 w-6 text-teal-400" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">
                    Intelligent Chatbot
                  </h3>
                  <p className="text-gray-400">
                    Get instant answers to security questions and explanations
                    about detected vulnerabilities through conversational AI.
                  </p>
                </div>
              </div>

              {/* Feature 4 */}
              <div className="group relative rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all duration-300 p-6 hover:border-white/20">
                <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-br from-blue-500/5 to-transparent" />
                <div className="relative">
                  <div className="p-3 rounded-lg bg-blue-500/20 border border-blue-500/30 w-fit mb-4">
                    <Cpu className="h-6 w-6 text-blue-400" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">SAST Integration</h3>
                  <p className="text-gray-400">
                    Leverage industry-standard tools like Bandit, Semgrep, and
                    ESLint for comprehensive static application security
                    testing.
                  </p>
                </div>
              </div>

              {/* Feature 5 */}
              <div className="group relative rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all duration-300 p-6 hover:border-white/20">
                <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-br from-cyan-500/5 to-transparent" />
                <div className="relative">
                  <div className="p-3 rounded-lg bg-cyan-500/20 border border-cyan-500/30 w-fit mb-4">
                    <Workflow className="h-6 w-6 text-cyan-400" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">
                    DevSecOps Integration
                  </h3>
                  <p className="text-gray-400">
                    Seamlessly integrate security scanning into your CI/CD
                    pipeline for automated vulnerability detection.
                  </p>
                </div>
              </div>

              {/* Feature 6 */}
              <div className="group relative rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all duration-300 p-6 hover:border-white/20">
                <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-br from-teal-500/5 to-transparent" />
                <div className="relative">
                  <div className="p-3 rounded-lg bg-teal-500/20 border border-teal-500/30 w-fit mb-4">
                    <Shield className="h-6 w-6 text-teal-400" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">
                    Compliance Standards
                  </h3>
                  <p className="text-gray-400">
                    Meet OWASP Top 10 and other industry security standards with
                    automated compliance checking.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Why Choose Section */}
          <section className="relative z-10 px-4 py-20 max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl sm:text-5xl font-bold mb-4">
                Why Choose Our Platform?
              </h2>
              <p className="text-gray-400 text-lg">
                Everything you need for enterprise-grade code security
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="p-2 rounded-lg bg-green-500/20 border border-green-500/30 h-fit">
                    <CheckCircle2 className="h-6 w-6 text-green-400" />
                  </div>
                  <div>
                    <h4 className="font-bold text-lg mb-1">
                      Real-Time Detection
                    </h4>
                    <p className="text-gray-400">
                      Identify vulnerabilities instantly as you code or commit
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="p-2 rounded-lg bg-green-500/20 border border-green-500/30 h-fit">
                    <CheckCircle2 className="h-6 w-6 text-green-400" />
                  </div>
                  <div>
                    <h4 className="font-bold text-lg mb-1">
                      Actionable Insights
                    </h4>
                    <p className="text-gray-400">
                      Get specific, implementable fixes for every vulnerability
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="p-2 rounded-lg bg-green-500/20 border border-green-500/30 h-fit">
                    <CheckCircle2 className="h-6 w-6 text-green-400" />
                  </div>
                  <div>
                    <h4 className="font-bold text-lg mb-1">
                      AI-Powered Recommendations
                    </h4>
                    <p className="text-gray-400">
                      Leverage machine learning for context-aware security
                      suggestions
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="p-2 rounded-lg bg-green-500/20 border border-green-500/30 h-fit">
                    <CheckCircle2 className="h-6 w-6 text-green-400" />
                  </div>
                  <div>
                    <h4 className="font-bold text-lg mb-1">
                      GitHub Integration
                    </h4>
                    <p className="text-gray-400">
                      Connect repos and automate security scanning on every push
                    </p>
                  </div>
                </div>
              </div>

              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-2xl blur-3xl" />
                <div className="relative bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-sm">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-4 rounded-lg bg-white/5 border border-white/10">
                      <Eye className="h-5 w-5 text-blue-400" />
                      <span className="text-sm">Full codebase visibility</span>
                    </div>
                    <div className="flex items-center gap-3 p-4 rounded-lg bg-white/5 border border-white/10">
                      <Lock className="h-5 w-5 text-cyan-400" />
                      <span className="text-sm">Enterprise security</span>
                    </div>
                    <div className="flex items-center gap-3 p-4 rounded-lg bg-white/5 border border-white/10">
                      <Zap className="h-5 w-5 text-teal-400" />
                      <span className="text-sm">Lightning fast analysis</span>
                    </div>
                    <div className="flex items-center gap-3 p-4 rounded-lg bg-white/5 border border-white/10">
                      <GitBranch className="h-5 w-5 text-green-400" />
                      <span className="text-sm">CI/CD ready</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Tech Stack Section */}
          <section className="relative z-10 px-4 py-20 max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl sm:text-5xl font-bold mb-4">
                Technology Stack
              </h2>
              <p className="text-gray-400 text-lg">
                Built with industry-leading tools and frameworks
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { name: "Bandit", category: "SAST" },
                { name: "Semgrep", category: "SAST" },
                { name: "ESLint", category: "Linting" },
                { name: "RAG Pipeline", category: "AI" },
                { name: "LLM Integration", category: "AI" },
                { name: "GitHub API", category: "Integration" },
                { name: "Vector DB", category: "Storage" },
                { name: "OWASP", category: "Standards" },
              ].map((tech, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition-all duration-300 text-center group"
                >
                  <p className="font-semibold mb-1">{tech.name}</p>
                  <p className="text-xs text-gray-500 group-hover:text-gray-400">
                    {tech.category}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* CTA Section */}
          <section className="relative z-10 px-4 py-20 max-w-4xl mx-auto">
            <div className="relative rounded-2xl border border-white/10 bg-gradient-to-br from-blue-500/10 via-cyan-500/10 to-teal-500/10 p-12 text-center">
              <div className="absolute inset-0 rounded-2xl opacity-0 hover:opacity-100 transition-opacity bg-gradient-to-br from-blue-500/5 to-transparent" />
              <div className="relative">
                <h2 className="text-4xl sm:text-5xl font-bold mb-6">
                  Ready to Secure Your Code?
                </h2>
                <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
                  Start analyzing your codebase today and detect vulnerabilities
                  before they become security breaches.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="/signup" className="w-full sm:w-auto">
                    <Button
                      size="lg"
                      className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white border-0 h-12 px-8"
                    >
                      Start Free Analysis
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>

                  <Link href="/demo" className="w-full sm:w-auto">
                    <Button
                      size="lg"
                      variant="outline"
                      className="border-white/20 hover:bg-white/10 h-12 px-8"
                    >
                      Schedule Demo
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </section>

          {/* Footer */}
          <footer className="relative z-10 border-t border-white/10 px-4 py-12 max-w-6xl mx-auto">
            <div className="grid md:grid-cols-4 gap-8 mb-8">
              <div>
                <h4 className="font-bold mb-4">Product</h4>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li>
                    <a href="#" className="hover:text-white transition">
                      Features
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-white transition">
                      Pricing
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-white transition">
                      Documentation
                    </a>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold mb-4">Company</h4>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li>
                    <a href="#" className="hover:text-white transition">
                      About
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-white transition">
                      Blog
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-white transition">
                      Careers
                    </a>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold mb-4">Security</h4>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li>
                    <a href="#" className="hover:text-white transition">
                      Privacy
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-white transition">
                      Terms
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-white transition">
                      Compliance
                    </a>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold mb-4">Connect</h4>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li>
                    <a href="#" className="hover:text-white transition">
                      GitHub
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-white transition">
                      Twitter
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-white transition">
                      LinkedIn
                    </a>
                  </li>
                </ul>
              </div>
            </div>

            <div className="border-t border-white/10 pt-8 text-center text-sm text-gray-500">
              <p>&copy; 2025 CodeShield. All rights reserved.</p>
            </div>
          </footer>
        </div>
      </CosmicLayout>
    </div>
  );
}
