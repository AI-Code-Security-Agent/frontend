"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ProfilePictureUpload } from "@/components/profile/ProfilePictureUpload";
import { PersonalInfoForm } from "@/components/profile/PersonalInfoForm";
import { SecurityForm } from "@/components/profile/SecurityForm";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import Cookies from "js-cookie";
import { mockRootProps } from "@/lib/mock-data/profilePageMockData";
import {
  UserProfile,
  PersonalInfoFormData,
  SecurityFormData,
} from "@/types/types";
import { apiService } from "@/lib/api";
import { AnimatedBackground } from "@/components/common/animated-background";
import ProtectedLayout from "@/components/auth/protected-layout";
import { useAuth } from "@/components/auth/auth-provider";

const baseURL = process.env.NEXT_PUBLIC_BASE_URL;

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [selectedProfileImage, setSelectedProfileImage] = useState<File | null>(
    null
  );
  const {
    isAuthenticated,
    isLoading: authLoading,
  } = useAuth();

  const fetchProfile = async () => {
    try {
      const result = await apiService.getProfileData();
      if (!result.isSuccess || !result.content) {
        throw new Error("Failed to fetch personal information");
      }
      setUser(result.content);
    } catch (error) {
      console.error("Error fetching personal information:", error);
      toast.error("Failed to fetch personal information");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      fetchProfile();
    }
  }, [isAuthenticated, authLoading]);

  const getProfileImage = () => {
    return user?.profilePicture || mockRootProps.user.profilePicture;
  };

  const getUserName = () => {
    return (
      user?.fullname ||
      `${mockRootProps.user.firstname} ${mockRootProps.user.lastname}`
    );
  };

  const handlePersonalInfoSubmit = async (data: PersonalInfoFormData) => {
    setIsUpdatingProfile(true);
    try {
      // API call to update profile
      const result = await apiService.updatePersonalData(data);
      if (!result.isSuccess) {
        throw new Error("Failed to update profile");
      }

      // console.log("Profile update response:", result);

      setUser((prev) => {
        if (prev) {
          const updatedUser = {
            ...prev,
            ...data,
          };
          localStorage.setItem("user", JSON.stringify(updatedUser));
          return updatedUser;
        }
        return null;
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      throw error;
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handlePasswordSubmit = async (data: SecurityFormData) => {
    setIsUpdatingPassword(true);
    try {
      // API call to change password
      const result = await apiService.updatePassword(data);
      if (!result.isSuccess) {
        throw new Error(result.message || "Failed to change password");
      }
      // console.log("Password change response:", result);
      toast.success(result.message || "Password changed successfully");
    } catch (error) {
      console.error("Error changing password:", error);
      throw error;
    } finally {
      setIsUpdatingPassword(false);
    }
  };

 
  const handleProfileImageChange = async (file: File | null) => {
    setSelectedProfileImage(file);

    if (file) {
      try {
        const reader = new FileReader();
        reader.onloadend = async () => {
          const base64String = reader.result as string;
          // console.log("Base64 String:", base64String);
          const token = Cookies.get("accessToken");

          const response = await fetch(
            `${baseURL}/profile/update_profile_picture`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({ profilePicture: base64String }),
            }
          );

          if (!response.ok) {
            throw new Error("Failed to upload profile picture");
          }

          const result = await response.json();
          setUser((prev) => {
            if (prev) {
              const updatedUser = {
                ...prev,
                profilePicture: result.content.profilePicture,
              };
              localStorage.setItem("user", JSON.stringify(updatedUser));
              return updatedUser;
            }
            return null;
          });
          toast.success("Profile picture updated successfully");
        };

        reader.readAsDataURL(file); // convert file → base64
      } catch (error) {
        console.error("Error uploading profile picture:", error);
        toast.error("Failed to upload profile picture");
      }
    }
  };

  if (isLoading) {
    return (
      <ProtectedLayout>
        <div className="flex items-center justify-center min-h-screen">
          <AnimatedBackground />
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Loading profile...</p>
          </div>
        </div>
      </ProtectedLayout>
    );
  }

  if (!user) {
    return (
      <ProtectedLayout>
        <div className="flex items-center justify-center min-h-screen">
          <AnimatedBackground />
          <div className="text-center">
            <p>User not found</p>
            <Button onClick={() => router.push("/dashboard")} className="mt-4">
              Back to Dashboard
            </Button>
          </div>
        </div>
      </ProtectedLayout>
    );
  }

  const fullName = `${user.fullname}`;

  return (
    <ProtectedLayout>
      <div className="min-h-screen bg-transparent ">
        <AnimatedBackground />
        <div className="max-w-4xl mx-auto p-6">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push("/dashboard")}
              className="h-10 w-10"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Profile Settings</h1>
              <p className="text-muted-foreground">
                Manage your account settings and preferences
              </p>
            </div>
          </div>

          <div className="space-y-8">
            {/* Profile Picture Section */}
            <div className="text-center">
              <h2 className="text-xl font-semibold mb-6">Profile Picture</h2>

              <ProfilePictureUpload
                currentImage={getProfileImage()}
                onImageChange={handleProfileImageChange}
                userName={getUserName()}
              />
            </div>

            <Separator />

            {/* Personal Information Form */}
            <PersonalInfoForm
              initialData={{
                fullname: user.fullname,
                email: user.email,
              }}
              onSubmit={handlePersonalInfoSubmit}
              isLoading={isUpdatingProfile}
            />

            <Separator />

            {/* Security Form */}
            <SecurityForm
              onSubmit={handlePasswordSubmit}
              isLoading={isUpdatingPassword}
            />
          </div>
        </div>
      </div>
    </ProtectedLayout>
  );
}
