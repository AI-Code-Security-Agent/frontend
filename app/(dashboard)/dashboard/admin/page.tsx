"use client";

const baseURL = process.env.NEXT_PUBLIC_BASE_URL;
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { adminMockData } from "@/lib/adminMockData";
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
import { AnimatedBackground } from "@/components/animated-background";

// ✅ Validation schema
const formSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  email: z.string().email("Invalid email address"),
});

export default function AdminDashboard() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    const token = Cookies.get("accessToken");
    if (!token) {
      router.push("/login");
    }
  }, [router]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  // ✅ Form setup
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      email: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    console.log("Creating admin:", values);
    setIsLoading(true);

    try {
      const payload = {
        fullname: values.fullName,
        email: values.email,
      };

      console.log("Payload:", payload);

      const response = await fetch(`${baseURL}/users/createuser?role=admin`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      console.log("Response:", result);

      if (result.isSuccess) {
        toast.success(
          "Admin created successfully..!"
        );
      } else {
        toast.error( "Failed to create admin.");
      }
    } catch (err) {
      toast.error("An error occurred while creating the admin.");
    } finally {
      setIsLoading(false);
      form.reset();
    }
  };

  return (
    <div className="p-6 space-y-6">
      <AnimatedBackground />

      {/* Header with Back + Create Admin */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/dashboard")}
            className="hover:bg-muted/50"
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <div className="h-6 w-px bg-border mx-2" />
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary/50 to-primary bg-clip-text text-transparent">
            System Analytics
          </h1>
        </div>

        <Dialog>
          <DialogTrigger asChild>
            <Button className="bg-blue-500 text-white flex items-center gap-2 hover:bg-blue-600">
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
          <p className="text-2xl font-bold mt-2">{adminMockData.totalUsers}</p>
          <p className="text-xs text-muted-foreground mt-1">
            {adminMockData.newUsersToday} new today
          </p>
        </Card>

        <Card className="p-4 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm shadow-lg">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="h-4 w-4 text-green-500" />
            <h3 className="text-sm font-medium">Total Admins</h3>
          </div>
          <p className="text-2xl font-bold mt-2">{adminMockData.totalAdmins}</p>
        </Card>

        <Card className="p-4 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm shadow-lg">
          <div className="flex items-center space-x-2">
            <Activity className="h-4 w-4 text-orange-500" />
            <h3 className="text-sm font-medium">Active Sessions</h3>
          </div>
          <p className="text-2xl font-bold mt-2">
            {adminMockData.sessionStats.active}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            of {adminMockData.sessionStats.total} total sessions
          </p>
        </Card>

        <Card className="p-4 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm shadow-lg">
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4 text-purple-500" />
            <h3 className="text-sm font-medium">Avg. Session Duration</h3>
          </div>
          <p className="text-2xl font-bold mt-2">
            {adminMockData.sessionStats.averageDuration}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Peak: {adminMockData.sessionStats.peakHours}
          </p>
        </Card>

        {/* Message Statistics */}
        <Card className="p-4 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm shadow-lg">
          <div className="flex items-center space-x-2">
            <MessageCircle className="h-4 w-4 text-blue-500" />
            <h3 className="text-sm font-medium">Total Messages</h3>
          </div>
          <p className="text-2xl font-bold mt-2">
            {adminMockData.messageStats.totalMessages}
          </p>
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>User: {adminMockData.messageStats.userMessages}</span>
            <span>
              Assistant: {adminMockData.messageStats.assistantMessages}
            </span>
          </div>
        </Card>

        <Card className="p-4 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm shadow-lg">
          <div className="flex items-center space-x-2">
            <ThumbsUp className="h-4 w-4 text-green-500" />
            <h3 className="text-sm font-medium">Message Likes</h3>
          </div>
          <p className="text-2xl font-bold mt-2">
            {adminMockData.messageStats.feedbackStats.likes}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {adminMockData.messageStats.feedbackStats.likePercentage}%
            satisfaction rate
          </p>
        </Card>

        <Card className="p-4 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm shadow-lg">
          <div className="flex items-center space-x-2">
            <ThumbsDown className="h-4 w-4 text-red-500" />
            <h3 className="text-sm font-medium">Message Unlikes</h3>
          </div>
          <p className="text-2xl font-bold mt-2">
            {adminMockData.messageStats.feedbackStats.unlikes}
          </p>
        </Card>
      </div>

      {/* Users Table */}
      <Card className="mt-6 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm shadow-lg">
        <ScrollArea className="h-[400px] w-full">
          <Table>
            <TableCaption>List of all users</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Last Active</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[...adminMockData.usersList, ...adminMockData.adminsList].map(
                (user) => (
                  <TableRow key={user.id}>
                    <TableCell>{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          user.role === "admin"
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                            : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                        }`}
                      >
                        {user.role}
                      </span>
                    </TableCell>
                    <TableCell>{formatDate(user.lastActive)}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm">
                        View Details
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              )}
            </TableBody>
          </Table>
        </ScrollArea>
      </Card>
    </div>
  );
}
