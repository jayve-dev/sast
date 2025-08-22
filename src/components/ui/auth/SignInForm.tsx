"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { z } from "zod";
import { Eye, EyeOff } from "lucide-react";
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
import { useEffect } from "react";
import { SignInSchema } from "../../../../schema";

const SignInForm = () => {
  const router = useRouter();
  const [isShowPassword, setIsShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      setError("");
    }, 5000);
  }, [error]);

  const form = useForm({
    resolver: zodResolver(SignInSchema),
    defaultValues: {
      idNumber: "",
      password: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof SignInSchema>) => {
    console.log("data.idNumber", data.idNumber);
    setIsLoading(true);
    const result = await signIn("credentials", {
      redirect: false,
      idNumber: data.idNumber,
      password: data.password,
    });

    if (result?.error) {
      console.error("Login error:", result.error);
      console.log("Result", result);
      setError("Invalid Credentials");
    } else {
      console.log("Login successful");
      router.push("/dashboard");
      setIsLoading(false);
    }
  };

  return (
    <CardWrapper
      label='Sign In'
      title='Welcome Back!'
      backButtonHref='/signup'
      backButtonLabel="Don't have an account? Sign Up"
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
          <div className='space-y-4'>
            <FormField
              control={form.control}
              name='idNumber'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ID Number</FormLabel>
                  <FormControl>
                    <Input {...field} type='number' placeholder='1234567' />
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
                        type='button'
                        className='absolute inset-y-0 right-2 flex items-center text-gray-500 hover:text-gray-700'
                        onClick={() => setIsShowPassword(!isShowPassword)}
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

          <Button type='submit' className='w-full'>
            { isLoading ? "Loading..." : "Sign In"}
          </Button>
        </form>
      </Form>
    </CardWrapper>
  );
};

export { SignInForm };
