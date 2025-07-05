"use client";
import React, { useState } from "react";
import CardWrapper from "./CardWrapper";
import { SignUpSchema } from "../../../../schema";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff } from "lucide-react";
import { signIn } from "next-auth/react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { z } from "zod";
import { useRouter } from "next/navigation";

const SignUpForm = () => {
  const router = useRouter();

  const form = useForm({
    resolver: zodResolver(SignUpSchema),
    defaultValues: {
      email: "",
      name: "",
      password: "",
      confirmPassword: "",
    },
  });

  const [isShowPassword, setIsShowPassword] = useState(false);
  const [isShowConfirmPassword, setIsShowConfirmPassword] = useState(false);

  const onSubmit = async (data: z.infer<typeof SignUpSchema>) => {
    if (data.password !== data.confirmPassword) {
      console.error("Passwords do not match.");
      return;
    }

    const response = await fetch("/api/create/account", {
      method: "POST",
      body: JSON.stringify(data),
    });

    const resData = await response.json();
    if (!response.ok) {
      console.error("Error creating account:", resData.message);
      return;
    }

    const signInTheUser = await signIn("credentials", {
      redirect: false,
      email: data.email,
      password: data.password,
      callbackUrl: "/",
    });

    if (signInTheUser?.error) {
      console.error("Login error:", signInTheUser.error);
    } else {
      console.log("Login successful");
      router.push(signInTheUser?.url ?? "/");
    }
  };

  return (
    <CardWrapper
      label='Create an account'
      title='Welcome'
      backButtonHref='/signin'
      backButtonLabel='Already have an account? Sign in'
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
          <div className='space-y-4'>
            <FormField
              control={form.control}
              name='email'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type='email'
                      placeholder='jeboygwapo123@gmail.com'
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='name'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Your Name</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder='Jeboy' />
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
                      />
                      <button
                        className='absolute inset-y-0 right-2 flex items-center text-gray-500 hover:text-gray-700'
                        onClick={(e) => {
                          e.preventDefault();
                          setIsShowPassword(!isShowPassword);
                        }}
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
                      />
                      <button
                        className='absolute inset-y-0 right-2 flex items-center text-gray-500 hover:text-gray-700'
                        onClick={(e) => {
                          e.preventDefault();
                          setIsShowConfirmPassword(!isShowConfirmPassword);
                        }}
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

          <Button type='submit' className='w-full'>
            Sign Up
          </Button>
        </form>
      </Form>
    </CardWrapper>
  );
};

export { SignUpForm };
