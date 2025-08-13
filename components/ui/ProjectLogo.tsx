"use client";

import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface ProjectLogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  clickable?: boolean;
}

const sizeConfig = {
  sm: { width: 32, height: 32 },
  md: { width: 48, height: 48 },
  lg: { width: 96, height: 96 },
  xl: { width: 128, height: 128 },
};

export function ProjectLogo({
  size = "md",
  className = "",
  clickable = true,
}: ProjectLogoProps) {
  const config = sizeConfig[size];

  const logoContent = (
    <div
      className={cn(
        "flex items-center space-x-2",
        clickable && "cursor-pointer hover:opacity-80 transition-opacity",
        className
      )}
    >
      {/* Local Logo */}
      <div className="relative">
        <Image
          src="/logo.png"
          alt="CodeGuardian Logo"
          width={config.width}
          height={config.height}
          className="object-cover rounded-full" 
        />
      </div>
    </div>
  );

  if (clickable) {
    return (
      <Link href="/" className="inline-block">
        {logoContent}
      </Link>
    );
  }

  return logoContent;
}
