"use client";
import React, { useState } from "react";
import { AddModal } from "../ui/add-modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SignUpSchema } from "../../../schema";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, AlertCircle, CheckCircle2 } from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Alert, AlertDescription } from "../ui/alert";
import { toast } from "sonner";

const UserAdd = () => {
  const [isShowPassword, setIsShowPassword] = useState(false);
  const [isShowConfirmPassword, setIsShowConfirmPassword] = useState(false);
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const form = useForm({
    resolver: zodResolver(SignUpSchema),
    defaultValues: {
      idNumber: "",
      fullName: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof SignUpSchema>) => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    if (data.password !== data.confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    const payload = {
      ...data,
      idNumber: Number(data.idNumber),
    };

    const response = await fetch("/api/create/user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const resData = await response.json();

    if (!response.ok) {
      if (response.status === 404) {
        setError(resData.message || "ID number not found in our records");
      } else if (response.status === 400) {
        setError(resData.message || "Name does not match our records");
      } else if (response.status === 409) {
        setError(resData.message || "Account already exists");
      } else {
        setError(resData.message || "Failed to create account");
      }
      setLoading(false);
      return;
    }

    setLoading(false);
    form.reset();
    toast.success("Account created successfully!");
  };

  return (
    <div>
      <AddModal
        title='Create Account'
        triggerText={<Button variant='secondary'>Add User</Button>}
      >
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
            {error && (
              <Alert variant='destructive'>
                <AlertCircle className='h-4 w-4' />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className='bg-green-50 text-green-900 border-green-200'>
                <CheckCircle2 className='h-4 w-4 text-green-600' />
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}

            <div className='w-full grid sm:grid-cols-2 gap-4'>
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
                        className='w-full'
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='fullName'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder='Juan Dela Cruz'
                        disabled={isLoading}
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
                        />
                        <button
                          type='button'
                          className='absolute inset-y-0 right-2 flex items-center text-gray-500 hover:text-gray-700'
                          onClick={() => setIsShowPassword(!isShowPassword)}
                          disabled={isLoading}
                        >
                          {!isShowPassword ? (
                            <EyeOff size={20} />
                          ) : (
                            <Eye size={20} />
                          )}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='confirmPassword'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm Password</FormLabel>
                    <FormControl>
                      <div className='relative'>
                        <Input
                          {...field}
                          type={isShowConfirmPassword ? "text" : "password"}
                          placeholder='********'
                          disabled={isLoading}
                        />
                        <button
                          type='button'
                          className='absolute inset-y-0 right-2 flex items-center text-gray-500 hover:text-gray-700'
                          onClick={() =>
                            setIsShowConfirmPassword(!isShowConfirmPassword)
                          }
                          disabled={isLoading}
                        >
                          {!isShowConfirmPassword ? (
                            <EyeOff size={20} />
                          ) : (
                            <Eye size={20} />
                          )}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className='text-sm text-muted-foreground bg-blue-50 p-3 rounded-lg'>
              <p className='font-medium text-blue-900 mb-1'>Note:</p>
              <p className='text-blue-800'>
                The ID number and name must match our student records.
              </p>
            </div>

            <Button type='submit' className='w-full' disabled={isLoading}>
              {isLoading ? "Creating Account..." : "Sign Up"}
            </Button>
          </form>
        </Form>
      </AddModal>
    </div>
  );
};

export { UserAdd };
