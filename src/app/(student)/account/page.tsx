"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Loader2, Eye, EyeOff, User, Lock, Shield, X, Delete } from "lucide-react";
import Link from "next/link";

interface StudentInfo {
  fullName: string;
  idNumber: number;
  role: string;
  programName: string;
  programId: string | null;
}

export default function AccountPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [studentInfo, setStudentInfo] = useState<StudentInfo | null>(null);
  const [fetchingInfo, setFetchingInfo] = useState(true);

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/signin");
    }
  }, [status, router]);

  useEffect(() => {
    // Fetch student info
    const fetchStudentInfo = async () => {
      if (session?.user) {
        try {
          setFetchingInfo(true);
          const response = await fetch("/api/account/student-info");

          if (!response.ok) {
            throw new Error("Failed to fetch student information");
          }

          const data = await response.json();
          setStudentInfo(data);
        } catch (error) {
          console.error("Error fetching student info:", error);
          toast.error("Failed to load account information");
        } finally {
          setFetchingInfo(false);
        }
      }
    };

    if (session) {
      fetchStudentInfo();
    }
  }, [session]);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Validation
    if (
      !passwordData.currentPassword ||
      !passwordData.newPassword ||
      !passwordData.confirmPassword
    ) {
      toast.error("All fields are required");
      setIsLoading(false);
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("New passwords do not match");
      setIsLoading(false);
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error("Password must be at least 6 characters long");
      setIsLoading(false);
      return;
    }

    if (passwordData.currentPassword === passwordData.newPassword) {
      toast.error("New password must be different from current password");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/account/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to change password");
      }

      toast.success("Password changed successfully!");

      // Clear form
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      // Optionally redirect to home or show success message
      setTimeout(() => {
        router.push("/assessment");
      }, 2000);
    } catch (error) {
      console.error("Password change error:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to change password"
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (status === "loading" || fetchingInfo) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <Loader2 className='w-8 h-8 animate-spin text-primary' />
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className='container max-w-4xl mx-auto p-1 space-y-6'>
      <div className='flex flex-row justify-between items-center'>
        <div>
          <h1 className='text-3xl font-bold'>Account Settings</h1>
          <p className='text-muted-foreground mt-2'>
            Manage your account settings and preferences
          </p>
        </div>
        <Link href='/assessment'>
          <Button className='w-20'>
            <Delete />
          </Button>
        </Link>
      </div>

      <Separator />

      {/* Account Information */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <User className='w-5 h-5' />
            Account Information
          </CardTitle>
          <CardDescription>Your basic account details</CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div className='space-y-2'>
              <Label>Full Name</Label>
              <Input
                value={studentInfo?.fullName || session.user.fullName}
                disabled
              />
            </div>
            <div className='space-y-2'>
              <Label>ID Number</Label>
              <Input
                value={studentInfo?.idNumber || session.user.idNumber}
                disabled
              />
            </div>
            <div className='space-y-2'>
              <Label>Role</Label>
              <div className='flex items-center gap-2'>
                <Shield className='w-4 h-4 text-primary' />
                <Input
                  value={studentInfo?.role || session.user.role}
                  disabled
                  className='flex-1'
                />
              </div>
            </div>
            <div className='space-y-2'>
              <Label>Program</Label>
              <Input value={studentInfo?.programName || "N/A"} disabled />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Change Password */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Lock className='w-5 h-5' />
            Change Password
          </CardTitle>
          <CardDescription>
            Update your password to keep your account secure
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordChange} className='space-y-4'>
            <div className='space-y-2'>
              <Label htmlFor='currentPassword'>Current Password</Label>
              <div className='relative'>
                <Input
                  id='currentPassword'
                  type={showCurrentPassword ? "text" : "password"}
                  value={passwordData.currentPassword}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      currentPassword: e.target.value,
                    })
                  }
                  placeholder='Enter your current password'
                  disabled={isLoading}
                  className='pr-10'
                />
                <button
                  type='button'
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className='absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground'
                >
                  {showCurrentPassword ? (
                    <EyeOff className='w-4 h-4' />
                  ) : (
                    <Eye className='w-4 h-4' />
                  )}
                </button>
              </div>
            </div>

            <div className='space-y-2'>
              <Label htmlFor='newPassword'>New Password</Label>
              <div className='relative'>
                <Input
                  id='newPassword'
                  type={showNewPassword ? "text" : "password"}
                  value={passwordData.newPassword}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      newPassword: e.target.value,
                    })
                  }
                  placeholder='Enter your new password'
                  disabled={isLoading}
                  className='pr-10'
                />
                <button
                  type='button'
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className='absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground'
                >
                  {showNewPassword ? (
                    <EyeOff className='w-4 h-4' />
                  ) : (
                    <Eye className='w-4 h-4' />
                  )}
                </button>
              </div>
              <p className='text-xs text-muted-foreground'>
                Must be at least 6 characters long
              </p>
            </div>

            <div className='space-y-2'>
              <Label htmlFor='confirmPassword'>Confirm New Password</Label>
              <div className='relative'>
                <Input
                  id='confirmPassword'
                  type={showConfirmPassword ? "text" : "password"}
                  value={passwordData.confirmPassword}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      confirmPassword: e.target.value,
                    })
                  }
                  placeholder='Confirm your new password'
                  disabled={isLoading}
                  className='pr-10'
                />
                <button
                  type='button'
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className='absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground'
                >
                  {showConfirmPassword ? (
                    <EyeOff className='w-4 h-4' />
                  ) : (
                    <Eye className='w-4 h-4' />
                  )}
                </button>
              </div>
            </div>

            <div className='flex gap-3 pt-4'>
              <Button type='submit' disabled={isLoading} className='flex-1'>
                {isLoading ? (
                  <>
                    <Loader2 className='w-4 h-4 mr-2 animate-spin' />
                    Changing Password...
                  </>
                ) : (
                  "Change Password"
                )}
              </Button>
              <Button
                type='button'
                variant='outline'
                onClick={() =>
                  setPasswordData({
                    currentPassword: "",
                    newPassword: "",
                    confirmPassword: "",
                  })
                }
                disabled={isLoading}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
