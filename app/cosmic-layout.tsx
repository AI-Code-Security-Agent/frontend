import React from 'react';
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { Code } from "lucide-react";
import Link from "next/link";
import { CosmicBackground } from '../components/ui/cosmic-background';

interface CosmicLayoutProps {
  children: React.ReactNode;
  showHeader?: boolean;
  className?: string;
}

export const CosmicLayout: React.FC<CosmicLayoutProps> = ({ 
  children, 
  showHeader = true,
  className = "" 
}) => {
  return (
    <CosmicBackground className={className}>
      {showHeader && (
        <header className="fixed top-4 left-4 right-4 z-50 mx-auto max-w-6xl">
          <div className="bg-white/10 dark:bg-black/20 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-2xl shadow-2xl shadow-black/10 dark:shadow-black/30">
            <div className="flex h-14 items-center justify-between px-6 sm:px-8 lg:px-10">
              <div className="flex items-center space-x-2">
                <Code className="h-6 w-6 text-primary" />
                <span className="font-bold text-gray-900 dark:text-white">CodeGuardian</span>
              </div>
              <div className="flex items-center space-x-4">
                <Link href="/login">
                  <Button variant="ghost" className="hover:bg-white/10 dark:hover:bg-white/5">Login</Button>
                </Link>
                <Link href="/signup">
                  <Button variant="ghost" className="bg-white/20 dark:bg-white/10 hover:bg-white/30 dark:hover:bg-white/20 border border-white/30 dark:border-white/20 backdrop-blur-sm">Sign Up</Button>
                </Link>
                <ThemeToggle />
              </div>
            </div>
          </div>
        </header>
      )}
      
      <main className={`${showHeader ? 'pt-20' : ''}`}>
        {children}
      </main>
    </CosmicBackground>
  );
};