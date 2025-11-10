"use client";

const baseURL = process.env.NEXT_PUBLIC_BASE_URL;
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { Button } from "@/components/ui/button";
import {
  Users,
  ShieldCheck,
  Activity,
  Clock,
  MessageCircle,
  ThumbsUp,
  ThumbsDown,
  Plus,
  ChevronLeft,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AnimatedBackground } from "@/components/common/animated-background";
import { apiService } from "@/lib/api";
import { AdminDashboardContent, AdminUser } from "@/types/types";
import ProtectedLayout from "@/components/auth/protected-layout";

// ✅ Validation schema
const formSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  email: z.string().email("Invalid email address"),
});

export default function AdminDashboard() {
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [dashboardData, setDashboardData] =
    useState<AdminDashboardContent | null>(null);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const response = await apiService.getAdminDashboardData();
      console.log("Admin Dashboard Data response in page:", response);
      if (response.isSuccess && response.content) {
        setDashboardData(response.content);
      } else {
        toast.error("Failed to fetch dashboard data.");
      }
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      toast.error("Something went wrong while fetching data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const token = Cookies.get("accessToken");
    if (!token) {
      router.push("/login");
    } else {
      fetchDashboardData();
    }
  }, [router]);

  // ✅ Form setup
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      email: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsCreating(true);
    try {
      const payload = {
        fullname: values.fullName,
        email: values.email,
      };

      const response = await fetch(`${baseURL}/users/createuser?role=admin`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      if (result.isSuccess) {
        toast.success("Admin created successfully..!");
        fetchDashboardData(); // refresh data
      } else {
        toast.error("Failed to create admin.");
      }
    } catch (err) {
      toast.error("An error occurred while creating the admin.");
    } finally {
      setIsCreating(false);
      form.reset();
    }
  };

  // ✅ Loading state

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <AnimatedBackground />
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading System Data...</p>
        </div>
      </div>
    );
  }

  // ✅ No data
  if (!dashboardData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <AnimatedBackground />
        <div className="text-center">
          <p>No dashboard data available.</p>
          <Button onClick={() => router.push("/dashboard")} className="mt-4">
            Back to main Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const {
    totalUsers,
    totalAdmins,
    totalChats,
    totalSessions,
    totalLikes,
    totalDislikes,
    totalUserChats,
    totalAssistantChats,
    totalDemoSessions,
    adminData = [],
  } = dashboardData;

  const likePercentage =
    totalLikes + totalDislikes > 0
      ? ((totalLikes / (totalLikes + totalDislikes)) * 100).toFixed(1)
      : "0";

  return (
    <ProtectedLayout>
      <div className="p-6 space-y-6">
        <AnimatedBackground />

        {/* Header with Back + Create Admin */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          {/* Left section */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/dashboard")}
              className="hover:bg-muted/50"
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div className="hidden md:block h-6 w-px bg-border mx-2" />
            <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary/50 to-primary bg-clip-text text-transparent">
              System Analytics
            </h1>
          </div>

          <Dialog>
            <DialogTrigger asChild>
              <Button className="bg-blue-500 text-white flex items-center gap-2 hover:bg-blue-600 w-full md:w-auto">
                <Plus className="h-4 w-4" />
                Create Admin
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create a New Admin</DialogTitle>
                <DialogDescription>
                  Fill in the details below to create a new admin account.
                </DialogDescription>
              </DialogHeader>

              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-4"
                >
                  <FormField
                    control={form.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter full name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="Enter email address"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" className="w-full">
                    {isLoading ? "Creating..." : "Create Admin"}
                  </Button>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm shadow-lg">
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-blue-500" />
              <h3 className="text-sm font-medium">Total Users</h3>
            </div>
            <p className="text-2xl font-bold mt-2">{totalUsers}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {totalUsers} users registered.
            </p>
          </Card>

          <Card className="p-4 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm shadow-lg">
            <div className="flex items-center space-x-2">
              <ShieldCheck className="h-4 w-4 text-green-500" />
              <h3 className="text-sm font-medium">Total Admins</h3>
            </div>
            <p className="text-2xl font-bold mt-2">{totalAdmins}</p>
          </Card>

          <Card className="p-4 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm shadow-lg">
            <div className="flex items-center space-x-2">
              <Activity className="h-4 w-4 text-orange-500" />
              <h3 className="text-sm font-medium">Chat Sessions</h3>
            </div>
            <p className="text-2xl font-bold mt-2">{totalSessions}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {totalSessions} total chat sessions
            </p>
          </Card>

          <Card className="p-4 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm shadow-lg">
            <div className="flex items-center space-x-2">
              <Activity className="h-4 w-4 text-orange-500" />
              <h3 className="text-sm font-medium">Demo Chat Sessions</h3>
            </div>
            <p className="text-2xl font-bold mt-2">{totalDemoSessions}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {totalDemoSessions} total demo sessions
            </p>
          </Card>

          {/* Message Statistics */}
          <Card className="p-4 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm shadow-lg">
            <div className="flex items-center space-x-2">
              <MessageCircle className="h-4 w-4 text-blue-500" />
              <h3 className="text-sm font-medium">Total Messages</h3>
            </div>
            <p className="text-2xl font-bold mt-2">{totalChats}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {totalChats} total chats.
            </p>
          </Card>

          <Card className="p-4 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm shadow-lg">
            <div className="flex items-center space-x-2 mb-3">
              <MessageCircle className="h-4 w-4 text-purple-500" />
              <h3 className="text-sm font-medium">Message Breakdown</h3>
            </div>

            <div className="flex justify-between">
              <div className="flex-1">
                <p className="text-xl font-bold text-blue-600">
                  {totalUserChats}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  User Messages
                </p>
              </div>
              <div className="flex-1 text-right">
                <p className="text-xl font-bold text-purple-600">
                  {totalAssistantChats}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Assistant Messages
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm shadow-lg">
            <div className="flex items-center space-x-2">
              <ThumbsUp className="h-4 w-4 text-green-500" />
              <h3 className="text-sm font-medium">Message Likes</h3>
            </div>
            <p className="text-2xl font-bold mt-2">{totalLikes}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {likePercentage}% satisfaction rate
            </p>
          </Card>

          <Card className="p-4 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm shadow-lg">
            <div className="flex items-center space-x-2">
              <ThumbsDown className="h-4 w-4 text-red-500" />
              <h3 className="text-sm font-medium">Message Unlikes</h3>
            </div>
            <p className="text-2xl font-bold mt-2">{totalDislikes}</p>
          </Card>
        </div>

        {/* Users Table */}
        <Card className="mt-6 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm shadow-lg">
          <ScrollArea className="h-[400px] w-full">
            <Table>
              <TableCaption>List of all Admins</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {adminData && adminData.length > 0 ? (
                  adminData.map((admin: AdminUser) => (
                    <TableRow key={admin._id}>
                      <TableCell>{admin.fullname}</TableCell>
                      <TableCell>{admin.email}</TableCell>
                      <TableCell>
                        <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                          {admin.role}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center">
                      No admins found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </ScrollArea>
        </Card>
      </div>
    </ProtectedLayout>
  );
}
