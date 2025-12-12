"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { z } from "zod";
import { Eye, EyeOff, AlertCircle, Loader2 } from "lucide-react";
import CardWrapper from "./CardWrapper";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { SignInSchema } from "../../../../schema";
import { useSession } from "next-auth/react";

const SignInForm = () => {
  const router = useRouter();
  const [isShowPassword, setIsShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { data: session, status } = useSession();

  // Auto clear error after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // Redirect if already logged in
  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      if (session.user.role === "ADMIN") {
        router.push("/dashboard");
      } else {
        router.push("/assessment");
      }
    }
  }, [session, status, router]);

  const form = useForm({
    resolver: zodResolver(SignInSchema),
    defaultValues: {
      idNumber: "",
      password: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof SignInSchema>) => {
    setIsLoading(true);
    setError(null);

    try {
      console.log("Attempting login with ID:", data.idNumber);

      const result = await signIn("credentials", {
        redirect: false,
        idNumber: data.idNumber,
        password: data.password,
      });

      console.log("SignIn result:", result);

      if (result?.error) {
        // Handle different error types
        if (result.error === "CredentialsSignin") {
          setError("Invalid ID number or password. Please try again.");
        } else if (result.error === "User not found") {
          setError("No account found with this ID number.");
        } else if (result.error === "Invalid credentials") {
          setError("Incorrect password. Please try again.");
        } else {
          setError(result.error || "An error occurred during sign in.");
        }
        setIsLoading(false);
        return;
      }

      if (result?.ok) {
        console.log("Login successful, waiting for session...");

        // Wait a bit for session to update
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Force session refresh
        const updatedSession = await fetch("/api/auth/session").then((res) =>
          res.json()
        );

        console.log("Updated session:", updatedSession);

        // Redirect based on role
        if (updatedSession?.user?.role === "ADMIN") {
          console.log("Redirecting to admin dashboard");
          router.push("/dashboard");
        } else {
          console.log("Redirecting to assessment");
          router.push("/assessment");
        }
      }
    } catch (err) {
      console.error("Unexpected error during sign in:", err);
      setError("An unexpected error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  // Show loading state while checking session
  if (status === "loading") {
    return (
      <CardWrapper
        label='Sign In'
        title='Welcome Back!'
        backButtonHref='/signup'
        backButtonLabel="Don't have an account? Sign Up"
      >
        <div className='flex items-center justify-center py-8'>
          <Loader2 className='w-8 h-8 animate-spin text-primary' />
        </div>
      </CardWrapper>
    );
  }

  return (
    <CardWrapper
      label='Sign In'
      title='Welcome Back!'
      backButtonHref='/signup'
      backButtonLabel="Don't have an account? Sign Up"
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
          {/* Error Alert */}
          {error && (
            <Alert variant='destructive'>
              <AlertCircle className='h-4 w-4' />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className='space-y-4'>
            <FormField
              control={form.control}
              name='idNumber'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ID Number</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type='number'
                      placeholder='1234567'
                      disabled={isLoading}
                      className='text-base'
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='password'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <div className='relative'>
                      <Input
                        {...field}
                        type={isShowPassword ? "text" : "password"}
                        placeholder='********'
                        disabled={isLoading}
                        className='text-base pr-10'
                      />
                      <button
                        type='button'
                        className='absolute inset-y-0 right-2 flex items-center text-gray-500 hover:text-gray-700 disabled:opacity-50'
                        onClick={() => setIsShowPassword(!isShowPassword)}
                        disabled={isLoading}
                        tabIndex={-1}
                      >
                        {isShowPassword ? (
                          <Eye size={20} />
                        ) : (
                          <EyeOff size={20} />
                        )}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <Button type='submit' className='w-full' disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className='w-4 h-4 animate-spin mr-2' />
                Signing In...
              </>
            ) : (
              "Sign In"
            )}
          </Button>

          {/* Help Text */}
          <p className='text-sm text-muted-foreground text-center'>
            Having trouble signing in?{" "}
            <button
              type='button'
              className='text-primary hover:underline'
              onClick={() => router.push("/help")}
            >
              Get help
            </button>
          </p>
        </form>
      </Form>
    </CardWrapper>
  );
};

export { SignInForm };
