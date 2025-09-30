"use client";

import { useAuth } from "@/components/auth/auth-provider";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isLoading, isAuthenticated, router]);

  // 🚨 Show a loader until we know auth state
  if (isLoading) {
    return (
       <div className="h-screen flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      <span className="ml-2 text-gray-600 dark:text-gray-300">
        Checking authentication...
      </span>
    </div>
    );
  }

  return <>{children}</>;
}
