"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { User, Settings, LogOut } from "lucide-react";
import { toast } from "sonner";
import Cookies from "js-cookie";
import { mockRootProps } from "@/lib/mock-data/profilePageMockData";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { LogoutButton } from "./LogoutButton";

interface User {
  _id: string;
  fullname: string;
  email: string;
  role: string;
  profilePicture?: string;
}

interface UserMenuProps {
  onLogout: () => Promise<void>;
  user: User | null;
}

export function UserMenu({
  onLogout,
  user,
}: UserMenuProps) {
  const router = useRouter();
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const userName = user?.fullname || "User";
  const [userImage, setUserImage] = useState<string>(
    mockRootProps.user.profilePicture
  );
    const [userInitials, setUserInitials] = useState<string>("");

  const handleProfileClick = () => {
    router.push("/dashboard/profile");
  };

 useEffect(() => {
    const img = user?.profilePicture || mockRootProps.user.profilePicture;
    setUserImage(img);

    const initials = (user?.fullname || "User")
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
    setUserInitials(initials);
  }, [user]);

  const handleLogoutConfirm = async () => {
    setIsLoggingOut(true);
    try {
      await onLogout();
      setIsLogoutDialogOpen(false);
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="flex items-center justify-between">
      <div
        className="flex items-center cursor-pointer"
        onClick={() => router.push("/dashboard/profile")}
      >
         {/* ✅ Avatar replaces manual Image code */}
        <Avatar className="h-8 w-8">
          <AvatarImage src={userImage} alt={userName} />
          <AvatarFallback className="text-xs font-semibold">
            {userInitials}
          </AvatarFallback>
        </Avatar>
        <span className="ml-2 text-sm font-medium">
          {userName? userName : "User"}
        </span>
      </div>

      <Dialog open={isLogoutDialogOpen} onOpenChange={setIsLogoutDialogOpen}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 hover:bg-accent"
              title="Settings"
            >
              <Settings className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem
              onClick={handleProfileClick}
              className="cursor-pointer"
            >
              <User className="mr-2 h-4 w-4" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {/* <DialogTrigger asChild>
              <DropdownMenuItem className="cursor-pointer text-destructive focus:text-destructive">
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DialogTrigger>
         */}
          <LogoutButton onConfirm={onLogout} />
           </DropdownMenuContent> 
        </DropdownMenu>
{/* 
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Logout</DialogTitle>
            <DialogDescription>
              Are you sure you want to logout? You will need to sign in again to
              access your account.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setIsLogoutDialogOpen(false)}
              disabled={isLoggingOut}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleLogoutConfirm}
              disabled={isLoggingOut}
            >
              {isLoggingOut ? "Logging out..." : "Yes, Logout"}
            </Button>
          </DialogFooter>
        </DialogContent> */}

      </Dialog>
    </div>
  );
}
